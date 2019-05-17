import io
import inspect
import logging
import traceback
import asyncio
from contextlib import redirect_stdout

import discord
from discord.ext import commands

from cleo.utils import findUser, admin_only
import cleo.db as db

NOTFOUND_MSG = "User not found."
ADDED_MSG = "Admin added: {0}"
REMOVED_MSG = "Admin removed: {0}"

logger = logging.getLogger(__name__)

class Admin(commands.Cog):
    """Bot admin commands"""

    def __init__(self, bot):
        self.bot = bot
        self.db = bot.db
        self.sessions = set()

    async def on_ready(self):
        try:
            self.bot.auto_enable.append('admin')
        except:
            logger.error("Commands cog not found")

        admins = self.db.query(db.Admin).all()
        self.bot.admins = [a.user_id for a in admins]

    def get_syntax_error(self, e):
        if e.text is None:
            return f'```py\n{e.__class__.__name__}: {e}\n```'
        return f'```py\n{e.text}{"^":>{e.offset}}\n{e.__class__.__name__}: {e}```'

    def cleanup_code(self, content):
        """Automatically removes code blocks from the code."""
        # remove ```py\n```
        if content.startswith('```') and content.endswith('```'):
            return '\n'.join(content.split('\n')[1:-1])

    @commands.command(name="find", hidden=False)
    async def find(self, ctx, *, arg:str):
        user = await findUser(ctx, arg)
        if user:
            await ctx.channel.send(f"{user.id}\n{user.name}\n{user.display_name}")
        else:
            await ctx.channel.send("Failed.")

    @commands.group(name='admin', hidden=True)
    async def admin(self, ctx):
        logger.debug("!admin command")
        if ctx.invoked_subcommand is None:
            pass

    @admin_only()
    @admin.command(name='add')
    async def add_admin(self, ctx, *, username:str):
        logger.debug("!admin add")

        user = await findUser(ctx, username)
        if not user:
            await ctx.channel.send(NOTFOUND_MSG)
            return

        if user.id in self.bot.admins:
            logger.debug("User already an admin")
            return

        new_admin = db.Admin(user.id)
        self.db.add(new_admin)
        self.bot.admins.append(user.id)
        self.db.commit()

        await ctx.channel.send(ADDED_MSG.format(user.display_name))

        logger.debug("admin added")

    @admin_only()
    @admin.command(name='remove')
    async def remove_admin(self, ctx, *, username:str):
        logger.debug("!admin remove")

        user = await findUser(ctx, username)
        if not user:
            await ctx.channel.send(NOTFOUND_MSG)
            return

        admins = self.db.query(db.Admin).all()
        for admin in admins:
            if admin.user_id == user.id:
                self.db.delete(admin)
                self.bot.admins.remove(user.id)
                self.db.commit()

                await ctx.channel.send(REMOVED_MSG.format(user.display_name))
                logging.debug("admin removed")

    # stolen form https://github.com/Rapptz/RoboDanny/
    @commands.command(name='repl')
    async def repl(self, ctx, *args, **kwargs):
        logger.debug("TEST")
        """Launches an interactive REPL session."""
        variables = {
            'ctx': ctx,
            'bot': self.bot,
            'message': ctx.message,
            'guild': ctx.guild,
            'channel': ctx.channel,
            'author': ctx.author,
            '_': None,
        }

        if ctx.channel.id in self.sessions:
            await ctx.send('Already running a REPL session in this channel. Exit it with `quit`.')
            return

        self.sessions.add(ctx.channel.id)
        await ctx.send('Enter code to execute or evaluate. `exit()` or `quit` to exit.')

        def check(m):
            return m.author.id == ctx.author.id and \
                m.channel.id == ctx.channel.id and \
                m.content.startswith('`')

        while True:
            try:
                response = await self.bot.wait_for('message', check=check, timeout=10.0 * 60.0)
            except asyncio.TimeoutError:
                await ctx.send('Exiting REPL session.')
                self.sessions.remove(ctx.channel.id)
                break

            cleaned = self.cleanup_code(response.content)

            if cleaned in ('quit', 'exit', 'exit()'):
                await ctx.send('Exiting.')
                self.sessions.remove(ctx.channel.id)
                return

            executor = exec
            if cleaned.count('\n') == 0:
                # single statement, potentially 'eval'
                try:
                    code = compile(cleaned, '<repl session>', 'eval')
                except SyntaxError:
                    pass
                else:
                    executor = eval

            if executor is exec:
                try:
                    code = compile(cleaned, '<repl session>', 'exec')
                except SyntaxError as e:
                    await ctx.channel.send(self.get_syntax_error(e))
                    continue

            variables['message'] = response

            fmt = None
            stdout = io.StringIO()

            try:
                with redirect_stdout(stdout):
                    result = executor(code, variables)
                    if inspect.isawaitable(result):
                        result = await result
            except Exception as e:
                value = stdout.getvalue()
                fmt = f'```py\n{value}{traceback.format_exc()}\n```'
            else:
                value = stdout.getvalue()
                if result is not None:
                    fmt = f'```py\n{value}{result}\n```'
                    variables['_'] = result
                elif value:
                    fmt = f'```py\n{value}\n```'

            try:
                if fmt is not None:
                    if len(fmt) > 2000:
                        await ctx.channel.send('Content too big to be printed.')
                    else:
                        await ctx.channel.send(fmt)
            except discord.Forbidden:
                pass
            except discord.HTTPException as e:
                await ctx.channel.send(f'Unexpected error: `{e}`')



def setup(bot):
    bot.add_cog(Admin(bot))
