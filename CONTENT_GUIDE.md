# Guide de Modification du Contenu du Jeu

## 📋 Vue d'ensemble

Ce guide vous explique **exactement** où modifier chaque élément visible du jeu. Tout le contenu est maintenant centralisé dans un seul fichier : `game_content.json`

## 🎯 Fichier Principal : `game_content.json`

**TOUT** le contenu visible du jeu se trouve dans ce fichier. Plus besoin de chercher dans plusieurs fichiers !

## 🏢 Modification du Branding (Logo, Titre, etc.)

### Dans `game_content.json` → section `game_branding` :

```json
{
  "game_branding": {
    "company_name": "PlayNext",           ← Nom de l'entreprise
    "game_title": "AI Transformation",      ← Titre du jeu
    "game_subtitle": "Leader Edition v1.9", ← Sous-titre
    "logo_icon": "fas fa-space-shuttle",            ← Icône du logo (FontAwesome)
    "logo_color": "#1e40af",                ← Couleur du logo
    "version": "1.9"                        ← Version
  }
}
```

**Exemple :** Pour changer le nom de l'entreprise :
- Ouvrez `game_content.json`
- Trouvez `"company_name": "PlayNext"`
- Changez en `"company_name": "VotreEntreprise"`

## 📄 Modification des Pages

### Dans `game_content.json` → section `page_templates` :

Chaque page a sa propre section :

```json
{
  "page_templates": {
    "login_page": {
      "title": "AI Transformation",                    ← Titre de la page
      "subtitle": "PlayNext - Leader Edition v1.9",   ← Sous-titre
      "description": "Connectez-vous pour commencer"   ← Description
    },
    "welcome_page": {
      "title": "Welcome !",                           ← Titre
      "subtitle": "You are the AI Transformation Leader", ← Sous-titre
      "description": "a leading gaming company...",   ← Description principale
      "mission": "Your mission: define how AI...",    ← Mission
      "button_text": "Start the Journey"             ← Texte du bouton
    }
  }
}
```

**Pages disponibles :**
- `login_page` - Page de connexion
- `welcome_page` - Page d'accueil
- `introduction_page` - Page d'introduction
- `teams_meeting_page` - Page de réunion Teams
- `step1_followup_page` - Page de suivi Step 1
- `pilot_step_page` - Page Pilot Step
- `enterprise_scaling_page` - Page Enterprise Scaling

## 🎮 Modification des Étapes du Jeu

### Dans `game_content.json` → section `game_steps` :

```json
{
  "game_steps": {
    "step1": {
      "title": "STEP 1: Designing Your AI-Enhanced Business Strategy", ← Titre de l'étape
      "description": "You've heard three different approaches...",     ← Description
      "video": "phase_1.mp4"                                          ← Vidéo
    },
    "step2": {
      "title": "STEP 2: Building Your AI Use Case Portfolio",
      "description": "Now that you've defined your strategic approach...",
      "video": "phase_2.mp4"
    }
  }
}
```

## 👥 Modification des Personnages

### Dans `game_content.json` → section `characters` :

```json
{
  "characters": {
    "protagonist": {
      "name": "Sophie",                    ← Nom du personnage
      "role": "AI Director",               ← Rôle
      "description": "The Player"         ← Description
    },
    "elena": {
      "name": "Elena",
      "role": "Strategy & Change Director",
      "description": "The strategist"
    }
  }
}
```

## 🔘 Modification des Boutons et Interface

### Dans `game_content.json` → section `ui_text` :

```json
{
  "ui_text": {
    "buttons": {
      "login": "Se connecter",             ← Texte bouton connexion
      "start_game": "Start the Journey",   ← Texte bouton démarrer
      "continue": "Continue",              ← Texte bouton continuer
      "join_teams": "Join Teams meeting"   ← Texte bouton Teams
    },
    "navigation": {
      "back": "Back",                      ← Texte navigation retour
      "next": "Go to Dashboard"              ← Texte navigation suivant
    },
    "messages": {
      "loading": "Loading...",             ← Message de chargement
      "error": "An error occurred"         ← Message d'erreur
    }
  }
}
```

## 🎬 Modification des Vidéos

### Dans `game_content.json` → section `videos` :

```json
{
  "videos": {
    "introduction": "Introduction.mp4",           ← Vidéo d'introduction
    "presentation": "presentation_serious_game.mp4", ← Vidéo de présentation
    "recap": "recap.mp4"                          ← Vidéo de récapitulatif
  }
}
```

## 🚀 Comment Appliquer les Modifications

1. **Modifiez** `game_content.json`
2. **Redémarrez** le serveur :
   ```bash
   cd /Users/stevenroman/Desktop/Exec/versions/v1.9-phase1-context-enhanced
   python3 web_interface.py
   ```
3. **Rafraîchissez** votre navigateur

## 📝 Exemples Concrets

### Changer le nom de l'entreprise :
```json
"company_name": "MaNouvelleEntreprise"
```

### Changer le titre du jeu :
```json
"game_title": "Mon Nouveau Jeu IA"
```

### Changer le texte de la page d'accueil :
```json
"welcome_page": {
  "title": "Bienvenue !",
  "subtitle": "Vous êtes le Directeur IA de MaNouvelleEntreprise",
  "description": "une entreprise leader dans le gaming..."
}
```

### Changer le texte d'un bouton :
```json
"buttons": {
  "start_game": "Commencer l'Aventure"
}
```

## ⚠️ Important

- **Sauvegardez** toujours `game_content.json` avant de le modifier
- **Testez** vos modifications en redémarrant le serveur
- **Utilisez** des guillemets doubles `"` pour les chaînes de caractères
- **Respectez** la structure JSON (virgules, accolades)

## 🔧 Fichiers à NE PAS Modifier

- `template_engine_complete.py` - Ancien système (à supprimer)
- `game_template_complete.json` - Ancien fichier (à supprimer)
- `game_template_complete.json.backup` - Sauvegarde (à supprimer)
- `game_template.json.backup` - Sauvegarde (à supprimer)

## ✅ Résumé

**Un seul fichier à modifier : `game_content.json`**

Tout le contenu visible du jeu est maintenant centralisé et organisé de manière claire !
