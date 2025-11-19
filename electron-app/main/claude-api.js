const Anthropic = require('@anthropic-ai/sdk');
const axios = require('axios');
const path = require('path');
const fs = require('fs').promises;
require('dotenv').config();

class ClaudeAPI {
  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY;
    this.backendURL = process.env.BACKEND_URL || 'http://localhost:3000';
    this.client = null;
    this.agents = [];
    this.conversationHistory = [];
  }

  async initialize() {
    try {
      // Initialiser le client Anthropic
      this.client = new Anthropic({
        apiKey: this.apiKey,
      });

      // Charger les configurations des agents
      await this.loadAgents();

      // Vérifier la connexion au backend
      await this.checkBackendConnection();

      console.log('✅ Claude API initialisée');
      console.log(`📊 ${this.agents.length} agents chargés`);

      return true;
    } catch (error) {
      console.error('❌ Erreur initialisation Claude API:', error);
      throw error;
    }
  }

  async loadAgents() {
    // Liste des 11 agents électriques québécois
    const agentNames = [
      'electrical-safety-quebec-specialist',
      'electrical-site-planner-quebec',
      'electrical-calculator-quebec',
      'electrical-project-manager-quebec',
      'electrical-diagnostician-quebec',
      'compliance-qc-manager-quebec',
      'electrical-supply-manager-quebec',
      'training-coordinator-quebec',
      'directive-tracker-quebec',
      'material-tracker-quebec',
      'dashboard-creator-quebec'
    ];

    this.agents = agentNames.map(name => ({
      name,
      displayName: this.getAgentDisplayName(name),
      description: this.getAgentDescription(name),
      active: true
    }));
  }

  getAgentDisplayName(name) {
    const displayNames = {
      'electrical-safety-quebec-specialist': 'Spécialiste Sécurité Électrique',
      'electrical-site-planner-quebec': 'Planificateur de Chantier',
      'electrical-calculator-quebec': 'Calculateur Électrique',
      'electrical-project-manager-quebec': 'Gestionnaire de Projet',
      'electrical-diagnostician-quebec': 'Diagnosticien Électrique',
      'compliance-qc-manager-quebec': 'Gestionnaire de Conformité',
      'electrical-supply-manager-quebec': 'Gestionnaire Approvisionnements',
      'training-coordinator-quebec': 'Coordinateur de Formation',
      'directive-tracker-quebec': 'Suivi de Directives',
      'material-tracker-quebec': 'Suivi de Matériel',
      'dashboard-creator-quebec': 'Créateur de Dashboard'
    };
    return displayNames[name] || name;
  }

  getAgentDescription(name) {
    const descriptions = {
      'electrical-safety-quebec-specialist': 'Expert en sécurité électrique selon CEQ, RSST et RBQ',
      'electrical-site-planner-quebec': 'Planification et organisation de chantiers électriques',
      'electrical-calculator-quebec': 'Calculs et dimensionnement selon le Code électrique du Québec',
      'electrical-project-manager-quebec': 'Gestion complète de projets électriques conformes RBQ',
      'electrical-diagnostician-quebec': 'Diagnostic et résolution de problèmes électriques',
      'compliance-qc-manager-quebec': 'Vérification de conformité CEQ/RBQ',
      'electrical-supply-manager-quebec': 'Gestion des approvisionnements certifiés CSA',
      'training-coordinator-quebec': 'Formation et développement des compétences',
      'directive-tracker-quebec': 'Suivi et application des directives et normes',
      'material-tracker-quebec': 'Suivi et spécifications du matériel',
      'dashboard-creator-quebec': 'Création et visualisation de dashboards'
    };
    return descriptions[name] || '';
  }

  async checkBackendConnection() {
    try {
      const response = await axios.get(`${this.backendURL}/health`);
      console.log('✅ Backend connecté:', response.data);
      return true;
    } catch (error) {
      console.warn('⚠️ Backend non disponible, mode standalone');
      return false;
    }
  }

  async sendMessage(message) {
    try {
      // Ajouter le message à l'historique
      this.conversationHistory.push({
        role: 'user',
        content: message
      });

      // Construire le prompt système pour les agents électriques québécois
      const systemPrompt = this.buildSystemPrompt();

      // Appeler Claude
      const response = await this.client.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 8192,
        system: systemPrompt,
        messages: this.conversationHistory
      });

      const assistantMessage = response.content[0].text;

      // Ajouter la réponse à l'historique
      this.conversationHistory.push({
        role: 'assistant',
        content: assistantMessage
      });

      return {
        message: assistantMessage,
        usage: response.usage,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erreur envoi message:', error);
      throw error;
    }
  }

  buildSystemPrompt() {
    return `Vous êtes un système d'agents électriques spécialisés pour le contexte québécois.

Vous avez accès à 11 agents spécialisés :
${this.agents.map(a => `- ${a.displayName}: ${a.description}`).join('\n')}

CONTEXTE QUÉBÉCOIS IMPORTANT:
- Code électrique du Québec (CEQ) - Édition en vigueur
- Règlement sur la santé et la sécurité du travail (RSST)
- Régie du bâtiment du Québec (RBQ)
- Normes CSA applicables
- Particularités: Cuisinière ≥5000W, conditions hivernales, matériel certifié CSA

Vous pouvez :
1. Analyser des plans électriques PDF
2. Générer des BOM (Bill of Materials)
3. Vérifier la conformité selon CEQ/RBQ/RSST
4. Faire des calculs de dimensionnement
5. Fournir des recommandations de sécurité
6. Identifier le matériel électrique dans les plans
7. Créer des rapports de conformité

Répondez toujours en français québécois, avec précision technique et référence aux normes appropriées.`;
  }

  async uploadPDF(filePath, fileName) {
    try {
      // Lire le fichier
      const fileBuffer = await fs.readFile(filePath);
      const base64File = fileBuffer.toString('base64');

      // Envoyer au backend pour traitement
      const response = await axios.post(`${this.backendURL}/api/pdf/upload`, {
        fileName,
        fileData: base64File
      });

      return response.data;
    } catch (error) {
      console.error('Erreur upload PDF:', error);
      throw error;
    }
  }

  async analyzePDF(pdfId, analysisType = 'full') {
    try {
      const response = await axios.post(`${this.backendURL}/api/pdf/analyze`, {
        pdfId,
        analysisType,
        agents: this.agents.map(a => a.name)
      });

      return response.data;
    } catch (error) {
      console.error('Erreur analyse PDF:', error);
      throw error;
    }
  }

  async getBOM(pdfId) {
    try {
      const response = await axios.get(`${this.backendURL}/api/pdf/${pdfId}/bom`);
      return response.data;
    } catch (error) {
      console.error('Erreur récupération BOM:', error);
      throw error;
    }
  }

  async invokeAgent(agentName, task) {
    try {
      // Trouver l'agent
      const agent = this.agents.find(a => a.name === agentName);
      if (!agent) {
        throw new Error(`Agent ${agentName} introuvable`);
      }

      // Construire le prompt pour l'agent spécifique
      const agentPrompt = `En tant que ${agent.displayName} (${agent.description}), ${task}`;

      // Appeler Claude avec ce prompt
      const response = await this.sendMessage(agentPrompt);

      return {
        agent: agent.name,
        displayName: agent.displayName,
        result: response.message,
        timestamp: response.timestamp
      };
    } catch (error) {
      console.error('Erreur invocation agent:', error);
      throw error;
    }
  }

  async searchKnowledge(query, category = null) {
    try {
      const response = await axios.post(`${this.backendURL}/api/knowledge/search`, {
        query,
        category
      });

      return response.data;
    } catch (error) {
      console.error('Erreur recherche connaissances:', error);
      throw error;
    }
  }

  async checkCompliance(pdfId, normsType = 'CEQ') {
    try {
      const response = await axios.post(`${this.backendURL}/api/pdf/compliance`, {
        pdfId,
        normsType
      });

      return response.data;
    } catch (error) {
      console.error('Erreur vérification conformité:', error);
      throw error;
    }
  }

  async getAgents() {
    return this.agents;
  }

  async exportBOM(pdfId, format = 'csv') {
    try {
      const response = await axios.post(`${this.backendURL}/api/pdf/${pdfId}/export`, {
        format
      });

      return response.data.path;
    } catch (error) {
      console.error('Erreur export BOM:', error);
      throw error;
    }
  }

  clearHistory() {
    this.conversationHistory = [];
  }
}

module.exports = ClaudeAPI;
