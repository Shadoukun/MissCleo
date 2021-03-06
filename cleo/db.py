from sqlalchemy import create_engine, ForeignKey, Column, Integer, String, Table, DateTime, Boolean, UniqueConstraint, JSON, Float
from sqlalchemy.orm import relationship, backref, sessionmaker, Query
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.ext.declarative import DeclarativeMeta
import json
import datetime
import config


engine = create_engine(config.SQLALCHEMY_DATABASE_URI)
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
    top_role_id = Column(Integer, ForeignKey('roles.id', name="fk_top_role_id"))



    guild = relationship("Guild", uselist=False, lazy="joined")
    user = relationship("User", primaryjoin='foreign(User.id) == GuildMembership.user_id',
                        uselist=False, lazy='joined')
    top_role = relationship("Role", uselist=False)
    quotes = relationship('Quote', primaryjoin=(
                          'and_(foreign(Quote.user_id) == GuildMembership.user_id,'
                          'foreign(Quote.guild_id) == GuildMembership.guild_id)'),
                          uselist=True, lazy='joined')

    def __init__(self, member):
        self.guild_id = member.guild.id
        self.user_id = member.id
        self.display_name = member.display_name
        self.joined_at = member.joined_at
        self.top_role_id = member.top_role.color.value if member.top_role else None


class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    color = Column(Integer)
    raw_permissions = Column(Integer)
    guild_id = Column(Integer, ForeignKey('guilds.id'))
    position = Column(Integer)

    guild = relationship("Guild", uselist=False, backref=backref("roles"))

    def __init__(self, role):
        self.id = role.id
        self.name = role.name
        self.color = role.color.value if role.color else 8421504
        self.raw_permissions = role.permissions.value
        self.guild_id = role.guild.id
        self.position = role.position


class Quote(Base):
    """User quotes"""

    __tablename__ = "quotes"

    message_id      = Column(Integer, primary_key=True)
    message         = Column(String)
    attachments     = Column(JSON)
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


class CustomCommand(Base):
    """
    Custom Commands.
    Like a normal bot command that Triggers with command prefix.
    """

    __tablename__ = "custom_commands"

    id                  = Column(Integer, primary_key=True)
    name                = Column(String, unique=True)
    description         = Column(String)
    command             = Column(String, unique=True)
    response            = Column(String)
    multi_response      = Column(Boolean)

    cooldown            = Column(Boolean)
    cooldown_rate       = Column(Integer)
    cooldown_per        = Column(Float)
    cooldown_bucket     = Column(Integer)
    cooldown_multiplier = Column(Integer)


    def __init__(self, command, response, description=None, name=None, multi_response=False, **kwargs):
        self.command = command
        self.response = response
        self.name = name
        self.description = description
        self.multi_response = multi_response

        self.cooldown = kwargs.get('cooldown', False)
        self.cooldown_rate = kwargs.get('cooldown_rate', 1)
        self.coldown_per = kwargs.get('cooldown_per', 0)
        self.cooldown_bucket = kwargs.get('cooldown_bucket', 2)
        self.cooldown_multiplier = kwargs.get('cooldown_multiplier', 1)


class CustomResponse(Base):
    """Custom Responses"""

    __tablename__ = "custom_responses"

    id                  = Column(Integer, primary_key=True)
    name                = Column(String, unique=True)
    description         = Column(String)
    trigger             = Column(String, unique=True)
    response            = Column(String)
    use_regex           = Column(Boolean)
    multi_response      = Column(Boolean)

    cooldown            = Column(Boolean)
    cooldown_rate       = Column(Integer)
    cooldown_per        = Column(Float)
    cooldown_bucket     = Column(Integer)
    cooldown_multiplier = Column(Integer)


    def __init__(self, trigger, response, name=None, description=None, use_regex=False, multi_response=False, **kwargs):
        self.trigger = trigger
        self.response = response
        self.name = name
        self.description = description
        self.use_regex = use_regex
        self.multi_response = multi_response

        self.cooldown = kwargs.get('cooldown', False)
        self.cooldown_rate = kwargs.get('cooldown_rate', 1)
        self.coldown_per = kwargs.get('cooldown_per', 0)
        self.cooldown_bucket = kwargs.get('cooldown_bucket', 2)
        self.cooldown_multiplier = kwargs.get('cooldown_multiplier', 1)



