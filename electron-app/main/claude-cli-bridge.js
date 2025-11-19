const path = require('path');
const { EventEmitter } = require('events');

// Importer le CLI manager depuis le backend
const ClaudeCliManager = require('../../backend/services/claude-cli-manager');

/**
 * Bridge entre Electron et Claude Code CLI
 * Remplace claude-api.js pour utiliser Claude Code CLI au lieu de l'API directe
 */
class ClaudeCliBridge extends EventEmitter {
  constructor() {
    super();
    this.cliManager = new ClaudeCliManager();
    this.isReady = false;
    this.agents = [];
  }

  /**
   * Initialiser le bridge
   */
  async initialize() {
    try {
      console.log('🚀 Initialisation Claude Code CLI Bridge...');

      // 1. Vérifier que Claude Code CLI est installé
      const isInstalled = await this.cliManager.checkInstallation();
      if (!isInstalled) {
        throw new Error('Claude Code CLI n\'est pas installé. Exécutez: curl -fsSL https://claude.ai/install.sh | bash');
      }

      // 2. Vérifier l\'authentification
      const isAuthenticated = await this.cliManager.checkAuthentication();

      if (!isAuthenticated) {
        console.log('⚠️  Authentification Claude Max requise');
        this.emit('auth-required');
        return {
          success: false,
          needsAuth: true,
          message: 'Authentification Claude Max requise'
        };
      }

      // 3. Configurer le serveur MCP
      await this.cliManager.configureMCPServer();

      // 4. Charger la liste des agents
      await this.loadAgents();

      // 5. Démarrer une session CLI
      const projectPath = path.join(__dirname, '../..');
      await this.cliManager.startSession(projectPath);

      // Écouter les événements du CLI
      this.setupEventListeners();

      this.isReady = true;
      console.log('✅ Claude Code CLI Bridge prêt');
      console.log(`📊 ${this.agents.length} agents électriques québécois disponibles`);

      return {
        success: true,
        needsAuth: false,
        agentCount: this.agents.length
      };

    } catch (error) {
      console.error('❌ Erreur initialisation:', error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Démarrer le processus d'authentification
   */
  async authenticate() {
    try {
      console.log('🔐 Démarrage authentification Claude Max...');

      // Écouter l'URL d'auth
      this.cliManager.once('auth-url', (url) => {
        this.emit('auth-url', url);
      });

      const success = await this.cliManager.authenticate();

      if (success) {
        console.log('✅ Authentification réussie');
        this.emit('auth-success');

        // Réessayer l'initialisation
        await this.initialize();
      }

      return success;
    } catch (error) {
      console.error('❌ Erreur authentification:', error);
      this.emit('auth-error', error);
      throw error;
    }
  }

  /**
   * Charger les agents disponibles
   */
  async loadAgents() {
    this.agents = [
      {
        name: 'electrical-safety-quebec-specialist',
        displayName: 'Spécialiste Sécurité Électrique',
        description: 'Expert en sécurité CEQ/RSST/RBQ',
        active: true
      },
      {
        name: 'electrical-calculator-quebec',
        displayName: 'Calculateur Électrique',
        description: 'Calculs et dimensionnement CEQ',
        active: true
      },
      {
        name: 'compliance-qc-manager-quebec',
        displayName: 'Gestionnaire de Conformité',
        description: 'Conformité CEQ/RBQ',
        active: true
      },
      {
        name: 'electrical-project-manager-quebec',
        displayName: 'Gestionnaire de Projet',
        description: 'Gestion de projet RBQ',
        active: true
      },
      {
        name: 'electrical-diagnostician-quebec',
        displayName: 'Diagnosticien Électrique',
        description: 'Diagnostic et dépannage',
        active: true
      },
      {
        name: 'electrical-supply-manager-quebec',
        displayName: 'Gestionnaire Approvisionnements',
        description: 'Approvisionnements CSA',
        active: true
      },
      {
        name: 'training-coordinator-quebec',
        displayName: 'Coordinateur de Formation',
        description: 'Formation RSST/CEQ',
        active: true
      },
      {
        name: 'directive-tracker-quebec',
        displayName: 'Suivi de Directives',
        description: 'Suivi et application normes',
        active: true
      },
      {
        name: 'material-tracker-quebec',
        displayName: 'Suivi de Matériel',
        description: 'Suivi matériel CSA/CEQ',
        active: true
      },
      {
        name: 'dashboard-creator-quebec',
        displayName: 'Créateur de Dashboard',
        description: 'Création de dashboards',
        active: true
      },
      {
        name: 'electrical-site-planner-quebec',
        displayName: 'Planificateur de Chantier',
        description: 'Planification chantier',
        active: true
      }
    ];
  }

  /**
   * Configurer les listeners d'événements
   */
  setupEventListeners() {
    this.cliManager.on('response', (data) => {
      this.emit('response', data);
    });

    this.cliManager.on('error', (error) => {
      this.emit('error', error);
    });

    this.cliManager.on('session-end', (code) => {
      this.isReady = false;
      this.emit('session-end', code);
    });
  }

  /**
   * Envoyer un message à Claude via CLI
   */
  async sendMessage(message) {
    if (!this.isReady) {
      throw new Error('CLI non prêt. Initialisez d\'abord.');
    }

    try {
      const response = await this.cliManager.sendMessage(message);

      return {
        message: response,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erreur envoi message:', error);
      throw error;
    }
  }

  /**
   * Invoquer un agent spécifique
   */
  async invokeAgent(agentName, task) {
    if (!this.isReady) {
      throw new Error('CLI non prêt. Initialisez d\'abord.');
    }

    try {
      const agent = this.agents.find(a => a.name === agentName);
      if (!agent) {
        throw new Error(`Agent ${agentName} introuvable`);
      }

      const response = await this.cliManager.invokeAgent(agentName, task);

      return {
        agent: agent.name,
        displayName: agent.displayName,
        result: response,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erreur invocation agent:', error);
      throw error;
    }
  }

  /**
   * Analyser un PDF
   */
  async analyzePDF(pdfPath) {
    if (!this.isReady) {
      throw new Error('CLI non prêt. Initialisez d\'abord.');
    }

    try {
      const response = await this.cliManager.analyzePDF(pdfPath);
      return JSON.parse(response);
    } catch (error) {
      console.error('Erreur analyse PDF:', error);
      throw error;
    }
  }

  /**
   * Rechercher dans la base de connaissances
   */
  async searchKnowledge(query, category = 'all') {
    if (!this.isReady) {
      throw new Error('CLI non prêt. Initialisez d\'abord.');
    }

    try {
      const response = await this.cliManager.searchKnowledge(query, category);
      return JSON.parse(response);
    } catch (error) {
      console.error('Erreur recherche connaissances:', error);
      throw error;
    }
  }

  /**
   * Obtenir les agents
   */
  async getAgents() {
    return this.agents;
  }

  /**
   * Obtenir le statut
   */
  getStatus() {
    return {
      isReady: this.isReady,
      ...this.cliManager.getStatus()
    };
  }

  /**
   * Arrêter
   */
  async shutdown() {
    console.log('🛑 Arrêt du bridge CLI...');
    if (this.cliManager) {
      await this.cliManager.stopSession();
    }
    this.isReady = false;
  }
}

module.exports = ClaudeCliBridge;
