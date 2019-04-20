from gevent import monkey; monkey.patch_all()
import asyncio
import gevent.pywsgi
import werkzeug.serving
import logging.config
import logging
import yaml
import warnings
from pathlib import Path
from threading import Thread

from cleo.bot import MissCleo
from app import create_app

warnings.simplefilter(action='ignore', category=FutureWarning)


def setup_logging():
    # logging setup
    confpath = Path('config/logging.yaml')
    if confpath.exists():
        with confpath.open(mode='r') as cfgfile:
            logging.config.dictConfig(yaml.safe_load(cfgfile))
    else:
        logging.basicConfig(level=logging.INFO)

    with open('config/tokens.yaml', 'r') as tokefile:
        globals()['TOKENS'] = yaml.load(tokefile, Loader=yaml.FullLoader)

@werkzeug.serving.run_with_reloader
def main():
    setup_logging()
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)

    app = create_app('config')
    http = gevent.pywsgi.WSGIServer(('0.0.0.0', 5000), app.wsgi_app, log=app.logger)
    Thread(target=http.serve_forever).start()

    client = MissCleo(command_prefix="!", description="Miss Cleo", tokens=TOKENS)
    client.load_cogs()
    client.run(TOKENS['discord'])



if __name__ == "__main__":
    main()
