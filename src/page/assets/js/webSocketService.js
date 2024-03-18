/*
    webSocketService.js
    维护建立webSocket
*/

// wsbSocketService.js

class WsbSocketService {
    constructor() {
        // 初始化WebSocket连接
        this.socket = null;

        // 创建一个Promise用于确保只有一个WebSocket连接存在
        this.connectionPromise = this.connectWebSocket();

        // 绑定事件处理函数
        this.onSocketOpen = this.onSocketOpen.bind(this);
        this.onSocketMessage = this.onSocketMessage.bind(this);
        this.onSocketClose = this.onSocketClose.bind(this);
        this.onSocketError = this.onSocketError.bind(this);

        this.events = new EventTarget();
    }

    async connectWebSocket() {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            const socketUrl = 'ws://localhost:16526/ws/getAuthenticator';
            this.socket = new WebSocket(socketUrl);

            await new Promise((resolve) => {
                this.socket.addEventListener('open', () => {
                    this.onSocketOpen();
                    resolve();
                });
            });

            this.socket.addEventListener('message', this.onSocketMessage);
            this.socket.addEventListener('close', this.onSocketClose);
            this.socket.addEventListener('error', this.onSocketError);

            // 使用 setTimeout 确保在 WebSocket 连接完全建立后再发送 'reload' 消息
            setTimeout(() => {
                this.sendMessage('reload');
            }, 0);
        }
    }

    onSocketOpen() {
        console.log('WebSocket连接已打开');
        this.sendMessage('reload');
    }

    onSocketMessage(event) {
        console.log('收到消息:', event.data);
        // 处理收到的消息
        const message = JSON.parse(event.data);

        if (message instanceof Array) {
            // 如果消息是数组，表示包含验证码信息
            this.handleVerificationCodes(message);
        } else if (message.id && message.totp) {
            // 如果消息是一个对象，并且包含id和totp属性，表示是一个新的验证码信息
            this.updateVerificationCode(message);

            // 新增：触发自定义事件
            this.events.dispatchEvent(new CustomEvent('verificationCodeUpdated', {detail: message}));
        } else {
            // 其他情况，可以根据需要进行处理
            console.log('未知消息类型:', message);
        }
    }

    // 添加事件监听器
    addEventListener(type, listener, options) {
        this.events.addEventListener(type, listener, options);
    }

    // 移除事件监听器
    removeEventListener(type, listener, options) {
        this.events.removeEventListener(type, listener, options);
    }

    // 获取事件对象
    getEventTarget() {
        // console.log(this.events)
        return this.events;
    }


    updateVerificationCode(newCode) {
        // 查找旧的验证码信息
        const oldCodeIndex = this.codes.findIndex(code => code.id === newCode.id);
        if (oldCodeIndex !== -1) {
            // 如果找到了旧的验证码信息，替换为新的验证码信息
            this.codes[oldCodeIndex] = newCode;
            // 触发自定义事件，通知有新的验证码信息更新
            const event = new CustomEvent('verificationCodeUpdated', {detail: newCode});
            console.log('New verification code updated:', newCode);
            this.events.dispatchEvent(event);
        } else {
            console.log('New verification code added:', newCode)
            // 如果没有找到旧的验证码信息，添加新的验证码信息
            const event = new CustomEvent('verificationCodeUpdated', {detail: newCode});
            this.events.dispatchEvent(event);
            this.codes.push(newCode);
        }
    }

    handleVerificationCodes(codes) {
        this.codes = [];

        // 遍历收到的数组，逐个更新验证码信息
        codes.forEach(code => {
            this.updateVerificationCode(code);
        });
    }

    getAuthenticatorCodes() {

        return this.codes;
    }

    onSocketClose(event) {
        console.log('WebSocket连接已关闭');
        // 连接关闭时执行的操作
    }

    onSocketError(event) {
        console.error('WebSocket发生错误:', event);
        // 处理WebSocket错误
    }

    sendMessage(message) {
        // 发送消息
        this.connectionPromise.then(() => {
            this.socket.send(JSON.stringify(message));
        });
    }

    closeConnection() {
        // 关闭WebSocket连接
        if (this.socket) {
            this.socket.close();
        }
    }

    // 提供方法用于手动触发重新加载验证码信息
    reloadVerificationCodes() {
        // 发送'reload'信息以获取所有验证码信息
        this.sendMessage('reload');
    }
}

// 导出单例实例，确保只有一个WebSocket连接
const wsbSocketService = new WsbSocketService();
export default wsbSocketService;