from discord.ext import commands
from discord.ext.commands import guild_only, is_nsfw

from bs4 import BeautifulSoup, SoupStrainer
import random
from cachetools import TTLCache
import discord
import time
import os
import yaml
import json


SITES = ['gelbooru', 'shotachan', 'e621']

SEEDTAGS = {
    'cum': ['shota'],
    'shota': [''],
    'fur': ['shota']
}

TAGFILE = "./config/tags.yaml"

NORESULTS_MSG = "No Results Found."
ALLSEEN_MSG = "All images have already been seen. Try again later."

class ImageSearches:
    """Imageboard/Booru search commands"""

    def __init__(self, bot):
        self.bot = bot
        self.caches = {}
        self.count_cache = {}
        self.default_tags = {}
        self.load_tag_file()

        for site in SITES:
            self.count_cache[site] = TTLCache(maxsize=500, ttl=300)
            self.caches[site] = TTLCache(maxsize=500, ttl=300)


    @is_nsfw()
    @guild_only()
    @commands.command(name="cum")
    async def gelbooru(self, ctx, *, tags: str=None):
        tags = self.create_tag_string(ctx, tags)

        url = "http://gelbooru.com/index.php"
        params = {
            'page': 'dapi',
            's': 'post',
            'q': 'index',
            'tags': tags,
            'pid': ''
        }

        async with ctx.typing():
            post = await self.search(ctx, 'gelbooru', url, params, 100)

            if post:
                embed = {
                    "site": "Gelbooru",
                    "icon": "https://gelbooru.com/favicon.png",
                    "id": post['id'],
                    "post_url": "https:{0}".format(post['file_url']),
                    "source_url": post['source'],
                    "orig_url": "http://gelbooru.com/index.php?page=post&s=view&id={0}".format(post['id'])
                }

                embed = await self.create_embed(embed)
                await ctx.channel.send(embed=embed)

    @is_nsfw()
    @guild_only()
    @commands.command(name="shota")
    async def shotachan(self, ctx, *, tags: str=None):
        tags = self.create_tag_string(ctx, tags)

        url = "http://booru.shotachan.net/post/index.xml"
        params = {
            'tags': tags,
            'page': ''
        }

        async with ctx.typing():
            post = await self.search(ctx, 'shotachan', url, params, 49)

            if post:
                embed = {
                    "site": "Shotachan",
                    "icon": "http://booru.shotachan.net/favicon.ico",
                    "id": post['id'],
                    "post_url": post['file_url'],
                    "source_url": None if not post['source'] else post['source'],
                    "orig_url": "http://booru.shotachan.net/post/show/{0}".format(post['id'])
                }

                embed = await self.create_embed(embed)
                await ctx.channel.send(embed=embed)

    @is_nsfw()
    @guild_only()
    @commands.command(name="fur")
    async def e621(self, ctx, *, tags : str=None):
        tags = self.create_tag_string(ctx, tags)

        url = "https://e621.net/post/index.xml"
        params = {
            'tags': tags,
            'page': ''
        }
        async with ctx.typing():
            post = await self.search(ctx, 'e621', url, params, 75)

            if post:
                embed = {
                    "site": "e621",
                    "icon": "https://e621.net/favicon.ico",
                    "id": post.find("id").text,
                    "post_url": post.find('file_url').text,
                    "source_url": post.find("source").text,
                    "orig_url": "https://e621.net/post/show/{0}".format(post.find("id").text)
                }

                embed = await self.create_embed(embed)
                await ctx.channel.send(embed=embed)

    async def search(self, ctx, site, url, params, limit):

        print(url, params)
        if params['tags'] in self.count_cache[site]:
            count = self.count_cache[site][params['tags']]

        else:
            async with ctx.bot.session.get(url, params=params) as resp:
                print(resp.url)
                if resp.status == 200:
                    data = await resp.text()
                    soup = BeautifulSoup(data, 'lxml')
                    count = int(soup.find("posts")['count'])

        if not count:
            await ctx.channel.send(NORESULTS_MSG)
            return None

        maxpage = int(round(count/limit))
        if maxpage < 1:
            maxpage = 1

        self.count_cache[site][params['tags']] = count
        pageid = random.sample(list(range(0, maxpage)), 1)[0]

        params[list(params.keys())[-1]] = str(pageid)

        async with self.bot.session.get(url, params=params) as resp:
            data = await resp.text()
            soup = BeautifulSoup(data, 'lxml')
            posts = soup.find_all("post")
            post = await self.getRandomPost(posts, count, site)

        if not post:
            await ctx.channel.send(ALLSEEN_MSG)
            return None

        return post

    def create_tag_string(self, ctx, tags):
        channel = ctx.channel.id
        command = ctx.command.name
        guild = ctx.guild.name
        default_tags = self.get_default_tags(channel, command)

        if default_tags:
            if tags:
                tagstring = tags + ' '.join(default_tags)
            else:
                tagstring = " ".join(default_tags)
        else:
            if tags:
                tagstring = tags
            else:
                tagstring = ''
        print(tagstring)
        return tagstring


    async def getRandomPost(self, posts, count, board):
        # create list of posts not recently seen.
        postlist = []

        for post in posts:
            try:
                if post['id'] not in self.caches[board].keys():
                    postlist.append(post)
            except:
                postid = post.find("id").text
                if postid not in self.caches[board].keys():
                    postlist.append(post)
        # if post list has posts, shuffle and select one
        if postlist:
            random.shuffle(postlist)
            try:
                postid = postlist[0]['id']
                self.caches[board][postid] = postid
            except:
                postid = postlist[0].find('id').text
                self.caches[board][postid] = postid

            return postlist[0]

        else:
            return None


    async def create_embed(self, post):
        source_text = """*View on:* [[{0}]]({1})  |  [[Source]]({2})""".format(post['site'], post['orig_url'], post['source_url'])

        embed = discord.Embed(title="\n", url=post['post_url'], colour=0x006FFA)
        embed.set_image(url=post['post_url'])
        embed.set_author(name=post['site'], icon_url=post['icon'])
        embed.add_field(name="\u200B", value=source_text, inline=False)
        return embed


    @commands.group(name="default_tags", hidden=True)
    async def default_tags_cmd(self, ctx):
        if ctx.invoked_subcommand is None:
            pass

    @default_tags_cmd.command(name="add")
    async def add_default_tags(self, ctx, cmd, *, tags : str):
        channel = ctx.channel.id
        tags = tags.split(" ")

        for tag in tags:
            if tag not in self.default_tags[channel][cmd]:
                self.default_tags[channel][cmd].append(tag)

        self.write_tag_file()
        await ctx.channel.send(str(self.default_tags[channel][cmd]))

    @default_tags_cmd.command(name="remove")
    async def remove_default_tags(self, ctx, cmd, *, tags: str):
        channel = ctx.channel.id
        tags = tags.split(" ")

        for tag in tags:
            if tag in self.default_tags[channel][cmd]:
                self.default_tags[channel][cmd].remove(tag)

        self.write_tag_file()
        await ctx.channel.send(str(self.default_tags[channel][cmd]))

    def get_default_tags(self, channel, command):
        try:
            return self.default_tags[channel][command]
        except:
            if channel not in self.default_tags:
                self.default_tags[channel] = {}

            self.default_tags[channel][command] = SEEDTAGS[command]
            return self.default_tags[channel][command]

    def load_tag_file(self):

        if not os.path.exists(TAGFILE):
            open(TAGFILE, 'x')
            self.default_tags = {}
        else:
            with open(TAGFILE, 'r') as tagfile:
                data = yaml.load(tagfile)

            if data:
                self.default_tags = data
            else:
                self.default_tags = {}

    def write_tag_file(self):
        with open(TAGFILE, 'w') as tagfile:
            yaml.dumper.ignore_aliases = lambda *args : True
            yaml.dump(self.default_tags, tagfile, default_flow_style=False)

def setup(bot):
    bot.add_cog(ImageSearches(bot))
