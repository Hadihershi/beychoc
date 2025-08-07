// Global variables
let currentProducts = [];
let currentCategory = 'all';
let isAdminLoggedIn = false;

// DOM Elements - will be initialized after DOM loads
let adminModal;
let adminPanel;
let adminLoginForm;
let logoutBtn;
let addProductForm;
let searchInput;
let searchBtn;
let productsGrid;
let filterBtns;
let hamburger;
let navMenu;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeDOMElements();
    initializeApp();
    setupEventListeners();
    loadProducts();
    setup3DAnimation();
});

function initializeDOMElements() {
    // Initialize DOM elements
    adminModal = document.getElementById('adminModal');
    adminPanel = document.getElementById('adminPanel');
    adminLoginForm = document.getElementById('adminLoginForm');
    logoutBtn = document.getElementById('logoutBtn');
    addProductForm = document.getElementById('addProductForm');
    searchInput = document.getElementById('searchInput');
    searchBtn = document.getElementById('searchBtn');
    productsGrid = document.getElementById('productsGrid');
    filterBtns = document.querySelectorAll('.filter-btn');
    hamburger = document.querySelector('.hamburger');
    navMenu = document.querySelector('.nav-menu');
}

function initializeApp() {
    // Check if admin is logged in
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
        isAdminLoggedIn = true;
        showAdminPanel();
    }
    
    initializeDOMElements();
    setupEventListeners();
    loadProducts();
    setup3DAnimation();
}

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            if (targetId === 'admin') {
                showAdminModal();
            } else {
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // Admin modal
    if (adminModal) {
        const closeBtn = adminModal.querySelector('.btn-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', hideAdminModal);
        }
        window.addEventListener('click', function(e) {
            if (e.target === adminModal) {
                hideAdminModal();
            }
        });
    }

    // Admin login (JS-only)
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', handleAdminLogin);
    }

    // Admin logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleAdminLogout);
    }

    // Add product form
    if (addProductForm) {
        addProductForm.addEventListener('submit', handleAddProduct);
    }

    // Edit product form events
    const editProductCategory = document.getElementById('editProductCategory');
    if (editProductCategory) {
        editProductCategory.addEventListener('change', toggleEditWeightField);
    }

    const editProductImage = document.getElementById('editProductImage');
    if (editProductImage) {
        editProductImage.addEventListener('change', handleEditImagePreview);
    }

    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
    }

    // Filter buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            filterProducts(category);
            
            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Category change for weight field
    const productCategory = document.getElementById('productCategory');
    if (productCategory) {
        productCategory.addEventListener('change', toggleWeightField);
    }

    // Image preview
    const productImage = document.getElementById('productImage');
    if (productImage) {
        productImage.addEventListener('change', handleImagePreview);
    }
}

function showAdminModal() {
    if (adminModal) {
        const modal = new bootstrap.Modal(adminModal);
        modal.show();
    }
}

function hideAdminModal() {
    if (adminModal) {
        const modal = bootstrap.Modal.getInstance(adminModal);
        if (modal) {
            modal.hide();
        }
    }
}

async function handleAdminLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    
    // Simple admin authentication (replace with proper backend auth)
    if (username === 'lana moghnieh' && password === '123454321') {
        isAdminLoggedIn = true;
        localStorage.setItem('adminToken', 'admin123token');
        hideAdminModal();
        showAdminPanel();
        showMessage('Login successful!', 'success');
    } else {
        showMessage('Invalid credentials!', 'error');
    }
}

async function handleAdminLogout() {
    isAdminLoggedIn = false;
    localStorage.removeItem('adminToken');
    hideAdminPanel();
    showMessage('Logged out successfully!', 'success');
}

function showAdminPanel() {
    if (adminPanel) {
        adminPanel.classList.remove('hidden');
        loadAdminProducts();
        
        // Set up weight field toggle after admin panel is shown
        const productCategory = document.getElementById('productCategory');
        if (productCategory) {
            productCategory.addEventListener('change', toggleWeightField);
            console.log('Weight field event listener added');
        } else {
            console.log('Product category element not found');
        }
    }
}

function hideAdminPanel() {
    if (adminPanel) {
        adminPanel.classList.add('hidden');
    }
}

async function loadProducts(category = 'all', search = '') {
    try {
        let url = 'api/products.php';
        const params = new URLSearchParams();
        
        if (category && category !== 'all') {
            params.append('category', category);
        }
        
        if (search) {
            params.append('search', search);
        }
        
        if (params.toString()) {
            url += '?' + params.toString();
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
            currentProducts = data.products;
            displayProducts(currentProducts);
        } else {
            console.error('Failed to load products:', data.message);
        }
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

function displayProducts(products) {
    if (!productsGrid) return;
    
    productsGrid.innerHTML = '';
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'col-xl-6 col-lg-6 col-md-6 col-sm-6 col-6 mb-4';
        productCard.innerHTML = `
            <div class="product-card">
                <img src="${product.image_path}" alt="${product.name}" class="product-image">
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-code">Code: ${product.product_code}</p>
                    <p class="product-description">${product.description || ''}</p>
                    <div class="product-details">
                    </div>
                    <button class="view-product-btn btn btn-primary" onclick="viewProduct(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                        <i class="fas fa-eye me-2"></i>View Details
                    </button>
                </div>
            </div>
        `;
        productsGrid.appendChild(productCard);
    });
}

