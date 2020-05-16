import logging
import os
import discord
import urllib.parse
from cachetools import TTLCache
from discord.ext import commands
from sqlalchemy import and_, func
from pathlib import Path

import config
from cleo.db import Quote, GuildMembership
from cleo.utils import admin_only, findUser

logger = logging.getLogger(__name__)

NORESULTS_MSG = "Message not found."
NOQUOTE_MSG = "No quotes found."
REMOVED_MSG = "Quote removed."
ADDED_MSG = "Quote added."
ALLSEEN_MSG = "All quotes have already been seen."


class QuoteAttachmentError(Exception):
    pass
class QuoteAuthorError(Exception):
    pass
class QuoteResultError(Exception):
    pass

class Quotes(commands.Cog):

    def __init__(self, bot):
        self.bot = bot
        self.db = self.bot.db
        # Used to prevent duplicate messages in quick succession.
        self.cache = TTLCache(ttl=300, maxsize=120)

    def _create_embed(self, quote):
        embed = discord.Embed().from_dict({
            "title": "\n",
            "description": quote.message,
            "color": quote.member.top_role.color,
            "author": {"name": quote.member.display_name,
                    "icon_url": str(quote.member.user.avatar_url)},
            "footer": {'text': quote.timestamp.strftime("%b %d %Y")}
        })

        if quote.attachments:
            embed.set_image(url=urllib.parse.urljoin(
                config.HOST + "files/", quote.attachments[0]))

        return embed

    async def _add_quote(self, ctx, quote:dict):
        quote = Quote(**quote)
        self.db.add(quote)
        self.db.commit()
        self.db.refresh(quote)
        return quote

    async def _remove_quote(self, ctx, message):
        '''Remove a quote from the database.'''

        self.db.query(Quote).filter_by(guild_id=ctx.guild.id) \
                                .filter_by(message_id=message.id) \
                                .delete()
        self.db.commit()
        await ctx.channel.send(REMOVED_MSG)

    async def _get_quote(self, ctx, user_id=None, quote_id=None, limit=None):
        '''Get quote by the user on the current server.
           If 'user' is provided, get quote by that user.
           Otherwise, get a random quote.

           if limit is given, return n number of quotes.
           '''

        filters = [Quote.guild_id == ctx.guild.id]
        if user_id:
            filters += [Quote.user_id == user_id]
        elif quote_id:
            filters += [Quote.message_id == quote_id]

        quote = self.db.query(Quote).filter(and_(*filters)) \
                                    .order_by(func.random())
        if limit:
            quote = quote.limit(limit).all()
        else:
            quote = quote.first()

        return quote

    async def _get_quote_user(self, ctx, username):

        user = await findUser(ctx, username)
        if user:
            return user.id

        # try to find user in database.
        # For users that are no longer in the server.
        user = self.db.query(GuildMembership).filter(and_(
            GuildMembership.display_name == username,
            GuildMembership.guild_id == ctx.guild.id)).first()

        if user:
            return user.user_id
        else:
            return None

    def quote_or_user(self, arg):
        '''Returns true if arg is an int (quote ID),
        else returns false (user)'''

        try:
            _ = int(arg)
            return True
        except:
            return False


    @commands.guild_only()
    @commands.command(name='quote')
    async def quote(self, ctx, *args):
        user = None
        quote = None

        if args:
            type_check = self.quote_or_user(args[0])
            if type_check:
                # arg is a quote_id
                quote = await self._get_quote(ctx, quote_id=args[0])
                if not quote:
                    await ctx.channel.send("Quote not found.")
                    return

                embed = self._create_embed(quote)
                await ctx.channel.send(embed=embed)
                return

            else:
                # arg is a username
                user = await self._get_quote_user(ctx, args[0])
                if not user:
                    await ctx.channel.send("User not found.")
                    return

        # limit retries from cached duplicates.
        quotes = await self._get_quote(ctx, user_id=user, limit=20)
        if not quotes:
            await ctx.channel.send(NORESULTS_MSG)
            return

        for quote in quotes:
            # check to see if quote was already sent recently
            cached_quote = self.cache.get(quote.message_id, None)
            if not cached_quote:
                self.cache[quote.message_id] = quote
                break
            else:
                quote = None

        if quote:
            embed = self._create_embed(quote)
            await ctx.channel.send(embed=embed)
        else:
            await ctx.channel.send(ALLSEEN_MSG)


    @commands.guild_only()
    @admin_only()
    @commands.command(name="add_quote")
    async def quote_add(self, ctx, *args):
        '''Takes an arbitrary number of message IDs
           and adds them as quotes in the database'''

        # no message ids given
        if not args:
            return

        try:
            messagelist = []
            # group all messages.
            for arg in args:
                m = await ctx.channel.fetch_message(int(arg))
                messagelist += [m]

            root_msg = messagelist[0]

            # if there are multiple messages being quoted
            if len(messagelist) > 1:
                if root_msg.attachments:
                    # no attachments
                    raise QuoteAttachmentError

                for m in messagelist[1:]:
                    if m.attachments:
                        # no attachments in multi-quote messages. (for now)
                        raise QuoteAttachmentError

                    # Check that all messages retrieved are from the same user.
                    if m.author.id != root_msg.author.id:
                        raise QuoteAuthorError

            attachments = []
            if root_msg.attachments:
                for a in root_msg.attachments:
                    fp = Path(f"./public/files/{a.filename}")
                    await a.save(fp)
                    attachments.append(a.filename)

            quote = dict(
                message_id=root_msg.id,
                message="\n".join([m.content for m in messagelist]),
                timestamp=root_msg.created_at,
                user_id=root_msg.author.id,
                channel_id=root_msg.channel.id,
                guild_id=root_msg.guild.id,
                attachments=[a for a in attachments]
                )

            quote = await self._add_quote(ctx, quote)
            embed = self._create_embed(quote)
            await ctx.channel.send(embed=embed)

        except QuoteResultError:
            await ctx.channel.send("Message not found.")
        except QuoteAuthorError:
            await ctx.channel.send("All messages must be from the same user.")
        except QuoteAttachmentError:
            await ctx.channel.send("Multi-message quotes can't have attachments.")


    @commands.guild_only()
    @admin_only()
    @commands.command(name="remove_quote")
    async def remove(self, ctx, *, message_id:int):
        message = await ctx.channel.fetch_message(message_id)
        if message:
            await self._remove_quote(ctx, message)
        else:
            await ctx.channel.send(NORESULTS_MSG)


def setup(bot):
    bot.add_cog(Quotes(bot))
