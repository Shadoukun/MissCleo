import logging
from cleo.db import *
from difflib import get_close_matches
from discord.ext import commands

logger = logging.getLogger(__name__)


async def findUser(ctx, username: str):
    '''Tries to find user with discord MemberConverter or
       Fuzzy searches userlist to find user specified

       returns User object, or None'''

    logger.debug(f"Looking for user: {username}")

    username = username.lower()
    memberconverter = commands.MemberConverter()

    # Try to get member from discord.py's member converter
    try:
        user = await memberconverter.convert(ctx, username)
        if user:
            logger.debug(f"User found: {user.name}")
            return user

    except:
        logger.debug('User not found with MemberConverter')

    logger.debug("Trying fuzzy username match")
   
    users = ctx.guild.members
    names = (u.name.lower() for u in users)
    displaynames = (u.display_name.lower() for u in users)

    name_search = get_close_matches(username, names, 1, cutoff=0.8)
    dname_search = get_close_matches(username, displaynames, 1, cutoff=0.8)

    logger.debug(f"NAME: {name_search[0]}")    
    logger.debug(f"DISPLAY NAME: {dname_search[0]}")    

    for user in users:
        display_name = user.display_name.lower()
        username = user.name.lower()

        if display_name == dname_search[0]:
            logger.debug(f"User found: {user.name}")
            return user
            
        elif username == name_search[0]:
            logger.debug(f"User found: {user.name}")
            return user            

    logger.debug("User not found")
    return None

async def update_database(self):
    '''add missing guilds/channels/users to database
        Only runs at bot startup. Otherwise this is handled
        by events'''

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
        for channel in guild.channels:
            if channel.id not in channels:
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

    await self.wait_until_ready()
    users = [u for u in self.db.query(User).all()]

    for member in self.get_all_members():
        for user in users:
            if member.id == user.id:
                user.avatar_url = member.avatar_url
                user.display_name = member.display_name

    self.db.commit()

def is_admin():
    '''Admin check for cog commands'''

    async def predicate(ctx):
        logger.debug(f"checking if {ctx.author.name} is an admin")

        app_info = await ctx.bot.application_info()
        if app_info.owner.id == ctx.author.id:
            return True

        # in a try incase the admin plugin isnt loaded.
        try:
            if ctx.author.id in ctx.bot.admins:
                return True
        except:
            logger.debug("Admin cog not found.")

        return False

    return commands.check(predicate)


def add_user(db, member):
    logger.debug(f"add user: {member.name}")

    user = db.query(User).filter_by(id=member.id)

    if not db.query(user.exists()):
        new_user = User(member)
        db.add(new_user)
        db.commit()



def update_user(db, before, after):
    logger.debug(f"update user: {after.name}")

    logger.debug(before)

    user = db.query(User).filter_by(id=before.id).first()


    if user and after:
        user = user

        user.avatar_url = after.avatar_url
        user.display_name = after.display_name
        db.commit()

        logger.debug("Member info updated.")
        logger.debug(f'Before: {before.display_name}, {before.avatar_url}')
        logger.debug(f'After: {after.display_name}, {after.avatar_url}')

    else:
        # on_user_update is called when a member joins the first time.
        # so add new users if they arent the database.
        new_user = User(before)
        db.add(new_user)
        db.commit()

        logger.debug(f'{after.name} joined {after.guild.name}.')
