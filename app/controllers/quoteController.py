import sys
import json
import discord
from sqlalchemy import func
from flask import render_template, Blueprint, request

from app import db
from app.forms import *
from app.models import *


blueprint = Blueprint('quotes', __name__)


@blueprint.route('/quotes')
@blueprint.route('/quotes/<channel>')
@blueprint.route('/quotes/<channel>/<user>')
def quotes(channel=None, user=None):

    channel, channels, users, quotes = _getQuotes(channel, user)

    return render_template('quotes/quotes.html',
                           quotes=quotes,
                           channels=channels,
                           users=users,
                           curchannel=channel.name if channel else None)


def _getQuotes(channel=None, user=None):
    '''Returns a filtered list of quotes by channel, user.
       If no args provided, returns full quote list.'''

    if channel == 'all':
        channel = None

    allusers = db.session.query(User).filter(User.quotes.any())
    channels = db.session.query(Channel) \
                            .filter(Channel.quotes)

    # if a channel is given, filter by channel

    if channel:
            channel = db.session.query(Channel).filter_by(name=channel).first()
            quotes = db.session.query(Quote) \
                        .filter_by(channel_id=channel.id)
    # else if None, all quotes from all channels.
    else:
        quotes = db.session.query(Quote).all()

    # If a user is given, filter by user.
    if user:
        users = db.session.query(User).filter_by(id=user)
        quotes = db.session.query(Quote) \
                    .filter_by(user_id=users[0].id).all()

    # else, all users.
    else:
        users = allusers.all()

    return channel, channels, users, quotes

