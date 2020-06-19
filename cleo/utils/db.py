import logging
from discord import TextChannel

from ..db import User, Guild, Channel, Role, GuildMembership, Channel


logger = logging.Logger(__name__)


async def add_user(self, user):
    logger.debug(f"Adding user: ({user.id}) {user.name}")

    user_q = self.db.query(User.id).filter(User.id == user.id)
    member_q = self.db.query(GuildMembership.user_id).filter_by(user_id=user.id)

    if not self.db.query(user_q.exists()).scalar():
        new_user = User(user)
        self.db.add(new_user)

    if not self.db.query(member_q.exists()).scalar():
        new_member = GuildMembership(user)
        self.db.add(new_member)

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
        if isinstance(channel, TextChannel):
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


async def update_member(self, before, after):
    logger.debug(f"update user: {before.name}")

    member = self.db.query(GuildMembership) \
                    .filter_by(user_id=before.id) \
                    .filter_by(guild_id=before.guild.id) \
                    .one_or_none()

    if member and after:
        member.user.avatar_url = str(after.avatar_url_as(format=None, static_format="webp", size=512))
        member.display_name = after.display_name
        member.top_role_id = after.top_role.id
        member.roles = [str(r.id) for r in after.roles]

        self.db.commit()
        logger.debug((f"Member info updated.\n"
                      f"Before: {before.display_name}, {before.avatar_url}\n"
                      f"After: {after.display_name}, {after.avatar_url}"))


async def add_role(self, role):
    new_role = Role(role)
    self.db.add(new_role)
    self.db.commit()


async def delete_role(self, role):
    dbrole = self.db.query(Role).filter_by(id=role.id).delete()
    self.db.commit()


async def update_role(self, role):
    dbrole = self.db.query(Role).filter_by(id=role.id).one()

    dbrole.name = role.name
    dbrole.color = role.color.value
    dbrole.raw_permissions = role.permissions.value
    dbrole.position = role.position

    self.db.commit()

async def update_user(self, newuser):
    user = self.db.query(User).filter_by(id=newuser.id).one()

    user.name = newuser.name
    user.discriminator = newuser.discriminator
    user.avatar_url = newuser.avatar_url = str(newuser.avatar_url_as(format=None, static_format="webp", size=512))

    self.db.commit()
