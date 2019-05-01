import requests
from flask import render_template, Blueprint, request, redirect, url_for, flash
from flask_login import login_required
from app.forms import CommandForm

from cleo.db import Macro, MacroResponse, MacroReaction
from .. import db

blueprint = Blueprint('macros', __name__)

@blueprint.route('/macros')
def index():
    return render_template('pages/macros/index.html')

@blueprint.route('/macros/macros')
@blueprint.route('/macros/macros/<int:macro_id>')
@login_required
def macros(macro_id=None):
    form = CommandForm(request.form)
    macros = db.session.query(Macro).all()
    current_macro = None
    if macro_id:
        current_macro = db.session.query(Macro).filter_by(id=macro_id).first()

    return render_template('pages/macros/macros.html', macros=macros, form=form, current_macro=current_macro)

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


    elif (request.method == 'GET') and (macro_id):
        if operation == 'delete':
            requests.get('http://127.0.0.1:10000/remove_macro',
                         params=[('id', int(macro_id))])

    return redirect(url_for('macros.macros'))


@blueprint.route('/macros/responses')
@blueprint.route('/macros/responses/<int:macro_id>')
@login_required
def responses(macro_id=None):
    form = CommandForm(request.form)
    resp_list = db.session.query(MacroResponse).all()

    if macro_id:
        resp = db.session.query(MacroResponse).filter_by(id=macro_id).first()
    else:
        resp = None

    return render_template('pages/macros/responses.html', responses=resp_list, form=form, current_macro=resp)

@login_required
@blueprint.route('/macros/responses/<int:macro_id>/<string:operation>', methods=['POST', 'GET'])
@blueprint.route('/macros/responses/<string:operation>', methods=['POST', 'GET'])
def edit_responses(operation, macro_id=None):

    if request.method == 'POST':
        form = CommandForm(request.form)

        if not form.validate_on_submit():
            flash(form.errors)

        if operation == 'new':
            resp = MacroResponse(form.command.data, form.response.data)
            db.session.add(resp)
            db.session.commit()

            requests.get('http://127.0.0.1:10000/update_responses')

        elif operation == 'edit':
            resp = db.session.query(MacroResponse).filter_by(id=macro_id).first()
            resp.trigger = form['command'].data
            resp.response = form['response'].data
            db.session.commit()

            requests.get('http://127.0.0.1:10000/update_responses')

    elif (request.method == 'GET') and (macro_id):
        if operation == 'delete':
            db.session.query(MacroResponse).filter_by(id=macro_id).delete()
            db.session.commit()

            requests.get('http://127.0.0.1:10000/update_responses')

    return redirect(url_for('macros.responses'))

@blueprint.route('/macros/reactions')
@blueprint.route('/macros/reactions/<int:macro_id>')
@login_required
def reactions(macro_id=None):
    form = CommandForm(request.form)
    reaction_list = db.session.query(MacroReaction).all()
    print(reaction_list)

    if macro_id:
        reaction = db.session.query(MacroReaction).filter_by(id=macro_id).first()
        return render_template('pages/macros/reactions.html',
                               reactions=reaction_list,
                               form=form,
                               current_macro=reaction)
    else:
        return render_template('pages/macros/reactions.html',
                               current_macro=reaction_list,
                               form=form)

@login_required
@blueprint.route('/macros/reactions/<int:macro_id>/<string:operation>', methods=['POST', 'GET'])
@blueprint.route('/macros/reactions/<string:operation>', methods=['POST', 'GET'])
def edit_reactions(operation, macro_id=None):
    if request.method == 'POST':
        form = CommandForm(request.form)

        if not form.validate_on_submit():
            flash(form.errors)

        if operation == 'new':
            reaction = MacroReaction(form.command.data, form.response.data)
            db.session.add(reaction)
            db.session.commit()

            requests.get('http://127.0.0.1:10000/update_reactions')

        elif operation == 'edit':
            reaction = db.session.query(MacroReaction).filter_by(id=macro_id).first()
            reaction.trigger = form['command'].data
            reaction.reaction = form['response'].data
            db.session.commit()

            requests.get('http://127.0.0.1:10000/update_reactions')

    elif (request.method == 'GET') and (macro_id):
        if operation == 'delete':
            reaction = db.session.query(MacroReaction).filter_by(id=macro_id).delete()
            db.session.commit()

            requests.get('http://127.0.0.1:10000/update_reactions')

    return redirect(url_for('macros.reactions'))
