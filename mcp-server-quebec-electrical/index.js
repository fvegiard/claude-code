#!/usr/bin/env node

/**
 * MCP Server for Quebec Electrical Agents
 * Expose 11 specialized electrical agents as MCP tools
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { agents } from './agents/index.js';
import { pdfTools } from './tools/pdf-tools.js';
import { knowledgeTools } from './tools/knowledge-tools.js';

// Créer le serveur MCP
const server = new Server(
  {
    name: 'quebec-electrical-agents',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Liste de tous les outils disponibles
const ALL_TOOLS = [
  // ========================================
  // AGENTS ÉLECTRIQUES QUÉBÉCOIS (11)
  // ========================================
  {
    name: 'invoke_electrical_safety_specialist',
    description: 'Expert en sécurité électrique selon CEQ, RSST et RBQ. Identifie les risques et valide la conformité.',
    inputSchema: {
      type: 'object',
      properties: {
        task: {
          type: 'string',
          description: 'La tâche de sécurité à effectuer (ex: "Vérifier la conformité CEQ de ce panneau")',
        },
        context: {
          type: 'string',
          description: 'Contexte additionnel (optionnel)',
        },
      },
      required: ['task'],
    },
  },
  {
    name: 'invoke_electrical_calculator',
    description: 'Expert en calculs électriques selon CEQ. Dimensionne les circuits, câbles, protections.',
    inputSchema: {
      type: 'object',
      properties: {
        task: {
          type: 'string',
          description: 'Le calcul à effectuer (ex: "Calculer la section de conducteur pour 40A à 50m")',
        },
        context: {
          type: 'string',
          description: 'Données techniques (optionnel)',
        },
      },
      required: ['task'],
    },
  },
  {
    name: 'invoke_compliance_manager',
    description: 'Gestionnaire de conformité CEQ/RBQ. Génère des rapports de conformité détaillés.',
    inputSchema: {
      type: 'object',
      properties: {
        task: {
          type: 'string',
          description: 'La vérification de conformité à effectuer',
        },
        normsType: {
          type: 'string',
          enum: ['CEQ', 'RSST', 'RBQ', 'CSA', 'ALL'],
          description: 'Type de normes à vérifier',
        },
      },
      required: ['task'],
    },
  },
  {
    name: 'invoke_project_manager',
    description: 'Gestionnaire de projet électrique conforme RBQ. Planifie et coordonne les projets.',
    inputSchema: {
      type: 'object',
      properties: {
        task: {
          type: 'string',
          description: 'La tâche de gestion de projet',
        },
      },
      required: ['task'],
    },
  },
  {
    name: 'invoke_diagnostician',
    description: 'Diagnosticien électrique expert. Résout les problèmes et pannes électriques.',
    inputSchema: {
      type: 'object',
      properties: {
        task: {
          type: 'string',
          description: 'Le problème à diagnostiquer',
        },
        symptoms: {
          type: 'string',
          description: 'Symptômes observés (optionnel)',
        },
      },
      required: ['task'],
    },
  },
  {
    name: 'invoke_supply_manager',
    description: 'Gestionnaire des approvisionnements électriques certifiés CSA.',
    inputSchema: {
      type: 'object',
      properties: {
        task: {
          type: 'string',
          description: 'La tâche d\'approvisionnement',
        },
      },
      required: ['task'],
    },
  },
  {
    name: 'invoke_training_coordinator',
    description: 'Coordinateur de formation RSST/CEQ. Développe les compétences.',
    inputSchema: {
      type: 'object',
      properties: {
        task: {
          type: 'string',
          description: 'La tâche de formation',
        },
      },
      required: ['task'],
    },
  },
  {
    name: 'invoke_directive_tracker',
    description: 'Suivi et application des directives et normes électriques.',
    inputSchema: {
      type: 'object',
      properties: {
        task: {
          type: 'string',
          description: 'La directive à suivre',
        },
      },
      required: ['task'],
    },
  },
  {
    name: 'invoke_material_tracker',
    description: 'Suivi et spécifications du matériel électrique CSA/CEQ.',
    inputSchema: {
      type: 'object',
      properties: {
        task: {
          type: 'string',
          description: 'La tâche de suivi de matériel',
        },
      },
      required: ['task'],
    },
  },
  {
    name: 'invoke_dashboard_creator',
    description: 'Créateur de dashboards et visualisations électriques.',
    inputSchema: {
      type: 'object',
      properties: {
        task: {
          type: 'string',
          description: 'Le dashboard à créer',
        },
      },
      required: ['task'],
    },
  },
  {
    name: 'invoke_site_planner',
    description: 'Planificateur de chantier électrique. Organisation des travaux RSST.',
    inputSchema: {
      type: 'object',
      properties: {
        task: {
          type: 'string',
          description: 'La planification de chantier',
        },
      },
      required: ['task'],
    },
  },

  // ========================================
  // OUTILS PDF
  // ========================================
  {
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
  },
  {
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
  },

  // ========================================
  // BASE DE CONNAISSANCES
  // ========================================
  {
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
  },
  {
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
  },
];

// Handler pour lister les outils
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: ALL_TOOLS,
  };
});

// Handler pour appeler un outil
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    // Router vers le bon agent/outil
    if (name.startsWith('invoke_')) {
      const agentName = name.replace('invoke_', '').replace(/_/g, '-');
      const result = await agents.invoke(agentName, args.task, args.context || args.symptoms || args.normsType);

      return {
        content: [
          {
            type: 'text',
            text: result,
          },
        ],
      };
    }

    // Outils PDF
    if (name === 'analyze_electrical_pdf') {
      const result = await pdfTools.analyzePDF(args.pdfPath, args.analysisType || 'full');
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    if (name === 'generate_bom') {
      const result = await pdfTools.generateBOM(args.pdfId);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    // Base de connaissances
    if (name === 'search_quebec_norms') {
      const result = await knowledgeTools.search(args.query, args.category || 'all', args.topK || 5);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    if (name === 'get_ceq_article') {
      const result = await knowledgeTools.getArticle(args.articleId);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    throw new Error(`Outil inconnu: ${name}`);
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Erreur: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Démarrer le serveur
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('MCP Server Quebec Electrical Agents démarré');
  console.error('11 agents électriques québécois disponibles');
  console.error('Outils PDF et base de connaissances activés');
}

main().catch((error) => {
  console.error('Erreur fatale:', error);
  process.exit(1);
});
