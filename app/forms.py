from flask import request
from flask_wtf import FlaskForm as Form
from wtforms import TextField, PasswordField, StringField, TextAreaField
from wtforms.validators import DataRequired, EqualTo, Length, Required
from flask_bcrypt import check_password_hash

from . import db
from cleo.db import FlaskUser

class LoginForm(Form):
    username = TextField('Username', [Required()])
    password = PasswordField('Password', [Required()])

    def __init__(self, *args, **kwargs):
        #kwargs['formdata'] = request.form
        super().__init__(*args, **kwargs)
        self.user = None

    def validate(self):

        if not Form.validate(self):
            return False

        self.user = db.session.query(FlaskUser) \
                .filter_by(username=self.username.data).first()

        if self.user is None:
            self.username.errors.append('Unknown username')
            return False

        if not check_password_hash(self.user.password, self.password.data):
            self.password.errors.append('Invalid password')
            return False

        return True


class CommandForm(Form):
    command = StringField('Command', [Length(min=1, max=10), Required()])
    response = TextAreaField('Response', [Length(min=1, max=500), Required()])
