var swiper = new Swiper(".mySwiper", {
    loop : true,
    navigation: {
        nextEl: "#next",
        prevEl: "#prev",
    },
});
// Swiper initializer: khởi tạo carousel/slider cho phần review

// PRODUCT SEARCH, FILTER AND RENDER FROM data.js
document.addEventListener('DOMContentLoaded', function() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const categoryGrids = document.querySelectorAll('.category-grid');
    const detailContainer = document.getElementById('productDetail');
    const cartValue = document.querySelector('.cart-value, .card-value');
    const noResults = document.getElementById('noResults');
    let currentFilter = 'all';

    if (typeof product === 'undefined') {
        return;
    }

    function formatPrice(value) {
        return value.toLocaleString('vi-VN');
    }
    // formatPrice: định dạng số theo locale Việt Nam (dùng để hiển thị tiền)

    // Cart storage helpers (store full items so we can render images)
    function getCartItems() {
        const raw = localStorage.getItem('kandyCartItems');
        return raw ? JSON.parse(raw) : [];
    }
    // getCartItems: đọc mảng sản phẩm đã lưu trong localStorage (key: kandyCartItems)

    function saveCartItems(items) {
        localStorage.setItem('kandyCartItems', JSON.stringify(items));
    }
    // saveCartItems: lưu mảng giỏ hàng vào localStorage

    function getCartCount() {
        const items = getCartItems();
        return items.reduce((s, it) => s + (it.qty || 0), 0);
    }
    // getCartCount: trả về tổng số lượng sản phẩm trong giỏ (tổng qty)

    function setCartCount(count) {
        // optional: keep legacy key for other code
        localStorage.setItem('kandyCartCount', String(count));
        if (cartValue) {
            cartValue.textContent = count;
        }
    }
    // setCartCount: cập nhật số lượng hiển thị ở header và lưu key phụ kandyCartCount

    function addToCart(itemId) {
        const item = product.find(productItem => String(productItem.id) === String(itemId));
        if (!item) return;

        const items = getCartItems();
        const existing = items.find(it => String(it.id) === String(itemId));
        if (existing) {
            existing.qty = (existing.qty || 0) + 1;
        } else {
            items.push({ id: item.id, name: item.name, price: item.price, img: item.img, qty: 1 });
        }
        saveCartItems(items);
        const count = getCartCount();
        setCartCount(count);
        renderCartList();
        console.log(`Đã thêm vào giỏ hàng: ${item.name}`);
    }
    // addToCart: thêm sản phẩm vào giỏ (tăng qty nếu đã tồn tại), lưu và render lại giỏ

    function initCartCount() {
        const count = getCartCount();
        if (cartValue) cartValue.textContent = count;
    }
    // initCartCount: khởi tạo giá trị hiển thị số lượng giỏ khi load trang

    function renderCartList() {
        const cartList = document.querySelector('.cart-list');
        const cartTotalEl = document.querySelector('.cart-total');
        if (!cartList || !cartTotalEl) return;

        const items = getCartItems();
        cartList.innerHTML = '';
        if (!items.length) {
            cartList.innerHTML = '<p>Giỏ hàng trống.</p>';
            cartTotalEl.textContent = '0đ';
            return;
        }

        let total = 0;
        items.forEach(it => {
            total += (it.price || 0) * (it.qty || 1);
            const el = document.createElement('div');
            el.className = 'item';
            el.innerHTML = `
                <div class="item-image">
                    <img src="${it.img}" alt="${it.name}">
                </div>
                <div class="item-details">
                    <h4>${it.name}</h4>
                    <p class="item-total">${formatPrice(it.price * it.qty)}đ</p>
                </div>
                <div class="item-counter">
                    <button type="button" class="count-btn cart-decrease" data-id="${it.id}">
                        <i class="fa-solid fa-minus"></i>
                    </button>
                    <span class="count-value">${it.qty}</span>
                    <button type="button" class="count-btn cart-increase" data-id="${it.id}">
                        <i class="fa-solid fa-plus"></i>
                    </button>
                </div>
            `;
            cartList.appendChild(el);
        });

        cartTotalEl.textContent = formatPrice(total) + 'đ';

        // attach action listeners
        cartList.querySelectorAll('.cart-increase').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.dataset.id;
                const items = getCartItems();
                const it = items.find(x => String(x.id) === String(id));
                if (it) {
                    it.qty = (it.qty || 0) + 1;
                    saveCartItems(items);
                    setCartCount(getCartCount());
                    renderCartList();
                }
            });
        });

        cartList.querySelectorAll('.cart-decrease').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.dataset.id;
                let items = getCartItems();
                const it = items.find(x => String(x.id) === String(id));
                if (it) {
                    it.qty = (it.qty || 0) - 1;
                    if (it.qty <= 0) items = items.filter(x => String(x.id) !== String(id));
                    saveCartItems(items);
                    setCartCount(getCartCount());
                    renderCartList();
                }
            });
        });
    }
    // ensureCartPanel: nếu trang chưa có phần .cart-table, tạo panel động và thêm vào body
    function ensureCartPanel() {
        let cartPanel = document.querySelector('.cart-table');
        if (cartPanel) return cartPanel;

        cartPanel = document.createElement('div');
        cartPanel.className = 'cart-table';
        cartPanel.style.position = 'fixed';
        cartPanel.style.right = '20px';
        cartPanel.style.top = '80px';
        cartPanel.style.width = '320px';
        cartPanel.style.maxHeight = '70vh';
        cartPanel.style.overflow = 'auto';
        cartPanel.style.background = '#fff';
        cartPanel.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)';
        cartPanel.style.padding = '12px';
        cartPanel.style.zIndex = '9999';

        cartPanel.innerHTML = `
            <h4>Giỏ hàng</h4>
            <div class="cart-list"></div>
            <div class="total-container">
                <h4>Tổng tiền:</h4>
                <h4 class="cart-total">0đ</h4>
            </div>
            <div class="btn-container flex gap-2">
                <a href="#" class="btn cart-pay">Thanh toán</a>
                <a href="#" class="btn cart-close">Đóng</a>
            </div>
        `;

        document.body.appendChild(cartPanel);
        return cartPanel;
    }

    // Open/close helpers for cart panel
    function openCart() {
        const panel = ensureCartPanel();
        panel.style.display = 'block';
        renderCartList();
    }

    function closeCart() {
        const panel = document.querySelector('.cart-table');
        if (panel) panel.style.display = 'none';
    }

    function toggleCart() {
        const panel = document.querySelector('.cart-table');
        if (!panel || panel.style.display === 'none' || getComputedStyle(panel).display === 'none') {
            openCart();
        } else {
            closeCart();
        }
    }

    // gắn sự kiện mở/đóng cho icon giỏ hàng ở header
    document.querySelectorAll('.card-icon').forEach(icon => {
        icon.addEventListener('click', function(e) {
            e.preventDefault();
            toggleCart();
        });
    });

    // delegate đóng khi nhấn nút Đóng/Thanh toán trong cart (sử dụng event delegation)
    document.addEventListener('click', function(e) {
        if (e.target.closest('.cart-close')) {
            e.preventDefault();
            closeCart();
        }
        if (e.target.closest('.cart-pay')) {
            e.preventDefault();
            closeCart();
            alert('Thanh toán thành công! Cảm ơn bạn đã mua hàng.');
        }
    });
    // renderCartList: vẽ lại phần nội dung giỏ hàng (.cart-list) từ localStorage,
    // hiển thị thumbnail, tên, giá x số lượng và tổng tiền; đồng thời gắn sự kiện tăng/giảm/xóa

    function createProductCard(item) {
        const card = document.createElement('div');
        card.className = 'order-card product-item';
        card.dataset.category = item.category /*|| 'all'*/;
        card.dataset.name = item.name || '';
        card.innerHTML = `
            <div class="card-image">
                <img src="${item.img || '../assets/thesis/banh-noi-bac1.png'}" alt="${item.name}">
            </div>
            <h4 class="mt-one-half">${item.name}</h4>
            <h4 class="price">${formatPrice(item.price)}đ</h4>
            <a href="chi-tiet.html?id=${item.id}" class="btn">Xem chi tiết</a>
        `;

        return card;
    }
    // createProductCard: tạo DOM element cho thẻ sản phẩm (dùng ở danh sách sản phẩm)

    function renderProducts(items) {
        let hasResults = false;

        categoryGrids.forEach(grid => {
            const section = grid.closest('.product-items');
            const categoryId = section ? section.id : '';
            grid.innerHTML = '';

            const sectionItems = items.filter(item => item.category === categoryId);
            if (sectionItems.length) {
                hasResults = true;
            }
            sectionItems.forEach(item => grid.appendChild(createProductCard(item)));
        });

        if (noResults) {
            noResults.style.display = hasResults ? 'none' : 'block';
        }
    }
    // renderProducts: hiển thị các sản phẩm vào các grid theo category

    function renderDetailPage() {
        if (!detailContainer) {
            return;
        }

        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        if (!id) {
            detailContainer.innerHTML = '<p>Không có sản phẩm để hiển thị.</p>';
            return;
        }

        const selected = product.find(item => String(item.id) === id);
        if (!selected) {
            detailContainer.innerHTML = '<p>Không tìm thấy sản phẩm.</p>';
            return;
        }

        detailContainer.innerHTML = `
            <div class="product-detail-card">
                <div class="detail-image">
                    <img src="${selected.img}" alt="${selected.name}">
                </div>
                <div class="detail-content">
                    <h2>${selected.name}</h2>
                    <h4 class="price">${formatPrice(selected.price)}đ</h4>
                    <p class="description">${selected.description}</p>
                    <div class="detail-actions flex gap-2">
                        <button type="button" class="btn detail-add-cart-btn" data-id="${selected.id}">Thêm vào giỏ hàng</button>
                        <a href="san-pham.html" class="btn">Quay lại</a>
                    </div>
                </div>
            </div>
        `;

        const detailAddBtn = detailContainer.querySelector('.detail-add-cart-btn');
        if (detailAddBtn) {
            detailAddBtn.addEventListener('click', function(e) {
                e.preventDefault();
                addToCart(selected.id);
            });
        }
    }
    // renderDetailPage: nếu đang ở trang chi tiết, render thông tin sản phẩm và gắn nút thêm vào giỏ

    function filterProducts() {
        renderProducts(product);
    }
    // filterProducts: wrapper để gọi renderProducts với dữ liệu đầy đủ

    filterButtons.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter || 'all';
            filterProducts();

            const targetId = currentFilter === 'all' ? 'productsGrid' : currentFilter;
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
    // filterButtons handler: thay đổi bộ lọc khi click và cuộn tới section tương ứng

    initCartCount();
    renderCartList();
    // ẩn tất cả cart-table theo mặc định — người dùng mở bằng icon
    document.querySelectorAll('.cart-table').forEach(p => {
        if (!p.dataset.persistent) p.style.display = 'none';
    });

    if (detailContainer) {
        renderDetailPage();
    } else if (categoryGrids.length) {
        renderProducts(product);
    }
});
    