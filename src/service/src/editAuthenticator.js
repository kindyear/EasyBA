/*
    editAuthenticator.js
    编辑Authenticator
*/

const fs = require('fs');
const path = require('path');

async function editAuthenticator(req, res) {
    try {
        const authenticatorList = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../data/authenticatorList.json'), 'utf8'));
        const editedAuthenticatorBody = req.body;

        const idToEdit = Number(editedAuthenticatorBody.id);

        if (isNaN(idToEdit)) {
            return res.status(400).json({success: false, message: "Invalid ID."});
        }

        if (!idToEdit) {
            return res.status(400).json({success: false, message: "Please provide an ID."});
        }

        const indexToEdit = authenticatorList.list.findIndex(authenticator => authenticator.id === idToEdit);

        if (indexToEdit === -1) {
            return res.status(404).json({success: false, message: "Authenticator not found."});
        }

        const keys = Object.keys(editedAuthenticatorBody);
        if (keys.length < 2) {
            return res.status(400).json({success: false, message: "Please provide at least one field to update."});
        }

        keys.forEach(key => {
            if (key !== 'id') {
                authenticatorList.list[indexToEdit][key] = editedAuthenticatorBody[key];
            }
        });

        fs.writeFileSync(path.join(__dirname, '../../../data/authenticatorList.json'), JSON.stringify(authenticatorList, null, 4), 'utf8');
        return res.status(200).json({success: true, message: "Authenticator edited successfully."});
    } catch (error) {
        console.error(error);
        return res.status(500).json({success: false, message: "An error occurred while editing the Authenticator."});
    }
}

module.exports = {editAuthenticator};

module.exports = {editAuthenticator};