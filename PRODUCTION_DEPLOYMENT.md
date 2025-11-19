# 🚀 Guide de Déploiement Production

Guide complet pour déployer le Système d'Agents Électriques Québécois en production.

## 📋 Table des Matières

- [Prérequis](#prérequis)
- [Préparation](#préparation)
- [Configuration](#configuration)
- [Déploiement](#déploiement)
- [Monitoring](#monitoring)
- [Maintenance](#maintenance)
- [Sécurité](#sécurité)
- [Dépannage](#dépannage)
- [Backup et Restauration](#backup-et-restauration)

## ✅ Prérequis

### Serveur

- **OS**: Ubuntu 22.04 LTS (recommandé) ou équivalent
- **RAM**: Minimum 4GB (8GB recommandé)
- **CPU**: 2 cores minimum (4 cores recommandé)
- **Stockage**: 50GB minimum (SSD recommandé)
- **Bande passante**: 100 Mbps minimum

### Logiciels Requis

- **Docker**: ≥ 24.0.0
- **Docker Compose**: ≥ 2.20.0
- **Git**: Pour cloner le repository
- **Nginx**: Pour reverse proxy (optionnel si utilisation du compose)

### Accès Requis

- Clé API Anthropic (production)
- Accès SSH au serveur
- Nom de domaine (pour HTTPS)
- Certificats SSL/TLS

## 🔧 Préparation

### 1. Configuration du Serveur

```bash
# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Installer Docker Compose
sudo apt install docker-compose-plugin

# Vérifier les installations
docker --version
docker compose version
```

### 2. Cloner le Repository

```bash
# Créer le répertoire de déploiement
sudo mkdir -p /opt/quebec-electrical
sudo chown $USER:$USER /opt/quebec-electrical

# Cloner le repository
cd /opt/quebec-electrical
git clone <repository-url> .

# Checkout sur la branche de production
git checkout main  # ou la branche de production
```

### 3. Créer les Répertoires

```bash
# Créer les répertoires nécessaires
mkdir -p storage/{uploads,processed,exports}
mkdir -p logs
mkdir -p backups
mkdir -p nginx/ssl

# Définir les permissions
chmod 755 storage logs backups
```

## ⚙️ Configuration

### 1. Variables d'Environnement

```bash
# Copier le template de production
cp .env.production .env

# Éditer avec vos valeurs réelles
nano .env
```

**Variables critiques à configurer:**

```env
# API Anthropic - REQUIS
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx

# URLs
BACKEND_URL=https://api.votre-domaine.com
CORS_ORIGIN=https://app.votre-domaine.com

# Database - Utiliser des mots de passe FORTS
POSTGRES_PASSWORD=votre_mot_de_passe_postgres_fort
POSTGRES_USER=quebec_user_prod

# Redis
REDIS_PASSWORD=votre_mot_de_passe_redis_fort

# JWT (si authentification)
JWT_SECRET=votre_secret_jwt_tres_long_et_aleatoire
```

### 2. Configuration SSL/TLS

**Avec Let's Encrypt (recommandé):**

```bash
# Installer certbot
sudo apt install certbot

# Obtenir les certificats
sudo certbot certonly --standalone \
  -d api.votre-domaine.com \
  -d app.votre-domaine.com

# Copier les certificats
sudo cp /etc/letsencrypt/live/api.votre-domaine.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/api.votre-domaine.com/privkey.pem nginx/ssl/key.pem
sudo chmod 644 nginx/ssl/*.pem
```

**Avec certificats personnalisés:**

```bash
# Copier vos certificats
cp /chemin/vers/cert.pem nginx/ssl/
cp /chemin/vers/key.pem nginx/ssl/
chmod 644 nginx/ssl/*.pem
```

### 3. Configuration Nginx

Éditer `nginx/nginx.conf` et décommenter la section HTTPS:

```nginx
# Décommenter et configurer le bloc server HTTPS
server {
    listen 443 ssl http2;
    server_name api.votre-domaine.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    # ...
}
```

## 🚀 Déploiement

### Méthode 1: Script Automatisé (Recommandé)

```bash
# Déploiement complet avec backup
./scripts/deploy.sh deploy

# Ou en mode interactif
./scripts/deploy.sh
```

### Méthode 2: Manuel

```bash
# 1. Build des images
docker compose -f docker-compose.production.yml build

# 2. Démarrer les services
docker compose -f docker-compose.production.yml up -d

# 3. Vérifier les logs
docker compose -f docker-compose.production.yml logs -f backend

# 4. Vérifier la santé
curl http://localhost:3000/health
```

### Avec Nginx Reverse Proxy

```bash
# Démarrer avec le profile nginx
docker compose -f docker-compose.production.yml --profile with-nginx up -d
```

## 📊 Monitoring

### Health Checks

```bash
# Health check basique
curl https://api.votre-domaine.com/health

# Health check détaillé
curl https://api.votre-domaine.com/health/detailed

# Métriques
curl https://api.votre-domaine.com/metrics
```

### Logs

```bash
# Logs en temps réel
docker compose -f docker-compose.production.yml logs -f

# Logs d'un service spécifique
docker compose -f docker-compose.production.yml logs -f backend

# Logs des dernières 100 lignes
docker compose -f docker-compose.production.yml logs --tail=100 backend

# Logs applicatifs (dans le container)
docker exec quebec-electrical-backend tail -f /app/logs/combined.log
docker exec quebec-electrical-backend tail -f /app/logs/error.log
```

### Monitoring des Ressources

```bash
# Stats des containers
docker stats

# Utilisation disque
docker system df

# Logs Nginx (si utilisé)
docker exec quebec-electrical-nginx tail -f /var/log/nginx/access.log
docker exec quebec-electrical-nginx tail -f /var/log/nginx/error.log
```

## 🔄 Maintenance

### Mise à Jour

```bash
# 1. Backup de la base de données
./scripts/deploy.sh backup

# 2. Pull des dernières modifications
git pull origin main

# 3. Redéployer
./scripts/deploy.sh deploy
```

### Nettoyage

```bash
# Nettoyer les images inutilisées
docker image prune -a

# Nettoyer les volumes inutilisés
docker volume prune

# Nettoyer tout (ATTENTION!)
docker system prune -a --volumes
```

### Rotation des Logs

Créer `/etc/logrotate.d/quebec-electrical`:

```
/opt/quebec-electrical/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    create 0644 root root
}
```

## 🔒 Sécurité

### Checklist de Sécurité

- [ ] **Mots de passe forts** pour PostgreSQL, Redis, JWT
- [ ] **HTTPS activé** avec certificats valides
- [ ] **Firewall configuré** (UFW ou iptables)
- [ ] **Rate limiting** activé
- [ ] **CORS** configuré correctement
- [ ] **Helmet** et middlewares de sécurité activés
- [ ] **Logs** de sécurité activés
- [ ] **Backups** automatiques configurés
- [ ] **Monitoring** activé
- [ ] **Mises à jour** régulières

### Configuration Firewall

```bash
# Installer UFW
sudo apt install ufw

# Configurer les règles
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Activer le firewall
sudo ufw enable

# Vérifier le statut
sudo ufw status
```

### Scans de Sécurité

```bash
# Scanner les vulnérabilités des images Docker
docker scan quebec-electrical-backend

# Scanner avec Trivy
trivy image quebec-electrical-backend
```

## 🐛 Dépannage

### Problème: Services ne démarrent pas

**Solution:**

```bash
# Vérifier les logs
docker compose -f docker-compose.production.yml logs backend

# Vérifier la configuration
docker compose -f docker-compose.production.yml config

# Redémarrer un service spécifique
docker compose -f docker-compose.production.yml restart backend
```

### Problème: Base de données inaccessible

**Solution:**

```bash
# Vérifier que PostgreSQL fonctionne
docker exec quebec-electrical-postgres pg_isready -U quebec_user

# Se connecter à la base
docker exec -it quebec-electrical-postgres psql -U quebec_user -d quebec_electrical_prod

# Vérifier les logs
docker logs quebec-electrical-postgres
```

### Problème: Clé API invalide

**Solution:**

```bash
# Vérifier la variable d'environnement
docker exec quebec-electrical-backend env | grep ANTHROPIC

# Redéfinir et redémarrer
# Éditer .env puis:
docker compose -f docker-compose.production.yml restart backend
```

### Problème: Mémoire insuffisante

**Solution:**

```bash
# Augmenter les limites Docker dans docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 2G
        reservations:
          memory: 1G
```

## 💾 Backup et Restauration

### Backup Automatique

Créer un cron job `/etc/cron.daily/backup-quebec-electrical`:

```bash
#!/bin/bash

BACKUP_DIR="/opt/quebec-electrical/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup PostgreSQL
docker exec quebec-electrical-postgres pg_dump \
  -U quebec_user quebec_electrical_prod > "$BACKUP_DIR/db_$DATE.sql"

# Backup Redis (si nécessaire)
docker exec quebec-electrical-redis redis-cli SAVE
docker cp quebec-electrical-redis:/data/dump.rdb "$BACKUP_DIR/redis_$DATE.rdb"

# Backup des fichiers
tar -czf "$BACKUP_DIR/storage_$DATE.tar.gz" storage/

# Nettoyer les backups > 30 jours
find "$BACKUP_DIR" -name "*.sql" -mtime +30 -delete
find "$BACKUP_DIR" -name "*.rdb" -mtime +30 -delete
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
```

Rendre exécutable:

```bash
sudo chmod +x /etc/cron.daily/backup-quebec-electrical
```

### Restauration

```bash
# Restaurer PostgreSQL
docker exec -i quebec-electrical-postgres psql \
  -U quebec_user quebec_electrical_prod < backups/db_20240119_120000.sql

# Restaurer Redis
docker cp backups/redis_20240119_120000.rdb quebec-electrical-redis:/data/dump.rdb
docker restart quebec-electrical-redis

# Restaurer les fichiers
tar -xzf backups/storage_20240119_120000.tar.gz
```

## 📞 Support

En cas de problème:

1. Vérifier les logs: `docker compose logs -f`
2. Consulter ce guide de dépannage
3. Créer une issue GitHub
4. Contacter le support technique

## 📚 Ressources

- [Documentation Docker](https://docs.docker.com/)
- [Documentation Nginx](https://nginx.org/en/docs/)
- [Documentation PostgreSQL](https://www.postgresql.org/docs/)
- [Documentation Anthropic API](https://docs.anthropic.com/)

---

**Version**: 1.0.0
**Dernière mise à jour**: 2024-11-19
