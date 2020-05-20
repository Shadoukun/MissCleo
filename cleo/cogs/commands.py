import random
import logging
from aiohttp import web
from discord.ext import commands

from cleo.db import CustomCommand, CustomResponse, CustomReaction
import re

logger = logging.getLogger(__name__)


class CustomCommands(commands.Cog):
    """Custom commands, responses, and reactions"""

    def __init__(self, bot):
        self.bot = bot
        self.db = self.bot.db

        self.responses = {}
        self.reactions = {}

        # Rest API routes to trigger updates.
        self.bot.api_routes.append(("update_commands", self.update_commands))
        self.bot.api_routes.append(("update_responses", self.update_responses))
        self.bot.api_routes.append(("update_reactions", self.update_reactions))

    @commands.Cog.listener()
    async def on_ready(self):
        logger.debug("adding commands, responses, reactions")

        await self._load_custom_commands()
        await self.update_responses()
        await self.update_reactions()

    @commands.Cog.listener()
    async def on_message(self, message):
        if message.author.id == self.bot.user.id:
            return

        await self._process_responses(message)
        await self._process_reactions(message)

    def _make_command(self, command):
        '''Returns a callback function
           for sending custom commands'''

        logger.debug(f"creating command: {command.command}")

        # callback function for custom commands
        async def _command(ctx):
            nonlocal command
            await ctx.channel.send(command.response)

        return _command

    async def _load_custom_commands(self, command=None):
        '''Load/Reload custom commands from database
           takes individual commands to reload as optional arg'''

        logger.debug("loading custom commands")
        cmds = [command] if command else self.db.query(CustomCommand).all()

        for c in cmds:
            if c.command in self.bot.commands:
                self.bot.remove_command(c.command)

            func = self._make_command(c)
            cmd = commands.Command(func, name=c.command)
            cmd.category = 'Custom'
            self.bot.add_command(cmd)

            # if commands cog is enabled, add command to auto-enabled commands.
            if c.command not in self.bot.auto_enable:
                self.bot.auto_enable.append(c.command)

    async def _process_responses(self, message):
        '''Triggers a custom response if message containers trigger.'''

        logger.debug("processing responses")

        resp = []
        channel = message.channel
        msg = message.content.lower()

        # check for trigger in message
        for _, r in self.responses.items():
            if r[0].search(msg):
                resp = r[1].split('\n')

        # check if there are multiple possible responses
        if resp:
            if len(resp) > 1:
                    resp = random.choice(resp)
            else:
                resp = resp[0]

            await channel.send(resp)

    async def _process_reactions(self, message):
        '''Triggers an automatic discord reaction if message containers trigger'''

        logger.debug("processing reactions")

        reactions = []
        react_emoji = None
        msg = message.content.lower()
        custom_emojis = self.bot.emojis

        # check for trigger in message
        for _, r in self.reactions.items():
            if r[0].search(msg):
                reactions = r[1].split('\n')

        for react in reactions:
            # check if a custom emoji
            for e in custom_emojis:
                if react == e.name:
                    react_emoji = e
                    break

            # otherwise, try to pass literal string
            if not react_emoji:
                react_emoji = react

            try:
                await message.add_reaction(react_emoji)
            except:
                logger.error("EmojiError")

    async def update_commands(self):
        '''Update custom commands from database'''

        logger.debug("updating commands")

        cmds = self.db.query(CustomCommand).all()
        if not cmds:
            return

        for command in cmds:
            # sqlalchemy seems to not refresh consistently. I think
            self.db.refresh(command)
            if command.modified_flag == 1:
                command.modified_flag = 0
                self.db.commit()
                await self._load_custom_commands(command)

    async def remove_commands(self, command_id):
        command = self.db.query(CustomCommand).filter_by(id=command_id).one()

        custom_cmd = self.bot.get_command(command.command)
        self.bot.remove_command(command.command)
        self.db.query(CustomCommand).filter_by(id=command_id).delete()
        self.db.commit()


    async def update_responses(self):
        '''Add custom responses from database'''

        logger.debug("updating responses")

        self.responses = {}
        responses = self.db.query(CustomResponse).all()
        if responses:
            for r in responses:
                # sqlalchemy seems to not refresh consistently. I think
                self.db.refresh(r)
                trigger_exp = re.compile(fr'\b{r.trigger}\b')
                self.responses[r.trigger] = [trigger_exp, r.response]


    async def update_reactions(self):
        '''Add custom reactions from database'''

        logger.debug("updating reactions")

        self.reactions = {}
        reactions = self.db.query(CustomReaction).all()
        if reactions:
            for r in reactions:
                # sqlalchemy seems to not refresh consistently
                self.db.refresh(r)
                trigger_exp = re.compile(fr'\b{r.trigger}\b')
                self.reactions[r.trigger] = (trigger_exp, r.reaction.replace(':', ''))


def setup(bot):
    bot.add_cog(CustomCommands(bot))
