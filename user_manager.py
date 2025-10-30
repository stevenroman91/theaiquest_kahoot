#!/usr/bin/env python3
"""
Système d'authentification pour AI Acceleration EXEC
Gestion des utilisateurs avec mots de passe hashés
"""

import sqlite3
import hashlib
import secrets
import logging
import os
from typing import Optional, Tuple, List, Dict
from dataclasses import dataclass
from datetime import datetime

logger = logging.getLogger(__name__)

@dataclass
class User:
    """Représente un utilisateur"""
    id: int
    username: str
    email: Optional[str]
    password_hash: Optional[str]
    salt: Optional[str]
    role: str
    created_at: str
    last_login: Optional[str] = None
    is_active: bool = True
    is_kahoot_mode: bool = False

class UserManager:
    """Gestionnaire des utilisateurs avec authentification sécurisée"""
    
    def __init__(self, db_path: str = "users.db"):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """Initialise la base de données des utilisateurs"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS users (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        username TEXT UNIQUE NOT NULL,
                        email TEXT UNIQUE,
                        password_hash TEXT,
                        salt TEXT,
                        role TEXT DEFAULT 'user',
                        created_at TEXT NOT NULL,
                        last_login TEXT,
                        is_active BOOLEAN DEFAULT 1,
                        is_kahoot_mode BOOLEAN DEFAULT 0
                    )
                ''')
                
                # Créer la table pour les sessions de jeu (Kahoot mode)
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS game_sessions (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        session_code TEXT UNIQUE NOT NULL,
                        created_by TEXT NOT NULL,
                        created_at TEXT NOT NULL,
                        is_active BOOLEAN DEFAULT 1,
                        player_count INTEGER DEFAULT 0
                    )
                ''')
                
                # Créer un index pour les sessions actives
                cursor.execute('''
                    CREATE INDEX IF NOT EXISTS idx_session_code ON game_sessions(session_code)
                ''')
                
                # Créer la table pour le leaderboard (scores)
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS game_scores (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        username TEXT NOT NULL,
                        total_score INTEGER NOT NULL,
                        stars INTEGER NOT NULL,
                        mot_scores TEXT NOT NULL,
                        completed_at TEXT NOT NULL,
                        session_id TEXT
                    )
                ''')
                
                # Créer un index pour les classements par session
                cursor.execute('''
                    CREATE INDEX IF NOT EXISTS idx_total_score ON game_scores(total_score DESC)
                ''')
                cursor.execute('''
                    CREATE INDEX IF NOT EXISTS idx_session_id ON game_scores(session_id)
                ''')
                
                # Authoritative per-user progress within a session
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS player_progress (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        session_code TEXT NOT NULL,
                        username TEXT NOT NULL,
                        current_step INTEGER NOT NULL DEFAULT 1,
                        completed BOOLEAN NOT NULL DEFAULT 0,
                        updated_at TEXT NOT NULL,
                        UNIQUE(session_code, username)
                    )
                ''')
                cursor.execute('''
                    CREATE INDEX IF NOT EXISTS idx_progress_session_user ON player_progress(session_code, username)
                ''')

                # Créer la table pour les joueurs actifs (en cours de jeu)
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS active_players (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        session_code TEXT NOT NULL,
                        username TEXT NOT NULL,
                        connected_at TEXT NOT NULL,
                        UNIQUE(session_code, username)
                    )
                ''')
                
                # Créer un index pour les recherches rapides
                cursor.execute('''
                    CREATE INDEX IF NOT EXISTS idx_active_session_username ON active_players(session_code, username)
                ''')
                
                # Migration : Mettre à jour la structure de la table si nécessaire
                try:
                    cursor.execute('PRAGMA table_info(users)')
                    columns_info = cursor.fetchall()
                    columns = [row[1] for row in columns_info]
                    
                    # Vérifier et ajouter is_kahoot_mode si absent
                    if 'is_kahoot_mode' not in columns:
                        logger.info("Migration: Adding is_kahoot_mode column to users table")
                        cursor.execute('ALTER TABLE users ADD COLUMN is_kahoot_mode BOOLEAN DEFAULT 0')
                    
                    # Migration : Vérifier les contraintes NOT NULL sur email et password_hash
                    # Si password_hash a NOT NULL, on doit recréer la table (SQLite ne permet pas de modifier les contraintes)
                    has_not_null_password = any(row[1] == 'password_hash' and row[3] == 1 for row in columns_info)
                    has_not_null_email = any(row[1] == 'email' and row[3] == 1 for row in columns_info)
                    
                    if has_not_null_password or has_not_null_email:
                        logger.info("Migration: Removing NOT NULL constraints from password_hash and email")
                        # Créer une nouvelle table avec la bonne structure
                        cursor.execute('''
                            CREATE TABLE IF NOT EXISTS users_new (
                                id INTEGER PRIMARY KEY AUTOINCREMENT,
                                username TEXT UNIQUE NOT NULL,
                                email TEXT UNIQUE,
                                password_hash TEXT,
                                salt TEXT,
                                role TEXT DEFAULT 'user',
                                created_at TEXT NOT NULL,
                                last_login TEXT,
                                is_active BOOLEAN DEFAULT 1,
                                is_kahoot_mode BOOLEAN DEFAULT 0
                            )
                        ''')
                        
                        # Copier les données existantes
                        cursor.execute('''
                            INSERT INTO users_new (id, username, email, password_hash, salt, role, created_at, last_login, is_active, is_kahoot_mode)
                            SELECT id, username, email, password_hash, salt, role, created_at, last_login, is_active, 
                                   COALESCE(is_kahoot_mode, 0) as is_kahoot_mode
                            FROM users
                        ''')
                        
                        # Supprimer l'ancienne table et renommer la nouvelle
                        cursor.execute('DROP TABLE users')
                        cursor.execute('ALTER TABLE users_new RENAME TO users')
                        logger.info("Migration: Table users restructured successfully")
                    
                except Exception as e:
                    logger.warning(f"Migration check failed (table may not exist yet): {e}")
                
                conn.commit()
                
                # Créer un utilisateur admin par défaut si aucun utilisateur n'existe
                cursor.execute('SELECT COUNT(*) FROM users')
                if cursor.fetchone()[0] == 0:
                    self.create_default_admin()
                    
        except Exception as e:
            logger.error(f"Erreur lors de l'initialisation de la base de données: {e}")
            raise
    
    def create_default_admin(self):
        """Crée un utilisateur administrateur par défaut"""
        admin_password = "FDJ2024!Admin"  # Mot de passe robuste pour l'admin
        self.create_user("admin", "admin@fdj.com", admin_password, "admin")
        logger.info("Utilisateur administrateur créé: admin / FDJ2024!Admin")
    
    def hash_password(self, password: str, salt: str = None) -> Tuple[str, str]:
        """Hache un mot de passe avec un salt"""
        if salt is None:
            salt = secrets.token_hex(32)
        
        # Utilisation de PBKDF2 avec SHA-256
        password_hash = hashlib.pbkdf2_hmac(
            'sha256',
            password.encode('utf-8'),
            salt.encode('utf-8'),
            100000  # 100,000 itérations
        )
        return password_hash.hex(), salt
    
    def verify_password(self, password: str, password_hash: str, salt: str) -> bool:
        """Vérifie un mot de passe contre son hash"""
        computed_hash, _ = self.hash_password(password, salt)
        return computed_hash == password_hash
    
    def create_user(self, username: str, email: str = None, password: str = None, role: str = "user", kahoot_mode: bool = False) -> bool:
        """Crée un nouvel utilisateur (mode normal ou Kahoot)"""
        try:
            # Vérifier que l'utilisateur n'existe pas déjà
            if self.get_user_by_username(username):
                logger.warning(f"Utilisateur {username} existe déjà")
                return False
            
            # En mode Kahoot, pas besoin d'email ni password
            if kahoot_mode:
                password_hash = None
                salt = None
                email = email or f"{username}@kahoot.local"
            else:
                if not email:
                    logger.error("Email requis en mode normal")
                    return False
                if not password:
                    logger.error("Mot de passe requis en mode normal")
                    return False
            if self.get_user_by_email(email):
                logger.warning(f"Email {email} existe déjà")
                return False
            # Hacher le mot de passe uniquement en mode normal
            if not kahoot_mode:
                password_hash, salt = self.hash_password(password)
            
            # Insérer dans la base de données
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT INTO users (username, email, password_hash, salt, role, created_at, is_kahoot_mode)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ''', (username, email, password_hash, salt, role, datetime.now().isoformat(), kahoot_mode))
                conn.commit()
            
            logger.info(f"Utilisateur {username} créé avec succès (mode: {'Kahoot' if kahoot_mode else 'Normal'})")
            return True
            
        except Exception as e:
            logger.error(f"Erreur lors de la création de l'utilisateur {username}: {e}")
            return False
    
    def generate_unique_username(self, base_username: str, session_code: str = None) -> str:
        """Génère un username unique en ajoutant un suffixe numérique si nécessaire
        
        Si session_code est fourni, vérifie l'unicité uniquement dans cette session.
        Sinon, vérifie l'unicité globale dans la table users.
        """
        username = base_username.strip()
        original_username = username
        
        if session_code:
            # Vérifier l'unicité dans la session spécifique (via game_scores)
            counter = 1
            while self.username_exists_in_session(username, session_code):
                username = f"{original_username}{counter}"
                counter += 1
                # Limite de sécurité pour éviter une boucle infinie
                if counter > 9999:
                    # Utiliser un timestamp comme fallback
                    import time
                    username = f"{original_username}_{int(time.time())}"
                    break
        else:
            # Vérifier l'unicité globale dans la table users
            counter = 1
            while self.get_user_by_username(username):
                username = f"{original_username}{counter}"
                counter += 1
                # Limite de sécurité pour éviter une boucle infinie
                if counter > 9999:
                    # Utiliser un timestamp comme fallback
                    import time
                    username = f"{original_username}_{int(time.time())}"
                    break
        
        return username
    
    def username_exists_in_session(self, username: str, session_code: str) -> bool:
        """Vérifie si un username existe déjà dans une session donnée (joueur actif ou ayant terminé)"""
        try:
            normalized_code = session_code.upper().strip()
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                # Vérifier dans active_players (joueurs en cours) ET game_scores (joueurs ayant terminé)
                cursor.execute('''
                    SELECT COUNT(*) FROM (
                        SELECT username FROM active_players
                        WHERE UPPER(TRIM(session_code)) = ? AND username = ?
                        UNION
                        SELECT username FROM game_scores
                        WHERE UPPER(TRIM(session_id)) = ? AND username = ?
                    )
                ''', (normalized_code, username, normalized_code, username))
                count = cursor.fetchone()[0]
                return count > 0
        except Exception as e:
            logger.error(f"Erreur lors de la vérification du username dans la session: {e}")
            return False
    
    def register_active_player(self, username: str, session_code: str) -> bool:
        """Enregistre un joueur actif dans une session (appelé à la connexion)"""
        try:
            normalized_code = session_code.upper().strip()
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT OR REPLACE INTO active_players (session_code, username, connected_at)
                    VALUES (?, ?, ?)
                ''', (normalized_code, username, datetime.now().isoformat()))
                conn.commit()
                logger.info(f"Joueur actif enregistré: {username} dans la session {normalized_code}")
                return True
        except Exception as e:
            logger.error(f"Erreur lors de l'enregistrement du joueur actif: {e}")
            return False
    
    def remove_active_player(self, username: str, session_code: str) -> bool:
        """Retire un joueur actif d'une session (appelé quand le jeu est terminé)"""
        try:
            normalized_code = session_code.upper().strip()
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    DELETE FROM active_players
                    WHERE UPPER(TRIM(session_code)) = ? AND username = ?
                ''', (normalized_code, username))
                conn.commit()
                logger.info(f"Joueur actif retiré: {username} de la session {normalized_code}")
                return True
        except Exception as e:
            logger.error(f"Erreur lors de la suppression du joueur actif: {e}")
            return False

    # Authoritative progress helpers
    def upsert_progress(self, username: str, session_code: str, current_step: int) -> None:
        try:
            normalized_code = session_code.upper().strip()
            now = datetime.now().isoformat()
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT INTO player_progress (session_code, username, current_step, completed, updated_at)
                    VALUES (?, ?, ?, 0, ?)
                    ON CONFLICT(session_code, username)
                    DO UPDATE SET current_step=excluded.current_step, updated_at=excluded.updated_at
                ''', (normalized_code, username, max(1, min(5, int(current_step))), now))
                conn.commit()
        except Exception as e:
            logger.error(f"Erreur upsert_progress: {e}")

    def mark_completed(self, username: str, session_code: str) -> None:
        try:
            normalized_code = session_code.upper().strip()
            now = datetime.now().isoformat()
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    UPDATE player_progress
                    SET completed = 1, current_step = 5, updated_at = ?
                    WHERE session_code = ? AND username = ?
                ''', (now, normalized_code, username))
                conn.commit()
        except Exception as e:
            logger.error(f"Erreur mark_completed: {e}")

    def get_next_step(self, username: str, session_code: str) -> Dict:
        """Retourne le prochain step autorisé pour cet utilisateur dans la session."""
        try:
            normalized_code = session_code.upper().strip()
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    SELECT current_step, completed FROM player_progress
                    WHERE session_code = ? AND username = ?
                ''', (normalized_code, username))
                row = cursor.fetchone()
                if not row:
                    return { 'next_step': 1, 'completed': False }
                current_step, completed = row
                if completed:
                    return { 'next_step': 6, 'completed': True }
                return { 'next_step': max(2, min(6, int(current_step) + 1)), 'completed': False }
        except Exception as e:
            logger.error(f"Erreur get_next_step: {e}")
            return { 'next_step': 1, 'completed': False }
    
    def authenticate_user(self, username: str, password: str = None) -> Tuple[bool, Optional[User]]:
        """Authentifie un utilisateur (mode normal avec password ou mode Kahoot sans)"""
        try:
            user = self.get_user_by_username(username)
            
            # En mode Kahoot (sans password), gérer les doublons automatiquement
            if password is None or password == "":
                if not user:
                    # Créer l'utilisateur automatiquement en mode Kahoot
                    logger.info(f"Utilisateur {username} n'existe pas, création en mode Kahoot")
                    if self.create_user(username, kahoot_mode=True):
                        user = self.get_user_by_username(username)
                    else:
                        return False, None
                else:
                    # Utilisateur existe déjà - réutiliser (mode Kahoot permet la réutilisation)
                    logger.info(f"Connexion Kahoot avec utilisateur existant: {username}")
            else:
                # Mode normal avec password - pas de création automatique
                if not user:
                    return False, None
                
                if not user.is_active:
                    logger.warning(f"Tentative de connexion avec un compte désactivé: {username}")
                    return False, None
            
            # Mode Kahoot : pas de vérification de mot de passe
            if user.is_kahoot_mode or password is None or password == "":
                self.update_last_login(user.id)
                logger.info(f"Connexion Kahoot réussie pour l'utilisateur: {username}")
                return True, user
            
            # Mode normal : vérifier le mot de passe
            if user.password_hash and user.salt:
                if self.verify_password(password, user.password_hash, user.salt):
                    self.update_last_login(user.id)
                    logger.info(f"Connexion réussie pour l'utilisateur: {username}")
                    return True, user
                else:
                    logger.warning(f"Mot de passe incorrect pour l'utilisateur: {username}")
                    return False, None
            else:
                # Pas de mot de passe défini mais mode normal demandé
                logger.warning(f"Mot de passe requis pour l'utilisateur: {username}")
                return False, None
                
        except Exception as e:
            logger.error(f"Erreur lors de l'authentification de {username}: {e}")
            return False, None
    
    def get_user_by_username(self, username: str) -> Optional[User]:
        """Récupère un utilisateur par son nom d'utilisateur"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    SELECT id, username, email, password_hash, salt, role, created_at, last_login, is_active, is_kahoot_mode
                    FROM users WHERE username = ?
                ''', (username,))
                
                row = cursor.fetchone()
                if row:
                    return User(
                        id=row[0],
                        username=row[1],
                        email=row[2],
                        password_hash=row[3],
                        salt=row[4],
                        role=row[5],
                        created_at=row[6],
                        last_login=row[7],
                        is_active=bool(row[8]),
                        is_kahoot_mode=bool(row[9]) if len(row) > 9 else False
                    )
                return None
                
        except Exception as e:
            logger.error(f"Erreur lors de la récupération de l'utilisateur {username}: {e}")
            return None
    
    def get_user_by_email(self, email: str) -> Optional[User]:
        """Récupère un utilisateur par son email"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    SELECT id, username, email, password_hash, salt, role, created_at, last_login, is_active, is_kahoot_mode
                    FROM users WHERE email = ?
                ''', (email,))
                
                row = cursor.fetchone()
                if row:
                    return User(
                        id=row[0],
                        username=row[1],
                        email=row[2],
                        password_hash=row[3],
                        salt=row[4],
                        role=row[5],
                        created_at=row[6],
                        last_login=row[7],
                        is_active=bool(row[8]),
                        is_kahoot_mode=bool(row[9]) if len(row) > 9 else False
                    )
                return None
                
        except Exception as e:
            logger.error(f"Erreur lors de la récupération de l'utilisateur par email {email}: {e}")
            return None
    
    def update_last_login(self, user_id: int):
        """Met à jour la dernière connexion d'un utilisateur"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    UPDATE users SET last_login = ? WHERE id = ?
                ''', (datetime.now().isoformat(), user_id))
                conn.commit()
        except Exception as e:
            logger.error(f"Erreur lors de la mise à jour de la dernière connexion: {e}")
    
    def get_all_users(self) -> List[User]:
        """Récupère tous les utilisateurs"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    SELECT id, username, email, password_hash, salt, role, created_at, last_login, is_active, is_kahoot_mode
                    FROM users ORDER BY created_at DESC
                ''')
                
                users = []
                for row in cursor.fetchall():
                    users.append(User(
                        id=row[0],
                        username=row[1],
                        email=row[2],
                        password_hash=row[3],
                        salt=row[4],
                        role=row[5],
                        created_at=row[6],
                        last_login=row[7],
                        is_active=bool(row[8]),
                        is_kahoot_mode=bool(row[9]) if len(row) > 9 else False
                    ))
                return users
                
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des utilisateurs: {e}")
            return []
    
    def change_password(self, username: str, old_password: str, new_password: str) -> bool:
        """Change le mot de passe d'un utilisateur"""
        try:
            user = self.get_user_by_username(username)
            if not user:
                return False
            
            # Vérifier l'ancien mot de passe
            if not self.verify_password(old_password, user.password_hash, user.salt):
                logger.warning(f"Ancien mot de passe incorrect pour {username}")
                return False
            
            # Hacher le nouveau mot de passe
            new_password_hash, new_salt = self.hash_password(new_password)
            
            # Mettre à jour dans la base de données
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    UPDATE users SET password_hash = ?, salt = ? WHERE id = ?
                ''', (new_password_hash, new_salt, user.id))
                conn.commit()
            
            logger.info(f"Mot de passe changé avec succès pour {username}")
            return True
            
        except Exception as e:
            logger.error(f"Erreur lors du changement de mot de passe pour {username}: {e}")
            return False
    
    def deactivate_user(self, username: str) -> bool:
        """Désactive un utilisateur"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    UPDATE users SET is_active = 0 WHERE username = ?
                ''', (username,))
                conn.commit()
            
            logger.info(f"Utilisateur {username} désactivé")
            return True
            
        except Exception as e:
            logger.error(f"Erreur lors de la désactivation de {username}: {e}")
            return False
    
    def save_game_score(self, username: str, total_score: int, stars: int, mot_scores: Dict[str, int], session_id: str = None) -> bool:
        """Sauvegarde le score d'une partie terminée"""
        try:
            import json
            # Normaliser le session_id en uppercase pour cohérence
            normalized_session_id = session_id.upper().strip() if session_id else None
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT INTO game_scores (username, total_score, stars, mot_scores, completed_at, session_id)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (
                    username,
                    total_score,
                    stars,
                    json.dumps(mot_scores),
                    datetime.now().isoformat(),
                    normalized_session_id
                ))
                conn.commit()
            logger.info(f"Score sauvegardé pour {username}: {total_score}/15 ({stars} étoiles), session={normalized_session_id}")
            return True
        except Exception as e:
            logger.error(f"Erreur lors de la sauvegarde du score pour {username}: {e}")
            return False
    
    def get_leaderboard(self, limit: int = 1000) -> List[Dict]:
        """Récupère le classement des meilleurs scores (un seul score par utilisateur, le meilleur)"""
        try:
            import json
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                # Récupérer le meilleur score de chaque utilisateur
                # En cas d'égalité de score, on prend le plus récent
                cursor.execute('''
                    SELECT 
                        username, 
                        MAX(total_score) as total_score,
                        stars,
                        mot_scores,
                        MAX(completed_at) as completed_at
                    FROM game_scores
                    GROUP BY username
                    ORDER BY total_score DESC, completed_at ASC
                    LIMIT ?
                ''', (limit,))
                
                leaderboard = []
                rank = 1
                prev_score = None
                
                for row in cursor.fetchall():
                    total_score = row[1]
                    
                    # Pas de même rank en cas d'égalité : celui qui a fini en premier (par ORDER BY completed_at ASC)
                    # est mieux classé. Donc on incrémente toujours le rank.
                    # Le ORDER BY total_score DESC, completed_at ASC dans la requête SQL garantit déjà
                    # que les joueurs sont triés correctement (meilleur score d'abord, puis premier fini en premier)
                    
                    # Pour les scores avec enablers, on doit récupérer le stars du meilleur score
                    # On fait une sous-requête pour récupérer le stars du meilleur score de cet utilisateur
                    cursor2 = conn.cursor()
                    cursor2.execute('''
                        SELECT stars, mot_scores
                        FROM game_scores
                        WHERE username = ? AND total_score = ?
                        ORDER BY completed_at DESC
                        LIMIT 1
                    ''', (row[0], total_score))
                    best_row = cursor2.fetchone()
                    stars = best_row[0] if best_row else row[2]
                    mot_scores = best_row[1] if best_row else row[3]
                    
                    leaderboard.append({
                        'rank': rank,
                        'username': row[0],
                        'total_score': total_score,
                        'stars': stars,
                        'mot_scores': json.loads(mot_scores) if mot_scores else {},
                        'completed_at': row[4]
                    })
                    
                    prev_score = total_score
                    rank += 1
                    
                return leaderboard
        except Exception as e:
            logger.error(f"Erreur lors de la récupération du leaderboard: {e}")
            return []
    
    def get_user_best_score(self, username: str) -> Optional[Dict]:
        """Récupère le meilleur score d'un utilisateur"""
        try:
            import json
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    SELECT username, total_score, stars, mot_scores, completed_at
                    FROM game_scores
                    WHERE username = ?
                    ORDER BY total_score DESC, completed_at ASC
                    LIMIT 1
                ''', (username,))
                
                row = cursor.fetchone()
                if row:
                    return {
                        'username': row[0],
                        'total_score': row[1],
                        'stars': row[2],
                        'mot_scores': json.loads(row[3]) if row[3] else {},
                        'completed_at': row[4]
                    }
                return None
        except Exception as e:
            logger.error(f"Erreur lors de la récupération du meilleur score de {username}: {e}")
            return None
    
    def create_game_session(self, created_by: str) -> Optional[str]:
        """Crée une nouvelle session de jeu et retourne le code de session"""
        try:
            # Générer un code de session unique (6 caractères alphanumériques)
            import random
            import string
            code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
            
            # Vérifier que le code n'existe pas déjà
            while self.get_session_by_code(code):
                code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
            
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT INTO game_sessions (session_code, created_by, created_at, is_active, player_count)
                    VALUES (?, ?, ?, 1, 0)
                ''', (code, created_by, datetime.now().isoformat()))
                conn.commit()
            
            logger.info(f"Session de jeu créée: {code} par {created_by}")
            return code
        except Exception as e:
            logger.error(f"Erreur lors de la création de la session: {e}")
            return None
    
    def get_session_by_code(self, session_code: str) -> Optional[Dict]:
        """Récupère une session par son code"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    SELECT id, session_code, created_by, created_at, is_active, player_count
                    FROM game_sessions
                    WHERE session_code = ? AND is_active = 1
                ''', (session_code.upper(),))
                row = cursor.fetchone()
                if row:
                    return {
                        'id': row[0],
                        'session_code': row[1],
                        'created_by': row[2],
                        'created_at': row[3],
                        'is_active': bool(row[4]),
                        'player_count': row[5]
                    }
            return None
        except Exception as e:
            logger.error(f"Erreur lors de la récupération de la session {session_code}: {e}")
            return None
    
    def increment_session_player_count(self, session_code: str) -> bool:
        """Incrémente le compteur de joueurs pour une session"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    UPDATE game_sessions
                    SET player_count = player_count + 1
                    WHERE session_code = ?
                ''', (session_code.upper(),))
                conn.commit()
            return True
        except Exception as e:
            logger.error(f"Erreur lors de l'incrémentation du compteur de joueurs: {e}")
            return False
    
    def get_leaderboard_for_session(self, session_code: str, limit: int = 1000) -> List[Dict]:
        """Récupère le leaderboard pour une session spécifique"""
        try:
            import json
            # Normaliser le session_code en uppercase pour la comparaison
            normalized_code = session_code.upper().strip()
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                # Filter strictly by session_id - only players who played in THIS specific session
                # Use UPPER() to handle any case inconsistencies
                cursor.execute('''
                    SELECT username, MAX(total_score) as max_score, MAX(stars) as max_stars, 
                           (SELECT mot_scores FROM game_scores 
                            WHERE username = gs.username 
                            AND UPPER(TRIM(session_id)) = ? 
                            ORDER BY total_score DESC LIMIT 1) as mot_scores,
                           MIN(completed_at) as first_completed
                    FROM game_scores gs
                    WHERE UPPER(TRIM(session_id)) = ? AND session_id IS NOT NULL
                    GROUP BY username
                    ORDER BY max_score DESC, first_completed ASC
                    LIMIT ?
                ''', (normalized_code, normalized_code, limit))
                
                leaderboard = []
                rank = 1
                prev_score = None
                
                for row in cursor.fetchall():
                    username = row[0]
                    total_score = row[1]
                    stars = row[2]
                    mot_scores_json = row[3]
                    completed_at = row[4]
                    mot_scores = json.loads(mot_scores_json) if mot_scores_json else {}
                    
                    # Pas de même rank en cas d'égalité : celui qui a fini en premier (par ORDER BY first_completed ASC)
                    # est mieux classé. Donc on incrémente toujours le rank.
                    # Le ORDER BY max_score DESC, first_completed ASC dans la requête SQL garantit déjà
                    # que les joueurs sont triés correctement (meilleur score d'abord, puis premier fini en premier)
                    
                    leaderboard.append({
                        'rank': rank,
                        'username': username,
                        'total_score': total_score,
                        'stars': stars,
                        'mot_scores': mot_scores,
                        'completed_at': completed_at
                    })
                    
                    prev_score = total_score
                    rank += 1
                
                return leaderboard
        except Exception as e:
            logger.error(f"Erreur lors de la récupération du leaderboard de session: {e}")
            return []

# Instance globale du gestionnaire d'utilisateurs
# Utilise DATABASE_PATH depuis les variables d'environnement, ou défaut à "users.db"
# Sur Railway, utiliser un chemin dans un volume persistant (ex: /data/users.db)
database_path = os.environ.get('DATABASE_PATH', 'users.db')

# Créer le répertoire parent si nécessaire (pour Railway volumes)
if database_path != 'users.db':
    db_dir = os.path.dirname(database_path)
    if db_dir and not os.path.exists(db_dir):
        os.makedirs(db_dir, exist_ok=True)
        logger.info(f"📁 Créé le répertoire pour la base de données: {db_dir}")

logger.info(f"📊 Initialisation de la base de données: {database_path}")
user_manager = UserManager(db_path=database_path)
