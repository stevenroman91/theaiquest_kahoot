# 🎮 Template System for AI Acceleration Game

## 📋 Overview

Le système de template vous permet de personnaliser facilement tous les éléments du jeu sans modifier le code source. Vous pouvez changer :

- **Noms des personnages** (Sophie → Emma, Amira → Sarah, etc.)
- **Terminologie** (Phase → Step, Enabler → Capability, etc.)
- **Titre du jeu** et nom de l'entreprise
- **Couleurs du thème**
- **Textes des phases, choix et capacités**
- **Tout le contenu textuel**

## 🚀 Quick Start

### 1. Personnalisation Rapide

Éditez le fichier `game_template.json` :

```json
{
  "game_config": {
    "company_name": "VotreEntreprise",
    "game_title": "Votre Jeu Personnalisé"
  },
  "terminology": {
    "phase": "étape",
    "enabler": "capacité",
    "choice": "décision"
  },
  "characters": {
    "protagonist": {
      "name": "Marie",
      "role": "Directrice RH"
    },
    "experts": {
      "amira": {
        "name": "Claire",
        "role": "Experte Marketing"
      }
    }
  }
}
```

### 2. Utilisation dans le Code

```python
from template_engine import get_template

# Récupérer les valeurs personnalisées
company_name = get_template().get_company_name()
phase_title = get_template().get_phase_title('phase1')
character_name = get_template().get_character_name('amira')
```

## 📁 Structure du Template

### Configuration Principale (`game_config`)

```json
{
  "game_config": {
    "company_name": "TechCorp",           // Nom de l'entreprise
    "game_title": "AI Acceleration Game", // Titre du jeu
    "language": "en",                     // Langue (en/fr)
    "theme": {                            // Couleurs du thème
      "primary_color": "#1e3a8a",
      "secondary_color": "#3b82f6", 
      "accent_color": "#10b981"
    }
  }
}
```

### Terminologie (`terminology`)

```json
{
  "terminology": {
    "phase": "step",        // Phase → Step
    "enabler": "capability", // Enabler → Capability
    "choice": "decision",    // Choice → Decision
    "score": "points",      // Score → Points
    "dashboard": "overview" // Dashboard → Overview
  }
}
```

### Personnages (`characters`)

```json
{
  "characters": {
    "protagonist": {
      "name": "Sophie",
      "role": "HR Director",
      "description": "Sophie is leading the AI transformation"
    },
    "experts": {
      "amira": {
        "name": "Amira",
        "role": "Marketing Expert",
        "description": "Amira brings marketing expertise"
      },
      "james": {
        "name": "James",
        "role": "IT Expert", 
        "description": "James provides technical guidance"
      },
      "elena": {
        "name": "Elena",
        "role": "Transformation Expert",
        "description": "Elena specializes in change management"
      }
    }
  }
}
```

### Phases (`phases`)

```json
{
  "phases": {
    "phase1": {
      "title": "Step 1 - Embedding GenAI in your AI transformation program",
      "description": "Define the strategic foundation for AI transformation",
      "choices": {
        "amira": {
          "title": "Marketing-Driven Approach",
          "description": "Focus on marketing and customer-facing AI applications"
        }
      }
    }
  }
}
```

### Capacités (`capabilities`)

```json
{
  "capabilities": {
    "strategic_vision_mapping": {
      "title": "Strategic Vision Mapping",
      "description": "Map AI strategy to business objectives",
      "icon": "fas fa-brain",
      "category": "policies_practices"
    }
  }
}
```

### Textes UI (`ui_text`)

```json
{
  "ui_text": {
    "teams_meeting": {
      "title": "Teams Meeting",
      "description": "{protagonist_name} is organising a Teams meeting...",
      "button_text": "Join the Teams meeting"
    },
    "dashboard": {
      "title": "Executive Overview",
      "subtitle": "Track your AI transformation progress"
    }
  }
}
```

## 🎨 Exemples de Personnalisation

### Exemple 1: Transformation Digitale

```json
{
  "game_config": {
    "company_name": "InnovateCorp",
    "game_title": "Digital Transformation Journey"
  },
  "terminology": {
    "phase": "step",
    "enabler": "capability"
  },
  "characters": {
    "protagonist": {
      "name": "Alex",
      "role": "Digital Transformation Lead"
    },
    "experts": {
      "amira": {
        "name": "Sarah",
        "role": "Customer Experience Expert"
      }
    }
  }
}
```

### Exemple 2: Jeu en Français

```json
{
  "game_config": {
    "company_name": "MonEntreprise",
    "game_title": "Jeu d'Accélération IA",
    "language": "fr"
  },
  "terminology": {
    "phase": "étape",
    "enabler": "capacité",
    "choice": "décision"
  },
  "characters": {
    "protagonist": {
      "name": "Marie",
      "role": "Directrice RH"
    }
  }
}
```

### Exemple 3: Thème Personnalisé

```json
{
  "game_config": {
    "theme": {
      "primary_color": "#7c3aed",    // Violet
      "secondary_color": "#a855f7",  // Violet clair
      "accent_color": "#f59e0b"      // Orange
    }
  }
}
```

## 🔧 API du Template Engine

### Méthodes Principales

