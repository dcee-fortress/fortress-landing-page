const path = require('path')
const { app, BrowserWindow, ipcMain, shell } = require('electron')
const db = require('./db.cjs')

/** @type {BrowserWindow | null} */
let mainWindow = null

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 960,
    minHeight: 640,
    show: false,
    backgroundColor: '#f4efe8',
    title: 'Fortress',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  if (process.env.ELECTRON_START_URL) {
    mainWindow.loadURL(process.env.ELECTRON_START_URL)
    if (process.env.ELECTRON_DEBUG === '1') {
      mainWindow.webContents.openDevTools({ mode: 'detach' })
    }
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

const registerStorageIpc = () => {
  ipcMain.on('storage:get', (event, key) => {
    try {
      event.returnValue = db.getItem(key)
    } catch (error) {
      console.error('storage:get', error)
      event.returnValue = null
    }
  })
  ipcMain.on('storage:set', (event, key, value) => {
    try {
      db.setItem(key, value)
      event.returnValue = true
    } catch (error) {
      console.error('storage:set', error)
      event.returnValue = false
    }
  })
  ipcMain.on('storage:remove', (event, key) => {
    try {
      db.removeItem(key)
      event.returnValue = true
    } catch (error) {
      console.error('storage:remove', error)
      event.returnValue = false
    }
  })
  ipcMain.on('storage:clear', (event) => {
    try {
      db.clear()
      event.returnValue = true
    } catch (error) {
      console.error('storage:clear', error)
      event.returnValue = false
    }
  })
  ipcMain.on('storage:keys', (event) => {
    try {
      event.returnValue = db.keys()
    } catch (error) {
      console.error('storage:keys', error)
      event.returnValue = []
    }
  })
  ipcMain.on('storage:db-path', (event) => {
    try {
      event.returnValue = db.path()
    } catch {
      event.returnValue = ''
    }
  })
}

app.whenReady().then(async () => {
  await db.open()
  registerStorageIpc()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('before-quit', () => {
  db.close()
})
