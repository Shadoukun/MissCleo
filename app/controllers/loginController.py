from flask import render_template, Blueprint, redirect, url_for, jsonify, request
from flask_login import login_required, login_user, logout_user, current_user
from flask_bcrypt import check_password_hash

from cleo.db import FlaskUser
from ..forms import LoginForm
from .. import db
from flask_jwt_extended import get_jwt_identity, create_access_token
from flask_cors import cross_origin


blueprint = Blueprint('login', __name__)


@blueprint.route("/auth/login", methods=("GET", "POST"))
@cross_origin()
def login():
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
