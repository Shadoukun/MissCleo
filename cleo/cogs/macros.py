import discord
from discord.ext import commands
import random
from cleo.db import Macro, MacroReaction, MacroResponse
import asyncio

class Macros:
    """Macro commands, responses, and reactions"""

    def __init__(self, bot):
        self.bot = bot
        self.db = self.bot.db
        self.responses = {}
        self.reactions = {}

    async def on_ready(self):
        await self._load_macro_commands()
        self.bot.loop.create_task(self.update_macros_task())
        self.bot.loop.create_task(self.add_responses_task())
        self.bot.loop.create_task(self.add_reactions_task())

    async def on_message(self, message):
        await self._process_responses(message)
        await self._process_reactions(message)


    def _make_macro(self, macro):
        '''Returns a generic send_message callback function
           for command macros'''

        # callback function for regular macros
        async def _macro(ctx):
            nonlocal macro
            await ctx.channel.send(macro.response)


        # callback function for macros with multiple responses.
        # Chooses a response at random.
        async def _multimacro(ctx):
            nonlocal macro
            randresponse = [r.rstrip() for r in macro.response.split('\n')]
            random.shuffle(randresponse)
            randresponse = randresponse[0]
            await ctx.channel.send(randresponse)

        if '\n' in macro.response:
            return _multimacro
        else:
            return _macro

    async def _load_macro_commands(self, macro=None):
        '''Load/Reload macro commands from database
           takes single macro to reload as optional arg'''

        if macro is not None:
            macros = [macro]
        else:
            macros = self.db.query(Macro).all()

        if len(macros) < 1:
            return

        for m in macros:
            if m.command in self.bot.commands:
                self.bot.remove_command(m.command)

            func = self._make_macro(m)
            cmd = commands.Command(name=m.command, callback=func, pass_context=True, no_pm=True)
            self.bot.add_command(cmd)

    async def _process_responses(self, message):
        '''Triggers a macro response if message containers trigger.'''
        channel = message.channel
        message = str(message.content)

        # check for trigger in message
        for trigger in self.responses:
            if trigger in message.lower():
                resp = self.responses[trigger].split('\n')

                # check if there are multiple possible responses
                if len(resp) > 1:
                    resp = random.choice(resp)
                else:
                    resp = resp[0]

                await channel.send(resp)
                return

    async def _process_reactions(self, message):
        '''Triggers an automatic discord reaction if message containers trigger'''

        message = message.content.lower()
        emojis = self.bot.get_all_emojis()

        for trigger in self.reactions:
            if trigger in message:
                reactions = self.reactions[trigger].split('\n')
                for react in reactions:
                    for emoji in emojis:
                        if react == emoji.name:
                            await message.add_reaction(emoji)


    ### Background Tasks ###


    async def update_macros_task(self):
        '''Update macro commands from database'''
        await self.bot.wait_until_ready()

        while not self.bot.is_closed:

            macros = self.db.query(Macro).all()
            if macros:
                for macro in macros:
                    # sqlalchemy seems to not refresh consistently
                    self.db.refresh(macro)
                    if macro.modified_flag == 1:
                        macro.modified_flag = 0
                        self.db.commit()
                        await self._load_macro_commands(macro)

            # Runs every 20 seconds.
            await asyncio.sleep(20)

    async def add_responses_task(self):
        '''Add macro responses from database'''
        await self.bot.wait_until_ready()

        while not self.bot.is_closed:

            self.responses.clear()
            responses = self.db.query(MacroResponse).all()
            if responses:
                for resp in responses:
                    # sqlalchemy seems to not refresh consistently
                    self.db.refresh(resp)
                    self.responses[resp.trigger] = resp.response

            # Runs every 20 seconds.
            await asyncio.sleep(20)

    async def add_reactions_task(self):
        '''Add macro reactions from database'''
        await self.bot.wait_until_ready()

        while not self.bot.is_closed:

            self.reactions = {}
            reactions = self.db.query(MacroReaction).all()
            if reactions:
                for r in reactions:
                    # sqlalchemy seems to not refresh consistently
                    self.db.refresh(r)
                    self.reactions[r.trigger] = r.reaction.replace(':', '')

            # Runs every 20 seconds.
            await asyncio.sleep(20)


def setup(bot):
    bot.add_cog(Macros(bot))
