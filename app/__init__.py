import logging
from flask import Flask, redirect, url_for, request as req
from flask_wtf import CSRFProtect
from flask_login import LoginManager
from flask_sqlalchemy import SQLAlchemy
from sassutils.wsgi import SassMiddleware
from sassutils.builder import build_directory

login_manager = LoginManager()
db = SQLAlchemy()

from app.controllers import indexController
from app.controllers import macroController
from app.controllers import statsController
from app.controllers import loginController
from app.controllers import quoteController

def create_app(config_filename, debug=False):
    app = Flask(__name__)
    app.config.from_object(config_filename)
    app.login_manager = login_manager
    log = logging.getLogger('werkzeug')

    db.init_app(app)
    CSRFProtect(app)
    login_manager.init_app(app)

    app.register_blueprint(indexController.blueprint)
    app.register_blueprint(quoteController.blueprint)
    app.register_blueprint(macroController.blueprint)
    app.register_blueprint(statsController.blueprint)
    app.register_blueprint(loginController.blueprint)


    if debug:

        log.setLevel(logging.NOTSET)
        app.logger.setLevel(logging.NOTSET)

        # compile SCSS to CSS with every request.
        # useful for updating/debugging styles.

        app.wsgi_app = SassMiddleware(app.wsgi_app, {
            'app': ('static/scss', 'static/css', 'static/css')
            })

    else:

        log.setLevel(logging.INFO)
        app.logger.setLevel(logging.INFO)

        # compile once at start.

        build_directory("app/static/scss", "app/static/css")

    return app
