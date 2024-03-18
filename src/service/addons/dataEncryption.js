/*
    dataEncryption.js
    数据加密
*/

const fs = require('fs');
const crypto = require('crypto');
const config = require('../../../config.json');
const authenticatorList = require('../../../data/authenticatorList.json');

const ENCRYPTION_ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = Buffer.from(config.ENCRYPTION_KEY, 'utf8').slice(0, 32);
if (ENCRYPTION_KEY.length !== 32) {
    console.error('Encryption key should be 32 bytes (256 bits) long.');
    process.exit(1);
}
const IV_LENGTH = 16;

// 加密函数
function encrypt(text) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
}

// 解密函数
function decrypt(text) {
    const [ivHex, encrypted] = text.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

// 读取加密文件，解密后传递给其他模块
function readFileAndDecrypt(filePath) {
    try {
        const encryptedData = fs.readFileSync(filePath, 'utf8');
        const decryptedData = decrypt(encryptedData);
        return JSON.parse(decryptedData);
    } catch (error) {
        console.error('Error reading and decrypting file:', error.message);
        return null;
    }
}

// 对数据进行加密后写入文件
function encryptAndWriteFile(filePath, data) {
    try {
        const encryptedData = encrypt(JSON.stringify(data));
        fs.writeFileSync(filePath, encryptedData, 'utf8');
        console.log('File encrypted and written successfully.');
    } catch (error) {
        console.error('Error encrypting and writing file:', error.message);
    }
}

module.exports = {readFileAndDecrypt, encryptAndWriteFile};