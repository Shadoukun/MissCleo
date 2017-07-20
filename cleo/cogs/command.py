import json
import yaml
import logging
from discord.ext import commands
from cleo.db import Channel
from discord.ext.commands import guild_only
from cleo.utils import is_admin

logger = logging.getLogger(__name__)

AUTO_ENABLE = ['help', 'disable', 'enable', 'guild_enable', 'guild_disable']

ENABLED_MSG = "Disabled: ```{0}"
DISABLED_MSG = "Disabled: ```{0}```"
ENABLEDALL_MSG = "Commands enabled."
DISABLEDALL_MSG = "Commands disabled"

class Command:
    '''Cog for command management(enable/disable) commands'''

    def __init__(self, bot):
        self.bot = bot
        self.db = bot.db
        self._cache = {}

        self.bot.auto_enable = AUTO_ENABLE

    async def __global_check(self, ctx):
        #Checks that a command is enabled for the current channel.
        # Enabled commands are listed in the 'channels' table of the db.
        logger.debug("!" + ctx.command.qualified_name)

        command = ctx.command.qualified_name.split(' ')[0]
        logger.debug(f"checking if !{command} is enabled")

        enabled_commands = self.get_enabled_commands(ctx.channel.id)

        # always allow auto-enabled commands
        if command in self.bot.auto_enable:
            return True

        if command in enabled_commands:
            return True


    def get_enabled_commands(self, channel_id):
        '''Get all commands that are currently marked as enabled for the current channel'''

        # if channel in cache, return cached results.
        try:
            return self._cache[channel_id]
        # otherwise, get enabled_commands from database.
        except KeyError:
            channel = self.db.query(Channel).filter_by(id=channel_id).one()

            if channel:
                if channel.enabled_commands:
                    enabled_commands = json.loads(channel.enabled_commands)
                else:
                    enabled_commands = []

                self._cache[channel.id] = enabled_commands
                return enabled_commands

    def enable_commands(self, ctx, command):
        '''Takes a list of commands to enable for the current channel.'''
        logger.debug(f"enabling command: {command.name}")

        channel = self.db.query(Channel).filter_by(id=ctx.channel.id).one()

        if channel:
            if command.name not in self._cache[ctx.channel.id]:
                self._cache[ctx.channel.id].append(command.name)
            else:
                pass

            channel.enabled_commands = json.dumps(self._cache[ctx.channel.id])
            self.db.commit()

    def enable_commands_all(self, command):
        '''takes a list of commands to enable for all channels in guild'''
        logger.debug("enabling command for guild: {0}".format(command.name))

        channels = self.db.query(Channel).all()


        for channel in [c for c in channels]:
            enabled_commands = self.get_enabled_commands(channel.id)
            if command.name not in enabled_commands:
                self._cache[channel.id].append(command.name)

            channel.enabled_commands = json.dumps(self._cache[channel.id])

        self.db.commit()

    def disable_commands(self, ctx, command):
        '''Takes a list of commands to disable for the current channel.'''
        logger.debug(f"disabling command: {command}")

        channel = self.db.query(Channel).filter_by(id=ctx.channel.id).one()

        if channel:
            for cmd in self._cache[ctx.channel.id]:
                if command == cmd:
                    self._cache[ctx.channel.id].remove(cmd)

            channel.enabled_commands = json.dumps(self._cache[ctx.channel.id])
            self.db.commit()

    def disable_commands_all(self, command):
        logger.debug("disabling command for guild: {0}".format(command))

        channels = self.db.query(Channel).all()

        for channel in [c for c in channels]:
            if command in self.get_enabled_commands(channel.id):
                self._cache[channel.id].remove(command)
                channel.enable_commands = json.dumps(self._cache[channel.id])

        self.db.commit()

    @guild_only()
    @is_admin()
    @commands.command(name="enable", hidden=True)
    async def enable(self, ctx, *, commands : str=None):

        if not commands:
            return

        commands = commands.split(" ")

        #list of newly enabled commands
        enabled = []
        # enable 'all' commands
        if commands[0] == 'all':
            commands = list(self.bot.commands)
            for cmd in commands:
                if cmd.name not in self.bot.auto_enable:
                    self.enable_commands(ctx, cmd)
                    enabled.append(cmd)

        else:
            for cmd in commands:
                cmd = self.bot.get_command(cmd)
                if cmd:
                    if cmd.name not in self.bot.auto_enable:
                        self.enable_commands(ctx, cmd)
                        enabled.append(cmd)

        if enabled:
            # create fancy message with ugly for loop.
            for i, cmd in enumerate(enabled):
                if cmd.help:
                    enabled[i] = cmd.name + cmd.help
                else:
                    enabled[i] = cmd.name

            await ctx.channel.send("Enabled: ```{0}```".format('\n'.join(enabled)))
        else:
            await ctx.channel.send("Failed.")

    @guild_only()
    @is_admin()
    @commands.command(name="guild_enable", hidden=True)
    async def guild_enable(self, ctx, *, commands : str=None):

        if not commands:
            return

        commands = commands.split(" ")
        channels = self.db.query(Channel).all()

        enabled = []

        #list of newly enabled commands
        # enable 'all' commands
        if commands[0] == 'all':
            for cmd in self.bot.commands:
                if cmd.name not in self.bot.auto_enable:
                    self.enable_commands_all(cmd)
                    enabled.append(cmd)
        else:
            for cmd in commands:
                if cmd not in self.bot.auto_enable:
                    cmd = self.bot.get_command(cmd)
                    if cmd:
                        self.enable_commands_all(cmd)
                        enabled.append(cmd)

        if enabled:
            # create fancy message with ugly for loop.
            for i, cmd in enumerate(enabled):
                cmd_string = cmd.name
                if cmd.help:
                    cmd_string = cmd_string + cmd.help
                enabled[i] = cmd_string

            await ctx.channel.send("Enabled: ```{0}```".format('\n'.join(enabled)))
        else:
            await ctx.channel.send("Failed.")


    @guild_only()
    @is_admin()
    @commands.command(name='disable', hidden=True)
    async def disable(self, ctx, *, commands : str=None):

        if not commands:
            return

        commands = commands.split(" ")

        disabled = []
        # disable all commands
        if commands[0] == 'all':
            commands = [c for c in self.get_enabled_commands(ctx.channel.id)]

        for cmd in commands:
            try:
                self.disable_commands(ctx, cmd)
                disabled.append(cmd)

            except Exception as e:
                print(e)
                continue

        if disabled:
            await ctx.channel.send(DISABLED_MSG.format('\n'.join(disabled)))


    @guild_only()
    @is_admin()
    @commands.command(name="guild_disable", hidden=True)
    async def guild_disable(self, ctx, *, commands : str=None):

        if not commands:
            return

        commands = commands.split(" ")

        disabled = []
        if commands[0] == 'all':
            for cmd in [c.name for c in self.bot.commands]:
                    self.disable_commands_all(cmd)
                    if cmd not in self.bot.auto_enable:
                        disabled.append(cmd)
        else:
            for cmd in commands:
                try:
                    self.disable_commands(ctx, cmd)
                    if cmd not in self.bot.auto_enable:
                        disabled.append(cmd)
                except:
                    pass

        if disabled:
            await ctx.channel.send(DISABLED_MSG.format('\n'.join(disabled)))

def setup(bot):
    bot.add_cog(Command(bot))
