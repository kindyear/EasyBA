/*
    checkDataList.js
    检测authenticatorList.json
*/

const fs = require('fs').promises;
const {app} = require('electron');
const path = require('path');
const log = require('electron-log');

// 使用 app.isPackaged 检查是否在打包模式下运行
const isPackaged = app.isPackaged;

// 获取资源文件夹路径
const dataFolderRelativePath = isPackaged ? 'resources/app.asar.unpacked/data' : 'resources/app.asar.unpacked/data';
const dataFolderPath = path.join(process.cwd(), dataFolderRelativePath, '/');


// 获取 authenticatorList.json 文件路径
const authenticatorListFilePath = path.join(dataFolderPath, 'authenticatorList.json');
log.info(dataFolderPath);
log.info(authenticatorListFilePath);

async function checkAndCreateAuthenticatorList() {
    try {
        // 检查 authenticatorList.json 是否存在
        log.info('检查 authenticatorList.json 是否存在');
        await fs.access(authenticatorListFilePath, fs.constants.F_OK);

        // 如果文件存在，执行后续操作
        log.info('authenticatorList.json 存在，读取文件内容');
        const fileContent = await fs.readFile(authenticatorListFilePath, 'utf-8');

        // 解析 JSON 内容
        const parsedContent = JSON.parse(fileContent);

        // 检查 list 是否为空
        if (!parsedContent.list || parsedContent.list.length === 0) {
            log.info('list 为空，向其添加一个默认的数据项');
            // 如果 list 为空，向其添加一个默认的数据项
            parsedContent.list = [
                {
                    "id": 1,
                    "name": "EasyBA Demo",
                    "account": "hi@easyba.com",
                    "icon": null,
                    "secret": "JBSWY3DPFRKGQ2LTEBUXGICFMFZXSQSB",
                    "digit": "6",
                    "interval": "30",
                    "encrypt": "sha1",
                    "latestEdited": 1000000000
                }
            ];
        }

        // 保存修改后的内容
        await fs.writeFile(authenticatorListFilePath, JSON.stringify(parsedContent, null, 2), 'utf-8');
    } catch (error) {
        // 文件不存在，使用内置模板内容创建新文件
        if (error.code === 'ENOENT') {
            log.info('authenticatorList.json 不存在，使用内置模板内 容创建新文件');
            await createAuthenticatorListFromTemplate();
        } else {
            // 处理其他错误
            log.info('检查 authenticatorList.json 时出错');
            log.info(error);
        }
    }
}

async function createAuthenticatorListFromTemplate() {
    log.info('创建 authenticatorList.json');
    try {
        // 读取模板文件内容
        const templateContent = {
            "version": "1.0.0",
            "list": [
                {
                    "id": 1,
                    "name": "EasyBA Demo",
                    "account": "hi@easyba.com",
                    "icon": null,
                    "secret": "JBSWY3DPFRKGQ2LTEBUXGICFMFZXSQSB",
                    "digit": "6",
                    "interval": "30",
                    "encrypt": "sha1",
                    "latestEdited": 1000000000
                }
            ]
        };

        // 将模板内容转换为 JSON 字符串
        const jsonString = JSON.stringify(templateContent, null, 2);

        // 将模板内容异步写入新文件
        await fs.writeFile(authenticatorListFilePath, jsonString, 'utf-8');
        log.info('文件成功创建！');
    } catch (error) {
        log.info('创建 authenticatorList.json 失败');
        log.info(error);
    }
}

module.exports = {
    checkAndCreateAuthenticatorList
};