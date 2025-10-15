#!/usr/bin/env python3
"""
Script de diagnostic Railway - Version simplifiée
"""
import os
import sys
import logging
import sqlite3

# Configuration du logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def check_railway_users():
    """Vérifie les utilisateurs sur Railway"""
    logger.info("🔍 VÉRIFICATION UTILISATEURS RAILWAY")
    logger.info("=" * 50)
    
    # Vérifier l'environnement Railway
    railway_env = os.environ.get('RAILWAY_ENVIRONMENT')
    if railway_env:
        logger.info(f"✅ Environnement Railway détecté: {railway_env}")
    else:
        logger.info("ℹ️  Exécution locale")
    
    # Vérifier la base de données
    db_path = "users.db"
    logger.info(f"📁 Vérification de {db_path}")
    
    if not os.path.exists(db_path):
        logger.error(f"❌ {db_path} n'existe pas")
        return False
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Vérifier la table users
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
        if not cursor.fetchone():
            logger.error("❌ Table 'users' n'existe pas")
            conn.close()
            return False
        
        logger.info("✅ Table 'users' existe")
        
        # Compter les utilisateurs
        cursor.execute("SELECT COUNT(*) FROM users")
        count = cursor.fetchone()[0]
        logger.info(f"📊 Nombre d'utilisateurs: {count}")
        
        if count == 0:
            logger.error("❌ Aucun utilisateur dans la base de données")
            conn.close()
            return False
        
        # Lister les utilisateurs
        cursor.execute("SELECT username, role, is_active FROM users")
        users = cursor.fetchall()
        
        logger.info("👥 Utilisateurs existants:")
        for username, role, is_active in users:
            status = "✅ Actif" if is_active else "❌ Inactif"
            logger.info(f"   - {username} ({role}) - {status}")
        
        # Vérifier spécifiquement admin et trainer
        cursor.execute("SELECT username FROM users WHERE username IN ('admin', 'trainer')")
        admin_trainer = cursor.fetchall()
        
        if len(admin_trainer) < 2:
            logger.error("❌ Utilisateurs admin/trainer manquants")
            conn.close()
            return False
        
        logger.info("✅ Utilisateurs admin et trainer présents")
        
        conn.close()
        return True
        
    except Exception as e:
        logger.error(f"❌ Erreur base de données: {e}")
        return False

def create_railway_users():
    """Crée les utilisateurs sur Railway"""
    logger.info("\n🔧 CRÉATION UTILISATEURS RAILWAY")
    logger.info("=" * 50)
    
    try:
        from user_manager import UserManager
        user_manager = UserManager()
        
        users = [
            ('admin', 'admin@playnext.com', 'FDJ2024!Admin', 'admin'),
            ('trainer', 'trainer@playnext.com', 'Trainer2024!', 'trainer')
        ]
        
        created_count = 0
        
        for username, email, password, role in users:
            # Vérifier si l'utilisateur existe
            existing_user = user_manager.get_user_by_username(username)
            if existing_user:
                logger.info(f"ℹ️  Utilisateur '{username}' existe déjà")
                continue
            
            # Créer l'utilisateur
            if user_manager.create_user(username, email, password, role):
                logger.info(f"✅ Utilisateur '{username}' créé")
                created_count += 1
            else:
                logger.error(f"❌ Échec création '{username}'")
        
        logger.info(f"🎉 {created_count} utilisateur(s) créé(s)")
        return True
        
    except Exception as e:
        logger.error(f"❌ Erreur création utilisateurs: {e}")
        return False

if __name__ == "__main__":
    logger.info("🚀 DIAGNOSTIC RAILWAY")
    
    # Vérifier les utilisateurs existants
    users_exist = check_railway_users()
    
    if not users_exist:
        logger.info("\n🔧 Tentative de création des utilisateurs...")
        create_success = create_railway_users()
        
        if create_success:
            logger.info("\n✅ Utilisateurs créés avec succès!")
            logger.info("🔐 IDENTIFIANTS:")
            logger.info("   Admin: admin / FDJ2024!Admin")
            logger.info("   Trainer: trainer / Trainer2024!")
        else:
            logger.error("\n❌ Échec de la création des utilisateurs")
            sys.exit(1)
    else:
        logger.info("\n✅ Utilisateurs déjà présents")
        logger.info("🔐 IDENTIFIANTS:")
        logger.info("   Admin: admin / FDJ2024!Admin")
        logger.info("   Trainer: trainer / Trainer2024!")
    
    logger.info("\n🎯 DIAGNOSTIC TERMINÉ")
