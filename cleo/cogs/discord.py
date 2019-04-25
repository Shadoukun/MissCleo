import logging
from discord import Embed
from discord.ext import commands
from discord.ext.commands import guild_only

from cleo.utils import findUser


logger = logging.getLogger(__name__)

class Discord(commands.Cog):

    def __init__(self, bot):
        """Commands related to discord and discord users"""

        self.bot = bot

    @guild_only()
    @commands.command(name="avatar")
    async def avatar(self, ctx, username:str=None):

        if username is None:
            user = ctx.message.author
        else:
            user = await findUser(ctx, username)

        if user:
            embed = Embed().from_dict({
                "title": f"Avatar:  {user.display_name}",
                "image": {"url": user.avatar_url.split("?")[0]}
            })
            await ctx.message.channel.send(embed=embed)
        else:
            await ctx.message.channel.send("No Results Found.")

    @guild_only()
    @commands.command(name="uinfo", brief="!uinfo <username>    | Post a user's information.")
    async def userInfo(self, ctx, username: str = None, ):

        if username:
            user = await findUser(ctx, username)
        else:
            user = ctx.message.author

        if user:
            joindate = str(user.joined_at).split(' ', 1)[0]

            roles = []
            # Only add 'Roles' field if there are roles
            if len(user.roles) > 1:
                for role in user.roles:
                    if 'everyone' not in role.name:
                        roles.append(role.name)
                roles = ', '.join(roles)

            # get permissions
            permissions = []
            for permission in ctx.channel.permissions_for(user):
                if permission[1]:
                    permissions.append(permission[0])
            permissions = ', '.join(permissions)

            logger.debug(f"Name:{user.display_name}\nUsername:{user.name}\nJoin:{joindate}\nRoles:{roles}\nPermissions:{permissions}")
            embed = Embed().from_dict({
                "title": "\n",
                "thumbnail": {"url": str(user.avatar_url)},
                "fields": [
                    {"name": "Username", "value": user.name},
                    {"name": "Nickname", "value": user.display_name},
                    {"name": "Join Date", "value": joindate},
                    {"name": "Roles", "value": roles if roles else "\u200b"},
                    {"name": "Permissions", "value": permissions}
                ]
            })

            await ctx.channel.send(embed=embed)
        else:
            await ctx.channel.send("No Results Found.")


def setup(bot):
    bot.add_cog(Discord(bot))
