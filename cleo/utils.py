import logging
from discord import TextChannel
from discord.ext import commands
from cleo.db import Guild, Channel, User, GuildMembership, Role


logger = logging.getLogger(__name__)


async def findUser(ctx, arg:str):

    logger.debug(f"Looking for user: {arg}")

    name_list = [arg, arg.upper(),
                arg.lower(),
                arg.lower().capitalize()]

    # Try to get member from discord.py's member converter
    user = None
    memberconverter = commands.MemberConverter()
    for name in name_list:
        try:
            user = await memberconverter.convert(ctx, name)
            if user:
                return user
        except:
            logger.debug(f"User not found.")


async def add_user(self, user):
    logger.debug(f"Adding user: ({user.id}) {user.name}")
    new_user = User(user)
    self.db.add(new_user)
    self.db.commit()


async def add_missing_users(self):
    '''Adds users to the database.
       checks and adds all Users the bot can see.'''

    db_users = [u.id for u in self.db.query(User.id).all()]
    for u in self.users:
        if u.id not in db_users:
            logger.debug(f"Adding user: ({u.id}) {u.name}")
            new_user = User(u)
            self.db.add(new_user)

    self.db.commit()


async def add_guild(self, guild):
    self.db.add(Guild(guild))
    await add_missing_users(self)

    # channels
    for channel in guild.channels:
        if (isinstance(channel, TextChannel)):
            self.db.add(Channel(channel))
    # roles
    for role in guild.roles:
        self.db.add(Role(role))
        logger.debug((f"Adding Role for '{guild.name}': "
                      f"({role.id}) {role.name} - {role.color.value}"))

    # members
    for member in guild.members:
        new_member = GuildMembership(member)
        self.db.add(new_member)
        logger.debug((f"Adding Member for '{guild.name}': "
                      f"({member.id}) {member.name} - {member.display_name}"))

    self.db.commit()


async def add_channel(self, channel):
    new_channel = Channel(channel)
    self.db.add(new_channel)
    self.db.commit()


async def update_user(self, before, after):
    logger.debug(f"update user: {before.name}")

    member = self.db.query(GuildMembership) \
                            .filter_by(user_id=before.id) \
                            .one_or_none()

    if member and after:
        member.user.avatar_url = str(after.avatar_url)
        member.display_name = after.display_name

        self.db.commit()
        logger.debug((f"Member info updated.\n"
                      f"Before: {before.display_name}, {before.avatar_url}\n"
                      f"After: {after.display_name}, {after.avatar_url}"))


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


