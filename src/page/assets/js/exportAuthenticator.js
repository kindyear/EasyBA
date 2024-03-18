/*
    exportAuthenticator.js
    导出安全令
*/

export async function exportAuthenticator() {
    const exportAuthenticatorId = document.getElementById('editAuthenticatorWindowId').value;
    const exportApi = `http://127.0.0.1:16526/api/exportAuthenticator?id=${exportAuthenticatorId}`;
    const response = await fetch(exportApi);
    const data = await response.json();
    if (data.success === false) {
        return false;
    }
    const otpauth = data.otpauthUrl;
    const name = data.authenticatorInfo.name;
    const account = data.authenticatorInfo.account;
    const secret = data.authenticatorInfo.secret;
    const digit = data.authenticatorInfo.digit;
    const interval = data.authenticatorInfo.interval;
    const encrypt = data.authenticatorInfo.encrypt;
    const qrcode = data.qrCodeDataUrl;

    document.getElementById('exportAuthenticatorName').value = name;
    document.getElementById('exportAuthenticatorAccount').value = account;
    document.getElementById('exportAuthenticatorSecret').value = secret;
    document.getElementById('exportAuthenticatorDigit').value = digit;
    document.getElementById('exportAuthenticatorInterval').value = interval;
    document.getElementById('exportAuthenticatorEncrypt').value = encrypt;
    document.querySelector('.exportAuthenticatorQrCode').src = qrcode;

    const exportAuthDialog = document.getElementById("exportAuthenticatorWindow");
    // 修改对话框的标题
    exportAuthDialog.headline = `导出验证码(${name})`;

    // 为 "保存二维码" 按钮添加点击事件监听器
    const saveExportQrCodeButton = document.getElementById('saveExportQrCode');
    const saveExportQrCodeHandler = () => {
        const imgSrc = document.querySelector('.exportAuthenticatorQrCode').src;
        fetch(imgSrc)
            .then(response => response.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                // the filename you want
                a.download = 'qrcode.png';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
            })
            .catch(() => alert('保存二维码失败'));
    };
    saveExportQrCodeButton.removeEventListener('click', saveExportQrCodeHandler);
    saveExportQrCodeButton.addEventListener('click', saveExportQrCodeHandler);

// 为 "复制OtpAuth链接" 按钮添加点击事件监听器
    const copyOtpAuthLinkButton = document.getElementById('copyOtpAuthLink');
    const copyOtpAuthLinkHandler = () => {
        navigator.clipboard.writeText(otpauth);
        mdui.snackbar({
            message: "已复制到剪贴板",
        });
    };
    copyOtpAuthLinkButton.removeEventListener('click', copyOtpAuthLinkHandler);
    copyOtpAuthLinkButton.addEventListener('click', copyOtpAuthLinkHandler);
}