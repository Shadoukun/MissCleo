from flask_jwt_extended import jwt_required
import requests
import json
from flask import render_template, Blueprint, request, redirect, url_for, flash, Response
from flask_login import login_required
from flask_cors import cross_origin
from app.forms import CommandForm

from cleo.db import CustomCommand, CustomResponse, CustomReaction, new_alchemy_encoder
from .. import db

blueprint = Blueprint('commands', __name__)


@blueprint.route('/addcommand', methods=['POST'])
@jwt_required
@cross_origin()
def add_command():
    data = request.json
    command = CustomCommand(data['command'], data['response'], 1)
    print(f"{command.command}, {command.response}")
    db.session.add(command)
    db.session.commit()

    requests.get('http://127.0.0.1:10000/update_commands')

    return Response(None, status=200, mimetype='application/json')


@blueprint.route('/editcommand', methods=['POST'])
@jwt_required
@cross_origin()
def edit_command():

    data = request.json
    if data['id']:
        command = db.session.query(CustomCommand).filter_by(id=data['id']).first()
        if not command:
            return Response(None, status=400, mimetype='application/json')
        command.command = data['command']
        command.response = data['response']
        db.session.commit()
        requests.get('http://127.0.0.1:10000/update_commands')

    return Response(None, status=200, mimetype='application/json')


@blueprint.route('/getcommands', methods=['GET'])
@jwt_required
@cross_origin()
def get_commands():
    cmds = db.session.query(CustomCommand).all()
    cmds = json.dumps(cmds, cls=new_alchemy_encoder(False, ['member']))
    return Response(cmds, mimetype='application/json')
