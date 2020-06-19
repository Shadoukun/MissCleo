import os
import sys
from aiohttp import web
import aiohttp
import asyncio
import logging
import itertools
import traceback
from pathlib import Path
import discord
from discord.ext import commands
from discord.ext.commands import Command
from discord.ext.commands.view import StringView
from discord.ext.commands.context import Context

from . import utils
from cleo.api import CleoAPI
from .tasks import update_all_guild_members, add_update_all_guilds
from cleo.db import Base, engine, session


logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


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
        self.tokens = kwargs.get('tokens')
        self.db = session
        self.session = aiohttp.ClientSession(loop=self.loop)

        # start REST api.
        self.api = CleoAPI()
        serv = self.loop.create_server(self.api.handler, '127.0.0.1', 10000)
        self.loop.run_until_complete(serv)

        # Dict Custom Commands added from the web client.
        # key: guild_id
        # value: list of Command objects
        self.custom_commands = {}

        self.load_cogs()
        self.help_command = CustomHelpCommand()
        self.loop.create_task(add_update_all_guilds(self))

    async def get_context(self, message, *, cls=Context):
        r"""|coro|

        standard get_context overriden to include a check for custom_commands.
        """

        view = StringView(message.content)
        ctx = cls(prefix=None, view=view, bot=self, message=message)

        if self._skip_check(message.author.id, self.user.id):
            return ctx

        prefix = await self.get_prefix(message)
        invoked_prefix = prefix

        if isinstance(prefix, str):
            if not view.skip_string(prefix):
                return ctx
        else:
            try:
                # if the context class' __init__ consumes something from the view this
                # will be wrong.  That seems unreasonable though.
                if message.content.startswith(tuple(prefix)):
                    invoked_prefix = discord.utils.find(
                        view.skip_string, prefix)
                else:
                    return ctx

            except TypeError:
                if not isinstance(prefix, list):
                    raise TypeError("get_prefix must return either a string or a list of string, "
                                    "not {}".format(prefix.__class__.__name__))

                # It's possible a bad command_prefix got us here.
                for value in prefix:
                    if not isinstance(value, str):
                        raise TypeError("Iterable command_prefix or list returned from get_prefix must "
                                        "contain only strings, not {}".format(value.__class__.__name__))

                # Getting here shouldn't happen
                raise

        invoker = view.get_word()
        ctx.invoked_with = invoker
        ctx.prefix = invoked_prefix
        ctx.command = self.all_commands.get(invoker)

        # Added Custom Command Check
        if not ctx.command:
            try:
                ctx.command = self.custom_commands[ctx.guild.id].get(invoker)

            # guild isn't in the list. Shouldn't ever happen
            except KeyError:
                pass

        return ctx


    def add_custom_command(self, command, guild_id):
        """Adds a :class:`.Command` or its subclasses into the internal list
        of CUSTOM commands

        Parameters
        -----------
        command: :class:`Command`
            The command to add.

        guild_id: :class:`int`
            the guild id the command belongs to.

        Raises
        -------
        :exc:`.ClientException`
            If the command is already registered for the guild specified.

        `TypeError`
            If the command passed is not a subclass of :class:`.Command`.
        """

        if not isinstance(command, Command):
            raise TypeError('The command passed must be a subclass of Command')

        if isinstance(self, Command):
            command.parent = self

        # add guild to custom_commands list if it doesn't already exist.
        if guild_id not in self.custom_commands:
            self.custom_commands[guild_id] = {}

        # If custom command is already in all_commands OR custom_commands[guild_id]
        if command.name in self.all_commands or command.name in self.custom_commands[guild_id]:
            raise discord.ClientException(
                'Command {0.name} is already registered.'.format(command))


        self.custom_commands[guild_id][command.name] = command

        for alias in command.aliases:
            # If alias is already in all_commands OR custom_commands[guild_id]
            if alias in self.all_commands or alias in self.custom_commands[guild_id]:
                raise discord.ClientException(
                    'The alias {} is already an existing command or alias.'.format(alias))
            self.custom_commands[guild_id][alias] = command


    async def on_ready(self):
        # database background tasks
        logger.info(f"Client ready\n"
                    f"Logged in as: {self.user.name}\n"
                    f"User ID: {self.user.id}")

    async def on_member_update(self, before, after):
        # User and GuildMembership are updated together.
        user_changed = [
            before.display_name != after.display_name,
            before.top_role != after.top_role
        ]
        roles_changed = [True for b in before.roles if b.id in [a.id for a in after.roles]]

        if True in user_changed or True in roles_changed:
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

    async def on_user_update(self, before, after):
        await utils.update_user(self, after)

    async def on_command_error(self, ctx, error):
        if isinstance(error, commands.DisabledCommand):
            await ctx.channel.send('This command is disabled.')
        elif isinstance(error, commands.CommandInvokeError):
            print(f'In {ctx.command.qualified_name}:', file=sys.stderr)
            traceback.print_tb(error.original.__traceback__)
            print(f'{error.original.__class__.__name__}: {error.original}', file=sys.stderr)

    def load_cogs(self):
        """Load cogs from files in cogs folder."""

        logger.info("Loading Cogs...")
        cog_path = Path('cleo/cogs').glob('*.py')
        for extension in [f'cleo.cogs.{f.stem}' for f in cog_path]:
            try:
                self.load_extension(extension)
                logger.debug("Loaded Cog: " + extension)
            except Exception as e:
                logger.error(f'Failed to load extension {extension}\n{type(e).__name__}: {e}')
