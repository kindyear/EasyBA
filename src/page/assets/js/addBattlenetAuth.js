/*
    addBattleNetAuth.js
    添加战网安全令
*/

const getDeviceSecretApi = `http://127.0.0.1:16526/api/getDeviceSecret`;
const convertDeviceSecretApi = `http://127.0.0.1:16526/api/convertDeviceSecret`;
import {addAuthenticator} from "./addAuthenticator.js";

export async function addBattlenetAuth() {
    const saveButton = document.getElementById('saveBnetAuthenticator');
    const addBnetAuthDialog = document.getElementById("addBnetAuthenticatorWindow");
    saveButton.setAttribute('loading', '');
    saveButton.setAttribute('disabled', '');

    const tokenUrl = document.getElementById('addBnetAuthenticatorTokenUrl').value;
    const token40Bit = document.getElementById('addBnetAuthenticator40bitToken').value;
    const name = document.getElementById('addBnetAuthenticatorName').value;
    const account = document.getElementById('addBnetAuthenticatorAccount').value;

    // 判断添加类型，如果只填写了tokenUrl就分析tokenUrl，如果只填写了token40Bit就分析token40Bit，如果两个都填写了就分析token40Bit
    // 确保name和account不为空
    if (name === '' || account === '') {
        console.error('Name and account cannot be empty.');
        mdui.alert({
            headline: "保存失败",
            description: "账号和名称不得为空",
            confirmText: "好的",
        });
        saveButton.removeAttribute('loading');
        saveButton.removeAttribute('disabled');
        return;
    }
    // 判断添加类型
    if (tokenUrl !== '' && token40Bit === '') {
        // 只填写了tokenUrl，分析tokenUrl
        const STtoken = getSTParameterValue(tokenUrl);

        // 验证 ST 参数值格式
        if (STtoken !== null && validateSTFormat(STtoken)) {
            console.log('ST parameter is valid:', STtoken);
            const otpSecret = await getDeviceSecret(STtoken);
            if (otpSecret === null) {
                console.error('Failed to get device secret.');
                mdui.alert({
                    headline: "保存失败",
                    description: "获取设备密钥失败,请重新打开网页登录复制URL并重试",
                    confirmText: "好的",
                });
                saveButton.removeAttribute('loading');
                saveButton.removeAttribute('disabled');
                return false;
            }
            await addAuthenticator(name, account, otpSecret, 8, 30, 'sha1');
            saveButton.removeAttribute('loading');
            saveButton.removeAttribute('disabled');
            addBnetAuthDialog.open = false;
            mdui.snackbar({
                message: "保存成功",
            });
            return true;
        } else {
            console.error('Invalid or missing ST parameter.');
            saveButton.removeAttribute('loading');
            saveButton.removeAttribute('disabled');
            mdui.alert({
                headline: "保存失败",
                description: "请检查URL是否复制完毕，无法获取ST参数",
                confirmText: "好的",
            });
            return false;
        }
    } else if (tokenUrl === '' && token40Bit !== '') {
        // 只填写了token40Bit，分析token40Bit
        console.log('Analyzing token40Bit:', token40Bit);
        const otpSecret = await convertDeviceSecret(token40Bit);
        await addAuthenticator(name, account, otpSecret, 8, 30, 'sha1');
        saveButton.removeAttribute('loading');
        saveButton.removeAttribute('disabled');
        addBnetAuthDialog.open = false;
        mdui.snackbar({
            message: "保存成功",
        });
        return true;
    } else if (tokenUrl !== '' && token40Bit !== '') {
        console.log('Analyzing token40Bit:', token40Bit);
        const otpSecret = await convertDeviceSecret(token40Bit);
        await addAuthenticator(name, account, otpSecret, 8, 30, 'sha1');
        saveButton.removeAttribute('loading');
        saveButton.removeAttribute('disabled');
        addBnetAuthDialog.open = false;
        mdui.snackbar({
            message: "保存成功",
        });
        return true;
    } else {
        mdui.alert({
            headline: "保存失败",
            description: "请完善信息",
            confirmText: "好的",
        });
        saveButton.removeAttribute('loading');
        saveButton.removeAttribute('disabled');
        return false;
    }
}

async function getDeviceSecret(STtoken) {
    const response = await fetch(`${getDeviceSecretApi}?token=${STtoken}`);
    const data = await response.json();
    console.log(data);
    if (data.success !== true) {
        return null;
    }
    return data.data.otpSecret;

}

async function convertDeviceSecret(token) {
    const response = await fetch(`${convertDeviceSecretApi}?value=${token}`);
    const data = await response.json();
    console.log(data);
    if (data.success !== true) {
        return null;
    }
    return data.data.result;
}

function getSTParameterValue(url) {
    const match = url.match(/[?&]ST=([^&]+)/);
    return match ? match[1] : null;
}

// 验证 ST 参数值是否满足格式要求
function validateSTFormat(stValue) {
    const pattern = /^(KR|US|EU)-[a-f0-9]{32}-[0-9]+$/i;
    return pattern.test(stValue);
}