"""Educational password hashing demonstration using Argon2id."""
from argon2 import PasswordHasher

_ph = PasswordHasher()


def hash_password(password: str) -> str:
    return _ph.hash(password)


def verify_password(stored_hash: str, password: str) -> bool:
    try:
        return _ph.verify(stored_hash, password)
    except Exception:
        return False
