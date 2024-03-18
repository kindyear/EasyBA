/*
    addAuthenticator.js
    添加Authenticator
*/

const fs = require('fs');
const path = require('path');

async function addAuthenticator(req, res) {
    try {
        const authenticatorList = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../data/authenticatorList.json'), 'utf8'));
        const authenticatorBody = req.body;
        console.log(req.body);
        if (!authenticatorBody === undefined || null) {
            return res.status(400).json({success: false, message: "Please provide a body."});
        }
        // 查找现有的Authenticator列表中的最大ID
        let maxId = Math.max(...authenticatorList.list.map(authenticator => authenticator.id));
        console.log('MAXID:', maxId);
        if (maxId === undefined || maxId === null || maxId === -Infinity || maxId === Infinity) {
            maxId = 0;
        }
        // 生成新的Authenticator的ID
        const newId = maxId + 1;
        console.log('NEWID', newId);


        const newAuthenticator = {
            id: newId,
            name: authenticatorBody.name,
            account: authenticatorBody.account,
            icon: authenticatorBody.icon,
            secret: authenticatorBody.secret,
            digit: authenticatorBody.digit,
            interval: authenticatorBody.interval,
            encrypt: authenticatorBody.encrypt,
            latestEdited: new Date().getTime()
        };

        authenticatorList.list.push(newAuthenticator);
        fs.writeFileSync(path.join(__dirname, '../../../data/authenticatorList.json'), JSON.stringify(authenticatorList, null, 4), 'utf8');
        return res.status(200).json({
            success: true,
            message: "Authenticator added successfully.",
            time: new Date().getTime()
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({success: false, message: "Delete failed."});
    }
}

module.exports = {addAuthenticator};