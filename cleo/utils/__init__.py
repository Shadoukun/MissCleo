from .db import *
from .decorators import *


async def findUser(ctx, arg: str):

    name_list = [arg, arg.upper(),
                 arg.lower(),
                 arg.lower().capitalize()]

    # Try to get member from discord.py's member converter
    user = None
    memberconverter = commands.MemberConverter()
    for name in name_list:
        try:
            user = await memberconverter.convert(ctx, name)
            if user:
                return user
        except:
            # should probably do something.
            pass
