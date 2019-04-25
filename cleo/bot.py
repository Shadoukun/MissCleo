import os
import aiohttp
import logging
import itertools
from pathlib import Path
from discord.ext import commands

import cleo.utils as utils
from cleo.db import Channel, Guild, Base, engine, session

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

if not os.path.isfile('database.db'):
    Base.metadata.create_all(engine)

HELP_COG = "Command"

class CustomHelpCommand(commands.DefaultHelpCommand):


    async def send_bot_help(self, mapping):
        ctx = self.context
        bot = ctx.bot

        if bot.description:
            # <description> portion
            self.paginator.add_line(bot.description, empty=True)

        no_category = '\u200b{0.no_category}:'.format(self)
        def get_category(command, *, no_category=no_category):
            cog = getattr(command, 'cog', None)

            cog = command.cog
            category = getattr(command, 'category', None)

            if command.name == 'help':
                category = 'Command'

            if cog:
                return cog.qualified_name + ':'

            return category + ':' if category else no_category

        filtered = await self.filter_commands(bot.commands, sort=True, key=get_category)
        max_size = self.get_max_size(filtered)
        to_iterate = itertools.groupby(filtered, key=get_category)

        # Now we can add the commands to the page.
        custom_category = "Custom:"
        custom_commands = None

        for category, commands in to_iterate:
            if category == custom_category:
                custom_commands = sorted(commands, key=lambda c: c.name) if self.sort_commands else list(commands)
            else:
                commands = sorted(commands, key=lambda c: c.name) if self.sort_commands else list(commands)
                self.add_indented_commands(commands, heading=category, max_size=max_size)

        # add Custom command category to bottom of help.
        self.paginator.add_line()
        self.add_indented_commands(custom_commands, heading=custom_category, max_size=max_size)

        note = self.get_ending_note()
        if note:
            self.paginator.add_line()
            self.paginator.add_line(note)

        await self.send_pages()


class MissCleo(commands.Bot):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.session = aiohttp.ClientSession(loop=self.loop)
        self.db = session
        self.tokens = kwargs.get('tokens')

        self.help_command = CustomHelpCommand()

    async def on_ready(self):
        # database background tasks
        logger.info("Client ready")

        await utils.update_database(self)
        await utils.update_user_info(self)

        logger.info(f'Logged in as: {self.user.name}')
        logger.info(f'User ID: {self.user.id}')

    async def on_member_update(self, before, after):
        # Update a user's info in the database when they change it.
        # TODO: Figure out if this runs when new users join

        if (str(before.avatar_url) != str(after.avatar_url)) or (before.display_name != after.display_name):
            await utils.update_user(self, before, after)

    async def on_member_join(self, member):
        await utils.add_users(self, member)
        await utils.add_member(self, member)
        logger.debug(f'{member.name} joined {member.guild.name}.')

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

        logging.debug(f"Guild {guild.name} created")

    def load_cogs(self):
        """Load cogs from cogs folder."""

        logger.info("Loading Cogs...")

        cog_path = Path('cleo/cogs').glob('*.py')
        extensions = [f'cleo.cogs.{f.stem}' for f in cog_path]

        for extension in extensions:
            try:
                self.load_extension(extension)
                logger.info("Loaded Cog: " + extension)
            except Exception as e:
                logger.info(f'Failed to load extension {extension}\n{type(e).__name__}: {e}')




