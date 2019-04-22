import sys
import json
import discord
from dataclasses import dataclass
from datetime import datetime
from pprint import pprint
from typing import Any
from sqlalchemy import func, desc
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
        query = db.session.query(Guild, GuildMember)

        if self.current_guild and self.current_member:
            if self.current_guild:
                query.filter(Guild.id == self.current_guild)
            if self.current_member:
                query.filter(GuildMember.user_id == self.current_member)

            self.current_guild, self.current_member = query.one()


        guilds = db.session.query(Guild)
        members = db.session.query(GuildMember)
        quotes = db.session.query(Quote).order_by(Quote.timestamp.desc())

        if self.current_guild:
            members.filter_by(guild_id=self.current_guild)
            quotes.filter_by(guild_id=self.current_guild)

        if self.current_member:
            members.filter_by(user_id=self.current_member)
            quotes.filter_by(user_id=self.current_member)

        self.guilds = guilds.all()
        self.members = members.all()
        self.pages = quotes.paginate(self.current_page, 10, False)


@blueprint.route('/quotes')
def quotes():

    guild = request.args.get('guild', None)
    user = request.args.get('user', None) if guild else None

    page = int(request.args.get('page', 1))
    data = PageData(guild, user, page)
    return render_template('pages/quotes/quotes.html', data=data)


@blueprint.route("/delete_quote/<id>")
@login_required
def delete_quote(id):
    quote = db.session.query(Quote).filter_by(message_id=id)
    db.session.remove(quote)
    db.session.commit()

    return redirect(url_for('quotes.quotes'))
