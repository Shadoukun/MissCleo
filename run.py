from gevent import monkey; monkey.patch_all()
import werkzeug.serving
import logging.config
import logging
import yaml
from pathlib import Path
from threading import Thread
from config import PORT
from cleo.bot import MissCleo


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

    client = MissCleo(command_prefix="!", description="Miss Cleo", tokens=TOKENS)
    client.run(TOKENS['discord'])

if __name__ == "__main__":
    main()
