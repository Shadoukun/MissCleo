from flask_jwt_extended import jwt_required
import requests
import json
from flask import render_template, Blueprint, request, redirect, url_for, flash, Response
from flask_login import login_required
from flask_cors import cross_origin

from cleo.db import CustomCommand, CustomResponse, CustomReaction, new_alchemy_encoder
from .. import db

blueprint = Blueprint('commands', __name__)


# COMMANDS #

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
    cmds = json.dumps(cmds, cls=new_alchemy_encoder(False, []))
    return Response(cmds, mimetype='application/json')


# RESPONSES #

@blueprint.route('/getresponses', methods=['GET'])
@jwt_required
@cross_origin()
def get_responses():
    responses = db.session.query(CustomResponse).all()
    responses = json.dumps(responses, cls=new_alchemy_encoder(False, []))
    return Response(responses, mimetype='application/json')


@blueprint.route('/addresponse', methods=['POST'])
@jwt_required
@cross_origin()
def add_response():
    data = request.json
    response = CustomResponse(data['trigger'], data['response'])
    db.session.add(response)
    db.session.commit()

    requests.get('http://127.0.0.1:10000/update_responses')

    return Response(None, status=200, mimetype='application/json')


@blueprint.route('/editresponse', methods=['POST'])
@jwt_required
@cross_origin()
def edit_response():
    data = request.json
    if data['id']:
        response = db.session.query(
            CustomResponse).filter_by(id=data['id']).first()
        if not response:
            return Response(None, status=400, mimetype='application/json')

        response.trigger = data['trigger']
        response.response = data['response']
        db.session.commit()
        requests.get('http://127.0.0.1:10000/update_responses')

    return Response(None, status=200, mimetype='application/json')


# REACTIONS #

@blueprint.route('/getreactions', methods=['GET'])
@jwt_required
@cross_origin()
def get_reactions():
    reactions = db.session.query(CustomReaction).all()
    reactions = json.dumps(reactions, cls=new_alchemy_encoder(False, []))
    return Response(reactions, mimetype='application/json')


@blueprint.route('/addreaction', methods=['POST'])
@jwt_required
@cross_origin()
def add_reaction():
    data = request.json
    reaction = CustomReaction(data['trigger'], data['response'])
    db.session.add(reaction)
    db.session.commit()

    requests.get('http://127.0.0.1:10000/update_reactions')

    return Response(None, status=200, mimetype='application/json')


@blueprint.route('/editreaction', methods=['POST'])
@jwt_required
@cross_origin()
def edit_reaction():

    data = request.json
    if data['id']:
        reaction = db.session.query(
            CustomReaction).filter_by(id=data['id']).first()
        if not reaction:
            return Response(None, status=400, mimetype='application/json')

        reaction.trigger = data['trigger']
        reaction.reaction = data['reaction']
        db.session.commit()
        requests.get('http://127.0.0.1:10000/update_reactions')

    return Response(None, status=200, mimetype='application/json')
