"""Privacy-first password analysis engine.

Passwords are accepted only in memory. This module never logs, stores, or
returns the supplied password.
"""
from __future__ import annotations

import hashlib
import math
import re
from pathlib import Path
from typing import Iterable

DATA_DIR = Path(__file__).resolve().parents[2] / "data"
COMMON_PASSWORDS_PATH = DATA_DIR / "common_passwords.txt"
BREACHED_HASHES_PATH = DATA_DIR / "demo_breached_password_hashes.txt"

COMMON_PASSWORDS = {
    line.strip().lower()
    for line in COMMON_PASSWORDS_PATH.read_text(encoding="utf-8").splitlines()
    if line.strip() and not line.lstrip().startswith("#")
}
DEMO_BREACHED_HASHES = {
    line.strip().upper()
    for line in BREACHED_HASHES_PATH.read_text(encoding="utf-8").splitlines()
    if line.strip() and not line.lstrip().startswith("#")
}

KEYBOARD_PATTERNS = (
    "qwerty", "asdf", "zxcv", "qwert", "asdfg", "zxcvb",
    "12345", "23456", "7890", "qaz", "wsx", "edc",
)


def _normalise(value: str) -> str:
    return value.casefold()


def detect_sequences(password: str) -> list[str]:
    found: list[str] = []
    s = _normalise(password)
    if len(s) < 3:
        return found
    for i in range(len(s) - 2):
        chunk = s[i:i + 3]
        if all(chunk[j].isdigit() for j in range(3)):
            nums = [int(c) for c in chunk]
            if nums[1] - nums[0] == nums[2] - nums[1] and abs(nums[1] - nums[0]) == 1:
                found.append(chunk)
        elif all(chunk[j].isalpha() and ord(chunk[j]) < 128 for j in range(3)):
            codes = [ord(c) for c in chunk]
            if codes[1] - codes[0] == codes[2] - codes[1] and abs(codes[1] - codes[0]) == 1:
                found.append(chunk)
    return sorted(set(found))


def detect_keyboard_patterns(password: str) -> list[str]:
    s = _normalise(password)
    return sorted({pattern for pattern in KEYBOARD_PATTERNS if pattern in s})


