/*
    getAuthenticatorList.js
    返回Authenticator列表
*/

const fs = require('fs');
const path = require('path');

async function getAuthenticatorList(req, res) {
    const authenticatorList = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../data/authenticatorList.json'), 'utf8'));
    const processedList = authenticatorList.list.map(item => {
        return {
            id: item.id,
            name: item.name,
            account: item.account,
            icon: item.icon,
            interval: item.interval,
        };
    });
    // 返回处理后的数据
    return res.status(200).json(processedList);
}

module.exports = {getAuthenticatorList};