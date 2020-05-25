from aiohttp import web
from cleo.db import session, FlaskUser
import jwt
import config
import json
from datetime import datetime, timedelta
from werkzeug.security import safe_str_cmp
import bcrypt

login_routes = web.RouteTableDef()


def check_password_hash(pw_hash, password):
    pw_hash = bytes(pw_hash, 'utf-8')
    password = bytes(password, 'utf-8')

    return safe_str_cmp(bcrypt.hashpw(password, pw_hash), pw_hash)


@login_routes.post('/auth/login')
async def handle_login(request):
    data = await request.json()
    username = data.get('userName', None)
    password = data.get('password', None)

    if not username or not password:
        return web.Response(status=500)

    user = session.query(FlaskUser).filter_by(username=username).first()
    if user:
        if check_password_hash(user.password, password):
            claims = {
                'user': user.username,
                'iat': datetime.now(),
                'exp': datetime.now() + timedelta(days=30),
            }
            token = jwt.encode(claims, config.JWT_SECRET, algorithm='HS256')
            resp = json.dumps({'access_token': token.decode('utf-8')})
            return web.json_response(text=resp)