class CustomReaction(Base):
    """Custom Reactions"""

    __tablename__ = "custom_reactions"

    id                  = Column(Integer, primary_key=True)
    name                = Column(String, unique=True)
    description         = Column(String)
    trigger             = Column(String, unique=True)
    reaction            = Column(String)
    use_regex           = Column(Boolean)
    multi_response      = Column(Boolean)

    cooldown            = Column(Boolean)
    cooldown_rate       = Column(Integer)
    cooldown_per        = Column(Float)
    cooldown_bucket     = Column(Integer)
    cooldown_multiplier = Column(Integer)

    def __init__(self, trigger, reaction, name=None, description=None, use_regex=False, multi_response=False, **kwargs):
        self.trigger = trigger
        self.reaction = reaction
        self.name = name
        self.description = description
        self.use_regex = use_regex
        self.multi_response = multi_response

        self.cooldown = kwargs.get('cooldown', False)
        self.cooldown_rate = kwargs.get('cooldown_rate', 1)
        self.coldown_per = kwargs.get('cooldown_per', 0)
        self.cooldown_bucket = kwargs.get('cooldown_bucket', 2)
        self.cooldown_multiplier = kwargs.get('cooldown_multiplier', 1)


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


class Pagination:
    """Internal helper class returned by :meth:`BaseQuery.paginate`.  You
    can also construct it from any other SQLAlchemy query object if you are
    working with other libraries.  Additionally it is possible to pass `None`
    as query object in which case the :meth:`prev` and :meth:`next` will
    no longer work.

    Stolen from FLask-SQLAlchemy
    """

    def __init__(self, query, page, per_page, total, items):
        #: the unlimited query object that was used to create this
        #: pagination object.
        self.query = query
        #: the current page number (1 indexed)
        self.page = page
        #: the number of items to be displayed on a page.
        self.per_page = per_page
        #: the total number of items matching the query
        self.total = total
        #: the items for the current page
        self.items = items

    @property
    def pages(self):
        """The total number of pages"""
        if self.per_page == 0 or self.total is None:
            pages = 0
        else:
            pages = int(ceil(self.total / float(self.per_page)))
        return pages

    def prev(self, error_out=False):
        """Returns a :class:`Pagination` object for the previous page."""
        assert (
            self.query is not None
        ), "a query object is required for this method to work"
        return self.query.paginate(self.page - 1, self.per_page, error_out)

    @property
    def prev_num(self):
        """Number of the previous page."""
        if not self.has_prev:
            return None
        return self.page - 1

    @property
    def has_prev(self):
        """True if a previous page exists"""
        return self.page > 1

    def next(self, error_out=False):
        """Returns a :class:`Pagination` object for the next page."""
        assert (
            self.query is not None
        ), "a query object is required for this method to work"
        return self.query.paginate(self.page + 1, self.per_page, error_out)

    @property
    def has_next(self):
        """True if a next page exists."""
        return self.page < self.pages

    @property
    def next_num(self):
        """Number of the next page"""
        if not self.has_next:
            return None
        return self.page + 1


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


def new_alchemy_encoder(revisit_self=False, fields_to_expand=[]):
    '''JSON encoder for SQLAlchemy objects.'''

    _visited_objs = []

    class AlchemyEncoder(json.JSONEncoder):

        def default(self, obj):
            if isinstance(obj.__class__, DeclarativeMeta):
                # don't re-visit self
                if revisit_self:
                    if obj in _visited_objs:
                        return None
                    _visited_objs.append(obj)

                # go through each field in this SQLalchemy class
                fields = {}

                for field in [x for x in dir(obj) if not x.startswith('_') and x != 'metadata' and not x.startswith('query')]:
                    val = obj.__getattribute__(field)

                    # convert ints to strings
                    if type(val) is int:
                        fields[field] = str(val)
                        continue

                    # is this field another SQLalchemy object, or a list of SQLalchemy objects?
                    if isinstance(val.__class__, DeclarativeMeta) or (isinstance(val, list) and len(val) > 0 and isinstance(val[0].__class__, DeclarativeMeta)):
                        # unless we're expanding this field, stop here
                        if field not in fields_to_expand:
                            # not expanding this field: set it to None and continue
                            fields[field] = None
                            continue

                    fields[field] = val

                # a json-encodable dict
                return fields

            # datetime.datetime is cancer.
            if type(obj) is datetime.datetime:
                return obj.strftime("%m/%d/%Y")

            if type(obj) is int:
                return str(obj)

            return json.JSONEncoder.default(self, obj)

    return AlchemyEncoder


session = sessionmaker(bind=engine, query_cls=CustomQuery)()
