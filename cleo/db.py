from sqlalchemy import create_engine, ForeignKey, Column, Integer, String, Table, DateTime, Boolean
from sqlalchemy.orm import relationship, backref, sessionmaker, Query
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.ext.hybrid import hybrid_property
from flask_sqlalchemy import Pagination


engine = create_engine('sqlite:///database.db')
Base = declarative_base()

channel_members = Table('channel_members',
                        Base.metadata,
                        Column('channel_id', Integer, ForeignKey('channels.id')),
                        Column('user_id', Integer, ForeignKey('users.id'))
                       )


class Guild(Base):
    '''Discord Servers/Guilds'''

    __tablename__ = "guilds"

    id          = Column(Integer, primary_key=True)
    name        = Column(String)
    icon_url    = Column(String)

    members     = relationship("GuildMember")
    channels    = relationship("Channel", backref=backref("guild"))
    quotes      = relationship("Quote", backref=backref("guild", lazy="joined"))

    def __init__(self, guild):
        self.id = guild.id
        self.name = guild.name
        self.icon_url = str(guild.icon_url) if guild.icon_url else ""


class Channel(Base):
    '''Server channels'''

    __tablename__ = "channels"

    id              = Column(Integer, primary_key=True)
    name            = Column(String)
    enabled_cmds    = Column(String)
    guild_id        = Column(Integer, ForeignKey('guilds.id'))

    members         = relationship("User", secondary=channel_members, backref="channels")
    quotes          = relationship("Quote", backref=backref("channel", lazy="joined"))

    def __init__(self, channel):
        self.id = channel.id
        self.name = channel.name
        self.guild_id = channel.guild.id

    @hybrid_property
    def enabled_commands(self):
        if self.enabled_cmds is None:
            return []
        else:
            return [x for x in self.enabled_cmds.split(',')]
    @enabled_commands.setter
    def enabled_commands(self, value):
        self.enabled_cmds = ','.join(value)


class User(Base):

    __tablename__ = "users"

    id              = Column(Integer, primary_key=True)
    name            = Column(String)
    avatar_url      = Column(String)

    quotes          = relationship("Quote", backref=backref("user", lazy="joined"))

    def __init__(self, user):
        self.id = user.id
        self.name = user.name
        self.display_name = user.display_name
        self.avatar_url = str(user.avatar_url)

class GuildMember(Base):
    __tablename__ = "guild_members"

    guild_id        = Column(Integer, ForeignKey("guilds.id"), primary_key=True)
    user_id         = Column(Integer, ForeignKey("users.id"), primary_key=True)
    display_name    = Column(String)

    user            = relationship("User")
    guild           = relationship("Guild", back_populates="members")

    def __init__(self, member):
        self.guild_id = member.guild.id
        self.user_id = member.id
        self.display_name = member.display_name


class Admin(Base):

    __tablename__ = "admins"

    id              = Column(Integer, primary_key=True)
    user_id         = Column(Integer, ForeignKey('users.id'))

    user            = relationship("User", uselist=False)

    def __init__(self, user_id):
        self.user_id = user_id


class FlaskUser(Base):
    '''An admin user capable of viewing reports.

    :param str username: username for the user
    :param str password: encrypted password for the user
    '''

    __tablename__ = 'web_users'

    username        = Column(String, primary_key=True)
    password        = Column(String)
    authenticated   = Column(Boolean, default=False)

    def is_active(self):
        '''True, as all users are active.'''
        return True

    def get_id(self):
        '''Return the email address to satisfy Flask-Login's requirements.'''
        return self.username

    def is_authenticated(self):
        '''Return True if the user is authenticated.'''
        return self.authenticated

    def is_anonymous(self):
        '''False, as anonymous users aren't supported.'''
        return False


class Quote(Base):
    '''User quotes'''

    __tablename__ = "quotes"

    guild_id        = Column(Integer, ForeignKey("guilds.id"))
    channel_id      = Column(Integer, ForeignKey('channels.id'))
    user_id         = Column(Integer, ForeignKey('users.id'))
    member_id       = Column(Integer, ForeignKey('guild_members.user_id'))
    message_id      = Column(Integer, primary_key=True)
    message         = Column(String)
    timestamp       = Column(DateTime)

    member = relationship("GuildMember", backref=backref("quotes", lazy="joined"))

    def __init__(self, message):
        self.message_id = message.id
        self.message = message.content
        self.timestamp = message.created_at
        self.user_id = message.author.id
        self.member_id = message.author.id
        self.channel_id = message.channel.id
        self.guild_id = message.guild.id


class Macro(Base):
    '''Macro commands'''

    __tablename__ = "macros"

    id              = Column(Integer, primary_key=True)
    command         = Column(String, unique=True)
    response        = Column(String)
    modified_flag   = Column(Integer)

    def __init__(self, command, response, modified_flag=None):
        self.command = command
        self.response = response
        self.modified_flag = modified_flag


class MacroResponse(Base):
    '''Automatic response to keywords'''

    __tablename__ = "responses"

    id              = Column(Integer, primary_key=True)
    trigger         = Column(String, unique=True)
    response        = Column(String)

    def __init__(self, trigger, response):
        self.trigger = trigger
        self.response = response


class MacroReaction(Base):
    '''Automatic reaction to keywords'''
    __tablename__ = "reactions"

    id = Column(Integer, primary_key=True)
    trigger = Column(String, unique=True)
    reaction = Column(String)

    def __init__(self, trigger, reaction):
        self.trigger = trigger
        self.reaction = reaction



class CustomQuery(Query):
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


def fix_timestamps(db, query):
    for q in query:
        new_quote = Quote(q)
        db.session.add(new_quote)
    db.session.commit()


Session = sessionmaker(bind=engine, query_cls=CustomQuery)
session = Session()
