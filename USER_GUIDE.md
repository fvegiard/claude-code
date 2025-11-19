# 📖 Quebec Electrical System - User Guide

Complete guide for using the Quebec Electrical System with Claude Code CLI and 11 specialized electrical agents.

## Table of Contents

- [Getting Started](#getting-started)
- [User Interface Overview](#user-interface-overview)
- [Working with Agents](#working-with-agents)
- [PDF Analysis](#pdf-analysis)
- [Common Tasks](#common-tasks)
- [Tips and Best Practices](#tips-and-best-practices)
- [Troubleshooting](#troubleshooting)

## Getting Started

### First Launch

1. **Start the application:**
   ```bash
   ./start.sh
   ```
   Or:
   ```bash
   cd electron-app && npm run dev
   ```

2. **Authentication Modal** appears automatically on first launch

3. **Click "Se connecter avec Claude Max"**

4. **Browser opens** to Anthropic OAuth page

5. **Login** with your Claude Max account credentials

6. **Authorize** the application

7. **Return** to the application (closes automatically)

8. **Status changes** to "✅ Claude CLI connecté"

### Main Interface

The application has **two main panels**:

**Left Panel - Chat**
- Communicate with AI agents
- Ask questions about electrical work
- Get code compliance checks
- Request calculations

**Right Panel - Dashboard**
- Upload and view PDF plans
- View generated BOM (Bill of Materials)
- See project metrics
- Access annotations

## User Interface Overview

### Header

```
⚡ Système d'Agents Électriques Québécois
[CLI Status] [11 agents actifs] [Processing indicator]
```

**CLI Status Indicators:**
- 🔄 Vérification... - Checking connection
- ✅ Claude CLI connecté - Connected and ready
- ⚠️ Non authentifié - Need to authenticate
- ❌ Erreur CLI - Error state

### Chat Panel

**Components:**
- **Message List**: Displays conversation history
- **Agent Selector**: Choose specific agent (optional)
- **Input Box**: Type your questions/requests
- **Send Button**: Submit message

**Message Types:**
- 👤 **User**: Your messages (blue background)
- 🤖 **Assistant**: Agent responses (gray background)
- ⚙️ **System**: Status messages (yellow background)
- 👨‍🔧 **Agent**: Specific agent response (purple background)

### Dashboard Panel

**Tabs:**
1. **📄 PDF Viewer**: View uploaded plans
2. **📊 BOM**: Bill of materials table
3. **📈 Metrics**: Project statistics
4. **✏️ Annotations**: Plan markup tools

## Working with Agents

### The 11 Electrical Agents

#### 1. Electrical Safety Specialist
**Use when:** Safety concerns, risk assessments, PPE requirements

**Example questions:**
```
Quels sont les EPI requis pour travailler sur un panneau 600V?

Analyse les risques de sécurité pour cette installation triphasée

Procédure de cadenassage pour maintenance d'un transformateur
```

**Agent provides:**
- Safety protocols per RSST
- Required PPE (Personal Protective Equipment)
- Lockout/tagout procedures
- Risk assessments

---

#### 2. Electrical Calculator
**Use when:** Load calculations, wire sizing, voltage drop

**Example questions:**
```
Calcule la charge totale pour 15 circuits de 15A et 8 circuits de 20A

Quelle section de conducteur pour 50A sur une distance de 30 mètres?

Calcule la chute de tension pour un câble #10 AWG sur 25m à 20A
```

**Agent provides:**
- Load calculations
- Wire/cable sizing recommendations
- Voltage drop calculations
- Ampacity tables per CEQ

---

#### 3. Electrical Compliance Checker
**Use when:** Code compliance verification, inspections

**Example questions:**
```
Vérifie la conformité CEQ d'une installation résidentielle 200A

Cette installation commerciale respecte-t-elle le RBQ?

Exigences CEQ pour circuits extérieurs avec GFCI
```

**Agent provides:**
- CEQ code references
- RBQ requirement checks
- CSA standard compliance
- Inspection checklist

---

#### 4. Electrical Project Manager
**Use when:** Project planning, resource management, scheduling

**Example questions:**
```
Planifie l'installation électrique d'un édifice commercial de 500m²

Crée un calendrier pour câblage complet d'une résidence

Estime les ressources pour installation de 50 luminaires LED
```

**Agent provides:**
- Project timelines
- Resource allocation
- Budget estimates
- Task breakdown

---

#### 5. Electrical Diagnostician
**Use when:** Troubleshooting, fault finding, problem diagnosis

**Example questions:**
```
Diagnostique: disjoncteur se déclenche quand je démarre le four

Pourquoi les lumières clignotent dans une section de la maison?

Circuit 20A se déclenche aléatoirement sans charge apparente
```

**Agent provides:**
- Problem diagnosis
- Possible causes
- Testing procedures
- Solutions and fixes

---

#### 6. Electrical Supply Manager
**Use when:** Material lists, procurement, inventory

**Example questions:**
```
Liste complète du matériel pour installation résidentielle 200A

Génère BOM pour 20 circuits mixtes (15A et 20A)

Matériel nécessaire pour installation temporaire de chantier
```

**Agent provides:**
- Complete BOM
- Material quantities
- Product specifications
- Supplier recommendations

---

#### 7. Electrical Training Coordinator
**Use when:** Training requirements, certifications, safety training

**Example questions:**
```
Programme de formation pour habilitation électrique haute tension

Certifications requises pour travailler sur installations triphasées

Formation continue pour mise à jour CEQ 2024
```

**Agent provides:**
- Training programs
- Certification requirements
- Safety course recommendations
- Continuing education paths

---

#### 8. Electrical Directive Tracker
**Use when:** Regulatory updates, code changes, compliance news

**Example questions:**
```
Changements récents au CEQ 2024

Nouvelles directives RBQ pour installations commerciales

Mises à jour RSST concernant la sécurité électrique
```

**Agent provides:**
- Recent code updates
- Regulatory changes
- Compliance deadlines
- Impact analysis

---

#### 9. Electrical Material Tracker
**Use when:** Inventory management, material tracking

**Example questions:**
```
Suivi de l'inventaire de câbles pour chantier de 300m²

Consommation de matériel par phase de projet

Alerte stock bas pour matériel critique
```

**Agent provides:**
- Inventory status
- Usage tracking
- Reorder alerts
- Material consumption reports

---

#### 10. Electrical Dashboard Creator
**Use when:** Metrics, KPIs, project visualization

**Example questions:**
```
Crée un tableau de bord pour suivi de projet résidentiel

Métriques de performance pour équipe de 5 électriciens

Dashboard de conformité et sécurité
```

**Agent provides:**
- Custom dashboards
- Key performance indicators
- Visual charts and graphs
- Progress tracking

---

#### 11. Electrical Site Planner
**Use when:** Site logistics, temporary installations, safety planning

**Example questions:**
```
Planifie installation électrique temporaire pour chantier

Disposition optimale des panneaux pour édifice commercial

Plan de sécurité électrique pour site de construction
```

**Agent provides:**
- Site layouts
- Temporary power planning
- Safety zone mapping
- Equipment placement

## PDF Analysis

### Uploading Plans

**Method 1: Drag and Drop**
1. Drag PDF file from your computer
2. Drop onto Dashboard panel
3. Wait for upload confirmation

**Method 2: Click to Upload**
1. Click "Upload PDF" button in Dashboard
2. Select file from file picker
3. Wait for upload

### Automatic Analysis

After upload, the system automatically:
1. Extracts text using OCR
2. Detects electrical symbols
3. Identifies components (outlets, switches, panels)
4. Counts elements
5. Generates preliminary BOM

**Messages you'll see:**
```
📄 Upload de plan-electrique.pdf...
✅ PDF "plan-electrique.pdf" chargé avec succès
🔍 Lancement de l'analyse automatique...
🤖 [Agent analyzing the plan...]
✅ Analyse terminée!
```

### Manual Analysis Commands

You can also request specific analysis:

```
Analyse détaillée du plan PDF que je viens d'uploader

Identifie tous les circuits de 15A dans ce plan

Compte les prises et interrupteurs par pièce

Vérifie la conformité CEQ de ce plan électrique
```

### BOM Generation

**Automatic:**
- Generated during PDF analysis

**Manual:**
```
Génère la BOM complète pour ce plan

Crée une nomenclature détaillée avec prix estimés

BOM avec références CSA pour tous les composants
```

**BOM Table includes:**
- Quantity
- Description
- Reference/Part Number
- Unit Price (estimated)
- Total Price
- Category (Cables, Outlets, Switches, Panels, etc.)

### Exporting BOM

1. Click "Export" button in BOM tab
2. Choose format (Excel, CSV, PDF)
3. Save to your computer

## Common Tasks

### Task 1: Residential Installation Planning

**Scenario:** Planning electrical installation for a new 150m² house

**Steps:**

1. **Ask for project plan:**
   ```
   Planifie l'installation électrique complète pour une maison résidentielle de 150m²
   ```

2. **Request load calculation:**
   ```
   Calcule la charge totale estimée pour cette résidence
   ```

3. **Get material list:**
   ```
   Liste complète du matériel nécessaire pour cette installation
   ```

4. **Verify compliance:**
   ```
   Vérifie que cette installation respecte le CEQ pour résidences
   ```

5. **Create timeline:**
   ```
   Crée un calendrier d'installation sur 2 semaines
   ```

---

### Task 2: Troubleshooting Circuit Problem

**Scenario:** Circuit breaker keeps tripping

**Steps:**

1. **Describe problem:**
   ```
   J'ai un disjoncteur de 15A qui se déclenche dès que je branche l'aspirateur
   ```

2. **Agent diagnoses** and asks for more info

3. **Provide details:**
   ```
   Circuit: 15A, 120V
   Fil: #14 AWG
   Longueur: environ 20 mètres
   Autres appareils sur le circuit: 2 lampes
   ```

4. **Get calculations:**
   ```
   Calcule la charge totale avec aspirateur 1200W + 2 lampes 60W
   ```

5. **Receive solution:**
   - Diagnosis: Circuit overload
   - Calculation shows total load exceeds 15A
   - Recommendation: Dedicated circuit for vacuum or upgrade to 20A

---

### Task 3: Analyzing Electrical Plan

**Scenario:** Review commercial building electrical plan

**Steps:**

1. **Upload PDF plan** via drag-and-drop

2. **Request detailed analysis:**
   ```
   Analyse ce plan commercial et identifie:
   - Tous les panneaux électriques
   - Total des circuits
   - Puissance totale installée
   - Points de conformité CEQ à vérifier
   ```

3. **Agent analyzes** and provides report

4. **Ask for BOM:**
   ```
   Génère la BOM complète avec quantités et références
   ```

5. **Check compliance:**
   ```
   Vérifie la conformité de ce plan avec CEQ et RBQ pour bâtiment commercial
   ```

6. **Export results:**
   - Click Export BOM
   - Save compliance checklist

---

### Task 4: Creating Safety Procedure

**Scenario:** Need lockout/tagout procedure for maintenance

**Steps:**

1. **Request procedure:**
   ```
   Crée une procédure de cadenassage pour maintenance d'un panneau 600V triphasé
   ```

2. **Get safety requirements:**
   ```
   Quels EPI sont obligatoires selon RSST pour cette intervention?
   ```

3. **Request training needs:**
   ```
   Quelle formation est requise pour effectuer cette maintenance?
   ```

4. **Get certification info:**
   ```
   Certifications nécessaires pour travailler sur 600V
   ```

---

### Task 5: Material Procurement

**Scenario:** Ordering materials for a project

**Steps:**

1. **Upload project plan** (PDF)

2. **Generate comprehensive BOM:**
   ```
   Génère BOM détaillée avec:
   - Quantités exactes
   - Références produits
   - Prix unitaires estimés
   - Total par catégorie
   - Fournisseurs recommandés au Québec
   ```

3. **Review BOM table** in Dashboard

4. **Request adjustments:**
   ```
   Ajoute 10% de surplus pour les câbles et connecteurs
   ```

5. **Export to Excel:**
   - Click Export → Excel
   - Open in spreadsheet
   - Send to supplier

## Tips and Best Practices

### Effective Communication with Agents

✅ **DO:**
- Be specific and detailed
- Provide context (residential, commercial, industrial)
- Include measurements and specifications
- Mention applicable codes (CEQ, RSST, RBQ)
- Ask follow-up questions

❌ **DON'T:**
- Be vague ("calculate something")
- Omit critical information (voltage, amperage)
- Assume agent knows your previous context
- Skip safety considerations

### Example - Good vs Bad Questions

**Bad:**
```
Combien de fils?
```

**Good:**
```
Pour un circuit de 20A, 120V sur une distance de 25 mètres,
quelle section de conducteur est requise selon le CEQ?
```

---

**Bad:**
```
C'est conforme?
```

**Good:**
```
Cette installation commerciale avec panneau 600V triphasé,
8 circuits de 20A et 4 circuits de 15A est-elle conforme
aux exigences CEQ et RBQ pour un bâtiment commercial?
```

### Working with Multiple Agents

You can involve multiple agents in one conversation:

1. **Safety Specialist** for risk assessment
2. **Calculator** for load calculations
3. **Compliance Checker** for code verification
4. **Project Manager** for timeline

**Example conversation:**
```
[You]: Planifie installation électrique pour restaurant 200m²

[Project Manager]: Voici le plan de projet...

[You]: Maintenant calcule la charge totale estimée

[Calculator]: Charge totale: 35kW, voici les détails...

[You]: Vérifie la conformité CEQ pour restaurant

[Compliance Checker]: Exigences spécifiques pour restaurant...

[You]: Quelles sont les mesures de sécurité pendant installation?

[Safety Specialist]: Procédures de sécurité RSST...
```

### Saving Your Work

- **Conversations** are saved in session
- **BOM exports** can be saved as files
- **PDF annotations** can be exported
- **Take screenshots** of important responses

### Keyboard Shortcuts

- `Enter`: Send message
- `Shift+Enter`: New line in message
- `Ctrl+C`: Copy selected text
- `Ctrl+V`: Paste
- `Ctrl+F`: Find in conversation

## Troubleshooting

### "CLI not authenticated"

**Problem:** Can't use agents, auth modal appears

**Solution:**
1. Click "Se connecter avec Claude Max"
2. Complete OAuth flow in browser
3. Return to application

---

### "Agent not responding"

**Problem:** No response after sending message

**Solution:**
1. Check CLI status indicator
2. Verify internet connection
3. Try rephrasing question
4. Restart application if needed

---

### "PDF analysis failed"

**Problem:** PDF upload succeeded but analysis failed

**Solution:**
1. Check PDF is valid electrical plan
2. Verify OCR can read text (not too blurry)
3. Try uploading again
4. Check logs for Python errors

---

### "BOM not generating"

**Problem:** Analysis completes but no BOM

**Solution:**
1. Ensure PDF contains detectable elements
2. Manually request BOM: `Génère la BOM pour ce plan`
3. Check if plan has symbols (not just text)

---

### "Slow response times"

**Problem:** Agents take too long to respond

**Solution:**
1. Check internet connection speed
2. Verify Claude Max subscription is active
3. Close other applications using bandwidth
4. Simplify questions (break into smaller parts)

---

### "Connection lost"

**Problem:** "Session CLI fermée" error

**Solution:**
1. Check CLI status indicator
2. Click "Se connecter" if shown
3. Restart application
4. Verify `claude` command works in terminal

## Advanced Features

### Custom Agent Invocation

You can invoke specific agents directly:

```javascript
// In DevTools console
await window.ipcRenderer.invoke('invoke-agent', {
  agentName: 'electrical-calculator',
  task: 'Calculate load for 10x 15A circuits'
});
```

### Knowledge Base Search

Search Quebec electrical norms directly:

```
Recherche dans les normes CEQ: "protection différentielle 30mA"

Trouve les articles RBQ concernant installations commerciales

Normes CSA pour panneaux extérieurs
```

### Batch Processing

Upload multiple PDFs for analysis:

1. Upload first PDF
2. Wait for analysis
3. Upload second PDF
4. Compare results

### Export Options

- **BOM**: Excel, CSV, PDF
- **Conversations**: Copy/paste or screenshot
- **Plans**: Annotated PDF
- **Reports**: Generate via agents

## Getting Help

### In-App Help

- Hover over UI elements for tooltips
- Click "?" icon for contextual help
- View system messages for guidance

### Documentation

- **README.md**: Project overview
- **CLI_INSTALLATION.md**: Installation guide
- **TESTING_GUIDE.md**: Testing procedures
- **ARCHITECTURE_CLI.md**: Technical details

### Community & Support

- GitHub Issues: Bug reports and feature requests
- GitHub Discussions: Questions and community help
- Documentation: Comprehensive guides

## Next Steps

Now that you know how to use the system:

1. **Try all 11 agents** - Get familiar with each specialty
2. **Upload sample PDFs** - Test analysis features
3. **Generate BOMs** - Practice material planning
4. **Explore compliance** - Learn code requirements
5. **Create projects** - Use for real electrical work

---

**Happy Electrical Engineering! ⚡**

For more information, see [README.md](README.md) and other documentation files.
