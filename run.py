import logging
import logging.config
import yaml
from threading import Thread
from pathlib import Path

from app import create_app
from cleo.bot import MissCleo, tokens


# logging setup
log_config = 'config/logging.yaml'

path = Path(log_config)
if path.exists():
    with path.open(mode='r') as cfgfile:
        cfg = yaml.safe_load(cfgfile)

    logging.config.dictConfig(cfg)
else:
    logging.basicConfig(level=logging.INFO)


def main():
    app, http = create_app('config', debug=True)
    flask_thread = Thread(target=http.serve_forever)
    flask_thread.start()

    client = MissCleo(command_prefix="!", description="Miss Cleo")
    client.load_cogs()
    client.run(tokens['discord'])


if __name__ == "__main__":
    main()
