/**
 * Script pour générer automatiquement les définitions MCP des 29 agents
 */

import { agents } from './agents/index.js';

const agentsList = agents.list();
const categories = agents.getAgentsByCategory();

// Mapping des agents avec leurs descriptions
const agentDescriptions = {
  // Électriques
  'electrical-safety-specialist': 'Expert en sécurité électrique selon CEQ, RSST et RBQ. Identifie les risques et valide la conformité.',
  'electrical-calculator': 'Expert en calculs électriques selon CEQ. Dimensionne les circuits, câbles, protections.',
  'electrical-compliance-checker': 'Vérificateur de conformité CEQ/RBQ. Génère des rapports de conformité détaillés.',
  'electrical-project-manager': 'Gestionnaire de projet électrique conforme RBQ. Planifie et coordonne les projets.',
  'electrical-diagnostician': 'Expert en diagnostic électrique. Analyse les pannes et propose des solutions conformes.',
  'electrical-supply-manager': 'Gestionnaire d\'approvisionnement de matériel électrique certifié CSA pour le Québec.',
  'electrical-training-coordinator': 'Coordinateur de formation électrique. Développe des programmes conformes CEQ/RSST.',
  'electrical-directive-tracker': 'Suivi des directives électriques CEQ/RSST/RBQ. Alerte sur les changements normatifs.',
  'electrical-material-tracker': 'Suivi de matériel électrique. Gère l\'inventaire et valide les spécifications CSA/CEQ.',
  'electrical-dashboard-creator': 'Créateur de tableaux de bord électriques. Visualise données de conformité et performance.',
  'electrical-site-planner': 'Planificateur de chantiers électriques. Organise les travaux conformément à RSST.',

  // Développement général
  'code-reviewer': 'Expert code reviewer. Reviews code quality, security, performance, and best practices.',
  'documentation-generator': 'Technical documentation writer. Generates API docs, guides, and README files.',
  'test-writer': 'Test engineer. Writes unit, integration, and E2E tests with high coverage.',
  'security-auditor': 'Cybersecurity expert. Audits for OWASP vulnerabilities and security issues.',
  'performance-optimizer': 'Performance expert. Optimizes database queries, caching, and response times.',
  'database-designer': 'Database architect. Designs schemas, indexes, and migrations.',
  'api-architect': 'API design expert. Designs RESTful APIs, GraphQL, and documentation.',
  'ui-ux-designer': 'UI/UX expert. Designs accessible, responsive user interfaces.',
  'devops-specialist': 'DevOps expert. Sets up CI/CD, Docker, Kubernetes, and monitoring.',
  'cloud-architect': 'Cloud architect. Designs scalable cloud solutions on AWS/Azure/GCP.',
  'mobile-developer': 'Mobile development expert. Builds React Native and native iOS/Android apps.',
  'frontend-specialist': 'Frontend expert. Builds React/Vue/Angular applications with modern JavaScript.',
  'backend-specialist': 'Backend expert. Builds Node.js/Python APIs and microservices.',
  'fullstack-coordinator': 'Full-stack coordinator. Integrates frontend and backend, makes architectural decisions.',
  'project-documenter': 'Project documentation specialist. Creates comprehensive docs, diagrams, and knowledge bases.',

  // Système
  'system-monitor': 'System monitoring expert. Monitors health, performance, logs, and metrics.',
  'log-analyzer': 'Log analysis expert. Analyzes logs, identifies patterns, finds root causes.',
  'backup-manager': 'Backup and disaster recovery expert. Designs backup strategies and recovery plans.',
};

// Générer les outils MCP
const mcpTools = [];

// Ajouter tous les agents
agentsList.forEach(agentName => {
  const toolName = `invoke_${agentName.replace(/-/g, '_')}`;
  const description = agentDescriptions[agentName] || `Agent: ${agentName}`;

  mcpTools.push({
    name: toolName,
    description,
    inputSchema: {
      type: 'object',
      properties: {
        task: {
          type: 'string',
          description: `Task for ${agentName} to perform`,
        },
        context: {
          type: 'string',
          description: 'Additional context (optional)',
        },
      },
      required: ['task'],
    },
  });
});

// Ajouter les outils PDF
mcpTools.push({
  name: 'analyze_electrical_pdf',
  description: 'Analyse un plan électrique PDF. Extrait le matériel, génère la BOM, vérifie la conformité CEQ.',
  inputSchema: {
    type: 'object',
    properties: {
      pdfPath: {
        type: 'string',
        description: 'Chemin vers le fichier PDF à analyser',
      },
      analysisType: {
        type: 'string',
        enum: ['full', 'quick', 'bom-only', 'compliance-only'],
        description: 'Type d\'analyse à effectuer',
      },
    },
    required: ['pdfPath'],
  },
});

mcpTools.push({
  name: 'generate_bom',
  description: 'Génère une BOM (Bill of Materials) à partir d\'un plan PDF analysé.',
  inputSchema: {
    type: 'object',
    properties: {
      pdfId: {
        type: 'string',
        description: 'ID du PDF analysé',
      },
    },
    required: ['pdfId'],
  },
});

// Ajouter les outils de base de connaissances
mcpTools.push({
  name: 'search_quebec_norms',
  description: 'Recherche dans la base de connaissances des normes québécoises (CEQ, RSST, RBQ, CSA).',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'La requête de recherche',
      },
      category: {
        type: 'string',
        enum: ['all', 'ceq', 'rsst', 'rbq', 'csa', 'winter', 'equipment'],
        description: 'Catégorie de normes',
      },
      topK: {
        type: 'number',
        description: 'Nombre de résultats (1-20)',
      },
    },
    required: ['query'],
  },
});

mcpTools.push({
  name: 'get_ceq_article',
  description: 'Récupère un article spécifique du Code électrique du Québec.',
  inputSchema: {
    type: 'object',
    properties: {
      articleId: {
        type: 'string',
        description: 'ID de l\'article CEQ (ex: "ceq_8_200")',
      },
    },
    required: ['articleId'],
  },
});

// Afficher les stats
console.log(`\n✅ Génération des outils MCP terminée:`);
console.log(`   - ${categories.electrical.length} agents électriques`);
console.log(`   - ${categories.development.length} agents de développement`);
console.log(`   - ${categories.system.length} agents système`);
console.log(`   - 4 outils supplémentaires (PDF + KB)`);
console.log(`   - TOTAL: ${mcpTools.length} outils MCP\n`);

// Exporter
export const ALL_TOOLS = mcpTools;
