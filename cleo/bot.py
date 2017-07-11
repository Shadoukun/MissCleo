from cleo.db import *
import cleo.utils as utils

import logging
import os
import glob
import asyncio
import discord
import yaml
import aiohttp
from pathlib import Path
from sqlalchemy.orm import sessionmaker
from discord.ext import commands


logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

Session = sessionmaker(bind=engine)
session = Session()

if not os.path.isfile('database.db'):
        Base.metadata.create_all(engine)

with open('config/tokens.yaml', 'r') as tokefile:
    tokens = yaml.load(tokefile)


class MissCleo(commands.Bot):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.session = aiohttp.ClientSession(loop=self.loop)
        self.db = session
        self.tokens = tokens




    async def on_ready(self):
        # database background tasks
        logger.debug("Client ready")
        await utils.update_database(self)

        logger.info(f'Logged in as: {self.user.name}')
        logger.info(f'User ID: {self.user.id}')

    async def on_member_update(self, before, after):
        # Update a user's info in the database when they change it.
        user = self.db.query(User) \
                    .filter_by(id=after.id).one()

        user.avatar_url = after.avatar_url
        user.display_name = after.display_name
        self.db.commit()

        logger.debug("Member info updated.")
        logger.debug(f'Before: {before.display_name}, {before.avatar_url}')
        logger.debug(f'After: {after.display_name}, {after.avatar_url}')

    async def on_member_join(self, member):
        # Add new members to the database.
        new_user = User(member)
        self.db.add(new_user)
        self.db.commit()

        logging.debug(f'{member.name} joined {member.guild.name}.')

    async def on_guild_channel_create(self, channel):
        # Add new channels to the database.
        new_channel = Channel(channel)
        self.db.add(new_channel)
        self.db.commit()

        logging.debug(f"Channel {channel.name} created")

    async def on_guild_join(self, guild):
        # Add new guilds to the database.
        new_guild = Guild(guild)
        self.db.add(new_guild)
        self.db.commit()

        logging.debug(f"Joined {guild.name}")

    def load_cogs(self):
        """Load cogs from cogs folder."""

        logger.info("Loading Cogs...")
        extensions = [f'cleo.cogs.{f.stem}' for f in Path('cleo/cogs').glob('*.py')]

        for extension in extensions:
            try:
                self.load_extension(extension)
            except Exception as e:
                logger.info(f'Failed to load extension {extension}\n{type(e).__name__}: {e}')




