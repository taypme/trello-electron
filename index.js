'use strict';
const path = require('path');
const fs = require('fs');
const {app, BrowserWindow, Menu, shell} = require('electron');
const config = require('./config');

let mainWindow;
let isQuitting = false;

function createMainWindow() {
  const lastWindowState = config.get('lastWindowState');
  const win = new BrowserWindow({
    title: app.getName(),
    show: false,
    x: lastWindowState.x,
    y: lastWindowState.y,
    width: lastWindowState.width,
    height: lastWindowState.height,
    icon: process.platform === 'linux' && path.join(__dirname, 'static', 'Icon.png'),
    minWidth: 400,
    minHeight: 200,
    titleBarStyle: 'hidden-inset',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      preload: path.join(__dirname, 'browser.js'),
      contextIsolation: true
    }
  });

  if (process.platform === 'darwin') {
    win.setSheetOffset(40);
  }

  win.loadURL('https://trello.com/');

  win.on('close', e => {
    if (isQuitting) {
      if (!mainWindow.isFullScreen()) {
        config.set('lastWindowState', mainWindow.getBounds());
      }
    } else {
      e.preventDefault();

      if (process.platform === 'darwin') {
        app.hide();
      } else {
        app.quit();
      }
    }
  });

  return win;
}

async function initializeHelpers() {
  try {
    const {default: electronDebug} = await import('electron-debug');
    electronDebug({showDevTools: false});
  } catch (error) {
    console.warn('Failed to load electron-debug:', error);
  }

  try {
    const {default: electronDl} = await import('electron-dl');
    electronDl();
  } catch (error) {
    console.warn('Failed to load electron-dl:', error);
  }

  try {
    const {default: contextMenu} = await import('electron-context-menu');
    contextMenu();
  } catch (error) {
    console.warn('Failed to load electron-context-menu:', error);
  }
}

app.whenReady().then(async () => {
  await initializeHelpers();
  mainWindow = createMainWindow();
  const page = mainWindow.webContents;

  page.on('dom-ready', () => {
    const css = fs.readFileSync(path.join(__dirname, 'browser.css'), 'utf8');
    page.insertCSS(css).catch(error => {
      console.warn('Failed to insert CSS:', error);
    });
    mainWindow.show();
  });

  page.setWindowOpenHandler(({url}) => {
    shell.openExternal(url);
    return {action: 'deny'};
  });

  const template = [{
    label: 'Application',
    submenu: [
      {label: 'About Application', selector: 'orderFrontStandardAboutPanel:'},
      {type: 'separator'},
      {
        label: 'Quit', accelerator: 'Command+Q', click: () => {
          app.quit();
        }
      }
    ]
  }, {
    label: 'Edit',
    submenu: [
      {label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:'},
      {label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:'},
      {type: 'separator'},
      {label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:'},
      {label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:'},
      {label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:'},
      {label: 'Select All', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:'}
    ]
  }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (!mainWindow || mainWindow.isDestroyed()) {
    mainWindow = createMainWindow();
    return;
  }

  mainWindow.show();
});

app.on('before-quit', () => {
  isQuitting = true;
});
