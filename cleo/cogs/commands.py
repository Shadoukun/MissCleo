import random
import logging
import re
import json
from aiohttp import web
import datetime
from discord.ext import commands
from discord.ext.commands.errors import CommandOnCooldown
from discord.ext.commands.cooldowns import Cooldown, CooldownMapping, BucketType
from sqlalchemy import func
from cleo.db import CustomCommand, CustomResponse, CustomReaction, new_alchemy_encoder

logger = logging.getLogger(__name__)



class ResponseData:
    """Class for parsed Response data from database"""

    def __init__(self, response):
        self._response = response
        self.id = response.id
        self.trigger = None
        self.responses = None
        self.useRegex = response.use_regex
        self.multiResponse = response.multi_response

        self.cooldown = False
        self.cooldown_rate = 0
        self.cooldown_per = 0
        self.cooldown_bucket = 0
        self._buckets = None

        self.process_trigger()
        self.process_response()
        self.process_cooldown()

    def process_trigger(self):
        # trigger is regex expression if use_regex == True
        # otherwise a regular string
        if self.useRegex:
            self.trigger = re.compile(fr'{self._response.trigger}')
        else:
            self.trigger = self._response.trigger

    def process_response(self):
        # split response in to lines if multi_response == True
        if self.multiResponse:
            self.responses = self._response.response.split('\n')
        else:
            self.responses = [self._response.response]

    def process_cooldown(self):
        self.cooldown = self._response.cooldown
        if self.cooldown:
            self.cooldown_rate = self._response.cooldown_rate
            self.cooldown_per = self._response.cooldown_per
            self.cooldown_bucket = self._response.cooldown_bucket

            cooldown_vars = [self.cooldown_rate, self.cooldown_per, BucketType(self.cooldown_bucket)]
            self._buckets = CooldownMapping(Cooldown(*cooldown_vars))


    def prepare_cooldowns(self, message):
        # Skip if cooldown is false
        if not self.cooldown:
            return

        if self._buckets.valid:
            current = message.created_at.timestamp()
            bucket = self._buckets.get_bucket(message, current)
            retry_after = bucket.update_rate_limit(current)
            if retry_after:
                raise Exception


class ReactionData:
    """Class for parsed Reaction data from database"""

    def __init__(self, reaction, custom_emojis):
        self._reaction = reaction
        self.id = reaction.id
        self.trigger = None
        self.reactions = None
        self.useRegex = reaction.use_regex
        self.multiResponse = reaction.multi_response

        self.cooldown = False
        self.cooldown_rate = 0
        self.cooldown_per = 0
        self.cooldown_bucket = 0
        self._buckets = None

        self.process_trigger()
        self.process_responses()
        self.process_cooldown()
        self.process_custom_emojis(custom_emojis)

    def process_trigger(self):
        # trigger is regex expression if use_regex == True
        # otherwise a regular string
        if self.useRegex:
            self.trigger = re.compile(fr'{self._reaction.trigger}')
        else:
            self.trigger = self._reaction.trigger

    def process_responses(self):
        # split response in to lines if multi_response == True
        self.reactions = self._reaction.reaction.replace(':', '').split('\n')

    def process_custom_emojis(self, custom_emojis):
        """check and set custom emojis in list of reactions to correct emoji type."""
        for i, react in enumerate(self.reactions):
            for emoji in custom_emojis:
                if react == emoji.name:
                    self.reactions[i] = emoji
                    break

    def process_cooldown(self):
        self.cooldown = self._reaction.cooldown

        if self.cooldown:
            self.cooldown_rate = self._reaction.cooldown_rate
            self.cooldown_per = self._reaction.cooldown_per
            self.cooldown_bucket = self._reaction.cooldown_bucket

            cooldown_vars = [self.cooldown_rate, self.cooldown_per, BucketType(self.cooldown_bucket)]
            self._buckets = CooldownMapping(Cooldown(*cooldown_vars))

    def prepare_cooldowns(self, message):
        # Skip if cooldown is false
        if not self.cooldown:
            return

        if self._buckets.valid:
            current = message.created_at.timestamp()
            bucket = self._buckets.get_bucket(message, current)
            retry_after = bucket.update_rate_limit(current)
            if retry_after:
                raise Exception


