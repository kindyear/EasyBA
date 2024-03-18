import {getAuthenticatorInfo} from "./editAuthenticator.js";

export async function showEditAuthenticatorWindow() {

    let id = this.id.match(/\d+/) ? this.id.match(/\d+/)[0] : null;
    const {editName, editAccount, editSecret, editDigit, editInterval, editEncrypt} = await getAuthenticatorInfo(id);
    console.log(id, editName, editAccount, editSecret, editDigit, editInterval, editEncrypt);

    // 更新对应的文本框和选择框的值
    document.getElementById('editAuthenticatorName').value = editName || '';
    document.getElementById('editAuthenticatorAccount').value = editAccount || '';
    document.getElementById('editAuthenticatorSecret').value = editSecret || '';
    document.getElementById('editAuthenticatorDigit').value = editDigit || '6';  // 设置默认值为 6
    document.getElementById('editAuthenticatorInterval').value = editInterval || '30';  // 设置默认值为 30
    document.getElementById('editAuthenticatorEncrypt').value = editEncrypt || 'sha1';  // 设置默认值为 sha1
    document.getElementById('editAuthenticatorWindowId').value = id || '';

    const editAuthDialog = document.getElementById("editAuthenticatorWindow");
    // 修改对话框的标题
    editAuthDialog.headline = `编辑验证码(${editName})`;
    editAuthDialog.open = true;
    return id;
}


export function handleEditAuthButton() {
    const editButtons = document.querySelectorAll('.authenticatorCardEditButton');

    editButtons.forEach(button => {
        // 先移除已经存在的事件监听器
        button.removeEventListener('click', showEditAuthenticatorWindow);
        // 再添加新的事件监听器
        button.addEventListener('click', showEditAuthenticatorWindow);
    });
}