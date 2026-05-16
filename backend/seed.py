from datetime import datetime, timedelta
from db import db, puzzles_col, candidates_col, attempts_col, init_indexes
from models import make_puzzle, make_candidate, make_attempt

puzzles_col.delete_many({})
candidates_col.delete_many({})
attempts_col.delete_many({})

init_indexes()

p1 = make_puzzle(
    order=1,
    title="The Broken Response",
    description=(
        "The server is returning a malformed JSON response and the client is crashing. "
        "Find and fix every syntax error in the JSON payload below so it parses correctly."
    ),
    broken_code="""{
  "status": 200,
  "data": {
    "user": "codebreak_admin"
    "role": "reviewer",
    "permissions": ["read", "write", "execute",]
    "active": True
  }
}""",
    correct_answer="""{
  "status": 200,
  "data": {
    "user": "codebreak_admin",
    "role": "reviewer",
    "permissions": ["read", "write", "execute"],
    "active": true
  }
}""",
    hint="Check for missing commas, trailing commas, and boolean casing.",
    difficulty="easy",
)

p2 = make_puzzle(
    order=2,
    title="The Silent Endpoint",
    description=(
        "The API call below returns 404 every time. The base URL is correct, "
        "but the path, query params, and header are all wrong. "
        "Rewrite the full curl command so it returns 200."
    ),
    broken_code='curl -X POST https://api.codebreak.io/v2/users/search?name=donut&limit=ten -H "Content-Type: text/plain"',
    correct_answer='curl -X GET https://api.codebreak.io/v2/users/search?name=donut&limit=10 -H "Content-Type: application/json"',
    hint="Check the HTTP method, the limit value type, and the Content-Type header.",
    difficulty="medium",
)

p3 = make_puzzle(
    order=3,
    title="The Final Gate",
    description=(
        "The authentication middleware rejects every request. Below is the code "
        "that builds the auth header. Fix the function so it produces a valid "
        "Bearer token header."
    ),
    broken_code="""function getAuthHeader(token) {
  return {
    "Authorization": "Basic " + btoa(token),
    "X-Request-ID": null
  };
}""",
    correct_answer="""function getAuthHeader(token) {
  return {
    "Authorization": "Bearer " + token,
    "X-Request-ID": crypto.randomUUID()
  };
}""",
    hint="Bearer, not Basic. The token is already encoded. X-Request-ID can't be null.",
    difficulty="hard",
)

puzzle_ids = puzzles_col.insert_many([p1, p2, p3]).inserted_ids
print(f"Inserted {len(puzzle_ids)} puzzles")

start_time = datetime(2026, 5, 1, 10, 0, 0)
end_time = start_time + timedelta(minutes=12, seconds=34)

donut = make_candidate("Donut", "donut@codebreak.io")
donut["started_at"] = start_time
donut["completed_at"] = end_time
donut["total_time_seconds"] = (end_time - start_time).total_seconds()
donut["current_puzzle"] = 3
donut["is_completed"] = True

donut_id = candidates_col.insert_one(donut).inserted_id
print(f"Inserted mock candidate: Donut ({donut_id})")

mock_attempts = [
    make_attempt(donut_id, puzzle_ids[0], '{"status":200,"data":{"user":"codebreak_admin","role":"reviewer","permissions":["read","write","execute",],"active":True}}', False),
    make_attempt(donut_id, puzzle_ids[0], '{"status":200,"data":{"user":"codebreak_admin","role":"reviewer","permissions":["read","write","execute"],"active":True}}', False),
    make_attempt(donut_id, puzzle_ids[0], p1["correct_answer"], True),

    make_attempt(donut_id, puzzle_ids[1], 'curl -X GET https://api.codebreak.io/v2/users/search?name=donut&limit=ten -H "Content-Type: application/json"', False),
    make_attempt(donut_id, puzzle_ids[1], p2["correct_answer"], True),

    make_attempt(donut_id, puzzle_ids[2], 'function getAuthHeader(token) {\n  return {\n    "Authorization": "Bearer " + btoa(token),\n    "X-Request-ID": null\n  };\n}', False),
    make_attempt(donut_id, puzzle_ids[2], 'function getAuthHeader(token) {\n  return {\n    "Authorization": "Bearer " + token,\n    "X-Request-ID": null\n  };\n}', False),
    make_attempt(donut_id, puzzle_ids[2], 'function getAuthHeader(token) {\n  return {\n    "Authorization": "Bearer " + token,\n    "X-Request-ID": "fixed-id"\n  };\n}', False),
    make_attempt(donut_id, puzzle_ids[2], p3["correct_answer"], True),
]

base = start_time + timedelta(seconds=30)
for i, attempt in enumerate(mock_attempts):
    attempt["submitted_at"] = base + timedelta(seconds=i * 90)

attempts_col.insert_many(mock_attempts)
print(f"Inserted {len(mock_attempts)} mock attempts for Donut")

player2 = make_candidate("ByteRunner", "byterunner@codebreak.io")
player2["started_at"] = datetime(2026, 5, 2, 14, 0, 0)
player2["current_puzzle"] = 2
candidates_col.insert_one(player2)
print("Inserted mock candidate: ByteRunner (in-progress)")

print("\nSeed complete.")
