import os

DEBUG = False
SECRET_KEY = 'my precious'
BASE_DIR = os.path.abspath(os.path.dirname(__file__))

HOST = '0.0.0.0'
PORT = int(os.environ.get('PORT', 5000))
HOST_URL = f"http://{HOST}:{str(PORT)}/"

SQLALCHEMY_TRACK_MODIFICATIONS = False
SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.getcwd() + '/database.db'
