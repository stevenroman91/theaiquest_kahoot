#!/usr/bin/env python3
"""
Script pour créer des utilisateurs de test pour AI Acceleration EXEC v1.6
"""

from user_manager import user_manager
import logging

# Configuration du logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def create_test_users():
    """Crée des utilisateurs de test"""
    
    test_users = [
        {
            "username": "admin",
            "email": "admin@fdj.com",
            "password": "FDJ2024!Admin",
            "role": "admin"
        },
        {
            "username": "manager",
            "email": "manager@fdj.com", 
            "password": "FDJ2024!Manager",
            "role": "manager"
        },
        {
            "username": "user1",
            "email": "user1@fdj.com",
            "password": "SecurePass2024!",
            "role": "user"
        },
        {
            "username": "test",
            "email": "test@fdj.com",
            "password": "TestUser2024#",
            "role": "user"
        }
    ]
    
    logger.info("Création des utilisateurs de test...")
    
    for user_data in test_users:
        success = user_manager.create_user(
            user_data["username"],
            user_data["email"], 
            user_data["password"],
            user_data["role"]
        )
        
        if success:
            logger.info(f"✅ Utilisateur créé: {user_data['username']} ({user_data['role']})")
        else:
            logger.warning(f"⚠️ Échec création: {user_data['username']}")
    
    logger.info("Création des utilisateurs terminée!")

def list_users():
    """Liste tous les utilisateurs"""
    users = user_manager.get_all_users()
    
    logger.info(f"\n📋 Liste des utilisateurs ({len(users)}):")
    logger.info("-" * 60)
    
    for user in users:
        status = "✅ Actif" if user.is_active else "❌ Inactif"
        logger.info(f"👤 {user.username} ({user.email}) - {user.role} - {status}")
        logger.info(f"   Créé: {user.created_at}")
        if user.last_login:
            logger.info(f"   Dernière connexion: {user.last_login}")
        logger.info("")

if __name__ == "__main__":
    print("🔐 AI Acceleration EXEC - Gestion des utilisateurs")
    print("=" * 50)
    
    # Créer les utilisateurs de test
    create_test_users()
    
    # Lister tous les utilisateurs
    list_users()
    
    print("\n🎮 Vous pouvez maintenant tester le jeu avec:")
    print("   - admin / FDJ2024!Admin (administrateur)")
    print("   - manager / FDJ2024!Manager (manager)")
    print("   - user1 / SecurePass2024! (utilisateur)")
    print("   - test / TestUser2024# (utilisateur)")
