"""
Locust load test for Kahoot-mode API

Usage:
  1) Start your app locally on http://127.0.0.1:5001 and create a session code (e.g., RW5VHE)
  2) Run:
       locust -f load_tests/locustfile.py --host http://127.0.0.1:5001
  3) Open http://localhost:8089 and set Users to 30, Spawn rate 5

Env variables:
  SESSION_CODE: 6-char session code to join (required for players)

Notes:
  - This simulates the full flow: login -> steps 1..5 -> leaderboard
  - Leaderboard only shows players who finished (expected)
"""

from locust import HttpUser, task, between
import os
import random
import string


SESSION_CODE = os.environ.get("SESSION_CODE", "").strip().upper()


def random_username(prefix: str = "p") -> str:
    return prefix + "".join(random.choices(string.ascii_lowercase + string.digits, k=8))


class PlayerUser(HttpUser):
    wait_time = between(0.5, 2.0)

    def on_start(self):
        if not SESSION_CODE or len(SESSION_CODE) != 6:
            raise RuntimeError("SESSION_CODE env var is required (6 chars), e.g. export SESSION_CODE=RW5VHE")

        self.username = random_username()

        # Player login (username only + session code)
        self.client.post(
            "/api/login",
            json={
                "session_code": SESSION_CODE,
                "username": self.username,
                "password": ""  # player mode
            },
            name="login_player",
        )

    @task(5)
    def play_full_path(self):
        # Phase 1
        self.client.get("/api/phase1/choices", name="get_phase1_choices")
        self.client.post("/api/phase1/choose", json={"character_id": "james"}, name="post_phase1_choose")

        # Phase 2
        self.client.get("/api/phase2/choices", name="get_phase2_choices")
        self.client.post(
            "/api/phase2/choose",
            json={
                "choice_ids": [
                    "fraud_integrity_detection",
                    "smart_game_design_assistant",
                    "player_journey_optimizer",
                ]
            },
            name="post_phase2_choose",
        )

        # Phase 3
        self.client.get("/api/phase3/choices", name="get_phase3_choices")
        self.client.post(
            "/api/phase3/choose",
            json={
                "people": ["ai_collaboration_hub"],
                "technology": ["trusted_tech_partners"],
                "governance": ["ai_governance_roadmap"],
            },
            name="post_phase3_choose",
        )

        # Phase 4
        self.client.get("/api/phase4/choices", name="get_phase4_choices")
        self.client.post(
            "/api/phase4/choose",
            json={"enabler_ids": ["trusted_tech_partners", "ai_collaboration_hub"]},
            name="post_phase4_choose",
        )

        # Phase 5 -> score
        self.client.get("/api/phase5/choices", name="get_phase5_choices")
        self.client.post(
            "/api/phase5/choose",
            json={"choice_id": "build_to_scale"},
            name="post_phase5_choose",
        )

        # Leaderboard (session filtering is on backend)
        self.client.get("/api/leaderboard?limit=1000", name="get_leaderboard")


