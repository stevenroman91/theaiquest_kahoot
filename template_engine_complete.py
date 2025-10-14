#!/usr/bin/env python3
"""
Template Engine for AI Acceleration Game
Handles all game content through a centralized template system
"""

import json
import os
from typing import Dict, Any, List, Optional

class GameTemplateEngine:
    def __init__(self, template_file: str = "game_template_complete.json"):
        self.template_file = template_file
        self.config = self._load_template()
    
    def _load_template(self) -> Dict[str, Any]:
        """Load template from JSON file"""
        try:
            with open(self.template_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"Template file {self.template_file} not found. Using default config.")
            return self._get_default_config()
        except json.JSONDecodeError as e:
            print(f"Error parsing template file: {e}. Using default config.")
            return self._get_default_config()
    
    def _get_default_config(self) -> Dict[str, Any]:
        """Fallback default configuration"""
        return {
            "game_info": {
                "company_name": "PlayNext",
                "game_title": "AI Transformation",
                "game_subtitle": "Leader Edition v1.9"
            },
            "terminology": {
                "phase": "Phase",
                "enabler": "Enabler",
                "choice": "Choice"
            },
            "characters": {},
            "phases": {
                "phase1": {
                    "title": "STEP 1: Designing Your AI-Enhanced Business Strategy",
                    "description": "You've heard three different approaches to launch your AI transformation. Which one will you choose?",
                    "choices": {
                        "elena": {
                            "title": "Elena: Map where AI creates the most value and align with company culture",
                            "description": "Transformation without structure leads to chaos. If we deploy AI too fast, we'll create silos, duplicated tools, and confusion. We need to start by mapping where AI adds the most value — identify the high-impact use cases and build around them.",
                            "icon": "fas fa-map",
                            "enablers": ["ai_productivity_opportunities", "ai_landscape_scan"]
                        },
                        "james": {
                            "title": "James: Build strong foundations: secure data, tools, and architecture first",
                            "description": "Without solid data foundations, this won't scale. We'll soon face a surge in talent data and analytics needs. My recommendation: select a robust AI platform now. BusinessAI Pro is the market leader and offers great terms if we sign an exclusive deal. Without this, we risk chaos later.",
                            "icon": "fas fa-handshake",
                            "enablers": ["strategic_tech_alliances", "vendor_value_steering"]
                        },
                        "amira": {
                            "title": "Amira: Act fast - democratize AI, let teams experiment immediately",
                            "description": "From a market standpoint, speed is everything. Players' expectations change weekly — if we hesitate, we lose them. We should empower our teams to experiment with AI tools right now: content generation, campaign optimization, player segmentation. Let them test, iterate, and learn fast.",
                            "icon": "fas fa-lightbulb",
                            "enablers": [],
                            "use_cases": [
                                "automated_banners_generation",
                                "customer_email_classifier", 
                                "virtual_learning_coach_prototype",
                                "supplier_risk_scoring",
                                "simulated_game_design",
                                "predictive_maintenance_sandbox"
                            ]
                        }
                    }
                },
                "phase2": {
                    "title": "STEP 2: Building Your AI Use Case Portfolio",
                    "description": "Among the five AI solutions highlighted on the matrix, which three will you select and implement first?",
                    "choices": {
                        "fraud_integrity_detection": {
                            "title": "Fraud & Integrity Detection",
                            "description": "AI-powered fraud detection system",
                            "icon": "fas fa-shield-alt",
                            "enablers": ["fraud_integrity_detection"]
                        },
                        "ai_storyline_generator": {
                            "title": "AI-Powered Storyline Generator", 
                            "description": "AI-generated game storylines and narratives",
                            "icon": "fas fa-book",
                            "enablers": ["ai_storyline_generator"]
                        },
                        "smart_game_design_assistant": {
                            "title": "Smart Game Design Assistant",
                            "description": "AI assistant for game design decisions", 
                            "icon": "fas fa-lightbulb",
                            "enablers": ["smart_game_design_assistant"]
                        },
                        "player_journey_optimizer": {
                            "title": "Player Journey Optimizer",
                            "description": "AI-optimized player experience paths",
                            "icon": "fas fa-route",
                            "enablers": ["player_journey_optimizer"]
                        },
                        "talent_analytics_dashboard": {
                            "title": "Talent Analytics Dashboard",
                            "description": "AI-powered talent management insights",
                            "icon": "fas fa-chart-bar",
                            "enablers": ["talent_analytics_dashboard"]
                        }
                    }
                },
                "phase3": {
                    "title": "STEP 3: Launching Your Priority AI Pilots", 
                    "description": "You can only activate one enabler per domain to maximize impact and adoption. Which ones will you choose?",
                    "choices": {
                        "ai_data_foundations": {
                            "title": "AI & Data Foundations",
                            "description": "Evolve hybrid data platform (warehouse + lakehouse) to an Agentic Lakehouse platform, model registry and secure model hosting, with governed Data Products exposed through the Data Marketplace.",
                            "icon": "fas fa-database",
                            "enablers": ["ai_data_foundations"]
                        },
                        "model_automation_framework": {
                            "title": "Model Automation Framework",
                            "description": "Implement automated and standardized practices (MLOps & FMOps) to seamlessly deploy, monitor, and maintain AI and foundational models in production, ensuring scalability, reliability, and faster time-to-value.",
                            "icon": "fas fa-cogs",
                            "enablers": ["model_automation_framework"]
                        },
                        "data_readiness_review": {
                            "title": "Data Readiness Review",
                            "description": "Maintain an enterprise view of Data Products (availability, quality, lineage, ownership) to inform AI feasibility and enrichment opportunities.",
                            "icon": "fas fa-search",
                            "enablers": ["data_readiness_review"]
                        },
                        "ai_leadership_program": {
                            "title": "AI leadership program",
                            "description": "Run focused learning for leaders on AI potential, risk, and value realization, anchored in company use cases and leadership toolkits (ethics, governance, talent).",
                            "icon": "fas fa-users",
                            "enablers": ["ai_leadership_program"]
                        },
                        "hands_on_ai_bootcamp": {
                            "title": "Hands-On AI Bootcamp for teams",
                            "description": "A practical upskilling program for delivery teams (designers, analysts, and operators) to master generative and predictive AI tools.",
                            "icon": "fas fa-graduation-cap",
                            "enablers": ["hands_on_ai_bootcamp"]
                        },
                        "ai_co_creation_labs": {
                            "title": "AI Co-Creation Labs",
                            "description": "Bring together representative end-users to collaboratively shape future workflows, prototype AI-enabled processes, and run in-context tests to confirm usability and business fit before scaling.",
                            "icon": "fas fa-flask",
                            "enablers": ["ai_co_creation_labs"]
                        },
                        "responsible_ai_framework": {
                            "title": "Responsible AI Framework",
                            "description": "Integrating responsible AI duties into leadership and expert roles to make ethics part of daily decision-making.",
                            "icon": "fas fa-balance-scale",
                            "enablers": ["responsible_ai_framework"]
                        },
                        "ai_governance_roadmap": {
                            "title": "AI Governance Roadmap",
                            "description": "Define milestones for methods, tooling, controls, and reporting aligned with EU AI Act and internal ethics/security baselines.",
                            "icon": "fas fa-map",
                            "enablers": ["ai_governance_roadmap"]
                        },
                        "ai_governance_board": {
                            "title": "AI Governance board",
                            "description": "Run a first-line review board for AI initiatives, enforce good-practice guides, and schedule periodic audits over lifecycle.",
                            "icon": "fas fa-gavel",
                            "enablers": ["ai_governance_board"]
                        }
                    }
                },
                "phase4": {
                    "title": "STEP 4: Scaling Your Priority AI and GenAI Solutions",
                    "description": "You now have a better idea of what needs to be done to scale AI solutions. It's time to make a decision.\\nSelect the most impactful and timely enablers within your 30-point budget that will allow you to successfully scale your AI solutions to continue accelerating value delivery. Don't forget you need to balance between different categories.",
                    "choices": {
                        "reusable_api_patterns": {
                            "title": "Reusable API Patterns",
                            "description": "Promote API/event standards and design‑authority reviews so data and models flow reliably across internal platforms and trusted third parties.",
                            "icon": "fas fa-code",
                            "enablers": ["reusable_api_patterns"],
                            "cost": 5
                        },
                        "industrial_data_pipelines": {
                            "title": "Industrial Data Pipelines",
                            "description": "Provide a standardized toolbox (ingestion, transformation, orchestration, observability) aligned to our lakehouse and cloud roadmaps for repeatable, auditable pipelines.",
                            "icon": "fas fa-stream",
                            "enablers": ["industrial_data_pipelines"],
                            "cost": 10
                        },
                        "privacy_by_design_data": {
                            "title": "Privacy-by-design data for AI",
                            "description": "Codify data collection, masking, and synthetic‑data practices that respect AI‑regulation expectations (fairness, transparency, privacy) from design to operation.",
                            "icon": "fas fa-lock",
                            "enablers": ["privacy_by_design_data"],
                            "cost": 5
                        },
                        "talent_mobility_program": {
                            "title": "Talent mobility program",
                            "description": "Encourage internal moves and communities of practice for AI/data roles; complement with early‑career rotations to develop multi‑disciplinary skills.",
                            "icon": "fas fa-exchange-alt",
                            "enablers": ["talent_mobility_program"],
                            "cost": 5
                        },
                        "business_ai_champions": {
                            "title": "Business AI Champions",
                            "description": "Assign accountable sponsors in each line of business to steer adoption, ROI, and alignment of AI initiatives to strategic goals.",
                            "icon": "fas fa-trophy",
                            "enablers": ["business_ai_champions"],
                            "cost": 5
                        },
                        "ai_storytelling_communication": {
                            "title": "AI Storytelling & Communication",
                            "description": "Share practical wins and expectations via internal channels (newsletters, townhalls, short videos) to build momentum and clarity.",
                            "icon": "fas fa-comments",
                            "enablers": ["ai_storytelling_communication"],
                            "cost": 5
                        },
                        "adoption_playbook": {
                            "title": "Adoption Playbook",
                            "description": "Apply structured change management (personas, champions, enablement, measurement) from day one of delivery, not after go‑live",
                            "icon": "fas fa-book-open",
                            "enablers": ["adoption_playbook"],
                            "cost": 10
                        },
                        "clear_ownership_accountability": {
                            "title": "Clear Ownership & Accountability",
                            "description": "Clarify roles across data, IT, legal, security, and business risk for policy upkeep, approvals, monitoring, and incident handling.",
                            "icon": "fas fa-user-check",
                            "enablers": ["clear_ownership_accountability"],
                            "cost": 5
                        },
                        "local_ai_risk_management": {
                            "title": "Local AI Risk Management",
                            "description": "Assess regulatory, privacy, and ethical risks for each deployment geography and define clear mitigation, escalation, and compliance protocols before go‑live.",
                            "icon": "fas fa-exclamation-triangle",
                            "enablers": ["local_ai_risk_management"],
                            "cost": 5
                        }
                    }
                },
                "phase5": {
                    "title": "STEP 5: Deploying AI Across the Organization",
                    "description": "It's time to launch and scale more solutions at the enterprise level. Let's decide what actions to take!\\nSelect the option that will maximize your chances of bringing the most new scaled solutions to market. Consider what you need most at this stage of transformation to scale effectively.",
                    "choices": {
                        "ai_for_all": {
                            "title": "AI for all: Turn AI into a company-wide service by communicating ethical standards and sharing tools across teams.",
                            "description": "Turn AI into a company-wide service by communicating ethical standards and sharing tools across teams.",
                            "icon": "fas fa-share-alt",
                            "enablers": ["trusted_partner_ecosystem", "enterprise_ai_service_layer", "ai_collaboration_hub"],
                            "score": 1
                        },
                        "continuous_capability_building": {
                            "title": "Continuous capability building: Define a long-term roadmap for AI governance, develop preferred supplier partnerships, and expand the AI Academy to strengthen internal skills.",
                            "description": "Define a long-term roadmap for AI governance, develop preferred supplier partnerships, and expand the AI Academy to strengthen internal skills.",
                            "icon": "fas fa-graduation-cap",
                            "enablers": ["group_responsible_ai_awareness", "early_career_pipeline_expert_retention"],
                            "score": 2
                        },
                        "full_speed_on_people": {
                            "title": "Full speed on people: Create a dedicated AI Hub, formalize partnerships, invest in recruiting top AI talents, and grow internal expertise through the AI Academy.",
                            "description": "Create a dedicated AI Hub, formalize partnerships, invest in recruiting top AI talents, and grow internal expertise through the AI Academy.",
                            "icon": "fas fa-users",
                            "enablers": ["value_driven_governance", "data_ai_academy"],
                            "score": 3
                        }
                    }
                }
            },
            "enablers": {
                "ai_productivity_opportunities": {
                    "title": "AI Productivity Opportunities",
                    "description": "Quantify where augmentation and automation bring the most impact across teams (engineering, corporate functions, operations), using pilot evidence and value notes.",
                    "icon": "fas fa-chart-line",
                    "category": "transformation_change"
                },
                "ai_landscape_scan": {
                    "title": "AI Landscape Scan",
                    "description": "Systematically benchmark AI/GenAI and data solutions, documenting value, TCO, integration complexity, and fit with our reference architectures.",
                    "icon": "fas fa-search",
                    "category": "technology_partnerships"
                },
                "strategic_tech_alliances": {
                    "title": "Strategic Alliances",
                    "description": "Maintain a small set of core partners (Mistral, Leonardo.ai, Footovision, ...) with clear joint roadmaps, security baselines, and co-innovation tracks.",
                    "icon": "fas fa-handshake",
                    "category": "technology_partnerships"
                },
                "vendor_value_steering": {
                    "title": "Vendor Value Steering",
                    "description": "Govern vendors through portfolio steering and value tracking (business impact, risks, SLAs, contract lifecycle), with a single intake and arbitration path.",
                    "icon": "fas fa-balance-scale",
                    "category": "technology_partnerships"
                },
                "ai_data_foundations": {
                    "title": "AI & Data Foundations",
                    "description": "Build robust data infrastructure for AI",
                    "icon": "fas fa-database",
                    "category": "technology_partnerships"
                },
                "model_automation_framework": {
                    "title": "Model Automation Framework",
                    "description": "Automate ML model deployment and management",
                    "icon": "fas fa-cogs",
                    "category": "technology_partnerships"
                },
                "data_readiness_review": {
                    "title": "Data Readiness Review",
                    "description": "Assess and improve data quality",
                    "icon": "fas fa-search",
                    "category": "technology_partnerships"
                },
                "ai_leadership_program": {
                    "title": "AI Leadership Program",
                    "description": "Develop AI leadership capabilities",
                    "icon": "fas fa-users",
                    "category": "transformation_change"
                },
                "hands_on_ai_bootcamp": {
                    "title": "Hands-on AI Bootcamp",
                    "description": "Practical AI training for teams",
                    "icon": "fas fa-graduation-cap",
                    "category": "transformation_change"
                },
                "ai_co_creation_labs": {
                    "title": "AI Co-Creation Labs",
                    "description": "Collaborative AI development spaces",
                    "icon": "fas fa-flask",
                    "category": "transformation_change"
                },
                "responsible_ai_framework": {
                    "title": "Responsible AI Framework",
                    "description": "Ethical AI governance and practices",
                    "icon": "fas fa-balance-scale",
                    "category": "policies_governance"
                },
                "ai_governance_roadmap": {
                    "title": "AI Governance Roadmap",
                    "description": "Strategic AI governance planning",
                    "icon": "fas fa-map",
                    "category": "policies_governance"
                },
                "ai_governance_board": {
                    "title": "AI Governance Board",
                    "description": "Executive AI oversight committee",
                    "icon": "fas fa-gavel",
                    "category": "policies_governance"
                },
                "reusable_api_patterns": {
                    "title": "Reusable API Patterns",
                    "description": "Standardized API development patterns",
                    "icon": "fas fa-code",
                    "category": "technology_partnerships"
                },
                "industrial_data_pipelines": {
                    "title": "Industrial Data Pipelines",
                    "description": "Enterprise-grade data processing",
                    "icon": "fas fa-stream",
                    "category": "technology_partnerships"
                },
                "privacy_by_design_data": {
                    "title": "Privacy by Design Data",
                    "description": "Privacy-first data architecture",
                    "icon": "fas fa-lock",
                    "category": "technology_partnerships"
                },
                "talent_mobility_program": {
                    "title": "Talent Mobility Program",
                    "description": "Cross-functional AI talent development",
                    "icon": "fas fa-exchange-alt",
                    "category": "transformation_change"
                },
                "business_ai_champions": {
                    "title": "Business AI Champions",
                    "description": "AI advocates across business units",
                    "icon": "fas fa-trophy",
                    "category": "transformation_change"
                },
                "ai_storytelling_communication": {
                    "title": "AI Storytelling & Communication",
                    "description": "Effective AI value communication",
                    "icon": "fas fa-comments",
                    "category": "transformation_change"
                },
                "adoption_playbook": {
                    "title": "Adoption Playbook",
                    "description": "Proven AI adoption strategies",
                    "icon": "fas fa-book-open",
                    "category": "transformation_change"
                },
                "clear_ownership_accountability": {
                    "title": "Clear Ownership & Accountability",
                    "description": "Defined AI roles and responsibilities",
                    "icon": "fas fa-user-check",
                    "category": "policies_governance"
                },
                "local_ai_risk_management": {
                    "title": "Local AI Risk Management",
                    "description": "Decentralized AI risk oversight",
                    "icon": "fas fa-exclamation-triangle",
                    "category": "policies_governance"
                },
                "trusted_partner_ecosystem": {
                    "title": "Trusted Partner Ecosystem",
                    "description": "Keep a curated bench of consulting and technology partners, selected per scope (marketing, platform, governance, change) with measurable outcomes and exit criteria.",
                    "icon": "fas fa-handshake",
                    "category": "technology_partnerships"
                },
                "enterprise_ai_service_layer": {
                    "title": "Enterprise AI service layer",
                    "description": "Offer secure, curated access to approved models and enterprise assistants through a managed service (policies, provisioning, monitoring, billing) integrated with our AI platform.",
                    "icon": "fas fa-layer-group",
                    "category": "technology_partnerships"
                },
                "ai_collaboration_hub": {
                    "title": "AI Collaboration Hub",
                    "description": "Host a light, shared space (physical + virtual) to experiment, document re‑usable patterns, and disseminate standard agents/workflows under governance.",
                    "icon": "fas fa-project-diagram",
                    "category": "transformation_change"
                },
                "group_responsible_ai_awareness": {
                    "title": "Group Responsible AI awareness",
                    "description": "Make \"Responsible Data & AI\" modules mandatory, with simple guidance on dos/don'ts and where to ask for help or report issues.",
                    "icon": "fas fa-shield-alt",
                    "category": "policies_governance"
                },
                "early_career_pipeline_expert_retention": {
                    "title": "Early‑career pipeline & expert retention",
                    "description": "Institutionalize a selective graduate track in data/AI/business and reinforce recognition paths to retain key experts.",
                    "icon": "fas fa-graduation-cap",
                    "category": "transformation_change"
                },
                "value_driven_governance": {
                    "title": "Value-Driven Governance",
                    "description": "Prioritize and fund AI initiatives based on transparent value cases, capacity, and risk, with regular performance reviews and stop/go criteria.",
                    "icon": "fas fa-chart-line",
                    "category": "transformation_change"
                },
                "data_ai_academy": {
                    "title": "Data & AI Academy",
                    "description": "Provide a single entry point to foundational micro‑learning, role paths, and certification support, with belt progression and communities.",
                    "icon": "fas fa-university",
                    "category": "transformation_change"
                }
            },
            "use_cases": {
                "automated_banners_generation": {
                    "title": "Automated Banners Generation",
                    "description": "AI-powered banner creation for marketing campaigns",
                    "icon": "fas fa-image"
                },
                "customer_email_classifier": {
                    "title": "Customer Email Classifier", 
                    "description": "Automated email categorization and routing",
                    "icon": "fas fa-envelope"
                },
                "virtual_learning_coach_prototype": {
                    "title": "Virtual Learning Coach Prototype",
                    "description": "AI-powered personalized learning assistant",
                    "icon": "fas fa-graduation-cap"
                },
                "supplier_risk_scoring": {
                    "title": "Supplier Risk Scoring",
                    "description": "AI-driven supplier risk assessment",
                    "icon": "fas fa-shield-alt"
                },
                "simulated_game_design": {
                    "title": "Simulated Game Design",
                    "description": "AI-assisted game design and prototyping",
                    "icon": "fas fa-gamepad"
                },
                "predictive_maintenance_sandbox": {
                    "title": "Predictive Maintenance Sandbox",
                    "description": "AI-powered equipment maintenance prediction",
                    "icon": "fas fa-tools"
                },
                "fraud_integrity_detection": {
                    "title": "Fraud & Integrity Detection",
                    "description": "AI-powered fraud detection system",
                    "icon": "fas fa-shield-alt"
                },
                "ai_storyline_generator": {
                    "title": "AI-Powered Storyline Generator",
                    "description": "AI-generated game storylines and narratives",
                    "icon": "fas fa-book"
                },
                "smart_game_design_assistant": {
                    "title": "Smart Game Design Assistant",
                    "description": "AI assistant for game design decisions",
                    "icon": "fas fa-lightbulb"
                },
                "player_journey_optimizer": {
                    "title": "Player Journey Optimizer",
                    "description": "AI-optimized player experience paths",
                    "icon": "fas fa-route"
                },
                "talent_analytics_dashboard": {
                    "title": "Talent Analytics Dashboard",
                    "description": "AI-powered talent management insights",
                    "icon": "fas fa-chart-bar"
                }
            },
            "ui_text": {},
            "theme_colors": {
                "primary": "#1e3a8a",
                "secondary": "#7c3aed", 
                "accent": "#059669"
            }
        }
    
    # Game Info Methods
    def get_company_name(self) -> str:
        """Get company name from template"""
        return self.config.get("game_info", {}).get("company_name", "Smart Retail Group")
    
    def get_game_title(self) -> str:
        """Get game title from template"""
        return self.config.get("game_info", {}).get("game_title", "AI Acceleration EXEC")
    
    def get_game_subtitle(self) -> str:
        """Get game subtitle from template"""
        return self.config.get("game_info", {}).get("game_subtitle", "Jeu Sérieux")
    
    # Terminology Methods
    def get_terminology(self, key: str) -> str:
        """Get terminology mapping (e.g., 'phase' -> 'Step')"""
        return self.config.get("terminology", {}).get(key, key.title())
    
    # Character Methods
    def get_character_name(self, character_id: str) -> str:
        """Get character name from template"""
        characters = self.config.get("characters", {})
        return characters.get(character_id, {}).get("name", character_id.title())
    
    def get_character_role(self, character_id: str) -> str:
        """Get character role from template"""
        characters = self.config.get("characters", {})
        return characters.get(character_id, {}).get("role", "Expert")
    
    def get_character_description(self, character_id: str) -> str:
        """Get character description from template"""
        characters = self.config.get("characters", {})
        return characters.get(character_id, {}).get("description", f"Description for {character_id}")
    
    # Phase Methods
    def get_phase_title(self, phase_id: str) -> str:
        """Get phase title with terminology mapping"""
        phases = self.config.get("phases", {})
        phase_config = phases.get(phase_id, {})
        title = phase_config.get("title", f"{phase_id.title()}")
        
        # Apply terminology mapping
        phase_term = self.get_terminology("phase")
        if "Phase" in title:
            title = title.replace("Phase", phase_term)
        elif "phase" in title:
            title = title.replace("phase", phase_term)
        
        # Correction en dur pour contourner le problème de chargement JSON
        if title == "Phase1":
            title = "STEP 1: Designing Your AI-Enhanced Business Strategy"
        elif title == "Phase2":
            title = "STEP 2: Building Your AI Use Case Portfolio"
        elif title == "Phase3":
            title = "STEP 3: Launching Your Priority AI Pilots"
        elif title == "Phase4":
            title = "STEP 4: Scaling Your Priority AI and GenAI Solutions"
        elif title == "Phase5":
            title = "STEP 5: Deploying AI Across the Organization"
            
        return title
    
    def get_phase_description(self, phase_id: str) -> str:
        """Get phase description from template"""
        # Recharger le template pour avoir les dernières modifications
        self.config = self._load_template()
        phases = self.config.get("phases", {})
        phase_config = phases.get(phase_id, {})
        description = phase_config.get("description", f"Description for {phase_id}")
        
        # Correction en dur pour contourner le problème de chargement JSON
        if description == "Description for phase1":
            description = "You've heard three different approaches to launch your AI transformation. Which one will you choose?"
        elif description == "Description for phase2":
            description = "Among the five AI solutions highlighted on the matrix, which three will you select and implement first?"
        elif description == "Description for phase3":
            description = "You can only activate one enabler per domain to maximize impact and adoption. Which ones will you choose?"
        elif description == "Description for phase4":
            description = "You now have a better idea of what needs to be done to scale AI solutions. It's time to make a decision.\nSelect the most impactful and timely enablers within your 30-point budget that will allow you to successfully scale your AI solutions to continue accelerating value delivery. Don't forget you need to balance between different categories."
        elif description == "Description for phase5":
            description = "It's time to launch and scale more solutions at the enterprise level. Let's decide what actions to take!\nSelect the option that will maximize your chances of bringing the most new scaled solutions to market. Consider what you need most at this stage of transformation to scale effectively."
        
        return description
    
    def get_phase_video_file(self, phase_id: str) -> str:
        """Get phase video file from template"""
        phases = self.config.get("phases", {})
        phase_config = phases.get(phase_id, {})
        return phase_config.get("video_file", f"{phase_id}.mp4")
    
    def get_phase_choices(self, phase_id: str) -> Dict[str, Any]:
        """Get all choices for a phase"""
        phases = self.config.get("phases", {})
        phase_config = phases.get(phase_id, {})
        return phase_config.get("choices", {})
    
    # Choice Methods
    def get_choice_title(self, phase_id: str, choice_id: str) -> str:
        """Get choice title from template"""
        choices = self.get_phase_choices(phase_id)
        return choices.get(choice_id, {}).get("title", choice_id.replace("_", " ").title())
    
    def get_choice_description(self, phase_id: str, choice_id: str) -> str:
        """Get choice description from template"""
        choices = self.get_phase_choices(phase_id)
        return choices.get(choice_id, {}).get("description", f"Description for {choice_id}")
    
    def get_choice_enablers(self, phase_id: str, choice_id: str) -> List[str]:
        """Get enablers for a specific choice"""
        choices = self.get_phase_choices(phase_id)
        return choices.get(choice_id, {}).get("enablers", [])
    
    # Enabler Methods
    def get_enabler_title(self, enabler_id: str) -> str:
        """Get enabler title from template"""
        enablers = self.config.get("enablers", {})
        return enablers.get(enabler_id, {}).get("title", enabler_id.replace("_", " ").title())
    
    def get_enabler_description(self, enabler_id: str) -> str:
        """Get enabler description from template"""
        enablers = self.config.get("enablers", {})
        return enablers.get(enabler_id, {}).get("description", f"Description for {enabler_id}")
    
    def get_enabler_icon(self, enabler_id: str) -> str:
        """Get enabler icon from template"""
        enablers = self.config.get("enablers", {})
        
        
        return enablers.get(enabler_id, {}).get("icon", "fas fa-cog")
    
    def get_choice_icon(self, phase_id: str, choice_id: str) -> str:
        """Get choice icon from template"""
        phase_choices = self.get_phase_choices(phase_id)
        
        
        return phase_choices.get(choice_id, {}).get("icon", "fas fa-cog")
    
    def get_enabler_category(self, enabler_id: str) -> str:
        """Get enabler category from template"""
        enablers = self.config.get("enablers", {})
        return enablers.get(enabler_id, {}).get("category", "transformation_change")
    
    def get_all_enablers(self) -> Dict[str, Any]:
        """Get all enablers from template"""
        return self.config.get("enablers", {})
    
    def get_enablers_by_category(self, category: str) -> List[str]:
        """Get all enabler IDs for a specific category"""
        enablers = self.get_all_enablers()
        return [enabler_id for enabler_id, enabler_data in enablers.items() 
                if enabler_data.get("category") == category]
    
    # UI Text Methods
    def get_ui_text(self, section: str, key: str) -> str:
        """Get UI text from template"""
        ui_text = self.config.get("ui_text", {})
        return ui_text.get(section, {}).get(key, f"{section}.{key}")
    
    def get_welcome_message(self) -> str:
        """Get welcome message from template"""
        ui_text = self.config.get("ui_text", {})
        return ui_text.get("welcome_message", "Welcome to AI Acceleration EXEC")
    
    def get_teams_meeting_text(self) -> str:
        """Get Teams meeting text with character substitutions"""
        teams_config = self.config.get("ui_text", {}).get("teams_meeting", {})
        template_text = teams_config.get("description", "Teams meeting description")
        
        # Texte personnalisé en dur pour contourner le problème de chargement JSON
        if template_text == "Teams meeting description":
            template_text = "Sophie is now organizing a strategy workshop with three key stakeholders — the CIO, the Strategy & Change Director, and the Marketing & Player Experience Director — to define how AI should be integrated into the company's innovation and production model."
        
        return self.format_text(
            template_text,
            protagonist_name=self.get_character_name("protagonist"),
            elena_name=self.get_character_name("elena"),
            elena_role=self.get_character_role("elena"),
            james_name=self.get_character_name("james"),
            james_role=self.get_character_role("james"),
            amira_name=self.get_character_name("amira"),
            amira_role=self.get_character_role("amira")
        )
    
    def get_teams_meeting_button_text(self) -> str:
        """Get Teams meeting button text"""
        teams_config = self.config.get("ui_text", {}).get("teams_meeting", {})
        return teams_config.get("button_text", "Join the Teams meeting")
    
    def get_dashboard_title(self) -> str:
        """Get dashboard title"""
        dashboard_config = self.config.get("ui_text", {}).get("dashboard", {})
        return dashboard_config.get("title", "Executive Dashboard")
    
    def get_dashboard_subtitle(self) -> str:
        """Get dashboard subtitle"""
        dashboard_config = self.config.get("ui_text", {}).get("dashboard", {})
        return dashboard_config.get("subtitle", "Track your AI transformation progress")
    
    def get_impact_message(self, score: int, max_score: int, enabler_count: int) -> str:
        """Get impact message with score substitutions"""
        template_text = self.config.get("ui_text", {}).get("dashboard", {}).get("impact_message", 
            "Avec un score de {score}/{max_score}, vous avez {enabler_count} capacités disponibles.")
        
        return self.format_text(template_text, score=score, max_score=max_score, enabler_count=enabler_count)
    
    # Theme Methods
    def get_theme_colors(self) -> Dict[str, str]:
        """Get theme colors from template"""
        return self.config.get("theme_colors", {
            "primary": "#1e3a8a",
            "secondary": "#7c3aed",
            "accent": "#059669"
        })
    
    # Utility Methods
    def format_text(self, text: str, **kwargs) -> str:
        """Format text with variable substitutions"""
        try:
            return text.format(**kwargs)
        except KeyError as e:
            print(f"Missing variable {e} in text formatting")
            return text
    
    def reload_template(self):
        """Reload template from file"""
        self.config = self._load_template()
    
    def get_all_phases(self) -> List[str]:
        """Get list of all phase IDs"""
        return list(self.config.get("phases", {}).keys())
    
    def get_phase_choice_ids(self, phase_id: str) -> List[str]:
        """Get list of choice IDs for a phase"""
        choices = self.get_phase_choices(phase_id)
        return list(choices.keys())
    
    # Use Cases Methods
    def get_all_use_cases(self) -> Dict[str, Dict[str, Any]]:
        """Get all use cases from template"""
        return self.config.get("use_cases", {})
    
    def get_use_case_title(self, use_case_id: str) -> str:
        """Get use case title"""
        use_case = self.config.get("use_cases", {}).get(use_case_id, {})
        return use_case.get("title", use_case_id)
    
    def get_use_case_description(self, use_case_id: str) -> str:
        """Get use case description"""
        use_case = self.config.get("use_cases", {}).get(use_case_id, {})
        return use_case.get("description", "")
    
    def get_use_case_icon(self, use_case_id: str) -> str:
        """Get use case icon"""
        use_case = self.config.get("use_cases", {}).get(use_case_id, {})
        return use_case.get("icon", "fas fa-cog")
    
    def get_use_case_category(self, use_case_id: str) -> str:
        """Get use case category"""
        use_case = self.config.get("use_cases", {}).get(use_case_id, {})
        return use_case.get("category", "general")
    
    def get_choice_use_cases(self, phase_id: str, choice_id: str) -> List[str]:
        """Get use cases for a specific choice"""
        phase_choices = self.get_phase_choices(phase_id)
        choice = phase_choices.get(choice_id, {})
        return choice.get("use_cases", [])

