import sys
from flask import render_template, Blueprint, redirect, url_for, flash
from flask.views import MethodView
from flask_wtf import Form
from flask_login import *
from wtforms import TextField, PasswordField, validators
from flask_bcrypt import check_password_hash

from app import db, login_manager
from app.forms import LoginForm

from app.models import *

blueprint = Blueprint('login', __name__)

login_manager.login_message = "This page requires you to sign in."
login_manager.login_view = "login.login"

@blueprint.route("/login", methods=["GET", "POST"])
def login():
    """For GET requests, display the login form. For POSTS, login the current user
    by processing the form."""

    form = LoginForm()
    if form.validate_on_submit():
        user = db.session.query(FlaskUser).filter_by(username=form.username.data).first()
        if user:
            if check_password_hash(user.password, form.password.data):
                user.authenticated = True
                db.session.add(user)
                db.session.commit()
                login_user(user, remember=True)
                return redirect(url_for("index.home"))
    return render_template("pages/login.html", form=form)


@blueprint.route("/logout", methods=["GET"])
@login_required
def logout():
    """Logout the current user."""
    user = current_user
    user.authenticated = False
    db.session.add(user)
    db.session.commit()
    logout_user()
    return redirect(url_for("index.home"))



@login_manager.user_loader
def user_loader(user_id):
    """Given *user_id*, return the associated User object.

    :param unicode user_id: user_id (email) user to retrieve
    """
    return db.session.query(FlaskUser).get(user_id)
