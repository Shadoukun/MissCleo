import sys
import json
import discord
from dataclasses import dataclass
from datetime import datetime
from pprint import pprint
from typing import Any
from sqlalchemy import func, desc, and_
from flask import render_template, Blueprint, request, redirect, url_for
from flask_sqlalchemy import BaseQuery
from flask_login import login_required

from .. import db
from cleo.db import Quote, User, Channel, Guild, GuildMember
from ..forms import *


blueprint = Blueprint('quotes', __name__)


@dataclass
class PageData:
    current_guild: int = None
    current_member: int = None
    current_page: int = 1

    guilds: Any = None
    members: Any = None
    quotes: Any = None
    pages: Any = None

    def __post_init__(self):

        member_filters = [GuildMember.quotes.any()]
        quote_filters = []

        if self.current_guild:
            member_filters += [GuildMember.guild_id == self.current_guild]
            quote_filters += [Quote.guild_id == self.current_guild, GuildMember.guild_id == self.current_guild]

            if self.current_member:
                member_filters += [GuildMember.user_id == self.current_member]
                quote_filters += [Quote.user_id == self.current_member, GuildMember.user_id == self.current_member]

        self.guilds = db.session.query(Guild).all()
        self.members = db.session.query(GuildMember).filter(and_(*member_filters)).all()
        self.pages = db.session.query(GuildMember, Quote).filter(and_(*quote_filters)) \
                                                         .join(GuildMember) \
                                                         .order_by(Quote.timestamp.desc()) \
                                                         .paginate(self.current_page, 10, False)


@blueprint.route('/quotes')
def quotes():

    guild = request.args.get('guild', None)
    if guild:
        user = request.args.get('user', None)
    else:
        user = None

    page = int(request.args.get('page', 1))
    data = PageData(guild, user, page)
    return render_template('pages/quotes/quotes.html', data=data)


@blueprint.route("/delete_quote/<id>")
@login_required
def delete_quote(id):
    db.session.query(Quote).filter_by(message_id=id).delete()
    db.session.commit()

    return redirect(url_for('quotes.quotes'))
