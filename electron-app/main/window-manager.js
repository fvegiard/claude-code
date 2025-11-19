const { BrowserWindow } = require('electron');
const path = require('path');

class WindowManager {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
    this.childWindows = new Map();
  }

  createChildWindow(name, options = {}) {
    const defaultOptions = {
      width: 800,
      height: 600,
      parent: this.mainWindow,
      modal: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    };

    const window = new BrowserWindow({
      ...defaultOptions,
      ...options
    });

    this.childWindows.set(name, window);

    window.on('closed', () => {
      this.childWindows.delete(name);
    });

    return window;
  }

  getChildWindow(name) {
    return this.childWindows.get(name);
  }

  closeChildWindow(name) {
    const window = this.childWindows.get(name);
    if (window) {
      window.close();
    }
  }

  closeAllChildWindows() {
    this.childWindows.forEach(window => {
      window.close();
    });
    this.childWindows.clear();
  }

  focusMainWindow() {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.focus();
    }
  }

  sendToRenderer(channel, data) {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send(channel, data);
    }
  }

  sendToChildWindow(name, channel, data) {
    const window = this.childWindows.get(name);
    if (window && !window.isDestroyed()) {
      window.webContents.send(channel, data);
    }
  }

  broadcast(channel, data) {
    this.sendToRenderer(channel, data);
    this.childWindows.forEach(window => {
      if (!window.isDestroyed()) {
        window.webContents.send(channel, data);
      }
    });
  }
}

module.exports = WindowManager;
