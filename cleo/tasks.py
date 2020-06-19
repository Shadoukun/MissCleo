import logging
from discord.channel import TextChannel
from cleo.db import Guild, Channel, GuildMembership, Role
from cleo.utils import add_missing_users

logger = logging.getLogger(__name__)


async def add_update_all_guilds(self):

    existing_guilds = [g for g in self.db.query(Guild).all()]
    existing_channels = [c.id for c in self.db.query(Channel.id).all()]

    await self.wait_until_ready()

    await add_missing_users(self)

    async for guild in self.fetch_guilds():
        existing_members = [m.user_id for m in self.db.query(GuildMembership.user_id)
                            .filter_by(guild_id=guild.id).all()]
        existing_roles = [r.id for r in self.db.query(Role.id)
                                         .filter_by(guild_id=guild.id).all()]

        if guild.id not in [g.id for g in existing_guilds]:
            self.db.add(Guild(guild))
        else:
            g = next(x for x in existing_guilds if x.id == guild.id)
            g.name = guild.name
            g.icon_url = str(guild.icon_url_as(format=None, static_format="webp", size=512))

        channels = await guild.fetch_channels()
        for channel in channels:
            if (isinstance(channel, TextChannel)) and (channel.id not in existing_channels):
                self.db.add(Channel(channel))

        roles = await guild.fetch_roles()
        for role in roles:
            if role.id not in existing_roles:
                self.db.add(Role(role))
                logger.debug((f"Adding Role for '{guild.name}': "
                              f"({role.id}) {role.name} - {role.color.value}"))

        async for member in guild.fetch_members():
            if member.id not in existing_members:
                new_member = GuildMembership(member)
                self.db.add(new_member)
                logger.debug((f"Adding Member for '{guild.name}': "
                              f"({member.id}) {member.name} - {member.display_name}"))

    self.db.commit()

    await update_all_guild_members(self)


async def update_all_guild_members(self):

    await self.wait_until_ready()
    def _update():
        for guild in self.guilds:
            members = self.db.query(GuildMembership).filter_by(guild_id=guild.id).all()
            if not members:
                continue

            for member in guild.members:
                m = next(filter(lambda x: x.user_id == member.id, members))

                m.user.avatar_url = str(member.avatar_url_as(format=None, static_format="webp", size=512))
                m.display_name = member.display_name
                m.top_role_id = member.top_role.id if member.top_role else 0
                m.user.name = member.name
                m.user.discriminator = member.discriminator

                logger.debug((f"Updating Member for '{guild.name}': "
                            f"({member.id}) {member.name} - {member.display_name}"))


        self.db.commit()

    await self.loop.run_in_executor(None, _update)
