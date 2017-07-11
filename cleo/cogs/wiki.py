import discord
import wikipedia
from discord.ext import commands

NORESULTS_MSG = "No results found."

class Wikipedia:
    """Wikipedia lookups"""

    def __init__(self, bot):
        self.bot = bot

    @commands.group(name="wiki")
    async def wiki_search(self, ctx, *, query: str):
        """: !wiki <word>       | Lookup something up on Wikipedia."""


        try:
            article = wikipedia.page(query, auto_suggest=False)

            embed = discord.Embed(title="\u2063", colour=0xF9F9F9)
            embed.set_author(name="Wikipedia", icon_url="https://www.wikipedia.org/static/favicon/wikipedia.ico")
            embed.add_field(name=article.title, value=article.summary.split('\n', 1)[0], inline=True)

            await ctx.channel.send(embed=embed)

        except wikipedia.DisambiguationError as e:
            title = "'{t}' may refer to:\n".format(t=e.title)
            text = '\n'.join(e.options[:10])

            embed = discord.Embed(title="\u2063", colour=0xF9F9F9)
            embed.set_author(name="Wikipedia", icon_url="https://www.wikipedia.org/static/favicon/wikipedia.ico")
            embed.add_field(name=title, value=text, inline=True)

            await ctx.channel.send(embed=embed)

        except wikipedia.PageError:
            await ctx.channel.send(NORESULTS_MSG)



def setup(bot):
    bot.add_cog(Wikipedia(bot))
