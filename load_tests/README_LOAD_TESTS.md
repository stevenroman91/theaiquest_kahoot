# Load tests (30 joueurs)

## Pré-requis
- Python 3.10+
- Locust: `pip install locust`
- Application lancée en local: `http://127.0.0.1:5001`
- Un code de session actif (6 caractères), par ex. `RW5VHE`

## Lancer 30 joueurs (Locust)
```bash
cd versions/v2.0-kahoot
export SESSION_CODE=RW5VHE   # remplace par le code de session actif
locust -f load_tests/locustfile.py --host http://127.0.0.1:5001
```
Ouvre `http://localhost:8089` et configure:
- Number of users to simulate: 30
- Spawn rate: 5

Clique sur Start. Les joueurs:
- se connectent avec `username` aléatoire (unicité par session testée)
- jouent les 5 steps
- sauvegardent le score
- interrogent le leaderboard (filtré par session côté backend)

## À surveiller
- Codes 409: collision d'username (attendu si volontairement provoqué)
- Codes 500/429: saturation serveur/SQLite
- Temps de réponse > 500ms
- Logs: pas d’ouverture de leaderboard chez les joueurs en cours; nettoyage `active_players` après Step 5

## Notes
- Le leaderboard n’affiche que les joueurs ayant terminé (table `game_scores`). Les joueurs en cours sont dans `active_players` (normal).
- Si vous constatez des erreurs de verrouillage SQLite sous charge extrême, envisager `PRAGMA journal_mode=WAL;` et un `timeout`, ou Postgres.


