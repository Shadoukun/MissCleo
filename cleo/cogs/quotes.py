import logging
import os
import discord
import urllib.parse
from cachetools import TTLCache
from discord.ext import commands
from sqlalchemy import and_, func
from pathlib import Path
import time

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

    @staticmethod
    def quote_or_user(arg):
        """
        Returns:
            True:  arg is an integer (a quote ID)
            False: arg is a string (a username)
        """
        try:
            _ = int(arg)
            return True
        except:
            return False

    @staticmethod
    def _create_embed(quote):
        """Parse quote and create discord.py embed."""

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
        """Add a quote to the database"""

        quote = Quote(**quote)
        self.db.add(quote)
        self.db.commit()
        self.db.refresh(quote)
        return quote

    async def _remove_quote(self, ctx, message):
        """Remove a quote from the database."""

        self.db.query(Quote).filter_by(guild_id=ctx.guild.id) \
                                .filter_by(message_id=message.id) \
                                .delete()
        self.db.commit()
        await ctx.channel.send(REMOVED_MSG)

    async def _get_quote(self, ctx, user_id=None, quote_id=None, limit=None):
        """
        Get quote from the current server.
        All keywords are optional.

        Keyword Arguments:
            user_id:  retrieves from a specific user
            quote_id: retrieves a specific quote
            limit:    limit query to limit-n of quotes.
        """

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
        """
        Get user who send quote from the database.
        Attempts to use findUser. Otherwise falls back
        to quering the guild_membership from the database.

        Returns user_id of user found or None.
        """

        # find user using findUser
        user = await findUser(ctx, username)
        if user:
            return user.id

        # fallback and try to find user in database.
        user = self.db.query(GuildMembership).filter(and_(
            GuildMembership.display_name == username,
            GuildMembership.guild_id == ctx.guild.id)).first()

        if user:
            return user.user_id
        else:
            return None


    @commands.guild_only()
    @commands.command(name='quote')
    async def quote(self, ctx, *args):
        """
        Send a message from the quote database.
        First argument can either be a user's id or a message id.

        Possible Arguments:
            user_id:  Retrieves a quote from a specific user
            quote_id: Retrieves a specific quote
        """

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
        """
        Add quote Command

        Takes an arbitrary number of message IDs
        and adds them as quotes in the database

        If multiple ids are provided, messages are merged.
        """

        # no message ids given
        if not args:
            return

        try:
            child_messages = []
            attachments = []
            # group all messages.
            for i, arg in enumerate(args):
                # first message is the main quote message.
                if i == 0:
                    root_message = await ctx.channel.fetch_message(int(arg))
                else:
                    m = await ctx.channel.fetch_message(int(arg))
                    child_messages.append(m)

            # if there is only one quote message
            if not child_messages:
                # If there are message attachments, save them
                # and add file path to list of attachments.
                if root_message.attachments:
                    for a in root_message.attachments:
                        filename = f"{str(time.time())}_{a.filename}"
                        fp = Path(f"./public/files/{filename}")
                        await a.save(fp)
                        attachments.append(filename)

            # multiple quote messages
            else:
                # no attachments in multi-quote messages. (for now)
                if root_message.attachments:
                    raise QuoteAttachmentError
                for m in child_messages:
                    # no attachments in multi-quote messages. (for now)
                    if m.attachments:
                        raise QuoteAttachmentError
                    # Check that all messages retrieved are from the same user.
                    if m.author.id != root_message.author.id:
                        raise QuoteAuthorError

            quote = dict(
                message_id=root_message.id,
                message="\n".join([root_message.content] + [m.content for m in child_messages]),
                timestamp=root_message.created_at,
                user_id=root_message.author.id,
                channel_id=root_message.channel.id,
                guild_id=root_message.guild.id,
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
        """Remove quote command"""

        message = await ctx.channel.fetch_message(message_id)
        if message:
            await self._remove_quote(ctx, message)
        else:
            await ctx.channel.send(NORESULTS_MSG)


    @commands.command(name="cleo")
    async def cleo(self, ctx, *args):
        """Command to post a link to a server's quote page"""

        await ctx.channel.send(config.HOST_URL + "quotes/" + str(ctx.guild.id))


def setup(bot):
    bot.add_cog(Quotes(bot))
