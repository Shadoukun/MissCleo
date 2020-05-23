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
    command = CustomCommand(**data)
    print(f"{command.command}, {command.response}")
    db.session.add(command)
    db.session.commit()
    db.session.refresh(command)

    requests.get('http://127.0.0.1:10000/update_commands', {'id': command.id})

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

        # set response entry columns from list.
        fields = ['command', 'response', 'description']
        for f in fields:
           setattr(command, f, data[f])

        db.session.commit()
        requests.get('http://127.0.0.1:10000/update_commands', {'id': command.id})

    return Response(None, status=200, mimetype='application/json')


@blueprint.route('/getcommands', methods=['GET'])
@jwt_required
@cross_origin()
def get_commands():
    cmds = db.session.query(CustomCommand).all()
    cmds = json.dumps(cmds, cls=new_alchemy_encoder(False, []))
    return Response(cmds, mimetype='application/json')


@blueprint.route('/removecommand', methods=['POST'])
@jwt_required
@cross_origin()
def remove_command():
    data = request.json
    if data['id']:
        db.session.query(CustomCommand).filter_by(id=data['id']).delete()
        db.session.commit()
        requests.get('http://127.0.0.1:10000/update_commands', {'id': data['id'], 'name': data['name']})

        return Response(None, status=200, mimetype='application/json')

    return Response(None, status=500, mimetype='application/json')


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
    response = CustomResponse(**data)
    db.session.add(response)
    db.session.commit()
    db.session.refresh(response)

    requests.get('http://127.0.0.1:10000/update_responses', {'id': response.id})

    return Response(None, status=200, mimetype='application/json')


@blueprint.route('/editresponse', methods=['POST'])
@jwt_required
@cross_origin()
def edit_response():
    data = request.json
    if data['id']:
        response = db.session.query(CustomResponse) \
                            .filter_by(id=data['id']).first()
        if not response:
            return Response(None, status=400, mimetype='application/json')

        # set response entry columns from list.
        fields = ['name', 'description', 'trigger', 'response', 'use_regex', 'multi_response']
        for f in fields:
           setattr(response, f, data[f])

        db.session.commit()
        requests.get('http://127.0.0.1:10000/update_responses', {'id': response.id})

    return Response(None, status=200, mimetype='application/json')


@blueprint.route('/removeresponse', methods=['POST'])
@jwt_required
@cross_origin()
def remove_response():
    data = request.json
    if data['id']:
        db.session.query(CustomResponse).filter_by(id=data['id']).delete()
        db.session.commit()

        requests.get('http://127.0.0.1:10000/update_responses', {'id': data['id']})

        return Response(None, status=200, mimetype='application/json')

    return Response(None, status=500, mimetype='application/json')

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
    reaction = CustomReaction(**data)
    db.session.add(reaction)
    db.session.commit()
    db.session.refresh(reaction)


    requests.get('http://127.0.0.1:10000/update_reactions', {'id': reaction.id})

    return Response(None, status=200, mimetype='application/json')


@blueprint.route('/editreaction', methods=['POST'])
@jwt_required
@cross_origin()
def edit_reaction():

    data = request.json
    if data['id']:
        reaction = db.session.query(CustomReaction) \
                            .filter_by(id=data['id']).first()
        if not reaction:
            return Response(None, status=400, mimetype='application/json')

        # set react entry columns from list.
        fields = ['name', 'description', 'trigger', 'reaction', 'use_regex']
        for f in fields:
           setattr(reaction, f, data[f])

        db.session.commit()
        requests.get('http://127.0.0.1:10000/update_reactions', {'id': reaction.id})

    return Response(None, status=200, mimetype='application/json')


@blueprint.route('/removereaction', methods=['POST'])
@jwt_required
@cross_origin()
def remove_reaction():
    data = request.json
    if data['id']:
        db.session.query(CustomReaction).filter_by(id=data['id']).delete()
        db.session.commit()
        requests.get('http://127.0.0.1:10000/remove_reaction', {'id': data['id']})

        return Response(None, status=200, mimetype='application/json')

    return Response(None, status=500, mimetype='application/json')
