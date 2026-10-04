import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from backend.services.password_analyzer import analyze_password, detect_sequences, detect_keyboard_patterns, detect_repetition


def test_empty_password():
    r = analyze_password("")
    assert r["score"] == 0
    assert r["classification"] == "VERY WEAK"

def test_short_numeric():
    assert analyze_password("123456")["classification"] == "VERY WEAK"

def test_common_password():
    r = analyze_password("password123")
    assert any(f["type"] == "common_password" for f in r["findings"])

def test_long_repetition():
    r = analyze_password("a" * 16)
    assert any(f["type"] == "repetition" for f in r["findings"])

def test_keyboard():
    assert "qwerty" in detect_keyboard_patterns("qwerty2026!")

def test_sequence():
    assert "123" in detect_sequences("abc123")

def test_reverse_sequence():
    assert "987" in detect_sequences("9876")

def test_repeated_substring():
    assert "ab" in detect_repetition("ababab")["repeated_substrings"]

def test_personal_context():
    r = analyze_password("Vaidehi@2026!", {"first_name": "Vaidehi", "birth_year": "2026"})
    assert any(f["type"] == "personal_context" for f in r["findings"])

def test_metrics_are_safe():
    r = analyze_password("ExamplePassword123!")
    text = str(r)
    assert "ExamplePassword123!" not in text

def test_secureish_long_password_not_common():
    r = analyze_password("v8$Lq2!zR7@pN4#xT9")
    assert r["score"] >= 60
