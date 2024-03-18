/*
    checkUpdate.js
    检查更新
*/

export async function checkUpdate() {
    try {
        const checkUpdateUrl = await fetch('https://api.kindyear.cn/projects/easyba/update.json')
        const remoteVersionInfo = await checkUpdateUrl.json();
        const remoteVersion = remoteVersionInfo.version;
        const versionResponse = await fetch('http://127.0.0.1:16526/api/')
        const versionJson = await versionResponse.json();
        const localVersion = versionJson.version
        console.log('本地版本：' + localVersion);
        console.log('远程版本：' + remoteVersion);

        const compareResult = compareVersions(remoteVersion, localVersion);

        if (compareResult > 0) {
            const updateInfo = remoteVersionInfo.updateInfo.replace(/\n/g, '<br/>');
            const updateTime = remoteVersionInfo.updateTime;
            const dlUrl = remoteVersionInfo.dlUrl;

            console.log(updateInfo);
            document.getElementById('currentVersion').innerText = localVersion;
            document.getElementById('latestVersion').innerText = remoteVersion;
            document.getElementById('updateTime').innerText = updateTime;
            document.getElementById('updateInfo').innerHTML = updateInfo;

            const updateWindow = document.getElementById('updateWindow');
            const updateButton = document.getElementById('updateWindowDownload');
            const cancelButton = document.getElementById('updateWindowCancel');

            function updateButtonClickHandler() {
                openBrowser.openExternal(`${dlUrl}`);
                updateWindow.open = false;
                updateButton.removeEventListener('click', updateButtonClickHandler);
            }

            // 移除旧的事件监听器
            updateButton.removeEventListener('click', updateButtonClickHandler);
            // 添加新的事件监听器
            updateButton.addEventListener('click', updateButtonClickHandler);

            cancelButton.addEventListener('click', () => {
                updateWindow.open = false;
            });

            console.log('准备打开更新窗口')
            updateWindow.open = true;
            console.log('执行更新操作');
        } else if (compareResult === 0) {
            mdui.snackbar({
                message: "已经是最新版本啦",
            });
            console.log('执行版本相等时的操作');
        } else {
            mdui.snackbar({
                message: "为什么你的版本比最新版本还新?",
            });
        }
    } catch (error) {
        console.log(error.message);
        mdui.snackbar({
            message: "检测更新失败，请检查网络",
        });
    }
}

function compareVersions(a, b) {
    const pa = a.split('.');
    const pb = b.split('.');
    for (let i = 0; i < 3; i++) {
        const na = parseInt(pa[i]);
        const nb = parseInt(pb[i]);
        if (na > nb) return 1;
        if (na < nb) return -1;
        if (!isNaN(na) && isNaN(nb)) return 1;
        if (isNaN(na) && !isNaN(nb)) return -1;
    }
    return 0;
}