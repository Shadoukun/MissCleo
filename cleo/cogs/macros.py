import random
import discord
import logging
from discord.ext import commands
from cleo.db import Macro, MacroReaction, MacroResponse

import asyncio
from aiohttp import web
import code

logger = logging.getLogger(__name__)


class Macros(commands.Cog):
    """Macro commands, responses, and reactions"""

    def __init__(self, bot):
        self.bot = bot
        self.db = self.bot.db

        self.responses = {}
        self.reactions = {}

        app = web.Application()
        app.router.add_get('/', self.handle)
        app.router.add_get('/{name}', self.handle)


        # crappy REST api for triggering triggering events from flask app to discord bot.
        handler = app.make_handler()
        f = self.bot.loop.create_server(handler, '0.0.0.0', 10000)
        srv = self.bot.loop.run_until_complete(f)

    @commands.Cog.listener()
    async def on_ready(self):
        logger.debug("adding macros, responses, reactions")

        await self._load_macro_commands()
        await self.update_responses()
        await self.update_reactions()

    @commands.Cog.listener()
    async def on_message(self, message):
        if message.author.id == self.bot.user.id:
            return

        await self._process_responses(message)
        await self._process_reactions(message)

    def _make_macro(self, macro):
        '''Returns a generic send_message callback function
           for command macros'''

        logger.debug(f"creating macro: {macro.command}")

        # callback function for regular macros
        async def _macro(ctx):
            nonlocal macro
            await ctx.channel.send(macro.response)

        return _macro

    async def _load_macro_commands(self, macro=None):
        '''Load/Reload macro commands from database
           takes single macro to reload as optional arg'''

        logger.debug("loading macro commands")
        macros = [macro] if macro else self.db.query(Macro).all()

        for m in macros:
            if m.command in self.bot.commands:
                self.bot.remove_command(m.command)

            func = self._make_macro(m)
            cmd = commands.Command(func, name=m.command)
            cmd.category = 'Custom'
            self.bot.add_command(cmd)

                # if commands cog is enabled, add macro to auto-enabled commands.
            if m.command not in self.bot.auto_enable:
                self.bot.auto_enable.append(m.command)

    async def _process_responses(self, message):
        '''Triggers a macro response if message containers trigger.'''

        logger.debug("processing responses")

        channel = message.channel
        message = message.content.lower()
        resp = []

        # check for trigger in message
        for trigger in self.responses:
            if trigger in message:
                resp = self.responses[trigger].split('\n')

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

        emojis = self.bot.emojis
        reactions = []

        for trigger in self.reactions:
            if trigger in message.content.lower():
                reactions = self.reactions[trigger].split('\n')

        if not reactions:
            return

        for react in reactions:
            for emoji in emojis:
                if react == emoji.name:
                    await message.add_reaction(emoji)

    async def update_macros(self):
        '''Update macro commands from database'''

        logger.debug("updating macros")

        macros = self.db.query(Macro).all()

        if macros:
            for macro in macros:
                # sqlalchemy seems to not refresh consistently. I think
                self.db.refresh(macro)
                if macro.modified_flag == 1:
                    macro.modified_flag = 0
                    self.db.commit()
                    await self._load_macro_commands(macro)

    async def remove_macro(self, macro_id):
        macro = self.db.query(Macro).filter_by(id=macro_id).one()

        macro_cmd = self.bot.get_command(macro.command)
        self.bot.remove_command(macro.command)
        self.db.query(Macro).filter_by(id=macro_id).delete()
        self.db.commit()


    async def update_responses(self):
        '''Add macro responses from database'''

        logger.debug("updating responses")

        self.responses.clear()
        responses = self.db.query(MacroResponse).all()

        if responses:
            for resp in responses:
                # sqlalchemy seems to not refresh consistently. I think
                self.db.refresh(resp)
                self.responses[resp.trigger] = resp.response


    async def update_reactions(self):
        '''Add macro reactions from database'''

        logger.debug("updating reactions")

        self.reactions = {}
        reactions = self.db.query(MacroReaction).all()
        if reactions:
            for r in reactions:
                # sqlalchemy seems to not refresh consistently
                self.db.refresh(r)
                self.reactions[r.trigger] = r.reaction.replace(':', '')


    async def handle(self, request):
        '''crappy rest API'''
        name = request.match_info.get('name', "Anonymous")
        if name == "update_macros":
            await self.update_macros()
        elif name == "update_responses":
            await self.update_responses()
        elif name == "update_reactions":
            await self.update_reactions()
        elif name== "remove_macro":
            await self.remove_macro(request.rel_url.query['id'])

        text = "Hello, " + name
        return web.Response(text=text)


def setup(bot):
    bot.add_cog(Macros(bot))
