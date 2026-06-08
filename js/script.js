// phần swipper cho phần review của khách hàng
var swiper = new Swiper(".mySwiper", {
    loop: true,
    navigation: {
        nextEl: "#next",
        prevEl: "#prev",
    },
});

// Khai báo biến sản phẩm dùng chung cho toàn bộ file
let currentProducts = [];

// Lấy dữ liệu sản sẩm
if (localStorage.getItem('localProducts')) {
    currentProducts = JSON.parse(localStorage.getItem('localProducts'));
} else if (typeof product !== 'undefined') {
    currentProducts = product;
    localStorage.setItem('localProducts', JSON.stringify(product));
}

document.addEventListener('DOMContentLoaded', function () {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const categoryGrids = document.querySelectorAll('.category-grid');
    const detailContainer = document.getElementById('productDetail');
    const cartValue = document.querySelector('.cart-value, .card-value');
    const noResults = document.getElementById('noResults');
    let currentFilter = 'all';

    // format tiền theo việt Nam  
    function formatPrice(value) {
        return value.toLocaleString('vi-VN');
    }

    // Đọc mảng sản phẩm đã lưu trong localStorage của giỏ hàng
    function getCartItems() {
        const raw = localStorage.getItem('cartItems');
        return raw ? JSON.parse(raw) : [];
    }

    // Lưu mảng trong giỏ hàng vào localStorage
    function saveCartItems(items) {
        localStorage.setItem('cartItems', JSON.stringify(items));
    }

    // Tổng số lượng sản phẩm trong giỏ (tổng qty)
    function getCartCount() {
        const items = getCartItems();
        let total = 0;
        for (const item of items) {
            total += item.qty || 0;
        }
        return total;
    }

    /*GIỎ HÀNG*/

    // Cập nhật số chỗ icon giỏ hàng ở trang header 
    function setCartCount(count) {
        localStorage.setItem('cartCount', count);
        if (!cartValue) return;
        cartValue.textContent = count;
    }

    // Thêm vào giỏ hàng nếu đã tồn tại thì tăng qty nếu chưa thì thêm mới
    function addToCart(itemId) {
        const item = currentProducts.find(productItem => String(productItem.id) === String(itemId));
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

    // Hiển danh sách trong giỏ hàng
    function renderCartList() {
        const cartList = document.querySelector('.cart-list');
        const cartTotalElement = document.querySelector('.cart-total');
        if (!cartList || !cartTotalElement) return;
        const items = getCartItems();
        cartList.innerHTML = '';
        if (!items.length) {
            cartList.innerHTML = '<p>Giỏ hàng trống.</p>';
            cartTotalElement.textContent = '0đ';
            return;
        }

        // Tổng tiền
        let total = 0;
        items.forEach(it => {
            total += (it.price || 0) * (it.qty || 1);
            const element = document.createElement('div');
            element.className = 'item';
            element.innerHTML = `
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
            cartList.appendChild(element);
        });
        cartTotalElement.textContent = formatPrice(total) + 'đ';

        // Tăng số lượng sản phẩm
        cartList.querySelectorAll('.cart-increase').forEach(btn => {
            btn.addEventListener('click', function () {
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

        // Giảm số lượng sản phẩm 
        cartList.querySelectorAll('.cart-decrease').forEach(btn => {
            btn.addEventListener('click', function () {
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

    // Mặc định là ẩn giỏ hàng
    document.querySelectorAll('.cart-table').forEach(p => {
        if (!p.dataset.persistent) p.style.display = 'none';
    });

    function useIconShopping() {
        let cartIcon = document.querySelector('.cart-table');
        return cartIcon;
    }

    function openCart() {
        const panel = useIconShopping();
        if (panel) panel.style.display = 'block';
        renderCartList();
    }


    function closeCart() {
        const panel = document.querySelector('.cart-table');
        if (panel) panel.style.display = 'none';
    }

    function btnCart() {
        const panel = document.querySelector('.cart-table');
        if (!panel || panel.style.display === 'none' || getComputedStyle(panel).display === 'none') {
            openCart();
        } else {
            closeCart();
        }
    }

    // Hiển thị số lượng khi load trang
    function initCartCount() {
        if (!cartValue) return;
        cartValue.textContent = getCartCount();
    }



    document.querySelectorAll('.card-icon').forEach(icon => {
        icon.addEventListener('click', function (e) {
            e.preventDefault();
            btnCart();
        });
    });

    document.addEventListener('click', function (e) {
        if (e.target.closest('.cart-close')) {
            e.preventDefault();
            closeCart();
        }
        if (e.target.closest('.cart-pay')) {
            e.preventDefault();
            localStorage.removeItem('cartItems');
            setCartCount(0);
            renderCartList();
            alert('Thanh toán thành công! Cảm ơn bạn đã mua hàng.');
        }
    });


    /*HIỂN THỊ SẢN PHẨM*/
    function createProductCard(item) {
        const card = document.createElement('div');
        card.className = 'order-card product-item';
        card.dataset.category = item.category;
        card.dataset.name = item.name || '';
        card.innerHTML = `
            <div class="card-image">
                <img src="${item.img || '../assets/thesis/banh-noi-bac1.png'}" alt="${item.name}">
            </div>
            <h4 class="mt-one-half">${item.name}</h4>
            <h4 class="price">${formatPrice(item.price)}đ</h4>
            <a href="chi-tiet.html?id=${item.id}" class="btn btn-buy-or-delete" data-id="${item.id}">Mua</a>
        `;
        return card;
    }

    // Hiển thị sản phẩm theo mục category
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

    function renderDetailPage() {
        if (!detailContainer) return;
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        if (!id) {
            detailContainer.innerHTML = '<p>Không có sản phẩm để hiển thị.</p>';
            return;
        }

        const selecte = currentProducts.find(item => String(item.id) === id);
        if (!selecte) {
            detailContainer.innerHTML = '<p>Không tìm thấy sản phẩm.</p>';
            return;
        }
        detailContainer.innerHTML = `
            <div class="product-detail-card">
                <div class="detail-image">
                    <img src="${selecte.img}" alt="${selecte.name}">
                </div>
                <div class="detail-content">
                    <h2>${selecte.name}</h2>
                    <h4 class="price">${formatPrice(selecte.price)}đ</h4>
                    <p class="description">${selecte.description || 'Chưa có mô tả.'}</p>
                    <div class="detail-actions flex gap-2">
                        <button type="button" class="btn detail-add-cart-btn" data-id="${selecte.id}">Thêm vào giỏ hàng</button>
                        <a href="san-pham.html" class="btn">Quay lại</a>
                    </div>
                </div>
            </div>
        `;
        const addBtn = detailContainer.querySelector('.detail-add-cart-btn');
        if (addBtn) {
            addBtn.addEventListener('click', function (e) {
                e.preventDefault();
                addToCart(selecte.id);
            });
        }
    }

    initCartCount();
    renderCartList();


    // Thực hiện render sản phẩm lên màn hình
    if (detailContainer) {
        renderDetailPage();
    } else if (categoryGrids.length) {
        renderProducts(currentProducts);
    }

    /*MODAL THÊM SẢN PHẨM*/
    const openModalBtn = document.getElementById("btn");
    const modal = document.getElementById("modal");

    if (openModalBtn && modal) {
        openModalBtn.addEventListener('click', function (e) {
            e.preventDefault();
            modal.classList.remove("hidden");
        });

        // Click ra khoảng không bên ngoài modal để tự đóng modal
        modal.addEventListener("click", function (e) {
            if (e.target === modal) {
                modal.classList.add("hidden");
            }
        });
    }

    // Scroll filter mượt
    filterButtons.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter || 'all';

            const targetId = currentFilter === 'all' ? 'productsGrid' : currentFilter;
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
});

/*MODAL ĐĂNG NHẬP*/
const loginModal = document.getElementById("loginModal");
const loginBtn = document.querySelector(".btn-login-toggle");
const closeSpan = document.querySelector(".close-modal");

if (loginBtn && loginModal) {
    loginBtn.addEventListener('click', function (e) {
        e.preventDefault();
        loginModal.style.display = "flex";
    });
}

if (closeSpan) {
    closeSpan.addEventListener('click', function () {
        loginModal.style.display = "none";
    });
}

window.addEventListener('click', function (e) {
    if (e.target === loginModal) {
        loginModal.style.display = "none";
    }
});

const loginForm = document.querySelector(".modal-form");
if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        alert("Đăng nhập thành công vào hệ thống Kandy Food!");
        loginModal.style.display = "none";
    });
}

// Hàm đóng Modal
function closeAddModal() {
    const modal = document.getElementById("modal");
    if (modal) {
        modal.classList.add("hidden");
    }
}

/*CHỨC NĂNG THÊM SẢN PHẨM*/
function handleAddProduct() {
    const nameInput = document.getElementById("name");
    const priceInput = document.getElementById("price");
    const imgInput = document.getElementById("img");
    const categoryInput = document.getElementById("category");
    const descInput = document.getElementById("description");

    if (!nameInput || !priceInput) return;

    // Kiểm tra tính hợp lệ của dữ liệu đầu vào
    if (!nameInput.value.trim() || !priceInput.value.trim()) {
        alert("Vui lòng nhập tên sản phẩm và giá tiền đầy đủ!");
        return;
    }

    // Tạo object cấu trúc sản phẩm mới
    const newProduct = {
        id: "prod_" + Date.now(), // ID tự động sinh duy nhất không trùng lặp
        name: nameInput.value.trim(),
        price: parseInt(priceInput.value),
        img: imgInput.value.trim() || '../assets/thesis/banh-noi-bac1.png', // Lấy ảnh mặc định nếu để trống
        category: categoryInput.value,
        description: descInput.value.trim() || "Món ăn ngon đậm đà hương vị từ hệ thống Kandy Food."
    };

    // Đẩy sản phẩm mới vào mảng hiện tại và lưu đè lên localStorage
    currentProducts.push(newProduct);
    localStorage.setItem('localProducts', JSON.stringify(currentProducts));

    alert(`Thêm thành công món ăn mới: ${newProduct.name}!`);

    nameInput.value = '';
    priceInput.value = '';
    imgInput.value = '';
    if (descInput) descInput.value = '';


    closeAddModal();
    location.reload();
}

const deleteToggleBtn = document.getElementById("btnDeleteToggle");
const productsGrid = document.getElementById("productsGrid");

let isDeleteMode = false;

// Kiểm tra nút có tồn tại không
if (deleteToggleBtn && productsGrid) {
    deleteToggleBtn.addEventListener('click', function (e) {
        e.preventDefault();
        isDeleteMode = !isDeleteMode;
        const allProductButtons = productsGrid.querySelectorAll('.btn-buy-or-delete');
        if (isDeleteMode === true) {
            deleteToggleBtn.textContent = "Hủy xóa";
            deleteToggleBtn.style.background = "#dc3545";

            allProductButtons.forEach(function (singleButton) {
                singleButton.textContent = "Xóa";
                singleButton.style.background = "#dc3545";
            });
        }

        else {
            // trả lại nút xóa
            deleteToggleBtn.textContent = "Xóa sản phẩm";
            deleteToggleBtn.style.background = "#F2BD12";

            // từng sản phẩm sẽ trả lại chữ mua
            allProductButtons.forEach(function (singleButton) {
                singleButton.textContent = "Mua";
                singleButton.style.background = "#F2BD12";
            });
        }
    });
    productsGrid.addEventListener('click', function (e) {
        const productBtn = e.target.closest('.btn-buy-or-delete');
        if (productBtn === null) {
            return;
        }
        // tìm kiếm thông tin trong file data
        const idToDelete = productBtn.dataset.id;
        // Tìm trong mảng dữ liệu xem object nào có ID trùng với ID vừa bấm
        const targetItem = currentProducts.find(function (e) {
            return String(e.id) === String(idToDelete);
        });

        let confirmName = "sản phẩm này";
        if (targetItem !== undefined) {
            confirmName = targetItem.name;
        }
        if (isDeleteMode === true) {
            // Trong chế độ xóa
            e.preventDefault(); // bỏ hành động mặc định
            const userConfirm = confirm("Bạn có chắc chắn muốn xóa " + confirmName + " ra khỏi thực đơn?");
            if (userConfirm === true) {
                // xóa những id = với id cần xóa    
                currentProducts = currentProducts.filter(function (e) {
                    return String(e.id) !== String(idToDelete);
                });
                localStorage.setItem('localProducts', JSON.stringify(currentProducts));
                const productCard = productBtn.closest('.product-item');
                if (productCard !== null) {
                    productCard.remove();
                }
            }
        }
        else {
            console.log("Đang mua sản phẩm: " + confirmName);
        }
    });
}