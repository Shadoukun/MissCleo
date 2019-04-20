import sys
from flask import render_template, Blueprint, request, send_from_directory, url_for, redirect
from flask import current_app as app
#from app import db

#from app.models import User
#from app.models import Admin
#from app.models import Channel
#from app.models import Macro
#from app.models import Quote
#from app.models import FlaskUser

blueprint = Blueprint('index', __name__)

@blueprint.route('/')
def home():
    return redirect(url_for('quotes.quotes'))
    #return render_template('pages/placeholder.home.html')

@blueprint.route('/about')
def about():
    return render_template('pages/placeholder.about.html')
