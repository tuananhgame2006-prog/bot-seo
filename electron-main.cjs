const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let serverProcess;

function startServer() {
  console.log('Starting backend server process...');
  
  const isDev = !app.isPackaged && process.env.NODE_ENV !== 'production';
  
  if (isDev) {
    const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
    const args = ['tsx', 'server.ts'];
    serverProcess = spawn(cmd, args, {
      env: { ...process.env, NODE_ENV: 'development' },
      shell: true
    });

    serverProcess.stdout.on('data', (data) => {
      console.log(`[Server stdout]: ${data}`);
    });

    serverProcess.stderr.on('data', (data) => {
      console.error(`[Server stderr]: ${data}`);
    });

    serverProcess.on('close', (code) => {
      console.log(`Server process exited with code ${code}`);
    });
  } else {
    // In production (packaged ASAR), we cannot spawn node to run a file inside ASAR.
    // Instead, we require it directly into the Electron main process!
    process.env.NODE_ENV = 'production';
    try {
      require('./dist/server.cjs');
      console.log('Server module required successfully in main process.');
    } catch (err) {
      console.error('Failed to require server module:', err);
    }
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    frame: false, // frameless so our React custom Windows title bar handles styling natively!
    show: false,  // hide until page finishes parsing to avoid white flicker
    backgroundColor: '#0f111a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  const checkPortAndLoad = () => {
    const targetUrl = 'http://localhost:3000';
    
    setTimeout(() => {
      if (!mainWindow) return;
      mainWindow.loadURL(targetUrl)
        .then(() => {
          mainWindow.show();
        })
        .catch((err) => {
          console.log('Server port 3000 not active yet, retrying in 1s...');
          checkPortAndLoad();
        });
    }, 1500);
  };

  checkPortAndLoad();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('before-quit', () => {
  if (serverProcess) {
    console.log('Shutting down server child process cleanly...');
    serverProcess.kill('SIGINT');
  }
});

app.on('ready', () => {
  startServer();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC Bridge mapping for real native title bar controls
ipcMain.on('window-minimize', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.on('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('window-close', () => {
  if (mainWindow) {
    mainWindow.close();
  }
});
