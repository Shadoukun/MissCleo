from dataclasses import dataclass
from typing import Any
from sqlalchemy import and_
from flask import render_template, Blueprint, request, redirect, url_for
from flask_login import login_required

from cleo.db import Quote, Guild, GuildMember
from .. import db


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

        self.guilds = db.session.query(Guild).all()

        if self.current_guild:
            member_filters = [GuildMember.guild_id == self.current_guild,
                              GuildMember.quotes.any(Quote.guild_id == self.current_guild)]

            quote_filters = [Quote.guild_id == self.current_guild,
                             GuildMember.guild_id == self.current_guild]

            if self.current_member:
                member_filters += [GuildMember.user_id == self.current_member]
                quote_filters += [Quote.user_id == self.current_member,
                                  GuildMember.user_id == self.current_member]

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
