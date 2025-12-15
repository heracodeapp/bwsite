// Estado global da aplicação
const state = {
    categories: [],
    products: [],
    cart: [],
    currentRoute: '/',
    filters: {
        search: '',
        category: '',
        sort: 'name',
        onSale: false,
        featured: false
    }
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    loadData();
    initRouter();
});

// Carregar dados do localStorage ou inicializar com dados de exemplo
async function loadData() {
    const savedCategories = localStorage.getItem('categories');
    const savedProducts = localStorage.getItem('products');
    
    if (savedCategories && savedProducts) {
        state.categories = JSON.parse(savedCategories);
        state.products = JSON.parse(savedProducts);
    } else {
        // Dados iniciais
        state.categories = [
            {
                id: '1',
                name: 'Perfumes',
                description: 'Fragrâncias exclusivas e sofisticadas',
                imageUrl: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400',
                productCount: 12
            },
            {
                id: '2',
                name: 'Cosméticos',
                description: 'Produtos de beleza premium',
                imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400',
                productCount: 8
            },
            {
                id: '3',
                name: 'Skincare',
                description: 'Cuidados para sua pele',
                imageUrl: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400',
                productCount: 15
            }
        ];

        state.products = [
            {
                id: '1',
                name: 'Chanel N°5',
                description: 'O perfume mais icônico do mundo',
                price: '450.00',
                originalPrice: '550.00',
                categoryId: '1',
                imageUrl: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=400',
                stock: 15,
                isActive: true,
                isFeatured: true,
                isOnSale: true,
                rating: '4.8',
                reviewCount: 245,
                brand: 'Chanel'
            },
            {
                id: '2',
                name: 'Dior Sauvage',
                description: 'Fragrância intensa e masculina',
                price: '380.00',
                categoryId: '1',
                imageUrl: 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=400',
                stock: 20,
                isActive: true,
                isFeatured: true,
                isOnSale: false,
                rating: '4.9',
                reviewCount: 189,
                brand: 'Dior'
            },
            {
                id: '3',
                name: 'Base Líquida HD',
                description: 'Cobertura perfeita e natural',
                price: '120.00',
                originalPrice: '150.00',
                categoryId: '2',
                imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400',
                stock: 30,
                isActive: true,
                isFeatured: false,
                isOnSale: true,
                rating: '4.6',
                reviewCount: 98,
                brand: 'MAC'
            },
            {
                id: '4',
                name: 'Sérum Vitamina C',
                description: 'Antioxidante poderoso para pele radiante',
                price: '185.00',
                categoryId: '3',
                imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400',
                stock: 25,
                isActive: true,
                isFeatured: true,
                isOnSale: false,
                rating: '4.7',
                reviewCount: 156,
                brand: 'The Ordinary'
            },
            {
                id: '5',
                name: 'Tom Ford Black Orchid',
                description: 'Perfume luxuoso e sofisticado',
                price: '680.00',
                categoryId: '1',
                imageUrl: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400',
                stock: 10,
                isActive: true,
                isFeatured: true,
                isOnSale: false,
                rating: '4.9',
                reviewCount: 312,
                brand: 'Tom Ford'
            },
            {
                id: '6',
                name: 'Palette de Sombras',
                description: 'Cores vibrantes e duradouras',
                price: '95.00',
                originalPrice: '120.00',
                categoryId: '2',
                imageUrl: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400',
                stock: 18,
                isActive: true,
                isFeatured: false,
                isOnSale: true,
                rating: '4.5',
                reviewCount: 87,
                brand: 'Urban Decay'
            }
        ];

        saveData();
    }
    
    render();
}

// Salvar dados no localStorage
function saveData() {
    localStorage.setItem('categories', JSON.stringify(state.categories));
    localStorage.setItem('products', JSON.stringify(state.products));
}

// Sistema de roteamento
function initRouter() {
    window.addEventListener('hashchange', handleRoute);
    handleRoute();
}

function handleRoute() {
    const hash = window.location.hash.slice(1) || '/';
    state.currentRoute = hash;
    render();
}

function navigate(path) {
    window.location.hash = path;
}

