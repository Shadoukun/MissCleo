import asyncio
import logging
from discord import Embed
from discord.ext import commands
from wordnik import swagger, WordApi

logger = logging.getLogger(__name__)

NORESULTS_MSG = "No results found."

class Wordnik(commands.Cog):
    """Wordnik dictionary lookups"""

    def __init__(self, bot):
        self.bot = bot
        self.apiUrl = 'http://api.wordnik.com/v4'
        self.apiKey = self.bot.tokens['wordnik']
        self.client = swagger.ApiClient(self.apiKey, self.apiUrl)
        self.wordApi = WordApi.WordApi(self.client)

    def _chunk(self, l, n):
        for i in range(0, len(l), n):
            yield l[i:i + n]

    def checkreaction(self, reaction, user):
         return reaction.emoji.startswith(('⏪', '⏩', '✅'))

    def createEmbed(self, lookup, defspage):

        embed = Embed().from_dict({
            "title": "\u200b",
            "color": 0x006FFA,
            "author": {"name": "Wordnik", "icon_url": "https://www.wordnik.com/favicon.ico"},
            "fields": [
                {"name": "Word", "value": str(
                    lookup[0].word) + "\n\u200b\n"},
                {"name": "Definition", "value": "\n -- \n".join(defspage)}
            ]
        })

        return embed

    @commands.command(name='dict', aliases=['d'])
    async def wordnik_search(self, ctx, *, query: str):
        """!d <word>          | Lookup a word in the dictionary"""

        orig_user = ctx.message.author

        lookup = self.wordApi.getDefinitions(query)

        if lookup is None:
            await ctx.channel.send(NORESULTS_MSG)
            return

        else:
            # paginate definitions
            defs = []
            for l in lookup:
                entry = f'**{l.partOfSpeech}** \n {l.text}' + ("\n" + l.exampleUses[0] if l.exampleUses else "")
                defs.append(entry)
            defs = [defs[i:i + 4] for i in range(0, len(defs), 4)]

            p = 1
            maxpage = len(defs)
            firstrun = True

            # check function for wait_for
            # _check = lambda reaction, user: reaction.emoji.startswith(('⏪', '⏩'))

            while True:
                if firstrun:
                    firstrun = False
                    embed = self.createEmbed(lookup, defs[p - 1])
                    msg = await ctx.channel.send(embed=embed)
                    # pagination disabled for the moment. immature people abusing it.
                    break

                # if maxpage == 1 and p == 1:
                #     break
                # elif p == 1:
                #     toReact = ['⏩']
                # elif p == maxpage:
                #     toReact = ['⏪']
                # elif p > 1 and p < maxpage:
                #     toReact = ['⏪', '⏩']

                # for r in toReact:
                #     await msg.add_reaction(r)

                # await asyncio.sleep(0.5)

                # try:
               	#     reaction, user = await self.bot.wait_for("reaction_add", timeout=30, check=_check)
                # except:
                #     break

                # if user == orig_user:
                #     if '⏪' in str(reaction.emoji):
                #         p = p - 1
                #         await msg.clear_reactions()
                #         embed = self.createEmbed(lookup, defs[p - 1])
                #         await msg.edit(embed=embed)

                #     elif '⏩' in str(reaction.emoji):
                #         p = p + 1
                #         await msg.clear_reactions()
                #         embed = self.createEmbed(lookup, defs[p - 1])
                #         await msg.edit(embed=embed)
                # else:
                #     reaction.remove(user)

def setup(bot):
    bot.add_cog(Wordnik(bot))
