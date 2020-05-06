import requests
import json
from flask import render_template, Blueprint, request, redirect, url_for, flash, Response
from flask_login import login_required
from app.forms import CommandForm

from cleo.db import Macro, MacroResponse, MacroReaction, new_alchemy_encoder
from .. import db

blueprint = Blueprint('macros', __name__)


@blueprint.route('/addcommand', methods=['POST'])
def add_command():
    data = request.json
    command = Macro(data['command'], data['response'], 1)
    print(f"{command.command}, {command.response}")
    db.session.add(command)
    db.session.commit()

    requests.get('http://127.0.0.1:10000/update_macros')

    return Response(None, status=200, mimetype='application/json')

    

@blueprint.route('/editcommand', methods=['POST'])
def edit_command():

    data = request.json
    if data['id']:
        command = db.session.query(Macro).filter_by(id=data['id']).first()
        if not command:
            return Response(None, status=400, mimetype='application/json')
        command.command = data['command']
        command.response = data['response']
        db.session.commit()
        requests.get('http://127.0.0.1:10000/update_macros')

    return Response(None, status=200, mimetype='application/json')
        

    # guild = request.args.get('guild', None)


@blueprint.route('/getcommands', methods=['GET'])
def get_commands():
    cmds = db.session.query(Macro).all()
    cmds = json.dumps(cmds, cls=new_alchemy_encoder(False, ['member']))
    return Response(cmds, mimetype='application/json')
