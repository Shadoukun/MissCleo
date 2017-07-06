import sys
import asyncio
from difflib import get_close_matches
from discord.ext import commands
from getpass import getpass
from flask_bcrypt import generate_password_hash
from app import db
from app.models import User, Admin, Channel, Macro, Quote, FlaskUser


async def findUser(ctx, username: str):

    memberconverter = commands.MemberConverter()

    # Try to get member from discord.py's member converter
    try:
        user = await memberconverter.convert(ctx, username)
        return user
    except:
        pass

    # else try to fuzzy match username from userlist
    users = ctx.guild.members
    names = (u.name.lower() for u in users)
    displaynames = (u.display_name.lower() for u in users)

    username = get_close_matches(username, names, 1)[0] or \
                    get_close_matches(username, displaynames, 1)[0]
    if username:
        for user in users:
            display_name = user.display_name.lower()
            name = user.name.lower()
            if (display_name == username) or (name == username):
                return user

            else:
                return None

def add_user(app):
    '''Create Flask admin user'''
    with app.app_context():
        if db.session.query(FlaskUser).all():
            return

        print('Enter Username: '),
        username = input()

        password = getpass()
        assert password == getpass('Password (again):')
        password = generate_password_hash(password)

        user = FlaskUser(username=username, password=password)
        db.session.add(user)
        db.session.commit()
        print('User added.')
