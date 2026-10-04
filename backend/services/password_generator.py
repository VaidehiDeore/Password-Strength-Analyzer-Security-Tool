"""Cryptographically secure password generator."""
from __future__ import annotations
import secrets
import string

SYMBOLS = "!@#$%^&*()-_=+[]{}:,.?"
WORDLIST = [
    "amber", "anchor", "atlas", "bamboo", "cobalt", "comet", "coral", "ember",
    "falcon", "forest", "harbor", "lunar", "maple", "meadow", "nebula", "orbit",
    "pepper", "planet", "quartz", "river", "rocket", "silver", "summit", "violet",
]


def generate_password(length: int = 20, use_upper: bool = True, use_lower: bool = True,
                      use_digits: bool = True, use_symbols: bool = True) -> str:
    if not 16 <= length <= 128:
        raise ValueError("Password length must be between 16 and 128 characters.")
    pools = []
    if use_lower: pools.append(string.ascii_lowercase)
    if use_upper: pools.append(string.ascii_uppercase)
    if use_digits: pools.append(string.digits)
    if use_symbols: pools.append(SYMBOLS)
    if not pools:
        raise ValueError("Select at least one character set.")
    chars = [secrets.choice(pool) for pool in pools]
    alphabet = "".join(pools)
    chars.extend(secrets.choice(alphabet) for _ in range(length - len(chars)))
    secrets.SystemRandom().shuffle(chars)
    return "".join(chars)


def generate_passphrase(words: int = 5) -> str:
    if not 4 <= words <= 8:
        raise ValueError("Passphrase must contain 4 to 8 words.")
    return "-".join(secrets.choice(WORDLIST) for _ in range(words))
