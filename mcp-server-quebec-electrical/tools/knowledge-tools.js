/**
 * Outils de base de connaissances pour normes québécoises
 */

import { spawn } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execFile = promisify(require('child_process').execFile);

/**
 * Rechercher dans la base de connaissances FAISS
 */
export const search = async (query, category = 'all', topK = 5) => {
  const pythonScript = path.join(process.cwd(), 'backend/knowledge-base/faiss-manager.py');

  try {
    const { stdout, stderr } = await execFile('python3', [
      pythonScript,
      'search',
      query,
      topK.toString(),
      category,
    ]);

    if (stderr && stderr.length > 0) {
      console.error('Python stderr:', stderr);
    }

    const result = JSON.parse(stdout);
    return result;
  } catch (error) {
    throw new Error(`Erreur recherche connaissances: ${error.message}`);
  }
};

/**
 * Récupérer un article spécifique
 */
export const getArticle = async (articleId) => {
  const pythonScript = path.join(process.cwd(), 'backend/knowledge-base/faiss-manager.py');

  try {
    const { stdout, stderr } = await execFile('python3', [
      pythonScript,
      'get-article',
      articleId,
    ]);

    if (stderr && stderr.length > 0) {
      console.error('Python stderr:', stderr);
    }

    const result = JSON.parse(stdout);
    return result;
  } catch (error) {
    if (error.message.includes('Article not found')) {
      throw new Error(`Article ${articleId} non trouvé dans la base de connaissances`);
    }
    throw new Error(`Erreur récupération article: ${error.message}`);
  }
};

/**
 * Obtenir les catégories disponibles
 */
export const getCategories = () => {
  return [
    {
      id: 'ceq',
      name: 'Code électrique du Québec (CEQ)',
      description: 'Code électrique du Québec - Édition en vigueur',
    },
    {
      id: 'rsst',
      name: 'Règlement sur la santé et la sécurité du travail (RSST)',
      description: 'Règlement sur la santé et la sécurité du travail',
    },
    {
      id: 'rbq',
      name: 'Régie du bâtiment du Québec (RBQ)',
      description: 'Exigences et règlements RBQ',
    },
    {
      id: 'csa',
      name: 'Normes CSA',
      description: 'Normes de l\'Association canadienne de normalisation',
    },
    {
      id: 'winter',
      name: 'Spécificités hivernales',
      description: 'Particularités pour conditions hivernales québécoises',
    },
    {
      id: 'equipment',
      name: 'Équipements spécifiques',
      description: 'Cuisinière, chauffage, etc.',
    },
  ];
};

export const knowledgeTools = {
  search,
  getArticle,
  getCategories,
};
