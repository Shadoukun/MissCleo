import discord
import random
from discord.ext import commands
from cleo.utils import findUser, is_admin
import cleo.db as db

NORESULTS_MSG = "Message not found."
NOQUOTE_MSG = "Quote not found."
REMOVED_MSG = "Quote removed."
ADDED_MSG = "Quote added."

class Quotes:

    def __init__(self, bot):

        self.bot = bot

    def _add_quote(self, message):

        quote = db.Quote(message)

        # Users no longer in the server won't be in the userlist.
        # Add message author if they are no longer in the server.
        if not self.bot.db.query(db.User) \
                .filter_by(id=message.author.id).count():

            newuser = db.User(message.author)
            self.bot.db.add(newuser)

        self.bot.db.add(quote)
        self.bot.db.commit()

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
        '''Add a quote to quote database'''

        try:
            quote_message = await ctx.channel.get_message(message_id)

        except discord.NotFound:
            await ctx.channel.send(NORESULTS_MSG)
            return

        self._add_quote(quote_message)
        await ctx.channel.send(ADDED_MSG)

        embed = self._create_embed(quote_message.author, quote_message.content)
        await ctx.channel.send(embed=embed)

    @commands.guild_only()
    @is_admin()
    @quote.command(name="remove")
    async def remove(self, ctx, *, message_id: int):
        """remove a quote from quote database"""

        quotes = self.bot.db.query(db.Quote) \
                        .filter(db.Quote.channel_id == ctx.channel.id)

        if not quotes.count():
            await ctx.channel.send(NOQUOTE_MSG)

        for quote in quotes:
            if message_id == quote.message_id:
                self.bot.db.delete(quote)
                self.bot.db.commit()
                await ctx.channel.send(REMOVED_MSG)


    @quote.command(name="get", pass_context=True)
    async def get_user_quote(self, ctx, *, username:str=None):

        user = None

        # get list of quotes from current channel.
        quotes = self.bot.db.query(db.Quote). \
            filter(db.Quote.channel_id == ctx.channel.id)

        if username:
            user = await findUser(ctx, username)

        if user:
            # if user, filter list of quotes again by user.
            quotes = quotes.filter(db.Quote.userid == user.id).all()
            random.shuffle(quotes)
            message = quotes[0].message

            embed = self._create_embed(user, message)
            await ctx.channel.send(embed=embed)

        else:
            # if user not found or not provided get a random channel quote.
            quotes = quotes.all()
            random.shuffle(quotes)
            user = await self.bot.get_user_info(quotes[0].user_id)
            message = quotes[0].message

            embed = self._create_embed(user, message)
            await ctx.channel.send(embed=embed)


def setup(bot):
    bot.add_cog(Quotes(bot))
