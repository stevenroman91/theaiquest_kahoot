#!/bin/bash

# Script de développement pour AI Acceleration EXEC
# Usage: ./dev.sh [start|stop|restart|status|test|deploy]

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORT=5001
PID_FILE="$PROJECT_DIR/.dev_server.pid"

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages colorés
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Fonction pour vérifier si le serveur est en cours d'exécution
is_server_running() {
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if ps -p "$pid" > /dev/null 2>&1; then
            return 0
        else
            rm -f "$PID_FILE"
            return 1
        fi
    fi
    return 1
}

# Fonction pour démarrer le serveur de développement
start_server() {
    if is_server_running; then
        log_warning "Le serveur est déjà en cours d'exécution sur le port $PORT"
        return 0
    fi

    log_info "Démarrage du serveur de développement sur le port $PORT..."
    cd "$PROJECT_DIR"
    
    # Démarrer le serveur en arrière-plan
    nohup python3 web_interface.py > .dev_server.log 2>&1 &
    local pid=$!
    echo $pid > "$PID_FILE"
    
    # Attendre que le serveur démarre
    sleep 2
    
    if is_server_running; then
        log_success "Serveur démarré avec succès!"
        log_info "URL: http://localhost:$PORT"
        log_info "Logs: tail -f .dev_server.log"
        log_info "Arrêt: ./dev.sh stop"
    else
        log_error "Échec du démarrage du serveur"
        rm -f "$PID_FILE"
        return 1
    fi
}

# Fonction pour arrêter le serveur
stop_server() {
    if ! is_server_running; then
        log_warning "Aucun serveur en cours d'exécution"
        return 0
    fi

    local pid=$(cat "$PID_FILE")
    log_info "Arrêt du serveur (PID: $pid)..."
    
    kill "$pid" 2>/dev/null
    rm -f "$PID_FILE"
    
    # Attendre que le processus se termine
    sleep 1
    
    if ! ps -p "$pid" > /dev/null 2>&1; then
        log_success "Serveur arrêté avec succès"
    else
        log_warning "Arrêt forcé du serveur..."
        kill -9 "$pid" 2>/dev/null
        rm -f "$PID_FILE"
    fi
}

# Fonction pour redémarrer le serveur
restart_server() {
    log_info "Redémarrage du serveur..."
    stop_server
    sleep 1
    start_server
}

# Fonction pour afficher le statut du serveur
show_status() {
    if is_server_running; then
        local pid=$(cat "$PID_FILE")
        log_success "Serveur en cours d'exécution (PID: $pid)"
        log_info "URL: http://localhost:$PORT"
        log_info "Logs: tail -f .dev_server.log"
    else
        log_info "Serveur arrêté"
    fi
}

# Fonction pour tester l'application
test_app() {
    log_info "Test de l'application..."
    
    if ! is_server_running; then
        log_info "Démarrage du serveur pour les tests..."
        start_server
        sleep 3
    fi
    
    # Test de base - vérifier que la page d'accueil répond
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT | grep -q "200"; then
        log_success "Test de connectivité réussi"
    else
        log_error "Test de connectivité échoué"
        return 1
    fi
    
    # Test des API principales
    log_info "Test des API..."
    
    # Test de l'API de login
    local login_response=$(curl -s -X POST http://localhost:$PORT/api/login \
        -H "Content-Type: application/json" \
        -d '{"username":"admin","password":"admin"}' | grep -o '"success":[^,]*')
    
    if echo "$login_response" | grep -q "true"; then
        log_success "API de login fonctionnelle"
    else
        log_warning "API de login pourrait avoir des problèmes"
    fi
    
    log_success "Tests terminés"
}

# Fonction pour déployer vers GitHub
deploy_to_github() {
    log_info "Préparation du déploiement vers GitHub..."
    
    # Vérifier que nous sommes dans un repo Git
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        log_error "Ce n'est pas un repository Git"
        return 1
    fi
    
    # Vérifier le statut Git
    if ! git diff --quiet || ! git diff --cached --quiet; then
        log_warning "Il y a des modifications non commitées"
        read -p "Voulez-vous les commiter avant le déploiement? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git add .
            read -p "Message de commit: " commit_message
            git commit -m "$commit_message"
        else
            log_error "Déploiement annulé"
            return 1
        fi
    fi
    
    # Pousser vers GitHub
    log_info "Poussage vers GitHub..."
    if git push origin main; then
        log_success "Déploiement réussi vers GitHub!"
        log_info "Repository: $(git remote get-url origin)"
    else
        log_error "Échec du déploiement vers GitHub"
        return 1
    fi
}

# Fonction d'aide
show_help() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commandes disponibles:"
    echo "  start     - Démarrer le serveur de développement"
    echo "  stop      - Arrêter le serveur de développement"
    echo "  restart   - Redémarrer le serveur de développement"
    echo "  status    - Afficher le statut du serveur"
    echo "  test      - Tester l'application"
    echo "  deploy    - Déployer vers GitHub"
    echo "  help      - Afficher cette aide"
    echo ""
    echo "Exemples:"
    echo "  $0 start     # Démarrer le serveur"
    echo "  $0 test      # Tester l'application"
    echo "  $0 deploy    # Déployer vers GitHub"
}

# Fonction principale
main() {
    case "${1:-help}" in
        start)
            start_server
            ;;
        stop)
            stop_server
            ;;
        restart)
            restart_server
            ;;
        status)
            show_status
            ;;
        test)
            test_app
            ;;
        deploy)
            deploy_to_github
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            log_error "Commande inconnue: $1"
            show_help
            exit 1
            ;;
    esac
}

# Exécuter la fonction principale avec tous les arguments
main "$@"