// Renderização
function render() {
    const app = document.getElementById('app');
    const route = state.currentRoute;

    if (route === '/' || route === '') {
        app.innerHTML = renderHome();
    } else if (route === '/products' || route.startsWith('/products/')) {
        const categoryId = route.split('/products/')[1] || '';
        app.innerHTML = renderProducts(categoryId);
        attachProductsEventListeners();
    } else if (route.startsWith('/product/')) {
        const productId = route.split('/product/')[1];
        app.innerHTML = renderProductDetail(productId);
        attachProductDetailEventListeners();
    } else if (route === '/admin') {
        app.innerHTML = renderAdmin();
        attachAdminEventListeners();
    } else {
        app.innerHTML = renderNotFound();
    }

    updateCartCount();
}

// Página Home
function renderHome() {
    const featuredProducts = state.products.filter(p => p.isFeatured).slice(0, 3);

    return `
        <div class="container">
            <div class="hero">
                <h2 data-testid="text-hero-title">Beleza e Elegância</h2>
                <p data-testid="text-hero-subtitle">Descubra nossa coleção exclusiva de perfumes e cosméticos</p>
                <button class="hero-button" onclick="navigate('/products')" data-testid="button-shop-now">Explorar Produtos</button>
            </div>

            <section class="categories-section">
                <h3 class="section-title" data-testid="text-categories-title">Categorias</h3>
                <div class="categories-grid">
                    ${state.categories.map(category => `
                        <div class="category-card" onclick="navigate('/products/${category.id}')" data-testid="card-category-${category.id}">
                            <img src="${category.imageUrl}" alt="${category.name}" class="category-image" data-testid="img-category-${category.id}">
                            <h4 class="category-name" data-testid="text-category-name-${category.id}">${category.name}</h4>
                            <p class="category-description" data-testid="text-category-description-${category.id}">${category.description}</p>
                            <p data-testid="text-category-count-${category.id}">${category.productCount}+ produtos</p>
                        </div>
                    `).join('')}
                </div>
            </section>

            <section>
                <h3 class="section-title" data-testid="text-featured-title">Produtos em Destaque</h3>
                <div class="products-grid">
                    ${featuredProducts.map(product => renderProductCard(product)).join('')}
                </div>
            </section>
        </div>
    `;
}

// Página de Produtos
function renderProducts(categoryId = '') {
    let filteredProducts = state.products;

    if (categoryId) {
        filteredProducts = filteredProducts.filter(p => p.categoryId === categoryId);
    }

    if (state.filters.search) {
        filteredProducts = filteredProducts.filter(p => 
            p.name.toLowerCase().includes(state.filters.search.toLowerCase()) ||
            p.description.toLowerCase().includes(state.filters.search.toLowerCase())
        );
    }

    if (state.filters.onSale) {
        filteredProducts = filteredProducts.filter(p => p.isOnSale);
    }

    if (state.filters.featured) {
        filteredProducts = filteredProducts.filter(p => p.isFeatured);
    }

    // Ordenação
    filteredProducts.sort((a, b) => {
        switch (state.filters.sort) {
            case 'price-low':
                return parseFloat(a.price) - parseFloat(b.price);
            case 'price-high':
                return parseFloat(b.price) - parseFloat(a.price);
            case 'rating':
                return parseFloat(b.rating) - parseFloat(a.rating);
            default:
                return a.name.localeCompare(b.name);
        }
    });

    return `
        <div class="container">
            <div class="products-header">
                <input 
                    type="text" 
                    class="search-bar" 
                    id="searchInput" 
                    placeholder="Buscar produtos..." 
                    value="${state.filters.search}"
                    data-testid="input-search"
                >
                <div class="filter-controls">
                    <select class="filter-select" id="categoryFilter" data-testid="select-category">
                        <option value="">Todas Categorias</option>
                        ${state.categories.map(cat => `
                            <option value="${cat.id}" ${categoryId === cat.id ? 'selected' : ''}>${cat.name}</option>
                        `).join('')}
                    </select>
                    <select class="filter-select" id="sortFilter" data-testid="select-sort">
                        <option value="name">Nome</option>
                        <option value="price-low">Preço: Menor</option>
                        <option value="price-high">Preço: Maior</option>
                        <option value="rating">Avaliação</option>
                    </select>
                    <label style="display: flex; align-items: center; gap: 0.5rem;">
                        <input type="checkbox" id="onSaleFilter" ${state.filters.onSale ? 'checked' : ''} data-testid="checkbox-onsale">
                        Em Promoção
                    </label>
                </div>
            </div>

            ${filteredProducts.length === 0 ? 
                '<div class="empty-state"><p>Nenhum produto encontrado</p></div>' :
                `<div class="products-grid">
                    ${filteredProducts.map(product => renderProductCard(product)).join('')}
                </div>`
            }
        </div>
    `;
}

