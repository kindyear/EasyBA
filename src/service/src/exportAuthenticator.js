/*
    exportAuthenticator.js
    导出Authenticator
*/

const fs = require('fs');
const path = require('path');
const qrcode = require('qrcode');

async function exportAuthenticator(req, res) {
    try {
        const authenticatorList = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../data/authenticatorList.json'), 'utf8'));
        const idToExport = parseInt(req.query.id);

        if (isNaN(idToExport)) {
            return res.status(400).json({success: false, message: "Invalid ID."});
        }

        if (!idToExport) {
            return res.status(400).json({success: false, message: "Please provide an ID."});
        }

        const authenticatorToExport = authenticatorList.list.find(authenticator => authenticator.id === idToExport);

        if (!authenticatorToExport) {
            return res.status(404).json({success: false, message: "Authenticator not found."});
        }

        // Generate otpauth URL manually
        let otpauthUrl = `otpauth://totp/${authenticatorToExport.name.replace(/#/g, '-')}:${authenticatorToExport.account}?secret=${authenticatorToExport.secret}&issuer=Authenticator&algorithm=${authenticatorToExport.encrypt}&digits=${authenticatorToExport.digit}&period=${authenticatorToExport.interval}`;

        // Generate QR code
        let qrCodeDataUrl = await qrcode.toDataURL(otpauthUrl);

        // Customize the export format as needed
        const exportFormat = {
            success: true,
            id: idToExport,
            otpauthUrl: otpauthUrl,
            authenticatorInfo: {
                name: authenticatorToExport.name,
                account: authenticatorToExport.account,
                secret: authenticatorToExport.secret,
                digit: authenticatorToExport.digit,
                interval: authenticatorToExport.interval,
                encrypt: authenticatorToExport.encrypt,
            },
            qrCodeDataUrl: qrCodeDataUrl
        };

        // Send the exported authenticator as a response
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(exportFormat, null, 4));
    } catch (error) {
        console.error(error);
        return res.status(500).json({success: false, message: "An error occurred while exporting the Authenticator."});
    }
}

module.exports = {exportAuthenticator}