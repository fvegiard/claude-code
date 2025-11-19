# 🧪 Guide de Tests - Système d'Agents Électriques Québécois

Guide complet pour tester l'intégration Claude Code CLI et vérifier le bon fonctionnement du système.

## 📋 Table des Matières

- [Tests de Base](#tests-de-base)
- [Tests d'Authentification](#tests-dauthentification)
- [Tests des Agents](#tests-des-agents)
- [Tests PDF](#tests-pdf)
- [Tests MCP Server](#tests-mcp-server)
- [Tests de Performance](#tests-de-performance)
- [Tests de Sécurité](#tests-de-sécurité)
- [Scénarios d'Utilisation Complets](#scénarios-dutilisation-complets)

## ✅ Tests de Base

### 1. Vérification de l'Installation

**Test**: Vérifier que tous les composants sont installés

```bash
# Vérifier Node.js
node --version
# Attendu: v18.x.x ou supérieur

# Vérifier Python
python3 --version
# Attendu: Python 3.8.x ou supérieur

# Vérifier Claude CLI
claude --version
# Attendu: Claude Code CLI v1.x.x

# Vérifier les dépendances npm
cd electron-app && npm list
cd ../mcp-server-quebec-electrical && npm list
```

**Résultat attendu**: ✅ Toutes les commandes retournent des versions valides

### 2. Vérification de la Configuration

**Test**: Vérifier la configuration MCP

```bash
# Afficher la config
cat .claude/config.json

# Vérifier que le MCP server est configuré
grep "quebec-electrical" .claude/config.json
```

**Résultat attendu**: ✅ Le fichier contient la configuration du serveur MCP

### 3. Lancement de l'Application

**Test**: Démarrer l'application en mode dev

```bash
cd electron-app
npm run dev
```

**Résultat attendu**:
- ✅ Fenêtre Electron s'ouvre
- ✅ DevTools sont ouvertes
- ✅ Aucune erreur dans la console
- ✅ Interface affiche les 2 panneaux (chat + dashboard)

## 🔐 Tests d'Authentification

### 1. Premier Lancement (Non Authentifié)

**Test**: Lancer l'app sans authentification préalable

**Actions**:
1. Lancer l'application
2. Observer l'interface

**Résultat attendu**:
- ✅ Modal d'authentification apparaît automatiquement
- ✅ Statut CLI affiche: "⚠️ Non authentifié"
- ✅ Bouton "Se connecter avec Claude Max" visible
- ✅ Panneau de chat affiche message: "⚠️ CLI non initialisé. Veuillez vous authentifier."

### 2. Processus d'Authentification OAuth

**Test**: Compléter le flow d'authentification

**Actions**:
1. Cliquer sur "Se connecter avec Claude Max"
2. Observer le navigateur qui s'ouvre
3. Se connecter avec compte Anthropic
4. Autoriser l'accès
5. Revenir à l'application

**Résultat attendu**:
- ✅ Navigateur s'ouvre à l'URL OAuth
- ✅ Page Anthropic charge correctement
- ✅ Après autorisation, modal affiche "✅ Authentification réussie!"
- ✅ Modal se ferme automatiquement
- ✅ Statut CLI change à: "✅ Claude CLI connecté"
- ✅ Message système: "✅ Claude Code CLI prêt"

### 3. Session Persistante

**Test**: Vérifier que l'auth persiste après redémarrage

**Actions**:
1. Fermer l'application
2. Relancer l'application
3. Observer le statut

**Résultat attendu**:
- ✅ Pas de modal d'authentification
- ✅ Statut CLI: "✅ Claude CLI connecté"
- ✅ Application prête immédiatement

### 4. Déconnexion et Reconnexion

**Test**: Tester le cycle déconnexion/reconnexion

**Actions**:
1. Déconnecter via CLI: `claude auth logout`
2. Relancer l'application
3. Se reconnecter

**Résultat attendu**:
- ✅ Modal d'authentification réapparaît
- ✅ Processus OAuth fonctionne
- ✅ Reconnexion réussie

## 🤖 Tests des Agents

### 1. Chargement des Agents

**Test**: Vérifier que les 11 agents sont chargés

**Actions**:
1. Lancer l'application (authentifié)
2. Observer le header

**Résultat attendu**:
- ✅ Affiche: "11 agents actifs"
- ✅ Message système: "11 agents chargés et prêts"

### 2. Test Agent Calculateur

**Test**: Invoquer l'agent electrical-calculator

**Message à envoyer**:
```
Calcule la charge électrique pour un circuit de 15A à 120V
```

**Résultat attendu**:
- ✅ Réponse inclut: "1800W" (15A × 120V)
- ✅ Mention des normes CEQ
- ✅ Recommandations de sécurité
- ✅ Message affiché comme type 'assistant'

### 3. Test Agent Sécurité

**Test**: Invoquer l'agent electrical-safety-specialist

**Message à envoyer**:
```
Quels sont les EPI requis pour travailler sur un panneau électrique de 600V?
```

**Résultat attendu**:
- ✅ Liste des EPI (gants isolants, lunettes, casque, etc.)
- ✅ Référence au RSST
- ✅ Normes de sécurité CEQ
- ✅ Procédures de cadenassage/étiquetage

### 4. Test Agent Conformité

**Test**: Invoquer l'agent electrical-compliance-checker

**Message à envoyer**:
```
Vérifie la conformité d'un circuit extérieur avec GFCI
```

**Résultat attendu**:
- ✅ Vérifie exigences CEQ pour circuits extérieurs
- ✅ Mention obligatoire GFCI/DDFT
- ✅ Spécifications météo/étanchéité
- ✅ Codes de référence (CEQ sections)

### 5. Test Invocation Directe

**Test**: Utiliser la fonction handleInvokeAgent

**Actions**:
1. Dans DevTools console:
```javascript
// Simuler invocation directe
ipcRenderer.invoke('invoke-agent', {
    agentName: 'electrical-calculator',
    task: 'Calcule la section de conducteur pour 50A sur 30m'
})
```

**Résultat attendu**:
- ✅ Réponse avec calcul de chute de tension
- ✅ Recommandation de section (AWG ou mm²)
- ✅ Référence aux tableaux CEQ

### 6. Test de Tous les Agents

**Test**: Vérifier que chacun des 11 agents répond

**Messages à envoyer** (un par un):

1. **electrical-safety-specialist**: "Risques électriques d'un panneau 347/600V"
2. **electrical-calculator**: "Calcule charge totale: 10 circuits 15A, 5 circuits 20A"
3. **electrical-compliance-checker**: "Conformité d'une installation commerciale 3 phases"
4. **electrical-project-manager**: "Planifie installation 50 luminaires LED"
5. **electrical-diagnostician**: "Diagnostique: disjoncteur se déclenche aléatoirement"
6. **electrical-supply-manager**: "Liste matériel pour installation résidentielle 200A"
7. **electrical-training-coordinator**: "Programme formation habilitation électrique"
8. **electrical-directive-tracker**: "Changements récents CEQ 2024"
9. **electrical-material-tracker**: "Inventaire câbles pour chantier 500m²"
10. **electrical-dashboard-creator**: "Crée tableau de bord suivi énergétique"
11. **electrical-site-planner**: "Planifie installation temporaire chantier"

**Résultat attendu pour chaque agent**:
- ✅ Réponse spécifique à sa spécialité
- ✅ Référence aux normes appropriées (CEQ, RSST, RBQ, CSA)
- ✅ Pas d'erreur
- ✅ Temps de réponse < 10 secondes

## 📄 Tests PDF

### 1. Upload PDF Simple

**Test**: Téléverser un PDF de plan électrique

**Actions**:
1. Préparer un fichier PDF (plan électrique)
2. Glisser-déposer dans le panneau Dashboard
3. Observer les messages

**Résultat attendu**:
- ✅ Message: "📄 Upload de [nom].pdf..."
- ✅ Message: "✅ PDF '[nom].pdf' chargé avec succès"
- ✅ Message: "🔍 Lancement de l'analyse automatique..."
- ✅ PDF apparaît dans le viewer

### 2. Analyse PDF avec OCR

**Test**: Analyser un PDF scanné (image)

**Actions**:
1. Upload un PDF scanné (contenant des images de plans)
2. Observer l'analyse

**Résultat attendu**:
- ✅ OCR détecte le texte dans l'image
- ✅ Extraction des éléments électriques
- ✅ Détection des symboles (prises, interrupteurs, panneaux)
- ✅ Message de complétion

### 3. Génération BOM Automatique

**Test**: Générer une nomenclature à partir d'un plan

**Message à envoyer** (après upload):
```
Génère une BOM complète pour ce plan électrique
```

**Résultat attendu**:
- ✅ Tableau BOM apparaît dans le dashboard
- ✅ Colonnes: Quantité, Description, Référence, Prix unitaire
- ✅ Catégories: Câbles, Prises, Interrupteurs, Panneaux, etc.
- ✅ Total calculé

### 4. Annotations sur Plan

**Test**: Annoter un plan PDF

**Actions**:
1. Charger un PDF
2. Utiliser les outils d'annotation (si disponibles)
3. Ajouter des notes/marqueurs

**Résultat attendu**:
- ✅ Annotations s'affichent sur le plan
- ✅ Possibilité de sauvegarder
- ✅ Annotations persistantes

## 🔧 Tests MCP Server

### 1. Vérification du Serveur

**Test**: Tester le MCP server directement

```bash
cd mcp-server-quebec-electrical
node index.js
```

**Résultat attendu**:
```
MCP Server Quebec Electrical démarré
Serveur: quebec-electrical
Version: 1.0.0
15 outils disponibles
```

### 2. Test des Outils MCP

**Test**: Invoquer chaque outil MCP via messages

**Messages à envoyer**:

1. **search_quebec_norms**:
```
Recherche dans les normes CEQ: "protection différentielle 30mA"
```

2. **get_ceq_article**:
```
Récupère l'article CEQ concernant les circuits de cuisine
```

3. **analyze_electrical_pdf** (après upload):
```
Analyse détaillée du PDF uploadé
```

4. **generate_bom** (après analyse):
```
Génère la BOM du plan analysé
```

**Résultat attendu pour chaque outil**:
- ✅ Outil invoqué correctement
- ✅ Réponse structurée
- ✅ Pas d'erreur de communication

### 3. Test de Connexion MCP

**Test**: Vérifier la communication Electron ↔ CLI ↔ MCP

**Actions**:
1. Envoyer un message invoquant un agent
2. Observer dans DevTools:
   - IPC message vers backend
   - Bridge vers CLI
   - CLI vers MCP server
   - Réponse retour

**Résultat attendu**:
- ✅ Chaîne complète fonctionne
- ✅ Latence acceptable (< 5s)
- ✅ Pas de perte de données

## 🚀 Tests de Performance

### 1. Temps de Démarrage

**Test**: Mesurer le temps de lancement

**Actions**:
1. Fermer l'application
2. Chronométrer le temps de `npm start` jusqu'à "Claude Code CLI prêt"

**Résultat attendu**:
- ✅ Démarrage < 10 secondes
- ✅ CLI initialisé < 5 secondes
- ✅ Agents chargés < 2 secondes

### 2. Temps de Réponse Agents

**Test**: Mesurer latence des agents

**Actions**:
1. Envoyer 10 messages consécutifs
2. Mesurer le temps de chaque réponse

**Résultat attendu**:
- ✅ Première réponse < 5 secondes
- ✅ Réponses suivantes < 3 secondes
- ✅ Pas de dégradation progressive

### 3. Traitement PDF Volumineux

**Test**: Upload et analyse d'un gros PDF (>10MB, >50 pages)

**Actions**:
1. Upload un plan électrique complet (multi-pages)
2. Observer le temps de traitement

**Résultat attendu**:
- ✅ Upload réussi
- ✅ Traitement < 30 secondes par page
- ✅ Pas de freeze de l'interface
- ✅ Progression visible

### 4. Utilisation Mémoire

**Test**: Vérifier l'utilisation mémoire

**Actions**:
1. Ouvrir le Gestionnaire de tâches / Activity Monitor
2. Observer la mémoire utilisée par Electron
3. Upload plusieurs PDFs
4. Invoquer plusieurs agents

**Résultat attendu**:
- ✅ Mémoire initiale < 200MB
- ✅ Après 10 PDFs < 500MB
- ✅ Pas de fuite mémoire (pas d'augmentation continue)

## 🔒 Tests de Sécurité

### 1. Authentification Sécurisée

**Test**: Vérifier la sécurité OAuth

**Vérifications**:
- ✅ Token stocké de façon sécurisée
- ✅ HTTPS pour les requêtes OAuth
- ✅ Pas de token dans les logs
- ✅ Expiration du token gérée

### 2. Validation des Entrées

**Test**: Envoyer des inputs malveillants

**Messages à envoyer**:
```javascript
// Injection script
<script>alert('XSS')</script>

// Injection SQL (même si pas applicable)
'; DROP TABLE users; --

// Path traversal
../../etc/passwd

// Command injection
; cat /etc/passwd
```

**Résultat attendu**:
- ✅ Tous les inputs sont sanitisés
- ✅ Aucun script exécuté
- ✅ Aucun accès système non autorisé
- ✅ Messages d'erreur appropriés

### 3. Permissions Fichiers

**Test**: Vérifier les permissions des fichiers uploadés

**Actions**:
1. Upload un fichier
2. Vérifier les permissions du fichier dans storage/uploads

**Résultat attendu**:
- ✅ Permissions restrictives (644 ou moins)
- ✅ Propriétaire correct
- ✅ Pas d'exécution possible

## 🎯 Scénarios d'Utilisation Complets

### Scénario 1: Analyse Complète d'un Plan Résidentiel

**Objectif**: Analyser un plan de maison et générer la BOM complète

**Étapes**:
1. Démarrer l'application
2. S'authentifier avec Claude Max
3. Upload plan électrique résidentiel (PDF)
4. Message: "Analyse ce plan et identifie tous les circuits"
5. Message: "Génère la BOM complète avec quantités et références"
6. Message: "Vérifie la conformité CEQ pour une résidence"
7. Message: "Calcule le coût total estimé"

**Résultat attendu**:
- ✅ Plan analysé avec tous les éléments identifiés
- ✅ BOM complète générée
- ✅ Vérification de conformité effectuée
- ✅ Estimation de coût fournie
- ✅ Rapport complet téléchargeable

### Scénario 2: Diagnostic d'un Problème Électrique

**Objectif**: Diagnostiquer un problème et proposer solutions

**Étapes**:
1. Message: "J'ai un disjoncteur qui se déclenche dès que j'utilise le four et le micro-ondes ensemble"
2. Agent diagnostician analyse
3. Message: "Calcule la charge totale de ces appareils"
4. Message: "Propose des solutions conformes au CEQ"

**Résultat attendu**:
- ✅ Diagnostic: surcharge du circuit
- ✅ Calcul de charge fourni
- ✅ Solutions proposées (nouveau circuit dédié, upgrade panneau, etc.)
- ✅ Conformité CEQ vérifiée

### Scénario 3: Planification de Projet Commercial

**Objectif**: Planifier l'installation électrique d'un local commercial

**Étapes**:
1. Upload plan du local (PDF)
2. Message: "Planifie l'installation électrique pour un restaurant de 200m²"
3. Message: "Liste tout le matériel nécessaire"
4. Message: "Crée un calendrier d'installation"
5. Message: "Génère le tableau de bord de suivi"

**Résultat attendu**:
- ✅ Plan d'installation détaillé
- ✅ Liste de matériel complète
- ✅ Calendrier avec étapes
- ✅ Dashboard de suivi créé
- ✅ Conformité RBQ vérifiée

## 📊 Checklist de Tests Complète

### Installation
- [ ] Node.js installé (≥18.x)
- [ ] Python installé (≥3.8)
- [ ] Claude CLI installé
- [ ] Dépendances npm installées
- [ ] Dépendances Python installées
- [ ] Répertoires créés

### Authentification
- [ ] Modal d'auth apparaît au premier lancement
- [ ] OAuth fonctionne
- [ ] Authentification réussie
- [ ] Session persiste après redémarrage
- [ ] Déconnexion/reconnexion fonctionne

### Agents
- [ ] 11 agents chargés
- [ ] Chaque agent répond correctement
- [ ] Réponses conformes aux normes
- [ ] Pas d'erreur d'invocation
- [ ] Temps de réponse acceptable

### PDF
- [ ] Upload fonctionne
- [ ] OCR détecte le texte
- [ ] Analyse extrait les éléments
- [ ] BOM générée correctement
- [ ] Annotations fonctionnent

### MCP Server
- [ ] Serveur démarre
- [ ] 15 outils disponibles
- [ ] Communication CLI ↔ MCP fonctionne
- [ ] Pas d'erreur de protocol

### Performance
- [ ] Démarrage < 10s
- [ ] Réponse agents < 5s
- [ ] PDF traité en temps raisonnable
- [ ] Mémoire stable

### Sécurité
- [ ] Auth sécurisée (HTTPS, token protégé)
- [ ] Inputs sanitisés
- [ ] Permissions fichiers correctes
- [ ] Pas de vulnérabilités XSS/injection

## 📝 Rapport de Tests

Après avoir complété tous les tests, créer un rapport:

```markdown
# Rapport de Tests - [Date]

## Environnement
- OS: [Windows/Mac/Linux + version]
- Node.js: [version]
- Python: [version]
- Claude CLI: [version]

## Résultats
- Tests réussis: X/Y
- Tests échoués: [liste]
- Problèmes identifiés: [description]

## Performance
- Temps démarrage: Xs
- Temps réponse moyen: Xs
- Utilisation mémoire: XMB

## Recommandations
- [Liste des améliorations]
```

---

**Version**: 1.0.0
**Dernière mise à jour**: 2024-11-19
