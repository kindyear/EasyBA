import {generateAuthenticatorCards} from "./initAuthenticatorPage.js";

const exportApi = `http://localhost:16526/api/exportAuthenticator`;
const editApi = `http://localhost:16526/api/editAuthenticator`;
const deleteApi = `http://localhost:16526/api/deleteAuthenticator`;

export async function getAuthenticatorInfo(id) {
    const response = await fetch(`${exportApi}?id=${id}`);
    const data = await response.json();
    const editName = data.authenticatorInfo.name;
    const editAccount = data.authenticatorInfo.account;
    const editSecret = data.authenticatorInfo.secret;
    const editDigit = data.authenticatorInfo.digit;
    const editInterval = data.authenticatorInfo.interval;
    const editEncrypt = data.authenticatorInfo.encrypt;
    return {editName, editAccount, editSecret, editDigit, editInterval, editEncrypt};
}

export async function saveEditAuthenticator() {
    let id = document.getElementById('editAuthenticatorWindowId').value;
    id = parseInt(id);
    console.log(id);
    if (id === null || id === undefined) {
        console.log("空的")
        return false;
    }
    const name = document.getElementById('editAuthenticatorName').value;
    const account = document.getElementById('editAuthenticatorAccount').value;
    const secret = document.getElementById('editAuthenticatorSecret').value;
    const digit = document.getElementById('editAuthenticatorDigit').value;
    const interval = document.getElementById('editAuthenticatorInterval').value;
    const encrypt = document.getElementById('editAuthenticatorEncrypt').value;

    if (name === '' || account === '' || secret === '' || digit === '' || interval === '' || encrypt === '') {
        mdui.alert({
            headline: "修改失败",
            description: "输入框不得为空",
            confirmText: "好的",
        });
        return false;
    }


    const postBody = {
        id: id,
        name: name,
        account: account,
        secret: secret,
        digit: digit,
        interval: interval,
        encrypt: encrypt
    };
    const response = await fetch(editApi, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(postBody)
    });

    try {
        // 使用 .json() 方法获取 JSON 数据
        const responseData = await response.json();

        // 确保请求成功
        if (response.ok) {
            if (responseData.success === true) {
                const editAuthDialog = document.getElementById("editAuthenticatorWindow");
                editAuthDialog.open = false;
                console.log("刷新")
                await generateAuthenticatorCards();
                mdui.snackbar({
                    message: "修改成功",
                });
                return true;
            } else {
                mdui.snackbar({
                    message: "修改失败，" + responseData.error, // 如果有错误信息，可以添加到提示中
                });
                return false;
            }
        } else {
            console.error('Failed to fetch data:', response.status, response.statusText);
            return false;
        }
    } catch (error) {
        console.error('Error parsing JSON:', error);
        return false;
    }
}

export async function deleteAuthenticator() {
    let id = document.getElementById('editAuthenticatorWindowId').value;
    id = parseInt(id);
    console.log(id);
    if (id === null || id === undefined) {
        console.log("空的")
        return false;
    }

    const response = await fetch(`${deleteApi}?id=${id}`);
    const responseData = await response.json();

    try {
        // 确保请求成功
        if (response.ok) {
            if (responseData.success === true) {
                const editAuthDialog = document.getElementById("editAuthenticatorWindow");
                editAuthDialog.open = false;
                console.log("刷新")
                await generateAuthenticatorCards();
                mdui.snackbar({
                    message: "删除成功",
                });
                return true;
            } else {
                mdui.snackbar({
                    message: "删除失败，" + responseData.error, // 如果有错误信息，可以添加到提示中
                });
                return false;
            }
        } else {
            console.error('Failed to fetch data:', response.status, response.statusText);
            return false;
        }
    } catch (error) {
        console.error('Error parsing JSON:', error);
        return false;
    }
}