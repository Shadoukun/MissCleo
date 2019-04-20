import os
import logging
from getpass import getpass
from flask import Flask
from flask_wtf import CSRFProtect
from flask_login import LoginManager
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import generate_password_hash
from sassutils.wsgi import SassMiddleware

from cleo.db import Base, FlaskUser

login_manager = LoginManager()
db = SQLAlchemy(model_class=Base)

from app.controllers import quoteController
from app.controllers import loginController
from app.controllers import statsController
from app.controllers import macroController
from app.controllers import indexController


def add_user(app):
    '''Create Flask admin user'''
    with app.app_context():
        if db.session.query(FlaskUser).all():
            return

        print('Enter Username: ')
        username = input()

        password = getpass()
        assert password == getpass('Password (again):')
        password = generate_password_hash(password)

        user = FlaskUser(username=username, password=password)
        db.session.add(user)
        db.session.commit()
        print('User added.')


def format_datetime(value, format="%m/%d/%Y"):
    if value is None:
        return ""
    return value.strftime(format)

def create_app(config_filename):
    app = Flask(__name__)
    app.config.from_object(config_filename)
    app.debug = os.getenv("DEBUG", False)
    app.url_map.strict_slashes = False

    CSRFProtect(app)
    db.init_app(app)
    login_manager.init_app(app)

    app.register_blueprint(indexController.blueprint)
    app.register_blueprint(quoteController.blueprint)
    app.register_blueprint(macroController.blueprint)
    app.register_blueprint(statsController.blueprint)
    app.register_blueprint(loginController.blueprint)

    # add initial admin user if there isn't one.
    add_user(app)

    app.jinja_env.add_extension('jinja2.ext.do')
    app.jinja_env.filters['formatdatetime'] = format_datetime
    app.wsgi_app = SassMiddleware(app.wsgi_app, {
        'app': ('static/scss', 'static/css', 'static/css')
    })

    return app
