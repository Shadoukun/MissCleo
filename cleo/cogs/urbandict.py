import json
import asyncio
from discord import Embed
from discord.ext import commands


NORESULTS_MSG = "No results found."


class UrbanDictionary(commands.Cog):
    """Urbandictionary definition lookups"""

    def __init__(self, bot):
        self.bot = bot
        self.url = 'http://api.urbandictionary.com/v0/define?term={0}'


    def createEmbed(self, page):
        embed = Embed().from_dict({
            "title": "\n",
            "color": 0xE86222,
            "permalink": page['permalink'],
            "author": {"name": "urbandictionary", "icon_url": "https://vignette.wikia.nocookie.net/logopedia/images/0/0b/UDFavicon.png/revision/latest?cb=20170422211131"},
            "fields": [
                {"name": page['word'], "value": page['entry'], "inline": "false"}
            ]
        })

        return embed


    @commands.group(name='ud')
    async def urbandict_search(self, ctx, *, query: str):
        """!ud <word>         | lookup a word on UrbanDictionary."""

        # Returns first entry for requested word.

        async with self.bot.session.get(self.url.format(query)) as resp:
            data = await resp.text()

        try:
            data = json.loads(data)['list']
        except:
            await ctx.channel.send(NORESULTS_MSG)
            return

        for i, d in enumerate(data):
            entry = {
                "word": d['word'],
                "entry": f"{d['definition']}\n\n*{d['example']}*",
                "permalink": d['permalink']
            }
            data[i] = entry

        page = 1
        maxpage = len(data)
        firstrun = True
        orig_user = ctx.message.author

        # check function for wait_for
        # _check = lambda reaction, user: reaction.emoji.startswith(('⏪', '⏩'))

        while True:
            if firstrun:
                firstrun = False
                embed = self.createEmbed(data[page-1])
                msg = await ctx.channel.send(embed=embed)
                # pagination disabled for the moment. immature people abusing it.
                break

            # if maxpage == 1 and page == 1:
            #     break
            # elif page == 1:
            #     toReact = ['⏩']
            # elif page == maxpage:
            #     toReact = ['⏪']
            # elif page > 1 and page < maxpage:
            #     toReact = ['⏪', '⏩']

            # for r in toReact:
            #     await msg.add_reaction(r)
            #     await asyncio.sleep(0.25)

            # try:
            #     reaction, user = await self.bot.wait_for("reaction_add", timeout=30, check=_check)
            # except:
            #     break

            # if user == orig_user:
            #     if '⏪' in str(reaction.emoji):
            #         page = page - 1
            #     elif '⏩' in str(reaction.emoji):
            #         page = page + 1

            #     await msg.clear_reactions()
            #     embed = self.createEmbed(data[page-1])
            #     await msg.edit(embed=embed)
            # else:
            #     await reaction.remove(user)

            # await asyncio.sleep(0.25)



def setup(bot):
    bot.add_cog(UrbanDictionary(bot))
