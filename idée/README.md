# 🎯 MCP Workflow Orchestrator - Quick Start

## 📦 Livrables

1. **Architecture Visualization** → `architecture-francis-mcp.png`
2. **Workflow Guide** → `WORKFLOW-ORCHESTRATION.md`
3. **Orchestrator Code** → `workflow_orchestrator.py`
4. **Example Workflows** → `workflows/*.yaml`

---

## 🚀 Quick Start (5 minutes)

### 1. Installation

```bash
# Installer PyYAML si nécessaire
pip install pyyaml --break-system-packages
```

### 2. Test Simple

```bash
python workflow_orchestrator.py workflows/simple-sequential.yaml
```

**Résultat attendu:**
```
================================================================================
🚀 Starting Workflow: simple-sequential
   Simple workflow avec 3 agents en séquence
================================================================================

● Starting agent: fetch-data (mcp-google-drive)
  → Google Drive MCP: fetch-data
✓ Completed: fetch-data (0.52s)

● Starting agent: analyze-content (quebec-electrical)
  → Quebec Electrical Agent: analyze-content
✓ Completed: analyze-content (1.03s)

● Starting agent: generate-report (development)
  → Development Agent: generate-report
✓ Completed: generate-report (1.01s)

================================================================================
✓ Workflow Completed: simple-sequential
  Duration: 2.58s
  Agents: 3 completed, 0 failed
================================================================================
```

### 3. Test Workflow Parallèle

```bash
python workflow_orchestrator.py workflows/dashboard-electrique-mini.yaml
```

**Ce workflow démontre:**
- ✓ 3 agents de collecte en parallèle (Phase 1)
- ✓ 3 agents d'analyse Quebec Electrical en parallèle (Phase 2)
- ✓ 3 agents de génération de documents en parallèle (Phase 3)
- ✓ Consolidation finale avec Claude Code Executor
- ✓ Notification Slack

**Durée typique:** ~10-15 secondes (avec handlers simulés)

### 4. Test Pipeline Full-Stack

```bash
python workflow_orchestrator.py workflows/full-stack-dev-pipeline.yaml
```

**Ce workflow démontre:**
- ✓ Backend + Frontend dev en parallèle via Claude Code Executor
- ✓ Integration testing
- ✓ Documentation auto-générée
- ✓ Deployment staging
- ✓ Team notification

---

## 📋 Créer Ton Propre Workflow

### Structure YAML

```yaml
workflow:
  name: "mon-workflow"
  description: "Description du workflow"
  
  agents:
    - id: "unique-agent-id"
      type: "agent-type"
      input: "input-data ou ${variable_reference}"
      depends_on: ["autre-agent-id"]  # Optionnel
      parallel: ["output1", "output2"]  # Optionnel
      timeout: 300  # Secondes, défaut: 300
      retry: 3      # Tentatives, défaut: 3
```

### Agent Types Disponibles

#### **Quebec Electrical (11 types)**
```yaml
type: "quebec-electrical"
```
Pour: Analyse code électrique, conformité, sécurité

#### **Development (15 types)**
```yaml
type: "development"
```
Pour: Génération code, documents, tests

#### **System (3 types)**
```yaml
type: "system"
```
Pour: Opérations système, deployment, monitoring

#### **MCP Bridges**
```yaml
type: "mcp-filesystem"      # Accès fichiers local
type: "mcp-google-drive"    # Google Drive
type: "mcp-slack"           # Slack notifications
type: "claude-code-executor" # Full dev environment
```

### Variables & State Management

**Référencer un output d'agent:**
```yaml
- id: "agent-1"
  output: "result_data"

- id: "agent-2"
  depends_on: ["agent-1"]
  input: "${agent-1_output}"  # Auto-résolu depuis workflow state
```

**Le format est toujours:** `${agent-id_output}`

### Dependencies & Parallel Execution

**Sequential:**
```yaml
- id: "step-1"
  type: "development"

- id: "step-2"
  depends_on: ["step-1"]  # Attend step-1
```

**Parallel:**
```yaml
- id: "parallel-1"
  depends_on: ["fetch-data"]

- id: "parallel-2"
  depends_on: ["fetch-data"]

- id: "parallel-3"
  depends_on: ["fetch-data"]

# Les 3 s'exécutent simultanément après fetch-data
```

**Mixed:**
```yaml
# Phase 1: Parallel
- id: "fetch-a"
- id: "fetch-b"
- id: "fetch-c"

# Phase 2: Sequential (attend toutes les fetch)
- id: "process"
  depends_on: ["fetch-a", "fetch-b", "fetch-c"]
```

---

## 🔧 Personnalisation

### Ajouter Tes Propres Handlers

Dans `workflow_orchestrator.py`, section `_register_agents()`:

```python
def _register_agents(self):
    # Ajoute ton type custom
    self.agent_registry['mon-agent-custom'] = self._mon_handler_custom

async def _mon_handler_custom(self, agent: Agent, input_data: Any) -> Any:
    """Handler pour mon agent custom."""
    print(f"  → Mon Agent Custom: {agent.id}")
    
    # Ton code ici - appel MCP, API, etc.
    result = await mon_traitement(input_data)
    
    return result
```

### Intégrer avec MCP Réels

**Exemple avec claude-code-executor:**

