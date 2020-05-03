from dataclasses import dataclass
from typing import Any
from sqlalchemy import and_, func
from flask import render_template, Blueprint, request, redirect, url_for, Response, jsonify
from flask_login import login_required
from pprint import pprint

from cleo.db import Quote, Guild, GuildMembership, new_alchemy_encoder
from .. import db
import json
from flask_jwt_extended import jwt_required


blueprint = Blueprint('quotes', __name__)


def getGuilds():
    return db.session.query(Guild).all()

def getMembers(guild_id):
    
    members = db.session.query(GuildMembership).filter(GuildMembership.quotes.any(Quote.guild_id == guild_id)) \
                                                            .order_by(func.lower(GuildMembership.display_name)) \
                                                            .join(GuildMembership.top_role).all()
    return members

def getQuotes(guild_id, user_id, page):

    filters = [Quote.guild_id == guild_id]

    if user_id:
        filters += [Quote.user_id == user_id]
        
    quote_page = db.session.query(Quote).filter(and_(*filters)) \
                                        .order_by(Quote.timestamp.desc()) \
                                        .join(Quote.member) \
                                        .paginate(page, 10, False)
    return quote_page


@blueprint.route('/guilds')
def guilds():

    guilds = json.dumps(getGuilds(), cls=new_alchemy_encoder(False, ['member']))
    return Response(guilds, mimetype='application/json')

    
@blueprint.route('/members')
def members():
    guild_id = request.args.get('guild', None)

    members = json.dumps(getMembers(guild_id), cls=new_alchemy_encoder(False, ['user', 'top_role']))
    return Response(members, mimetype='application/json')


@blueprint.route('/quotes')
def quotes():

    guild = request.args.get('guild', None)
    user = request.args.get('user', None)
    page = int(request.args.get('page', 1))

    quotes = getQuotes(guild, user, page)
    data = {
        "quotes": quotes.items,
        "pages": quotes.pages 
    }

    quotes = json.dumps(data, cls=new_alchemy_encoder(False, ['member', 'user', 'top_role']))
    return Response(quotes, mimetype='application/json')


@blueprint.route("/delete_quote/<id>")
@jwt_required
def delete_quote(id):
    db.session.query(Quote).filter_by(message_id=id).delete()
    db.session.commit()

    return redirect(url_for('quotes.quotes'))
