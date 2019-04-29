from sqlalchemy import create_engine, ForeignKey, Column, Integer, String, Table, DateTime, Boolean, UniqueConstraint
from sqlalchemy.orm import relationship, backref, sessionmaker, Query
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.ext.hybrid import hybrid_property
from flask_sqlalchemy import Pagination

engine = create_engine('sqlite:///database.db')
Base = declarative_base()


class Guild(Base):
    """Discord Server/Guild Table"""

    __tablename__ = "guilds"

    id          = Column(Integer, primary_key=True)
    name        = Column(String)
    icon_url    = Column(String)

    members     = relationship("GuildMembership")
    channels    = relationship("Channel", backref=backref("guild"))
    quotes = relationship("Quote", primaryjoin="foreign(Quote.guild_id) == Guild.id")

    def __init__(self, guild):
        self.id = guild.id
        self.name = guild.name
        self.icon_url = str(guild.icon_url) if guild.icon_url else ""


class Channel(Base):
    """Server Channels"""

    __tablename__ = "channels"

    id              = Column(Integer, primary_key=True)
    name            = Column(String)
    guild_id        = Column(Integer, ForeignKey('guilds.id'))
    enabled_cmds    = Column(String)

    def __init__(self, channel):
        self.id = channel.id
        self.name = channel.name
        self.guild_id = channel.guild.id

    @hybrid_property
    def enabled_commands(self):
        if self.enabled_cmds:
            return [x for x in self.enabled_cmds.split(',')]
        else:
            return []
    @enabled_commands.setter
    def enabled_commands(self, value):
        self.enabled_cmds = ','.join(value)


class User(Base):
    """Discord Users"""

    __tablename__ = "users"

    id              = Column(Integer, primary_key=True)
    name            = Column(String)
    avatar_url      = Column(String)

    def __init__(self, user):
        self.id = user.id
        self.name = user.name
        self.avatar_url = str(user.avatar_url)


class GuildMembership(Base):
    """Discord Memberships for Guilds/Servers"""

    __tablename__ = "guild_membership"
    __table_args__ = (
        UniqueConstraint('user_id', 'guild_id',
                         name='uq_guild_membership'),
    )

    guild_id        = Column(Integer, ForeignKey("guilds.id"), primary_key=True)
    user_id         = Column(Integer, ForeignKey("users.id"), primary_key=True)
    display_name    = Column('display_name', String, nullable=True)
    joined_at       = Column('joined_at', DateTime, nullable=True)

    guild = relationship("Guild", uselist=False, lazy="joined")
    user = relationship("User", primaryjoin='foreign(User.id) == GuildMembership.user_id',
                        uselist=False, lazy='joined')

    quotes = relationship('Quote', primaryjoin=(
                          'and_(foreign(Quote.user_id) == GuildMembership.user_id,'
                          'foreign(Quote.guild_id) == GuildMembership.guild_id)'),
                          uselist=True, lazy='joined')

    def __init__(self, member):
        self.guild_id = member.guild.id
        self.user_id = member.id
        self.user_id = member.id
        self.display_name = member.display_name
        self.joined_at = member.joined_at


class Quote(Base):
    """User quotes"""

    __tablename__ = "quotes"

    message_id      = Column(Integer, primary_key=True)
    message         = Column(String)
    timestamp       = Column(DateTime)
    guild_id        = Column(Integer)
    channel_id      = Column(Integer)
    user_id         = Column(Integer)

    guild = relationship("Guild",
                         primaryjoin="foreign(Guild.id) == Quote.guild_id",
                         uselist=False, lazy="joined")
    user = relationship("User",
                        primaryjoin=('foreign(User.id) == Quote.user_id'),
                        uselist=False, lazy="joined")
    member = relationship('GuildMembership',
                          primaryjoin=('and_(foreign(GuildMembership.user_id) == Quote.user_id,'
                                       'foreign(GuildMembership.guild_id) == Quote.guild_id)'),
                          uselist=False, lazy='joined')

    # def __init__(self, quote):
    #     self.message_id = quote['id']
    #     self.message = quote['content']
    #     self.timestamp = quote['created_at']
    #     self.user_id = quote['user_id']
    #     self.channel_id = quote['channel.id']
    #     self.guild_id = quote['guild.id']


