const { spawn } = require('child_process');
const { EventEmitter } = require('events');
const path = require('path');
const fs = require('fs').promises;
const os = require('os');
const logger = require('../utils/logger');

/**
 * Gestionnaire Claude Code CLI
 * Gère la communication avec Claude Code CLI et l'authentification Claude Max
 */
class ClaudeCliManager extends EventEmitter {
  constructor() {
    super();
    this.process = null;
    this.isAuthenticated = false;
    this.currentSession = null;
    this.responseBuffer = '';
    this.configPath = path.join(os.homedir(), '.claude');
  }

  /**
   * Vérifier si Claude Code CLI est installé
   */
  async checkInstallation() {
    try {
      const { execSync } = require('child_process');
      const version = execSync('claude --version', { encoding: 'utf-8' });
      logger.info(`Claude Code CLI détecté: ${version.trim()}`);
      return true;
    } catch (error) {
      logger.error('Claude Code CLI non installé');
      return false;
    }
  }

  /**
   * Vérifier l'authentification
   */
  async checkAuthentication() {
    try {
      const configFile = path.join(this.configPath, 'config.json');
      const config = JSON.parse(await fs.readFile(configFile, 'utf-8'));

      // Vérifier si un token d'auth existe
      this.isAuthenticated = !!(config.auth && config.auth.token);

      if (this.isAuthenticated) {
        logger.info('Authentification Claude Max détectée');
      } else {
        logger.warn('Aucune authentification Claude Max trouvée');
      }

      return this.isAuthenticated;
    } catch (error) {
      logger.warn('Fichier de configuration Claude non trouvé');
      this.isAuthenticated = false;
      return false;
    }
  }

  /**
   * Initier l'authentification Claude Max
   */
  async authenticate() {
    return new Promise((resolve, reject) => {
      logger.info('Démarrage de l\'authentification Claude Max...');

      const authProcess = spawn('claude', ['auth', 'login'], {
        stdio: ['inherit', 'pipe', 'pipe'],
        shell: true
      });

      let output = '';

      authProcess.stdout.on('data', (data) => {
        const text = data.toString();
        output += text;
        logger.info(`Auth output: ${text.trim()}`);

        // Émettre l'URL d'auth si présente
        const urlMatch = text.match(/https:\/\/claude\.ai\/auth\/[^\s]+/);
        if (urlMatch) {
          this.emit('auth-url', urlMatch[0]);
        }
      });

      authProcess.stderr.on('data', (data) => {
        logger.error(`Auth error: ${data.toString().trim()}`);
      });

      authProcess.on('close', async (code) => {
        if (code === 0) {
          this.isAuthenticated = true;
          logger.info('✅ Authentification Claude Max réussie');
          await this.checkAuthentication();
          resolve(true);
        } else {
          logger.error(`❌ Authentification échouée (code: ${code})`);
          reject(new Error('Authentification échouée'));
        }
      });
    });
  }

  /**
   * Configurer le serveur MCP Quebec Electrical
   */
  async configureMCPServer() {
    const mcpConfig = {
      mcpServers: {
        'quebec-electrical': {
          command: 'node',
          args: [path.join(__dirname, '../../mcp-server-quebec-electrical/index.js')],
          env: {
            KNOWLEDGE_BASE_PATH: path.join(__dirname, '../knowledge-base'),
            UPLOAD_DIR: process.env.UPLOAD_DIR || './storage/uploads'
          }
        }
      }
    };

    const configFile = path.join(this.configPath, 'config.json');

    try {
      // Lire la config existante
      let config = {};
      try {
        config = JSON.parse(await fs.readFile(configFile, 'utf-8'));
      } catch (e) {
        // Fichier n'existe pas, on va le créer
      }

      // Merger avec la config MCP
      config.mcpServers = {
        ...config.mcpServers,
        ...mcpConfig.mcpServers
      };

      // Sauvegarder
      await fs.mkdir(this.configPath, { recursive: true });
      await fs.writeFile(configFile, JSON.stringify(config, null, 2));

      logger.info('✅ Serveur MCP Quebec Electrical configuré');
      return true;
    } catch (error) {
      logger.error('Erreur configuration MCP:', error);
      return false;
    }
  }

