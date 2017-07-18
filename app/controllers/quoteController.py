import sys
import json
import discord
from sqlalchemy import func
from flask import render_template, Blueprint, request, redirect, url_for
from flask_login import login_required

from app import db
from app.forms import *
from app.models import *

PAGE_SIZE = 20

blueprint = Blueprint('quotes', __name__)


@blueprint.route('/quotes')
def quotes(channel='all', user=None):

    user = request.args.get('user', None)
    channel = request.args.get('channel', 'all')
    page = int(request.args.get('page', 1))


    channel, channels, users, quotes = _getQuotes(channel, user)
    quotes, page_count = _paginate(quotes, page)

    return render_template('pages/quotes/quotes.html',
                           quotes=quotes,
                           pages=page_count,
                           current_page=page,
                           channels=channels,
                           users=users,
                           user=user,
                           current_channel=channel)


@blueprint.route("/delete_quote/<id>")
@login_required
def delete_quote(id):
    quote = db.session.query(Quote).filter_by(message_id=id).delete()
    db.session.commit()

    return redirect(url_for('quotes.quotes'))


def _getQuotes(channel, user=None):
    '''Returns a filtered list of quotes by channel, user.
       If no args provided, returns full quote list.'''

    current_channel = None

    if channel == 'all':
        channel = None
        current_channel = 'all'

    quotes = db.session.query(Quote)
    users = db.session.query(User).filter(User.quotes.any())
    channels = db.session.query(Channel) \
                            .filter(Channel.quotes)

    # if a channel is given, filter by channel
    if channel:
        channel = channels.filter_by(name=channel).first()
        quotes = quotes.filter_by(channel_id=channel.id)
        current_channel = channel.name

    if user:
        users = users.filter_by(id=user).all()
        quotes = quotes.filter_by(user_id=users[0].id)

    return current_channel, channels, users, quotes


def _paginate(quotes, page):

    page_count = int(quotes.count() / PAGE_SIZE)
    if page_count < 1:
        page_count = 1
    page -= 1

    quotes = quotes.offset(page*PAGE_SIZE).limit(PAGE_SIZE)

    return quotes, page_count
