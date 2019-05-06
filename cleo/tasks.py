import logging
from discord.channel import TextChannel
from cleo.db import Guild, Channel, GuildMembership, Role
from cleo.utils import add_missing_users

logger = logging.getLogger(__name__)


async def update_guilds(self):

    await self.wait_until_ready()

    logger.debug("Updating guilds")

    db_guilds = [g.id for g in self.db.query(Guild.id).all()]
    db_channels = [c.id for c in self.db.query(Channel.id).all()]

    await add_missing_users(self)

    for guild in self.guilds:
        db_members = [g.user_id for g in self.db.query(GuildMembership.user_id)
                                         .filter_by(guild_id=guild.id).all()]
        db_roles = [r.id for r in self.db.query(Role.id)
                                         .filter_by(guild_id=guild.id).all()]
        # guilds
        if guild.id not in db_guilds:
            self.db.add(Guild(guild))

        # channels
        for channel in guild.channels:
            if (isinstance(channel, TextChannel)) and (channel.id not in db_channels):
                self.db.add(Channel(channel))

        # roles
        for role in guild.roles:
            if role.id not in db_roles:
                self.db.add(Role(role))
                logger.debug((f"Adding Role for '{guild.name}': "
                              f"({role.id}) {role.name} - {role.color.value}"))

        # members
        for member in guild.members:
            if member.id not in db_members:
                new_member = GuildMembership(member)
                self.db.add(new_member)
                logger.debug((f"Adding Member for '{guild.name}': "
                              f"({member.id}) {member.name} - {member.display_name}"))

    self.db.commit()


async def update_user_info(self):
    '''update user avatar and display name info
       Only runs at bot startup. Otherwise this is handled
       by events'''

    await self.wait_until_ready()
    logger.debug("Updating user info")

    members = sorted(self.get_all_members(), key=lambda x: x.id)
    users = sorted(self.db.query(GuildMembership)
                          .filter(GuildMembership.user_id.in_(x.id for x in members))
                          .join(GuildMembership.user)
                          .all(), key=lambda x: x.user_id)

    for u, m in zip(users, members):
        logger.debug(f"{m.avatar_url} {m.name}")
        u.user.avatar_url = str(m.avatar_url) if m.avatar_url else ""
        u.display_name = m.display_name
        u.top_role_id = m.top_role.id if m.top_role else 0

    self.db.commit()
    logger.debug("updated user info")
