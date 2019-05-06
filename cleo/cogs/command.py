import logging
from discord.ext import commands
from discord.ext.commands import guild_only
from functools import lru_cache

from cleo.db import Channel
from cleo.utils import admin_only

logger = logging.getLogger(__name__)

AUTO_ENABLE = ['help', 'disable', 'enable', 'list', 'guild_enable', 'guild_disable']

ENABLED_MSG = "Enabled: ```{0}```"
DISABLED_MSG = "Disabled: ```{0}```"
ENABLEDALL_MSG = "Commands enabled."
DISABLEDALL_MSG = "Commands disabled"


class Command(commands.Cog):
    '''Cog for command management(enable/disable) commands'''

    def __init__(self, bot):
        self.bot = bot
        self.db = bot.db
        self.bot.auto_enable = AUTO_ENABLE

    async def bot_check(self, ctx):
        '''Checks if a command is enabled for the current channel.'''
        command = ctx.command.qualified_name.split(' ')[0]
        enabled_commands = self._get_enabled_commands(ctx)

        if (command in self.bot.auto_enable) \
        or (command in enabled_commands):
            return True
        else:
            # don't remember why I used an exception.
            raise commands.DisabledCommand

    @lru_cache(maxsize=None)
    def _get_channel(self, guild_id, channel_id):
        '''Retrieves channel from database. Uses lru_cache'''

        channel = self.db.query(Channel).filter_by(guild_id=guild_id).filter_by(id=channel_id).one()
        if channel:
            return channel
        else:
            return None

    def _get_enabled_commands(self, ctx):
        '''Get all commands that are enabled for the current channel'''

        channel = self._get_channel(ctx.guild.id, ctx.channel.id)
        if channel:
            enabled = channel.enabled_commands + self.bot.auto_enable
            return enabled

    def _enable(self, ctx, commands, **kwargs):
        '''Takes a list of commands to enable for the current channel.'''

        channels = kwargs.get('channels', [self._get_channel(ctx.guild.id, ctx.channel.id)])
        bot_cmds = [c.name for c in self.bot.commands]

        logger.debug("enabling commands: " + "\n".join([c for c in commands]))

        for ch in channels:
            enabled = ch.enabled_commands
            commands = [c for c in commands if c in bot_cmds]
            ch.enabled_commands = set(enabled + commands)

        self.db.commit()
        self._get_channel.cache_clear()

    def _disable(self, ctx, commands, **kwargs):

        channels = kwargs.get('channels', [self._get_channel(ctx.guild.id, ctx.channel.id)])
        bot_cmds = [c.name for c in self.bot.commands]

        logger.debug("disabling commands:" + "\n".join([c for c in commands]))

        for ch in channels:
            enabled = ch.enabled_commands
            commands = [c for c in commands if c in bot_cmds]

            for c in commands:
                enabled.remove(c)

            ch.enabled_commands = enabled

        self.db.commit()
        self._get_channel.cache_clear()

    @guild_only()
    @admin_only()
    @commands.command(name="enable", hidden=True)
    async def enable(self, ctx, *, commands:str=None):

        if not commands:
            await ctx.channel.send("Please specify commands to enable.")
            return

        cmds = commands.split(" ")
        to_enable = []

        valid_cmds = [c.name for c in self.bot.commands]
        if cmds[0] == 'all':
            cmds = valid_cmds

        for c in cmds:
            if (c not in self.bot.auto_enable) and (c in valid_cmds):
                to_enable.append(c)

        if to_enable:
            self._enable(ctx, to_enable)
            await ctx.channel.send("Enabled: ```{0}```".format('\n'.join(to_enable)))
        else:
            await ctx.channel.send("Failed.")

    @guild_only()
    @admin_only()
    @commands.command(name="disable", hidden=True)
    async def disable(self, ctx, *, commands:str=None):

        if not commands:
            await ctx.channel.send("Please specify commands to disable.")
            return

        cmds = commands.split(" ")
        to_disable = []

        valid_cmds = [c.name for c in self.bot.commands]
        if cmds[0] == 'all':
            cmds = valid_cmds

        for c in cmds:
            if (c not in self.bot.auto_enable) and (c in valid_cmds):
                to_disable.append(c)

        if to_disable:
            self._disable(ctx, to_disable)
            await ctx.channel.send("Disabled: ```{0}```".format('\n'.join(to_disable)))
        else:
            await ctx.channel.send("Failed.")

    @guild_only()
    @admin_only()
    @commands.command(name="guild_enable", hidden=True)
    async def guild_enable(self, ctx, *, commands:str=None):

        cmds = commands.split(" ")
        to_enable = []
        channels = self.db.query(Channel).filter_by(guild_id=ctx.guild.id).all()

        valid_cmds = [c.name for c in self.bot.commands]
        if cmds[0] == 'all':
            cmds = valid_cmds

        for c in cmds:
            if (c not in self.bot.auto_enable) and (c in valid_cmds):
                to_enable.append(c)

        if to_enable:
            self._enable(ctx, to_enable, channels=channels)
            await ctx.channel.send("Enabled: ```{0}```".format('\n'.join(to_enable)))
        else:
            await ctx.channel.send("Failed.")

    @guild_only()
    @admin_only()
    @commands.command(name="guild_disable", hidden=True)
    async def guild_disable(self, ctx, *, commands:str=None):

        cmds = commands.split(" ")
        to_disable = []
        channels = self.db.query(Channel).filter_by(guild_id=ctx.guild.id).all()

        valid_cmds = [c.name for c in self.bot.commands]
        if cmds[0] == 'all':
            cmds = valid_cmds

        for c in cmds:
            if (c not in self.bot.auto_enable) and (c in valid_cmds):
                to_disable.append(c)

        if to_disable:
            self._disable(ctx, to_disable, channels=channels)
            await ctx.channel.send("Disabled: ```{0}```".format('\n'.join(to_disable)))
        else:
            await ctx.channel.send("Failed.")



def setup(bot):
    bot.add_cog(Command(bot))
