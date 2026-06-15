// ========== CART MANAGEMENT ==========
let cart = JSON.parse(localStorage.getItem('cart')) || [];
const cartCountElement = document.querySelector('.cart-count');

function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCountElement) {
        cartCountElement.textContent = totalItems;
    }
}

function addToCart(productId, quantity = 1) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: quantity
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showNotification(`${product.name} added to cart!`);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    displayCartItems();
    showNotification('Item removed from cart');
}

function updateQuantity(productId, newQuantity) {
    if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }
    const item = cart.find(i => i.id === productId);
    if (item) {
        item.quantity = newQuantity;
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        displayCartItems();
    }
}

// ========== DISPLAY FUNCTIONS ==========
function displayAllProducts() {
    const container = document.getElementById('all-products');
    if (!container) return;

    container.innerHTML = products.map(product => createProductCard(product)).join('');
    attachProductCardListeners();
}

function displayFeaturedProducts() {
    const container = document.getElementById('featured-products');
    if (!container) return;

    const featured = products.slice(0, 6);
    container.innerHTML = featured.map(product => createProductCard(product)).join('');
    attachProductCardListeners();
}

function createProductCard(product) {
    const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    return `
        <div class="product-card" onclick="viewProduct(${product.id})">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
                ${product.badge ? `<span class="badge">${product.badge}</span>` : ''}
                <div class="product-overlay">
                    <button class="btn-add-cart" onclick="event.stopPropagation(); addToCart(${product.id})">Add to Cart</button>
                </div>
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="product-category">${product.category}</p>
                <div class="rating">
                    ${'<i class="fas fa-star"></i>'.repeat(Math.floor(product.rating))}
                    <span>(${product.reviews} reviews)</span>
                </div>
                <div class="price">
                    <span class="original-price">₹${product.originalPrice}</span>
                    <span class="sale-price">₹${product.price}</span>
                </div>
            </div>
        </div>
    `;
}

