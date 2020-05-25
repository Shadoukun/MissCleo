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


def setup(bot):
    bot.add_cog(Admin(bot))
