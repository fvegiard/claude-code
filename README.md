# ⚡ Système d'Agents Électriques Québécois

> Plateforme intelligente d'agents spécialisés pour l'électricité au Québec, propulsée par **Claude Code CLI** et **Claude Max**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.x-green.svg)](https://nodejs.org)
[![Python](https://img.shields.io/badge/python-%3E%3D3.8-blue.svg)](https://python.org)
[![Electron](https://img.shields.io/badge/electron-28.0-blue.svg)](https://www.electronjs.org)

## 🎯 Vue d'Ensemble

Le **Système d'Agents Électriques Québécois** est une application Electron qui intègre **29 agents IA spécialisés** (11 électriques + 15 développement + 3 système) pour aider les électriciens, ingénieurs et professionnels du bâtiment au Québec.

### Architecture Unique: Claude Code CLI

Cette application utilise une **architecture CLI innovante** au lieu de l'API directe Anthropic:

```
Electron Frontend ─→ CLI Bridge ─→ Claude Code CLI ─→ MCP Server ─→ Claude Max
```

**Avantages**:
- ✅ **Authentification OAuth** avec compte Claude Max (pas besoin de clé API)
- ✅ **MCP (Model Context Protocol)** pour exposer les 29 agents comme outils
- ✅ **Session persistante** et gestion automatique du contexte
- ✅ **Intégration native** avec l'écosystème Claude Code

## ✨ Fonctionnalités Principales

### 🤖 29 Agents Spécialisés

#### ⚡ 11 Agents Électriques Québécois

1. **Spécialiste Sécurité Électrique** - Normes RSST, EPI, procédures sécuritaires
2. **Calculateur Électrique** - Charges, sections de câbles, chutes de tension
3. **Vérificateur de Conformité** - CEQ, RBQ, CSA, inspections
4. **Gestionnaire de Projets** - Planification, ressources, budgets
5. **Diagnosticien Électrique** - Dépannage, analyses de pannes
6. **Gestionnaire d'Approvisionnement** - BOM, inventaires, commandes
7. **Coordonnateur de Formation** - Habilitations, certifications, formations
8. **Suivi des Directives** - Veille réglementaire CEQ/RSST/RBQ
9. **Suivi des Matériaux** - Inventaire, traçabilité, consommation
10. **Créateur de Tableaux de Bord** - Métriques, KPIs, visualisations
11. **Planificateur de Chantier** - Logistique, sécurité, coordination

#### 💻 15 Agents Développement Général

Expert code reviewers, documentation generators, test writers, security auditors, performance optimizers, database designers, API architects, UI/UX designers, DevOps specialists, cloud architects, mobile developers, frontend/backend specialists, full-stack coordinators, and project documenters.

#### 🔧 3 Agents Système

System monitoring, log analysis, backup management, and disaster recovery specialists.

> 📖 **Voir [AGENTS_LIST.md](AGENTS_LIST.md) pour la liste complète et détaillée des 29 agents**

### 📄 Traitement Intelligent de PDF

- **Upload drag & drop** de plans électriques
- **OCR avancé** avec pytesseract et OpenCV
- **Détection automatique** des éléments électriques (prises, interrupteurs, panneaux)
- **Génération BOM** automatique à partir des plans
- **Annotations** sur les plans avec outils de marquage

### 🔍 Base de Connaissances Québécoise

- **FAISS** pour recherche vectorielle dans les normes
- **CEQ 2024** (Code électrique du Québec)
- **RSST** (Règlement sur la santé et la sécurité du travail)
- **RBQ** (Régie du bâtiment du Québec)
- **Normes CSA** canadiennes

### 💬 Interface Dual-Panel

- **Panneau Chat** - Discussion avec les agents IA
- **Panneau Dashboard** - Plans PDF, BOM, métriques, visualisations

## 🚀 Démarrage Rapide

### Prérequis

- **Compte Claude Max** (Anthropic) - [S'inscrire](https://claude.ai)
- **Node.js** ≥ 18.x - [Télécharger](https://nodejs.org)
- **Python** ≥ 3.8 - [Télécharger](https://python.org)
- **Claude Code CLI** - Installation ci-dessous

### Installation en 5 Minutes

```bash
# 1. Installer Claude Code CLI
npm install -g @anthropic-ai/claude-code-cli

# 2. Cloner le projet
git clone <repository-url> quebec-electrical-system
cd quebec-electrical-system

# 3. Installer les dépendances Electron
cd electron-app
npm install

# 4. Installer les dépendances MCP Server
cd ../mcp-server-quebec-electrical
npm install

# 5. Installer les dépendances Python
cd ../backend
pip install -r requirements.txt

# 6. Lancer l'application
cd ../electron-app
npm run dev
```

### Première Utilisation

1. **Lancement**: L'application s'ouvre avec un modal d'authentification
2. **Authentification**: Cliquer sur "Se connecter avec Claude Max"
3. **OAuth**: Un navigateur s'ouvre pour vous connecter à Anthropic
4. **Autorisation**: Autoriser l'accès à Claude Code CLI
5. **Prêt**: Retour automatique à l'application, statut "✅ Claude CLI connecté"

## 📚 Documentation Complète

### Guides Essentiels

| Document | Description |
|----------|-------------|
| **[CLI_INSTALLATION.md](CLI_INSTALLATION.md)** | 📦 Installation détaillée pas-à-pas |
| **[ARCHITECTURE_CLI.md](ARCHITECTURE_CLI.md)** | 🏗️ Architecture CLI et composants |
| **[TESTING_GUIDE.md](TESTING_GUIDE.md)** | 🧪 Tests et validation complète |
| **[PROJECT_README.md](PROJECT_README.md)** | 📖 Guide utilisateur et cas d'usage |
| **[AGENTS_LIST.md](AGENTS_LIST.md)** | 🤖 Liste des 29 agents (11 électriques) |

### Déploiement Production

| Document | Description |
|----------|-------------|
| **[PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md)** | 🚀 Déploiement en production |
| **[PRODUCTION_READY.md](PRODUCTION_READY.md)** | ✅ Checklist production-ready |

### Détails d'Implémentation

| Document | Description |
|----------|-------------|
| **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** | 📝 Résumé de l'implémentation |
| **[PROJECT_ARCHITECTURE.md](PROJECT_ARCHITECTURE.md)** | 🏛️ Architecture originale (référence) |

## 🏗️ Architecture CLI

### Vue d'Ensemble

```
┌─────────────────────────────────────────────────────────────────┐
│                      ELECTRON APPLICATION                        │
│  ┌──────────────┐              ┌──────────────────────────┐     │
│  │   Renderer   │◄────IPC─────►│      Main Process        │     │
│  │  (React UI)  │              │   (main-cli.js)          │     │
│  │              │              │                          │     │
│  │ • Chat Panel │              │ ┌──────────────────────┐ │     │
│  │ • Dashboard  │              │ │ Claude CLI Bridge    │ │     │
│  └──────────────┘              │ │                      │ │     │
│                                │ │ • Auth Management    │ │     │
│                                │ │ • Message Routing    │ │     │
│                                │ │ • Event Handling     │ │     │
│                                │ └──────────────────────┘ │     │
└────────────────────────────────┼──────────────────────────┼─────┘
                                 │                          │
                                 ▼                          ▼
                    ┌────────────────────────────────────────────┐
                    │    CLAUDE CODE CLI (Child Process)         │
                    │                                             │
                    │  • OAuth Authentication                     │
                    │  • Session Management                       │
                    │  • MCP Protocol Handler                     │
                    └─────────────────┬──────────────────────────┘
                                      │
                                      ▼
                    ┌─────────────────────────────────────────────┐
                    │         MCP SERVER (Node.js)                │
                    │      quebec-electrical v2.0.0               │
                    │                                             │
                    │  ┌─────────────────────────────────────┐   │
                    │  │  29 Agents (Tools)                  │   │
                    │  │  • 11 Electrical Agents             │   │
                    │  │  • 15 Development Agents            │   │
                    │  │  • 3 System Agents                  │   │
                    │  │  + PDF Processing Tools             │   │
                    │  │  + Knowledge Base Search            │   │
                    │  └─────────────────────────────────────┘   │
                    │                                             │
                    │  ┌─────────────┐  ┌─────────────────────┐  │
                    │  │ PDF Tools   │  │ Knowledge Tools     │  │
                    │  │ (Python)    │  │ (FAISS + Python)    │  │
                    │  └─────────────┘  └─────────────────────┘  │
                    └─────────────────────────────────────────────┘
                                      │
                                      ▼
                            ┌──────────────────┐
                            │  CLAUDE MAX API  │
                            │   (Anthropic)    │
                            └──────────────────┘
```

### Composants Clés

#### 1. **Electron Frontend** (`electron-app/`)
- Interface utilisateur React avec dual-panel
- Modal d'authentification OAuth
- Indicateur de statut CLI
- Gestion des événements IPC

#### 2. **Claude CLI Bridge** (`electron-app/main/claude-cli-bridge.js`)
- Pont entre Electron et Claude Code CLI
- Spawn et gestion du processus CLI
- Communication via stdin/stdout
- Event-driven architecture (EventEmitter)

#### 3. **CLI Manager** (`backend/services/claude-cli-manager.js`)
- Gestion du cycle de vie du CLI
- Authentification OAuth
- Configuration MCP
- Invocation des agents

#### 4. **MCP Server** (`mcp-server-quebec-electrical/`)
- Serveur Model Context Protocol v2.0.0
- Expose 33 outils (29 agents + 4 utilitaires)
- Intégration Python pour PDF et KB
- Conforme au standard MCP

## 🎓 Cas d'Usage

### Cas 1: Analyse de Plan Résidentiel

```javascript
// 1. Upload un plan PDF via drag & drop
// 2. Envoi message:
"Analyse ce plan résidentiel et génère la BOM complète"

// L'agent va:
// ✓ Analyser le PDF avec OCR
// ✓ Détecter tous les éléments (prises, interrupteurs, luminaires)
// ✓ Calculer les quantités
// ✓ Générer la nomenclature
// ✓ Vérifier la conformité CEQ
```

### Cas 2: Diagnostic de Problème

```javascript
// Message:
"Disjoncteur 15A se déclenche quand je branche l'aspirateur"

// Les agents vont:
// ✓ electrical-diagnostician: analyse le problème
// ✓ electrical-calculator: calcule les charges
// ✓ electrical-safety-specialist: vérifie les risques
// ✓ electrical-compliance-checker: valide les normes
// → Diagnostic complet avec solutions
```

### Cas 3: Planification de Projet

```javascript
// Message:
"Planifie l'installation électrique d'un restaurant 300m²"

// Les agents vont:
// ✓ electrical-project-manager: crée le plan de projet
// ✓ electrical-supply-manager: liste le matériel
// ✓ electrical-calculator: dimensionne l'installation
// ✓ electrical-site-planner: organise le chantier
// → Plan de projet complet
```

## 🛠️ Technologies

### Frontend
- **Electron** 28.0 - Framework desktop
- **React** 18 - Interface utilisateur
- **HTML5 Canvas** - Annotations PDF

### Backend
- **Node.js** - Runtime JavaScript
- **Claude Code CLI** - Interface Claude
- **MCP SDK** - Model Context Protocol
- **Express** - API REST (mode production)

### Services Python
- **PyMuPDF** (fitz) - Lecture PDF
- **pytesseract** - OCR
- **OpenCV** - Traitement images
- **FAISS** - Base vectorielle
- **sentence-transformers** - Embeddings

### Infrastructure
- **Docker** - Conteneurisation
- **Nginx** - Reverse proxy
- **PostgreSQL** - Base de données (production)
- **Redis** - Cache (production)

## 🔐 Sécurité

### Authentification
- ✅ OAuth 2.0 avec Claude Max
- ✅ Token sécurisé dans keychain système
- ✅ Session HTTPS uniquement
- ✅ Pas de clé API en clair

### Validation
- ✅ Sanitization des inputs
- ✅ Validation des PDFs uploadés
- ✅ Protection XSS
- ✅ Rate limiting (production)

### Données
- ✅ Chiffrement en transit (TLS)
- ✅ Permissions fichiers restrictives
- ✅ Logs sécurisés
- ✅ Backups automatiques (production)

## 📊 Performance

### Benchmarks

| Métrique | Valeur |
|----------|--------|
| Démarrage application | < 10s |
| Initialisation CLI | < 5s |
| Réponse agent (simple) | < 3s |
| Réponse agent (complexe) | < 10s |
| Upload PDF (5MB) | < 2s |
| Analyse PDF (10 pages) | < 30s |
| Utilisation mémoire | ~200-500MB |

### Optimisations
- ✅ Lazy loading des composants React
- ✅ Cache des réponses fréquentes
- ✅ Compression des requêtes
- ✅ Pooling des connexions
- ✅ Batching des requêtes MCP

## 🤝 Contribution

Contributions bienvenues! Merci de:

1. **Fork** le projet
2. **Créer** une branche (`git checkout -b feature/AmazingFeature`)
3. **Commit** vos changements (`git commit -m 'Add AmazingFeature'`)
4. **Push** vers la branche (`git push origin feature/AmazingFeature`)
5. **Ouvrir** une Pull Request

### Développement Local

```bash
# Mode développement avec DevTools
npm run dev

# Tests
npm test

# Linting
npm run lint

# Build
npm run build
```

## 📝 License

Ce projet est sous license **MIT**. Voir [LICENSE](LICENSE) pour plus de détails.

## 👥 Auteurs

- **F. Vegiard** - Développement initial

## 🙏 Remerciements

- **Anthropic** - Claude Code CLI et Claude Max
- **MCP Community** - Model Context Protocol
- **Code Électrique du Québec** - Normes et standards
- **RSST/RBQ** - Réglementations

## 📞 Support

### Documentation
- 📖 [CLI_INSTALLATION.md](CLI_INSTALLATION.md) - Installation complète
- 🏗️ [ARCHITECTURE_CLI.md](ARCHITECTURE_CLI.md) - Architecture détaillée
- 🧪 [TESTING_GUIDE.md](TESTING_GUIDE.md) - Guide de tests

### Issues
- 🐛 Signaler un bug: [GitHub Issues](https://github.com/your-org/quebec-electrical/issues)
- 💡 Proposer une fonctionnalité: [Feature Requests](https://github.com/your-org/quebec-electrical/issues)

### Contact
- 📧 Email: support@quebec-electrical.com
- 💬 Discord: [Rejoindre](https://discord.gg/quebec-electrical)

---

**Made with ⚡ in Québec** • **Powered by Claude Code CLI**

