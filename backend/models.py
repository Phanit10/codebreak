from datetime import datetime


def make_puzzle(order, title, description, broken_code, correct_answer, hint="", difficulty="medium"):
    return {
        "order": order,
        "title": title,
        "description": description,
        "broken_code": broken_code,
        "correct_answer": correct_answer,
        "hint": hint,
        "difficulty": difficulty,
        "created_at": datetime.utcnow(),
    }


def make_candidate(name, email, current_puzzle=1):
    return {
        "name": name,
        "email": email,
        "total_time_seconds": None,
        "started_at": None,
        "completed_at": None,
        "current_puzzle": current_puzzle,
        "is_completed": False,
        "created_at": datetime.utcnow(),
    }


def make_attempt(candidate_id, puzzle_id, submission, is_correct):
    return {
        "candidate_id": candidate_id,
        "puzzle_id": puzzle_id,
        "submission": submission,
        "is_correct": is_correct,
        "submitted_at": datetime.utcnow(),
    }
