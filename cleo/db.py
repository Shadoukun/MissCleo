import discord
from sqlalchemy import *
from sqlalchemy import create_engine, ForeignKey
from sqlalchemy import Column, Integer, String, Table, DateTime, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, backref
from datetime import datetime

engine = create_engine('sqlite:///database.db', echo=False)
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
    """Discord Servers/Guilds"""

    __tablename__ = "guilds"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    icon_url = Column(String)
    channels = relationship("Channel", backref=backref("guild"))
    users = relationship("User", backref=backref("guild"))

    def __init__(self, guild):
        self.id = guild.id
        self.name = guild.name
        self.icon_url = guild.icon_url


class Channel(Base):
    """Server channels"""

    __tablename__ = "channels"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    enabled_commands = Column(String)
    guild_id = Column(Integer, ForeignKey('guilds.id'))
    members = relationship("User", secondary=channel_members, backref="channels")
    quotes = relationship("Quote", backref=backref("channel", lazy="joined"))

    def __init__(self, channel):
        self.id = channel.id
        self.name = channel.name
        self.guild_id = channel.guild.id

class User(Base):
    """Users"""

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
        self.avatar_url = user.avatar_url
        self.guild_id = user.guild.id

class Admin():

    __tablename__ = "admins"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    user = relationship("User", uselist=False)

    def __init__(self, user_id):
        self.user_id = user_id

class FlaskUser(Base):
   """An admin user capable of viewing reports.

   :param str username: username for the user
   :param str password: encrypted password for the user

   """
   __tablename__ = 'web_users'

   username = Column(String, primary_key=True)
   password = Column(String)
   authenticated = Column(Boolean, default=False)

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


class MessageStat(Base):
   """Total messages sent over time (Hourly)"""

   __tablename__ = "message_stats"

   id = Column(Integer, primary_key=True)
   timestamp = Column(DateTime, default=datetime.utcnow)
   messagecount = Column(Integer)
   channel_id = Column(Integer, ForeignKey('channels.id'))

   def __init__(self, timestamp, messagecount, channelid):
       self.timestamp = timestamp
       self.messagecount = messagecount
       self.channelid = channel_id


class Quote(Base):
    """User quotes"""

    __tablename__ = "quotes"

    message_id = Column(Integer, primary_key=True)
    message = Column(String)
    timestamp = Column(String)
    user_id = Column(Integer, ForeignKey('users.id'))
    channel_id = Column(Integer, ForeignKey('channels.id'))

    def __init__(self, message):
        timestamp = message.created_at.strftime('%m/%d/%y')

        self.message_id = message.id
        self.message = message.content
        self.timestamp = timestamp
        self.user_id = message.author.id
        self.channel_id = message.channel.id

class Macro(Base):
    """Macro commands"""

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
    """Automatic response to keywords"""

    __tablename__ = "responses"

    id = Column(Integer, primary_key=True)
    trigger = Column(String, unique=True)
    response = Column(String)

    def __init__(self, trigger, response):
        self.trigger = trigger
        self.response = response

class MacroReaction(Base):

    __tablename__ = "reactions"

    id = Column(Integer, primary_key=True)
    trigger = Column(String, unique=True)
    reaction = Column(String)

    def __init__(self, trigger, reaction):
        self.trigger = trigger
        self.reaction = reaction

