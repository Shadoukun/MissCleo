import logging
from difflib import get_close_matches
from discord.channel import TextChannel
from discord.ext import commands
from sqlalchemy import func
from cleo.db import Guild, Channel, User, GuildMembership

logger = logging.getLogger(__name__)


async def findUser(ctx, arg:str):

    logger.debug(f"Looking for user: {arg}")

    memberconverter = commands.MemberConverter()
    name_list = [arg, arg.upper(), arg.lower(), arg.lower().capitalize()]

    # Try to get member from discord.py's member converter
    user = None
    for name in name_list:
        try:
            print(name)
            user = await memberconverter.convert(ctx, name)
            if user:
                return user
        except:
            logger.debug(f"User not found.")



async def add_users(bot, user=None):
    '''Adds users to the database.
    if user=None, checks and adds all Users the bot can see.'''

    users = [user] if user else bot.users
    db_users = [u.id for u in bot.db.query(User).all()]

    for u in users:
        if u.id not in db_users:
            logger.debug(f"Adding user: ({u.id}) {u.name}")
            new_user = User(u)
            bot.db.add(new_user)

    bot.db.commit()


async def update_database(self):
    '''Checks that all Guilds, Channels, and Users are in database.

       This only runs once on startup.
    '''

    await self.wait_until_ready()
    logger.info("Updating database")

    logger.debug("Updating users.")
    await add_users(self)

    guilds = [g.id for g in self.db.query(Guild).all()]
    channels = [c.id for c in self.db.query(Channel).all()]

    logger.debug("Updating guilds")
    # only updates text channels
    for guild in self.guilds:
        if guild.id not in guilds:
            new_guild = Guild(guild)
            self.db.add(new_guild)

        logger.debug(f"Updating channels for {guild.name}")
        for channel in guild.channels:
            if (channel.id not in channels) and (isinstance(channel, TextChannel)):
                new_channel = Channel(channel)
                self.db.add(new_channel)

        dbmembers = [g.user_id for g in self.db.query(GuildMembership).filter_by(guild_id=guild.id).all()]
        for member in guild.members:
            if member.id not in dbmembers:
                new_member = GuildMembership(member)
                self.db.add(new_member)

                logger.debug(f"Adding Member for '{guild.name}': ({member.id}) {member.name} - {member.display_name}")

    self.db.commit()


async def update_user_info(self):
    '''update user avatar and display name info
       Only runs at bot startup. Otherwise this is handled
       by events'''

    members = sorted(self.get_all_members(), key=lambda x: x.id)
    users = sorted(self.db.query(GuildMembership).filter(GuildMembership.user_id.in_(x.id for x in members)).all(), key=lambda x: x.user_id)

    for u,m in zip(users, members):
        u.user.avatar_url = str(m.avatar_url)
        u.display_name = m.display_name

    self.db.commit()


def admin_only():
    '''Admin check decorator cog commands'''

    # TODO: role check
    async def predicate(ctx):
        logger.debug(f"checking if {ctx.author.name} is an admin")
        app_info = await ctx.bot.application_info()
        try:
            if (app_info.owner.id == ctx.author.id) or (ctx.author.id in ctx.bot.admins):
                return True
            else:
                return False
        except:
            return True

    return commands.check(predicate)


async def update_user(self, before, after):
    logger.debug(f"update user: {before.name}")

    member = self.db.query(GuildMembership).filter_by(user_id=before.id).one_or_none()

    if member and after:
        member.user.avatar_url = str(after.avatar_url)
        member.display_name = after.display_name
        self.db.commit()
        logger.debug(f' Member info updated.\n Before: {before.display_name}, {before.avatar_url}\n After: {after.display_name}, {after.avatar_url}')
    else:
        # add new users if they arent the database for whatever reason.
        # shouldn't ever be necessary.
        await add_users(self, after)
        await add_members(self, after)
        logger.debug(f'{after.name} joined {after.guild.name}.')
