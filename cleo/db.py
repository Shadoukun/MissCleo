from sqlalchemy import *
from sqlalchemy import create_engine, ForeignKey, event
from sqlalchemy import Column, Integer, String, Table, DateTime, Boolean, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, backref, sessionmaker, Query
from datetime import datetime
from cachetools import cachedmethod
from sqlalchemy.ext.hybrid import hybrid_property
from flask_sqlalchemy import Pagination
import dateutil.parser

engine = create_engine('sqlite:///database.db')
Base = declarative_base()


channel_members = Table('channel_members',
                        Base.metadata,
                        Column('channel_id', Integer, ForeignKey('channels.id')),
                        Column('user_id', Integer, ForeignKey('users.id'))
                       )


#channel_members = Table('guild_channels',
#                        Base.metadata,
#                        Column('guild_id', Integer, ForeignKey('guilds.guild_id')),
#                        Column('channel_id', Integer, ForeignKey('channels.channel_id'))
#                       )
#

class Guild(Base):
    '''Discord Servers/Guilds'''

    __tablename__ = "guilds"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    icon_url = Column(String)
    channels = relationship("Channel", backref=backref("guild"))
    users = relationship("User", backref=backref("guild"))
    quotes = relationship("Quote", backref=backref("guild", lazy="joined"))

    def __init__(self, guild):
        self.id = guild.id
        self.name = guild.name
        self.icon_url = str(guild.icon_url)


class Channel(Base):
    '''Server channels'''

    __tablename__ = "channels"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    enabled_cmds = Column(String)
    guild_id = Column(Integer, ForeignKey('guilds.id'))
    members = relationship("User", secondary=channel_members, backref="channels")
    quotes = relationship("Quote", backref=backref("channel", lazy="joined"))

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
    '''Users'''

    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    display_name = Column(String)
    avatar_url = Column(String)
    guild_id = Column(Integer, ForeignKey('guilds.id'))
    quotes = relationship("Quote", backref=backref("user", lazy="joined"))

    def __init__(self, user):
        self.id = user.id
        self.name = user.name
        self.display_name = user.display_name
        self.avatar_url = str(user.avatar_url)
        self.guild_id = user.guild.id

class Admin(Base):

    __tablename__ = "admins"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    user = relationship("User", uselist=False)

    def __init__(self, user_id):
        self.user_id = user_id

class FlaskUser(Base):
    '''An admin user capable of viewing reports.

    :param str username: username for the user
    :param str password: encrypted password for the user
    '''

    __tablename__ = 'web_users'

    username = Column(String, primary_key=True)
    password = Column(String)
    authenticated = Column(Boolean, default=False)

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


class MessageStat(Base):
    '''Total messages sent over time (Hourly)'''

    __tablename__ = "message_stats"

    id = Column(Integer, primary_key=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    messagecount = Column(Integer)
    channel_id = Column(Integer, ForeignKey('channels.id'))

    def __init__(self, timestamp, messagecount, channel_id):
        self.timestamp = timestamp
        self.messagecount = messagecount
        self.channelid = channel_id


class Quote(Base):
    '''User quotes'''

    __tablename__ = "quotes"

    message_id = Column(Integer, primary_key=True)
    message = Column(String)
    timestamp = Column(DateTime)
    user_id = Column(Integer, ForeignKey('users.id'))
    channel_id = Column(Integer, ForeignKey('channels.id'))
    guild_id = Column(Integer, ForeignKey("guilds.id"))

    # def __init__(self, q):
    #     self.message_id = q.message_id
    #     self.message = q.message
    #     self.timestamp = dateutil.parser.parse(q.timestamp)
    #     self.user_id = q.user_id
    #     self.channel_id = q.channel_id
    #     self.guild_id = q.guild_id

    def __init__(self, message):
        self.message_id = message.id
        self.message = message.content
        self.timestamp = message.created_at
        self.user_id = message.author.id
        self.channel_id = message.channel.id
        self.guild_id = message.guild.id

#class Quote_Orig(Base):
#    '''User quotes'''
#
#    __tablename__ = "quotes_orig"
#
#    message_id = Column(Integer, primary_key=True)
#    message = Column(String)
#    timestamp = Column(String)
#    user_id = Column(Integer, ForeignKey('users.id'))
#    channel_id = Column(Integer, ForeignKey('channels.id'))
#    guild_id = Column(Integer, ForeignKey("guilds.id"))
#
#    def __init__(self, message):
#        timestamp = message.created_at.strftime('%m/%d/%y')
#
#        self.message_id = message.id
#        self.message = message.content
#        self.timestamp = timestamp
#        self.user_id = message.author.id
#        self.channel_id = message.channel.id
#        self.guild_id = message.guild.id

class Macro(Base):
    '''Macro commands'''

    __tablename__ = "macros"

    id = Column(Integer, primary_key=True)
    command = Column(String, unique=True)
    response = Column(String)
    modified_flag = Column(Integer)

    def __init__(self, command, response, modified_flag=None):
        self.command = command
        self.response = response
        self.modified_flag = modified_flag

class MacroResponse(Base):
    '''Automatic response to keywords'''

    __tablename__ = "responses"

    id = Column(Integer, primary_key=True)
    trigger = Column(String, unique=True)
    response = Column(String)

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


Session = sessionmaker(bind=engine, query_cls=CustomQuery)
session = Session()

def fix_timestamps(db, query):
    for q in query:
        new_quote = Quote(q)
        db.session.add(new_quote)
    db.session.commit()
