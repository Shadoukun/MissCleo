import aiohttp
import itertools
import urllib
import logging
from discord import Embed
from discord.ext import commands
import wolframalpha
from wolframalpha import Result

logger = logging.getLogger(__name__)

class Client(wolframalpha.Client):

    async def query(self, input, params=(), **kwargs):
        data = dict(
            input=input,
            appid=self.app_id,
        )
        data = itertools.chain(params, data.items(), kwargs.items())

        query = urllib.parse.urlencode(tuple(data))
        url = 'https://api.wolframalpha.com/v2/query?' + query

        async with aiohttp.ClientSession() as session:
            async with session.get(url) as resp:
                r = await resp.text()
                return Result(r)


class WolframAlpha(commands.Cog):
    """WolframAlpha lookups"""

    def __init__(self, bot):
        self.bot = bot
        self.client = Client(bot.tokens['wolfram'])

    @commands.command(name='wolfram', aliases=['?'])
    async def wolfram_search(self, ctx, *, query:str):
        """!? <expression>    | Use WolframAlpha"""

        if not query:
            return

        async with ctx.typing():
            res = await self.client.query(query)

            if res['@success'] == 'false':
                await ctx.channel.send("Failed.")
                return

            input_pod = [p for p in res.pods if p['@id'] == 'Input'][0]
            _results = [r for r in res.results]
            results = []

            if _results:
                for r in res.results:
                    for s in r.subpods:
                        if s.title:
                            title = f"**{s.title}**"
                        else:
                            title = ""
                        results.append(f"{title}\n`{s.plaintext}` \n")
            else:
                for p in res.pods:
                    if p['@id'] == 'Value':
                        for s in p.subpods:
                            results.append(f"`{s.plaintext}`")

            if results:
                embed = Embed().from_dict({
                    "title": "\u200b",
                    "color": 0xFF6600,
                    "author": {"name": "WolframAlpha", "icon_url": "https://i.imgur.com/vmKn1lU.png"},
                    "fields": [
                        {"name":input_pod.title, "value":f"`{input_pod.text}`\n\u200b", "inline":"False"},
                        {"name":"Results", "value":"\n".join(results), "inline":"False"}
                    ]
                })
                await ctx.channel.send(embed=embed)
            else:
                await ctx.channel.send("Failed.")




def setup(bot):
    bot.add_cog(WolframAlpha(bot))
