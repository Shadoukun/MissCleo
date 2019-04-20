import discord
import random
import logging
from discord.ext import commands
from cleo.utils import findUser, admin_only
from sqlalchemy.sql.expression import func
import cleo.db as db
import dateutil.parser
from datetime import datetime, timedelta

NORESULTS_MSG = "Message not found."
NOQUOTE_MSG = "No quotes found."
REMOVED_MSG = "Quote removed."
ADDED_MSG = "Quote added."

logger = logging.getLogger(__name__)

class Quotes(commands.Cog):

    def __init__(self, bot):
        self.bot = bot
        self.db = self.bot.db

    # TODO: Multi-message quotes
    async def _add_quote(self, ctx, message):
        '''Add a quote to the database.'''

        logger.debug("adding quote")
        quote = db.Quote(message)

        user = self.db.query(db.User).filter_by(id=message.author.id).one()
        # In case user isn't in the server anymore, and for whatever reason isn't in the database.
        if not user:
            logger.debug("User not found. adding to database")
            newuser = db.User(message.author)
            self.db.add(newuser)

        self.db.add(quote)
        self.db.commit()

        embed = self._create_embed(message.author, message.content)
        await ctx.channel.send(embed=embed)

    async def _remove_quote(self, ctx, message):
        '''Remove a quote from the database.'''
        logger.debug("removing quote")

        quote = self.db.query(db.Quote) \
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

        if user:
            logger.debug("getting quote")
            quote = self.db.query(db.Quote) \
                    .filter_by(guild_id=ctx.guild.id) \
                    .filter_by(user_id=user.id) \
                    .order_by(func.random()).first()
        else:
            logger.debug("getting random quote")
            quote = self.db.query(db.Quote) \
                    .filter_by(guild_id=ctx.guild.id) \
                    .order_by(func.random()).first()

        if quote:
            return quote
        else:
            await ctx.channel.send("Failed.")

    def _create_embed(self, user, message):
        embed = discord.Embed().from_dict({
            "title": "\n",
            "color": 0x006FFA,
            "author": {"name": user.display_name, "icon_url": str(user.avatar_url)},
            "fields": [{"name": "\u200b", "value": message}]
        })
        return embed


    @commands.guild_only()
    @commands.command(name='quote', invoke_without_command=True)
    async def quote(self, ctx, *, username:str=None):

        if username:
            user = await findUser(ctx, username)
            if not user:
                await ctx.channel.send("User not found.")
                return
        else:
            user = None

        quote = await self._get_quote(ctx, user)

        if quote:
            user = user if user else self.db.query(db.User).filter_by(id=quote.user_id).one()
            embed = self._create_embed(user, quote.message)
            await ctx.channel.send(embed=embed)
        else:
            await ctx.channel.send(NOQUOTE_MSG)

    @commands.guild_only()
    @admin_only()
    @commands.command(name="add_quote")
    async def quote_add(self, ctx, message_id:int=None, date:str=None):
        print(message_id)
        print(date)
        if not message_id:
            await ctx.channel.send("No message id given.")
            return

        before = None
        after = None
        if date:
            try:
                date = dateutil.parser.parse(date)
                before = date - timedelta(days=1)
                after = date + timedelta(days=1)
                print(before)
                print(after)
            except:
                await ctx.channel.send("Invalid date.")
                return

        message = await ctx.channel.fetch_message(message_id)
        if message:
            await self._add_quote(ctx, message)
        else:
            await ctx.channel.send(NORESULTS_MSG)

    @commands.guild_only()
    @admin_only()
    @commands.command(name="remove_quote")
    async def remove(self, ctx, *, message_id:int):
        message = ctx.get_message(message_id)
        if message:
            await self._remove_quote(ctx, message)
        else:
            await ctx.channel.send(NORESULTS_MSG)


def setup(bot):
    bot.add_cog(Quotes(bot))
