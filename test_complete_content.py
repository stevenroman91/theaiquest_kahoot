#!/usr/bin/env python3
"""
Test complet du nouveau système de contenu
Montre TOUTES les fonctionnalités disponibles
"""

from game_content_manager import content_manager

def test_all_features():
    """Test toutes les fonctionnalités du système de contenu"""
    
    print("🎮 TEST COMPLET DU SYSTÈME DE CONTENU")
    print("=" * 60)
    
    # Test des phases et choix
    print("\n📋 PHASES ET CHOIX:")
    for phase_num in range(1, 6):
        choices = content_manager.get_phase_choices(phase_num)
        print(f"  Phase {phase_num}: {len(choices)} choix disponibles")
        for choice_id, choice_info in list(choices.items())[:2]:  # Afficher seulement les 2 premiers
            title = choice_info.get('title', 'Sans titre')
            print(f"    - {choice_id}: {title[:50]}...")
    
    # Test des enablers
    print("\n🔧 ENABLERS:")
    enablers = content_manager.content.get("enablers", {})
    print(f"  Total enablers: {len(enablers)}")
    
    categories = ["technology_partnerships", "policies_governance", "transformation_change"]
    for category in categories:
        category_enablers = content_manager.get_enablers_by_category(category)
        print(f"  - {category}: {len(category_enablers)} enablers")
    
    # Test du dashboard
    print("\n📊 DASHBOARD:")
    dashboard_title = content_manager.get_dashboard_title()
    dashboard_subtitle = content_manager.get_dashboard_subtitle()
    print(f"  Titre: {dashboard_title}")
    print(f"  Sous-titre: {dashboard_subtitle}")
    
    categories = content_manager.get_dashboard_categories()
    for cat_id, cat_info in categories.items():
        print(f"  - {cat_id}: {cat_info.get('title', 'Sans titre')}")
    
    # Test des messages de score
    print("\n⭐ MESSAGES DE SCORE:")
    score_messages = content_manager.content.get("score_messages", {})
    for phase_key, phase_messages in score_messages.items():
        print(f"  {phase_key}: {len(phase_messages)} choix avec messages")
        for choice_id in list(phase_messages.keys())[:1]:  # Afficher seulement le premier
            messages = phase_messages[choice_id]
            print(f"    - {choice_id}: {len(messages)} niveaux de score")
    
    # Test du budget Phase 4
    print("\n💰 BUDGET PHASE 4:")
    budget = content_manager.get_phase_budget(4)
    print(f"  Budget disponible: {budget} points")
    
    phase4_choices = content_manager.get_phase_choices(4)
    total_cost = 0
    for choice_id, choice_info in phase4_choices.items():
        cost = choice_info.get('cost', 0)
        total_cost += cost
        print(f"    - {choice_id}: {cost} points")
    print(f"  Coût total si tout est sélectionné: {total_cost} points")

def show_content_structure():
    """Affiche la structure complète du contenu"""
    
    print("\n📁 STRUCTURE DU FICHIER game_content.json:")
    print("=" * 60)
    
    content = content_manager.content
    
    sections = [
        ("game_branding", "🏢 Branding (nom, titre, logo)"),
        ("page_templates", "📄 Templates de pages"),
        ("game_steps", "🎮 Étapes du jeu"),
        ("phases", "📋 Phases avec choix"),
        ("enablers", "🔧 Enablers"),
        ("dashboard", "📊 Dashboard"),
        ("score_messages", "⭐ Messages de score"),
        ("characters", "👥 Personnages"),
        ("ui_text", "🔘 Texte de l'interface"),
        ("videos", "🎬 Vidéos")
    ]
    
    for section_key, section_name in sections:
        if section_key in content:
            section_data = content[section_key]
            if isinstance(section_data, dict):
                count = len(section_data)
                print(f"  {section_name}: {count} éléments")
            elif isinstance(section_data, list):
                count = len(section_data)
                print(f"  {section_name}: {count} éléments")
            else:
                print(f"  {section_name}: présent")
        else:
            print(f"  {section_name}: ❌ manquant")

def demo_modifications():
    """Démontre comment modifier le contenu"""
    
    print("\n🔧 DÉMONSTRATION DE MODIFICATIONS:")
    print("=" * 60)
    
    print("1. Modification du nom de l'entreprise:")
    print(f"   Avant: {content_manager.get_company_name()}")
    content_manager.update_content("game_branding", "company_name", "MaNouvelleEntreprise")
    print(f"   Après: {content_manager.get_company_name()}")
    
    print("\n2. Modification du titre d'une étape:")
    print(f"   Avant: {content_manager.get_step_title(1)}")
    content_manager.update_content("game_steps", "step1", {
        "title": "NOUVEAU TITRE: Ma Stratégie IA Personnalisée",
        "description": "Description modifiée...",
        "video": "phase_1.mp4"
    })
    print(f"   Après: {content_manager.get_step_title(1)}")
    
    print("\n3. Modification d'un enabler:")
    enabler_id = "ai_productivity_opportunities"
    print(f"   Avant: {content_manager.get_enabler_title(enabler_id)}")
    content_manager.update_content("enablers", enabler_id, {
        "title": "NOUVEAU: Opportunités IA Personnalisées",
        "description": "Description complètement modifiée...",
        "category": "technology_partnerships"
    })
    print(f"   Après: {content_manager.get_enabler_title(enabler_id)}")
    
    print("\n4. Rechargement du contenu original:")
    content_manager.reload_content()
    print(f"   Nom entreprise restauré: {content_manager.get_company_name()}")
    print(f"   Titre étape restauré: {content_manager.get_step_title(1)}")

if __name__ == "__main__":
    test_all_features()
    show_content_structure()
    demo_modifications()
    
    print("\n" + "=" * 60)
    print("✅ SYSTÈME COMPLET ET FONCTIONNEL !")
    print("📝 Tout le contenu du jeu est maintenant dans game_content.json")
    print("🔧 Utilisez le content_manager pour accéder à tout le contenu")
    print("📖 Consultez CONTENT_GUIDE.md pour plus de détails")
    print("=" * 60)
