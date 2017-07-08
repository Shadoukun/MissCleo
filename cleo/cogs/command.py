import json
import yaml
from discord.ext import commands
from cleo.db import Channel
from discord.ext.commands import guild_only
from cleo.utils import is_admin

AUTO_ENABLE = ['help', 'disable', 'enable', 'guild_enable']

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

        enabled_commands = self.get_enabled_commands(ctx.channel.id)
        command = ctx.command.qualified_name.split(' ')

        # always allow auto-enabled commands
        if command[0] in self.bot.auto_enable:
            return True

        if command[0] in enabled_commands:
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

        channels = self.db.query(Channel).all()


        for channel in [c for c in channels]:
            enabled_commands = self.get_enabled_commands(channel.id)
            if command.name not in enabled_commands:
                self._cache[channel.id].append(command.name)
            else:
                pass

            channel.enabled_commands = json.dumps(self._cache[channel.id])

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
                print(type(enabled))
                if cmd.help:
                    enabled[i] = cmd.name + cmd.help
                else:
                    enabled[i] = cmd.name

            await ctx.channel.send("Enabled: ```{0}```".format('\n'.join(enabled)))
        else:
            await ctx.channel.send("Failed.")

    @commands.command(name="guild_enable", hidden=True)
    async def guild_enable(self, ctx, *, commands : str=None):
        if not commands:
            return

        commands = commands.split(" ")
        channels = self.db.query(Channel).all()

        enabled = []
        print(commands)
        #list of newly enabled commands
        # enable 'all' commands
        if commands[0] == 'all':
            commands = list(self.bot.commands)
            for channel in channels:
                for cmd in commands:
                    if cmd.name not in self.bot.auto_enable:
                        self.enable_commands_all(cmd)

                        if cmd not in enabled:
                            enabled.append(cmd)

        else:
            print(commands)
            for cmd in commands:
                cmd = self.bot.get_command(cmd)

            if cmd:
                if cmd.name not in self.bot.auto_enable:
                    self.enable_commands_all(ctx, cmd)
                    enabled.append(cmd)

        if enabled:
            # create fancy message with ugly for loop.
            for i, cmd in enumerate(enabled):
                print(type(enabled))
                if cmd.help:
                    enabled[i] = cmd.name + cmd.help
                else:
                    enabled[i] = cmd.name

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

        disabledcommands = []
        DISABLED_MSG = "Disabled: ```{0}```"

        # disable all commands
        if commands[0] == 'all':
            DISABLED_MSG = "Commands disabled"
            commands = [c for c in self.get_enabled_commands(ctx.channel.id)]

        for cmd in commands:
            try:
                self.disable_commands(ctx, cmd)
                disabledcommands.append(cmd)
            except:
                continue

        if disabledcommands:
            await ctx.channel.send(DISABLED_MSG.format('\n'.join(disabledcommands)))


def setup(bot):
    bot.add_cog(Command(bot))
