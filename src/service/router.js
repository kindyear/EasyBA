/*
    router.js
    处理路由
*/

const express = require('express');
const router = express();
const cors = require('cors');
const packageInfo = require('../../package.json');


const {getTime} = require('./src/getTime');
const {getAuthenticatorList} = require('./src/getAuthenticatorList');
const {addAuthenticator} = require('./src/addAuthenticator');
const {deleteAuthenticator} = require('./src/deleteAuthenticator');
const {editAuthenticator} = require('./src/editAuthenticator');
const {exportAuthenticator} = require('./src/exportAuthenticator');
const {getDeviceSecret} = require("./src/getDeviceSecret");
const {convertDeviceSecret} = require("./src/secretConverter");

router.use(express.urlencoded({extended: true}));
router.use(express.json());
router.use(cors());

router.get('/', (req, res) => {
    res.status(200).send({
        message: 'EasyBA Application API',
        version: packageInfo.version,
        apiList: {
            "/api/": "返回API列表",
            "/api/getTime": "返回当前时间",
            "/api/getAuthenticatorList": "返回Authenticator列表",
            "/api/addAuthenticator": "添加Authenticator",
            "/api/deleteAuthenticator": "删除Authenticator",
            "/api/editAuthenticator": "编辑Authenticator",
            "/api/exportAuthenticator": "导出Authenticator",
        }
    });
});
router.get('/getTime', (req, res) => getTime(req, res));
router.get('/getAuthenticatorList', (req, res) => getAuthenticatorList(req, res));
router.post('/addAuthenticator', (req, res) => addAuthenticator(req, res));
router.get('/deleteAuthenticator', (req, res) => deleteAuthenticator(req, res));
router.post('/editAuthenticator', (req, res) => editAuthenticator(req, res));
router.get('/exportAuthenticator', (req, res) => exportAuthenticator(req, res));

router.get('/getDeviceSecret', (req, res) => getDeviceSecret(req, res));
router.get('/convertDeviceSecret', (req, res) => convertDeviceSecret(req, res));

module.exports = router;