def detect_repetition(password: str) -> dict:
    repeated_chars = sorted({m.group(1) for m in re.finditer(r"(.)\1{2,}", password)})
    repeated_substrings: list[str] = []
    for size in range(2, min(5, len(password) // 2 + 1)):
        for i in range(len(password) - 2 * size + 1):
            part = password[i:i + size]
            if part and password[i + size:i + 2 * size] == part:
                repeated_substrings.append(part)
    return {
        "repeated_characters": sorted(set(repeated_chars)),
        "repeated_substrings": sorted(set(repeated_substrings)),
    }


def detect_predictable_structure(password: str) -> list[str]:
    s = _normalise(password)
    findings: list[str] = []
    if re.search(r"(?:19|20)\d{2}", s):
        findings.append("year-like pattern")
    if re.search(r"\d{3,}$", s):
        findings.append("predictable numeric suffix")
    if re.search(r"^[a-z]+\d+$", s):
        findings.append("word-plus-number structure")
    if re.search(r"\d{4}[-/]?\d{2}[-/]?\d{2}", s):
        findings.append("date-like pattern")
    if re.search(r"(?:\+?\d[\d\s-]{7,}\d)", password):
        findings.append("phone-like pattern")
    return sorted(set(findings))


def detect_context_overlap(password: str, context: dict | None) -> list[str]:
    if not context:
        return []
    s = _normalise(password)
    overlaps: list[str] = []
    labels = {
        "first_name": "your name",
        "birth_year": "your birth year",
        "company": "your company/college",
        "college": "your company/college",
        "username": "your username",
        "email": "your email",
    }
    for key, label in labels.items():
        value = str(context.get(key, "")).strip()
        if value and len(value) >= 3 and _normalise(value) in s:
            overlaps.append(label)
    return sorted(set(overlaps))


def is_common_password(password: str) -> bool:
    return _normalise(password) in COMMON_PASSWORDS


def dictionary_words(password: str) -> list[str]:
    s = _normalise(password)
    words = []
    for word in sorted(COMMON_PASSWORDS, key=len, reverse=True):
        if len(word) >= 4 and word.isalpha() and word in s:
            words.append(word)
    return words[:5]


def estimate_theoretical_entropy(password: str) -> float:
    pools = 0
    if re.search(r"[a-z]", password): pools += 26
    if re.search(r"[A-Z]", password): pools += 26
    if re.search(r"\d", password): pools += 10
    if re.search(r"[^A-Za-z0-9]", password): pools += 33
    if not password or pools == 0:
        return 0.0
    return round(len(password) * math.log2(pools), 1)


def _severity_for(condition: bool, severity: str) -> str | None:
    return severity if condition else None


def analyze_password(password: str, context: dict | None = None) -> dict:
    if password == "":
        return {
            "score": 0,
            "classification": "VERY WEAK",
            "findings": [{"type": "length", "severity": "critical", "title": "Empty password", "description": "Enter a password or passphrase to begin analysis."}],
            "suggestions": ["Use a unique, long password or passphrase.", "Enable MFA wherever it is available."],
            "metrics": {"length": 0, "character_types": 0, "has_lowercase": False, "has_uppercase": False, "has_digits": False, "has_symbols": False, "unique_character_count": 0, "unique_character_ratio": 0.0, "theoretical_entropy_bits": 0.0, "sequence_count": 0, "keyboard_pattern_count": 0, "repetition_count": 0, "dictionary_word_count": 0, "predictable_structure_count": 0, "personal_context_count": 0, "demo_breach_match": False, "pattern_count": 0}
        }
    length = len(password)
    lower = bool(re.search(r"[a-z]", password))
    upper = bool(re.search(r"[A-Z]", password))
    digits = bool(re.search(r"\d", password))
    symbols = bool(re.search(r"[^A-Za-z0-9]", password))
    type_count = sum((lower, upper, digits, symbols))
    unique_count = len(set(password))
    unique_ratio = round(unique_count / length, 3) if length else 0.0
    sequences = detect_sequences(password)
    keyboard = detect_keyboard_patterns(password)
    repetition = detect_repetition(password)
    structure = detect_predictable_structure(password)
    common = is_common_password(password)
    words = dictionary_words(password)
    context_hits = detect_context_overlap(password, context)
    sha1 = hashlib.sha1(password.encode("utf-8")).hexdigest().upper() if password else ""
    demo_breached = bool(sha1 and sha1 in DEMO_BREACHED_HASHES)

    findings: list[dict] = []
    def add(kind: str, severity: str, title: str, description: str):
        findings.append({"type": kind, "severity": severity, "title": title, "description": description})

    if length < 8:
        add("length", "high", "Very short password", "Use a substantially longer password or passphrase.")
    elif length < 12:
        add("length", "medium", "Short password", "Longer passwords generally provide more resistance to guessing.")
    if common:
        add("common_password", "critical", "Common password", "This password appears in the project's educational common-password list.")
    if sequences:
        add("sequence", "high", "Sequential characters", f"Detected sequence(s): {', '.join(sequences[:4])}.")
    if keyboard:
        add("keyboard", "high", "Keyboard pattern", f"Detected keyboard pattern(s): {', '.join(keyboard[:4])}.")
    if repetition["repeated_characters"] or repetition["repeated_substrings"]:
        add("repetition", "high", "Repeated pattern", "Repeated characters or substrings reduce unpredictability.")
    if words:
        add("dictionary", "medium", "Common word detected", "Common dictionary-like words make guessing easier.")
    if structure:
        add("predictable_structure", "medium", "Predictable structure", "Word-plus-number, year, date, or similar predictable structures are weak signals.")
    if context_hits:
        add("personal_context", "high", "Personal context overlap", "The password appears to contain information supplied as personal context.")
    if demo_breached:
        add("demo_breach", "critical", "Demo breach match", "This synthetic educational password matches the local demo breach set; do not reuse it.")

    # Project-defined 0–100 score. Composition supports the score but patterns/common passwords can override it.
    score = min(length, 20) / 20 * 35
    score += min(type_count / 4, 1) * 15
    score += unique_ratio * 10
    score += 20
    if sequences or keyboard or repetition["repeated_characters"] or repetition["repeated_substrings"]:
        score -= 15
    if structure:
        score -= 8
    if context_hits:
        score -= 12
    if words:
        score -= 5
    if common:
        score -= 25
    else:
        score += 10
    if length >= 16 and unique_ratio >= 0.75 and not structure and not common:
        score += 5
    if length < 8:
        score -= 20
    if demo_breached:
        score = min(score, 10)
    score = max(0, min(100, round(score)))

    if score <= 20:
        classification = "VERY WEAK"
    elif score <= 40:
        classification = "WEAK"
    elif score <= 60:
        classification = "MODERATE"
    elif score <= 80:
        classification = "STRONG"
    else:
        classification = "VERY STRONG"

    suggestions: list[str] = []
    if length < 16:
        suggestions.append("Consider using a longer password or passphrase (16+ characters is a useful project target).")
    if common:
        suggestions.append("Avoid common passwords and well-known password variants.")
    if sequences:
        suggestions.append("Remove predictable ascending or descending sequences.")
    if keyboard:
        suggestions.append("Avoid keyboard patterns such as qwerty or asdf.")
    if repetition["repeated_characters"] or repetition["repeated_substrings"]:
        suggestions.append("Avoid repeated characters and repeated substrings.")
    if structure:
        suggestions.append("Avoid predictable word + number/year/date structures.")
    if words:
        suggestions.append("Use less predictable words or a randomly generated passphrase.")
    if context_hits:
        suggestions.append("Avoid names, birth years, usernames, company names, or other personal context.")
    if demo_breached:
        suggestions.append("Do not reuse a password that appears in a breach exposure check.")
    suggestions.extend([
        "Use a unique password for every important account.",
        "Consider a password manager for generating and storing unique credentials.",
        "Enable MFA wherever it is available.",
    ])
    suggestions = list(dict.fromkeys(suggestions))[:7]

    metrics = {
        "length": length,
        "character_types": type_count,
        "has_lowercase": lower,
        "has_uppercase": upper,
        "has_digits": digits,
        "has_symbols": symbols,
        "unique_character_count": unique_count,
        "unique_character_ratio": unique_ratio,
        "theoretical_entropy_bits": estimate_theoretical_entropy(password),
        "sequence_count": len(sequences),
        "keyboard_pattern_count": len(keyboard),
        "repetition_count": len(repetition["repeated_characters"]) + len(repetition["repeated_substrings"]),
        "dictionary_word_count": len(words),
        "predictable_structure_count": len(structure),
        "personal_context_count": len(context_hits),
        "demo_breach_match": demo_breached,
        "pattern_count": len(sequences) + len(keyboard) + len(repetition["repeated_characters"]) + len(repetition["repeated_substrings"]),
    }
    return {
        "score": score,
        "classification": classification,
        "findings": findings,
        "suggestions": suggestions,
        "metrics": metrics,
    }