class CustomCommands(commands.Cog):
    """Custom commands, responses, and reactions"""

    def __init__(self, bot):
        self.bot = bot
        self.db = self.bot.db

        self.responses = {}
        self.reactions = {}
        self.add_api_routes()

    def add_api_routes(self):
        """
        Add command/reaction/response routes to REST API

        Routes are added here as callbacks so that API can update the bot.
        """

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

        await self.add_custom_commands()
        await self.add_custom_responses()
        await self.add_custom_reactions()

    @commands.Cog.listener()
    async def on_message(self, message):
        if message.author.id == self.bot.user.id:
            return

        await self.process_responses(message)
        await self.process_reactions(message)

    @staticmethod
    async def make_command(command):
        """
        Accepts a command from database and returns
        a callback for sending discord message.
        """
        logger.debug(f"creating command: {command.command}")

        # callback function for custom commands
        async def _command(ctx):
            nonlocal command
            await ctx.channel.send(command.response)

        cmd = commands.Command(_command, name=command.command)
        cmd.category = 'Custom'

        # create cooldown to command if there is one.
        if command.cooldown:
            rate = command.cooldown_rate
            per = command.cooldown_per
            bucket = command.cooldown_bucket
            cmd._buckets = commands.CooldownMapping(Cooldown(rate, per, BucketType(bucket)))

        return cmd


    async def process_responses(self, message):
        """
        Check message for triggers from self.responses.
        Adds responses if found.
        """
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

            # Check/Set cooldowns. pass if on cooldown
            # I have no idea how this works.
            try:
                response.prepare_cooldowns(message)
            except:
                logger.debug("RESPONSE ON COOLDOWN")
                return

            # return random response
            if response.multiResponse:
                resp = random.choice(response.responses)
            # return full response
            else:
                resp = response.responses[0]

            await channel.send(resp)

    async def process_reactions(self, message):
        """
        Check message for triggers from self.reactions.
        Add all matching reactions to message.
        """
        logger.debug("processing reactions")

        matched = []
        msg = message.content.lower()

        # check for trigger. in message.
        # append to list of matching reactions
        for _, r in self.reactions.items():
            if r.useRegex:
                if r.trigger.search(msg):
                    matched.append(r)
            else:
                if r.trigger in msg:
                    matched.append(r)

        # Iterate and add matching reactions to message.
        if matched:
            # list of matching entries
            for m in matched:
                # Check/Set cooldown. pass if on cooldown
                # I have no idea how this works.
                try:
                    m.prepare_cooldowns(message)
                except:
                    logger.debug("REACTION ON COOLDOWN")
                    continue

                # iterate each reaction for entry.
                for react in m.reactions:
                    try:
                        await message.add_reaction(react)
                    except:
                        logger.error("EmojiError")


    async def add_custom_commands(self):
        """Adds custom commands from the database to the bot"""

        cmds = self.db.query(CustomCommand).all()
        for c in cmds:
            # check if a command already exists before trying to re-add it.
            if c.command in [c.name for c in self.bot.commands]:
                self.bot.remove_command(c.command)

            cmd = await self.make_command(c)
            self.bot.add_command(cmd)

            # if commands cog is enabled, add command to auto-enabled commands.
            if c.command not in self.bot.auto_enable:
                self.bot.auto_enable.append(c.command)


    async def add_custom_responses(self):
        """Adds custom responses from the database to the bot"""

        responses = self.db.query(CustomResponse).all()
        for r in responses:
            # sqlalchemy seems to not refresh consistently.
            self.db.refresh(r)
            response = ResponseData(r)
            self.responses[response.id] = response


    async def add_custom_reactions(self):
        """Adds custom reactions to the bot"""

        reactions = self.db.query(CustomReaction).all()
        for r in reactions:
            # sqlalchemy seems to not refresh consistently
            self.db.refresh(r)
            reaction = ReactionData(r, self.bot.emojis)
            self.reactions[reaction.id] = reaction


    ## API CALLBACKS ##


    # Commands

    async def api_get_commands(self, request):
        """API callback for getting Commands"""

        logger.debug("api_get_commands")

        cmds = self.db.query(CustomCommand) \
                        .order_by(func.lower(CustomCommand.command)) \
                        .all()

        cmds = json.dumps(cmds, cls=new_alchemy_encoder(False, []))
        return web.json_response(text=cmds)


    async def api_add_command(self, request):
        """API callback for adding a Command"""

        logger.debug("api_add_commands")

        data = await request.json()

        # lol command uses a different variable
        # and I'm not changing it right now.
        data['command'] = data['trigger']

        command = CustomCommand(**data)

        logger.debug(f"{command.command}, {command.response}")
        self.db.add(command)
        self.db.commit()
        self.db.refresh(command)

        cmd = await self.make_command(command)
        self.bot.add_command(cmd)

        # if commands cog is enabled, add command to auto-enabled commands.
        if command.command not in self.bot.auto_enable:
            self.bot.auto_enable.append(command.command)

        return web.Response(status=200)

    async def api_edit_command(self, request):
        """API callback for editing a Command"""

        logger.debug("api_edit_commands")

        data = await request.json()
        command_id = data.get('id', None)

        c = self.db.query(CustomCommand).filter_by(id=command_id).first()

        # replace command.f with data[f]
        data['command'] = data['trigger']

        fields = [
            'command',
            'response',
            'description',
            'cooldown',
            'cooldown_rate',
            'cooldown_per',
            'cooldown_bucket',
            'cooldown_multiplier'
            ]

        for f in fields:
           setattr(c, f, data[f])

        self.db.commit()

        # remove command from the bot before re-adding it.
        if c.command in [c.name for c in self.bot.commands]:
            self.bot.remove_command(c.command)

        # make command and readd it.
        cmd = await self.make_command(c)
        self.bot.add_command(cmd)

        # if commands cog is enabled, add command to auto-enabled commands.
        if c.command not in self.bot.auto_enable:
            self.bot.auto_enable.append(c.command)

        return web.Response(status=200)

    async def api_remove_command(self, request):
        """API callback for removing a Command"""

        logger.debug("api_remove_commands")

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

        logger.debug("api_get_response")

        responses = self.db.query(CustomResponse) \
            .order_by(func.lower(CustomResponse.trigger)) \
            .order_by(func.lower(CustomResponse.name)).all()

        responses = json.dumps(responses, cls=new_alchemy_encoder(False, []))
        return web.json_response(text=responses)

    async def api_add_response(self, request):
        """API callback for adding a Response"""

        logger.debug("api_add_response")

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

        logger.debug("api_edit_response")

        data = await request.json()
        response = self.db.query(CustomResponse) \
                        .filter_by(id=data['id']).first()
        if not response:
            return web.Response(status=500)

        # replace response.f with data[f]
        fields = [
            'name',
            'description',
            'trigger',
            'response',
            'use_regex',
            'multi_response',
            'cooldown',
            'cooldown_rate',
            'cooldown_per',
            'cooldown_bucket',
            'cooldown_multiplier'
            ]

        for f in fields:
           setattr(response, f, data[f])

        self.db.commit()
        self.db.refresh(response)

        r = ResponseData(response)
        self.responses[response.id] = r

        return web.Response(status=200)

    async def api_remove_response(self, request):
        """API callback for removing a Response"""

        logger.debug("api_remove_response")

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

        logger.debug("api_get_reactions")

        reactions = self.db.query(CustomReaction) \
            .order_by(func.lower(CustomReaction.trigger)) \
            .order_by(func.lower(CustomReaction.name)).all()

        reactions = json.dumps(reactions, cls=new_alchemy_encoder(False, []))
        return web.json_response(text=reactions)

    async def api_add_reaction(self, request):
        """API callback for adding a Reaction"""

        logger.debug("api_add_reactions")

        data = await request.json()

        # lol reactions uses a different variable
        # and I'm not changing it right now.
        data['reaction'] = data['response']

        reaction = CustomReaction(**data)
        self.db.add(reaction)
        self.db.commit()
        self.db.refresh(reaction)

        r = ReactionData(reaction, self.bot.emojis)
        self.reactions[reaction.id] = r

        return web.Response(status=200)

    async def api_edit_reaction(self, request):
        """API callback for editing a Reaction"""

        logger.debug("api_edit_reactions")

        data = await request.json()
        reaction = self.db.query(CustomReaction).filter_by(id=data['id']).first()

        if not reaction:
            return web.Response(status=500)

        # replace reaction.f with data[f]
        data['reaction'] = data['response']

        fields = [
            'name',
            'description',
            'trigger',
            'reaction',
            'use_regex',
            'cooldown',
            'cooldown_rate',
            'cooldown_per',
            'cooldown_bucket',
            'cooldown_multiplier'
            ]

        for f in fields:
           setattr(reaction, f, data[f])

        self.db.commit()
        self.db.refresh(reaction)

        r = ReactionData(reaction, self.bot.emojis)
        self.reactions[reaction.id] = r

        return web.Response(status=200)

    async def api_remove_reaction(self, request):
        """API callback for removing a Reaction"""

        logger.debug("api_remove_reactions")

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
