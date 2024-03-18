/*
    deleteAuthenticator.js
    删除Authenticator
*/

const fs = require('fs');
const path = require('path');

async function deleteAuthenticator(req, res) {
    try {
        const authenticatorList = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../data/authenticatorList.json'), 'utf8'));
        const idToDelete = parseInt(req.query.id);

        if (!idToDelete) {
            return res.status(400).json({success: false, message: "Please provide an ID."});
        }

        const indexToDelete = authenticatorList.list.findIndex(authenticator => authenticator.id === idToDelete);
        console.log(indexToDelete)

        if (indexToDelete === -1) {
            return res.status(404).json({success: false, message: "Authenticator not found."});
        }

        authenticatorList.list.splice(indexToDelete, 1);
        fs.writeFileSync(path.join(__dirname, '../../../data/authenticatorList.json'), JSON.stringify(authenticatorList, null, 4), 'utf8');
        return res.status(200).json({success: true, message: "Authenticator deleted successfully."});
    } catch (error) {
        console.error(error);
        return res.status(500).json({success: false, message: "An error occurred while deleting the Authenticator."});
    }
}

module.exports = {deleteAuthenticator};