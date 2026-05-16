from datetime import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS
from bson import ObjectId
from bson.errors import InvalidId
from db import db, puzzles_col, candidates_col, attempts_col, init_indexes
from models import make_attempt

app = Flask(__name__)
CORS(app)


def serialize_doc(doc):
    if doc is None:
        return None
    doc["_id"] = str(doc["_id"])
    for key in ("candidate_id", "puzzle_id"):
        if key in doc:
            doc[key] = str(doc[key])
    for key in ("started_at", "completed_at", "created_at", "submitted_at"):
        if key in doc and isinstance(doc[key], datetime):
            doc[key] = doc[key].isoformat()
    return doc


@app.route("/puzzles/<puzzle_id>", methods=["GET"])
def get_puzzle(puzzle_id):
    try:
        oid = ObjectId(puzzle_id)
    except InvalidId:
        return jsonify({"error": "Invalid puzzle ID"}), 400

    puzzle = puzzles_col.find_one({"_id": oid})
    if not puzzle:
        return jsonify({"error": "Puzzle not found"}), 404

    safe = serialize_doc(puzzle)
    del safe["correct_answer"]
    return jsonify(safe)


@app.route("/puzzles/order/<int:order>", methods=["GET"])
def get_puzzle_by_order(order):
    puzzle = puzzles_col.find_one({"order": order})
    if not puzzle:
        return jsonify({"error": "Puzzle not found"}), 404

    safe = serialize_doc(puzzle)
    del safe["correct_answer"]
    return jsonify(safe)


@app.route("/submit-attempt", methods=["POST"])
def submit_attempt():
    body = request.get_json(silent=True)
    if not body:
        return jsonify({"error": "JSON body required"}), 400

    candidate_id = body.get("candidate_id")
    puzzle_id = body.get("puzzle_id")
    submission = body.get("submission")

    if not all([candidate_id, puzzle_id, submission is not None]):
        return jsonify({"error": "candidate_id, puzzle_id, and submission are required"}), 400

    try:
        cand_oid = ObjectId(candidate_id)
        puzz_oid = ObjectId(puzzle_id)
    except InvalidId:
        return jsonify({"error": "Invalid ID format"}), 400

    candidate = candidates_col.find_one({"_id": cand_oid})
    if not candidate:
        return jsonify({"error": "Candidate not found"}), 404

    puzzle = puzzles_col.find_one({"_id": puzz_oid})
    if not puzzle:
        return jsonify({"error": "Puzzle not found"}), 404

    if candidate["started_at"] is None:
        candidates_col.update_one(
            {"_id": cand_oid},
            {"$set": {"started_at": datetime.utcnow()}}
        )
        candidate["started_at"] = datetime.utcnow()

    is_correct = submission.strip() == puzzle["correct_answer"].strip()

    attempt = make_attempt(cand_oid, puzz_oid, submission, is_correct)
    attempts_col.insert_one(attempt)

    if is_correct:
        next_puzzle = puzzle["order"] + 1
        total_puzzles = puzzles_col.count_documents({})

        update = {"$set": {"current_puzzle": next_puzzle}}

        if next_puzzle > total_puzzles:
            now = datetime.utcnow()
            elapsed = (now - candidate["started_at"]).total_seconds()
            update["$set"]["is_completed"] = True
            update["$set"]["completed_at"] = now
            update["$set"]["total_time_seconds"] = elapsed

        candidates_col.update_one({"_id": cand_oid}, update)

        completed = next_puzzle > total_puzzles
        return jsonify({
            "correct": True,
            "message": "All puzzles complete!" if completed else f"Correct! Proceed to puzzle {next_puzzle}.",
            "completed": completed,
            "next_puzzle": None if completed else next_puzzle,
        })

    fail_count = attempts_col.count_documents({
        "candidate_id": cand_oid,
        "puzzle_id": puzz_oid,
        "is_correct": False,
    })

    response = {
        "correct": False,
        "message": "Incorrect. Try again.",
        "attempts_so_far": fail_count,
    }

    if fail_count >= 3 and puzzle.get("hint"):
        response["hint"] = puzzle["hint"]

    return jsonify(response)


@app.route("/leaderboard", methods=["GET"])
def leaderboard():
    results = candidates_col.find(
        {"is_completed": True, "total_time_seconds": {"$ne": None}},
        {"name": 1, "email": 1, "total_time_seconds": 1, "completed_at": 1},
    ).sort("total_time_seconds", 1)

    board = []
    for rank, doc in enumerate(results, start=1):
        entry = serialize_doc(doc)
        entry["rank"] = rank
        board.append(entry)

    return jsonify(board)


@app.route("/reviewer/candidate/<candidate_id>", methods=["GET"])
def reviewer_candidate(candidate_id):
    try:
        cand_oid = ObjectId(candidate_id)
    except InvalidId:
        return jsonify({"error": "Invalid candidate ID"}), 400

    candidate = candidates_col.find_one({"_id": cand_oid})
    if not candidate:
        return jsonify({"error": "Candidate not found"}), 404

    all_attempts = list(
        attempts_col.find({"candidate_id": cand_oid}).sort("submitted_at", 1)
    )

    puzzles_lookup = {}
    for p in puzzles_col.find():
        puzzles_lookup[p["_id"]] = p["title"]

    attempt_list = []
    for a in all_attempts:
        entry = serialize_doc(a)
        entry["puzzle_title"] = puzzles_lookup.get(ObjectId(entry["puzzle_id"]), "Unknown")
        attempt_list.append(entry)

    total_attempts = len(all_attempts)
    failed = sum(1 for a in all_attempts if not a["is_correct"])
    passed = total_attempts - failed

    return jsonify({
        "candidate": serialize_doc(candidate),
        "summary": {
            "total_attempts": total_attempts,
            "failed": failed,
            "passed": passed,
        },
        "attempts": attempt_list,
    })


@app.route("/reviewer/candidates", methods=["GET"])
def list_candidates():
    results = candidates_col.find(
        {},
        {"name": 1, "email": 1, "is_completed": 1, "total_time_seconds": 1, "current_puzzle": 1},
    ).sort("created_at", -1)

    return jsonify([serialize_doc(doc) for doc in results])


@app.route("/candidates", methods=["POST"])
def register_candidate():
    body = request.get_json(silent=True)
    if not body:
        return jsonify({"error": "JSON body required"}), 400

    name = body.get("name")
    email = body.get("email")

    if not name or not email:
        return jsonify({"error": "name and email are required"}), 400

    existing = candidates_col.find_one({"email": email})
    if existing:
        return jsonify(serialize_doc(existing))

    from models import make_candidate
    doc = make_candidate(name, email)
    result = candidates_col.insert_one(doc)
    doc["_id"] = result.inserted_id
    return jsonify(serialize_doc(doc)), 201


if __name__ == "__main__":
    init_indexes()
    print("CodeBreak API running on http://localhost:5000")
    app.run(debug=True, host="0.0.0.0", port=5000)
