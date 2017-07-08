from discord.ext import commands
from discord.ext.commands import guild_only
import discord
from cleo.utils import findUser

class Discord:

    def __init__(self, bot):
        """Commands related to discord and discord users"""

        self.bot = bot

    @guild_only()
    @commands.command(name="avatar")
    async def avatar(self, ctx, username:str=None):
        """: !avatar <username> | post a user's avatar."""

        if username is None:
            username = ctx.message.author.name

        user = await findUser(ctx, username)

        if user:
            avatar_url = user.avatar_url.split("?")[0]
            embed = discord.Embed(title="Avatar: " + user.display_name, url=None)
            embed.set_image(url=avatar_url)
            await ctx.message.channel.send(embed=embed)
        else:
            await ctx.message.channel.send("No Results Found.")

    @guild_only()
    @commands.command(name="uinfo")
    async def userInfo(self, ctx, username:str=None):
        """: !uinfo <username>  | Post a user's information."""

        channel = ctx.message.channel
        user = await findUser(ctx, username)

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
            for permission in ctx.message.channel.permissions_for(user):
                if permission[1]:
                    permissions.append(permission[0])
            permissions = ', '.join(permissions)

            embed = discord.Embed()
            embed.add_field(name="Username", value=user.name)
            embed.add_field(name="Display Name", value=str(user.display_name))
            embed.add_field(name="Join Date", value=joindate)
            if len(roles):
                embed.add_field(name="Roles", value=roles)
            embed.add_field(name="Permissions", value=permissions)

            await channel.send(embed=embed)
        else:
            await channel.send("No Results Found.")


def setup(bot):
    bot.add_cog(Discord(bot))
