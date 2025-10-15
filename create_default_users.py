#!/usr/bin/env python3
"""
Script simple pour créer des utilisateurs avec la bonne méthode de hachage
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from user_manager import UserManager

def create_users():
    """Crée les utilisateurs par défaut"""
    print("🔐 Création des utilisateurs par défaut")
    
    user_manager = UserManager()
    
    # Utilisateurs à créer
    users = [
        ('admin', 'admin@playnext.com', 'FDJ2024!Admin', 'admin'),
        ('trainer', 'trainer@playnext.com', 'Trainer2024!', 'trainer')
    ]
    
    created_count = 0
    
    for username, email, password, role in users:
        # Vérifier si l'utilisateur existe déjà
        existing_user = user_manager.get_user_by_username(username)
        if existing_user:
            print(f"ℹ️  Utilisateur '{username}' existe déjà")
            continue
        
        # Créer l'utilisateur
        if user_manager.create_user(username, email, password, role):
            print(f"✅ Utilisateur '{username}' créé avec succès")
            created_count += 1
        else:
            print(f"❌ Erreur lors de la création de l'utilisateur '{username}'")
    
    print(f"\n🎉 {created_count} utilisateur(s) créé(s) avec succès !")
    print("\n🔐 IDENTIFIANTS :")
    print("Admin: admin / FDJ2024!Admin")
    print("Trainer: trainer / Trainer2024!")

if __name__ == "__main__":
    create_users()
