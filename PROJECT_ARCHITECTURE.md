# Architecture du Système d'Agents Électriques Québécois

## Vue d'ensemble

Application Electron avec intégration Claude Code pour l'analyse de plans électriques québécois.

## Architecture

```
quebec-electrical-system/
├── electron-app/                 # Application Electron principale
│   ├── main/                     # Processus principal Electron
│   │   ├── main.js              # Point d'entrée Electron
│   │   ├── claude-api.js        # Intégration Claude Code API
│   │   └── window-manager.js    # Gestion des fenêtres
│   ├── renderer/                # Processus de rendu
│   │   ├── chat-panel/          # Panneau de chat
│   │   │   ├── ChatInterface.jsx
│   │   │   ├── MessageList.jsx
│   │   │   └── InputBox.jsx
│   │   ├── artifact-panel/      # Panneau d'artefacts/dashboard
│   │   │   ├── Dashboard.jsx
│   │   │   ├── PDFViewer.jsx
│   │   │   ├── BOMTable.jsx
│   │   │   └── PlanAnnotator.jsx
│   │   └── App.jsx              # Composant principal
│   └── package.json
│
├── backend/                      # Services backend
│   ├── claude-integration/       # Intégration Claude Code
│   │   ├── agent-orchestrator.js # Orchestration des agents
│   │   ├── claude-client.js      # Client API Claude
│   │   └── agent-configs/        # Configuration des 11 agents
│   │       ├── electrical-safety-quebec-specialist.yaml
│   │       ├── electrical-site-planner-quebec.yaml
│   │       ├── electrical-calculator-quebec.yaml
│   │       ├── electrical-project-manager-quebec.yaml
│   │       ├── electrical-diagnostician-quebec.yaml
│   │       ├── compliance-qc-manager-quebec.yaml
│   │       ├── electrical-supply-manager-quebec.yaml
│   │       ├── training-coordinator-quebec.yaml
│   │       ├── directive-tracker-quebec.yaml
│   │       ├── material-tracker-quebec.yaml
│   │       └── dashboard-creator-quebec.yaml
│   │
│   ├── pdf-processing/           # Traitement des PDF
│   │   ├── pdf-parser.py         # Extraction PDF
│   │   ├── ocr-engine.py         # OCR avec pytesseract/easyocr
│   │   ├── symbol-detector.py    # Détection de symboles (OpenCV/YOLO)
│   │   └── bom-generator.py      # Génération BOM
│   │
│   ├── knowledge-base/           # Base de connaissances FAISS
│   │   ├── faiss-manager.py      # Gestion FAISS
│   │   ├── embeddings.py         # Génération d'embeddings
│   │   └── quebec-norms/         # Normes québécoises
│   │       ├── CEQ/              # Code électrique du Québec
│   │       ├── RSST/             # Règlement santé et sécurité
│   │       ├── RBQ/              # Régie du bâtiment
│   │       └── CSA/              # Normes CSA
│   │
│   └── api/                      # API REST
│       ├── server.js             # Serveur Express
│       └── routes/
│           ├── agents.js         # Routes agents
│           ├── pdf.js            # Routes PDF
│           └── knowledge.js      # Routes base de connaissances
│
├── database/                     # Base de données
│   ├── postgres/                 # PostgreSQL
│   │   └── schema.sql            # Schéma DB
│   └── redis/                    # Cache et sessions
│       └── config.js
│
├── storage/                      # Stockage de fichiers
│   ├── uploads/                  # PDF uploadés
│   ├── processed/                # PDF traités
│   └── exports/                  # Exports BOM
│
└── docs/                         # Documentation
    ├── agents/                   # Documentation agents
    ├── api/                      # Documentation API
    └── norms/                    # Documentation normes

```

## Stack Technologique

### Frontend (Electron + React)
- **Electron**: ^28.0.0
- **React**: ^18.2.0
- **TypeScript**: ^5.0.0
- **Material-UI**: ^5.14.0
- **PDF.js**: Visualisation PDF
- **Fabric.js**: Annotation de plans
- **React-Dropzone**: Drag & drop

### Backend (Node.js + Python)
- **Node.js**: ^20.0.0
- **Express**: ^4.18.0
- **Python**: ^3.11
- **FastAPI**: API Python (pour traitement PDF)
- **PyMuPDF**: Manipulation PDF
- **OpenCV**: Détection d'images
- **pytesseract**: OCR
- **FAISS**: Base vectorielle

