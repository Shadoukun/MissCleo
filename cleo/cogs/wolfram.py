import discord
import wolframalpha
from discord.ext import commands

class WolframAlpha:
    """WolframAlpha lookups"""

    def __init__(self, bot):
        self.bot = bot
        self.client = wolframalpha.Client(bot.tokens['wolfram'])

    @commands.command(name='wolfram', aliases=['?'])
    async def wolfram_search(self, ctx, *, query : str):
        """: !? <expression>    | Use WolframAlpha"""

        if query:
            async with ctx.typing():
                res = self.client.query(query, stream=True)

                embed = discord.Embed(title="\n", colour=0xFF6600)
                embed.set_author(name="WolframAlpha", icon_url="https://www.wolframalpha.com/favicon.ico")
                podlist = [x for x in res.pods]

                for pod in podlist[0:3]:
                    embed.add_field(name=pod.title, value="`" + pod.text + "`", inline=False)

                await ctx.channel.send(embed=embed)


def setup(bot):
    bot.add_cog(WolframAlpha(bot))
