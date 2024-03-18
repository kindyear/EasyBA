import {addAuthenticator} from "./js/addAuthenticator.js";
import {deleteAuthenticator, saveEditAuthenticator} from "./js/editAuthenticator.js";
import {exportAuthenticator} from "./js/exportAuthenticator.js";
import {addBattlenetAuth} from "./js/addBattlenetAuth.js";
import {checkUpdate} from "./js/checkUpdate.js";


document.getElementById('closeButton').addEventListener('click', () => {
    ipcRenderer.send('close-window');
});

document.getElementById('minimizeButton').addEventListener('click', () => {
    ipcRenderer.send('minimize-window');
});

document.getElementById('maximizeButton').addEventListener('click', () => {
    ipcRenderer.send('maximize-window');
});

//  暗色亮色模式切换
let darkOrLightMode = document.getElementById('dark-mode-switch');
darkOrLightMode.addEventListener('change', function () {
    if (darkOrLightMode.checked) {
        document.documentElement.classList.remove('mdui-theme-dark');
        document.documentElement.classList.add('mdui-theme-light');
    } else {
        document.documentElement.classList.remove('mdui-theme-light');
        document.documentElement.classList.add('mdui-theme-dark');
    }
});

//  导航栏切换
// 获取所有的导航栏项
let navItems = document.querySelectorAll('mdui-navigation-bar-item');

// 为每个导航栏项添加点击事件监听器
navItems.forEach((navItem, index) => {
    navItem.addEventListener('click', () => {
        // 隐藏所有的tab页面
        let tabs = document.querySelectorAll('.tab');
        tabs.forEach(tab => {
            tab.style.display = 'none';
        });

        // 显示对应的tab页面
        let tabToShow = document.getElementById(navItem.getAttribute('value'));
        if (tabToShow) {
            tabToShow.style.display = 'block';
        }
    });
});

// 添加安全令对话框
const addAuthDialog = document.getElementById("addAuthenticatorWindow");
const openAddAuthButton = document.getElementById("addAuthenticator");
const closeAddAuthButton = addAuthDialog.querySelector(".closeAuthenticatorWindow");
openAddAuthButton.addEventListener("click", () => addAuthDialog.open = true);
closeAddAuthButton.addEventListener("click", () => addAuthDialog.open = false);

// 添加安全令
const saveAuthenticatorButton = document.getElementById("saveAuthenticator");
saveAuthenticatorButton.addEventListener("click", async () => {
    const addName = document.getElementById('addAuthenticatorName').value;
    const addAccount = document.getElementById('addAuthenticatorAccount').value;
    const addSecret = document.getElementById('addAuthenticatorSecret').value;
    const addEncrypt = document.getElementById('addAuthenticatorEncrypt').value;
    const addDigit = document.getElementById('addAuthenticatorDigit').value;
    const addInterval = document.getElementById('addAuthenticatorInterval').value;
    if (addName === '' || addAccount === '' || addSecret === '' || addEncrypt === '' || addDigit === '' || addInterval === '') {
        mdui.alert({
            headline: "保存失败",
            description: "请填写所有信息",
            confirmText: "好的",
        });
        return;
    }
    const addAuthResult = await addAuthenticator(addName, addAccount, addSecret, addDigit, addInterval, addEncrypt);
    console.log(addAuthResult);
    if (addAuthResult === true) {
        addAuthDialog.open = false;
        // 清除 addName, addAccount, addSecret 的值
        document.getElementById('addAuthenticatorName').value = '';
        document.getElementById('addAuthenticatorAccount').value = '';
        document.getElementById('addAuthenticatorSecret').value = '';

        // 将 addDigit, addInterval, addEncrypt 的值设定为指定的值
        document.getElementById('addAuthenticatorDigit').value = '6';
        document.getElementById('addAuthenticatorInterval').value = '30';
        document.getElementById('addAuthenticatorEncrypt').value = 'sha1';
    }
});

// 编辑安全令对话框
const editAuthDialog = document.getElementById("editAuthenticatorWindow");
const closeEditAuthButton = editAuthDialog.querySelector(".closeEditAuthenticatorWindow");
const saveEditAuthButton = document.getElementById("saveEditAuthenticator");
const deleteAuthButton = document.getElementById("deleteEditAuthenticator");

deleteAuthButton.addEventListener("click", async () => {
    const id = document.getElementById('editAuthenticatorWindowId').value;
    const name = document.getElementById('editAuthenticatorName').value;
    const account = document.getElementById('editAuthenticatorAccount').value;
    mdui.dialog({
        headline: "确认删除？",
        description: "你确认要删除该验证码？该操作不可逆" + "你要删除的是【ID】: " + id + "" + "【名称】: " + name + "" + "【账户】: " + account + "",
        actions: [
            {
                text: "取消",
            },
            {
                text: "确认删除",
                onClick: () => {
                    deleteAuthenticator();
                    return true;
                },
            }
        ]
    });
});
saveEditAuthButton.addEventListener("click", saveEditAuthenticator)
closeEditAuthButton.addEventListener("click", () => editAuthDialog.open = false);

//  导出安全令
const exportAuthDialog = document.getElementById("exportAuthenticatorWindow");
const closeExportAuthButton = exportAuthDialog.querySelector(".closeExportAuthenticatorWindow");
const exportAuthButton = document.getElementById("exportAuthenticator");
exportAuthButton.addEventListener("click", async () => {
    await exportAuthenticator()
    editAuthDialog.open = false;
    exportAuthDialog.open = true
});

closeExportAuthButton.addEventListener("click", () => exportAuthDialog.open = false);

//  添加战网安全令
const addBnetAuthDialog = document.getElementById("addBnetAuthenticatorWindow");
const openAddBnetAuthButton = document.getElementById("addBnetAuthenticator");
const closeAddBnetAuthButton = addBnetAuthDialog.querySelector(".closeBnetAuthenticatorWindow");
const saveAddBnetAuthenticator = document.getElementById("saveBnetAuthenticator");

window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('openWebPageButton').addEventListener('click', () => {
        openBrowser.openExternal('https://account.battle.net/login/en/?ref=localhost');
    });
    document.getElementById('helpDoc').addEventListener('click', () => {
        openBrowser.openExternal('https://www.kindyear.cn/archives/921');
    });
    document.getElementById('callAuthor').addEventListener('click', () => {
        openBrowser.openExternal('mailto://kindyear@icloud.com');
    });
    document.getElementById('joinQGroup').addEventListener('click', () => {
        openBrowser.openExternal('http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=JUg2zyhvEgA5M9RGKRGkV7QGFUBf45n_&authKey=Z4ZPOio5%2FK2oKXVAaPPZEXXCph6eQ3A%2BZ5OYb71idQ47dDNYFwxrxEJR%2Frf5GWHz&noverify=0&group_code=471522762');
    });
    openAddBnetAuthButton.addEventListener("click", () => addBnetAuthDialog.open = true);
    closeAddBnetAuthButton.addEventListener("click", () => addBnetAuthDialog.open = false);
    saveAddBnetAuthenticator.addEventListener("click", addBattlenetAuth);
});

async function updateInfoPageVersion() {
    //  关于卡片的程序版本获取
    const version = document.getElementById('appVersion');
    const versionResponse = await fetch('http://127.0.0.1:16526/api/')
    const versionJson = await versionResponse.json();
    console.log(versionJson)
    version.innerHTML = versionJson.version;
}

await updateInfoPageVersion();

const checkUpdateButton = document.getElementById("checkUpdate");
checkUpdateButton.addEventListener("click", async () => {
    await checkUpdate();
});

