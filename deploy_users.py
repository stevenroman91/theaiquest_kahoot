#!/usr/bin/env python3
"""
Script de déploiement sécurisé pour créer les utilisateurs par défaut
À utiliser uniquement lors du déploiement initial
"""

import os
import sqlite3
import hashlib
import secrets
from datetime import datetime

def hash_password(password: str) -> str:
    """Hash un mot de passe avec SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def create_default_users():
    """Crée les utilisateurs par défaut depuis les variables d'environnement"""
    db_path = "users.db"
    
    # Récupération des identifiants depuis les variables d'environnement
    admin_username = os.environ.get('ADMIN_USERNAME', 'admin')
    admin_password = os.environ.get('ADMIN_PASSWORD')
    trainer_username = os.environ.get('TRAINER_USERNAME', 'trainer')
    trainer_password = os.environ.get('TRAINER_PASSWORD')
    
    if not admin_password or not trainer_password:
        print("❌ Erreur: Les variables d'environnement ADMIN_PASSWORD et TRAINER_PASSWORD doivent être définies")
        print("Exemple: export ADMIN_PASSWORD='votre_mot_de_passe_admin'")
        print("         export TRAINER_PASSWORD='votre_mot_de_passe_trainer'")
        return False
    
    # Connexion à la base de données
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Création de la table si elle n'existe pas
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            salt TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'user',
            created_at TEXT NOT NULL,
            last_login TEXT,
            is_active BOOLEAN NOT NULL DEFAULT 1
        )
    ''')
    
    users = [
        {
            'username': admin_username,
            'email': f'{admin_username}@playnext.com',
            'password': admin_password,
            'role': 'admin'
        },
        {
            'username': trainer_username,
            'email': f'{trainer_username}@playnext.com',
            'password': trainer_password,
            'role': 'trainer'
        }
    ]
    
    created_count = 0
    
    for user_data in users:
        try:
            # Vérifier si l'utilisateur existe déjà
            cursor.execute('SELECT id FROM users WHERE username = ?', (user_data['username'],))
            if cursor.fetchone():
                print(f"ℹ️  Utilisateur '{user_data['username']}' existe déjà")
                continue
            
            # Créer le salt et hasher le mot de passe
            salt = secrets.token_hex(16)
            password_hash = hash_password(user_data['password'])
            
            # Insérer l'utilisateur
            cursor.execute('''
                INSERT INTO users (username, email, password_hash, salt, role, created_at, is_active)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (
                user_data['username'],
                user_data['email'],
                password_hash,
                salt,
                user_data['role'],
                datetime.now().isoformat(),
                1
            ))
            
            print(f"✅ Utilisateur '{user_data['username']}' créé avec succès")
            created_count += 1
            
        except sqlite3.Error as e:
            print(f"❌ Erreur lors de la création de l'utilisateur '{user_data['username']}': {e}")
    
    # Valider les changements
    conn.commit()
    conn.close()
    
    print(f"🎉 {created_count} utilisateur(s) créé(s) avec succès !")
    return True

if __name__ == "__main__":
    print("🔐 Script de déploiement sécurisé")
    print("⚠️  Assurez-vous que les variables d'environnement sont définies")
    create_default_users()
