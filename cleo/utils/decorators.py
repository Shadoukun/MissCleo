import logging
from discord.ext import commands

logger = logging.Logger(__name__)


def admin_only():
    '''Admin check decorator cog commands'''

    # TODO: role check
    async def predicate(ctx):
        logger.debug(f"checking if {ctx.author.name} is an admin")

        app_info = await ctx.bot.application_info()
        try:
            if (app_info.owner.id == ctx.author.id) \
                    or (ctx.author.id in ctx.bot.admins):
                return True
            else:
                return False
        except:
            return True

    return commands.check(predicate)
