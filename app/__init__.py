import os
import asyncio
import logging
from getpass import getpass
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import generate_password_hash
from sassutils.wsgi import SassMiddleware
from cleo.db import Base, FlaskUser
from flask_jwt_extended import (
    JWTManager, jwt_required, create_access_token,
    get_jwt_identity
)
from flask_cors import CORS

db = SQLAlchemy(model_class=Base)

from app.controllers import quoteController
from app.controllers import loginController
from app.controllers import commandController
from app.controllers import indexController

# ignore sassutils strip_extension FutureWarning
import warnings
warnings.simplefilter(action='ignore', category=FutureWarning)


def add_user(app):
    '''Create Flask admin user'''

    # check if user table is empty.
    with app.app_context():
        if db.session.query(FlaskUser).all():
            return
        else:
            username = input("Enter Username: ")
            password = getpass()
            assert password == getpass('Password (again):')
            hashed = generate_password_hash(password)

            db.session.add(FlaskUser(username=username, password=hashed))
            db.session.commit()
            print('User added.')


def format_datetime(value, format="%m/%d/%Y"):
    if value is None:
        return ""
    return value.strftime(format)

loop = asyncio.new_event_loop()
asyncio.set_event_loop(loop)

app = Flask(__name__)
app.config.from_object('config')
app.debug = os.getenv("DEBUG", False)
app.url_map.strict_slashes = False

cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

# TODO: MOVE THIS
app.config['JWT_SECRET_KEY'] = 'super-secret'  # Change this!
jwt = JWTManager(app)
db.init_app(app)

app.register_blueprint(indexController.blueprint)
app.register_blueprint(quoteController.blueprint)
app.register_blueprint(commandController.blueprint)
app.register_blueprint(loginController.blueprint)

app.jinja_env.add_extension('jinja2.ext.do')
app.jinja_env.filters['formatdatetime'] = format_datetime
app.wsgi_app = SassMiddleware(app.wsgi_app, {
    'app': ('static/scss', 'static/css', 'static/css')
})

# add initial admin user if there isn't one.
add_user(app)

