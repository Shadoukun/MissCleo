import wikipedia
from discord import Embed
from discord.ext import commands

NORESULTS_MSG = "No results found."

wiki_help = "LONG HELP"

class Wikipedia(commands.Cog):
    """Wikipedia lookups"""

    def __init__(self, bot):
        self.bot = bot

    def disambigEmbed(self, data):
        embed = Embed().from_dict({
            "title": "\n",
            "color": 0xE86222,
            "author": {"name": "Wikipedia", "icon_url": "https://www.wikipedia.org/static/apple-touch/wikipedia.png"},
            "fields": [
                {"name": "Did you mean?",
                    "value": "\n".join(data), "inline": "false"}
            ]
        })

        return embed

    @commands.group(name="wiki", help=wiki_help)
    async def wiki_search(self, ctx, *, query: str):
        """!wiki <word>       | Lookup something up on Wikipedia."""

        try:
            page = wikipedia.page(query)
            if page:
                summary = (page.summary[:1021] + '...') if len(page.summary) > 1024 else page.summary

                embed = Embed().from_dict({
                    "title": "\u200b\n" + query.capitalize(),
                    "color": 0xF0F0F0,
                    "author": {"name": "Wikipedia", "url": page.url, "icon_url": "https://www.wikipedia.org/static/apple-touch/wikipedia.png"},
                    "fields": [
                        {"name": "Summary", "value": summary}
                    ]
                })
                await ctx.channel.send(embed=embed)

        except wikipedia.exceptions.DisambiguationError as e:
            embed = self.disambigEmbed(e.options[0:10])
            msg = await ctx.channel.send(embed=embed)


def setup(bot):
    bot.add_cog(Wikipedia(bot))