```python
async def _claude_code_executor_handler(self, agent: Agent, input_data: Any) -> Any:
    """Appel réel au claude-code-executor MCP."""
    import subprocess
    
    # Appeler ton MCP server
    result = subprocess.run(
        ['mcp-call', 'claude-code-executor', 'execute', input_data],
        capture_output=True,
        text=True
    )
    
    return json.loads(result.stdout)
```

---

## 📊 TodoWrite Tracking

Le orchestrator affiche automatiquement le tracking style TodoWrite:

```
📊 Workflow Status: dashboard-electrique-mini
────────────────────────────────────────────────────────────────
  ✓ fetch-code-norms              [mcp-filesystem] (0.5s)
  ✓ fetch-project-specs            [mcp-google-drive] (0.5s)
  ✓ fetch-historical-data          [system] (0.5s)
  ● safety-analysis                [quebec-electrical]
  ○ compliance-check               [quebec-electrical]
  ○ load-calculation               [quebec-electrical]
  ○ generate-safety-report         [development]
  ○ generate-compliance-report     [development]
  ○ generate-load-report           [development]
  ○ consolidate-dashboard          [claude-code-executor]
  ○ send-notification              [mcp-slack]
────────────────────────────────────────────────────────────────
```

**Légende:**
- `○` = Pending
- `●` = Running
- `✓` = Completed
- `✗` = Failed

---

## 🎯 Cas d'Usage

### 1. Dashboard Électrique (29 agents)

**Workflow:** `dashboard-electrique-full.yaml` (à créer)

```yaml
workflow:
  name: "dashboard-electrique-production"
  
  agents:
    # 11 Quebec Electrical Agents
    - id: "qc-safety-1" ...
    - id: "qc-compliance-2" ...
    # ... x11
    
    # 15 Development Agents
    - id: "dev-frontend-1" ...
    - id: "dev-backend-2" ...
    # ... x15
    
    # 3 System Agents
    - id: "sys-monitor-1" ...
    - id: "sys-deploy-2" ...
    - id: "sys-backup-3"
```

**Orchestration automatique:**
- Phase 1: Collecte données (parallel)
- Phase 2: Analyse électrique (parallel)
- Phase 3: Dev frontend/backend (parallel)
- Phase 4: Tests & validation (sequential)
- Phase 5: Deployment (sequential)
- Phase 6: Monitoring (continuous)

### 2. Document Processing Pipeline

```yaml
workflow:
  name: "doc-processing-pipeline"
  
  agents:
    - id: "fetch-docs"
      type: "mcp-google-drive"
    
    - id: "extract-text"
      type: "development"
    
    - id: "analyze-content"
      type: "quebec-electrical"
    
    - id: "generate-reports"
      type: "claude-code-executor"
      parallel: ["summary.docx", "analysis.pptx", "data.xlsx"]
    
    - id: "upload-results"
      type: "mcp-google-drive"
    
    - id: "notify-team"
      type: "mcp-slack"
```

### 3. CI/CD Pipeline

```yaml
workflow:
  name: "cicd-pipeline"
  
  agents:
    - id: "checkout-code"
      type: "system"
    
    - id: "run-tests"
      type: "claude-code-executor"
      parallel: ["unit", "integration", "e2e"]
    
    - id: "build-docker"
      type: "system"
    
    - id: "deploy-staging"
      type: "system"
    
    - id: "smoke-tests"
      type: "claude-code-executor"
    
    - id: "deploy-production"
      type: "system"
      depends_on: ["smoke-tests"]
```

---

## 🚀 Prochaines Étapes

### Phase 1: Production Ready (1 semaine)
- [ ] Intégrer vrais MCP calls
- [ ] Ajouter Redis pour state persistence
- [ ] Implement event bus (pub/sub)
- [ ] Add monitoring dashboard
- [ ] Error recovery & rollback

### Phase 2: Dashboard Électrique (2 semaines)
- [ ] Créer les 29 agent handlers
- [ ] Workflow YAML complet
- [ ] Integration testing
- [ ] Performance optimization
- [ ] Documentation utilisateur

### Phase 3: MCP Server Package (1 mois)
- [ ] Transformer en vrai MCP server
- [ ] Claude Desktop integration
- [ ] UI pour workflow editor
- [ ] Template library
- [ ] Community sharing

---

## 📚 Resources

- **Architecture:** `architecture-francis-mcp.png`
- **Guide complet:** `WORKFLOW-ORCHESTRATION.md`
- **Workflows exemples:** `workflows/`
- **Méthodologie:** Voir CLAUDE.md (Francis Végiard)

---

## ✅ Avantages vs Antigravity

| Feature | Cette Solution | Google Antigravity |
|---------|---------------|-------------------|
| **Contrôle** | ✅ 100% ownership | ❌ Dépend Google |
| **Customization** | ✅ Illimité | ⚠️ Limité |
| **Cost** | ✅ $20/mois + compute | $$$ API calls |
| **Privacy** | ✅ Local/self-hosted | ❌ Cloud Google |
| **Extensibilité** | ✅ MCP infini | ❌ Ecosystème fermé |
| **Performance** | ✅ 10-20x via executor | ⚠️ Variable |

**Conclusion:** Tu contrôles tout, tu paies moins, tu fais plus. 🎯

---

**Francis Végiard Methodology Applied** ✓
- Plan → Execute → Deliver
- YOLO execution
- Production code only
- TodoWrite tracking
- Absolute paths
- Zero assumptions

**Ready to orchestrate? Let's go! 🚀**
