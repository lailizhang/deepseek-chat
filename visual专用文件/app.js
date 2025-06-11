// 用户界面逻辑

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    loadRoles();
    setupEventListeners();
});

// 加载角色列表
function loadRoles() {
    const roles = JSON.parse(localStorage.getItem('roles') || '[]');
    const roleCards = document.getElementById('roleCards');
    roleCards.innerHTML = '';
    
    roles.forEach(role => {
        const col = document.createElement('div');
        col.className = 'col-md-4 mb-3';
        col.innerHTML = `
            <div class="card role-card" data-id="${role.id}">
                <img src="${role.avatar}" class="card-img-top" alt="${role.name}">
                <div class="card-body">
                    <h5 class="card-title">${role.name}</h5>
                    <p class="card-text">${role.prompt.substring(0, 50)}...</p>
                </div>
            </div>
        `;
        roleCards.appendChild(col);
    });
    
    // 添加角色选择事件
    document.querySelectorAll('.role-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const roleId = card.dataset.id;
            const role = roles.find(r => r.id === roleId);
            if (role) {
                startChat(role);
            }
        });
    });
}

// 设置事件监听器
function setupEventListeners() {
    // 返回按钮
    document.getElementById('backBtn').addEventListener('click', () => {
        document.getElementById('chatInterface').classList.add('d-none');
        document.getElementById('roleSelection').classList.remove('d-none');
    });
    
    // 发送按钮
    document.getElementById('sendBtn').addEventListener('click', sendMessage);
    
    // 输入框回车发送
    document.getElementById('messageInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

// 开始聊天
function startChat(role) {
    // 更新UI
    document.getElementById('roleSelection').classList.add('d-none');
    document.getElementById('chatInterface').classList.remove('d-none');
    document.getElementById('currentRole').textContent = role.name;
    document.getElementById('currentAvatar').src = role.avatar;
    
    // 初始化聊天状态
    window.currentRole = role;
    window.messages = [];
    document.getElementById('messageContainer').innerHTML = '';
    document.getElementById('messageInput').value = '';
    
    // 发送初始系统消息
    addMessage('system', role.prompt);
    
    // 添加欢迎消息
    addMessage('ai', `你好！我是${role.name}，有什么可以帮您的？`);
}

// 发送消息
async function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // 添加用户消息
    addMessage('user', message);
    input.value = '';
    
    // 显示加载指示器
    const loader = document.createElement('div');
    loader.className = 'loader';
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message message-ai';
    messageDiv.appendChild(loader);
    document.getElementById('messageContainer').appendChild(messageDiv);
    
    // 滚动到底部
    scrollToBottom();
    
    try {
        // 生成AI响应
        const response = await generateResponse(message, window.currentRole);
        
        // 移除加载指示器
        document.getElementById('messageContainer').removeChild(messageDiv);
        
        // 添加AI响应
        addMessage('ai', response);
        
        // 滚动到底部
        scrollToBottom();
    } catch (error) {
        // 移除加载指示器
        document.getElementById('messageContainer').removeChild(messageDiv);
        
        // 显示错误信息
        addMessage('ai', `请求失败: ${error.message}`);
        console.error('生成响应失败:', error);
    }
}

// 添加消息到聊天界面
function addMessage(sender, text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${sender}`;
    
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.innerHTML = `
        <div class="message-content">${text}</div>
        <div class="message-time">${time}</div>
    `;
    
    document.getElementById('messageContainer').appendChild(messageDiv);
    scrollToBottom();
}

// 滚动到底部
function scrollToBottom() {
    const container = document.getElementById('messageContainer');
    container.scrollTop = container.scrollHeight;
}

// 生成AI响应
async function generateResponse(message, role) {
    // 获取API密钥
    const apiKey = localStorage.getItem('apiKey') || 'sk-38e390d8cb1642b7a6ef1bc453c20ccd';
    if (!apiKey) {
        return "未设置API密钥，请点击右上角设置按钮配置API";
    }
    
    // 获取知识库内容
    const knowledgeFiles = JSON.parse(localStorage.getItem('files') || '[]');
    let knowledgeContent = '';
    if (knowledgeFiles.length > 0) {
        // 合并所有知识库内容（最多5000字符）
        knowledgeContent = knowledgeFiles.map(file => file.content.substring(0, 1000)).join('\n\n');
        if (knowledgeContent.length > 5000) {
            knowledgeContent = knowledgeContent.substring(0, 5000) + '...';
        }
    } else {
        knowledgeContent = '没有可用知识库';
    }
    
    try {
        // 构建请求数据
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    {
                        role: 'system',
                        content: `你正在扮演${role.name}角色。角色设定：${role.prompt}\n\n相关背景知识：${knowledgeContent}`
                    },
                    {
                        role: 'user',
                        content: message
                    }
                ],
                max_tokens: 500
            })
        });
        
        const data = await response.json();
        
        if (data.choices && data.choices.length > 0) {
            return data.choices[0].message.content;
        } else {
            return "未收到有效响应，请稍后再试";
        }
    } catch (error) {
        console.error('API请求失败:', error);
        return "请求失败，请检查网络连接和API密钥";
    }
}