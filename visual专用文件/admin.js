// 管理员系统逻辑

// 角色数据结构示例
// {
//   id: 'unique-id',
//   name: '角色名称',
//   prompt: '系统提示词',
//   avatar: '头像URL',
//   createdAt: Date.now()
// }

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initRoleForm();
    initFileUpload();
    loadRoles();
    loadFiles();
});

// 初始化角色表单
function initRoleForm() {
    const form = document.getElementById('roleForm');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const roleName = document.getElementById('roleName').value;
        const prompt = document.getElementById('prompt').value;
        const avatarUrl = document.getElementById('avatarUrl').value;
        
        if (!roleName || !prompt) {
            alert('角色名称和提示词不能为空');
            return;
        }
        
        // 创建角色对象
        const role = {
            id: generateId(),
            name: roleName,
            prompt: prompt,
            avatar: avatarUrl || 'https://via.placeholder.com/150',
            createdAt: Date.now()
        };
        
        // 保存角色
        saveRole(role);
        
        // 重置表单
        form.reset();
        
        // 重新加载角色列表
        loadRoles();
    });
}

// 初始化文件上传
function initFileUpload() {
    const uploadBtn = document.getElementById('uploadBtn');
    uploadBtn.addEventListener('click', () => {
        const fileInput = document.getElementById('knowledgeFile');
        const file = fileInput.files[0];
        
        if (!file) {
            alert('请选择文件');
            return;
        }
        
        // 检查文件类型
        if (!file.name.endsWith('.txt') && !file.name.endsWith('.pdf')) {
            alert('仅支持.txt和.pdf文件');
            return;
        }
        
        // 读取文件内容
        const reader = new FileReader();
        reader.onload = function(e) {
            // 保存文件
            saveFile({
                id: generateId(),
                name: file.name,
                type: file.type,
                content: e.target.result,
                createdAt: Date.now()
            });
            
            // 重新加载文件列表
            loadFiles();
        };
        reader.readAsText(file);
    });
}

// 保存角色
function saveRole(role) {
    const roles = getRoles();
    roles.push(role);
    localStorage.setItem('roles', JSON.stringify(roles));
}

// 获取所有角色
function getRoles() {
    const roles = localStorage.getItem('roles');
    if (roles) {
        return JSON.parse(roles);
    }
    return [];
}

// 加载角色列表
function loadRoles() {
    const roles = getRoles();
    const roleList = document.getElementById('roleList');
    roleList.innerHTML = '';
    
    roles.forEach(role => {
        const roleCard = document.createElement('div');
        roleCard.className = 'col-md-4 mb-3';
        roleCard.innerHTML = `
            <div class="card role-card">
                <img src="${role.avatar}" class="card-img-top" alt="${role.name}" style="height: 150px; object-fit: cover;">
                <div class="card-body">
                    <h5 class="card-title">${role.name}</h5>
                    <p class="card-text" style="height: 60px; overflow: hidden;">${role.prompt}</p>
                    <button class="btn btn-sm btn-danger delete-role" data-id="${role.id}">删除</button>
                </div>
            </div>
        `;
        roleList.appendChild(roleCard);
    });
    
    // 添加删除事件
    document.querySelectorAll('.delete-role').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            deleteRole(id);
        });
    });
}

// 删除角色
function deleteRole(id) {
    if (confirm('确定要删除这个角色吗？')) {
        let roles = getRoles();
        roles = roles.filter(role => role.id !== id);
        localStorage.setItem('roles', JSON.stringify(roles));
        loadRoles();
    }
}

// 保存文件
function saveFile(file) {
    const files = getFiles();
    files.push(file);
    localStorage.setItem('files', JSON.stringify(files));
}

// 获取所有文件
function getFiles() {
    const files = localStorage.getItem('files');
    if (files) {
        return JSON.parse(files);
    }
    return [];
}

// 加载文件列表
function loadFiles() {
    const files = getFiles();
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = '';
    
    files.forEach(file => {
        const fileItem = document.createElement('li');
        fileItem.className = 'list-group-item file-item';
        fileItem.innerHTML = `
            <div class="file-name">${file.name}</div>
            <button class="btn btn-sm btn-danger delete-file" data-id="${file.id}">删除</button>
        `;
        fileList.appendChild(fileItem);
    });
    
    // 添加删除事件
    document.querySelectorAll('.delete-file').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            deleteFile(id);
        });
    });
}

// 删除文件
function deleteFile(id) {
    if (confirm('确定要删除这个文件吗？')) {
        let files = getFiles();
        files = files.filter(file => file.id !== id);
        localStorage.setItem('files', JSON.stringify(files));
        loadFiles();
    }
}

// 生成唯一ID
function generateId() {
    return 'id-' + Math.random().toString(36).substr(2, 9);
}