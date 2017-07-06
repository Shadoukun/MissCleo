import discord
from discord.ext import commands
import json
import asyncio

NORESULTS_MSG = "No results found."

class IMDB:

    def __init__(self, bot):
        self.bot = bot
        self.url = "http://www.omdbapi.com/?i=tt3896198&apikey={0}&t={1}"

    @commands.guild_only()
    @commands.command(name='imdb')
    async def imdb_search(self, ctx, *, title: str):
        """: !imdb <title>      | lookup a movie on IMDB. """
        print(title)
        async with self.bot.session.get(self.url.format(self.bot.tokens['omdb'], title)) as resp:
            data = await resp.text()
            movie = json.loads(data)

        if movie['Response'] == "True":
            embed = discord.Embed(title="\n", colour=0x006FFA)
            embed.set_thumbnail(url=movie['Poster'])
            embed.set_author(name="IMDB", icon_url="http://www.imdb.com/favicon.ico")
            embed.add_field(name="Title", value=movie['Title'], inline=False)
            embed.add_field(name="IMDB rating", value=movie['imdbRating'], inline=False)
            embed.add_field(name="Year", value=movie['Year'], inline=False)
            embed.add_field(name="Genre", value=movie['Genre'], inline=False)
            embed.add_field(name="Director", value=movie['Director'], inline=False)
            embed.add_field(name="Actors", value=movie['Actors'])
            embed.add_field(name="Plot", value=movie['Plot'])
            await ctx.channel.send(embed=embed)

        else:
            await ctx.channel.send(NORESULTS_MSG)

def setup(bot):
    bot.add_cog(IMDB(bot))
