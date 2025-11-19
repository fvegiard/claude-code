#!/usr/bin/env node

/**
 * MCP Server for Quebec Electrical System
 * Exposes 29 agents + 4 tools via Model Context Protocol
 *
 * Agents:
 * - 11 Quebec electrical specialists
 * - 15 general development agents
 * - 3 system agents
 *
 * Tools:
 * - PDF analysis and BOM generation
 * - Quebec norms knowledge base search
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { agents } from './agents/index.js';
import { ALL_TOOLS } from './generate-tools.js';

// Créer le serveur MCP
const server = new Server(
  {
    name: 'quebec-electrical-system',
    version: '2.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Afficher les statistiques au démarrage
const stats = agents.count();
console.log('\n╔═══════════════════════════════════════════════════════════╗');
console.log('║     MCP SERVER - QUEBEC ELECTRICAL SYSTEM v2.0.0        ║');
console.log('╚═══════════════════════════════════════════════════════════╝');
console.log(`\n📊 Agents disponibles:`);
console.log(`   ⚡ Électriques:    ${stats.electrical} agents`);
console.log(`   💻 Développement:  ${stats.development} agents`);
console.log(`   🔧 Système:        ${stats.system} agents`);
console.log(`   ──────────────────────────────────────`);
console.log(`   📦 TOTAL:          ${stats.total} agents`);
console.log(`\n🛠️  Outils MCP:       ${ALL_TOOLS.length} outils\n`);

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
    // =====================================================
    // INVOCATION D'AGENTS
    // =====================================================
    if (name.startsWith('invoke_')) {
      // Extraire le nom de l'agent
      const agentName = name.replace('invoke_', '').replace(/_/g, '-');

      // Vérifier que l'agent existe
      const agentsList = agents.list();
      if (!agentsList.includes(agentName)) {
        return {
          content: [
            {
              type: 'text',
              text: `❌ Agent inconnu: ${agentName}\n\nAgents disponibles:\n${agentsList.join('\n')}`,
            },
          ],
        };
      }

      // Invoquer l'agent
      const result = await agents.invoke(agentName, args.task, args.context || '');

      return {
        content: [
          {
            type: 'text',
            text: result,
          },
        ],
      };
    }

    // =====================================================
    // OUTILS PDF
    // =====================================================
    if (name === 'analyze_electrical_pdf') {
      // Appeler le service Python pour analyser le PDF
      const { spawn } = await import('child_process');

      return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python3', [
          'tools/pdf-parser.py',
          args.pdfPath,
          args.analysisType || 'full',
        ]);

        let result = '';
        let error = '';

        pythonProcess.stdout.on('data', (data) => {
          result += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
          error += data.toString();
        });

        pythonProcess.on('close', (code) => {
          if (code !== 0) {
            resolve({
              content: [
                {
                  type: 'text',
                  text: `❌ Erreur analyse PDF (code ${code}):\n${error}`,
                },
              ],
            });
          } else {
            resolve({
              content: [
                {
                  type: 'text',
                  text: `✅ Analyse PDF terminée:\n${result}`,
                },
              ],
            });
          }
        });
      });
    }

    if (name === 'generate_bom') {
      // Générer la BOM
      return {
        content: [
          {
            type: 'text',
            text: `✅ BOM générée pour PDF ID: ${args.pdfId}\n\n[Simulé - À connecter avec le vrai service BOM]`,
          },
        ],
      };
    }

    // =====================================================
    // OUTILS BASE DE CONNAISSANCES
    // =====================================================
    if (name === 'search_quebec_norms') {
      // Rechercher dans la base FAISS
      const { spawn } = await import('child_process');

      return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python3', [
          'tools/faiss-search.py',
          args.query,
          args.category || 'all',
          String(args.topK || 5),
        ]);

        let result = '';
        let error = '';

        pythonProcess.stdout.on('data', (data) => {
          result += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
          error += data.toString();
        });

        pythonProcess.on('close', (code) => {
          if (code !== 0) {
            resolve({
              content: [
                {
                  type: 'text',
                  text: `❌ Erreur recherche (code ${code}):\n${error}`,
                },
              ],
            });
          } else {
            resolve({
              content: [
                {
                  type: 'text',
                  text: `🔍 Résultats de recherche:\n${result}`,
                },
              ],
            });
          }
        });
      });
    }

    if (name === 'get_ceq_article') {
      // Récupérer un article CEQ spécifique
      return {
        content: [
          {
            type: 'text',
            text: `📖 Article CEQ ${args.articleId}:\n\n[Simulé - À connecter avec la vraie base de données CEQ]`,
          },
        ],
      };
    }

    // =====================================================
    // OUTIL INCONNU
    // =====================================================
    return {
      content: [
        {
          type: 'text',
          text: `❌ Outil inconnu: ${name}\n\nOutils disponibles:\n${ALL_TOOLS.map(t => t.name).join('\n')}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `❌ Erreur lors de l'exécution de ${name}:\n${error.message}\n\nStack:\n${error.stack}`,
        },
      ],
    };
  }
});

// Démarrer le serveur
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log('✅ Serveur MCP prêt et en attente de connexions...\n');
}

main().catch((error) => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
