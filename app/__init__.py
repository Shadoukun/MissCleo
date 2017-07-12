import logging
from getpass import getpass
from flask import Flask, redirect, url_for, request as req
from flask_wtf import CSRFProtect
from flask_login import LoginManager
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import generate_password_hash
from sassutils.wsgi import SassMiddleware
from sassutils.builder import build_directory
from gevent.pywsgi import WSGIServer
from gevent import monkey; monkey.patch_all()

login_manager = LoginManager()
db = SQLAlchemy()

from app.controllers import indexController
from app.controllers import macroController
from app.controllers import statsController
from app.controllers import loginController
from app.controllers import quoteController

from app.models import FlaskUser


def create_app(config_filename, debug=False):
    app = Flask(__name__)
    app.config.from_object(config_filename)
    app.login_manager = login_manager
    log = logging.getLogger('werkzeug')

    db.init_app(app)
    CSRFProtect(app)
    login_manager.init_app(app)
    # add initial admin user if there isn't one.
    add_user(app)

    app.register_blueprint(indexController.blueprint)
    app.register_blueprint(quoteController.blueprint)
    app.register_blueprint(macroController.blueprint)
    app.register_blueprint(statsController.blueprint)
    app.register_blueprint(loginController.blueprint)


    if debug:
        # compile SCSS to CSS with every request.
        # useful for updating/debugging styles.
        app.wsgi_app = SassMiddleware(app.wsgi_app, {
            'app': ('static/scss', 'static/css', 'static/css')
            })
    else:
        # compile stylesheets once at start.
        build_directory("app/static/scss", "app/static/css")

    # create wsgi server

    http = WSGIServer(('', 5000), app.wsgi_app, log=app.logger)


    return app, http


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
