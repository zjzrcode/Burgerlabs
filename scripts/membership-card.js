// scripts/membership-card.js
// Sistema de tarjeta de membresía personalizable

class MembershipCard {
    constructor() {
        this.currentMember = null;
        this.init();
    }

    init() {
        console.log('🎴 Inicializando sistema de tarjeta de membresía...');
        this.loadCurrentMember();
        this.setupCardCustomization();
    }

    loadCurrentMember() {
        this.currentMember = membersDB.getCurrentMember();
        if (this.currentMember) {
            this.renderMembershipCard();
            this.showCustomizationSection();
        }
    }

    // Renderizar tarjeta de membresía
    renderMembershipCard() {
        const cardContainer = document.querySelector('.membership-card');
        if (!cardContainer) return;

        const stats = membersDB.getMemberStats(this.currentMember.id);
        const levelInfo = membersDB.getLevelInfo(this.currentMember.level);
        const template = membersDB.getCardTemplates()[this.currentMember.cardTemplate];
        
        // Aplicar plantilla
        cardContainer.style.background = template.background;
        cardContainer.style.color = template.textColor;
        cardContainer.style.borderColor = template.accentColor;

        // Generar contenido de la tarjeta
        cardContainer.innerHTML = this.generateCardHTML(stats, levelInfo, template);
        
        // Aplicar personalizaciones
        this.applyCustomizations();
    }

    // Generar HTML de la tarjeta
    generateCardHTML(stats, levelInfo, template) {
        const customization = this.currentMember.cardCustomization;
        
        return `
            <div class="card-header">
                <div class="card-branding">
                    <div class="card-logo">
                        <i class="fas fa-flask" style="color: ${template.accentColor}"></i>
                    </div>
                    <div class="card-titles">
                        <h4 style="color: ${template.accentColor}">THE LAB SOCIETY</h4>
                        <p>Miembro Oficial</p>
                    </div>
                </div>
                ${customization.showLevel ? `
                <div class="level-badge" style="background: ${levelInfo.color}">
                    Nivel ${this.currentMember.level}
                </div>
                ` : ''}
            </div>

            <div class="card-body">
                ${customization.showAvatar ? `
                <div class="member-identity">
                    <div class="member-avatar" style="background: ${template.accentColor}">
                        ${this.getInitials(this.currentMember.name)}
                    </div>
                    <div class="member-info">
                        <div class="member-name">${this.currentMember.name}</div>
                        <div class="member-id">${this.currentMember.id}</div>
                    </div>
                </div>
                ` : ''}

                <div class="member-details">
                    ${customization.showLevel ? `
                    <div class="detail-item">
                        <i class="fas fa-trophy" style="color: ${template.accentColor}"></i>
                        <span>${levelInfo.name}</span>
                    </div>
                    ` : ''}

                    ${customization.showPoints ? `
                    <div class="detail-item">
                        <i class="fas fa-star" style="color: ${template.accentColor}"></i>
                        <span>${this.currentMember.points} puntos</span>
                    </div>
                    ` : ''}

                    <div class="detail-item">
                        <i class="fas fa-calendar" style="color: ${template.accentColor}"></i>
                        <span>Miembro desde ${new Date(this.currentMember.joinDate).getFullYear()}</span>
                    </div>

                    <div class="detail-item">
                        <i class="fas fa-hamburger" style="color: ${template.accentColor}"></i>
                        <span>${this.currentMember.purchases} compras</span>
                    </div>
                </div>

                ${customization.showPoints ? `
                <div class="points-progress">
                    <div class="progress-info">
                        <span>Progreso al siguiente nivel</span>
                        <span>${stats.progressPercentage.toFixed(1)}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${stats.progressPercentage}%; background: ${template.accentColor}"></div>
                    </div>
                    ${stats.nextLevel ? `
                    <div class="next-level">
                        ${stats.pointsToNextLevel} puntos para ${stats.nextLevel.name}
                    </div>
                    ` : '<div class="next-level">¡Nivel máximo alcanzado!</div>'}
                </div>
                ` : ''}
            </div>

            <div class="card-footer">
                ${customization.showQR ? `
                <div class="qr-section">
                    <div class="qr-code">
                        <div class="qr-placeholder">
                            <i class="fas fa-qrcode" style="color: ${template.accentColor}"></i>
                        </div>
                    </div>
                    <div class="qr-text">Escaneá para verificar</div>
                </div>
                ` : ''}

                <div class="member-stats">
                    <div class="stat-item">
                        <div class="stat-number">$${this.currentMember.totalSpent.toLocaleString()}</div>
                        <div class="stat-label">Total gastado</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">${this.currentMember.totalItems}</div>
                        <div class="stat-label">Items comprados</div>
                    </div>
                </div>
            </div>

            <div class="card-glow" style="background: radial-gradient(circle at center, ${template.accentColor}20, transparent 70%)"></div>
        `;
    }