function displayCartItems() {
    const container = document.getElementById('cart-items');
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem;">
                <i class="fas fa-shopping-cart" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                <p style="color: #666; font-size: 1.2rem;">Your cart is empty</p>
                <button class="btn btn-primary" onclick="window.location.href='products.html'" style="margin-top: 1rem;">
                    Continue Shopping
                </button>
            </div>
        `;
        document.getElementById('checkout-section').style.display = 'none';
        return;
    }

    let total = 0;
    container.innerHTML = cart.map(item => {
        total += item.price * item.quantity;
        return `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <h3>${item.name}</h3>
                    <p>₹${item.price}</p>
                </div>
                <div class="quantity-control">
                    <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                    <input type="number" value="${item.quantity}" onchange="updateQuantity(${item.id}, parseInt(this.value))" min="1">
                    <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                </div>
                <div style="text-align: right;">
                    <p>₹${item.price * item.quantity}</p>
                    <a class="cart-item-remove" onclick="removeFromCart(${item.id})">Remove</a>
                </div>
            </div>
        `;
    }).join('');

    // Update summary
    const subtotal = total;
    const discount = Math.round(subtotal * 0.1);
    const finalTotal = subtotal - discount;

    document.getElementById('subtotal').textContent = `₹${subtotal}`;
    document.getElementById('discount').textContent = `-₹${discount}`;
    document.getElementById('total').textContent = `₹${finalTotal}`;
}

function loadProductDetail() {
    const params = new URLSearchParams(window.location.search);
    const productId = parseInt(params.get('id'));

    if (!productId) {
        window.location.href = 'products.html';
        return;
    }

    const product = products.find(p => p.id === productId);
    if (!product) {
        window.location.href = 'products.html';
        return;
    }

    const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

    document.getElementById('detail-title').textContent = product.name;
    document.getElementById('detail-category').textContent = product.category;
    document.getElementById('detail-image').src = product.image;
    document.getElementById('detail-description').textContent = product.description;
    document.getElementById('detail-original-price').textContent = `₹${product.originalPrice}`;
    document.getElementById('detail-sale-price').textContent = `₹${product.price}`;
    document.getElementById('detail-discount').textContent = `-${discount}%`;
    document.getElementById('detail-reviews').textContent = `(${product.reviews} reviews)`;
    document.getElementById('breadcrumb-product').textContent = product.name;

    // Stars
    const starsHtml = `${'<i class="fas fa-star"></i>'.repeat(Math.floor(product.rating))}${product.rating % 1 !== 0 ? '<i class="fas fa-star-half-alt"></i>' : ''}`;
    document.getElementById('detail-stars').innerHTML = starsHtml;

    // Rating badge
    document.getElementById('detail-rating-badge').innerHTML = `
        <div style="text-align: center;">
            <div style="font-size: 1.5rem; font-weight: bold;">${product.rating}</div>
            <div style="font-size: 0.8rem;">⭐ Rating</div>
        </div>
    `;

    // Features
    document.getElementById('detail-features').innerHTML = product.features.map(feature => `<li>${feature}</li>`).join('');

    // Related products
    const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
    document.getElementById('related-products').innerHTML = related.map(p => createProductCard(p)).join('');
    attachProductCardListeners();
}

function viewProduct(productId) {
    window.location.href = `product-detail.html?id=${productId}`;
}

function attachProductCardListeners() {
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', function(e) {
            if (e.target.classList.contains('btn-add-cart') || e.target.closest('.btn-add-cart')) {
                e.stopPropagation();
                return;
            }
        });
    });
}

// ========== FILTER FUNCTIONS ==========
function applyFilters() {
    const categoryCheckboxes = document.querySelectorAll('.filter-group input[value="Clothing"], .filter-group input[value="Shoes"], .filter-group input[value="Toys"], .filter-group input[value="Accessories"]');
    const priceCheckboxes = document.querySelectorAll('.filter-group input[value*="-"]');
    
    const selectedCategories = Array.from(categoryCheckboxes).filter(cb => cb.checked).map(cb => cb.value);
    const selectedPrices = Array.from(priceCheckboxes).filter(cb => cb.checked).map(cb => cb.value);

    let filtered = products;

    if (selectedCategories.length > 0) {
        filtered = filtered.filter(p => selectedCategories.includes(p.category));
    }

    if (selectedPrices.length > 0) {
        filtered = filtered.filter(p => {
            return selectedPrices.some(range => {
                if (range === '0-500') return p.price >= 0 && p.price <= 500;
                if (range === '500-1000') return p.price > 500 && p.price <= 1000;
                if (range === '1000-2000') return p.price > 1000 && p.price <= 2000;
                if (range === '2000+') return p.price > 2000;
                return false;
            });
        });
    }

    document.getElementById('all-products').innerHTML = filtered.map(p => createProductCard(p)).join('');
    attachProductCardListeners();
}

function clearFilters() {
    document.querySelectorAll('.filter-group input').forEach(checkbox => {
        checkbox.checked = false;
    });
    displayAllProducts();
}

function sortProducts(sortBy) {
    let sorted = [...products];

    if (sortBy === 'price-low') {
        sorted.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
        sorted.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
        sorted.sort((a, b) => b.rating - a.rating);
    }

    document.getElementById('all-products').innerHTML = sorted.map(p => createProductCard(p)).join('');
    attachProductCardListeners();
}

function filterCategory(category) {
    sessionStorage.setItem('selectedCategory', category);
    window.location.href = 'products.html';
}

// ========== QUANTITY CONTROL ==========
function increaseQuantity() {
    const input = document.getElementById('quantity');
    input.value = Math.min(10, parseInt(input.value) + 1);
}

function decreaseQuantity() {
    const input = document.getElementById('quantity');
    input.value = Math.max(1, parseInt(input.value) - 1);
}

// ========== NOTIFICATION ==========
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease';
    }, 10);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// ========== FORM SUBMISSIONS ==========
function handleNewsletterSubmit(event) {
    event.preventDefault();
    const email = event.target.querySelector('input[type="email"]').value;
    showNotification(`Newsletter subscription confirmed! Check ${email} for 15% discount code.`);
    event.target.reset();
}

function proceedToCheckout() {
    if (cart.length === 0) {
        showNotification('Please add items to cart first');
        return;
    }
    document.getElementById('checkout-section').style.display = 'block';
    document.getElementById('checkout-section').scrollIntoView({ behavior: 'smooth' });
}

function completeOrder() {
    const selectedPayment = document.querySelector('input[name="payment"]:checked').value;
    showNotification(`Order placed successfully with ${selectedPayment}!`);
    
    setTimeout(() => {
        cart = [];
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        window.location.href = 'index.html';
    }, 2000);
}

function addToWishlist() {
    showNotification('Added to wishlist!');
}

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    displayFeaturedProducts();
});

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { opacity: 0; transform: translateY(-20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes slideOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(-20px); }
    }
    
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 1.2rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        display: flex;
        align-items: center;
        gap: 0.8rem;
        min-width: 250px;
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.8rem;
    }
    
    .notification i {
        font-size: 1.3rem;
        color: #4ECDC4;
    }
    
    .btn-add-cart {
        background: linear-gradient(135deg, #4ECDC4, #45B7B0) !important;
        color: white !important;
        padding: 0.7rem 1.5rem !important;
        border: none !important;
        border-radius: 8px !important;
        font-weight: 600 !important;
        cursor: pointer !important;
        transition: all 0.3s ease !important;
    }
    
    .btn-add-cart:hover {
        transform: scale(1.05) !important;
    }
    
    @media (max-width: 600px) {
        .notification {
            top: 10px;
            right: 10px;
            left: 10px;
            min-width: auto;
        }
    }
`;
document.head.appendChild(style);