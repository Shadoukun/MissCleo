import logging
from cleo.db import *
from difflib import get_close_matches
from discord.channel import TextChannel
from discord.ext import commands

logger = logging.getLogger(__name__)


async def findUser(ctx, arg:str):

    memberconverter = commands.MemberConverter()

    arg_caps = arg.upper()   # capitalized string
    arg_lower = arg.lower() # lowercase string
    arg_upper = arg.capitalize() if (not arg[0].isdigit() and not arg[0].isupper()) else arg # all uppercase string

    logger.debug(f"Looking for user: {arg}")

    # Try to get member from discord.py's member converter
    user = None

    for a in [arg_caps, arg_upper, arg_lower, arg]:
        try:
            user = await memberconverter.convert(ctx, a)
        except:
            logger.debug(f"User not found.")

    return user


async def update_database(self):
    '''Checks that all Guilds, Channels, and Users are in database.
       This only runs on startup. Adding guilds/channels/users is otherwise handled by events'''

    logger.info("Updating database")

    await self.wait_until_ready()

    guilds = [g.id for g in self.db.query(Guild).all()]
    channels = [c.id for c in self.db.query(Channel).all()]
    users = [u.id for u in self.db.query(User).all()]

    logger.debug("Updating guilds")
    for guild in self.guilds:
        if guild.id not in guilds:
            new_guild = Guild(guild)
            self.db.add(new_guild)

        logger.debug("Updating channels")
        # only updates text channels
        for channel in guild.channels:
            if (channel.id not in channels) and (isinstance(channel, TextChannel)):
                new_channel = Channel(channel)
                self.db.add(new_channel)

        logger.debug("Updating members.")
        for user in guild.members:
            if user.id not in users:
                new_user = User(user)
                self.db.add(new_user)

        self.db.commit()

async def update_user_info(self):
    '''update user avatar and display name info
       Only runs at bot startup. Otherwise this is handled
       by events'''

    members = sorted(self.get_all_members(), key=lambda x: x.id)
    users = sorted(self.db.query(User).filter(User.id.in_(x.id for x in members)).all(), key=lambda x: x.id)

    for u,m in zip(users, members):
        u.avatar_url = str(m.avatar_url)
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


async def add_user(db, member):
    logger.debug(f"Add user: {member.name}")

    user = db.query(User).filter_by(id=member.id)

    if not db.query(user.exists()):
        new_user = User(member)
        db.add(new_user)
        db.commit()


async def update_user(db, before, after):
    logger.debug(f"update user: {before.name}")

    user = db.query(User).filter_by(id=before.id).first()

    # print("BEFORE", before)
    # print ("AFTER", after)
    # print(db)
    # print(user)
    # print(str(after.avatar_url))
    # print(after.display_name)
    if user and after:
        user.avatar_url = str(after.avatar_url)
        user.display_name = after.display_name
        db.commit()

        logger.debug(f' Member info updated.\n Before: {before.display_name}, {before.avatar_url}\n After: {after.display_name}, {after.avatar_url}')

    else:
        # add new users if they arent the database for whatever reason. shouldn't ever be necessary.
        await add_user(db, after)
        logger.debug(f'{after.name} joined {after.guild.name}.')
