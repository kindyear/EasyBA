/*
    initAuthenticatorPage.js
    初始化Authenticator页面
*/

import webSocketService from './webSocketService.js'; // 导入 WebSocketService 模块
import {handleEditAuthButton} from "./handleEditAuthButton.js";

async function fetchAuthenticatorList() {
    const response = await fetch('http://localhost:16526/api/getAuthenticatorList');
    const responseData = await response.json();
    if (response.ok) {
        return responseData;
    } else {
        console.error('Failed to fetch data:', response.status, response.statusText);
        return null;
    }
}

export async function generateAuthenticatorCards() {
    // 关闭当前的 WebSocket 连接
    await webSocketService.closeConnection();

    // 重新建立 WebSocket 连接
    webSocketService.connectionPromise = webSocketService.connectWebSocket();

    const authenticatorList = await fetchAuthenticatorList();
    const authenticatorCodes = await new Promise(resolve => {
        const eventTarget = webSocketService.getEventTarget();
        const listener = event => {
            eventTarget.removeEventListener('verificationCodeUpdated', listener);
            resolve(webSocketService.getAuthenticatorCodes());
        };
        eventTarget.addEventListener('verificationCodeUpdated', listener);
    });

    // 清空卡片容器
    const container = document.getElementById('authenticatorCardList');
    container.innerHTML = '';

    // 遍历验证码列表和信息，生成卡片
    for (let i = 0; i < authenticatorList.length; i++) {
        const authenticator = authenticatorList[i];
        const totp = authenticatorCodes.find(code => code && code.id === authenticator.id);

        let formattedTotp = '';
        if (totp) {
            formattedTotp = totp.totp;
            if (formattedTotp.length === 6) {
                formattedTotp = formattedTotp.slice(0, 3) + ' ' + formattedTotp.slice(3);
            } else if (formattedTotp.length === 7 || formattedTotp.length === 8) {
                formattedTotp = formattedTotp.slice(0, 4) + ' ' + formattedTotp.slice(4);
            }
        }
        const card = document.createElement('mdui-card');
        card.className = 'authenticatorCard';
        card.setAttribute('data-id', authenticator.id);
        // 创建卡片的 HTML 元素
        card.innerHTML = `
            <div class="authenticatorCardInfo">
                <div>
                    <p class="authenticatorCardName">${authenticator.name}</p>
                    <p class="authenticatorCardAccount">${authenticator.account}</p>
                </div>
                <div style="float: right">
                    <mdui-button-icon class="authenticatorCardEditButton" icon="edit" id="authenticatorCardEditButton-${authenticator.id}"></mdui-button-icon>
                </div>
            </div>
            <mdui-card clickable class="authenticatorCardCodeCard">
                <p class="authenticatorCardCode">${formattedTotp}</p>
            </mdui-card>
            <mdui-linear-progress class="authenticatorCardInterval" value="0"></mdui-linear-progress>
        `;

        // 将卡片添加到容器中
        container.appendChild(card);

        // 新增：获取事件对象
        const eventTarget = webSocketService.getEventTarget();

        // 添加事件监听器，监听 verificationCodeUpdated 事件
        eventTarget.addEventListener('verificationCodeUpdated', (event) => {
            console.log('Verification code updated event received');
            const updatedCode = event.detail;

            // 找到对应的验证码卡片
            const card = document.querySelector(`.authenticatorCard[data-id="${updatedCode.id}"]`);
            if (card) {
                // 找到验证码元素
                const codeElement = card.querySelector('.authenticatorCardCode');
                if (codeElement) {
                    let formattedTotp = updatedCode.totp;
                    if (formattedTotp.length === 6) {
                        formattedTotp = formattedTotp.slice(0, 3) + ' ' + formattedTotp.slice(3);
                    } else if (formattedTotp.length === 7 || formattedTotp.length === 8) {
                        formattedTotp = formattedTotp.slice(0, 4) + ' ' + formattedTotp.slice(4);
                    }
                    // 更新验证码
                    codeElement.textContent = formattedTotp;
                } else {
                    console.error('Cannot find the code element');
                }
            } else {
                console.error('Cannot find the card with id:', updatedCode.id);
            }
        });

        // 启动倒计时
        startCountdownTimer(authenticator.id, authenticator.interval);

        // 修正 startCountdownTimer 函数
        function startCountdownTimer(authenticatorId) {
            const progressBar = document.querySelector(`.authenticatorCard[data-id="${authenticatorId}"] .authenticatorCardInterval`);
            let progressValue = 0;

            const intervalId = setInterval(() => {
                progressValue = 1 - ((Date.now() / 1000) % authenticator.interval / authenticator.interval);
                progressBar.value = progressValue;

                if (progressValue >= 100) {
                    // 刷新验证码
                    clearInterval(intervalId);
                }
            }, 1000);
        }

        startCountdownTimer(authenticator.id, authenticator.interval);

        const codeCard = card.querySelector('.authenticatorCardCodeCard');
        codeCard.addEventListener('click', event => {
            const card = event.currentTarget;
            const code = card.querySelector('.authenticatorCardCode').innerText;
            const codeWithoutSpaces = code.replace(/\s/g, '');
            navigator.clipboard.writeText(codeWithoutSpaces);
            mdui.snackbar({
                message: "已复制到剪贴板",
            });
        });
    }
    console.log("卡片生成完毕");
    handleEditAuthButton();
}

// await generateAuthenticatorCards();

// 刷新按钮点击事件
const refreshButton = document.getElementById('refreshAuthenticators');
refreshButton.addEventListener('click', async () => {
    // 处理刷新验证码的逻辑
    console.log('Refresh Authenticators button clicked');
    await generateAuthenticatorCards(); // 重新生成验证码卡片
    mdui.snackbar({
        message: "刷新完成",
    });
});

// 在初始化时添加事件监听器
document.addEventListener('DOMContentLoaded', async () => {
    await generateAuthenticatorCards();
    const refreshButton = document.getElementById('refreshAuthenticators');
    refreshButton.click();
});
refreshButton.click();
refreshButton.click();