// Card de Produto
function renderProductCard(product) {
    const discount = product.originalPrice && product.isOnSale 
        ? Math.round(((parseFloat(product.originalPrice) - parseFloat(product.price)) / parseFloat(product.originalPrice)) * 100)
        : 0;

    return `
        <div class="product-card" data-testid="card-product-${product.id}">
            <img src="${product.imageUrl}" alt="${product.name}" class="product-image" data-testid="img-product-${product.id}">
            <div class="product-info">
                ${product.brand ? `<p class="product-brand" data-testid="text-brand-${product.id}">${product.brand}</p>` : ''}
                <h3 class="product-name" data-testid="text-product-name-${product.id}">${product.name}</h3>
                <p class="product-description" data-testid="text-product-description-${product.id}">${product.description}</p>
                
                <div class="product-rating">
                    <span class="stars" data-testid="text-rating-${product.id}">★ ${product.rating}</span>
                    <span class="review-count" data-testid="text-reviews-${product.id}">(${product.reviewCount})</span>
                </div>

                <div class="product-price">
                    <span class="current-price" data-testid="text-price-${product.id}">R$ ${product.price}</span>
                    ${product.originalPrice && product.isOnSale ? `
                        <span class="original-price" data-testid="text-original-price-${product.id}">R$ ${product.originalPrice}</span>
                        <span class="discount-badge" data-testid="badge-discount-${product.id}">-${discount}%</span>
                    ` : ''}
                </div>

                <div class="product-actions">
                    <button class="add-to-cart-button" onclick="addToCart('${product.id}')" data-testid="button-add-cart-${product.id}">
                        Adicionar ao Carrinho
                    </button>
                    <button class="view-details-button" onclick="navigate('/product/${product.id}')" data-testid="button-view-${product.id}">
                        Ver Detalhes
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Página de Detalhes do Produto
function renderProductDetail(productId) {
    const product = state.products.find(p => p.id === productId);
    
    if (!product) {
        return '<div class="container"><div class="empty-state"><h2>Produto não encontrado</h2></div></div>';
    }

    const relatedProducts = state.products
        .filter(p => p.categoryId === product.categoryId && p.id !== product.id)
        .slice(0, 3);

    return `
        <div class="container">
            <div class="product-detail">
                <img src="${product.imageUrl}" alt="${product.name}" class="product-detail-image" data-testid="img-product-detail">
                
                <div class="detail-info">
                    ${product.brand ? `<p class="product-brand" data-testid="text-detail-brand">${product.brand}</p>` : ''}
                    <h1 class="detail-title" data-testid="text-detail-name">${product.name}</h1>
                    <p data-testid="text-detail-description">${product.description}</p>
                    
                    <div class="product-rating">
                        <span class="stars" data-testid="text-detail-rating">★ ${product.rating}</span>
                        <span class="review-count" data-testid="text-detail-reviews">(${product.reviewCount} avaliações)</span>
                    </div>

                    <div class="product-price">
                        <span class="current-price" data-testid="text-detail-price">R$ ${product.price}</span>
                        ${product.originalPrice && product.isOnSale ? `
                            <span class="original-price" data-testid="text-detail-original-price">R$ ${product.originalPrice}</span>
                        ` : ''}
                    </div>

                    <div class="quantity-selector">
                        <span>Quantidade:</span>
                        <button class="quantity-button" onclick="decreaseQuantity()" data-testid="button-decrease-quantity">-</button>
                        <span class="quantity-value" id="quantityValue" data-testid="text-quantity">1</span>
                        <button class="quantity-button" onclick="increaseQuantity()" data-testid="button-increase-quantity">+</button>
                    </div>

                    <button class="add-to-cart-button" onclick="addToCartWithQuantity('${product.id}')" data-testid="button-add-to-cart-detail">
                        Adicionar ao Carrinho
                    </button>

                    <p data-testid="text-stock">Em estoque: ${product.stock} unidades</p>
                </div>
            </div>

            ${relatedProducts.length > 0 ? `
                <section>
                    <h3 class="section-title" data-testid="text-related-title">Produtos Relacionados</h3>
                    <div class="products-grid">
                        ${relatedProducts.map(p => renderProductCard(p)).join('')}
                    </div>
                </section>
            ` : ''}
        </div>
    `;
}

// Página Admin
function renderAdmin() {
    const totalProducts = state.products.length;
    const totalCategories = state.categories.length;
    const totalRevenue = state.products.reduce((sum, p) => sum + parseFloat(p.price) * (p.reviewCount || 0), 0);

    return `
        <div class="container">
            <div class="admin-header">
                <h2 data-testid="text-admin-title">Painel Administrativo</h2>
                <button class="submit-button" onclick="openProductModal()" data-testid="button-new-product" style="width: auto;">
                    Novo Produto
                </button>
            </div>

            <div class="admin-grid">
                <div class="stat-card">
                    <p class="stat-title">Total de Produtos</p>
                    <p class="stat-value" data-testid="text-stat-products">${totalProducts}</p>
                </div>
                <div class="stat-card">
                    <p class="stat-title">Categorias</p>
                    <p class="stat-value" data-testid="text-stat-categories">${totalCategories}</p>
                </div>
                <div class="stat-card">
                    <p class="stat-title">Receita Estimada</p>
                    <p class="stat-value" data-testid="text-stat-revenue">R$ ${totalRevenue.toFixed(2)}</p>
                </div>
            </div>

            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Produto</th>
                            <th>Categoria</th>
                            <th>Preço</th>
                            <th>Estoque</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${state.products.map(product => {
                            const category = state.categories.find(c => c.id === product.categoryId);
                            return `
                                <tr data-testid="row-product-${product.id}">
                                    <td data-testid="text-admin-product-${product.id}">${product.name}</td>
                                    <td data-testid="text-admin-category-${product.id}">${category ? category.name : '-'}</td>
                                    <td data-testid="text-admin-price-${product.id}">R$ ${product.price}</td>
                                    <td data-testid="text-admin-stock-${product.id}">${product.stock}</td>
                                    <td>
                                        <span style="color: ${product.isActive ? 'var(--success)' : 'var(--danger)'}" data-testid="text-admin-status-${product.id}">
                                            ${product.isActive ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </td>
                                    <td>
                                        <div class="action-buttons">
                                            <button class="edit-button" onclick="editProduct('${product.id}')" data-testid="button-edit-${product.id}">Editar</button>
                                            <button class="delete-button" onclick="deleteProduct('${product.id}')" data-testid="button-delete-${product.id}">Excluir</button>
                                        </div>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Modal de Produto -->
        <div class="modal" id="productModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="modalTitle" data-testid="text-modal-title">Novo Produto</h3>
                    <button class="close-modal" onclick="closeProductModal()" data-testid="button-close-modal">×</button>
                </div>
                <form id="productForm" onsubmit="saveProduct(event)">
                    <div class="form-group">
                        <label class="form-label">Nome</label>
                        <input type="text" class="form-input" id="productName" required data-testid="input-product-name">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Descrição</label>
                        <textarea class="form-textarea" id="productDescription" required data-testid="input-product-description"></textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Preço</label>
                        <input type="number" step="0.01" class="form-input" id="productPrice" required data-testid="input-product-price">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Preço Original</label>
                        <input type="number" step="0.01" class="form-input" id="productOriginalPrice" data-testid="input-product-original-price">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Categoria</label>
                        <select class="form-select" id="productCategory" required data-testid="select-product-category">
                            <option value="">Selecione uma categoria</option>
                            ${state.categories.map(cat => `
                                <option value="${cat.id}">${cat.name}</option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">URL da Imagem</label>
                        <input type="url" class="form-input" id="productImage" required data-testid="input-product-image">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Estoque</label>
                        <input type="number" class="form-input" id="productStock" required data-testid="input-product-stock">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Marca</label>
                        <input type="text" class="form-input" id="productBrand" data-testid="input-product-brand">
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" class="form-checkbox" id="productFeatured" data-testid="checkbox-product-featured">
                            Produto em Destaque
                        </label>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" class="form-checkbox" id="productOnSale" data-testid="checkbox-product-onsale">
                            Em Promoção
                        </label>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" class="form-checkbox" id="productActive" checked data-testid="checkbox-product-active">
                            Ativo
                        </label>
                    </div>
                    <button type="submit" class="submit-button" data-testid="button-save-product">Salvar Produto</button>
                </form>
            </div>
        </div>
    `;
}

// Página 404
function renderNotFound() {
    return `
        <div class="container">
            <div class="empty-state">
                <h2 data-testid="text-not-found">Página não encontrada</h2>
                <button class="hero-button" onclick="navigate('/')" data-testid="button-home">Voltar ao Início</button>
            </div>
        </div>
    `;
}

// Event Listeners para Produtos
function attachProductsEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const sortFilter = document.getElementById('sortFilter');
    const onSaleFilter = document.getElementById('onSaleFilter');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            state.filters.search = e.target.value;
            render();
        });
    }

    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            if (e.target.value) {
                navigate(`/products/${e.target.value}`);
            } else {
                navigate('/products');
            }
        });
    }

    if (sortFilter) {
        sortFilter.addEventListener('change', (e) => {
            state.filters.sort = e.target.value;
            render();
        });
    }

    if (onSaleFilter) {
        onSaleFilter.addEventListener('change', (e) => {
            state.filters.onSale = e.target.checked;
            render();
        });
    }
}

// Event Listeners para Detalhes do Produto
function attachProductDetailEventListeners() {
    // Já implementado via onclick inline
}

// Event Listeners para Admin
function attachAdminEventListeners() {
    // Já implementado via onclick inline
}

// Funções do Carrinho
function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        state.cart = JSON.parse(savedCart);
    }
    updateCartUI();
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(state.cart));
}

function addToCart(productId) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    const cartItem = state.cart.find(item => item.productId === productId);
    
    if (cartItem) {
        cartItem.quantity += 1;
    } else {
        state.cart.push({
            productId: productId,
            quantity: 1
        });
    }

    saveCart();
    updateCartUI();
    showNotification(`${product.name} adicionado ao carrinho!`);
}

function addToCartWithQuantity(productId) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    const quantity = parseInt(document.getElementById('quantityValue').textContent);
    const cartItem = state.cart.find(item => item.productId === productId);
    
    if (cartItem) {
        cartItem.quantity += quantity;
    } else {
        state.cart.push({
            productId: productId,
            quantity: quantity
        });
    }

    saveCart();
    updateCartUI();
    showNotification(`${product.name} adicionado ao carrinho!`);
}

function removeFromCart(productId) {
    state.cart = state.cart.filter(item => item.productId !== productId);
    saveCart();
    updateCartUI();
}

function updateCartQuantity(productId, change) {
    const cartItem = state.cart.find(item => item.productId === productId);
    if (cartItem) {
        cartItem.quantity += change;
        if (cartItem.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart();
            updateCartUI();
        }
    }
}

function updateCartUI() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (!cartItems || !cartTotal) return;

    if (state.cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-state"><p>Carrinho vazio</p></div>';
        cartTotal.textContent = 'R$ 0,00';
    } else {
        let total = 0;
        cartItems.innerHTML = state.cart.map(item => {
            const product = state.products.find(p => p.id === item.productId);
            if (!product) return '';
            
            const itemTotal = parseFloat(product.price) * item.quantity;
            total += itemTotal;

            return `
                <div class="cart-item" data-testid="cart-item-${product.id}">
                    <img src="${product.imageUrl}" alt="${product.name}" class="cart-item-image" data-testid="img-cart-${product.id}">
                    <div class="cart-item-info">
                        <p class="cart-item-name" data-testid="text-cart-name-${product.id}">${product.name}</p>
                        <p class="cart-item-price" data-testid="text-cart-price-${product.id}">R$ ${product.price}</p>
                        <div class="cart-item-quantity">
                            <button class="cart-item-button" onclick="updateCartQuantity('${product.id}', -1)" data-testid="button-cart-decrease-${product.id}">-</button>
                            <span data-testid="text-cart-quantity-${product.id}">${item.quantity}</span>
                            <button class="cart-item-button" onclick="updateCartQuantity('${product.id}', 1)" data-testid="button-cart-increase-${product.id}">+</button>
                        </div>
                        <button class="remove-item" onclick="removeFromCart('${product.id}')" data-testid="button-cart-remove-${product.id}">Remover</button>
                    </div>
                </div>
            `;
        }).join('');
        
        cartTotal.textContent = `R$ ${total.toFixed(2)}`;
    }

    updateCartCount();
}

function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) {
        cartCount.textContent = totalItems;
    }
}

function toggleCart() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}

function checkout() {
    if (state.cart.length === 0) {
        showNotification('Carrinho vazio!');
        return;
    }
    
    showNotification('Pedido finalizado com sucesso!');
    state.cart = [];
    saveCart();
    updateCartUI();
    toggleCart();
}

// Funções de Quantidade
function increaseQuantity() {
    const quantityEl = document.getElementById('quantityValue');
    const current = parseInt(quantityEl.textContent);
    quantityEl.textContent = current + 1;
}

function decreaseQuantity() {
    const quantityEl = document.getElementById('quantityValue');
    const current = parseInt(quantityEl.textContent);
    if (current > 1) {
        quantityEl.textContent = current - 1;
    }
}

// Funções Admin
let editingProductId = null;

function openProductModal() {
    editingProductId = null;
    document.getElementById('modalTitle').textContent = 'Novo Produto';
    document.getElementById('productForm').reset();
    document.getElementById('productModal').classList.add('active');
}

function closeProductModal() {
    document.getElementById('productModal').classList.remove('active');
    editingProductId = null;
}

function editProduct(productId) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    editingProductId = productId;
    document.getElementById('modalTitle').textContent = 'Editar Produto';
    document.getElementById('productName').value = product.name;
    document.getElementById('productDescription').value = product.description;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productOriginalPrice').value = product.originalPrice || '';
    document.getElementById('productCategory').value = product.categoryId;
    document.getElementById('productImage').value = product.imageUrl;
    document.getElementById('productStock').value = product.stock;
    document.getElementById('productBrand').value = product.brand || '';
    document.getElementById('productFeatured').checked = product.isFeatured;
    document.getElementById('productOnSale').checked = product.isOnSale;
    document.getElementById('productActive').checked = product.isActive;
    
    document.getElementById('productModal').classList.add('active');
}

function deleteProduct(productId) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
        state.products = state.products.filter(p => p.id !== productId);
        saveData();
        render();
        showNotification('Produto excluído com sucesso!');
    }
}

function saveProduct(event) {
    event.preventDefault();

    const productData = {
        name: document.getElementById('productName').value,
        description: document.getElementById('productDescription').value,
        price: document.getElementById('productPrice').value,
        originalPrice: document.getElementById('productOriginalPrice').value || null,
        categoryId: document.getElementById('productCategory').value,
        imageUrl: document.getElementById('productImage').value,
        stock: parseInt(document.getElementById('productStock').value),
        brand: document.getElementById('productBrand').value || null,
        isFeatured: document.getElementById('productFeatured').checked,
        isOnSale: document.getElementById('productOnSale').checked,
        isActive: document.getElementById('productActive').checked,
        rating: '5.0',
        reviewCount: 0
    };

    if (editingProductId) {
        const productIndex = state.products.findIndex(p => p.id === editingProductId);
        state.products[productIndex] = { ...state.products[productIndex], ...productData };
        showNotification('Produto atualizado com sucesso!');
    } else {
        const newProduct = {
            id: Date.now().toString(),
            ...productData
        };
        state.products.push(newProduct);
        showNotification('Produto criado com sucesso!');
    }

    saveData();
    closeProductModal();
    render();
}

// Notificações
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--primary);
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px var(--shadow);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    notification.setAttribute('data-testid', 'notification');
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Animações CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
