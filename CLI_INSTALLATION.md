# 🚀 Installation et Configuration - Architecture CLI

Guide complet pour installer et configurer le Système d'Agents Électriques Québécois avec Claude Code CLI et authentification Claude Max.

## 📋 Table des Matières

- [Prérequis](#prérequis)
- [Installation Claude Code CLI](#installation-claude-code-cli)
- [Configuration du Projet](#configuration-du-projet)
- [Installation des Dépendances](#installation-des-dépendances)
- [Configuration MCP Server](#configuration-mcp-server)
- [Lancement de l'Application](#lancement-de-lapplication)
- [Authentification Claude Max](#authentification-claude-max)
- [Vérification de l'Installation](#vérification-de-linstallation)
- [Dépannage](#dépannage)

## ✅ Prérequis

### Compte Claude Max (Requis)
- Compte Anthropic avec accès Claude Max
- **Important**: L'architecture CLI nécessite un compte Claude Max authentifié
- Pas besoin de clé API - l'authentification se fait via OAuth

### Logiciels Requis
- **Node.js**: ≥ 18.x (recommandé: 20.x LTS)
- **Python**: ≥ 3.8 (pour le MCP server et le traitement PDF)
- **Git**: Pour cloner le repository
- **npm ou yarn**: Gestionnaire de paquets Node.js

### Système d'Exploitation
- **Windows**: 10/11 (64-bit)
- **macOS**: 10.15+ (Catalina ou supérieur)
- **Linux**: Ubuntu 20.04+, Debian 11+, ou équivalent

## 🔧 Installation Claude Code CLI

### 1. Installation via npm (Recommandé)

```bash
# Installation globale du CLI
npm install -g @anthropic-ai/claude-code-cli

# Vérifier l'installation
claude --version
```

### 2. Installation Alternative (depuis les sources)

```bash
# Cloner le repository Claude Code
git clone https://github.com/anthropics/claude-code.git
cd claude-code

# Installer et linker globalement
npm install
npm link

# Vérifier l'installation
claude --version
```

### 3. Vérification de l'Installation

```bash
# Afficher l'aide
claude --help

# Vérifier que la commande fonctionne
claude version
```

**Sortie attendue**:
```
Claude Code CLI v1.x.x
```

## 📦 Configuration du Projet

### 1. Cloner le Repository

```bash
# Cloner le projet
git clone <repository-url> quebec-electrical-system
cd quebec-electrical-system
```

### 2. Structure du Projet

Vérifier que vous avez la structure suivante:
```
quebec-electrical-system/
├── .claude/
│   └── config.json              # Configuration MCP
├── electron-app/
│   ├── main/
│   │   ├── main-cli.js         # Main process CLI
│   │   ├── claude-cli-bridge.js # Bridge Electron-CLI
│   │   └── window-manager.js
│   ├── renderer/               # Interface utilisateur
│   └── package.json
├── backend/
│   └── services/
│       └── claude-cli-manager.js # Gestionnaire CLI
├── mcp-server-quebec-electrical/
│   ├── index.js                # Serveur MCP
│   ├── agents/                 # 11 agents spécialisés
│   └── tools/                  # Outils PDF et KB
└── README.md
```

## 📥 Installation des Dépendances

### 1. Dépendances Node.js (Electron)

```bash
# Installer les dépendances Electron
cd electron-app
npm install

# Retour au répertoire racine
cd ..
```

### 2. Dépendances Backend

```bash
# Installer les dépendances backend
cd backend
npm install

# Retour au répertoire racine
cd ..
```

### 3. Dépendances MCP Server

```bash
# Installer les dépendances du serveur MCP
cd mcp-server-quebec-electrical
npm install

# Retour au répertoire racine
cd ..
```

### 4. Dépendances Python (Traitement PDF)

```bash
# Créer un environnement virtuel (recommandé)
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# OU
venv\Scripts\activate  # Windows

# Installer les dépendances Python
cd backend
pip install -r requirements.txt

# Retour au répertoire racine
cd ..
```

**Dépendances Python installées**:
- PyMuPDF (fitz) - Lecture PDF
- pytesseract - OCR
- opencv-python - Traitement d'images
- numpy - Calculs numériques
- sentence-transformers - Embeddings pour FAISS

## ⚙️ Configuration MCP Server

### 1. Vérifier la Configuration Claude

Le fichier `.claude/config.json` devrait contenir:

```json
{
  "mcpServers": {
    "quebec-electrical": {
      "command": "node",
      "args": ["mcp-server-quebec-electrical/index.js"],
      "description": "11 agents électriques spécialisés pour le Québec (CEQ, RSST, RBQ, CSA)",
      "env": {
        "KNOWLEDGE_BASE_PATH": "backend/knowledge-base",
        "UPLOAD_DIR": "storage/uploads"
      }
    }
  },
  "theme": "dark",
  "editor": "code",
  "autoApprove": {
    "read": true,
    "write": false
  }
}
```

### 2. Créer les Répertoires de Stockage

```bash
# Créer les répertoires nécessaires
mkdir -p storage/uploads
mkdir -p storage/processed
mkdir -p storage/exports
mkdir -p backend/knowledge-base/faiss_index

# Définir les permissions (Linux/Mac)
chmod 755 storage
chmod 755 backend/knowledge-base
```

### 3. Tester le MCP Server Localement

```bash
# Démarrer le serveur MCP en mode test
cd mcp-server-quebec-electrical
node index.js

# Vous devriez voir:
# MCP Server Quebec Electrical démarré
# 15 outils disponibles
```

Arrêter avec `Ctrl+C`.

## 🚀 Lancement de l'Application

### Mode Développement

```bash
# Depuis le répertoire racine
cd electron-app
npm run dev
```

L'application Electron se lance avec:
- DevTools ouvertes automatiquement
- Rechargement à chaud activé
- Logs détaillés dans la console

### Mode Production

```bash
# Build de l'application
cd electron-app
npm run build

# Lancer l'application buildée
npm start
```

## 🔐 Authentification Claude Max

### 1. Premier Lancement

Au premier lancement, l'application détecte automatiquement qu'aucune authentification n'est configurée.

**Vous verrez**:
- Modal d'authentification s'ouvre automatiquement
- Statut CLI: "⚠️ Non authentifié"
- Bouton "Se connecter avec Claude Max"

### 2. Processus d'Authentification

**Étape 1: Cliquer sur "Se connecter avec Claude Max"**
```
L'application lance le processus OAuth
```

**Étape 2: Navigateur s'ouvre automatiquement**
```
URL: https://console.anthropic.com/oauth/authorize?...
```

**Étape 3: Connexion sur le site Anthropic**
- Entrez vos identifiants Claude Max
- Autorisez l'accès à Claude Code CLI
- Confirmez les permissions demandées

**Étape 4: Retour à l'application**
```
✅ Authentification réussie!
✅ Claude Code CLI prêt
```

### 3. Vérification de l'Authentification

Une fois authentifié, vous verrez:
- **Statut CLI**: "✅ Claude CLI connecté"
- **Agents**: "11 agents actifs"
- **Interface**: Tous les panneaux sont activés

### 4. Session Persistante

L'authentification est sauvegardée localement:
- Token OAuth stocké par Claude CLI
- Pas besoin de se ré-authentifier à chaque lancement
- Session reste active tant que le token est valide

## ✓ Vérification de l'Installation

### 1. Vérifier les Agents

Dans le panneau de chat, vous devriez voir:
```
✅ Claude Code CLI prêt
✅ 11 agents chargés et prêts
```

Les 11 agents disponibles:
1. electrical-safety-specialist (Spécialiste Sécurité Électrique)
2. electrical-calculator (Calculateur Électrique)
3. electrical-compliance-checker (Vérificateur de Conformité)
4. electrical-project-manager (Gestionnaire de Projets)
5. electrical-diagnostician (Diagnosticien Électrique)
6. electrical-supply-manager (Gestionnaire d'Approvisionnement)
7. electrical-training-coordinator (Coordonnateur de Formation)
8. electrical-directive-tracker (Suivi des Directives)
9. electrical-material-tracker (Suivi des Matériaux)
10. electrical-dashboard-creator (Créateur de Tableaux de Bord)
11. electrical-site-planner (Planificateur de Chantier)

### 2. Tester un Agent

Envoyez un message dans le chat:
```
Calcule la charge électrique pour un bâtiment résidentiel de 200m²
```

Vous devriez recevoir une réponse de l'agent **electrical-calculator**.

### 3. Tester le Téléversement PDF

1. **Glisser-déposer** un PDF de plan électrique dans le panneau Dashboard
2. Vérifier les messages:
   ```
   📄 Upload de plan.pdf...
   ✅ PDF "plan.pdf" chargé avec succès
   🔍 Lancement de l'analyse automatique...
   ```

### 4. Tester les Outils MCP

Envoyez un message utilisant les outils MCP:
```
Recherche dans les normes CEQ les exigences pour les circuits de 15A
```

L'agent devrait invoquer l'outil `search_quebec_norms` via MCP.

## 🐛 Dépannage

### Problème: "Claude CLI non trouvé"

**Erreur**:
```
❌ Claude Code CLI n'est pas installé
```

**Solution**:
```bash
# Vérifier l'installation
which claude  # Linux/Mac
where claude  # Windows

# Réinstaller si nécessaire
npm install -g @anthropic-ai/claude-code-cli
```

### Problème: "Authentification échouée"

**Erreur**:
```
❌ Erreur d'authentification
```

**Solutions**:
1. Vérifier que vous avez un compte Claude Max actif
2. Vérifier votre connexion Internet
3. Vider le cache d'authentification:
   ```bash
   claude auth logout
   ```
4. Réessayer l'authentification

### Problème: "MCP Server non accessible"

**Erreur**:
```
❌ MCP Server ne répond pas
```

**Solutions**:
1. Vérifier que le serveur MCP est configuré:
   ```bash
   cat .claude/config.json
   ```
2. Tester le serveur manuellement:
   ```bash
   cd mcp-server-quebec-electrical
   node index.js
   ```
3. Vérifier les logs:
   ```bash
   # Dans DevTools Electron
   Console > voir les erreurs
   ```

### Problème: "Agents ne répondent pas"

**Erreur**:
```
❌ Erreur invocation agent
```

**Solutions**:
1. Vérifier que le CLI est authentifié:
   ```bash
   claude auth status
   ```
2. Redémarrer l'application Electron
3. Vérifier les logs du MCP server
4. Tester un agent directement via CLI:
   ```bash
   claude "Calcule la charge pour un circuit 15A"
   ```

### Problème: "PDF non analysé"

**Erreur**:
```
❌ Erreur lors de l'upload
```

**Solutions**:
1. Vérifier que Python et les dépendances sont installées:
   ```bash
   python3 -c "import fitz, pytesseract, cv2"
   ```
2. Vérifier les permissions des répertoires:
   ```bash
   ls -la storage/uploads
   ```
3. Vérifier les logs Python dans la console

### Problème: "Connexion perdue"

**Erreur**:
```
⚠️ Session CLI fermée
```

**Solutions**:
1. Cliquer sur le bouton "Se connecter" dans le statut CLI
2. Redémarrer l'application
3. Vérifier que Claude CLI fonctionne:
   ```bash
   claude "test"
   ```

## 📚 Ressources Supplémentaires

- **Documentation Claude Code CLI**: [https://docs.anthropic.com/claude/docs/claude-code](https://docs.anthropic.com/claude/docs/claude-code)
- **Documentation MCP**: [https://modelcontextprotocol.io](https://modelcontextprotocol.io)
- **Architecture du Système**: Voir `ARCHITECTURE_CLI.md`
- **Guide de Production**: Voir `PRODUCTION_DEPLOYMENT.md`

## 🎯 Prochaines Étapes

Une fois l'installation terminée:
1. Explorer les 11 agents spécialisés
2. Tester l'analyse de PDF électriques
3. Consulter `ARCHITECTURE_CLI.md` pour comprendre le fonctionnement
4. Lire `PROJECT_README.md` pour les cas d'utilisation

## 📞 Support

En cas de problème:
1. Consulter ce guide de dépannage
2. Vérifier les logs dans DevTools Electron
3. Créer une issue GitHub avec:
   - Version de Node.js: `node --version`
   - Version Claude CLI: `claude --version`
   - Version Electron: `npm list electron`
   - Logs d'erreur complets

---

**Version**: 1.0.0 (CLI Architecture)
**Dernière mise à jour**: 2024-11-19
