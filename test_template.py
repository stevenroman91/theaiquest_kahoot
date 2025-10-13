#!/usr/bin/env python3
"""
Test script to demonstrate template customization
Shows how to switch between different game configurations
"""

from template_engine import GameTemplate

def test_template_customization():
    """Test different template configurations"""
    
    print("🎮 TEMPLATE CUSTOMIZATION DEMO")
    print("=" * 50)
    
    # Test original template
    print("\n📋 ORIGINAL TEMPLATE (AI Acceleration Game):")
    original_template = GameTemplate("game_template.json")
    print(f"Company: {original_template.get_company_name()}")
    print(f"Game Title: {original_template.get_game_title()}")
    print(f"Phase 1: {original_template.get_phase_title('phase1')}")
    print(f"Characters: {original_template.get_character_name('amira')}, {original_template.get_character_name('james')}, {original_template.get_character_name('elena')}")
    print(f"Teams Meeting: {original_template.get_teams_meeting_text()}")
    
    # Test digital transformation template
    print("\n📋 DIGITAL TRANSFORMATION TEMPLATE:")
    digital_template = GameTemplate("game_template_digital.json")
    print(f"Company: {digital_template.get_company_name()}")
    print(f"Game Title: {digital_template.get_game_title()}")
    print(f"Phase 1: {digital_template.get_phase_title('phase1')}")
    print(f"Characters: {digital_template.get_character_name('amira')}, {digital_template.get_character_name('james')}, {digital_template.get_character_name('elena')}")
    print(f"Teams Meeting: {digital_template.get_teams_meeting_text()}")
    
    # Show terminology differences
    print("\n📋 TERMINOLOGY COMPARISON:")
    print("Original:")
    print(f"  Phase → {original_template.get_terminology('phase')}")
    print(f"  Enabler → {original_template.get_terminology('enabler')}")
    print(f"  Choice → {original_template.get_terminology('choice')}")
    
    print("Digital:")
    print(f"  Phase → {digital_template.get_terminology('phase')}")
    print(f"  Enabler → {digital_template.get_terminology('enabler')}")
    print(f"  Choice → {digital_template.get_terminology('choice')}")
    
    # Show theme colors
    print("\n📋 THEME COLORS:")
    print("Original:", original_template.get_theme_colors())
    print("Digital:", digital_template.get_theme_colors())

def create_custom_template():
    """Create a custom template example"""
    print("\n🎨 CREATING CUSTOM TEMPLATE EXAMPLE:")
    
    # Load original template
    template = GameTemplate("game_template.json")
    
    # Customize it
    template.config["game_config"]["company_name"] = "MyAwesomeCorp"
    template.config["game_config"]["game_title"] = "My Custom Game"
    template.config["terminology"]["phase"] = "chapter"
    template.config["terminology"]["enabler"] = "skill"
    template.config["characters"]["protagonist"]["name"] = "Emma"
    template.config["characters"]["experts"]["amira"]["name"] = "Zoe"
    template.config["characters"]["experts"]["james"]["name"] = "Tom"
    template.config["characters"]["experts"]["elena"]["name"] = "Nina"
    
    # Save custom template
    template.save_template("my_custom_template.json")
    
    print("✅ Custom template saved as 'my_custom_template.json'")
    print(f"Company: {template.get_company_name()}")
    print(f"Game Title: {template.get_game_title()}")
    print(f"Phase terminology: {template.get_terminology('phase')}")
    print(f"Characters: {template.get_character_name('amira')}, {template.get_character_name('james')}, {template.get_character_name('elena')}")

if __name__ == "__main__":
    test_template_customization()
    create_custom_template()
    
    print("\n🚀 HOW TO USE:")
    print("1. Edit game_template.json to customize your game")
    print("2. Change company name, character names, terminology")
    print("3. Modify phase titles, choice descriptions, capabilities")
    print("4. Update theme colors and UI text")
    print("5. Use template_engine.py in your code to load the configuration")
    print("6. The game will automatically use your custom settings!")
