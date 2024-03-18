/*
    index.js
    启动electron
*/

const {app, BrowserWindow, ipcMain, shell} = require('electron');
const path = require('path');
const fs = require('fs');
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const apiRouter = require('./service/router');
const wssRouter = require('./service/src/generateCode/websocket');
const {checkAndCreateAuthenticatorList} = require('./checkDataList');
const config = require('../config.json');
const log = require('electron-log');

checkAndCreateAuthenticatorList();
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', () => {
        const mainWindow = BrowserWindow.getAllWindows()[0];
        if (mainWindow) {
            if (mainWindow.isMinimized()) {
                mainWindow.restore();
            }
            mainWindow.focus();
        }
    });
    // 启动express服务
    const expressApp = express();

    function Authenticate(req, res, next) {
        if (req.headers.authorization === config.APIKEY) {
            next();
        } else {
            res.status(401).send({error: 'Unauthorized'});
        }
    }

// expressApp.use(Authenticate);
    expressApp.use('/api', apiRouter);

// 创建HTTP服务器
    const server = http.createServer(expressApp);
    server.listen(config.PORT, config.HOST, () => {
        console.log(`Server running at http://${config.HOST}:${config.PORT}/`);
    });

// 启动websocket服务，并绑定到已经存在的HTTP服务器上
    const wss = new WebSocket.Server({server, path: '/ws/getAuthenticator'});
    wssRouter(wss);

    if (require('electron-squirrel-startup')) {
        app.quit();
    }


    const createWindow = () => {
        const mainWindow = new BrowserWindow({
            width: 1200,
            height: 800,
            icon: path.join(__dirname, '../icon.svg'),
            frame: false,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
                devTools: false
            },
            // 设置最小尺寸
            minWidth: 400,
            minHeight: 300,
        });
        mainWindow.loadFile(path.join(__dirname, './page/index.html'));

        // 监听渲染进程发送的消息
        ipcMain.on('close-window', () => {
            if (mainWindow) {
                mainWindow.close();
            }
        });

        ipcMain.on('minimize-window', () => {
            if (mainWindow) {
                mainWindow.minimize();
            }
        });

        ipcMain.on('maximize-window', () => {
            if (mainWindow) {
                if (mainWindow.isMaximized()) {
                    mainWindow.restore();
                } else {
                    mainWindow.maximize();
                }
            }
        });
    };

    ipcMain.on('openExternal', (event, url) => {
        shell.openExternal(url);
    });

    app.on('ready', () => {
        createWindow();
    });
    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
}

log.transports.file.file = path.join(app.getPath('userData'), 'your-log-file.log');
log.transports.file.level = 'info';