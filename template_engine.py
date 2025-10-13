#!/usr/bin/env python3
"""
Template Engine for AI Acceleration Game
Loads configuration from game_template.json and provides template functionality
"""

import json
import os
from typing import Dict, Any, Optional

class GameTemplate:
    """Template engine for customizing the AI Acceleration Game"""
    
    def __init__(self, template_file: str = "game_template.json"):
        """Initialize the template engine with configuration file"""
        self.template_file = template_file
        self.config = self._load_template()
        
    def _load_template(self) -> Dict[str, Any]:
        """Load template configuration from JSON file"""
        try:
            with open(self.template_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"Template file {self.template_file} not found. Using default configuration.")
            return self._get_default_config()
        except json.JSONDecodeError as e:
            print(f"Error parsing template file: {e}. Using default configuration.")
            return self._get_default_config()
    
    def _get_default_config(self) -> Dict[str, Any]:
        """Return default configuration if template file is not available"""
        return {
            "game_config": {
                "company_name": "TechCorp",
                "game_title": "AI Acceleration Game",
                "language": "en"
            },
            "terminology": {
                "phase": "phase",
                "enabler": "enabler",
                "choice": "choice"
            },
            "characters": {
                "protagonist": {"name": "Sophie", "role": "HR Director"},
                "experts": {
                    "amira": {"name": "Amira", "role": "Marketing Expert"},
                    "james": {"name": "James", "role": "IT Expert"},
                    "elena": {"name": "Elena", "role": "Transformation Expert"}
                }
            }
        }
    
    def get_company_name(self) -> str:
        """Get the company name from template"""
        return self.config.get("game_config", {}).get("company_name", "TechCorp")
    
    def get_game_title(self) -> str:
        """Get the game title from template"""
        return self.config.get("game_config", {}).get("game_title", "AI Acceleration Game")
    
    def get_terminology(self, key: str) -> str:
        """Get terminology mapping (e.g., 'phase' -> 'step')"""
        return self.config.get("terminology", {}).get(key, key)
    
    def get_character_name(self, character_id: str) -> str:
        """Get character name by ID"""
        if character_id == "protagonist":
            return self.config.get("characters", {}).get("protagonist", {}).get("name", "Sophie")
        else:
            return self.config.get("characters", {}).get("experts", {}).get(character_id, {}).get("name", character_id.title())
    
    def get_character_role(self, character_id: str) -> str:
        """Get character role by ID"""
        if character_id == "protagonist":
            return self.config.get("characters", {}).get("protagonist", {}).get("role", "HR Director")
        else:
            return self.config.get("characters", {}).get("experts", {}).get(character_id, {}).get("role", "Expert")
    
    def get_phase_title(self, phase_id: str) -> str:
        """Get phase title with terminology mapping"""
        phase_config = self.config.get("phases", {}).get(phase_id, {})
        title = phase_config.get("title", f"{phase_id.title()}")
        
        # Apply terminology mapping
        phase_term = self.get_terminology("phase")
        if "Phase" in title:
            title = title.replace("Phase", phase_term.title())
        elif "phase" in title:
            title = title.replace("phase", phase_term)
            
        return title
    
    def get_choice_title(self, phase_id: str, choice_id: str) -> str:
        """Get choice title from template"""
        phase_config = self.config.get("phases", {}).get(phase_id, {})
        choices = phase_config.get("choices", {})
        return choices.get(choice_id, {}).get("title", choice_id.replace("_", " ").title())
    
    def get_choice_description(self, phase_id: str, choice_id: str) -> str:
        """Get choice description from template"""
        phase_config = self.config.get("phases", {}).get(phase_id, {})
        choices = phase_config.get("choices", {})
        return choices.get(choice_id, {}).get("description", f"Description for {choice_id}")
    
    def get_capability_title(self, capability_id: str) -> str:
        """Get capability title from template"""
        capabilities = self.config.get("capabilities", {})
        return capabilities.get(capability_id, {}).get("title", capability_id.replace("_", " ").title())
    
    def get_capability_description(self, capability_id: str) -> str:
        """Get capability description from template"""
        capabilities = self.config.get("capabilities", {})
        return capabilities.get(capability_id, {}).get("description", f"Capability: {capability_id}")
    
    def get_capability_icon(self, capability_id: str) -> str:
        """Get capability icon from template"""
        capabilities = self.config.get("capabilities", {})
        return capabilities.get(capability_id, {}).get("icon", "fas fa-cog")
    
    def get_capability_category(self, capability_id: str) -> str:
        """Get capability category from template"""
        capabilities = self.config.get("capabilities", {})
        return capabilities.get(capability_id, {}).get("category", "people_processes")
    
    def get_choice_enablers(self, phase_id: str, choice_id: str) -> list:
        """Get enablers for a specific choice from template"""
        phase_config = self.config.get("phases", {}).get(phase_id, {})
        choices = phase_config.get("choices", {})
        return choices.get(choice_id, {}).get("enablers", [])
    
    def get_all_capabilities(self) -> dict:
        """Get all capabilities from template"""
        return self.config.get("capabilities", {})
    
    def get_ui_text(self, section: str, key: str) -> str:
        """Get UI text from template"""
        ui_text = self.config.get("ui_text", {})
        return ui_text.get(section, {}).get(key, f"{section}.{key}")
    
    def format_text(self, text: str, **kwargs) -> str:
        """Format text with template variables"""
        try:
            return text.format(**kwargs)
        except KeyError as e:
            print(f"Missing template variable: {e}")
            return text
    
    def get_teams_meeting_text(self) -> str:
        """Get formatted Teams meeting text"""
        template_text = self.get_ui_text("teams_meeting", "description")
        
        return self.format_text(
            template_text,
            protagonist_name=self.get_character_name("protagonist"),
            christelle_name=self.get_character_name("christelle"),
            christelle_role=self.get_character_role("christelle"),
            alex_name=self.get_character_name("alex"),
            alex_role=self.get_character_role("alex"),
            jack_name=self.get_character_name("jack"),
            jack_role=self.get_character_role("jack")
        )
    
    def get_theme_colors(self) -> Dict[str, str]:
        """Get theme colors from template"""
        theme = self.config.get("game_config", {}).get("theme", {})
        return {
            "primary": theme.get("primary_color", "#1e3a8a"),
            "secondary": theme.get("secondary_color", "#3b82f6"),
            "accent": theme.get("accent_color", "#10b981")
        }
    
    def reload_template(self):
        """Reload template from file"""
        self.config = self._load_template()
    
    def save_template(self, output_file: Optional[str] = None):
        """Save current configuration to file"""
        if output_file is None:
            output_file = self.template_file
            
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(self.config, f, indent=2, ensure_ascii=False)

# Global template instance
template = GameTemplate()

def get_template() -> GameTemplate:
    """Get the global template instance"""
    return template

# Convenience functions for easy access
def get_company_name() -> str:
    return template.get_company_name()

def get_game_title() -> str:
    return template.get_game_title()

def get_phase_title(phase_id: str) -> str:
    return template.get_phase_title(phase_id)

def get_character_name(character_id: str) -> str:
    return template.get_character_name(character_id)

def get_character_role(character_id: str) -> str:
    return template.get_character_role(character_id)

def get_teams_meeting_text() -> str:
    return template.get_teams_meeting_text()

if __name__ == "__main__":
    # Test the template engine
    print("Testing Template Engine:")
    print(f"Company: {get_company_name()}")
    print(f"Game Title: {get_game_title()}")
    print(f"Phase 1 Title: {get_phase_title('phase1')}")
    print(f"Character Names: {get_character_name('christelle')}, {get_character_name('alex')}, {get_character_name('jack')}")
    print(f"Teams Meeting Text: {get_teams_meeting_text()}")
