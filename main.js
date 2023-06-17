'use strict'

const { app, BrowserWindow, Menu, ipcMain } = require('electron')
const { setupTitlebar, attachTitlebarToWindow } = require('custom-electron-titlebar/main')
const path = require('path')
const url = require('url')
const ElectronStore = require('electron-store');
const ElectronGoogleOAuth2 = require('@getstation/electron-google-oauth2').default;


ElectronStore.initRenderer();

let mainWindow, splashScreen
let updateApp
let dev = false

if (process.env.NODE_ENV !== undefined && process.env.NODE_ENV === 'development') {
  dev = true
}

function createSplash() {
  splashScreen = new BrowserWindow({
    width: 768, 
    height: 360, 
    frame: false, 
    alwaysOnTop: true,
    transparent: true
  });

  splashScreen.loadFile(path.join(__dirname, "./src/components/loader/loader.html"));
  splashScreen.center();
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 768,
    transparent: true,
    show: false,
    icon: path.join(__dirname, "icon.png"),
    title: "Catalogo Schede Telefoniche",
    titleBarStyle: 'hidden',
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      nodeIntegrationInWorker: true,
      preload: path.join(__dirname, "preload.js")
    }
  });
  
  Menu.setApplicationMenu(null);
  mainWindow.setMenu(null);
  mainWindow.removeMenu();

  attachTitlebarToWindow(mainWindow);

  let indexPath

  if (dev && process.argv.indexOf('--noDevServer') === -1) {
    indexPath = url.format({
      protocol: 'http:',
      host: 'localhost:8080',
      pathname: 'index.html',
      slashes: true
    })
  } else {
    indexPath = url.format({
      protocol: 'file:',
      pathname: path.join(__dirname, 'dist', 'index.html'),
      slashes: true
    })
  }

  mainWindow.loadURL(indexPath)

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    splashScreen.close();
    splashScreen = null;
    if (dev) {
      mainWindow.webContents.openDevTools()
    }
  })

  mainWindow.on('closed', function() {
    mainWindow = null
  })
}

if(require('electron-squirrel-startup')) return;

app.whenReady().then(() => {
  setupTitlebar();
  createSplash();
  createWindow();
  updateApp = require('update-electron-app');
  try {
    updateApp({
      repo: 'blurredheirloom/schedetelefoniche',
      updateInterval: '1 hour',
      notifyUser: true
    });
  }
  catch (error) {
    console.log(error);
  }
});



ipcMain.on('login', (event) => {
  const myApiOauth = new ElectronGoogleOAuth2(
    '498585607656-vcrsgcgjaf4e8j2u2rkre1d6dm935uqg.apps.googleusercontent.com',
    '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',
    [],
    { successRedirectURL: 'https://schede-telefoniche-3a36f.web.app' },
  );

  myApiOauth.openAuthWindowAndGetTokens()
    .then(token => {
        event.reply("login-success", token);
    });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})