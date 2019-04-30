import discord
import logging
from discord.ext import commands
from sqlalchemy import func, and_
from cleo.utils import findUser, admin_only
from cleo.db import GuildMembership, User, Quote
from collections import OrderedDict
from cachetools import TTLCache

NORESULTS_MSG = "Message not found."
NOQUOTE_MSG = "No quotes found."
REMOVED_MSG = "Quote removed."
ADDED_MSG = "Quote added."

logger = logging.getLogger(__name__)

class Quotes(commands.Cog):

    def __init__(self, bot):
        self.bot = bot
        self.db = self.bot.db

        # Used to prevent duplicate messages being sent in quick succession.
        self.cache = TTLCache(ttl=300, maxsize=120)



    # TODO: Multi-message quotes
    async def _add_quote(self, ctx, quote:OrderedDict):
        '''Add a quote to the database.'''

        logger.debug("adding quote")
        quote = Quote(**quote)
        self.db.add(quote)
        self.db.commit()

        embed = self._create_embed(quote)
        await ctx.channel.send(embed=embed)

    async def _remove_quote(self, ctx, message):
        '''Remove a quote from the database.'''
        logger.debug("removing quote")

        quote = self.db.query(Quote) \
                .filter_by(channel_id=ctx.channel.id) \
                .filter_by(message_id=message.id).first()

        if quote:
            self.db.remove(quote)
            self.db.commit()
            await ctx.channel.send(REMOVED_MSG)
        else:
            await ctx.channel.send("Failed.")

    async def _get_quote(self, ctx, user=None):
        '''Get quote by the user from the current server.
           If 'user' is provided, gets quote by that user.
           Otherwise, gets a random quote from any user.'''

        filters = [Quote.guild_id == ctx.guild.id]
        if user:
            filters.append(Quote.user_id == user.id)

        logger.debug("getting quote")
        all_seen = False

        for i in range(20):
            print(self.cache)
            quote = self.db.query(Quote).filter(and_(*filters)) \
                                        .order_by(func.random()).first()
            # should always return a quote
            if quote:
                cached_quote = self.cache.get(quote.message_id, None)
            else:
                break

            # not in cache
            if not cached_quote:
                self.cache[quote.message_id] = quote
                break
            else:
                all_seen = True
                quote = None

        if quote:
            return quote
        elif all_seen:
            await ctx.channel.send("All quotes have already been seen.")


    def _create_embed(self, quote):
        embed = discord.Embed().from_dict({
            "title": "\n",
            "color": 0x006FFA,
            "author": {"name": quote.member.display_name, "icon_url": str(quote.member.user.avatar_url)},
            "fields": [{"name": "\u200b", "value": quote.message}]
        })
        return embed

    @commands.guild_only()
    @commands.command(name='quote', invoke_without_command=True)
    async def quote(self, ctx, *, username:str=None):

        user = None

        if username:
            user = await findUser(ctx, username)
            if not user:
                await ctx.channel.send("User not found.")
                return

        quote = await self._get_quote(ctx, user)
        if quote:
            embed = self._create_embed(quote)
            await ctx.channel.send(embed=embed)
        else:
            await ctx.channel.send(NOQUOTE_MSG)

    @commands.guild_only()
    @admin_only()
    @commands.command(name="add_quote")
    async def quote_add(self, ctx, *args):
        '''Takes arbitrary number of message IDs and adds them as quotes in the database'''

        if not args:
            await ctx.channel.send("No message id given.")
            return
        logger.debug(args)
        messages = []

        for a in args:
            logger.debug(a)
            try:
                a = int(a)
                logger.debug("int")
                msg = await ctx.channel.fetch_message(a)
                logger.debug(msg)
            except:
                await ctx.channel.send(NORESULTS_MSG)
                return

            if msg:
                messages.append(msg)
            else:
                await ctx.channel.send(NORESULTS_MSG)
                return

        root_msg = messages[0]
        logger.debug(root_msg.created_at)
        # all messages must have the same author.
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

        await self._add_quote(ctx, quote)

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
