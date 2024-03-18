/*
    addAuthenticator.js
    添加安全令
*/
const apiURL = `http://localhost:16526/api/addAuthenticator/`;
import {generateAuthenticatorCards} from "./initAuthenticatorPage.js";

export async function addAuthenticator(addName, addAccount, addSecret, addDigit, addInterval, addEncrypt) {
    try {
        const postData = {
            name: addName,
            account: addAccount,
            icon: null,
            secret: addSecret,
            digit: addDigit,
            interval: addInterval,
            encrypt: addEncrypt,
        };
        const response = await fetch(apiURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData)
        });

        const data = await response.json();

        if (data.success !== true) {
            return false;
        }
        console.log('success')
        mdui.snackbar({
            message: "保存成功",
        });
        await generateAuthenticatorCards()

        return true;

    } catch (error) {
        mdui.alert({
            headline: "保存失败",
            description: "程序内部错误",
            confirmText: "好的",
        });
        console.log(error);
    }
}