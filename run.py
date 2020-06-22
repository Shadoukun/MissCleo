import logging.config
import logging
import yaml
from pathlib import Path
from threading import Thread
import config
from cleo.bot import MissCleo
import watchgod

def setup_logging():
    # logging setup
    confpath = Path('config/logging.yaml')
    if confpath.exists():
        with confpath.open(mode='r') as cfgfile:
            logging.config.dictConfig(yaml.safe_load(cfgfile))
    else:
        logging.basicConfig(level=logging.INFO)

def main():
    setup_logging()

    # load tokens
    with open('config/tokens.yaml', 'r') as tokenfile:
        tokens = yaml.load(tokenfile, Loader=yaml.FullLoader)
        # make tokens global cuz I'm lazy.
        globals()['TOKENS'] = tokens

    client = MissCleo(command_prefix="!", description="Miss Cleo", tokens=tokens)
    client.run(tokens['discord'])

if __name__ == "__main__":
    if config.DEBUG:
        watchgod.run_process('./cleo', main)
    else:
        main()
