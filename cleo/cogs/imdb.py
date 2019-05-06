import json
import logging
from discord import Embed
from discord.ext import commands

NORESULTS_MSG = "No results found."

logger = logging.getLogger(__name__)

class IMDB(commands.Cog):

    def __init__(self, bot):
        self.bot = bot
        self.url = f"http://www.omdbapi.com/?i=tt3896198&apikey={self.bot.tokens['omdb']}&t="

    @commands.guild_only()
    @commands.command(name='imdb')
    async def imdb_search(self, ctx, *, title:str):
        """!imdb <title>      | lookup a movie on IMDB. """

        if not title:
            return

        async with self.bot.session.get(self.url + title) as resp:
            data = await resp.text()
            movie = json.loads(data)

        if movie['Response'] == "True":
            embed = Embed().from_dict({
                "title": "\n",
                "color": 0x006FFA,
                "thumbnail": {"url": movie['Poster']},
                "author": {"name": "IMDB", "icon_url": "https://m.media-amazon.com/images/G/01/IMDb/BG_rectangle._CB1509060989_SY230_SX307_AL_.png"},
                "fields": [
                    {"name": "Title", "value": movie['Title'] + "\n\u200b", "inline": "false"},
                    {"name": "IMDB Rating", "value": movie['imdbRating'], "inline": "true"},
                    {"name": "Year", "value": movie['Year'], "inline": "true"},
                    {"name": "Genre", "value": movie['Genre'], "inline": "true"},
                    {"name": "Rated", "value": movie['Rated'], "inline": "true"},
                    {"name": "\u200b\n" + "Actors", "value": "\n".join(movie['Actors'].split(','))   , "inline": "true"},
                    {"name": "\u200b\n" + "Director", "value": "\n".join(movie['Director'].split(',')), "inline": "true"},
                    {"name": "\u200b\n" + "Plot", "value": movie['Plot'], "inline": "false"}
                ]
            })

            await ctx.channel.send(embed=embed)

        else:
            await ctx.channel.send(NORESULTS_MSG)

def setup(bot):
    bot.add_cog(IMDB(bot))
