import sys
import json
import itertools
import arrow
import discord
from collections import namedtuple
from sqlalchemy.sql.expression import func
from flask import render_template, Blueprint, request
from .. import db
from app.forms import *

blueprint = Blueprint('stats', __name__)


@blueprint.route('/stats')
def stats():
    """Main Stats Route"""
    hourly_stats = _hourlyStats()
    daily_stats = _dailyStats()
    quote_stats = _quoteStats()
    return render_template('pages/stats/stats.html',
                           hourly_stats=hourly_stats,
                           daily_stats=daily_stats,
                           quote_stats=quote_stats)


def _quoteStats():

    userlist = dict()
    quotes = db.session.query(Quote).all()

    for quote in quotes:

        if quote.user:
            if quote.user.display_name:
                user = quote.user.display_name
            # weird issue if user left server.
            else:
                user = discord.utils.get(message.server.members, id=quote.userid).display_name
        else:
            continue

        if user in userlist.keys():
            userlist[user]['quotes'].append(quote)
        else:
            userlist[user] = {"user": user, "quotes": [quote]}

    data = {
        'type': 'pie',
        'name': 'User share',
        'data': list()
        }

    for user in userlist.keys():
        total = len(quotes)
        user_total = len(userlist[user]['quotes'])
        percentage = 100 * float(user_total) / float(total)
        data['data'].append([user, round(percentage, 1)])

    quote_stats = json.dumps(data)
    return quote_stats


def _hourlyStats():
    stats = db.session.query(MessageStat).all()
    hours = []
    msgcounts = []

    for s in stats:
        msgcounts.append(s.messagecount)
        if s.timestamp:
            s.timestamp.replace(minute=0, second=0, microsecond=0)
            hours.append(s.timestamp.strftime("%H:%M"))

    hourlyStats = (hours, msgcounts)
    return hourlyStats


def _dailyStats():
    stats = db.session.query(MessageStat).all()
    timestamps = []
    msgcounts = []

    for s in stats:
        msgcounts.append(s.messagecount)
        if s.timestamp:
            timestamps.append(s.timestamp)

    daily_stats = convert_dates(timestamps, msgcounts)

    return daily_stats



def convert_dates(tstamps, msgs):
    tstamps = [arrow.get(x).format('MMMM DD, YYYY') for x in tstamps]
    date = namedtuple('timestamps', ['timestamp', 'msgcount'])
    dates = [date(t, m) for t, m in zip(tstamps, msgs)]

    date_map = {
        key: [date.msgcount for date in group]
        for key, group in itertools.groupby(dates, lambda date: date.timestamp)
    }

    date_list = []
    date_list.append([k for k in date_map.keys()][:-1])
    date_list.append([sum(v) for v in date_map.values()][:-1])

    # remove current(ongoing) day from list.
    return date_list
