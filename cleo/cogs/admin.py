import discord
import logging
from discord.ext import commands
from cleo.utils import findUser, is_admin
import cleo.db as db

NOTFOUND_MSG = "User not found."
ADDED_MSG = "Admin added: {0}"
REMOVED_MSG = "Admin removed: {0}"

logger = logging.getLogger(__name__)

class Admin:
    """Bot admin commands"""

    def __init__(self, bot):
        self.bot = bot
        self.db = bot.db

    async def on_ready(self):
        try:
            self.bot.auto_enable.append('admin')
        except:
            logger.error("Commands cog not found")
            pass

        await self.get_admins()


    @commands.group(name='admin', hidden=True)
    async def admin(self, ctx):
        logger.debug("!admin command")
        if ctx.invoked_subcommand is None:
            pass

    @is_admin()
    @admin.command(name='add')
    async def add_admin(self, ctx, *, username:str):
        logger.debug("!admin add")

        user = await findUser(ctx, username)

        if not user:
            await ctx.channel.send(NOTFOUND_MSG)
            return

        admins = self.db.query(db.Admin)
        if user.id in self.bot.admins:
            logger.debug("User already an admin")
            return

        new_admin = db.Admin(user.id)
        self.db.add(new_admin)
        self.db.commit()

        self.bot.admins.append(user.id)
        await ctx.channel.send(ADDED_MSG.format(user.display_name))
        logger.debug("admin added")


    @is_admin()
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
                self.db.commit()
                self.bot.admins.remove(user.id)

                await ctx.channel.send(REMOVED_MSG.format(user.display_name))
                logging.debug("admin removed")

    async def get_admins(self):
        logger.debug("getting list of admins")

        try:
            return self.bot.admins

        except AttributeError:
            admins = self.db.query(db.Admin).all()
            self.bot.admins = [a.user_id for a in admins]

        logger.debug(self.bot.admins)


def setup(bot):
    bot.add_cog(Admin(bot))
