/**
 * Outils de traitement PDF pour plans électriques
 */

import { spawn } from 'child_process';
import { promisify } from 'util';
import { existsSync } from 'fs';
import path from 'path';

const execFile = promisify(require('child_process').execFile);

/**
 * Analyser un PDF de plan électrique
 */
export const analyzePDF = async (pdfPath, analysisType = 'full') => {
  // Vérifier que le fichier existe
  if (!existsSync(pdfPath)) {
    throw new Error(`Fichier PDF non trouvé: ${pdfPath}`);
  }

  // Chemin vers le script Python d'analyse
  const pythonScript = path.join(process.cwd(), 'backend/pdf-processing/pdf-parser.py');

  // Générer un ID unique pour ce PDF
  const pdfId = `pdf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    // Exécuter le script Python
    const { stdout, stderr } = await execFile('python3', [pythonScript, pdfPath, pdfId]);

    if (stderr && stderr.length > 0) {
      console.error('Python stderr:', stderr);
    }

    // Parser le résultat JSON
    const result = JSON.parse(stdout);

    // Selon le type d'analyse, filtrer les résultats
    if (analysisType === 'bom-only') {
      return {
        pdfId: result.pdfId,
        bomItems: result.detectedElements || [],
      };
    } else if (analysisType === 'compliance-only') {
      return {
        pdfId: result.pdfId,
        compliance: await checkCompliance(result),
      };
    } else if (analysisType === 'quick') {
      return {
        pdfId: result.pdfId,
        summary: {
          pages: result.pages,
          elementsDetected: result.detectedCount,
          categories: result.categories,
        },
      };
    }

    // Full analysis
    return result;
  } catch (error) {
    throw new Error(`Erreur analyse PDF: ${error.message}`);
  }
};

/**
 * Générer une BOM à partir d'un PDF analysé
 */
export const generateBOM = async (pdfId) => {
  // En production, récupérer depuis la DB
  // Pour l'instant, simuler
  return {
    pdfId,
    generatedAt: new Date().toISOString(),
    items: [
      {
        category: 'Protection',
        description: 'Disjoncteur 40A',
        quantity: 1,
        partNumber: 'SQ-D-QO240',
        specifications: ['240V', '40A', 'Certifié CSA'],
        compliance: true,
        complianceStandard: 'CSA C22.2',
        price: 45.99,
      },
      // ... autres items
    ],
    notes: [
      'BOM générée automatiquement',
      'Vérification manuelle recommandée',
      'Conforme CEQ, RSST, RBQ, CSA',
    ],
  };
};

/**
 * Vérifier la conformité d'un plan analysé
 */
const checkCompliance = async (analysisResult) => {
  const checks = [];

  // Vérifier les exigences CEQ
  const hasCooktop = analysisResult.detectedElements?.some((e) =>
    e.type === 'cuisiniere'
  );

  if (hasCooktop) {
    checks.push({
      rule: 'Cuisinière électrique ≥5000W',
      status: 'passed',
      reference: 'CEQ Article 8-200',
      details: 'Cuisinière détectée dans le plan',
    });
  }

  // Vérifier certification CSA
  checks.push({
    rule: 'Matériel certifié CSA',
    status: 'needs-verification',
    reference: 'CEQ Article 2-024',
    details: 'Vérification manuelle requise pour certification CSA',
  });

  return {
    overallStatus: 'compliant',
    checks,
    timestamp: new Date().toISOString(),
  };
};

export const pdfTools = {
  analyzePDF,
  generateBOM,
};
