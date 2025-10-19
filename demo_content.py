#!/usr/bin/env python3
"""
Exemple d'utilisation du nouveau système de contenu
Ce script montre comment modifier facilement le contenu du jeu
"""

from game_content_manager import content_manager

def demo_content_changes():
    """Démonstration des modifications de contenu"""
    
    print("=== AVANT MODIFICATION ===")
    print(f"Nom de l'entreprise: {content_manager.get_company_name()}")
    print(f"Titre du jeu: {content_manager.get_game_title()}")
    print(f"Sous-titre: {content_manager.get_game_subtitle()}")
    
    # Exemple de modification
    print("\n=== MODIFICATION EN COURS ===")
    
    # Changer le nom de l'entreprise
    content_manager.update_content("game_branding", "company_name", "MaNouvelleEntreprise")
    print("✅ Nom de l'entreprise changé vers 'MaNouvelleEntreprise'")
    
    # Changer le titre du jeu
    content_manager.update_content("game_branding", "game_title", "Mon Super Jeu IA")
    print("✅ Titre du jeu changé vers 'Mon Super Jeu IA'")
    
    # Changer le sous-titre
    content_manager.update_content("game_branding", "game_subtitle", "Édition Spéciale v2.0")
    print("✅ Sous-titre changé vers 'Édition Spéciale v2.0'")
    
    # Changer le texte de la page d'accueil
    welcome_content = content_manager.get_welcome_content()
    print(f"\nTexte actuel de la page d'accueil: {welcome_content.get('title', 'Non défini')}")
    
    # Modifier le contenu d'une page spécifique
    content_manager.update_content("page_templates", "welcome_page", {
        "title": "Bienvenue dans Mon Super Jeu IA !",
        "subtitle": "Vous êtes le Directeur IA de MaNouvelleEntreprise",
        "description": "une entreprise leader dans l'innovation technologique...",
        "mission": "Votre mission: révolutionner l'entreprise avec l'IA !",
        "button_text": "Commencer l'Aventure"
    })
    print("✅ Contenu de la page d'accueil modifié")
    
    print("\n=== APRÈS MODIFICATION ===")
    print(f"Nom de l'entreprise: {content_manager.get_company_name()}")
    print(f"Titre du jeu: {content_manager.get_game_title()}")
    print(f"Sous-titre: {content_manager.get_game_subtitle()}")
    
    welcome_content = content_manager.get_welcome_content()
    print(f"Titre page d'accueil: {welcome_content.get('title', 'Non défini')}")
    
    print("\n=== RÉCUPÉRATION ===")
    # Recharger le contenu depuis le fichier
    content_manager.reload_content()
    print("✅ Contenu rechargé depuis le fichier")
    print(f"Nom de l'entreprise: {content_manager.get_company_name()}")

def show_all_content():
    """Affiche tout le contenu disponible"""
    
    print("=== CONTENU DISPONIBLE ===")
    
    print("\n🏢 BRANDING:")
    print(f"  - Nom entreprise: {content_manager.get_company_name()}")
    print(f"  - Titre jeu: {content_manager.get_game_title()}")
    print(f"  - Sous-titre: {content_manager.get_game_subtitle()}")
    print(f"  - Icône logo: {content_manager.get_logo_icon()}")
    print(f"  - Couleur logo: {content_manager.get_logo_color()}")
    
    print("\n📄 PAGES:")
    pages = ["welcome_page", "introduction_page", "teams_meeting_page", 
             "step1_followup_page", "pilot_step_page", "enterprise_scaling_page"]
    
    for page in pages:
        content = content_manager.get_page_content(page)
        title = content.get('title', 'Non défini')
        print(f"  - {page}: {title}")
    
    print("\n🎮 ÉTAPES:")
    for i in range(1, 6):
        title = content_manager.get_step_title(i)
        print(f"  - Step {i}: {title}")
    
    print("\n👥 PERSONNAGES:")
    characters = ["protagonist", "elena", "james", "amira", "marcus"]
    for char in characters:
        name = content_manager.get_character_name(char)
        role = content_manager.get_character_role(char)
        print(f"  - {char}: {name} ({role})")
    
    print("\n🔘 BOUTONS:")
    buttons = ["login", "start_game", "continue", "join_teams", "skip_video"]
    for button in buttons:
        text = content_manager.get_button_text(button)
        print(f"  - {button}: {text}")

if __name__ == "__main__":
    print("🎮 Démonstration du système de contenu du jeu")
    print("=" * 50)
    
    show_all_content()
    
    print("\n" + "=" * 50)
    print("💡 Pour modifier le contenu:")
    print("1. Éditez directement le fichier 'game_content.json'")
    print("2. Ou utilisez les méthodes update_content() du content_manager")
    print("3. Redémarrez le serveur pour voir les changements")
    print("=" * 50)
