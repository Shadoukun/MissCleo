import os
import sys
import aiohttp
import asyncio
import logging
import itertools
import traceback
from pathlib import Path
from discord.ext import commands

from . import utils
from .tasks import update_guilds, update_user_info
from cleo.db import Base, engine, session

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

if not os.path.isfile('database.db'):
    Base.metadata.create_all(engine)

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

        custom_category = "Custom:"
        custom_commands = None

        filtered = await self.filter_commands(bot.commands, sort=True, key=get_category)
        to_iterate = itertools.groupby(filtered, key=get_category)
        max_size = self.get_max_size(filtered)

        # Now we can add the commands to the page.
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
        # idk why I need to do this
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        super().__init__(*args, loop=loop, **kwargs)

        self.session = aiohttp.ClientSession(loop=self.loop)
        self.db = session
        self.tokens = kwargs.get('tokens')
        self.help_command = CustomHelpCommand()

        self.load_cogs()
        self.loop.create_task(update_guilds(self))
        self.loop.create_task(update_user_info(self))

    async def on_ready(self):
        # database background tasks
        logger.info(f"Client ready\n"
                    f"Logged in as: {self.user.name}\n"
                    f"User ID: {self.user.id}")

    async def on_member_update(self, before, after):
        # User and GuildMembership are updated together.
        if (str(before.avatar_url) != str(after.avatar_url)) \
        or (before.display_name != after.display_name):
            await utils.update_member(self, before, after)

    async def on_member_join(self, member):
        await utils.add_user(self, member)
        logger.debug(f'{member.name} joined {member.guild.name}.')

    async def on_guild_channel_create(self, channel):
        await utils.add_channel(self, channel)
        logging.debug(f"Channel {channel.name} created")

    async def on_guild_join(self, guild):
        await utils.add_guild(self, guild)

    async def on_guild_role_create(self, role):
        await utils.add_role(self, role)
        logger.debug(f"Role {role.name} created.")

    async def on_guild_role_delete(self, role):
        #TODO: add scheduling of update_user_info to change top_role of Members. (if I have to...?)
        await utils.delete_role(self, role)
        logger.debug(f"Role {role.name} deleted.")

    async def on_guild_role_update(self, before, after):
        await utils.update_role(self, after)
        logger.debug(f"Role updated.\n"
                     f"{before.id} - {before.name}"
                     f"{after.id} - {after.name}")

    async def on_command_error(self, ctx, error):
        if isinstance(error, commands.DisabledCommand):
            await ctx.channel.send('This command is disabled.')
        elif isinstance(error, commands.CommandInvokeError):
            print(f'In {ctx.command.qualified_name}:', file=sys.stderr)
            traceback.print_tb(error.original.__traceback__)
            print(f'{error.original.__class__.__name__}: {error.original}', file=sys.stderr)

    def load_cogs(self):
        """Load cogs from cogs folder."""

        logger.info("Loading Cogs...")
        cog_path = Path('cleo/cogs').glob('*.py')
        for extension in [f'cleo.cogs.{f.stem}' for f in cog_path]:
            try:
                self.load_extension(extension)
                logger.debug("Loaded Cog: " + extension)
            except Exception as e:
                logger.error(f'Failed to load extension {extension}\n{type(e).__name__}: {e}')
