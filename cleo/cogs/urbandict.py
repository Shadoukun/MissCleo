from discord.ext import commands
import json
import discord

NORESULTS_MSG = "No results found."

class UrbanDictionary:
    """Urbandictionary definition lookups"""

    def __init__(self, bot):
        self.bot = bot
        self.url = 'http://api.urbandictionary.com/v0/define?term={0}'

    @commands.group(name='ud')
    async def urbandict_search(self, ctx, *, query: str):
        """: !ud <word>         | lookup a word on UrbanDictionary."""

        # Returns first entry for requested word.

        async with self.bot.session.get(self.url.format(query)) as resp:
            data = await resp.text()
        
        try:
            data = json.loads(data)
            data = data['list'][0]
        except:
            await ctx.channel.send(NORESULTS_MSG)
            return

        example = "_{0}_".format(data['example'])

        embed = discord.Embed(title="\n", url=data['permalink'], colour=0xE86222)
        embed.set_author(name="urbandictionary", icon_url="https://www.urbandictionary.com/favicon.ico")
        embed.add_field(name=data['word'], value="{0}\n\n{1}".format(data['definition'], example), inline=False)

        await ctx.channel.send(embed=embed)


def setup(bot):
    bot.add_cog(UrbanDictionary(bot))
