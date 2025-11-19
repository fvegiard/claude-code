const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const ClaudeCliBridge = require('./claude-cli-bridge');
const WindowManager = require('./window-manager');

let mainWindow;
let claudeBridge;
let windowManager;

// Configuration de l'application
const isDev = process.argv.includes('--dev');

function createWindow() {
  // Créer la fenêtre principale
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 1000,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    title: 'Système d\'Agents Électriques Québécois - Claude Code CLI',
    icon: path.join(__dirname, '../assets/icon.png')
  });

  // Charger l'interface
  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  // Ouvrir DevTools en mode développement
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Initialiser le gestionnaire de fenêtres
  windowManager = new WindowManager(mainWindow);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Initialiser l'application
app.whenReady().then(async () => {
  // Initialiser le bridge CLI
  claudeBridge = new ClaudeCliBridge();

  // Écouter les événements du bridge
  claudeBridge.on('auth-required', () => {
    mainWindow.webContents.send('auth-required');
  });

  claudeBridge.on('auth-url', (url) => {
    mainWindow.webContents.send('auth-url', url);
  });

  claudeBridge.on('auth-success', () => {
    mainWindow.webContents.send('auth-success');
  });

  claudeBridge.on('response', (data) => {
    mainWindow.webContents.send('cli-response', data);
  });

  claudeBridge.on('error', (error) => {
    mainWindow.webContents.send('cli-error', error.message);
  });

  // Créer la fenêtre
  createWindow();

  // Essayer d'initialiser le CLI
  try {
    await claudeBridge.initialize();
    mainWindow.webContents.send('cli-ready');
  } catch (error) {
    console.error('Erreur initialisation CLI:', error);
    mainWindow.webContents.send('cli-error', error.message);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quitter l'application
app.on('window-all-closed', async () => {
  if (claudeBridge) {
    await claudeBridge.shutdown();
  }

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// ========================================
// IPC Handlers - Communication avec le renderer
// ========================================

// Initialiser le CLI
ipcMain.handle('initialize-cli', async () => {
  try {
    const result = await claudeBridge.initialize();
    return {
      success: true,
      data: result
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
});

// Démarrer l'authentification
ipcMain.handle('start-auth', async () => {
  try {
    const success = await claudeBridge.authenticate();
    return {
      success: true,
      data: { authenticated: success }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
});

// Ouvrir l'URL d'authentification dans le navigateur
ipcMain.handle('open-auth-url', async (event, url) => {
  try {
    await shell.openExternal(url);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
});

// Chat avec Claude via CLI
ipcMain.handle('send-message', async (event, message) => {
  try {
    const response = await claudeBridge.sendMessage(message);
    return {
      success: true,
      data: response
    };
  } catch (error) {
    console.error('Erreur envoi message:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

// Invoquer un agent spécifique
ipcMain.handle('invoke-agent', async (event, { agentName, task }) => {
  try {
    const result = await claudeBridge.invokeAgent(agentName, task);
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Erreur invocation agent:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

// Upload et analyse de PDF
ipcMain.handle('upload-pdf', async (event, { filePath, fileName }) => {
  try {
    const result = await claudeBridge.analyzePDF(filePath);
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Erreur upload PDF:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

// Recherche dans la base de connaissances
ipcMain.handle('search-knowledge', async (event, { query, category }) => {
  try {
    const results = await claudeBridge.searchKnowledge(query, category);
    return {
      success: true,
      data: results
    };
  } catch (error) {
    console.error('Erreur recherche connaissances:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

// Obtenir la liste des agents
ipcMain.handle('get-agents', async () => {
  try {
    const agents = await claudeBridge.getAgents();
    return {
      success: true,
      data: agents
    };
  } catch (error) {
    console.error('Erreur récupération agents:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

// Obtenir le statut du CLI
ipcMain.handle('get-cli-status', async () => {
  try {
    const status = claudeBridge.getStatus();
    return {
      success: true,
      data: status
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
});

// Gestion des erreurs globales
process.on('uncaughtException', (error) => {
  console.error('Erreur non capturée:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promesse rejetée non gérée:', reason);
});

console.log('🚀 Application Électrique Québécoise démarrée');
console.log(`📌 Mode: ${isDev ? 'Développement' : 'Production'}`);
console.log('🤖 Claude Code CLI Backend activé');
console.log('🔐 Authentification Claude Max requise');
