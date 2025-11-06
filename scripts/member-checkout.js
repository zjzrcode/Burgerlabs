// scripts/member-checkout.js
// Gestión de miembros durante el proceso de pedido

class MemberCheckout {
    constructor() {
        this.currentMember = null;
        this.cart = [];
        this.init();
    }

    init() {
        console.log('🔍 Inicializando sistema de miembros...');
        this.loadCurrentMember();
        this.setupMemberDetection();
    }

    // Cargar miembro actual desde localStorage
    loadCurrentMember() {
        const savedMember = localStorage.getItem('currentLabMember');
        if (savedMember) {
            this.currentMember = JSON.parse(savedMember);
            console.log('✅ Miembro cargado:', this.currentMember.name);
        }
    }

    // Configurar detección de miembros en el formulario de contacto
    setupMemberDetection() {
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                this.detectMemberFromForm(e);
            });
        }

        // También detectar en cambios de los campos
        const emailInput = document.querySelector('input[name="email"]');
        const phoneInput = document.querySelector('input[name="telefono"]');
        
        if (emailInput) {
            emailInput.addEventListener('blur', () => this.detectMember());
        }
        if (phoneInput) {
            phoneInput.addEventListener('blur', () => this.detectMember());
        }
    }

    // Detectar miembro basado en email o teléfono
    detectMember() {
        const email = document.querySelector('input[name="email"]')?.value;
        const phone = document.querySelector('input[name="telefono"]')?.value;
        
        if (email || phone) {
            const identifier = email || phone;
            const member = membersDB.findMember(identifier);
            
            if (member) {
                this.setCurrentMember(member);
                this.showMemberWelcome(member);
            } else {
                this.clearCurrentMember();
            }
        }
    }

    // Detectar miembro desde el formulario
    detectMemberFromForm(e) {
        const formData = new FormData(e.target);
        const email = formData.get('email');
        const phone = formData.get('telefono');
        
        if (email || phone) {
            const identifier = email || phone;
            const member = membersDB.findMember(identifier);
            
            if (member) {
                this.setCurrentMember(member);
                this.showMemberNotification(member);
            }
        }
    }

    // Establecer miembro actual
    setCurrentMember(member) {
        this.currentMember = member;
        localStorage.setItem('currentLabMember', JSON.stringify(member));
        this.updateUIForMember(member);
    }

    // Limpiar miembro actual
    clearCurrentMember() {
        this.currentMember = null;
        localStorage.removeItem('currentLabMember');
        this.updateUIForNonMember();
    }

    // Actualizar UI para mostrar información del miembro
    updateUIForMember(member) {
        // Actualizar el modal del carrito
        this.updateCartModalForMember(member);
        
        // Mostrar badge de miembro si existe
        this.showMemberBadge(member);
    }

    // Actualizar UI para no miembros
    updateUIForNonMember() {
        const memberElements = document.querySelectorAll('.member-only');
        memberElements.forEach(el => el.style.display = 'none');
    }

    // Actualizar modal del carrito para miembros
    updateCartModalForMember(member) {
        const cartFooter = document.querySelector('.cart-footer');
        if (!cartFooter) return;

        // Remover sección de miembro anterior si existe
        const existingMemberSection = document.querySelector('.member-benefits-section');
        if (existingMemberSection) {
            existingMemberSection.remove();
        }

        // Crear sección de beneficios del miembro
        const memberSection = document.createElement('div');
        memberSection.className = 'member-benefits-section';
        memberSection.innerHTML = `
            <div class="member-info-card">
                <div class="member-header">
                    <i class="fas fa-crown"></i>
                    <h4>THE LAB SOCIETY</h4>
                </div>
                <div class="member-details">
                    <p><strong>${member.name}</strong> - Nivel ${member.level}</p>
                    <p>Puntos: <span class="member-points">${member.points}</span></p>
                    <div class="points-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${this.calculateLevelProgress(member)}%"></div>
                        </div>
                        <span class="progress-text">${this.getNextLevelText(member)}</span>
                    </div>
                </div>
                <div class="available-benefits">
                    <h5>Beneficios Disponibles:</h5>
                    <div class="benefits-list">
                        ${this.generateBenefitsList(member)}
                    </div>
                </div>
            </div>
        `;

        cartFooter.parentNode.insertBefore(memberSection, cartFooter);
    }

    // Calcular progreso hacia siguiente nivel
    calculateLevelProgress(member) {
        const currentLevel = membersDB.getLevelInfo(member.level);
        const nextLevel = membersDB.getLevelInfo(member.level + 1);
        
        if (!nextLevel) return 100;
        
        const pointsInLevel = member.points - currentLevel.requiredPoints;
        const pointsNeeded = nextLevel.requiredPoints - currentLevel.requiredPoints;
        
        return Math.min((pointsInLevel / pointsNeeded) * 100, 100);
    }

    // Obtener texto del siguiente nivel
    getNextLevelText(member) {
        const nextLevel = membersDB.getLevelInfo(member.level + 1);
        if (!nextLevel) return 'Nivel máximo alcanzado';
        
        return `Faltan ${nextLevel.requiredPoints - member.points} pts para ${nextLevel.name}`;
    }

    // Generar lista de beneficios
    generateBenefitsList(member) {
        const availableBenefits = membersDB.getAvailableBenefits(member.id);
        const benefitTexts = {
            'gaseosa-gratis': 'Gaseosa gratis en tu primera compra',
            'papas-gratis': 'Papas fritas gratis',
            'descuento-10': '10% de descuento',
            'combo-gratis': 'Combo gratis',
            'menu-secreto': 'Acceso al menú secreto',
            'merchandising': 'Merchandising oficial',
            'burger-personalizada': 'Burger personalizada'
        };

        if (availableBenefits.length === 0) {
            return '<p class="no-benefits">No hay beneficios disponibles</p>';
        }

        return availableBenefits.map(benefit => 
            `<div class="benefit-item">
                <i class="fas fa-gift"></i>
                <span>${benefitTexts[benefit] || benefit}</span>
            </div>`
        ).join('');
    }

    // Mostrar badge de miembro
    showMemberBadge(member) {
        // Crear o actualizar badge en el header
        let memberBadge = document.querySelector('.member-badge');
        
        if (!memberBadge) {
            memberBadge = document.createElement('div');
            memberBadge.className = 'member-badge';
            document.querySelector('.header .container').appendChild(memberBadge);
        }

        memberBadge.innerHTML = `
            <div class="badge-content">
                <i class="fas fa-flask"></i>
                <span>${member.name.split(' ')[0]} - Nivel ${member.level}</span>
            </div>
        `;
    }

    // Mostrar notificación de bienvenida
    showMemberWelcome(member) {
        this.showNotification(`¡Bienvenido de nuevo, ${member.name}!`, 'success');
    }

    // Mostrar notificación
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `member-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        // Animación de entrada
        setTimeout(() => notification.classList.add('show'), 100);

        // Remover después de 5 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    // Procesar pedido con información del miembro
processMemberOrder(cart, total) {
    if (!this.currentMember) {
        return this.generateNonMemberMessage(cart, total);
    }

    // Actualizar puntos en la base de datos
    const updateResult = membersDB.updateMemberPurchase(this.currentMember.id, total, cart);
    
    // Aplicar beneficio de gaseosa gratis en primera compra
    if (this.isFirstPurchase()) {
        membersDB.useBenefit(this.currentMember.id, 'gaseosa-gratis');
    }
    
    // Generar mensaje para WhatsApp
    return this.generateMemberMessage(cart, total, updateResult);
}

    // Generar mensaje para no miembros
    generateNonMemberMessage(cart, total) {
        let message = "¡Hola BurgerLabs! Me gustaría hacer el siguiente pedido:\n\n";
        
        cart.forEach(item => {
            message += `• ${item.quantity}x ${item.name} - $${item.price * item.quantity}\n`;
        });

        message += `\n*Total: $${total}*\n\n`;
        message += `¡Gracias!`;
        
        return message;
    }

// Generar mensaje para miembros - FUNCIÓN CORREGIDA
generateMemberMessage(cart, total, updateResult) {
    const member = this.currentMember;
    const levelInfo = membersDB.getLevelInfo(member.level);
    
    let message = `¡Hola BurgerLabs! Soy ${member.name} (${member.id}) de The Lab Society.\n\n`;
    message += "Me gustaría hacer el siguiente pedido:\n\n";
    
    cart.forEach(item => {
        message += `• ${item.quantity}x ${item.name} - $${item.price * item.quantity}\n`;
    });

    message += `\n*Total: $${total}*\n\n`;
    
    // Información del miembro
    message += `--- THE LAB SOCIETY ---\n`;
    message += `👤 Socio: ${member.name}\n`;
    message += `🎯 Nivel: ${levelInfo.name} (${member.level})\n`;
    message += `⭐ Puntos ganados en esta compra: ${updateResult.pointsEarned}\n`;
    message += `📊 Puntos totales: ${updateResult.newPoints}\n`;
    message += `🛒 Compras realizadas: ${member.purchases + 1}\n`;
    
    // Beneficios de primera compra
    if (member.purchases === 0) {
        message += `\n🎁 *PRIMERA COMPRA*: Gaseosa gratis incluida\n`;
    }

    // Próximo nivel
    const nextLevel = membersDB.getLevelInfo(member.level + 1);
    if (nextLevel) {
        const pointsNeeded = nextLevel.requiredPoints - updateResult.newPoints;
        if (pointsNeeded > 0) {
            message += `🎯 Te faltan ${pointsNeeded} puntos para ${nextLevel.name}\n`;
        }
    }

    message += `\n¡Gracias!`;
    
    return message;
}

    // Obtener texto del beneficio
    getBenefitText(benefit) {
        const texts = {
            'gaseosa-gratis': 'Gaseosa gratis',
            'papas-gratis': 'Papas fritas gratis',
            'descuento-10': '10% de descuento',
            'combo-gratis': 'Combo gratis',
            'menu-secreto': 'Acceso al menú secreto',
            'merchandising': 'Merchandising oficial',
            'burger-personalizada': 'Burger personalizada'
        };
        return texts[benefit] || benefit;
    }

    // Verificar si es primera compra para beneficio de gaseosa gratis
    isFirstPurchase() {
        return this.currentMember && this.currentMember.purchases === 0;
    }

    // Aplicar beneficio automático (gaseosa gratis en primera compra)
// Aplicar beneficio automático (gaseosa gratis en primera compra) - FUNCIÓN CORREGIDA
applyAutomaticBenefits() {
    if (this.isFirstPurchase()) {
        const benefitApplied = membersDB.useBenefit(this.currentMember.id, 'gaseosa-gratis');
        if (benefitApplied) {
            this.showNotification('🎉 ¡Gaseosa gratis agregada por tu primera compra como socio!', 'success');
            return true;
        }
    }
    return false;
}
}

// Instancia global del sistema de checkout
const memberCheckout = new MemberCheckout();