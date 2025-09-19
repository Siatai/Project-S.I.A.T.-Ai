import jwt
from datetime import datetime, timedelta
from os import getenv
from dotenv import load_dotenv

load_dotenv()

JWT_SECRET = getenv("JWT_SECRET", "irondoge-secret")
JWT_EXPIRE_MINUTES = int(getenv("JWT_EXPIRE_MINUTES", 1800000000000000000000000))

def generate_token(user):
    payload = {
        "email": user.email,
        "is_admin": user.is_admin,
        "is_associate": user.is_associate,
        "exp": datetime.utcnow() + timedelta(minutes=JWT_EXPIRE_MINUTES)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

def decode_token(token):
    try:
        decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return decoded
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