class Macro(Base):
    """
    Macro Commands.
    Like a normal bot command that Triggers with command prefix.
    """

    __tablename__ = "macro_commands"

    id              = Column(Integer, primary_key=True)
    command         = Column(String, unique=True)
    response        = Column(String)
    modified_flag   = Column(Integer)

    def __init__(self, command, response, modified_flag=None):
        self.command = command
        self.response = response
        self.modified_flag = modified_flag


class MacroResponse(Base):
    """Macro Responses to Keywords"""

    __tablename__ = "macro_responses"

    id              = Column(Integer, primary_key=True)
    trigger         = Column(String, unique=True)
    response        = Column(String)

    def __init__(self, trigger, response):
        self.trigger = trigger
        self.response = response


class MacroReaction(Base):
    """Macro Reactions to Keywords"""

    __tablename__ = "macro_reactions"

    id              = Column(Integer, primary_key=True)
    trigger         = Column(String, unique=True)
    reaction        = Column(String)

    def __init__(self, trigger, reaction):
        self.trigger = trigger
        self.reaction = reaction


class Admin(Base):
    """Admin Discord Users"""

    __tablename__ = "admins"

    user_id         = Column(Integer, ForeignKey('users.id'), primary_key=True)

    def __init__(self, user_id):
        self.user_id = user_id


class FlaskUser(Base):
    """Users registered with Flask web UI."""

    __tablename__ = 'web_users'

    username        = Column(String, primary_key=True)
    password        = Column(String)
    authenticated   = Column(Boolean, default=False)

    def is_active(self):
        """True, as all users are active."""
        return True

    def get_id(self):
        """Return the email address to satisfy Flask-Login's requirements."""
        return self.username

    def is_authenticated(self):
        """Return True if the user is authenticated."""
        return self.authenticated

    def is_anonymous(self):
        """False, as anonymous users aren't supported."""
        return False


class CustomQuery(Query):
    """Query subclass containing Flask-SQLAlchemy paginate method."""

    def paginate(self, page=1, per_page=25, show_all=False):
        """Paginate a query object.

        This behaves almost like the default `paginate` method from
        Flask-SQLAlchemy but allows showing all results on a single page.

        :param page: Number of the page to return.
        :param per_page: Number of items per page.
        :param show_all: Whether to show all the elements on one page.
        :return: a :class:`Pagination` object
        """
        if page < 1 or show_all:
            page = 1

        if show_all:
            items = self.all()
            per_page = total = len(items)
        else:
            items = self.limit(per_page).offset((page - 1) * per_page).all()
            if page == 1 and len(items) < per_page:
                total = len(items)
            else:
                total = self.order_by(None).count()

        return Pagination(self, page, per_page, total, items)

#engine = create_engine('sqlite:///database.db')
Base.metadata.create_all(engine)
session = sessionmaker(bind=engine, query_cls=CustomQuery)()

# from collections import namedtuple
# from datetime import datetime

# guildt = namedtuple("guild", ['id', 'name', 'icon_url'])
# usert = namedtuple("user", ['id', 'name', 'avatar_url'])
# GuildMembershipt = namedtuple("guild_member", ['guild_id', 'user_id', 'display_name', 'joined_at'])
# quotet = namedtuple("quote", ['id', 'message', 'created_at', 'guild_id', 'channel_id', 'user_id'])

# g = Guild(guildt(id=394188309087256587, name="testguild1", icon_url=""))
# session.add(g)
# session.commit()

# g2 = Guild(guildt(570071281542627379, "Testguild2", ""))
# session.add(g2)
# session.commit()

# u1 = User(usert(482920312233656320, "User1", ""))
# session.add(u1)
# session.commit()

# gm1 = GuildMembership(GuildMembershipt(394188309087256587, 482920312233656320, "UserDisplay1", datetime.utcnow()))
# session.add(gm1)
# session.commit()

# gm2 = GuildMembership(GuildMembershipt(482920312233656320, 570071281542627379, "UserDisplay2", datetime.utcnow()))
# session.add(gm2)
# session.commit()

# q1 = Quote(quotet(571329245205364742, "Test Message", datetime.utcnow(), 394188309087256587, 394188309087256587, 482920312233656320))
# session.add(q1)
# session.commit()

