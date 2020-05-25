import re
from aiohttp import web
from aiohttp_middlewares import cors_middleware
from aiohttp_middlewares.cors import DEFAULT_ALLOW_HEADERS
from aiohttp_jwt import JWTMiddleware, login_required

import config
from .login import login_routes
from .quotes import quote_routes

class CleoAPI:

    def __init__(self):
        self.routes = {}
        self.private_routes = {}

        self.app = web.Application(middlewares=[])

        # CORS middleware allows CORS from localhost
        self.app.middlewares.append(
            cors_middleware(
                origins=[re.compile(r"^https?\:\/\/localhost")]
            )
        )

        self.app.middlewares.append(
            JWTMiddleware(
                config.JWT_SECRET,
                request_property="user",
                credentials_required=False,
            )
        )

        self.app.router.add_routes(login_routes)
        self.app.router.add_routes(quote_routes)
        self.app.router.add_route('*', '/public/{name}', self.public_handler)
        self.app.router.add_route('*', '/{name}', self.private_handler)

        self.handler = self.app.make_handler()

    async def public_handler(self, request):
        """Handler for unprotected public routes"""
        name = request.match_info.get('name', "Anonymous")
        if name in self.routes.keys():
            await self.routes[name](request)
        else:
            return web.Response(status=404)

    @login_required
    async def private_handler(self, request):
        """
        Handler for JWT protected routes.

        Look in routes dict for `name` from match_info
        runs associated callback if found.
        """
        name = request.match_info.get('name', "Anonymous")
        if name in self.private_routes.keys():
            response = await self.private_routes[name](request)
            return response
        else:
            return web.Response(status=404)
