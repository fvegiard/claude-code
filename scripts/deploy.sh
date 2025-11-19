#!/bin/bash

# ============================================
# Script de Déploiement Production
# Système d'Agents Électriques Québécois
# ============================================

set -e  # Arrêter en cas d'erreur

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher des messages colorés
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

# Vérifier les prérequis
check_prerequisites() {
    log_info "Vérification des prérequis..."

    # Vérifier Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker n'est pas installé"
        exit 1
    fi

    # Vérifier Docker Compose
    if ! command -v docker compose &> /dev/null; then
        log_error "Docker Compose n'est pas installé"
        exit 1
    fi

    # Vérifier que le fichier .env.production existe
    if [ ! -f .env.production ]; then
        log_error "Fichier .env.production non trouvé"
        log_info "Copier .env.production.example et configurer les valeurs"
        exit 1
    fi

    # Vérifier que ANTHROPIC_API_KEY est défini
    source .env.production
    if [ -z "$ANTHROPIC_API_KEY" ] || [ "$ANTHROPIC_API_KEY" = "your_production_api_key_here" ]; then
        log_error "ANTHROPIC_API_KEY non configuré dans .env.production"
        exit 1
    fi

    log_success "Tous les prérequis sont satisfaits"
}

# Backup de la base de données
backup_database() {
    log_info "Création d'un backup de la base de données..."

    if docker ps | grep -q quebec-electrical-postgres; then
        BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
        mkdir -p "$BACKUP_DIR"

        docker exec quebec-electrical-postgres pg_dump \
            -U "$POSTGRES_USER" \
            "$POSTGRES_DB" > "$BACKUP_DIR/database.sql"

        log_success "Backup créé: $BACKUP_DIR/database.sql"
    else
        log_warning "Base de données non en cours d'exécution, backup ignoré"
    fi
}

# Arrêter les conteneurs existants
stop_containers() {
    log_info "Arrêt des conteneurs existants..."

    if docker ps | grep -q quebec-electrical; then
        docker compose -f docker-compose.production.yml down
        log_success "Conteneurs arrêtés"
    else
        log_info "Aucun conteneur en cours d'exécution"
    fi
}

# Build des images Docker
build_images() {
    log_info "Construction des images Docker..."

    docker compose -f docker-compose.production.yml build --no-cache

    log_success "Images construites avec succès"
}

# Démarrer les services
start_services() {
    log_info "Démarrage des services..."

    docker compose -f docker-compose.production.yml up -d

    log_success "Services démarrés"
}

# Vérifier la santé des services
check_health() {
    log_info "Vérification de la santé des services..."

    # Attendre que les services démarrent
    sleep 10

    # Vérifier le backend
    MAX_RETRIES=30
    RETRY_COUNT=0

    while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
        if curl -f http://localhost:3000/health > /dev/null 2>&1; then
            log_success "Backend est en bonne santé"
            break
        fi

        RETRY_COUNT=$((RETRY_COUNT + 1))
        if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
            log_error "Backend ne répond pas après $MAX_RETRIES tentatives"
            docker compose -f docker-compose.production.yml logs backend
            exit 1
        fi

        log_info "Attente du démarrage du backend... ($RETRY_COUNT/$MAX_RETRIES)"
        sleep 2
    done

    # Vérifier PostgreSQL
    if docker exec quebec-electrical-postgres pg_isready -U "$POSTGRES_USER" > /dev/null 2>&1; then
        log_success "PostgreSQL est en bonne santé"
    else
        log_warning "PostgreSQL n'est pas prêt"
    fi

    # Vérifier Redis
    if docker exec quebec-electrical-redis redis-cli ping > /dev/null 2>&1; then
        log_success "Redis est en bonne santé"
    else
        log_warning "Redis n'est pas prêt"
    fi
}

# Afficher les logs
show_logs() {
    log_info "Affichage des logs récents..."
    docker compose -f docker-compose.production.yml logs --tail=50
}

# Menu principal
show_menu() {
    echo ""
    echo "============================================"
    echo "  Déploiement Production - Quebec Electrical"
    echo "============================================"
    echo "1. Déploiement complet (avec backup)"
    echo "2. Déploiement sans backup"
    echo "3. Arrêter les services"
    echo "4. Voir les logs"
    echo "5. Vérifier la santé des services"
    echo "6. Backup de la base de données uniquement"
    echo "0. Quitter"
    echo "============================================"
    read -p "Choisir une option: " choice
}

# Déploiement complet
full_deployment() {
    log_info "=== Début du déploiement complet ==="

    check_prerequisites
    backup_database
    stop_containers
    build_images
    start_services
    check_health

    log_success "=== Déploiement terminé avec succès ==="
    echo ""
    log_info "Services disponibles:"
    log_info "- API Backend: http://localhost:3000"
    log_info "- Health Check: http://localhost:3000/health"
    log_info "- Métriques: http://localhost:3000/metrics"
    echo ""
    log_info "Commandes utiles:"
    log_info "- Voir les logs: docker compose -f docker-compose.production.yml logs -f"
    log_info "- Arrêter: docker compose -f docker-compose.production.yml down"
    log_info "- Redémarrer: docker compose -f docker-compose.production.yml restart"
}

# Déploiement sans backup
quick_deployment() {
    log_info "=== Début du déploiement rapide ==="

    check_prerequisites
    stop_containers
    build_images
    start_services
    check_health

    log_success "=== Déploiement terminé avec succès ==="
}

# Main
main() {
    # Charger les variables d'environnement
    if [ -f .env.production ]; then
        source .env.production
    fi

    if [ "$#" -eq 0 ]; then
        # Mode interactif
        while true; do
            show_menu

            case $choice in
                1)
                    full_deployment
                    ;;
                2)
                    quick_deployment
                    ;;
                3)
                    stop_containers
                    ;;
                4)
                    show_logs
                    ;;
                5)
                    check_health
                    ;;
                6)
                    backup_database
                    ;;
                0)
                    log_info "Au revoir!"
                    exit 0
                    ;;
                *)
                    log_error "Option invalide"
                    ;;
            esac

            read -p "Appuyez sur Entrée pour continuer..."
        done
    else
        # Mode commande
        case $1 in
            deploy)
                full_deployment
                ;;
            quick-deploy)
                quick_deployment
                ;;
            stop)
                stop_containers
                ;;
            logs)
                show_logs
                ;;
            health)
                check_health
                ;;
            backup)
                backup_database
                ;;
            *)
                log_error "Commande inconnue: $1"
                echo "Utilisation: $0 [deploy|quick-deploy|stop|logs|health|backup]"
                exit 1
                ;;
        esac
    fi
}

# Exécuter le script
main "$@"
