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
from cleo.db import Quote, User, Channel, Guild
from ..forms import *


blueprint = Blueprint('quotes', __name__)

@dataclass
class PageData:
    current_guild: Any = None
    current_user: Any = None
    current_page: int = 1

    guilds: Any = None
    users: Any = None
    quotes: Any = None
    pages: Any = None

    def __post_init__(self):
        self.current_guild = db.session.query(Guild).filter_by(id=self.current_guild).first()
        self.current_user = db.session.query(User).filter_by(id=self.current_user).first()
        guilds = db.session.query(Guild)
        users = db.session.query(User)
        quotes = db.session.query(Quote)

        if self.current_guild:
            users = users.filter_by(guild_id=self.current_guild.id)

            quotes = quotes.filter_by(guild_id=self.current_guild.id)

        if self.current_user:
            quotes = quotes.filter_by(user_id=self.current_user.id)

        self.guilds = guilds.all()
        self.users = users.filter(User.quotes.any()).all()
        self.quotes = quotes.order_by(Quote.timestamp.desc())
        self.pages = self.quotes.paginate(self.current_page, 10, False)


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