# Global instance
_template_engine = None

def get_template() -> GameTemplateEngine:
    """Get global template engine instance"""
    global _template_engine
    if _template_engine is None:
        _template_engine = GameTemplateEngine()
    return _template_engine

def reload_template():
    """Reload global template engine"""
    global _template_engine
    if _template_engine is not None:
        _template_engine.reload_template()

# Test function
if __name__ == "__main__":
    template = get_template()
    
    print("=== Template Engine Test ===")
    print(f"Company Name: {template.get_company_name()}")
    print(f"Game Title: {template.get_game_title()}")
    print(f"Phase 1 Title: {template.get_phase_title('phase1')}")
    print(f"Character Names: {template.get_character_name('elena')}, {template.get_character_name('james')}, {template.get_character_name('amira')}")
    print(f"Teams Meeting Text: {template.get_teams_meeting_text()}")
    print(f"Elena Choice Title: {template.get_choice_title('phase1', 'elena')}")
    print(f"Elena Enablers: {template.get_choice_enablers('phase1', 'elena')}")
    print(f"Enabler Title: {template.get_enabler_title('strategic_vision_mapping')}")
    print(f"Enabler Icon: {template.get_enabler_icon('strategic_vision_mapping')}")
    print(f"Enabler Category: {template.get_enabler_category('strategic_vision_mapping')}")
    print(f"Theme Colors: {template.get_theme_colors()}")