async function filterProducts(category) {
    currentCategory = category;
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    
    // Use API to get filtered products
    await loadProducts(category, searchTerm);
}

async function handleAddProduct(e) {
    e.preventDefault();
    
    const imageFile = document.getElementById('productImage').files[0];
    let imagePath = '';
    
    // First upload the image if provided
    if (imageFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('image', imageFile);
        
        try {
            const uploadResponse = await fetch('api/upload.php', {
                method: 'POST',
                body: uploadFormData
            });
            
            const uploadData = await uploadResponse.json();
            
            if (uploadData.success) {
                imagePath = uploadData.image_path;
            } else {
                showMessage('Failed to upload image: ' + uploadData.message, 'error');
                return;
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            showMessage('Error uploading image!', 'error');
            return;
        }
    }
    
    // Then create the product
    const category = document.getElementById('productCategory').value;
    const productData = {
        name: document.getElementById('productName').value,
        category: category,
        product_code: document.getElementById('productCode').value,
        price: parseFloat(document.getElementById('productPrice').value) || 0.00,
        weight: category === 'packages' ? null : (document.getElementById('productWeight').value || null),
        description: document.getElementById('productDescription').value,
        image_path: imagePath
    };
    
    try {
        const response = await fetch('api/products.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer admin123token'
            },
            body: JSON.stringify(productData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage('Product added successfully!', 'success');
            addProductForm.reset();
            document.getElementById('imagePreview').style.display = 'none';
            loadProducts();
            loadAdminProducts();
        } else {
            showMessage('Failed to add product: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error adding product:', error);
        showMessage('Error adding product!', 'error');
    }
}

async function loadAdminProducts() {
    try {
        const response = await fetch('api/products.php');
        const data = await response.json();
        
        if (data.success) {
            displayAdminProducts(data.products);
        }
    } catch (error) {
        console.error('Error loading admin products:', error);
    }
}

function displayAdminProducts(products) {
    const adminProductsList = document.getElementById('adminProductsList');
    if (!adminProductsList) return;
    
    adminProductsList.innerHTML = '';
    
    products.forEach(product => {
        const productItem = document.createElement('div');
        productItem.className = 'product-item card mb-3';
        productItem.innerHTML = `
            <div class="card-body">
                <div class="row align-items-center">
                    <div class="col-md-3">
                        <img src="${product.image_path}" alt="${product.name}" class="img-fluid rounded" style="max-height: 80px;">
                    </div>
                    <div class="col-md-6">
                        <h4 class="mb-1">${product.name}</h4>
                        <p class="mb-1 text-muted">Code: ${product.product_code}</p>
                    </div>
                    <div class="col-md-3">
                        <div class="d-flex gap-2">
                            <button class="btn btn-sm btn-primary edit-btn" onclick="openEditProductModal(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                                Edit
                            </button>
                            <button class="btn btn-sm btn-danger delete-btn" onclick="deleteProduct(${product.id})">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        adminProductsList.appendChild(productItem);
    });
}

function openEditProductModal(product) {
    // Populate the edit form with product data
    document.getElementById('editProductId').value = product.id;
    document.getElementById('editProductName').value = product.name;
    document.getElementById('editProductCategory').value = product.category;
    document.getElementById('editProductCode').value = product.product_code;
    document.getElementById('editProductPrice').value = product.price;
    document.getElementById('editProductWeight').value = product.weight || '';
    document.getElementById('editProductDescription').value = product.description || '';
    
    // Show current image
    const currentImage = document.getElementById('editCurrentImage');
    currentImage.src = product.image_path;
    currentImage.style.display = 'block';
    
    // Hide image preview initially
    document.getElementById('editImagePreview').style.display = 'none';
    
    // Toggle weight field visibility based on category
    toggleEditWeightField();
    
    // Show the modal
    const editModal = new bootstrap.Modal(document.getElementById('editProductModal'));
    editModal.show();
}

async function handleEditProduct() {
    const productId = document.getElementById('editProductId').value;
    const imageFile = document.getElementById('editProductImage').files[0];
    let imagePath = '';
    
    // First upload the new image if provided
    if (imageFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('image', imageFile);
        
        try {
            const uploadResponse = await fetch('api/upload.php', {
                method: 'POST',
                body: uploadFormData
            });
            
            const uploadData = await uploadResponse.json();
            
            if (uploadData.success) {
                imagePath = uploadData.image_path;
            } else {
                showMessage('Failed to upload image: ' + uploadData.message, 'error');
                return;
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            showMessage('Error uploading image!', 'error');
            return;
        }
    }
    
    // Prepare the product data
    const category = document.getElementById('editProductCategory').value;
    const productData = {
        id: productId,
        name: document.getElementById('editProductName').value,
        category: category,
        product_code: document.getElementById('editProductCode').value,
        price: parseFloat(document.getElementById('editProductPrice').value) || 0.00,
        weight: category === 'packages' ? null : (document.getElementById('editProductWeight').value || null),
        description: document.getElementById('editProductDescription').value
    };
    
    // If a new image was uploaded, include it in the update
    if (imagePath) {
        productData.image_path = imagePath;
    }
    
    try {
        const response = await fetch('api/products.php', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer admin123token'
            },
            body: JSON.stringify(productData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage('Product updated successfully!', 'success');
            
            // Close the modal
            const editModal = bootstrap.Modal.getInstance(document.getElementById('editProductModal'));
            editModal.hide();
            
            // Refresh the product lists
            loadProducts();
            loadAdminProducts();
        } else {
            showMessage('Failed to update product: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error updating product:', error);
        showMessage('Error updating product!', 'error');
    }
}

function toggleEditWeightField() {
    const category = document.getElementById('editProductCategory').value;
    const weightGroup = document.querySelector('.edit-weight-group');
    
    if (category === 'bars') {
        weightGroup.classList.remove('hidden');
    } else {
        weightGroup.classList.add('hidden');
    }
}

async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }
    
    try {
        const response = await fetch(`api/products.php`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer admin123token'
            },
            body: JSON.stringify({ id: productId })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage('Product deleted successfully!', 'success');
            loadProducts();
            loadAdminProducts();
        } else {
            showMessage('Failed to delete product: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        showMessage('Error deleting product!', 'error');
    }
}

function toggleWeightField() {
    const category = document.getElementById('productCategory').value;
    const weightGroup = document.querySelector('.weight-group');
    
    console.log('Toggle weight field called');
    console.log('Selected category:', category);
    console.log('Weight group element:', weightGroup);
    
    if (category === 'bars') {
        weightGroup.classList.remove('hidden');
        console.log('Weight field shown');
    } else {
        weightGroup.classList.add('hidden');
        console.log('Weight field hidden');
    }
}

function handleImagePreview(e) {
    const file = e.target.files[0];
    const preview = document.getElementById('imagePreview');
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else {
        preview.style.display = 'none';
    }
}

function handleEditImagePreview(e) {
    const file = e.target.files[0];
    const preview = document.getElementById('editImagePreview');
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else {
        preview.style.display = 'none';
    }
}

async function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    // Use API search for better performance
    await loadProducts(currentCategory, searchTerm);
    
    // Show search results count
    const resultsCount = document.getElementById('searchResultsCount');
    if (resultsCount) {
        if (searchTerm) {
            resultsCount.textContent = `Found ${currentProducts.length} product(s)`;
            resultsCount.style.display = 'block';
        } else {
            resultsCount.style.display = 'none';
        }
    }
}

function validateForm() {
    const requiredFields = ['productName', 'productCategory', 'productCode', 'productPrice'];
    let isValid = true;
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field.value.trim()) {
            field.classList.add('is-invalid');
            isValid = false;
        } else {
            field.classList.remove('is-invalid');
        }
    });
    
    return isValid;
}

function showMessage(message, type = 'success') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

function viewProduct(product) {
    // Create modal HTML
    const modalHTML = `
        <div class="modal fade" id="productModal" tabindex="-1" aria-labelledby="productModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="productModalLabel">${product.name}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <img src="${product.image_path}" alt="${product.name}" class="img-fluid rounded product-modal-image">
                            </div>
                            <div class="col-md-6">
                                <h4 class="product-modal-name">${product.name}</h4>
                                <p class="product-modal-code text-muted">Product Code: ${product.product_code}</p>
                                <p class="product-modal-category">
                                    <strong>Category:</strong> 
                                    <span class="badge bg-primary">${product.category}</span>
                                </p>
                                ${product.weight ? `<p class="product-modal-weight"><strong>Weight:</strong> ${product.weight}g</p>` : ''}
                                ${product.description ? `<div class="product-modal-description mt-3">
                                    <strong>Description:</strong>
                                    <p class="mt-2">${product.description}</p>
                                </div>` : ''}
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" onclick="contactAboutProduct('${product.name}')">
                            <i class="fab fa-whatsapp me-2"></i>Contact About This Product
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('productModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    modal.show();
    
    // Clean up modal after it's hidden
    document.getElementById('productModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

function contactAboutProduct(productName) {
    const message = `Hi! I'm interested in the ${productName} product. Can you provide more information?`;
    const whatsappUrl = `https://wa.me/96170282127?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

function setup3DAnimation() {
    // 3D animation setup (if needed)
    console.log('3D Animation setup complete');
}