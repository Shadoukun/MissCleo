import os
import glob
import asyncio
import discord
import yaml
import aiohttp
import logging
from pathlib import Path
from sqlalchemy.orm import sessionmaker
from discord.ext import commands

from cleo.db import *


logger = logging.getLogger('discord')
logger.setLevel(logging.DEBUG)

Session = sessionmaker(bind=engine)
session = Session()

if not os.path.isfile('database.db'):
        Base.metadata.create_all(engine)

with open('config/tokens.yaml', 'r') as tokefile:
    tokens = yaml.load(tokefile)


class MissCleo(commands.Bot):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # create database if it doesn't exist.

        self.session = aiohttp.ClientSession(loop=self.loop)
        self.db = session
        self.tokens = tokens

    async def on_ready(self):
        # database background tasks
        self.loop.create_task(self.update_database_task())
        self.loop.create_task(self.update_users_task())

        print('------')
        print('Logged in as:', self.user.name)
        print('User ID:', self.user.id)
        print('------')

    def load_cogs(self):
        """Load cogs from cogs folder."""

        print("Loading Cogs...")
        path = os.path.join(os.getcwd(), "cleo", "cogs", "*.py")
        cmd_path = glob.glob(path, recursive=True)

        for c in cmd_path:
            # Skip commands/files that contain with __
            if "__" in c:
                continue

            name = os.path.basename(c)[:-3]
            self.load_extension("cleo.cogs." + name)

    # I want these to be in a cog, or modularized somehow
    # but I haven't decided how best to do it.

    async def update_database_task(self):
        '''add missing guilds/channels/users to database'''
        await self.wait_until_ready()
        while not self.is_closed:

            guilds = self.db.query(Guild.id).all()
            channels = self.db.query(Channel.id).all()
            users = self.db.query(User.id).all()

            # add missing guilds.
            for guild in self.guilds:
                if guild.id not in guilds:
                    new_guild = Guild(guild)
                    self.db.add(new_guild)

                # add missing channels.
                for channel in guild.channels:
                    if channel.id not in channels:
                        new_channel = Channel(channel)
                        self.db.add(new_channel)

                # add missing users.
                for user in guild.members:
                    if user.id not in users:
                        new_user = User(user)
                        self.db.add(new_user)

            self.db.commit()
            await asyncio.sleep(7200)


    async def update_users_task(self):
        '''update user avatar and nickname info'''
        await self.wait_until_ready()
        while not self.is_closed:

            for user in self.db.query(User).all():
                member = self.get_user(user.id)

                user.display_name = member.display_name
                user.avatar_url = member.avatar_url

            self.db.commit()
            await asyncio.sleep(12600)
