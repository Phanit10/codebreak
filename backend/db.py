import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "codebreak")

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

puzzles_col = db["puzzles"]
candidates_col = db["candidates"]
attempts_col = db["attempts"]


def init_indexes():
    puzzles_col.create_index("order", unique=True)
    candidates_col.create_index("email", unique=True)
    attempts_col.create_index("candidate_id")
    attempts_col.create_index("puzzle_id")
    attempts_col.create_index([("candidate_id", 1), ("puzzle_id", 1)])
