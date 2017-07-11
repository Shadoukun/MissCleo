import sys
import discord
import json
from flask import render_template, Blueprint, request, redirect, url_for, flash
from flask.views import MethodView
from flask_login import login_required
from app.forms import CommandForm
import requests

from app import db
from app.models import *


blueprint = Blueprint('macros', __name__)

@blueprint.route('/macros')
def index():
    return render_template('macros/index.html')



@blueprint.route('/macros/macros')
@blueprint.route('/macros/macros/<int:macro_id>')
@login_required
def macros(macro_id=None):
    form = CommandForm(request.form)
    macros = db.session.query(Macro).all()

    if macro_id:
        macro = db.session.query(Macro).filter_by(id=macro_id).first()
        return render_template('macros/macros.html', macros=macros, form=form, current_macro=macro)
    else:
        return render_template('macros/macros.html', macros=macros, form=form)

@login_required
@blueprint.route('/macros/macros/<int:macro_id>/<string:operation>', methods=['POST', 'GET'])
@blueprint.route('/macros/macros/<string:operation>', methods=['POST', 'GET'])
def edit_macros(operation, macro_id=None):
    if request.method == 'POST':
        form = CommandForm(request.form)

        if not form.validate_on_submit():
            flash(form.errors)
            return

        if operation == 'new':
            macro = Macro(form.command.data, form.response.data, 1)
            db.session.add(macro)
            db.session.commit()

            requests.get('http://127.0.0.1:10000/update_macros')

        if operation == 'edit':
            macro = db.session.query(Macro).filter_by(id=macro_id).first()
            macro.command = form['command'].data
            macro.response = form['response'].data
            macro.modified_flag = 1
            db.session.commit()

            requests.get('http://127.0.0.1:10000/update_macros')


    if (request.method == 'GET') and (macro_id):
        if operation == 'delete':
            db.session.query(Macro).filter_by(id=macro_id).delete()
            db.session.commit()

            requests.get('http://127.0.0.1:10000/update_macros')

    return redirect(url_for('macros.macros'))


@blueprint.route('/macros/responses')
@blueprint.route('/macros/responses/<int:resp_id>')
@login_required
def responses(resp_id=None):
    form = CommandForm(request.form)
    response_list = db.session.query(MacroResponse).all()

    if resp_id:
        resp = db.session.query(MacroResponse).filter_by(id=resp_id).first()
        return render_template('macros/responses.html', responses=response_list, form=form, current_resp=resp)
    else:
        return render_template('macros/responses.html', responses=response_list, form=form)

@login_required
@blueprint.route('/macros/responses/<int:resp_id>/<string:operation>', methods=['POST', 'GET'])
@blueprint.route('/macros/responses/<string:operation>', methods=['POST', 'GET'])
def edit_responses(operation, resp_id=None):
    if request.method == 'POST':
        form = CommandForm(request.form)

        if not form.validate_on_submit():
            flash(form.errors)

        if operation == 'new':
            resp = MacroResponse(form.command.data, form.response.data)
            db.session.add(resp)
            db.session.commit()

            requests.get('http://127.0.0.1:10000/update_responses')

        if operation == 'edit':
            resp = db.session.query(MacroResponse).filter_by(id=resp_id).first()
            resp.trigger = form['command'].data
            resp.response = form['response'].data
            db.session.commit()

            requests.get('http://127.0.0.1:10000/update_responses')

    if (request.method == 'GET') and (resp_id):
        if operation == 'delete':
            db.sessin.query(MacroResponse).filter_by(id=resp_id).delete()
            db.session.commit()

            requests.get('http://127.0.0.1:10000/update_responses')

    return redirect(url_for('macros.responses'))

@blueprint.route('/macros/reactions')
@blueprint.route('/macros/reactions/<int:react_id>')
@login_required
def reactions(react_id=None):
    form = CommandForm(request.form)
    reaction_list = db.session.query(MacroReaction).all()

    if react_id:
        reaction = db.session.query(MacroReaction).filter_by(id=react_id).first()
        return render_template('macros/reactions.html', reactions=reaction_list, form=form, current_react=reaction)
    else:
        return render_template('macros/reactions.html', reactions=reaction_list, form=form)

@login_required
@blueprint.route('/macros/reactions/<int:react_id>/<string:operation>', methods=['POST', 'GET'])
@blueprint.route('/macros/reactions/<string:operation>', methods=['POST', 'GET'])
def edit_reactions(operation, react_id=None):
    if request.method == 'POST':
        form = CommandForm(request.form)

        if not form.validate_on_submit():
            flash(form.errors)

        if operation == 'new':
            reaction = MacroReaction(form.command.data, form.response.data)
            db.session.add(reaction)
            db.session.commit()

            requests.get('http://127.0.0.1:10000/update_reactions')

        if operation == 'edit':
            reaction = db.session.query(MacroReaction).filter_by(id=react_id).first()
            reaction.trigger = form['command'].data
            reaction.reaction = form['response'].data
            db.session.commit()

            requests.get('http://127.0.0.1:10000/update_reactions')

    if (request.method == 'GET') and (react_id):
        if operation == 'delete':
            reaction.query.filter_by(id=react_id).delete()
            db.session.commit()

            requests.get('http://127.0.0.1:10000/update_reactions')

    return redirect(url_for('macros.reactions'))
