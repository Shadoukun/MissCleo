import asyncio
import logging
import yaml
from threading import Thread
from gevent.pywsgi import WSGIServer
from cleo.bot import MissCleo, tokens
from app import create_app
from gevent import monkey; monkey.patch_all()



def main():
    app = create_app('config', debug=False)
    http = WSGIServer(('', 5000), app.wsgi_app)
    flask_thread = Thread(target=http.serve_forever)
    flask_thread.start()

    client = MissCleo(command_prefix="!", description="Miss Cleo")
    client.load_cogs()
    client.run(tokens['discord'])





if __name__ == "__main__":
    main()
