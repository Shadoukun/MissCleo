from discord import utils, Embed
from discord.ext import commands
import asyncio
from cleo.utils import admin_only

OPTIONS_MSG =  'Say a poll option *(Format: :smiley: optional text)*' + \
               '\n' + 'type {0}done to create the poll.'

TIME_MSG = 'How long should the poll last? (in minutes)'

POLL_MSG = '''
**Question**
{0}

**Results**
-
{1}
-
'''


class Poll:

    def __init__(self, question):
        self.question = question
        self.message = None

        # poll duration
        self.duration = 0

        # dict of possible answers
        self.answers = {}

        # users that have voted
        self.users = []

    def add_answer(self, message):
        msg = message.clean_content.split()
        emoji, text = msg[0], " ".join(msg[1:])

        self.answers[emoji] = {
            "text": f"{emoji} {text if text else ''}",
            "total": 0
        }

    @property
    def embed(self):
        results = []
        for a in self.answers.values():
            results.append(f"{a['text']}: {a['total']}")

        return Embed().from_dict({
            "title": "\n",
            "description": POLL_MSG.format(self.question, '\n-\n'.join(results))
        })


class Polls(commands.Cog):

    def __init__(self, bot):
        self.bot = bot
        self.active_polls = {}

    @commands.Cog.listener()
    async def on_reaction_add(self, reaction, user):

        # ignore bot reactions
        if user.bot:
            return

        if self.active_polls:
            poll = self.active_polls.get(reaction.message.id, None)

            if poll:
                # remove invalid reactions
                if reaction.emoji not in poll.answers:
                    await reaction.remove(user)

                # if user hasn't voted yet
                if user.id not in poll.users:
                    poll.users.append(user.id)
                    poll.answers[reaction.emoji]['total'] += 1

                    # edit poll message to update results
                    await reaction.message.edit(embed=poll.embed)

                # reset poll reaction afterwards.
                await reaction.remove(user)

    @commands.guild_only()
    @admin_only()
    @commands.command(name="poll")
    async def poll(self, ctx, *, question):

        poll = Poll(question)

        # poll creation messages to be deleted after creation.
        messages = [ctx.message]

        # creator check
        def check(m):
            return m.author == ctx.author \
                and m.channel == ctx.channel \
                and len(m.content) <= 100

        # poll duration prompt
        messages.append(await ctx.send(TIME_MSG))
        try:
            poll_time = await self.bot.wait_for('message', check=check, timeout=60.0)
            poll_time = int(poll_time.clean_content)
            messages.append(poll_time)
        except:
            await ctx.send("Error.")
            return

        # poll options prompt
        for i in range(20):
            messages.append(await ctx.send(OPTIONS_MSG.format(ctx.prefix)))

            try:
                option_msg = await self.bot.wait_for('message', check=check, timeout=60.0)
                messages.append(option_msg)
            except asyncio.TimeoutError:
                break

            if option_msg.clean_content.startswith(f'{ctx.prefix}done'):
                break

            poll.add_answer(option_msg)

        # try to delete creation messages.
        try:
            await ctx.channel.delete_messages(messages)
        except:
            pass

        # create poll message and add reaction buttons
        poll.message = await ctx.send(embed=poll.embed)

        for answer in poll.answers:
            await poll.message.add_reaction(answer)

        # add poll to list of active polls
        self.active_polls[poll.message.id] = poll

        # wait duration of poll_timer before deleting the poll from self.active_polls
        await asyncio.sleep(poll_time * 60)
        await ctx.send("The poll has finished.")
        await ctx.send(embed=poll.embed)
        del self.active_polls[poll.message.id]


def setup(bot):
    bot.add_cog(Polls(bot))