```python
from template_engine import GameTemplate

template = GameTemplate("mon_template.json")

# Configuration générale
template.get_company_name()
template.get_game_title()
template.get_theme_colors()

# Terminologie
template.get_terminology("phase")  # Retourne "step" ou "phase"

# Personnages
template.get_character_name("amira")
template.get_character_role("amira")

# Phases
template.get_phase_title("phase1")

# Choix
template.get_choice_title("phase1", "amira")

# Capacités
template.get_capability_title("strategic_vision_mapping")
template.get_capability_description("strategic_vision_mapping")
template.get_capability_icon("strategic_vision_mapping")

# Textes UI
template.get_ui_text("teams_meeting", "description")
template.get_teams_meeting_text()  # Texte formaté automatiquement

# Formatage de texte
template.format_text("Hello {name}", name="World")
```

### Fonctions de Convenance

```python
from template_engine import (
    get_company_name,
    get_game_title,
    get_phase_title,
    get_character_name,
    get_teams_meeting_text
)

# Utilisation directe
company = get_company_name()
title = get_phase_title("phase1")
```

## 📝 Variables de Template

Dans les textes, vous pouvez utiliser des variables :

```json
{
  "ui_text": {
    "teams_meeting": {
      "description": "{protagonist_name} is organising a Teams meeting with {amira_name} ({amira_role}), {james_name} ({james_role}) and {elena_name} ({elena_role})"
    }
  }
}
```

Variables disponibles :
- `{protagonist_name}` - Nom du protagoniste
- `{amira_name}`, `{james_name}`, `{elena_name}` - Noms des experts
- `{amira_role}`, `{james_role}`, `{elena_role}` - Rôles des experts

## 🎯 Intégration dans le Jeu

### 1. Modifier web_interface.py

```python
from template_engine import get_template

@app.route('/api/executive_dashboard')
def executive_dashboard():
    template = get_template()
    
    # Utiliser les valeurs du template
    company_name = template.get_company_name()
    phase_title = template.get_phase_title("phase1")
    
    return jsonify({
        "company_name": company_name,
        "phase_title": phase_title
    })
```

### 2. Modifier game.js

```javascript
// Charger la configuration depuis l'API
fetch('/api/game_config')
    .then(response => response.json())
    .then(config => {
        // Utiliser les valeurs personnalisées
        document.title = config.game_title;
        document.getElementById('company-name').textContent = config.company_name;
    });
```

### 3. Modifier les Templates HTML

```html
<!-- Utiliser les variables du template -->
<h1>{{ game_title }}</h1>
<p>{{ company_name }} - {{ phase_title }}</p>
```

## 🚀 Workflow de Personnalisation

### 1. Créer un Nouveau Template

```bash
# Copier le template de base
cp game_template.json mon_template.json

# Éditer le template
nano mon_template.json
```

### 2. Tester le Template

```bash
# Tester avec le script de démonstration
python3 test_template.py

# Ou tester directement
python3 template_engine.py
```

### 3. Intégrer dans le Jeu

```python
# Dans votre code Python
from template_engine import GameTemplate

# Charger votre template personnalisé
template = GameTemplate("mon_template.json")

# Utiliser les valeurs
print(f"Company: {template.get_company_name()}")
```

## 📋 Checklist de Personnalisation

- [ ] **Configuration de base**
  - [ ] Nom de l'entreprise
  - [ ] Titre du jeu
  - [ ] Langue
  - [ ] Couleurs du thème

- [ ] **Terminologie**
  - [ ] Phase → Step/Étape
  - [ ] Enabler → Capability/Capacité
  - [ ] Choice → Decision/Décision

- [ ] **Personnages**
  - [ ] Nom du protagoniste
  - [ ] Noms des experts
  - [ ] Rôles des experts

- [ ] **Contenu**
  - [ ] Titres des phases
  - [ ] Descriptions des choix
  - [ ] Titres des capacités
  - [ ] Textes UI

- [ ] **Test**
  - [ ] Vérifier avec test_template.py
  - [ ] Intégrer dans le jeu
  - [ ] Tester l'affichage

## 🎨 Templates Prêts à l'Emploi

### Template Digital Transformation
```bash
cp game_template_digital.json mon_template.json
```

### Template Français
```bash
# Créer un template français basé sur l'original
python3 -c "
from template_engine import GameTemplate
template = GameTemplate('game_template.json')
template.config['game_config']['language'] = 'fr'
template.config['terminology'] = {
    'phase': 'étape',
    'enabler': 'capacité', 
    'choice': 'décision'
}
template.save_template('template_francais.json')
"
```

## 🔍 Debugging

### Vérifier le Template

```python
from template_engine import GameTemplate

template = GameTemplate("mon_template.json")

# Vérifier la configuration
print("Config:", template.config)

# Tester les méthodes
print("Company:", template.get_company_name())
print("Characters:", template.get_character_name("amira"))
```

### Logs de Debug

```python
# Activer les logs pour voir les erreurs
import logging
logging.basicConfig(level=logging.DEBUG)

template = GameTemplate("mon_template.json")
```

## 📚 Ressources

- **Template de base** : `game_template.json`
- **Template Digital** : `game_template_digital.json`
- **Moteur de template** : `template_engine.py`
- **Script de test** : `test_template.py`
- **Documentation** : Ce fichier README

## 🎯 Prochaines Étapes

1. **Intégration complète** : Modifier tous les fichiers du jeu pour utiliser le template
2. **Interface graphique** : Créer une interface web pour éditer les templates
3. **Templates prédéfinis** : Créer une bibliothèque de templates pour différents secteurs
4. **Export/Import** : Permettre l'export et l'import de configurations
5. **Validation** : Ajouter la validation des templates JSON

---

**🎮 Avec ce système de template, vous pouvez créer des versions complètement personnalisées du jeu sans toucher au code source !**
