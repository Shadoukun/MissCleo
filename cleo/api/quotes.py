from aiohttp import web

import config
from cleo.db import session, Guild, new_alchemy_encoder, GuildMembership, Quote
import json
from sqlalchemy import and_, func

quote_routes = web.RouteTableDef()


def getGuilds(guild_id=None):
    filters = []

    if guild_id:
        filters = [Guild.id == guild_id]

    return session.query(Guild).filter(*filters).all()

def getMembers(guild_id):
    """Returns members that have quotes in a guild."""

    members = session.query(GuildMembership) \
                        .filter(GuildMembership.quotes.any(Quote.guild_id == guild_id)) \
                        .order_by(func.lower(GuildMembership.display_name)) \
                        .join(GuildMembership.top_role).all()
    return members

def getAllMembers(guild_id):
    """Returns ALL members in a guild"""

    members = session.query(GuildMembership) \
                        .filter(GuildMembership.guild_id == guild_id) \
                        .order_by(func.lower(GuildMembership.display_name)) \
                        .join(GuildMembership.top_role).all()

    return members

def getQuotes(guild_id, user_id, search, page):

    filters = [Quote.guild_id == guild_id]

    if user_id:
        filters += [Quote.user_id == user_id]

    if search:
        filters += [Quote.message.match(search)]

    quote_page = session.query(Quote) \
                            .filter(and_(*filters)) \
                            .order_by(Quote.timestamp.desc()) \
                            .join(Quote.member) \
                            .paginate(page, 10, False)
    return quote_page


@quote_routes.get('/guilds')
def guilds(request):
    guild_id = request.rel_url.query.get('guild', None)

    filters = [Guild.id == guild_id]

    guilds = json.dumps(getGuilds(guild_id), cls=new_alchemy_encoder(False))
    return web.json_response(text=guilds)


@quote_routes.get('/members')
def members(request):
    guild_id = request.rel_url.query.get('guild', None)

    members = json.dumps(getMembers(guild_id),
                         cls=new_alchemy_encoder(False, ['user', 'top_role']))

    return web.json_response(text=members)


@quote_routes.get('/all_members')
def allmembers(request):
    guild_id = request.rel_url.query.get('guild', None)

    members = json.dumps(getAllMembers(guild_id),
                         cls=new_alchemy_encoder(False, ['user', 'top_role']))

    return web.json_response(text=members)



@quote_routes.get('/quotes')
def quotes(request):
    guild = request.rel_url.query.get('guild', None)
    user = request.rel_url.query.get('user', None)
    search = request.rel_url.query.get('search', None)
    page = int(request.rel_url.query.get('page', 1))

    quotes = getQuotes(guild, user, search, page)
    data = {
        "quotes": quotes.items,
        "pages": quotes.pages
    }

    quotes = json.dumps(data, cls=new_alchemy_encoder(
                        False, ['member', 'user', 'top_role']))

    return web.json_response(text=quotes)
