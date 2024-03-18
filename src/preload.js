// preload.js
const {contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('ipcRenderer', ipcRenderer);

const openBrowser = {
    openExternal: (url) => ipcRenderer.send('openExternal', url),
};

contextBridge.exposeInMainWorld('openBrowser', openBrowser);
