# 🚀 Guide d'Installation - Système d'Agents Électriques Québécois

Guide complet pour installer et démarrer le système d'agents électriques québécois avec Claude Code.

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir:

- **Node.js** ≥ 20.0.0 ([Télécharger](https://nodejs.org/))
- **Python** ≥ 3.11 ([Télécharger](https://www.python.org/))
- **Tesseract OCR** (pour l'analyse de PDF)
- **Clé API Anthropic** ([Obtenir une clé](https://console.anthropic.com/))
- **Git** (pour cloner le repository)

## 🔧 Installation

### Étape 1: Cloner le repository

```bash
git clone <repository-url>
cd claude-code
```

### Étape 2: Installer Tesseract OCR

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install tesseract-ocr tesseract-ocr-fra
```

**macOS (avec Homebrew):**
```bash
brew install tesseract tesseract-lang
```

**Windows:**
1. Télécharger l'installateur: https://github.com/UB-Mannheim/tesseract/wiki
2. Installer et ajouter au PATH système

**Vérifier l'installation:**
```bash
tesseract --version
```

### Étape 3: Configurer les variables d'environnement

```bash
# Copier le fichier d'exemple
cp .env.example .env
```

**Éditer le fichier `.env`:**
```env
# REQUIS: Votre clé API Anthropic
ANTHROPIC_API_KEY=sk-ant-...votre_clé_ici

# Backend (laisser par défaut)
BACKEND_URL=http://localhost:3000
PORT=3000

# Paths (créés automatiquement)
UPLOAD_DIR=./storage/uploads
PROCESSED_DIR=./storage/processed
EXPORT_DIR=./storage/exports

# Optionnel: Base de données
# POSTGRES_HOST=localhost
# POSTGRES_PORT=5432
# POSTGRES_DB=quebec_electrical
# POSTGRES_USER=postgres
# POSTGRES_PASSWORD=votre_mot_de_passe

# Optionnel: Redis
# REDIS_HOST=localhost
# REDIS_PORT=6379
```

### Étape 4: Installer les dépendances Backend

```bash
cd backend
npm install
```

**Installer les dépendances Python:**
```bash
pip3 install -r requirements.txt
```

**Vérifier l'installation Python:**
```bash
python3 pdf-processing/pdf-parser.py
# Devrait afficher: error: Usage: python pdf-parser.py <pdf_path> <pdf_id>
```

### Étape 5: Installer les dépendances Electron

```bash
cd ../electron-app
npm install
```

### Étape 6: Créer les dossiers de stockage

```bash
cd ..
mkdir -p storage/uploads storage/processed storage/exports
```

## 🚀 Démarrage

### Méthode 1: Démarrage manuel (2 terminaux)

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

Vous devriez voir:
```
============================================
⚡ Système d'Agents Électriques Québécois
============================================
🚀 Serveur démarré sur le port 3000
🌐 API disponible à: http://localhost:3000
🔌 WebSocket prêt pour connexions temps réel
🤖 Claude Code Backend activé
📊 Conforme CEQ, RSST, RBQ, CSA
============================================
```

**Terminal 2 - Electron App:**
```bash
cd electron-app
npm start
```

L'application Electron devrait s'ouvrir automatiquement.

### Méthode 2: Mode développement

**Backend avec auto-reload:**
```bash
cd backend
npm run dev  # Utilise nodemon
```

**Electron:**
```bash
cd electron-app
npm run dev
```

## ✅ Vérification de l'installation

### Test 1: Vérifier le backend

```bash
curl http://localhost:3000/health
```

**Réponse attendue:**
```json
{
  "status": "healthy",
  "service": "Quebec Electrical Backend",
  "timestamp": "2024-11-19T...",
  "version": "1.0.0"
}
```

### Test 2: Vérifier les agents

```bash
curl http://localhost:3000/api/agents
```

**Réponse attendue:**
```json
{
  "success": true,
  "agents": [
    {
      "name": "electrical-safety-quebec-specialist",
      "displayName": "Spécialiste Sécurité Électrique",
      ...
    },
    ...
  ],
  "count": 11
}
```

### Test 3: Vérifier la base de connaissances

```bash
cd backend
python3 knowledge-base/faiss-manager.py stats
```

**Réponse attendue:**
```json
{
  "total_documents": 8,
  "categories": {
    "CEQ": 4,
    "RSST": 1,
    "CSA": 1,
    "RBQ": 1,
    "Spécifications": 1
  },
  "index_type": "Mock",
  "dimension": 384,
  "last_updated": "..."
}
```

## 🎯 Premier test du système

1. **Ouvrir l'application Electron**
2. **Vérifier les agents chargés** dans le header (devrait afficher "11 agents actifs")
3. **Tester le chat:**
   - Dans le panneau de gauche, taper: "Bonjour, quels agents sont disponibles?"
   - Vous devriez recevoir une réponse listant les 11 agents

4. **Tester l'upload PDF:**
   - Créer un fichier PDF de test
   - Le glisser-déposer dans la zone du panneau de droite
   - L'analyse devrait démarrer automatiquement

## 🔍 Dépannage

### Problème: "ANTHROPIC_API_KEY not found"

**Solution:**
- Vérifier que le fichier `.env` existe à la racine du projet
- Vérifier que `ANTHROPIC_API_KEY` est défini dans `.env`
- Redémarrer le backend

### Problème: "Tesseract not found"

**Solution:**
```bash
# Vérifier que tesseract est installé
which tesseract

# Vérifier la version
tesseract --version
```

Si non installé, installer selon votre OS (voir Étape 2).

### Problème: "Module not found"

**Solution:**
```bash
# Réinstaller les dépendances backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Réinstaller les dépendances Electron
cd ../electron-app
rm -rf node_modules package-lock.json
npm install
```

### Problème: "Port 3000 already in use"

**Solution:**
```bash
# Option 1: Changer le port dans .env
PORT=3001

# Option 2: Tuer le processus utilisant le port 3000
# Linux/Mac:
lsof -ti:3000 | xargs kill -9
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Problème: "Python module not found"

**Solution:**
```bash
cd backend
pip3 install -r requirements.txt --upgrade
```

### Problème: L'application Electron ne démarre pas

**Solution:**
```bash
# Vérifier les logs
cd electron-app
npm start 2>&1 | tee electron.log

# Vérifier la version de Node.js
node --version  # Devrait être ≥ 20.0.0
```

## 📊 Utilisation avancée

### Activer PostgreSQL (optionnel)

1. **Installer PostgreSQL:**
```bash
# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# macOS
brew install postgresql
```

2. **Créer la base de données:**
```bash
sudo -u postgres psql
CREATE DATABASE quebec_electrical;
CREATE USER quebec_user WITH PASSWORD 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON DATABASE quebec_electrical TO quebec_user;
\q
```

3. **Configurer dans `.env`:**
```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=quebec_electrical
POSTGRES_USER=quebec_user
POSTGRES_PASSWORD=votre_mot_de_passe
```

### Activer Redis (optionnel)

1. **Installer Redis:**
```bash
# Ubuntu/Debian
sudo apt-get install redis-server

# macOS
brew install redis
```

2. **Démarrer Redis:**
```bash
# Linux
sudo systemctl start redis

# macOS
brew services start redis
```

3. **Configurer dans `.env`:**
```env
REDIS_HOST=localhost
REDIS_PORT=6379
```

## 🏗️ Build pour production

### Backend

```bash
cd backend
npm start
```

### Electron App

```bash
cd electron-app
npm run build
```

Les exécutables seront dans `electron-app/dist/`.

## 📚 Prochaines étapes

Une fois l'installation terminée:

1. **Lire la documentation:**
   - `PROJECT_README.md` - Guide d'utilisation
   - `PROJECT_ARCHITECTURE.md` - Architecture technique

2. **Tester avec un vrai plan:**
   - Obtenir un plan électrique PDF
   - L'uploader via l'interface
   - Analyser la BOM générée

3. **Explorer les agents:**
   - Tester chaque agent individuellement
   - Comprendre leurs spécialisations

4. **Personnaliser:**
   - Ajouter vos propres normes dans `backend/knowledge-base/quebec-norms/`
   - Modifier les agents selon vos besoins

## 💡 Conseils

- **Performance:** Pour de meilleurs résultats OCR, utilisez des PDF de haute qualité
- **Sécurité:** Ne committez jamais le fichier `.env` avec votre clé API
- **Logs:** Consultez les logs dans les terminaux backend et Electron
- **Support:** Créez une issue GitHub si vous rencontrez des problèmes

## 🎉 Félicitations!

Votre système d'agents électriques québécois est maintenant installé et prêt à l'emploi!

---

**Version du guide**: 1.0.0
**Dernière mise à jour**: 2024-11-19
