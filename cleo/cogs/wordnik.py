from discord.ext import commands
from wordnik import *
from wordnik import swagger
import discord

NORESULTS_MSG = "No results found."

class Wordnik:
    """Wordnik dictionary lookups"""


    def __init__(self, bot):
        self.bot = bot
        self.apiUrl = 'http://api.wordnik.com/v4'
        self.apiKey = self.bot.tokens['wordnik']
        self.client = swagger.ApiClient(self.apiKey, self.apiUrl)
        self.wordApi = WordApi.WordApi(self.client)

    @commands.command(name='dict', aliases=['d'])
    async def wordnik_search(self, ctx, *, query: str):
        """: !d <word>          | Lookup a word in the dictionary"""

        lookup = self.wordApi.getDefinitions(query)

        if lookup is None:
            await ctx.channel.send(NORESULTS_MSG)
            return

        else:
            # For now, only work with the first definition given. lookup[0]
            word = lookup[0].word
            pos = lookup[0].partOfSpeech
            definition = lookup[0].text
            examples = lookup[0].exampleUses

            embed = discord.Embed(name='\u2063', colour=0x006FFA)
            embed.set_author(name="Wordnik", icon_url="https://www.wordnik.com/favicon.ico")
            definitions = []
            for res in lookup[0:3]:
                entry = "_{0}_ \n {1} \n --".format(res.partOfSpeech, res.text)
                definitions.append(entry)

            embed.add_field(name=lookup[0].word, value='\n'.join(definitions), inline=False)

            await ctx.channel.send(embed=embed)


def setup(bot):
    bot.add_cog(Wordnik(bot))
