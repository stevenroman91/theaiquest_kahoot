#!/usr/bin/env python3
"""
Script pour migrer toutes les données de game_template_complete.json vers game_content.json
"""

import json
import os

def load_json_file(filename):
    """Charge un fichier JSON"""
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Erreur lors du chargement de {filename}: {e}")
        return None

def save_json_file(filename, data):
    """Sauvegarde un fichier JSON"""
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"✅ Fichier {filename} sauvegardé avec succès")
        return True
    except Exception as e:
        print(f"❌ Erreur lors de la sauvegarde de {filename}: {e}")
        return False

def migrate_content():
    """Migre le contenu de game_template_complete.json vers game_content.json"""
    
    # Charger les fichiers
    template_data = load_json_file("game_template_complete.json")
    content_data = load_json_file("game_content.json")
    
    if not template_data or not content_data:
        print("❌ Impossible de charger les fichiers JSON")
        return False
    
    print("🔄 Migration en cours...")
    
    # 1. Migrer les informations de base
    if "game_title" in template_data:
        content_data["game_branding"]["game_title"] = template_data["game_title"]
    
    if "company_name" in template_data:
        content_data["game_branding"]["company_name"] = template_data["company_name"]
    
    if "game_subtitle" in template_data:
        content_data["game_branding"]["game_subtitle"] = template_data["game_subtitle"]
    
    # 2. Migrer ui_text complet
    if "ui_text" in template_data:
        content_data["ui_text"] = template_data["ui_text"]
    
    # 3. Migrer terminology
    if "terminology" in template_data:
        content_data["terminology"] = template_data["terminology"]
    
    # 4. Migrer characters
    if "characters" in template_data:
        content_data["characters"] = template_data["characters"]
    
    # 5. Migrer phases avec toutes les données
    if "phases" in template_data:
        content_data["phases"] = template_data["phases"]
    
    # 6. Migrer enablers complets
    if "enablers" in template_data:
        content_data["enablers"] = template_data["enablers"]
    
    # 7. Migrer use_cases complets
    if "use_cases" in template_data:
        content_data["use_cases"] = template_data["use_cases"]
    
    # 8. Migrer theme_colors
    if "theme_colors" in template_data:
        content_data["theme_colors"] = template_data["theme_colors"]
    
    # Sauvegarder le fichier migré
    if save_json_file("game_content.json", content_data):
        print("✅ Migration terminée avec succès!")
        print("\n📋 Résumé de la migration:")
        print(f"   - Titre du jeu: {content_data['game_branding']['game_title']}")
        print(f"   - Nom de l'entreprise: {content_data['game_branding']['company_name']}")
        print(f"   - Nombre d'enablers: {len(content_data.get('enablers', {}))}")
        print(f"   - Nombre d'use cases: {len(content_data.get('use_cases', {}))}")
        print(f"   - Nombre de phases: {len(content_data.get('phases', {}))}")
        return True
    
    return False

if __name__ == "__main__":
    print("🚀 Début de la migration game_template_complete.json → game_content.json")
    print("=" * 60)
    
    if migrate_content():
        print("\n🎉 Migration réussie!")
        print("Vous pouvez maintenant supprimer game_template_complete.json en toute sécurité.")
    else:
        print("\n❌ Migration échouée!")

