import random
import logging
import re
import json
from aiohttp import web
from discord.ext import commands
from cleo.db import CustomCommand, CustomResponse, CustomReaction, new_alchemy_encoder

logger = logging.getLogger(__name__)


class ResponseData:
    '''Class for parsed Response data from database'''

    def __init__(self, response):
        self.id = response.id
        self.trigger = None
        self.responses = None
        self.useRegex = response.use_regex
        self.multiResponse = response.multi_response

        # trigger is regex expression if use_regex == True
        # otherwise a regular string
        if self.useRegex:
            self.trigger = re.compile(fr'{response.trigger}')
        else:
            self.trigger = response.trigger

        # split response in to lines if multi_response == True
        if self.multiResponse:
            self.responses = response.response.split('\n')
        else:
            self.responses = [response.response]


class ReactionData:
    '''Class for parsed Reaction data from database'''

    def __init__(self, reaction, custom_emojis):
        self.id = reaction.id
        self.trigger = None
        self.reactions = None
        self.useRegex = reaction.use_regex
        self.multiResponse = reaction.multi_response

        # trigger is regex expression if use_regex == True
        # otherwise a regular string
        if self.useRegex:
            self.trigger = re.compile(fr'{reaction.trigger}')
        else:
            self.trigger = reaction.trigger

        # split response in to lines if multi_response == True
        self.reactions = reaction.reaction.replace(':', '').split('\n')

        # check and replace custom emojis
        for i, r in enumerate(self.reactions):
            for e in custom_emojis:
                if r == e.name:
                    self.reactions[i] = e
                    break



