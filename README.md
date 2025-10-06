# AI Acceleration EXEC - Smart Retail Group HR Managers

A serious game designed for HR managers to learn AI transformation strategies through interactive scenarios.

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Modern web browser

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd serious-game

# Install dependencies
pip install -r requirements.txt

# Start the game
python web_interface.py
```

### Access
Open your browser and navigate to `http://localhost:5000`

## 🎮 Game Overview

The game consists of 5 phases where players make strategic decisions about AI implementation:

1. **Phase 1**: Choose AI transformation approach
2. **Phase 2**: Prioritize AI solutions using Impact/Feasibility matrix
3. **Phase 3**: Select facilitators for each category
4. **Phase 4**: Choose scaling enablers within budget (max 30 points)
5. **Phase 5**: Select deployment strategy

## 🏗️ Architecture

### Backend
- **Flask** web framework
- **SQLite** database for user management
- **RESTful API** for game interactions

### Frontend
- **Vanilla JavaScript** with modern ES6+ features
- **Bootstrap 5** for responsive UI
- **HTML5 Video** for interactive content

### Key Files
- `web_interface.py` - Main Flask application
- `ai_acceleration_game.py` - Game logic and data
- `user_manager.py` - User authentication
- `static/js/game.js` - Frontend game controller
- `static/css/style.css` - Styling
- `templates/index.html` - Main template

## 🎯 Features

- **User Authentication**: Registration and login system
- **Interactive Videos**: Auto-playing educational content
- **Drag & Drop**: Phase 2 matrix prioritization
- **Budget Management**: Phase 4 point allocation system
- **Progress Tracking**: Real-time score and progress display
- **Responsive Design**: Works on desktop and mobile

## 🔧 Development

### Local Development
```bash
# Start development server
python web_interface.py

# The game will be available at http://localhost:5000
```

### Code Structure
- Clean, modular JavaScript with ES6+ classes
- Separation of concerns between frontend and backend
- Comprehensive error handling and validation
- Senior-level code practices and documentation

## 📱 Deployment

The application is ready for deployment on platforms like:
- Railway
- Render
- Heroku
- VPS with nginx

See `Procfile` for deployment configuration.

## 🎨 Customization

### Adding New Phases
1. Add phase data to `ai_acceleration_game.py`
2. Create corresponding API routes
3. Add frontend handling in `game.js`
4. Update HTML template

### Styling
Modify `static/css/style.css` to customize the visual appearance.

## 📊 Scoring System

Each phase awards 0-3 stars based on decision quality:
- **3 stars**: Optimal choices
- **2 stars**: Good choices
- **1 star**: Acceptable choices
- **0 stars**: Poor choices

Total possible score: 15 points (3 per phase)

## 🔒 Security

- User passwords are hashed using secure methods
- Session management for user authentication
- Input validation on both frontend and backend
- CSRF protection for forms

## 📝 License

This project is proprietary software developed for Smart Retail Group.

## 🤝 Support

For technical support or questions, contact the development team.