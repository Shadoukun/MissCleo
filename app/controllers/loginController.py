from flask import render_template, Blueprint, redirect, url_for, jsonify, request
from flask_login import login_required, login_user, logout_user, current_user
from flask_bcrypt import check_password_hash

from cleo.db import FlaskUser
from ..forms import LoginForm
from .. import db
from flask_jwt_extended import get_jwt_identity, create_access_token


blueprint = Blueprint('login', __name__)

# login_manager.login_message = "This page requires you to sign in."
# login_manager.login_view = "login.login"

@blueprint.route("/auth/login", methods=("GET", "POST"))
def login():
    """For GET requests, display the login form. For POSTS, login the current user
    by processing the form."""

    if not request.is_json:
        return jsonify({"msg": "Missing JSON in request"}), 400

    username = request.json.get('userName', None)
    password = request.json.get('password', None)
    
    if not username:
        return jsonify({"msg": "Missing username parameter"}), 400
    
    if not password:
        return jsonify({"msg": "Missing password parameter"}), 400

    user = db.session.query(FlaskUser).filter_by(username=username).first()
    if user:
        if check_password_hash(user.password, password):
            access_token = create_access_token(identity=user.username)
            return jsonify(access_token=access_token), 200

    # form = LoginForm()
    # print(form.username)
    # if form.validate_on_submit():
    #     print(form.username.data)
    #     print(form.password.data)
    #     user = db.session.query(FlaskUser).filter_by(username=form.username.data).first()
    #     print(user)
    #     if user:
    #         if check_password_hash(user.password, form.password.data):
    #             print("TRUE")
    #             access_token = create_access_token(identity=user.username)
               
    #            # user.authenticated = True
    #            # db.session.add(user)
    #            # db.session.commit()
    #            # login_user(user, remember=True)
                
    #             return jsonify(access_token=access_token), 200
    #             #return redirect(url_for("index.home"))

    return 400
    #return render_template("pages/login.html", form=form)



# @blueprint.route("/auth/logout", methods=["GET"])
# @login_required
# def logout():
#     """Logout the current user."""
#     user = current_user
#     user.authenticated = False
#     db.session.add(user)
#     db.session.commit()
#     logout_user()
#     return redirect(url_for("index.home"))


# @login_manager.user_loader
# def user_loader(user_id):
#     """Given *user_id*, return the associated User object.

#     :param unicode user_id: user_id (email) user to retrieve
#     """
#     return db.session.query(FlaskUser).get(user_id)
