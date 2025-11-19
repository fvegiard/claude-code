# ⚡ Système d'Agents Électriques Québécois

Application Electron avec intégration Claude Code pour l'analyse automatisée de plans électriques conformes aux normes québécoises (CEQ, RSST, RBQ, CSA).

## 🎯 Vue d'ensemble

Ce système offre une solution complète pour l'analyse de plans électriques avec:
- **11 agents spécialisés** Claude Code pour le contexte québécois
- **Analyse automatique de PDF** avec OCR et détection de symboles
- **Génération de BOM** (Bill of Materials) automatique
- **Vérification de conformité** CEQ, RSST, RBQ, CSA
- **Interface Electron** avec deux panneaux (chat + dashboard)
- **Base de connaissances FAISS** pour les normes québécoises

## ✨ Caractéristiques principales

### Frontend (Electron)
- **Panneau de chat**: Communication avec les 11 agents électriques
- **Panneau d'artefacts**: Dashboard interactif avec:
  - Visualisation PDF annotée
  - Tableau BOM dynamique
  - Rapports de conformité
  - Drag & drop de fichiers PDF

### Backend (Claude Code + Node.js + Python)
- **API REST** pour orchestration des agents
- **Traitement PDF** avec OCR (pytesseract, PyMuPDF)
- **Base FAISS** pour recherche sémantique dans les normes
- **WebSocket** pour communication temps réel
- **Agents spécialisés** avec prompts système québécois

## 📦 Installation rapide

```bash
# 1. Installer les dépendances backend
cd backend
npm install
pip3 install -r requirements.txt

# 2. Installer les dépendances Electron
cd ../electron-app
npm install

# 3. Configuration
cp ../.env.example ../.env
# Éditer .env et ajouter votre clé API Anthropic

# 4. Démarrer le backend
cd ../backend
npm start

# 5. Démarrer l'application Electron (nouveau terminal)
cd ../electron-app
npm start
```

## 🤖 Les 11 Agents Électriques Québécois

1. **electrical-safety-quebec-specialist** - Sécurité CEQ/RSST/RBQ
2. **electrical-calculator-quebec** - Calculs et dimensionnement CEQ
3. **compliance-qc-manager-quebec** - Conformité CEQ/RBQ
4. **electrical-project-manager-quebec** - Gestion de projet RBQ
5. **electrical-diagnostician-quebec** - Diagnostic et dépannage
6. **electrical-supply-manager-quebec** - Approvisionnements CSA
7. **training-coordinator-quebec** - Formation RSST/CEQ
8. **directive-tracker-quebec** - Suivi de directives
9. **material-tracker-quebec** - Suivi de matériel CSA/CEQ
10. **dashboard-creator-quebec** - Création de dashboards
11. **electrical-site-planner-quebec** - Planification de chantier

## 🚀 Utilisation

1. Démarrer le système (backend + Electron)
2. Glisser-déposer un plan PDF dans le panneau de droite
3. L'analyse automatique démarre avec les agents
4. Consulter la BOM générée et les rapports de conformité
5. Interagir avec les agents via le chat pour des questions spécifiques

## 📁 Structure du projet

```
quebec-electrical-system/
├── electron-app/                 # Application Electron
│   ├── main/                     # Processus principal
│   │   ├── main.js              # Point d'entrée
│   │   ├── claude-api.js        # Intégration Claude
│   │   └── window-manager.js    # Gestion fenêtres
│   └── renderer/                # Interface utilisateur
│       ├── chat-panel/          # Panneau de chat
│       ├── artifact-panel/      # Panneau dashboard
│       └── components/          # Composants React
│
├── backend/                      # Backend API
│   ├── api/                      # Serveur Express
│   │   ├── server.js            # Serveur principal
│   │   └── routes/              # Routes API
│   ├── claude-integration/       # Configuration agents
│   ├── pdf-processing/          # Traitement PDF (Python)
│   │   ├── pdf-parser.py        # Parser PDF
│   │   ├── ocr-engine.py        # OCR
│   │   └── symbol-detector.py   # Détection symboles
│   └── knowledge-base/          # Base FAISS
│       ├── faiss-manager.py     # Gestionnaire FAISS
│       └── quebec-norms/        # Normes québécoises
│
├── database/                     # Schémas base de données
├── storage/                      # Stockage fichiers
└── docs/                         # Documentation
```

## 🔧 Configuration (.env)

```env
# API Anthropic
ANTHROPIC_API_KEY=your_api_key_here

# Backend
BACKEND_URL=http://localhost:3000
PORT=3000

# Paths
UPLOAD_DIR=./storage/uploads
PROCESSED_DIR=./storage/processed
EXPORT_DIR=./storage/exports
```

## 📡 API Endpoints

### Agents
- `GET /api/agents` - Liste des 11 agents
- `POST /api/agents/:name/invoke` - Invoquer un agent spécifique
- `POST /api/agents/orchestrate` - Orchestrer plusieurs agents

### PDF
- `POST /api/pdf/upload` - Upload un plan PDF
- `POST /api/pdf/analyze` - Analyser avec les agents
- `GET /api/pdf/:id/bom` - Obtenir la BOM générée
- `POST /api/pdf/compliance` - Vérifier conformité CEQ/RBQ
- `POST /api/pdf/:id/export` - Exporter BOM (CSV/Excel/PDF)

### Base de connaissances
- `POST /api/knowledge/search` - Rechercher dans CEQ/RSST/RBQ/CSA
- `GET /api/knowledge/categories` - Catégories disponibles
- `GET /api/knowledge/article/:id` - Article spécifique

## ✅ Conformité Québécoise

- ✅ **Code électrique du Québec (CEQ)** - Édition 2024
- ✅ **RSST** - Règlement santé et sécurité du travail
- ✅ **RBQ** - Régie du bâtiment du Québec
- ✅ **CSA** - Normes canadiennes
- ✅ **Particularités hivernales** - Matériel certifié -40°C
- ✅ **Exigences spécifiques** - Cuisinière ≥5000W, etc.

## 🎓 Exemples d'utilisation

**Dans le chat:**
```
"Vérifie la conformité CEQ de ce plan"
"Calcule la charge totale selon le CEQ"
"Génère un rapport RBQ pour inspection"
"Identifie les risques de sécurité RSST"
"Liste le matériel requis certifié CSA"
```

## 🛠️ Développement

```bash
# Backend development
cd backend
npm run dev

# Tests
npm test

# Build Electron app
cd electron-app
npm run build
```

## 📝 Licence

MIT License

## 🤝 Contribution

Les contributions sont bienvenues! Créez une issue ou un pull request.

## 📞 Support

- GitHub Issues: Pour bugs et feature requests
- Documentation: Voir dossier `/docs`

---

**Version**: 1.0.0
**Auteur**: F. Vegiard
**Propulsé par**: Claude Code (Anthropic)
