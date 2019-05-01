import logging
from collections import OrderedDict

import discord
from cachetools import TTLCache
from discord.ext import commands
from sqlalchemy import and_, func

from cleo.db import GuildMembership, Quote, User
from cleo.utils import admin_only, findUser
from datetime import datetime

logger = logging.getLogger(__name__)

NORESULTS_MSG = "Message not found."
NOQUOTE_MSG = "No quotes found."
REMOVED_MSG = "Quote removed."
ADDED_MSG = "Quote added."


def _create_embed(quote):
    embed = discord.Embed().from_dict({
        "title": "\n",
        "description": quote.message,
        "color": 0x006FFA,
        "author": {"name": quote.member.display_name,
                    "icon_url": str(quote.member.user.avatar_url)},
        "footer": {'text': quote.timestamp.strftime("%b %d %Y")}
    })
    return embed


class Quotes(commands.Cog):

    def __init__(self, bot):
        self.bot = bot
        self.db = self.bot.db
        # Used to prevent duplicate messages in quick succession.
        self.cache = TTLCache(ttl=300, maxsize=120)

    async def _add_quote(self, ctx, quote:OrderedDict):
        quote = Quote(**quote)
        self.db.add(quote)
        self.db.commit()
        return quote

    async def _remove_quote(self, ctx, message):
        '''Remove a quote from the database.'''

        quote = self.db.query(Quote).filter_by(guild_id=ctx.guild.id) \
                                    .filter_by(message_id=message.id).one_or_none()
        if quote:
            self.db.remove(quote)
            self.db.commit()
            await ctx.channel.send(REMOVED_MSG)
        else:
            await ctx.channel.send("Failed.")

    async def _get_quote(self, ctx, user=None):
        '''Get quote by the user on the current server.
           If 'user' is provided, get quote by that user.
           Otherwise, get a random quote.'''

        filters = [Quote.guild_id == ctx.guild.id]
        if user: filters += [Quote.user_id == user.id]
        quote = self.db.query(Quote).filter(and_(*filters)) \
                                    .order_by(func.random()).first()
        return quote

    @commands.guild_only()
    @commands.command(name='quote')
    async def quote(self, ctx, *, username:str=None):

        user = None
        if username:
            user = await findUser(ctx, username)
            if not user:
                await ctx.channel.send("User not found.")
                return

        for _ in range(20):
            quote = await self._get_quote(ctx, user)
            if not quote:
                await ctx.channel.send(NORESULTS_MSG)
                return

            # check cache to see if quote was recently
            cached_quote = self.cache.get(quote.message_id, None)
            if not cached_quote:
                self.cache[quote.message_id] = quote
                break
            else:
                all_seen = True
                quote = None

        if quote:
            embed = _create_embed(quote)
            await ctx.channel.send(embed=embed)
        elif all_seen:
            await ctx.channel.send("All quotes have already been seen.")
        else:
            await ctx.channel.send(NORESULTS_MSG)

    @commands.guild_only()
    @admin_only()
    @commands.command(name="add_quote")
    async def quote_add(self, ctx, *args):
        '''Takes an arbitrary number of message IDs
           and adds them as quotes in the database'''

        if not args:
            await ctx.channel.send("No message id given.")
            return

        messages = []
        try:
            for a in args:
                msg = await ctx.channel.fetch_message(int(a))
                messages += [msg]
            if not messages:
                raise Exception
        except:
            await ctx.channel.send(NORESULTS_MSG)
            return

        # Check that all messages retrieved are from the same user.
        root_msg = messages[0]
        if len(messages) > 1:
            for m in messages[1:]:
                if m.author.id != root_msg.author.id:
                    await ctx.channel.send("All messages must be from the same user.")
                    return

        quote = OrderedDict(
            message_id=root_msg.id,
            message="\n".join([m.content for m in messages]),
            timestamp=root_msg.created_at,
            user_id=root_msg.author.id,
            channel_id=root_msg.channel.id,
            guild_id=root_msg.guild.id,
        )

        quote = await self._add_quote(ctx, quote)
        embed = _create_embed(quote)
        await ctx.channel.send(embed=embed)

    @commands.guild_only()
    @admin_only()
    @commands.command(name="remove_quote")
    async def remove(self, ctx, *, message_id:int):
        message = ctx.channel.fetch_message(message_id)
        if message:
            await self._remove_quote(ctx, message)
        else:
            await ctx.channel.send(NORESULTS_MSG)


def setup(bot):
    bot.add_cog(Quotes(bot))
