from flask import render_template, Blueprint, url_for, redirect


blueprint = Blueprint('index', __name__)


@blueprint.route('/')
def home():
    return redirect(url_for('quotes.quotes'))
    #return render_template('pages/placeholder.home.html')

# @blueprint.route('/about')
# def about():
#     return render_template('pages/placeholder.about.html')