class CustomCommands(commands.Cog):
    """Custom commands, responses, and reactions"""

    def __init__(self, bot):
        self.bot = bot
        self.db = self.bot.db

        self.responses = {}
        self.reactions = {}

        # Rest API routes.
        self.bot.api.private_routes['get_commands'] = self.api_get_commands
        self.bot.api.private_routes['add_command'] = self.api_add_command
        self.bot.api.private_routes['edit_command'] = self.api_edit_command
        self.bot.api.private_routes['remove_command'] = self.api_remove_command

        self.bot.api.private_routes['get_responses'] = self.api_get_responses
        self.bot.api.private_routes['add_response'] = self.api_add_response
        self.bot.api.private_routes['edit_response'] = self.api_edit_response
        self.bot.api.private_routes['remove_response'] = self.api_remove_response

        self.bot.api.private_routes['get_reactions'] = self.api_get_reactions
        self.bot.api.private_routes['add_reaction'] = self.api_add_reaction
        self.bot.api.private_routes['edit_reaction'] = self.api_edit_reaction
        self.bot.api.private_routes['remove_reaction'] = self.api_remove_reaction

    @commands.Cog.listener()
    async def on_ready(self):
        logger.debug("adding commands, responses, reactions")

        await self.update_commands()
        await self.update_responses()
        await self.update_reactions()

    @commands.Cog.listener()
    async def on_message(self, message):
        if message.author.id == self.bot.user.id:
            return

        await self._process_responses(message)
        await self._process_reactions(message)

    @staticmethod
    def _make_command(command):
        '''Returns a callback function
           for sending custom commands'''

        logger.debug(f"creating command: {command.command}")

        # callback function for custom commands
        async def _command(ctx):
            nonlocal command
            await ctx.channel.send(command.response)

        return _command


    async def _process_responses(self, message):
        '''Triggers a custom response if message containers trigger.'''

        logger.debug("processing responses")

        response = None
        channel = message.channel
        msg = message.content.lower()

        # check for trigger in message
        for _, r in self.responses.items():
            if r.useRegex:
                if r.trigger.search(msg):
                    response = r
                    break
            else:
                if r.trigger in msg:
                    response = r
                    break

        # check if there are multiple possible responses.
        if response:
            # return random response
            if response.multiResponse:
                    resp = random.choice(response.responses)
            # return full response
            else:
                resp = response.responses[0]

            await channel.send(resp)

    async def _process_reactions(self, message):
        '''Triggers an automatic discord reaction if message containers trigger'''

        logger.debug("processing reactions")

        reaction = None
        msg = message.content.lower()

        # check for trigger in message
        for _, r in self.reactions.items():
            if r.useRegex:
                if r.trigger.search(msg):
                    reaction = r
            else:
                if r.trigger in msg:
                    reaction = r
        if reaction:
            for react in reaction.reactions:
                try:
                    await message.add_reaction(react)
                except:
                    logger.error("EmojiError")

    async def update_commands(self, request=None):
        '''Update custom commands from database'''

        logger.debug("updating commands")

        # get command ID from update request if present.
        if request:
            command_name = request.rel_url.query['name']
            command_id = request.rel_url.query['id']
            print(command_name)
            cmds = self.db.query(CustomCommand).filter_by(id=command_id).all()
        else:
            cmds = self.db.query(CustomCommand).all()

        # if command not in the DB, but is in bot's list of commands, remove it.
        if not cmds:
            if command_name in [c.name for c in self.bot.commands]:
                self.bot.remove_command(command_name)
            return

        for c in cmds:
            # sqlalchemy seems to not refresh consistently.
            self.db.refresh(c)

            if c.command in [c.name for c in self.bot.commands]:
                self.bot.remove_command(c.command)

            # make command callback and add.
            func = self._make_command(c)
            cmd = commands.Command(func, name=c.command)
            cmd.category = 'Custom'
            self.bot.add_command(cmd)

            # if commands cog is enabled, add command to auto-enabled commands.
            if c.command not in self.bot.auto_enable:
                self.bot.auto_enable.append(c.command)


    async def remove_commands(self, command_id):
        command = self.db.query(CustomCommand).filter_by(id=command_id).one()
        self.bot.remove_command(command.command)
        self.db.query(CustomCommand).filter_by(id=command_id).delete()
        self.db.commit()


    async def update_responses(self, request=None):
        '''Add custom responses from database'''

        logger.debug("updating responses")

        # get command ID from update request if present.
        if request:
            response_id = int(request.rel_url.query['id'])
            responses = self.db.query(CustomResponse) \
                                .filter_by(id=response_id).all()
        else:
            responses = self.db.query(CustomResponse).all()

        # if response not in the DB, but is in bot's list of responses, remove it.
        if not responses:
            if response_id in self.responses.keys():
                del self.responses[response_id]
            return

        for r in responses:
            # sqlalchemy seems to not refresh consistently.
            self.db.refresh(r)
            response = ResponseData(r)
            self.responses[response.id] = response


    async def update_reactions(self, request=None):
        '''Add custom reactions from database'''

        logger.debug("updating reactions")

        if request:
            reaction_id = int(request.rel_url.query['id'])
            reactions = self.db.query(CustomReaction) \
                                .filter_by(id=reaction_id).all()
        else:
            reactions = self.db.query(CustomReaction).all()

        # if reaction not in the DB, but is in bot's list of reactions, remove it.
        if not reactions:
            if reaction_id in self.reactions.keys():
                del self.reactions[reaction_id]
            return

        for r in reactions:
            # sqlalchemy seems to not refresh consistently
            self.db.refresh(r)
            reaction = ReactionData(r, self.bot.emojis)
            self.reactions[reaction.id] = reaction


    ## API CALLBACKS ##


    # Commands

    async def api_get_commands(self, request):
        """API callback for getting Commands"""

        cmds = self.db.query(CustomCommand).all()
        cmds = json.dumps(cmds, cls=new_alchemy_encoder(False, []))
        return web.json_response(text=cmds)


    async def api_add_command(self, request):
        """API callback for adding a Command"""

        data = await request.json()
        command = CustomCommand(**data)

        logger.debug(f"{command.command}, {command.response}")

        self.db.add(command)
        self.db.commit()
        self.db.refresh(command)

        func = self._make_command(command)
        cmd = commands.Command(func, name=command.command)
        cmd.category = 'Custom'
        self.bot.add_command(cmd)

        # if commands cog is enabled, add command to auto-enabled commands.
        if command.command not in self.bot.auto_enable:
            self.bot.auto_enable.append(command.command)

        return web.Response(status=200)

    async def api_edit_command(self, request):
        """API callback for editing a Command"""

        data = await request.json()
        command_id = data.get('id', None)

        c = self.db.query(CustomCommand).filter_by(id=command_id).first()

        fields = ['command', 'response', 'description']
        for f in fields:
           setattr(c, f, data[f])

        self.db.commit()

        # remove command from the bot before readding it.
        if c.command in [c.name for c in self.bot.commands]:
            self.bot.remove_command(c.command)

        # make command callback and readd it.
        func = self._make_command(c)
        cmd = commands.Command(func, name=c.command)
        cmd.category = 'Custom'
        self.bot.add_command(cmd)

        # if commands cog is enabled, add command to auto-enabled commands.
        if c.command not in self.bot.auto_enable:
            self.bot.auto_enable.append(c.command)

        return web.Response(status=200)

    async def api_remove_command(self, request):
        """API callback for removing a Command"""

        data = await request.json()
        query = self.db.query(CustomCommand).filter_by(id=data['id'])
        cmd = query.first()

        # remove command from bot.
        if cmd.command in [c.name for c in self.bot.commands]:
            self.bot.remove_command(cmd.command)

        query.delete()
        self.db.commit()

        return web.Response(status=200)

    # Responses

    async def api_get_responses(self, request):
        """API callback for getting Responses"""

        responses = self.db.query(CustomResponse).all()
        responses = json.dumps(responses, cls=new_alchemy_encoder(False, []))
        return web.json_response(text=responses)

    async def api_add_response(self, request):
        """API callback for adding a Response"""

        data = await request.json()
        response = CustomResponse(**data)
        self.db.add(response)
        self.db.commit()
        self.db.refresh(response)

        r = ResponseData(response)
        self.responses[response.id] = r

        return web.Response(status=200)

    async def api_edit_response(self, request):
        """API callback for editing a Response"""

        data = await request.json()
        response = self.db.query(CustomResponse) \
                        .filter_by(id=data['id']).first()
        if not response:
            return web.Response(status=500)

        # replace response.f with data[f]
        fields = ['name', 'description', 'trigger',
                  'response', 'use_regex', 'multi_response']

        for f in fields:
           setattr(response, f, data[f])

        self.db.commit()
        self.db.refresh(response)

        r = ResponseData(response)
        self.responses[response.id] = r

        return web.Response(status=200)

    async def api_remove_response(self, request):
        """API callback for removing a Response"""

        data = await request.json()
        query = self.db.query(CustomResponse).filter_by(id=data['id'])
        response = query.first()

        # delete from response list and database.
        del self.responses[response.id]
        query.delete()
        self.db.commit()

        return web.Response(status=200)

    # Reactions

    async def api_get_reactions(self, request):
        """API callback for getting Reactions"""

        reactions = self.db.query(CustomReaction).all()
        reactions = json.dumps(reactions, cls=new_alchemy_encoder(False, []))
        return web.json_response(text=reactions)

    async def api_add_reaction(self, request):
        """API callback for adding a Reaction"""

        data = await request.json()
        reaction = CustomReaction(**data)
        self.db.add(reaction)
        self.db.commit()
        self.db.refresh(reaction)

        r = ReactionData(reaction, self.bot.emojis)
        self.reactions[reaction.id] = r

        return web.Response(status=200)

    async def api_edit_reaction(self, request):
        """API callback for editing a Reaction"""

        data = await request.json()
        reaction = self.db.query(CustomReaction).filter_by(id=data['id']).first()

        if not reaction:
            return web.Response(status=500)

        # replace reaction.f with data[f]
        fields = ['name', 'description', 'trigger', 'reaction', 'use_regex']
        for f in fields:
           setattr(reaction, f, data[f])

        self.db.commit()
        self.db.refresh(reaction)

        r = ReactionData(reaction, self.bot.emojis)
        self.reactions[reaction.id] = r

        return web.Response(status=200)

    async def api_remove_reaction(self, request):
        """API callback for removing a Reaction"""

        data = await request.json()
        query = self.db.query(CustomReaction).filter_by(id=data['id'])
        reaction = query.first()

        # delete from response list and database.
        del self.reactions[reaction.id]
        query.delete()
        self.db.commit()

        return web.Response(status=200)


def setup(bot):
    bot.add_cog(CustomCommands(bot))
