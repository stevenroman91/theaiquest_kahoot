#!/usr/bin/env python3
"""
Game Content Manager - Simple and Clear Template System
This file manages ALL visible text and content in the game.
"""

import json
import os
from typing import Dict, Any, Optional

class GameContentManager:
    def __init__(self, content_file: str = "game_content.json"):
        self.content_file = content_file
        self.content = self._load_content()
    
    def _load_content(self) -> Dict[str, Any]:
        """Load content from JSON file"""
        try:
            with open(self.content_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"Content file {self.content_file} not found. Using default content.")
            return self._get_default_content()
        except json.JSONDecodeError as e:
            print(f"Error parsing content file: {e}. Using default content.")
            return self._get_default_content()
    
    def _get_default_content(self) -> Dict[str, Any]:
        """Fallback default content"""
        return {
            "game_branding": {
                "company_name": "PlayNext",
                "game_title": "AI Transformation",
                "game_subtitle": "Leader Edition v1.9"
            }
        }
    
    # ========================================
    # BRANDING METHODS
    # ========================================
    
    def get_company_name(self) -> str:
        """Get company name"""
        return self.content.get("game_branding", {}).get("company_name", "PlayNext")
    
    def get_game_title(self) -> str:
        """Get game title"""
        return self.content.get("game_branding", {}).get("game_title", "AI Transformation")
    
    def get_game_subtitle(self) -> str:
        """Get game subtitle"""
        return self.content.get("game_branding", {}).get("game_subtitle", "Leader Edition v1.9")
    
    def get_logo_icon(self) -> str:
        """Get logo icon class"""
        return self.content.get("game_branding", {}).get("logo_icon", "fas fa-space-shuttle")
    
    def get_logo_color(self) -> str:
        """Get logo color"""
        return self.content.get("game_branding", {}).get("logo_color", "#1e40af")
    
    def get_game_version(self) -> str:
        """Get game version"""
        return self.content.get("game_branding", {}).get("version", "1.9")
    
    def get_terminology(self, key: str) -> str:
        """Get terminology for specific keys"""
        terminology = self.content.get("terminology", {})
        return terminology.get(key, key)
    
    def get_welcome_message(self) -> str:
        """Get welcome message"""
        return self.content.get("ui_text", {}).get("welcome_message", "Welcome to AI Transformation!")
    
    def get_phase_title(self, phase_key: str) -> str:
        """Get phase title by phase key (e.g., 'phase1', 'phase2')"""
        phase_number = phase_key.replace('phase', '')
        try:
            step_number = int(phase_number)
            return self.get_step_title(step_number)
        except ValueError:
            return f"Step {phase_number}"
    
    def get_phase_description(self, phase_key: str) -> str:
        """Get phase description by phase key"""
        phase_number = phase_key.replace('phase', '')
        try:
            step_number = int(phase_number)
            return self.get_step_description(step_number)
        except ValueError:
            return ""
    
    def get_character_name(self, character_key: str) -> str:
        """Get character name"""
        return self.content.get("characters", {}).get(character_key, {}).get("name", character_key.title())
    
    def get_character_role(self, character_key: str) -> str:
        """Get character role"""
        return self.content.get("characters", {}).get(character_key, {}).get("role", "")
    
    def get_teams_meeting_text(self) -> str:
        """Get teams meeting text"""
        return self.get_page_content("teams_meeting_page").get("description", "Join the Teams meeting")
    
    def get_teams_meeting_button_text(self) -> str:
        """Get teams meeting button text"""
        return self.get_page_content("teams_meeting_page").get("button_text", "Join Teams meeting")
    
    def get_theme_colors(self) -> dict:
        """Get theme colors"""
        return self.content.get("theme_colors", {
            "primary": "#1e40af",
            "secondary": "#3b82f6",
            "success": "#10b981",
            "warning": "#f59e0b",
            "danger": "#ef4444"
        })
    
    def get_all_enablers(self) -> list:
        """Get all enablers"""
        enablers = []
        for enabler_id, enabler_data in self.content.get("enablers", {}).items():
            enablers.append({
                "id": enabler_id,
                "title": enabler_data.get("title", ""),
                "description": enabler_data.get("description", ""),
                "category": enabler_data.get("category", ""),
                "icon": enabler_data.get("icon", "fas fa-cog")
            })
        return enablers
    
    def get_choice_icon(self, phase_id: str, choice_id: str) -> str:
        """Get choice icon"""
        choices = self.get_phase_choices(phase_id)
        return choices.get(choice_id, {}).get("icon", "fas fa-cog")
    
    def get_choice_title(self, phase_id: str, choice_id: str) -> str:
        """Get title for a specific choice"""
        choices = self.get_phase_choices(phase_id)
        return choices.get(choice_id, {}).get("title", choice_id.replace("_", " ").title())
    
    def get_choice_description(self, phase_id: str, choice_id: str) -> str:
        """Get description for a specific choice"""
        choices = self.get_phase_choices(phase_id)
        return choices.get(choice_id, {}).get("description", f"Description for {choice_id}")
    
    def get_choice_enablers(self, phase_id: str, choice_id: str) -> list:
        """Get enablers for a specific choice"""
        choices = self.get_phase_choices(phase_id)
        choice_data = choices.get(choice_id, {})
        
        # Nouveau format avec enablers par score
        if "enablers_1_star" in choice_data:
            return choice_data.get("enablers_1_star", [])
        
        # Ancien format avec enablers simples
        return choice_data.get("enablers", [])
    
    def get_choice_use_cases(self, phase_id: str, choice_id: str) -> list:
        """Get use cases for a specific choice"""
        choices = self.get_phase_choices(phase_id)
        return choices.get(choice_id, {}).get("use_cases", [])
    
    def get_phase_choices(self, phase_id: str) -> Dict[str, Any]:
        """Get choices for a specific phase"""
        phases = self.content.get("phases", {})
        return phases.get(phase_id, {}).get("choices", {})
    
    def get_step_choices(self, step_number: int) -> list:
        """Get choices for a specific step"""
        step_key = f"step{step_number}"
        choices = []
        step_data = self.content.get("game_steps", {}).get(step_key, {})
        
        for choice_id, choice_data in step_data.get("choices", {}).items():
            choices.append({
                "id": choice_id,
                "title": choice_data.get("title", ""),
                "description": choice_data.get("description", ""),
                "icon": choice_data.get("icon", "fas fa-cog"),
                "cost": choice_data.get("cost", 0)
            })
        return choices
    
    def get_choice_use_cases(self, phase_id: str, choice_id: str) -> list:
        """Get use cases for a specific choice"""
        choices = self.get_phase_choices(phase_id)
        return choices.get(choice_id, {}).get("use_cases", [])
    
    def get_use_case_title(self, use_case_id: str) -> str:
        """Get use case title"""
        return self.content.get("use_cases", {}).get(use_case_id, {}).get("title", "")
    
    def get_use_case_description(self, use_case_id: str) -> str:
        """Get use case description"""
        return self.content.get("use_cases", {}).get(use_case_id, {}).get("description", "")
    
    def get_use_case_icon(self, use_case_id: str) -> str:
        """Get use case icon"""
        return self.content.get("use_cases", {}).get(use_case_id, {}).get("icon", "fas fa-cog")
    
    # ========================================
    # PAGE TEMPLATE METHODS
    # ========================================
    
    def get_page_content(self, page_name: str) -> Dict[str, str]:
        """Get content for a specific page"""
        pages = self.content.get("page_templates", {})
        return pages.get(page_name, {})
    
    def get_welcome_content(self) -> Dict[str, str]:
        """Get welcome page content"""
        return self.get_page_content("welcome_page")
    
    def get_introduction_content(self) -> Dict[str, str]:
        """Get introduction page content"""
        return self.get_page_content("introduction_page")
    
    def get_teams_meeting_content(self) -> Dict[str, str]:
        """Get teams meeting page content"""
        return self.get_page_content("teams_meeting_page")
    
    def get_step1_followup_content(self) -> Dict[str, str]:
        """Get step 1 follow-up page content"""
        return self.get_page_content("step1_followup_page")
    
    def get_pilot_step_content(self) -> Dict[str, str]:
        """Get pilot step page content"""
        return self.get_page_content("pilot_step_page")
    
    def get_enterprise_scaling_content(self) -> Dict[str, str]:
        """Get enterprise scaling page content"""
        return self.get_page_content("enterprise_scaling_page")
    
    # ========================================
    # GAME STEPS METHODS
    # ========================================
    
    def get_step_title(self, step_number: int) -> str:
        """Get title for a specific step"""
        steps = self.content.get("game_steps", {})
        step_key = f"step{step_number}"
        return steps.get(step_key, {}).get("title", f"Step {step_number}")
    
    def get_step_description(self, step_number: int) -> str:
        """Get description for a specific step"""
        steps = self.content.get("game_steps", {})
        step_key = f"step{step_number}"
        return steps.get(step_key, {}).get("description", "")
    
    def get_step_video(self, step_number: int) -> str:
        """Get video file for a specific step"""
        steps = self.content.get("game_steps", {})
        step_key = f"step{step_number}"
        return steps.get(step_key, {}).get("video", "")
    
    # ========================================
    # CHARACTER METHODS
    # ========================================
    
    def get_character_info(self, character_id: str) -> Dict[str, str]:
        """Get character information"""
        characters = self.content.get("characters", {})
        return characters.get(character_id, {})
    
    def get_character_name(self, character_id: str) -> str:
        """Get character name"""
        char_info = self.get_character_info(character_id)
        return char_info.get("name", character_id.title())
    
    def get_character_role(self, character_id: str) -> str:
        """Get character role"""
        char_info = self.get_character_info(character_id)
        return char_info.get("role", "")
    
    # ========================================
    # UI TEXT METHODS
    # ========================================
    
    def get_button_text(self, button_type: str) -> str:
        """Get button text"""
        buttons = self.content.get("ui_text", {}).get("buttons", {})
        return buttons.get(button_type, button_type.title())
    
    def get_navigation_text(self, nav_type: str) -> str:
        """Get navigation text"""
        navigation = self.content.get("ui_text", {}).get("navigation", {})
        return navigation.get(nav_type, nav_type.title())
    
    def get_message_text(self, message_type: str) -> str:
        """Get message text"""
        messages = self.content.get("ui_text", {}).get("messages", {})
        return messages.get(message_type, message_type.title())
    
    # ========================================
    # VIDEO METHODS
    # ========================================
    
    def get_video_file(self, video_type: str) -> str:
        """Get video file name"""
        videos = self.content.get("videos", {})
        return videos.get(video_type, "")
    
    # ========================================
    # PHASES AND CHOICES METHODS
    # ========================================
    
    
    def get_phase_choice(self, phase_number: int, choice_id: str) -> Dict[str, Any]:
        """Get specific choice from a phase"""
        choices = self.get_phase_choices(phase_number)
        return choices.get(choice_id, {})
    
    def get_phase_budget(self, phase_number: int) -> int:
        """Get budget for a phase (if applicable)"""
        phases = self.content.get("phases", {})
        phase_key = f"phase{phase_number}"
        return phases.get(phase_key, {}).get("budget", 0)
    
    # ========================================
    # ENABLERS METHODS
    # ========================================
    
    def get_enabler_info(self, enabler_id: str) -> Dict[str, str]:
        """Get enabler information"""
        enablers = self.content.get("enablers", {})
        return enablers.get(enabler_id, {})
    
    def get_enabler_title(self, enabler_id: str) -> str:
        """Get enabler title"""
        enabler_info = self.get_enabler_info(enabler_id)
        return enabler_info.get("title", enabler_id.replace("_", " ").title())
    
    def get_enabler_description(self, enabler_id: str) -> str:
        """Get enabler description"""
        enabler_info = self.get_enabler_info(enabler_id)
        return enabler_info.get("description", "")
    
    def get_enabler_category(self, enabler_id: str) -> str:
        """Get enabler category"""
        enabler_info = self.get_enabler_info(enabler_id)
        return enabler_info.get("category", "other")
    
    def get_enablers_by_category(self, category: str) -> Dict[str, Dict[str, str]]:
        """Get all enablers in a specific category"""
        enablers = self.content.get("enablers", {})
        return {eid: einfo for eid, einfo in enablers.items() 
                if einfo.get("category") == category}
    
    # ========================================
    # DASHBOARD METHODS
    # ========================================
    
    def get_dashboard_info(self) -> Dict[str, Any]:
        """Get dashboard information"""
        return self.content.get("dashboard", {})
    
    def get_dashboard_title(self) -> str:
        """Get dashboard title"""
        dashboard = self.get_dashboard_info()
        return dashboard.get("title", "Executive Dashboard")
    
    def get_dashboard_subtitle(self) -> str:
        """Get dashboard subtitle"""
        dashboard = self.get_dashboard_info()
        return dashboard.get("subtitle", "Track your AI transformation progress")
    
    def get_dashboard_categories(self) -> Dict[str, Dict[str, str]]:
        """Get dashboard categories"""
        dashboard = self.get_dashboard_info()
        return dashboard.get("categories", {})
    
    # ========================================
    # SCORE MESSAGES METHODS
    # ========================================
    
    def get_score_message(self, phase_number: int, choice_id: str, score: int) -> str:
        """Get personalized score message"""
        score_messages = self.content.get("score_messages", {})
        phase_key = f"phase{phase_number}"
        
        if phase_key in score_messages and choice_id in score_messages[phase_key]:
            choice_messages = score_messages[phase_key][choice_id]
            return choice_messages.get(str(score), f"You earned {score} stars out of three.")
        
        return f"You earned {score} stars out of three."
    
    # ========================================
    # UTILITY METHODS
    # ========================================
    
    def update_content(self, section: str, key: str, value: str) -> bool:
        """Update a specific content value"""
        try:
            if section not in self.content:
                self.content[section] = {}
            self.content[section][key] = value
            self._save_content()
            return True
        except Exception as e:
            print(f"Error updating content: {e}")
            return False
    
    def _save_content(self) -> None:
        """Save content to file"""
        try:
            with open(self.content_file, 'w', encoding='utf-8') as f:
                json.dump(self.content, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"Error saving content: {e}")
    
    # Enabler methods - read from game_content.json
    def get_all_enablers(self) -> Dict[str, Dict[str, Any]]:
        """Get all enablers from game_content.json"""
        return self.content.get("enablers", {})
    
    def get_enabler_title(self, enabler_id: str) -> str:
        """Get enabler title from game_content.json"""
        enablers = self.get_all_enablers()
        return enablers.get(enabler_id, {}).get("title", enabler_id.replace("_", " ").title())
    
    def get_enabler_description(self, enabler_id: str) -> str:
        """Get enabler description from game_content.json"""
        enablers = self.get_all_enablers()
        return enablers.get(enabler_id, {}).get("description", f"Capability: {enabler_id}")
    
    def get_enabler_icon(self, enabler_id: str) -> str:
        """Get enabler icon from game_content.json"""
        enablers = self.get_all_enablers()
        return enablers.get(enabler_id, {}).get("icon", "fas fa-cog")
    
    def get_enabler_category(self, enabler_id: str) -> str:
        """Get enabler category from game_content.json"""
        enablers = self.get_all_enablers()
        return enablers.get(enabler_id, {}).get("category", "technology_partnerships")
    
    def reload_content(self) -> None:
        """Reload content from file"""
        self.content = self._load_content()

# Global instance
content_manager = GameContentManager()