    // Aplicar personalizaciones
    applyCustomizations() {
        const customization = this.currentMember.cardCustomization;
        const card = document.querySelector('.membership-card');
        
        // Aplicar color de acento personalizado
        if (customization.accentColor) {
            const accentElements = card.querySelectorAll('[style*="accentColor"]');
            accentElements.forEach(el => {
                el.style.color = customization.accentColor;
            });
        }
    }

    // Obtener iniciales del nombre
    getInitials(name) {
        return name.split(' ').map(part => part[0]).join('').toUpperCase().substring(0, 2);
    }

    // Configurar sección de personalización
    setupCardCustomization() {
        const customizationSection = document.getElementById('card-customization');
        if (!customizationSection) return;

        // Cargar plantillas disponibles
        this.loadCardTemplates();
        
        // Configurar controles de personalización
        this.setupCustomizationControls();
    }

    // Cargar plantillas de tarjeta
    loadCardTemplates() {
        const templates = membersDB.getCardTemplates();
        const templateContainer = document.getElementById('template-options');
        
        if (!templateContainer) return;

        templateContainer.innerHTML = Object.entries(templates).map(([key, template]) => `
            <div class="template-option" data-template="${key}">
                <div class="template-preview" style="${template.background}; color: ${template.textColor}">
                    <div class="template-accent" style="background: ${template.accentColor}"></div>
                    <div class="template-name">${template.name}</div>
                </div>
            </div>
        `).join('');

        // Event listeners para plantillas
        templateContainer.querySelectorAll('.template-option').forEach(option => {
            option.addEventListener('click', () => {
                const template = option.dataset.template;
                this.changeCardTemplate(template);
            });
        });
    }

    // Configurar controles de personalización
    setupCustomizationControls() {
        // Toggle switches
        const toggles = {
            'toggle-avatar': 'showAvatar',
            'toggle-qr': 'showQR',
            'toggle-level': 'showLevel',
            'toggle-points': 'showPoints'
        };

        Object.entries(toggles).forEach(([toggleId, setting]) => {
            const toggle = document.getElementById(toggleId);
            if (toggle && this.currentMember) {
                toggle.checked = this.currentMember.cardCustomization[setting];
                toggle.addEventListener('change', (e) => {
                    this.updateCustomization({ [setting]: e.target.checked });
                });
            }
        });

        // Selector de color de acento
        const colorPicker = document.getElementById('accent-color');
        if (colorPicker && this.currentMember) {
            colorPicker.value = this.currentMember.cardCustomization.accentColor;
            colorPicker.addEventListener('change', (e) => {
                this.updateCustomization({ accentColor: e.target.value });
            });
        }

        // Botón de reset
        const resetBtn = document.getElementById('reset-customization');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetCustomization();
            });
        }
    }

    // Cambiar plantilla de tarjeta
    changeCardTemplate(template) {
        if (!this.currentMember) return;

        const success = membersDB.changeCardTemplate(this.currentMember.id, template);
        if (success) {
            this.currentMember = membersDB.getCurrentMember();
            this.renderMembershipCard();
            this.showNotification('Plantilla cambiada exitosamente', 'success');
        }
    }

    // Actualizar personalización
    updateCustomization(updates) {
        if (!this.currentMember) return;

        const success = membersDB.updateCardCustomization(this.currentMember.id, updates);
        if (success) {
            this.currentMember = membersDB.getCurrentMember();
            this.renderMembershipCard();
        }
    }

    // Resetear personalización
    resetCustomization() {
        if (!this.currentMember) return;

        const defaultCustomization = {
            showAvatar: true,
            showQR: true,
            showLevel: true,
            showPoints: true,
            accentColor: '#FFD700'
        };

        const success = membersDB.updateCardCustomization(this.currentMember.id, defaultCustomization);
        if (success) {
            this.currentMember = membersDB.getCurrentMember();
            this.renderMembershipCard();
            this.setupCustomizationControls();
            this.showNotification('Personalización resetada', 'success');
        }
    }

    // Mostrar sección de personalización
    showCustomizationSection() {
        const section = document.getElementById('card-customization');
        if (section) {
            section.style.display = 'block';
        }
    }

    // Mostrar notificación
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `card-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Instancia global
const membershipCard = new MembershipCard();