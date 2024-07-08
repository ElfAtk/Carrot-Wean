const username = 'YOUR_GITHUB_USERNAME';
const repo = 'sale-items-management';
const token = process.env.GH_TOKEN; // ใช้ Environment Variable หรือ Secret ที่สร้างไว้ใน GitHub
const branch = 'main'; // หรือชื่อ branch ที่คุณต้องการใช้
const path = 'items.json';

let items = [];

async function getItems() {
    try {
        const response = await fetch(`https://api.github.com/repos/${username}/${repo}/contents/${path}?ref=${branch}`, {
            headers: {
                Authorization: `token ${token}`
            }
        });
        const data = await response.json();
        items = JSON.parse(atob(data.content));
        renderItems();
    } catch (error) {
        console.error('Error fetching items:', error);
    }
}

async function saveItems() {
    try {
        const response = await fetch(`https://api.github.com/repos/${username}/${repo}/contents/${path}?ref=${branch}`, {
            method: 'PUT',
            headers: {
                Authorization: `token ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Update items',
                content: btoa(JSON.stringify(items)),
                sha: (await getSha()).sha
            })
        });
        if (!response.ok) throw new Error('Error saving items');
    } catch (error) {
        console.error('Error saving items:', error);
    }
}

async function getSha() {
    const response = await fetch(`https://api.github.com/repos/${username}/${repo}/contents/${path}?ref=${branch}`, {
        headers: {
            Authorization: `token ${token}`
        }
    });
    return await response.json();
}

function renderItems() {
    const itemList = document.getElementById('itemList');
    itemList.innerHTML = '';
    items.forEach((item, index) => {
        const itemElement = document.createElement('li');
        itemElement.className = 'item';
        
        const inputElement = document.createElement('input');
        inputElement.type = 'text';
        inputElement.value = item;
        inputElement.onchange = (e) => updateItem(index, e.target.value);
        
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.onclick = () => editItem(index);
        
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = () => deleteItem(index);

        itemElement.appendChild(inputElement);
        itemElement.appendChild(editButton);
        itemElement.appendChild(deleteButton);
        
        itemList.appendChild(itemElement);
    });
}

function addItem() {
    const newItemInput = document.getElementById('newItemInput');
    const newItem = newItemInput.value.trim();
    if (newItem) {
        items.push(newItem);
        newItemInput.value = '';
        saveItems();
        renderItems();
    }
}

function updateItem(index, newValue) {
    items[index] = newValue;
    saveItems();
    renderItems();
}

function editItem(index) {
    const item = items[index];
    const newItem = prompt('Edit item:', item);
    if (newItem !== null) {
        items[index] = newItem;
        saveItems();
        renderItems();
    }
}

function deleteItem(index) {
    items.splice(index, 1);
    saveItems();
    renderItems();
}

// Initial render
getItems();
