/*
    authenticator.js
    websocket服务端以及验证码生成机制
*/

const speakeasy = require('speakeasy');
const config = require('../../../../config');
const fs = require('fs');
const path = require('path');
const {app} = require('electron')

let connectionCounter = 0; // 用于分配每个 WebSocket 连接的编号

function generateTOtps(authenticatorList) {
    // 对于 authenticatorList 中的每个账号，生成一个新的验证码
    const totps = authenticatorList.list.map(item => {
        const totp = speakeasy.totp({
            secret: item.secret,
            encoding: 'base32',
            algorithm: item.encrypt.toLowerCase(),
            digits: item.digit,
            step: item.interval
        });

        // 返回账号和对应的验证码
        return {
            id: item.id,
            totp,
        };
    });

    return totps;
}

function handleWebSocketRoutes(wss) {
    console.log(`WebSocket running on http://${config.HOST}:${config.PORT}/`);

    wss.on('connection', (ws, req) => {
        const wsConnectionNumber = ++connectionCounter;
        console.log(`WebSocket Connection ${wsConnectionNumber} established.`);

        // 验证authorization头部
        /*if (req.headers.authorization !== config.APIKEY) {
            // 如果authorization头部的值与API密钥不匹配，就拒绝连接请求
            ws.send(JSON.stringify({
                error: 'Unauthorized'
            }));
            ws.close();
            return;
        }*/

        // 在新的连接建立后立即发送所有的验证码
        let authenticatorList = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../../data/authenticatorList.json'), 'utf8'));
        ws.send(JSON.stringify(generateTOtps(authenticatorList)));

        // 对于每个账号，设置一个定时器
        let intervals = [];
        let timeouts = [];
        authenticatorList.list.forEach(item => {
            // 计算验证码的有效期
            const timeRemaining = (30 - Math.floor((Date.now() / 1000) % 30)) * 1000;

            const timeout = setTimeout(() => {
                // 生成并发送该账号的验证码
                const totp = speakeasy.totp({
                    secret: item.secret,
                    encoding: 'base32',
                    algorithm: item.encrypt.toLowerCase(),
                    digits: item.digit,
                    step: item.interval
                });
                ws.send(JSON.stringify(
                    [{
                        id: item.id,
                        totp
                    }]
                ));

                // 设置一个新的定时器，以在每个时间步长时刷新验证码
                const interval = setInterval(() => {
                    // 生成并发送该账号的验证码
                    const totp = speakeasy.totp({
                        secret: item.secret,
                        encoding: 'base32',
                        algorithm: item.encrypt.toLowerCase(),
                        digits: item.digit,
                        step: item.interval
                    });
                    ws.send(JSON.stringify(
                        [{
                            id: item.id,
                            totp
                        }]
                    ));
                }, item.interval * 1000);
                intervals.push(interval);
            }, timeRemaining);
            timeouts.push(timeout);
        });

        // 添加一个消息事件监听器
        ws.on('message', (message) => {
            message = message.toString();
            if (message === 'reload') {
                // 如果接收到的消息是"reload"，则重新加载 authenticatorList.json 文件，并发送一条包含所有新的验证码的初始化消息
                authenticatorList = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../../data/authenticatorList.json'), 'utf8'));
                console.log(`WebSocket Connection ${wsConnectionNumber} - Reloading authenticatorList.json file...`);
                ws.send(JSON.stringify(generateTOtps(authenticatorList)));

                // 清除所有的定时器和延时
                intervals.forEach(interval => clearInterval(interval));
                timeouts.forEach(timeout => clearTimeout(timeout));
                intervals = [];
                timeouts = [];

                // 对于每个账号，重新设置一个定时器
                authenticatorList.list.forEach(item => {
                    // 计算验证码的有效期
                    const timeRemaining = (30 - Math.floor((Date.now() / 1000) % 30)) * 1000;

                    const timeout = setTimeout(() => {
                        // 生成并发送该账号的验证码
                        const totp = speakeasy.totp({
                            secret: item.secret,
                            encoding: 'base32',
                            algorithm: item.encrypt.toLowerCase(),
                            digits: item.digit,
                            step: item.interval
                        });
                        ws.send(JSON.stringify(
                            [{
                                id: item.id,
                                totp
                            }]
                        ));

                        // 设置一个新的定时器，以在每个时间步长时刷新验证码
                        const interval = setInterval(() => {
                            // 生成并发送该账号的验证码
                            const totp = speakeasy.totp({
                                secret: item.secret,
                                encoding: 'base32',
                                algorithm: item.encrypt.toLowerCase(),
                                digits: item.digit,
                                step: item.interval
                            });
                            ws.send(JSON.stringify(
                                [{
                                    id: item.id,
                                    totp
                                }]
                            ));
                        }, item.interval * 1000);
                        intervals.push(interval);
                    }, timeRemaining);
                    timeouts.push(timeout);
                });
            }
        });

        // 添加一个关闭事件监听器
        ws.on('close', () => {
            console.log(`WebSocket Connection ${wsConnectionNumber} closed.`);
        });
    });
}

module.exports = handleWebSocketRoutes;
