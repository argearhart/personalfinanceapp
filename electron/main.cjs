const path = require('node:path');
const express = require('express');
const { app, BrowserWindow } = require('electron');

let mainWindow;
let server;

function startLocalStaticServer() {
  const distDir = path.join(__dirname, '..', 'dist');
  const webApp = express();

  webApp.use(express.static(distDir, { fallthrough: false }));

  // SPA fallback for client-side routing (if added later)
  webApp.get('*', (_req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });

  return new Promise((resolve, reject) => {
    server = webApp.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        reject(new Error('Failed to bind local static server.'));
        return;
      }

      resolve(`http://127.0.0.1:${address.port}/`);
    });

    server.on('error', reject);
  });
}

async function createWindow() {
  const devUrl = process.env.ELECTRON_DEV_URL;
  const loadUrl = devUrl && devUrl.trim().length > 0 ? devUrl.trim() : await startLocalStaticServer();

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    backgroundColor: '#F9F9F7',
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  await mainWindow.loadURL(loadUrl);
}

function shutdownLocalServer() {
  if (!server) return;
  try {
    server.close();
  } catch {
    // ignore
  } finally {
    server = undefined;
  }
}

app.on('window-all-closed', () => {
  shutdownLocalServer();
  app.quit();
});

app.on('before-quit', () => {
  shutdownLocalServer();
});

app.whenReady().then(() => {
  createWindow().catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Failed to start Ledger & Balance desktop shell:', error);
    app.quit();
  });
});
