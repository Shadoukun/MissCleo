import json
import yaml
from discord.ext import commands
from cleo.db import Channel
from discord.ext.commands import guild_only


AUTO_ENABLE = ['help', 'disable', 'enable']

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

        enabled_commands = self.get_enabled_commands(ctx)
        command = ctx.command.qualified_name.split(' ')

        # always allow auto-enabled commands
        if command[0] in self.bot.auto_enable:
            return True

        if command[0] in enabled_commands:
            return True


    def get_enabled_commands(self, ctx):
        '''Get all commands that are currently marked as enabled for the current channel'''

        # if channel in cache, return cached results.
        try:
            return self._cache[ctx.channel.id]
        # otherwise, get enabled_commands from database.
        except KeyError:
            channel = self.db.query(Channel).filter_by(id=ctx.channel.id).one()

            if channel:
                if channel.enabled_commands:
                    enabled_commands = json.loads(channel.enabled_commands)
                else:
                    enabled_commands = []

                self._cache[ctx.channel.id] = enabled_commands
                return enabled_commands

    def enable_commands(self, ctx, command):
        '''Takes a list of commands to enable for the current channel.'''

        channel = self.db.query(Channel).filter_by(id=ctx.channel.id).one()

        if channel:
            if command.name not in self._cache[ctx.channel.id]:
                self._cache[ctx.channel.id].append(command.name)
            else:
                pass

            channel.enabled_commands = json.dumps(self._cache[ctx.channel.id])
            self.db.commit()

    def disable_commands(self, ctx, command):
        '''Takes a list of commands to disable for the current channel.'''

        channel = self.db.query(Channel).filter_by(id=ctx.channel.id).one()

        if channel:
            for cmd in self._cache[ctx.channel.id]:
                if command == cmd:
                    self._cache[ctx.channel.id].remove(cmd)

            channel.enabled_commands = json.dumps(self._cache[ctx.channel.id])
            self.db.commit()

    @guild_only()
    @commands.command(name="enable", hidden=True)
    async def enable(self, ctx, *, commands : str=None):

        if not commands:
            return

        commands = commands.split(" ")

        #list of newly enabled commands
        enabled = []

        # enable 'all' commands
        if commands[0] == 'all':
            commands = self.bot.commands

        else:
            for i, command in enumerate(commands):
                try:
                    command = self.bot.get_command(command)
                    command[i] = command
                except:
                    commands.remove(command)

        for command in commands:
            if command.name in self.bot.auto_enable:
                continue

            self.enable_commands(ctx, command)
            enabled.append(command)

        if enabled:
            # create fancy message with ugly for loop.
            for i, command in enumerate(enabled):
                if command.help:
                    command = command.name + command.help
                else:
                    command = command.name

                enabled[i] = command

            await ctx.channel.send("Enabled: ```{0}```".format('\n'.join(enabled)))
        else:
            await ctx.channel.send("Failed.")

    @guild_only()
    @commands.command(name='disable', hidden=True)
    async def disable(self, ctx, *, commands : str=None):

        if not commands:
            return

        channel = ctx.channel.id
        commands = commands.split(" ")

        disabledcommands = []
        DISABLED_MSG = "Disabled: ```{0}```".format('\n'.join(disabledcommands))

        # disable all commands
        if commands[0] == 'all':
            DISABLED_MSG = "Commands disabled"
            commands = [c for c in self.get_enabled_commands(ctx)]

        for command in commands:
            try:
                self.disable_commands(ctx, command)
                disabledcommands.append(command)
            except:
                continue

        if disabledcommands:
            await ctx.channel.send(DISABLED_MSG)


def setup(bot):
    bot.add_cog(Command(bot))
