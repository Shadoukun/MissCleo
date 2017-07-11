import discord
import random
import logging
from discord.ext import commands
from cleo.utils import findUser, is_admin
import cleo.db as db

NORESULTS_MSG = "Message not found."
NOQUOTE_MSG = "No quote found."
REMOVED_MSG = "Quote removed."
ADDED_MSG = "Quote added."

logger = logging.getLogger(__name__)

class Quotes:

    def __init__(self, bot):

        self.bot = bot
        self.db = self.bot.db

    async def _add_quote(self, ctx, message):
        '''Add a quote to the database.'''
        logger.debug("adding quote")

        quote = db.Quote(message)
        # Users no longer in the server won't be in the userlist.
        # Add message author if they are no longer in the server.
        if not self.db.query(db.User) \
                    .filter_by(id=message.author.id).count():

            logger.debug("User not found. adding to database")
            newuser = db.User(message.author)
            self.db.add(newuser)

        self.db.add(quote)
        self.db.commit()

        embed = self._create_embed(message.author, message.content)
        logger.debug(embed.to_dict())
        await ctx.channel.send(embed=embed)

    async def _remove_quote(self, ctx, message):
        '''Remove a quote from the database.'''
        logger.debug("removing quote")

        quotes = self.db.query(db.Quote) \
                    .filter_by(channel_id=ctx.channel.id) \
                    .filer_byt(message_id=message.id).all()

        logger.debug(quotes)

        if quotes:
            for quote in quotes:
                self.db.remove(quote)

            self.db.commit()
            await ctx.channel.send(REMOVED_MSG)

        else:
            await ctx.channel.send(NOQUOTE_MSG)

    async def _get_quote(self, user, channel):
        '''Get quote by the user from the current channel.'''
        logger.debug("getting quote")
        quotes = self.db.query(db.Quote) \
                    .filter_by(channel_id=channel.id) \
                    .filter_by(user_id=user.id).all()


        if quotes and user:
            random.shuffle(quotes)
            quote = quotes[0]
            logger.debug(quote)
            return quote

        else:
            logger.debug("no quotes found")
            return None

    async def _get_random_quote(self, channel):
        '''get random quote from the current channel.'''
        logger.debug("getting random quote")
        quotes = self.db.query(db.Quote) \
                    .filter_by(channel_id=channel.id).all()


        if quotes:
            random.shuffle(quotes)
            quote = quotes[0]
            logger.debug(quote)
            return quote


        else:
            logger.debug("no quotes found")
            return None

    def _create_embed(self, user, message):

        embed = discord.Embed(title=None, colour=0x006FFA)
        embed.set_author(name=user.display_name, icon_url=str(user.avatar_url))
        embed.add_field(name="\u200B", value=message)
        return embed


    @commands.guild_only()
    @commands.group(name='quote', invoke_without_command=True)
    async def quote(self, ctx, *args):
        if ctx.invoked_subcommand is None:
            # get a random quote.
            ctx.invoke(self.get_user_quote)

    @commands.guild_only()
    @is_admin()
    @quote.command(name="add")
    async def quote_add(self, ctx, *, message_id: int):

        message = await ctx.get_message(message_id)

        if message:
            await self._add_quote(ctx, message)

        else:
            await ctx.channel.send(NORESULTS_MSG)
            return

    @commands.guild_only()
    @is_admin()
    @quote.command(name="remove")
    async def remove(self, ctx, *, message_id: int):
        """remove a quote from quote database"""

        message = ctx.get_message(message_id)

        if message:
            await self._remove_quote(ctx, message)

        else:
            await ctx.channel.send(NORESULTS_MSG)

    @quote.command(name="get", pass_context=True)
    async def get_user_quote(self, ctx, *, username:str=None):

        if username:
            user = await findUser(ctx, username)
            # if user, filter list of quotes again by user.
            quote = await self._get_quote(user, ctx.channel)

            if quote:
                embed = self._create_embed(user, quote.message)
                await ctx.channel.send(embed=embed)

        else:
            quote = await self._get_random_quote(ctx.channel)
            user = await findUser(ctx, str(quote.user_id))

            if quote:
                embed = self._create_embed(user, quote.message)
                await ctx.channel.send(embed=embed)

        # if no quotes found
        ctx.channel.send(NOQUOTE_MSG)

def setup(bot):
    bot.add_cog(Quotes(bot))
