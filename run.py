from gevent import monkey; monkey.patch_all()
import werkzeug.serving
import logging.config
import logging
import yaml
from pathlib import Path
from threading import Thread
from gevent.pywsgi import WSGIServer

from cleo.bot import MissCleo
from cleo.tasks import update_guilds, update_user_info
from app import app

# this is ugly and I hate it.
HOST = "https://127.0.0.1:5000/"

def setup_logging():
    # logging setup
    confpath = Path('config/logging.yaml')
    if confpath.exists():
        with confpath.open(mode='r') as cfgfile:
            logging.config.dictConfig(yaml.safe_load(cfgfile))
    else:
        logging.basicConfig(level=logging.INFO)

@werkzeug.serving.run_with_reloader
def main():
    setup_logging()

    # load tokens
    with open('config/tokens.yaml', 'r') as tokenfile:
        globals()['TOKENS'] = yaml.load(tokenfile, Loader=yaml.FullLoader)

    http = WSGIServer(('0.0.0.0', 5000), app.wsgi_app, log=app.logger)
    web_thread = Thread(target=http.serve_forever)
    web_thread.start()

    client = MissCleo(command_prefix="!", description="Miss Cleo", tokens=TOKENS, host=HOST)
    client.run(TOKENS['discord'])

if __name__ == "__main__":
    main()
