#!/usr/bin/env python3
"""
Example of integrating template system into the existing game
This shows how to modify web_interface.py to use template values
"""

from template_engine import get_template

def demonstrate_integration():
    """Show how to integrate template system into existing game"""
    
    print("🔧 INTEGRATION EXAMPLE")
    print("=" * 40)
    
    # Load template
    template = get_template()
    
    print("📋 Current Configuration:")
    print(f"Company: {template.get_company_name()}")
    print(f"Game Title: {template.get_game_title()}")
    print(f"Phase 1 Title: {template.get_phase_title('phase1')}")
    print(f"Characters: {template.get_character_name('amira')}, {template.get_character_name('james')}, {template.get_character_name('elena')}")
    
    print("\n🎨 Teams Meeting Text:")
    print(template.get_teams_meeting_text())
    
    print("\n📊 Theme Colors:")
    colors = template.get_theme_colors()
    for color_name, color_value in colors.items():
        print(f"  {color_name}: {color_value}")
    
    print("\n🔧 Example API Response:")
    api_response = {
        "game_config": {
            "company_name": template.get_company_name(),
            "game_title": template.get_game_title(),
            "theme_colors": template.get_theme_colors()
        },
        "characters": {
            "protagonist": {
                "name": template.get_character_name("protagonist"),
                "role": template.get_character_role("protagonist")
            },
            "experts": {
                "amira": {
                    "name": template.get_character_name("amira"),
                    "role": template.get_character_role("amira")
                },
                "james": {
                    "name": template.get_character_name("james"),
                    "role": template.get_character_role("james")
                },
                "elena": {
                    "name": template.get_character_name("elena"),
                    "role": template.get_character_role("elena")
                }
            }
        },
        "phases": {
            "phase1": {
                "title": template.get_phase_title("phase1"),
                "terminology": template.get_terminology("phase")
            }
        },
        "ui_text": {
            "teams_meeting": template.get_teams_meeting_text()
        }
    }
    
    import json
    print(json.dumps(api_response, indent=2, ensure_ascii=False))

def show_code_examples():
    """Show code examples for integration"""
    
    print("\n💻 CODE INTEGRATION EXAMPLES")
    print("=" * 40)
    
    print("""
# 1. In web_interface.py - Add new API endpoint:

@app.route('/api/game_config')
def game_config():
    template = get_template()
    return jsonify({
        'company_name': template.get_company_name(),
        'game_title': template.get_game_title(),
        'theme_colors': template.get_theme_colors(),
        'characters': {
            'protagonist': {
                'name': template.get_character_name('protagonist'),
                'role': template.get_character_role('protagonist')
            },
            'experts': {
                'amira': {
                    'name': template.get_character_name('amira'),
                    'role': template.get_character_role('amira')
                },
                'james': {
                    'name': template.get_character_name('james'),
                    'role': template.get_character_role('james')
                },
                'elena': {
                    'name': template.get_character_name('elena'),
                    'role': template.get_character_role('elena')
                }
            }
        },
        'terminology': {
            'phase': template.get_terminology('phase'),
            'enabler': template.get_terminology('enabler'),
            'choice': template.get_terminology('choice')
        },
        'ui_text': {
            'teams_meeting': template.get_teams_meeting_text()
        }
    })

# 2. In game.js - Load configuration:

async function loadGameConfig() {
    try {
        const response = await fetch('/api/game_config');
        const config = await response.json();
        
        // Update page title
        document.title = config.game_title;
        
        // Update company name
        const companyElement = document.getElementById('company-name');
        if (companyElement) {
            companyElement.textContent = config.company_name;
        }
        
        // Update Teams meeting text
        const teamsTextElement = document.getElementById('teams-meeting-text');
        if (teamsTextElement) {
            teamsTextElement.textContent = config.ui_text.teams_meeting;
        }
        
        // Apply theme colors
        const root = document.documentElement;
        root.style.setProperty('--primary-color', config.theme_colors.primary);
        root.style.setProperty('--secondary-color', config.theme_colors.secondary);
        root.style.setProperty('--accent-color', config.theme_colors.accent);
        
        // Update terminology
        window.gameTerminology = config.terminology;
        
    } catch (error) {
        console.error('Error loading game config:', error);
    }
}

// Call on page load
document.addEventListener('DOMContentLoaded', loadGameConfig);

# 3. In templates/index.html - Use template variables:

<!DOCTYPE html>
<html>
<head>
    <title>{{ game_title }}</title>
</head>
<body>
    <div id="company-name">{{ company_name }}</div>
    <div id="teams-meeting-text">{{ teams_meeting_text }}</div>
</body>
</html>
""")

if __name__ == "__main__":
    demonstrate_integration()
    show_code_examples()
    
    print("\n🚀 NEXT STEPS:")
    print("1. Add the new API endpoint to web_interface.py")
    print("2. Modify game.js to load and use the configuration")
    print("3. Update HTML templates to use template variables")
    print("4. Test with different template files")
    print("5. Create a web interface for editing templates")
