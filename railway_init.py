#!/usr/bin/env python3
"""
Script d'initialisation pour Railway
Crée automatiquement les utilisateurs par défaut au déploiement
"""
import os
import sys
import logging

# Configuration du logging pour Railway
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_railway():
    """Initialise l'application pour Railway"""
    try:
        logger.info("🚀 Initialisation Railway - AI Transformation")
        
        # Importer et créer les utilisateurs
        from user_manager import UserManager
        
        user_manager = UserManager()
        
        # Utilisateurs par défaut
        users = [
            ('admin', 'admin@playnext.com', 'FDJ2024!Admin', 'admin'),
            ('trainer', 'trainer@playnext.com', 'Trainer2024!', 'trainer')
        ]
        
        created_count = 0
        
        for username, email, password, role in users:
            # Vérifier si l'utilisateur existe déjà
            existing_user = user_manager.get_user_by_username(username)
            if existing_user:
                logger.info(f"ℹ️  Utilisateur '{username}' existe déjà")
                continue
            
            # Créer l'utilisateur
            if user_manager.create_user(username, email, password, role):
                logger.info(f"✅ Utilisateur '{username}' créé avec succès")
                created_count += 1
            else:
                logger.error(f"❌ Erreur lors de la création de l'utilisateur '{username}'")
        
        logger.info(f"🎉 {created_count} utilisateur(s) créé(s) avec succès !")
        logger.info("🔐 IDENTIFIANTS Railway :")
        logger.info("Admin: admin / FDJ2024!Admin")
        logger.info("Trainer: trainer / Trainer2024!")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Erreur lors de l'initialisation Railway: {e}")
        return False

if __name__ == "__main__":
    success = init_railway()
    sys.exit(0 if success else 1)
