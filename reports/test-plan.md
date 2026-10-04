# Security & Functional Test Plan

| ID | Scenario | Expected |
|---|---|---|
| T01 | Empty input | Very Weak, score 0 |
| T02 | One character | Very Weak |
| T03 | Short numeric | Weakness findings |
| T04 | Common password | Common-password finding |
| T05 | Long repeated | Repetition finding |
| T06 | Lowercase only | Limited diversity |
| T07 | Uppercase only | Limited diversity |
| T08 | Numbers only | Limited diversity |
| T09 | Symbols only | Limited contextual value |
| T10 | Mixed password | Balanced metrics |
| T11 | Sequential numbers | Sequence finding |
| T12 | Reverse numbers | Sequence finding |
| T13 | Sequential letters | Sequence finding |
| T14 | Keyboard pattern | Keyboard finding |
| T15 | Repeated chars | Repetition finding |
| T16 | Repeated substring | Repetition finding |
| T17 | Common word + number | Dictionary/predictable finding |
| T18 | Word + year | Predictable structure |
| T19 | Name overlap | Personal context finding |
| T20 | Birth year overlap | Personal context finding |
| T21 | Long passphrase-like | Long credential handled |
| T22 | Unicode | Input accepted within length |
| T23 | Spaces | Supported as symbols/characters |
| T24 | 128 chars | Accepted |
| T25 | Score boundaries | Classification follows project bands |
| T26 | Suggestions | Findings produce relevant advice |
| T27 | Secure generator | Uses `secrets` and length policy |
| T28 | Password not stored | No password database column |
| T29 | Password not logged | No application password logging |
| T30 | Analytics storage | Aggregate metadata only |
