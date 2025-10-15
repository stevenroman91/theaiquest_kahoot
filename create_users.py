#!/usr/bin/env python3
"""
Script pour créer les utilisateurs par défaut
"""

import sqlite3
import hashlib
import secrets
from datetime import datetime

def hash_password(password: str) -> str:
    """Hash un mot de passe avec SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def create_users():
    """Crée les utilisateurs par défaut"""
    db_path = "users.db"
    
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
    
    # Utilisateurs à créer
    users = [
        {
            'username': 'admin',
            'email': 'admin@playnext.com',
            'password': 'FDJ2024!Admin',
            'role': 'admin'
        },
        {
            'username': 'trainer',
            'email': 'trainer@playnext.com',
            'password': 'Trainer2024!',
            'role': 'trainer'
        }
    ]
    
    created_count = 0
    
    for user_data in users:
        try:
            # Vérifier si l'utilisateur existe déjà
            cursor.execute('SELECT id FROM users WHERE username = ?', (user_data['username'],))
            if cursor.fetchone():
                print(f"Utilisateur '{user_data['username']}' existe déjà")
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
            print(f"   Email: {user_data['email']}")
            print(f"   Rôle: {user_data['role']}")
            print(f"   Mot de passe: {user_data['password']}")
            print()
            
            created_count += 1
            
        except sqlite3.Error as e:
            print(f"❌ Erreur lors de la création de l'utilisateur '{user_data['username']}': {e}")
    
    # Valider les changements
    conn.commit()
    conn.close()
    
    print(f"🎉 {created_count} utilisateur(s) créé(s) avec succès !")
    print("\n📋 Identifiants de connexion :")
    print("   Admin: admin / FDJ2024!Admin")
    print("   Trainer: trainer / Trainer2024!")

if __name__ == "__main__":
    create_users()