  /**
   * Démarrer une session Claude Code CLI
   */
  async startSession(projectPath = process.cwd()) {
    if (!this.isAuthenticated) {
      throw new Error('Authentification requise. Utilisez authenticate() d\'abord.');
    }

    return new Promise((resolve, reject) => {
      logger.info(`Démarrage session Claude Code dans: ${projectPath}`);

      this.process = spawn('claude', ['--no-input'], {
        cwd: projectPath,
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true
      });

      this.process.stdout.on('data', (data) => {
        const text = data.toString();
        this.responseBuffer += text;
        this.emit('response', text);
      });

      this.process.stderr.on('data', (data) => {
        logger.error(`Claude CLI error: ${data.toString()}`);
        this.emit('error', data.toString());
      });

      this.process.on('close', (code) => {
        logger.info(`Session Claude Code terminée (code: ${code})`);
        this.process = null;
        this.currentSession = null;
        this.emit('session-end', code);
      });

      // Attendre que la session soit prête
      setTimeout(() => {
        this.currentSession = {
          pid: this.process.pid,
          startTime: new Date(),
          projectPath
        };
        logger.info(`✅ Session Claude Code démarrée (PID: ${this.process.pid})`);
        resolve(this.currentSession);
      }, 2000);
    });
  }

  /**
   * Envoyer un message à Claude
   */
  async sendMessage(message) {
    if (!this.process) {
      throw new Error('Aucune session active. Utilisez startSession() d\'abord.');
    }

    return new Promise((resolve, reject) => {
      this.responseBuffer = '';

      let responseComplete = false;
      const timeout = setTimeout(() => {
        if (!responseComplete) {
          responseComplete = true;
          resolve(this.responseBuffer);
        }
      }, 30000); // 30 secondes timeout

      const responseHandler = (data) => {
        // Détecter la fin de réponse (heuristique)
        if (data.includes('●') || data.includes('✓') || data.includes('\n\n')) {
          if (!responseComplete) {
            responseComplete = true;
            clearTimeout(timeout);
            this.removeListener('response', responseHandler);
            resolve(this.responseBuffer);
          }
        }
      };

      this.on('response', responseHandler);

      // Envoyer le message
      this.process.stdin.write(message + '\n');
      logger.info(`Message envoyé à Claude: ${message.substring(0, 100)}...`);
    });
  }

  /**
   * Invoquer un agent spécifique via MCP
   */
  async invokeAgent(agentName, task) {
    const message = `@quebec-electrical invoke-agent ${agentName} "${task}"`;
    return this.sendMessage(message);
  }

  /**
   * Analyser un PDF
   */
  async analyzePDF(pdfPath) {
    const message = `@quebec-electrical analyze-pdf "${pdfPath}"`;
    return this.sendMessage(message);
  }

  /**
   * Rechercher dans la base de connaissances
   */
  async searchKnowledge(query, category = 'all') {
    const message = `@quebec-electrical search-knowledge "${query}" ${category}`;
    return this.sendMessage(message);
  }

  /**
   * Arrêter la session
   */
  async stopSession() {
    if (this.process) {
      logger.info('Arrêt de la session Claude Code...');
      this.process.stdin.write('/exit\n');

      return new Promise((resolve) => {
        setTimeout(() => {
          if (this.process) {
            this.process.kill();
          }
          resolve();
        }, 2000);
      });
    }
  }

  /**
   * Obtenir le statut
   */
  getStatus() {
    return {
      isAuthenticated: this.isAuthenticated,
      hasActiveSession: !!this.process,
      currentSession: this.currentSession
    };
  }
}

module.exports = ClaudeCliManager;
