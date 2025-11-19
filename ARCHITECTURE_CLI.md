# 🔄 Architecture Révisée - Claude Code CLI Backend

## Vue d'ensemble

Le système utilise maintenant **Claude Code CLI** comme backend au lieu de l'API Anthropic directe, permettant l'authentification avec un compte **Claude Max**.

## Nouvelle Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Electron Frontend                       │
│  ┌──────────────┐              ┌──────────────────┐    │
│  │  Chat Panel  │              │ Artifact Panel   │    │
│  └──────────────┘              └──────────────────┘    │
└───────────────────────┬─────────────────────────────────┘
                        │ IPC Communication
                        ↓
┌─────────────────────────────────────────────────────────┐
│            Backend Bridge (Node.js)                      │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Claude Code CLI Manager                         │   │
│  │  - Spawn CLI processes                           │   │
│  │  - Session management                            │   │
│  │  - Authentication handling                       │   │
│  └─────────────────────────────────────────────────┘   │
└───────────────────────┬─────────────────────────────────┘
                        │ Child Process / Stdio
                        ↓
┌─────────────────────────────────────────────────────────┐
│              Claude Code CLI                             │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Authenticated with Claude Max Account           │   │
│  │  - OAuth login                                   │   │
│  │  - Session persistence                           │   │
│  └─────────────────────────────────────────────────┘   │
│                        ↓                                 │
│  ┌─────────────────────────────────────────────────┐   │
│  │  MCP Server: Quebec Electrical Agents            │   │
│  │  - 11 specialized agents                         │   │
│  │  - PDF processing tools                          │   │
│  │  - Knowledge base access                         │   │
│  └─────────────────────────────────────────────────┘   │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ↓
                  Anthropic API
                (Claude Max Account)
```

## Composants Clés

### 1. Electron Frontend (Inchangé)
- Interface dual-panel
- Communication IPC avec backend

### 2. Backend Bridge (Nouveau)
- Wrapper Node.js pour Claude Code CLI
- Gestion des processus CLI
- Authentification Claude Max
- Routing des requêtes

### 3. Claude Code CLI
- Installé localement
- Authentifié avec compte Claude Max
- Accès aux MCP servers

### 4. MCP Server (Nouveau)
- Serveur MCP custom pour agents électriques
- 11 agents spécialisés exposés comme tools
- Intégration PDF et knowledge base

## Avantages

✅ **Authentification simplifiée** - OAuth avec compte Claude Max
✅ **Pas besoin de clé API** - Utilise l'authentification du compte
✅ **Fonctionnalités CLI** - Accès à toutes les features de Claude Code
✅ **MCP integration** - Utilisation du Model Context Protocol
✅ **Session management** - Gestion automatique par Claude Code CLI
✅ **Updates automatiques** - Bénéficie des mises à jour CLI

## Flux de Données

```
User → Electron UI → IPC → Backend Bridge → Claude Code CLI → MCP Server → Claude Max API → Response
```

## Fichiers de Configuration

### `.claude/config.json`
Configuration Claude Code CLI avec MCP server

### `mcp-server-quebec-electrical/`
Serveur MCP custom pour les agents électriques

### `backend/claude-cli-manager.js`
Gestionnaire du CLI dans le backend Node.js
