// scripts/script.js

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Script cargado correctamente');
    
    // Elementos del DOM
    const mobileMenu = document.getElementById('mobile-menu');
    const navbar = document.querySelector('.navbar');
    const cartFloating = document.getElementById('cartFloating');
    const cartModal = document.getElementById('cartModal');
    const closeCart = document.getElementById('closeCart');
    const cartItems = document.getElementById('cartItems');
    const cartCount = document.querySelector('.cart-count');
    const cartTotal = document.getElementById('cartTotal');
    const whatsappOrder = document.getElementById('whatsappOrder');
    const addToCartButtons = document.querySelectorAll('.btn-add-cart');
    const contactForm = document.getElementById('contactForm');
    
    // Carrito de compras
    let cart = [];
    
    // ===== NAVEGACIÓN CORREGIDA =====
    function initNavigation() {
        console.log('🔧 Inicializando navegación...');
        
        // Seleccionar TODOS los enlaces de navegación
        const navLinks = document.querySelectorAll('.navbar a[href^="#"], .footer a[href^="#"]');
        console.log(`🔗 Encontrados ${navLinks.length} enlaces de navegación`);
        
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    const targetId = href.substring(1);
                    const targetElement = document.getElementById(targetId);
                    
                    if (targetElement) {
                        console.log(`🎯 Navegando a: ${href}`);
                        
                        // Cerrar menú móvil si está abierto
                        if (window.innerWidth <= 768 && navbar && mobileMenu) {
                            navbar.classList.remove('active');
                            mobileMenu.classList.remove('active');
                            document.body.style.overflow = 'auto'; // Asegurar que el scroll esté habilitado
                        }
                        
                        // Calcular posición con offset del header
                        const header = document.querySelector('.header');
                        const headerHeight = header ? header.offsetHeight : 0;
                        const targetPosition = targetElement.offsetTop - headerHeight - 20;
                        
                        // Scroll suave
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                    } else {
                        console.warn(`⚠️ Elemento no encontrado: ${targetId}`);
                    }
                }
            });
        });
        
        console.log('✅ Navegación inicializada correctamente');
    }
    
    // ===== MENÚ MÓVIL CORREGIDO =====
    function initMobileMenu() {
        if (mobileMenu && navbar) {
            mobileMenu.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevenir que el evento se propague
                navbar.classList.toggle('active');
                this.classList.toggle('active');
                
                // Prevenir/permiter scroll del body cuando el menú está abierto
                if (navbar.classList.contains('active')) {
                    document.body.style.overflow = 'hidden';
                } else {
                    document.body.style.overflow = 'auto';
                }
            });
            
            // Cerrar menú al hacer clic en un enlace (ya manejado en initNavigation)
            // Cerrar menú al hacer clic fuera de él
            document.addEventListener('click', function(e) {
                if (navbar.classList.contains('active') && 
                    !navbar.contains(e.target) && 
                    !mobileMenu.contains(e.target)) {
                    navbar.classList.remove('active');
                    mobileMenu.classList.remove('active');
                    document.body.style.overflow = 'auto';
                }
            });
            
            // Cerrar menú al redimensionar la ventana si se hace más grande
            window.addEventListener('resize', function() {
                if (window.innerWidth > 768 && navbar.classList.contains('active')) {
                    navbar.classList.remove('active');
                    mobileMenu.classList.remove('active');
                    document.body.style.overflow = 'auto';
                }
            });
        }
    }
    
    // ===== FUNCIONALIDAD PARA EL VIDEO =====
    function initVideoSection() {
        console.log('📱 Inicializando sección de video...');
        
        const phoneScreen = document.querySelector('.phone-screen');
        const video = document.querySelector('.phone-video');
        const playBtn = document.querySelector('.play-btn');
        const videoOverlay = document.querySelector('.video-overlay');
        
        if (video && playBtn && phoneScreen) {
            console.log('✅ Elementos del video encontrados');
            
            // Remover controles nativos para usar los personalizados
            video.removeAttribute('controls');
            
            // Controlar reproducción del video
            playBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                console.log('🎬 Intentando reproducir video...');
                
                if (video.paused) {
                    video.play().then(() => {
                        console.log('✅ Video reproducido exitosamente');
                        phoneScreen.classList.add('playing');
                        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
                    }).catch(error => {
                        console.error('❌ Error al reproducir:', error);
                        // Si falla, mostrar controles nativos
                        video.setAttribute('controls', 'true');
                    });
                } else {
                    video.pause();
                    phoneScreen.classList.remove('playing');
                    playBtn.innerHTML = '<i class="fas fa-play"></i>';
                }
            });
            
            // También permitir click en el overlay
            if (videoOverlay) {
                videoOverlay.addEventListener('click', function(e) {
                    if (e.target === videoOverlay) {
                        playBtn.click();
                    }
                });
            }
            
            // Actualizar cuando el video termina
            video.addEventListener('ended', function() {
                console.log('⏹️ Video terminado');
                phoneScreen.classList.remove('playing');
                playBtn.innerHTML = '<i class="fas fa-play"></i>';
                video.currentTime = 0; // Reiniciar al inicio
            });
            
            // Actualizar cuando el video se pausa
            video.addEventListener('pause', function() {
                console.log('⏸️ Video pausado');
                phoneScreen.classList.remove('playing');
                playBtn.innerHTML = '<i class="fas fa-play"></i>';
            });
            
            // Manejar errores de carga
            video.addEventListener('error', function(e) {
                console.error('🚨 Error de video:', e);
                const errorMsg = document.createElement('div');
                errorMsg.style.cssText = `
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    color: white;
                    text-align: center;
                    background: rgba(255,0,0,0.7);
                    padding: 10px;
                    border-radius: 5px;
                    z-index: 10;
                `;
                errorMsg.innerHTML = '❌ Error cargando el video';
                phoneScreen.appendChild(errorMsg);
            });
            
            // Mostrar controles nativos en móviles para mejor compatibilidad
            if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                console.log('📱 Dispositivo móvil detectado, usando controles nativos');
                video.setAttribute('controls', 'true');
                if (videoOverlay) {
                    videoOverlay.style.display = 'none';
                }
            }
            
        } else {
            console.warn('⚠️ No se encontraron todos los elementos del video:', {
                video: !!video,
                playBtn: !!playBtn,
                phoneScreen: !!phoneScreen
            });
        }
        
        // Efecto de aparición al hacer scroll para la sección de video
        const observerOptions = {
            threshold: 0.2,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);
        
        // Observar elementos de la sección de video
        const sectionElements = document.querySelectorAll('.phone-mockup, .info-card');
        sectionElements.forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(element);
        });
    }
    
    // ===== CARRITO DE COMPRAS =====
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const item = this.getAttribute('data-item');
            const price = parseInt(this.getAttribute('data-price'));
            
            if (item && price) {
                addToCart(item, price);
                showAddedToCartFeedback(this);
            }
        });
    });
    
    function addToCart(item, price) {
        const existingItem = cart.find(cartItem => cartItem.name === item);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                name: item,
                price: price,
                quantity: 1
            });
        }
        
        updateCart();
        showToast(`${item} agregado al carrito!`);
    }
    
    function showAddedToCartFeedback(button) {
        const originalHTML = button.innerHTML;
        const originalBg = button.style.backgroundColor;
        
        button.innerHTML = '<i class="fas fa-check"></i>';
        button.style.backgroundColor = '#4CAF50';
        button.disabled = true;
        
        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.style.backgroundColor = originalBg;
            button.disabled = false;
        }, 1000);
    }
    
    function showToast(message) {
        const existingToast = document.querySelector('.toast-notification');
        if (existingToast) {
            existingToast.remove();
        }
        
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-check-circle"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }, 3000);
    }
    
    function updateCart() {
        // Actualizar contador
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        if (cartCount) {
            cartCount.textContent = totalItems;
            
            if (totalItems > 0) {
                cartCount.classList.add('pulse');
                setTimeout(() => {
                    cartCount.classList.remove('pulse');
                }, 300);
            }
        }
        
        // Actualizar items en el modal
        if (cartItems) {
            cartItems.innerHTML = '';
            
            if (cart.length === 0) {
                cartItems.innerHTML = '<p class="empty-cart">Tu carrito está vacío</p>';
                if (cartTotal) cartTotal.textContent = '$0';
                return;
            }
            
            let totalPrice = 0;
            
            cart.forEach((item, index) => {
                const itemTotal = item.price * item.quantity;
                totalPrice += itemTotal;
                
                const cartItemElement = document.createElement('div');
                cartItemElement.className = 'cart-item';
                cartItemElement.innerHTML = `
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p>$${item.price} c/u</p>
                    </div>
                    <div class="cart-item-controls">
                        <div class="cart-item-quantity">
                            <button class="quantity-btn decrease" data-index="${index}">-</button>
                            <span>${item.quantity}</span>
                            <button class="quantity-btn increase" data-index="${index}">+</button>
                        </div>
                        <span class="item-total">$${itemTotal}</span>
                        <button class="remove-item" data-index="${index}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
                
                cartItems.appendChild(cartItemElement);
            });
            
            if (cartTotal) cartTotal.textContent = `$${totalPrice}`;
            
            // Añadir event listeners
            document.querySelectorAll('.decrease').forEach(button => {
                button.addEventListener('click', function() {
                    const index = parseInt(this.getAttribute('data-index'));
                    decreaseQuantity(index);
                });
            });
            
            document.querySelectorAll('.increase').forEach(button => {
                button.addEventListener('click', function() {
                    const index = parseInt(this.getAttribute('data-index'));
                    increaseQuantity(index);
                });
            });
            
            document.querySelectorAll('.remove-item').forEach(button => {
                button.addEventListener('click', function() {
                    const index = parseInt(this.getAttribute('data-index'));
                    removeFromCart(index);
                });
            });
            
            updateWhatsAppLink();
        }
    }
    
    function decreaseQuantity(index) {
        if (cart[index].quantity > 1) {
            cart[index].quantity -= 1;
        } else {
            cart.splice(index, 1);
        }
        updateCart();
    }
    
    function increaseQuantity(index) {
        cart[index].quantity += 1;
        updateCart();
    }
    
    function removeFromCart(index) {
        const itemName = cart[index].name;
        cart.splice(index, 1);
        updateCart();
        showToast(`${itemName} eliminado del carrito`);
    }
    
    function updateWhatsAppLink() {
        if (!whatsappOrder) return;
        
        if (cart.length === 0) {
            whatsappOrder.href = "https://wa.me/5492657560516";
            return;
        }
        
        let message = "¡Hola BurgerLabs! Me gustaría hacer el siguiente pedido:\n\n";
        
        cart.forEach(item => {
            message += `• ${item.quantity}x ${item.name} - $${item.price * item.quantity}\n`;
        });
        
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        message += `\n*Total: $${total}*\n\n`;
        message += `¡Gracias!`;
        
        const encodedMessage = encodeURIComponent(message);
        whatsappOrder.href = `https://wa.me/5492657560516?text=${encodedMessage}`;
    }
    
    // ===== MODAL DEL CARRITO =====
    if (cartFloating) {
        cartFloating.addEventListener('click', openCartModal);
    }
    
    if (closeCart) {
        closeCart.addEventListener('click', closeCartModal);
    }
    
    function openCartModal() {
        if (cartModal) {
            cartModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    
    function closeCartModal() {
        if (cartModal) {
            cartModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }
    
    if (cartModal) {
        cartModal.addEventListener('click', function(e) {
            if (e.target === cartModal) {
                closeCartModal();
            }
        });
    }
    
    // ===== FORMULARIO DE CONTACTO =====
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const nombre = this.nombre.value.trim();
            const email = this.email.value.trim();
            const mensaje = this.mensaje.value.trim();
            
            if (!nombre || !email || !mensaje) {
                showFormMessage('Por favor, completa todos los campos', 'error');
                return;
            }
            
            if (!isValidEmail(email)) {
                showFormMessage('Por favor, ingresa un email válido', 'error');
                return;
            }
            
            showFormMessage('¡Mensaje enviado! Te contactaremos pronto.', 'success');
            
            setTimeout(() => {
                this.reset();
            }, 2000);
        });
    }
    
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    function showFormMessage(message, type) {
        const existingMessage = document.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        const messageElement = document.createElement('div');
        messageElement.className = `form-message ${type}`;
        messageElement.textContent = message;
        
        contactForm.appendChild(messageElement);
        
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.remove();
            }
        }, 5000);
    }
    
    // ===== HEADER DINÁMICO =====
    function initHeaderScroll() {
        const header = document.querySelector('.header');
        if (!header) return;
        
        window.addEventListener('scroll', function() {
            if (window.scrollY > 100) {
                header.style.backgroundColor = 'rgba(0, 0, 0, 0.95)';
                header.style.backdropFilter = 'blur(10px)';
            } else {
                header.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
                header.style.backdropFilter = 'blur(5px)';
            }
        });
    }
    
    // ===== ANIMACIONES AL SCROLL =====
    function initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);
        
        const elementsToObserve = document.querySelectorAll('.menu-item, .feature, .contact-item');
        elementsToObserve.forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(element);
        });
    }
    
    // ===== INICIALIZACIÓN COMPLETA =====
    function init() {
        console.log('🚀 Inicializando aplicación...');
        updateCart();
        initNavigation();
        initMobileMenu(); // ¡Importante! Inicializar el menú móvil
        initHeaderScroll();
        initScrollAnimations();
        
        // Inicializar la sección de video con un pequeño delay
        setTimeout(initVideoSection, 500);
        
        console.log('✅ Aplicación inicializada correctamente');
    }
    
    // Inicializar cuando el DOM esté listo
    init();
    
    // Debug: Verificar que todos los elementos existen
    console.log('🔍 Elementos encontrados:', {
        mobileMenu: !!mobileMenu,
        navbar: !!navbar,
        cartFloating: !!cartFloating,
        cartModal: !!cartModal,
        contactForm: !!contactForm,
        addToCartButtons: addToCartButtons.length
    });
});