### Base de Données
- **PostgreSQL**: ^15.0 (données structurées)
- **Redis**: ^7.0 (cache)
- **FAISS**: Base vectorielle

### Intégration Claude Code
- **Anthropic API**: Pour appels Claude
- **WebSocket**: Communication temps réel

## Flux de Données

```
Utilisateur (Electron App)
    ↓
    [Drag & Drop PDF dans Dashboard]
    ↓
Frontend (Chat Panel + Artifact Panel)
    ↓
    [Upload via API]
    ↓
Backend API Server
    ↓
    [Orchestration]
    ↓
PDF Processing Service (Python)
    ├── OCR Extraction
    ├── Symbol Detection
    └── Data Extraction
    ↓
Knowledge Base (FAISS)
    ├── Quebec Norms Query
    └── Validation Rules
    ↓
Claude Agent Orchestrator
    ├── electrical-safety-quebec-specialist
    ├── electrical-calculator-quebec
    ├── compliance-qc-manager-quebec
    └── ... (8 autres agents)
    ↓
BOM Generator
    ↓
Results → Frontend Dashboard
    ├── Interactive PDF View
    ├── BOM Table
    ├── Compliance Report
    └── Chat with Agents
```

## Agents Électriques Québécois

### Groupe A: Agents Électriques (11)

1. **electrical-safety-quebec-specialist**
   - Expertise: CEQ, RSST, RBQ
   - Rôle: Validation sécurité

2. **electrical-site-planner-quebec**
   - Expertise: Planification chantier
   - Rôle: Organisation travaux

3. **electrical-calculator-quebec**
   - Expertise: Calculs CEQ
   - Rôle: Dimensionnement circuits

4. **electrical-project-manager-quebec**
   - Expertise: Gestion projet RBQ
   - Rôle: Coordination projet

5. **electrical-diagnostician-quebec**
   - Expertise: Diagnostic RSST
   - Rôle: Résolution problèmes

6. **compliance-qc-manager-quebec**
   - Expertise: CEQ/RBQ
   - Rôle: Conformité réglementaire

7. **electrical-supply-manager-quebec**
   - Expertise: Approvisionnement CSA
   - Rôle: Gestion matériel

8. **training-coordinator-quebec**
   - Expertise: Formation RSST/CEQ
   - Rôle: Montée en compétences

9. **directive-tracker-quebec**
   - Expertise: Suivi directives
   - Rôle: Application normes

10. **material-tracker-quebec**
    - Expertise: Suivi matériel CSA/CEQ
    - Rôle: Inventaire et spécifications

11. **dashboard-creator-quebec**
    - Expertise: Visualisation données
    - Rôle: Création dashboards

## Fonctionnalités Clés

### 1. Analyse de Plans PDF
- Upload par drag & drop
- OCR pour extraction de texte
- Détection de symboles électriques
- Reconnaissance de circuits
- Validation selon CEQ

### 2. Génération de BOM
- Extraction automatique de matériel
- Classification selon normes
- Quantification précise
- Spécifications CSA
- Export multi-formats

### 3. Dashboard Interactif
- Visualisation PDF annotée
- Chat avec agents en temps réel
- Affichage BOM dynamique
- Rapports de conformité
- Modifications interactives

### 4. Base de Connaissances
- Normes CEQ indexées
- Règlements RSST
- Exigences RBQ
- Standards CSA
- Recherche sémantique

### 5. Conformité Québécoise
- Validation CEQ automatique
- Vérification RSST
- Intégration RBQ
- Certification CSA
- Particularités hivernales

## Sécurité

- Chiffrement des fichiers
- Authentification JWT
- RBAC (électricien, contremaître, gestionnaire)
- Audit logging
- Conformité loi québécoise protection données

## Déploiement

- Docker containers
- PostgreSQL + Redis
- FAISS index
- API Gateway
- Load balancing

## Développement

### Phase 1: Infrastructure (En cours)
- ✅ Architecture définie
- ⏳ Electron app setup
- ⏳ Backend API setup
- ⏳ Database setup

### Phase 2: Agents
- Création des 11 agents
- Configuration Claude API
- Orchestration

### Phase 3: PDF Processing
- OCR implementation
- Symbol detection
- BOM generation

### Phase 4: Dashboard
- Interface Electron
- Chat panel
- Artifact panel

### Phase 5: Integration
- FAISS knowledge base
- Quebec norms integration
- End-to-end testing

### Phase 6: Production
- Optimization
- Security hardening
- Documentation
- Deployment
