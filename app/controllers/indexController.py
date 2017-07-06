import sys
from flask import render_template, Blueprint, request
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
    #users = User.query.all()
    return render_template('index/placeholder.home.html')


@blueprint.route('/about')
def about():
    return render_template('index/placeholder.about.html')
