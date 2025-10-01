#!/usr/bin/env python3
"""
Système d'authentification pour AI Acceleration EXEC
Gestion des utilisateurs avec mots de passe hashés
"""

import sqlite3
import hashlib
import secrets
import logging
from typing import Optional, Tuple, List, Dict
from dataclasses import dataclass
from datetime import datetime

logger = logging.getLogger(__name__)

@dataclass
class User:
    """Représente un utilisateur"""
    id: int
    username: str
    email: str
    password_hash: str
    salt: str
    role: str
    created_at: str
    last_login: Optional[str] = None
    is_active: bool = True

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
                        email TEXT UNIQUE NOT NULL,
                        password_hash TEXT NOT NULL,
                        salt TEXT NOT NULL,
                        role TEXT DEFAULT 'user',
                        created_at TEXT NOT NULL,
                        last_login TEXT,
                        is_active BOOLEAN DEFAULT 1
                    )
                ''')
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
    
    def create_user(self, username: str, email: str, password: str, role: str = "user") -> bool:
        """Crée un nouvel utilisateur"""
        try:
            # Vérifier que l'utilisateur n'existe pas déjà
            if self.get_user_by_username(username):
                logger.warning(f"Utilisateur {username} existe déjà")
                return False
            
            if self.get_user_by_email(email):
                logger.warning(f"Email {email} existe déjà")
                return False
            
            # Hacher le mot de passe
            password_hash, salt = self.hash_password(password)
            
            # Insérer dans la base de données
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT INTO users (username, email, password_hash, salt, role, created_at)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (username, email, password_hash, salt, role, datetime.now().isoformat()))
                conn.commit()
            
            logger.info(f"Utilisateur {username} créé avec succès")
            return True
            
        except Exception as e:
            logger.error(f"Erreur lors de la création de l'utilisateur {username}: {e}")
            return False
    
    def authenticate_user(self, username: str, password: str) -> Tuple[bool, Optional[User]]:
        """Authentifie un utilisateur"""
        try:
            user = self.get_user_by_username(username)
            if not user:
                logger.warning(f"Tentative de connexion avec un utilisateur inexistant: {username}")
                return False, None
            
            if not user.is_active:
                logger.warning(f"Tentative de connexion avec un compte désactivé: {username}")
                return False, None
            
            # Vérifier le mot de passe
            if self.verify_password(password, user.password_hash, user.salt):
                # Mettre à jour la dernière connexion
                self.update_last_login(user.id)
                logger.info(f"Connexion réussie pour l'utilisateur: {username}")
                return True, user
            else:
                logger.warning(f"Mot de passe incorrect pour l'utilisateur: {username}")
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
                    SELECT id, username, email, password_hash, salt, role, created_at, last_login, is_active
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
                        is_active=bool(row[8])
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
                    SELECT id, username, email, password_hash, salt, role, created_at, last_login, is_active
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
                        is_active=bool(row[8])
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
                    SELECT id, username, email, password_hash, salt, role, created_at, last_login, is_active
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
                        is_active=bool(row[8])
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

# Instance globale du gestionnaire d'utilisateurs
user_manager = UserManager()
