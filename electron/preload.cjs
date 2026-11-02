const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  storage: {
    getItem: (key) => ipcRenderer.sendSync('storage:get', key),
    setItem: (key, value) => ipcRenderer.sendSync('storage:set', key, value),
    removeItem: (key) => ipcRenderer.sendSync('storage:remove', key),
    clear: () => ipcRenderer.sendSync('storage:clear'),
    keys: () => ipcRenderer.sendSync('storage:keys'),
  },
  getDbPath: () => ipcRenderer.sendSync('storage:db-path'),
})
