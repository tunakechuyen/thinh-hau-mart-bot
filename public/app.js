const API_URL = '/api/products';
let products = [];

// Auth Check
const password = localStorage.getItem('admin_password');
if (!password) {
    window.location.href = '/login.html';
}

const headers = {
    'Content-Type': 'application/json',
    'x-admin-password': password
};

// DOM Elements
const productListInfo = document.getElementById('productList');
const searchInput = document.getElementById('searchInput');
const modal = document.getElementById('productModal');
const productForm = document.getElementById('productForm');
const addBtn = document.getElementById('addBtn');
const closeModalBtns = document.querySelectorAll('.close-modal');
const logoutBtn = document.getElementById('logoutBtn');
const deleteBtn = document.getElementById('deleteBtn');
const priceInput = document.getElementById('price');

// Helper: Format number with dots (1000 -> 1.000)
const formatPrice = (num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
// Helper: Parse string to number (1.000 -> 1000)
const parsePrice = (str) => Number(str.replace(/\./g, ''));

// Formatting Price Input
priceInput.addEventListener('input', (e) => {
    // Remove non-numeric chars
    let val = e.target.value.replace(/\D/g, '');
    if (val) {
        e.target.value = formatPrice(val);
    }
});

// State
let isEditing = false;

// Fetch Products
async function fetchProducts() {
    try {
        const res = await fetch(API_URL, { headers });
        if (res.status === 401) {
            alert('Session expired');
            localStorage.removeItem('admin_password');
            window.location.href = '/login.html';
            return;
        }
        products = await res.json();
        renderProducts(products);
    } catch (err) {
        console.error(err);
        productListInfo.innerHTML = '<p class="text-center">Error loading products</p>';
    }
}

// Render Products
function renderProducts(list) {
    productListInfo.innerHTML = '';

    if (list.length === 0) {
        productListInfo.innerHTML = '<p class="text-center" style="grid-column: 1/-1;">No products found.</p>';
        return;
    }

    list.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.onclick = (e) => openEditModal(p);

        const unitDisplay = p.unit ? `<span style="font-size: 0.8em; color: #666;">/${p.unit}</span>` : '';
        const keywordsDisplay = p.keywords.length ? `<div style="margin-top:0.5rem; font-size: 0.8rem; color: #888;">Từ khóa: ${p.keywords.join(', ')}</div>` : '';

        card.innerHTML = `
            <div class="product-header">
                <h3 class="product-name">${p.name}</h3>
                <span class="badge ${p.isActive ? 'badge-active' : 'badge-inactive'}">${p.isActive ? 'Active' : 'Hidden'}</span>
            </div>
            <div class="product-price">${p.price.toLocaleString()} VND ${unitDisplay}</div>
            ${keywordsDisplay}
        `;
        productListInfo.appendChild(card);
    });
}

// Search
searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.keywords.some(k => k.toLowerCase().includes(term))
    );
    renderProducts(filtered);
});

// Modal Actions
function openAddModal() {
    isEditing = false;
    document.getElementById('modalTitle').innerText = 'Thêm sản phẩm';
    productForm.reset();
    document.getElementById('productId').value = '';
    priceInput.value = ''; // Reset price explicitly
    document.getElementById('isActive').checked = true;
    deleteBtn.classList.add('hidden');
    modal.classList.add('open');
}

function openEditModal(product) {
    isEditing = true;
    document.getElementById('modalTitle').innerText = 'Sửa sản phẩm';
    document.getElementById('productId').value = product._id;
    document.getElementById('name').value = product.name;
    document.getElementById('price').value = formatPrice(product.price);
    document.getElementById('category').value = product.category || '';
    document.getElementById('unit').value = product.unit || '';
    document.getElementById('keywords').value = product.keywords.join(', ');
    document.getElementById('isActive').checked = product.isActive;
    deleteBtn.classList.remove('hidden');
    modal.classList.add('open');
}

function closeModal() {
    modal.classList.remove('open');
}

addBtn.addEventListener('click', openAddModal);
closeModalBtns.forEach(btn => btn.addEventListener('click', closeModal));

// Form Submit
productForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
        name: document.getElementById('name').value,
        price: parsePrice(document.getElementById('price').value),
        category: document.getElementById('category').value,
        unit: document.getElementById('unit').value,
        keywords: document.getElementById('keywords').value.split(',').map(k => k.trim()).filter(k => k),
        isActive: document.getElementById('isActive').checked
    };

    const id = document.getElementById('productId').value;
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `${API_URL}/${id}` : API_URL;

    try {
        const res = await fetch(url, {
            method,
            headers,
            body: JSON.stringify(formData)
        });

        if (res.ok) {
            closeModal();
            fetchProducts();
        } else {
            alert('Error saving product');
        }
    } catch (err) {
        console.error(err);
    }
});

// Delete
deleteBtn.addEventListener('click', async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;

    const id = document.getElementById('productId').value;
    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers
        });
        if (res.ok) {
            closeModal();
            fetchProducts();
        }
    } catch (err) {
        console.error(err);
    }
});

// Logout
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('admin_password');
    window.location.href = '/login.html';
});

// Init
fetchProducts();
