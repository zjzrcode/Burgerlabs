// scripts/tarjeta-generator.js
// Sistema de generación de tarjetas para el panel admin

class TarjetaGenerator {
    constructor() {
        this.currentMember = null;
        this.members = [];
        this.init();
    }

    init() {
        console.log('🔄 Inicializando generador de tarjetas...');
        
        // Verificar autenticación primero
        if (!adminAuth.checkAuth()) return;
        
        this.loadMembers();
        this.setupEventListeners();
        this.renderMembersList();
        this.generateSampleCard();
    }

    loadMembers() {
        const membersDB = localStorage.getItem('burgerLabsMembers');
        if (membersDB) {
            const db = JSON.parse(membersDB);
            this.members = db.members || [];
            console.log(`✅ ${this.members.length} miembros cargados`);
        } else {
            console.log('ℹ️ No se encontraron miembros, iniciando con lista vacía');
            this.members = [];
        }
    }

    setupEventListeners() {
        // Búsqueda
        document.getElementById('searchBtn').addEventListener('click', () => this.searchMember());
        document.getElementById('searchMember').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchMember();
        });

        // Formulario manual
        document.getElementById('manualForm').addEventListener('submit', (e) => this.createManualCard(e));

        // Controles de tarjeta
        document.getElementById('cardTemplate').addEventListener('change', () => this.updateCardPreview());
        document.getElementById('accentColor').addEventListener('change', () => this.updateCardPreview());

        // Botones de acción
        document.getElementById('downloadBtn').addEventListener('click', () => this.downloadCard());
        document.getElementById('emailBtn').addEventListener('click', () => this.openEmailModal());
        document.getElementById('saveTemplateBtn').addEventListener('click', () => this.saveTemplate());

        // Actualización masiva
        document.getElementById('updateAllBtn').addEventListener('click', () => this.updateAllCards());
        document.getElementById('exportAllBtn').addEventListener('click', () => this.exportAllCards());

        // Modal de email
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => this.closeEmailModal());
        });
        document.getElementById('emailForm').addEventListener('submit', (e) => this.sendEmail(e));

        // Cerrar modal al hacer clic fuera
        document.getElementById('emailModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.closeEmailModal();
        });
    }

    searchMember() {
        const searchTerm = document.getElementById('searchMember').value.trim();
        if (!searchTerm) {
            this.showNotification('Ingresa un término de búsqueda', 'error');
            return;
        }

        const member = this.members.find(m => 
            m.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.phone.includes(searchTerm)
        );

        if (member) {
            this.currentMember = member;
            this.generateCard(member);
            this.showNotification(`Miembro encontrado: ${member.name}`, 'success');
        } else {
            this.showNotification('No se encontró ningún miembro', 'error');
        }
    }

    createManualCard(e) {
        e.preventDefault();
        
        const memberData = {
            id: document.getElementById('memberId').value,
            name: document.getElementById('memberName').value,
            level: parseInt(document.getElementById('memberLevel').value),
            points: parseInt(document.getElementById('memberPoints').value),
            purchases: parseInt(document.getElementById('memberPurchases').value),
            totalSpent: parseInt(document.getElementById('memberTotalSpent').value),
            joinDate: new Date().toISOString().split('T')[0],
            email: 'manual@example.com',
            phone: '000-0000'
        };

        this.currentMember = memberData;
        this.generateCard(memberData);
        this.showNotification('Tarjeta creada manualmente', 'success');
        
        // Actualizar la lista de miembros
        this.loadMembers();
        this.renderMembersList();
    }

    generateCard(memberData) {
        const template = document.getElementById('cardTemplate').value;
        const accentColor = document.getElementById('accentColor').value;
        
        const cardHTML = this.createCardHTML(memberData, template, accentColor);
        document.getElementById('previewCard').innerHTML = cardHTML;
    }

    createCardHTML(member, template, accentColor) {
        const templates = {
            classic: {
                background: 'linear-gradient(135deg, #2D2D44, #1A1A2E)',
                textColor: '#FFFFFF'
            },
            modern: {
                background: 'linear-gradient(135deg, #1A1A2E, #16213E)',
                textColor: '#FFFFFF'
            },
            premium: {
                background: 'linear-gradient(135deg, #000000, #2D2D44)',
                textColor: '#FFD700'
            },
            neon: {
                background: 'linear-gradient(135deg, #1A1A2E, #9D4EDD)',
                textColor: '#FFFFFF'
            }
        };

        const selectedTemplate = templates[template];
        const levelInfo = this.getLevelInfo(member.level);
        const stats = this.calculateMemberStats(member);

        return `
            <div class="card-glow" style="background: radial-gradient(circle at center, ${accentColor}20, transparent 70%)"></div>
            
            <div class="card-header">
                <div class="card-branding">
                    <div class="card-logo">
                        <i class="fas fa-flask" style="color: ${accentColor}"></i>
                    </div>
                    <div class="card-titles">
                        <h4 style="color: ${accentColor}">THE LAB SOCIETY</h4>
                        <p>Miembro Oficial</p>
                    </div>
                </div>
                <div class="level-badge" style="background: ${levelInfo.color}">
                    Nivel ${member.level}
                </div>
            </div>

            <div class="card-body">
                <div class="member-identity">
                    <div class="member-avatar" style="background: ${accentColor}">
                        ${this.getInitials(member.name)}
                    </div>
                    <div class="member-info">
                        <div class="member-name">${member.name}</div>
                        <div class="member-id">${member.id}</div>
                    </div>
                </div>

                <div class="member-details">
                    <div class="detail-item">
                        <i class="fas fa-trophy" style="color: ${accentColor}"></i>
                        <span>${levelInfo.name}</span>
                    </div>

                    <div class="detail-item">
                        <i class="fas fa-star" style="color: ${accentColor}"></i>
                        <span>${member.points} puntos</span>
                    </div>

                    <div class="detail-item">
                        <i class="fas fa-calendar" style="color: ${accentColor}"></i>
                        <span>Miembro desde ${new Date(member.joinDate).getFullYear()}</span>
                    </div>

                    <div class="detail-item">
                        <i class="fas fa-hamburger" style="color: ${accentColor}"></i>
                        <span>${member.purchases} compras</span>
                    </div>
                </div>

                <div class="points-progress">
                    <div class="progress-info">
                        <span>Progreso al siguiente nivel</span>
                        <span>${stats.progressPercentage.toFixed(1)}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${stats.progressPercentage}%; background: ${accentColor}"></div>
                    </div>
                    ${stats.nextLevel ? `
                    <div class="next-level">
                        ${stats.pointsToNextLevel} puntos para ${stats.nextLevel.name}
                    </div>
                    ` : '<div class="next-level">¡Nivel máximo alcanzado!</div>'}
                </div>
            </div>

            <div class="card-footer">
                <div class="qr-section">
                    <div class="qr-code">
                        <div class="qr-placeholder">
                            <i class="fas fa-qrcode" style="color: ${accentColor}"></i>
                        </div>
                    </div>
                    <div class="qr-text">Escaneá para verificar</div>
                </div>

                <div class="member-stats">
                    <div class="stat-item">
                        <div class="stat-number">$${member.totalSpent.toLocaleString()}</div>
                        <div class="stat-label">Total gastado</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">${member.totalItems || 0}</div>
                        <div class="stat-label">Items comprados</div>
                    </div>
                </div>
            </div>
        `;
    }

    getLevelInfo(level) {
        const levels = {
            1: { name: 'Aprendiz', color: '#FFD700' },
            2: { name: 'Experimento', color: '#9D4EDD' },
            3: { name: 'Científico', color: '#4361EE' },
            4: { name: 'Maestro', color: '#FF4444' }
        };
        return levels[level] || levels[1];
    }

    calculateMemberStats(member) {
        const levelInfo = this.getLevelInfo(member.level);
        const nextLevelInfo = this.getLevelInfo(member.level + 1);
        
        return {
            progressPercentage: nextLevelInfo ? 
                ((member.points - levelInfo.requiredPoints) / (nextLevelInfo.requiredPoints - levelInfo.requiredPoints)) * 100 : 100,
            pointsToNextLevel: nextLevelInfo ? nextLevelInfo.requiredPoints - member.points : 0,
            nextLevel: nextLevelInfo
        };
    }

    getInitials(name) {
        return name.split(' ').map(part => part[0]).join('').toUpperCase().substring(0, 2);
    }

    updateCardPreview() {
        if (this.currentMember) {
            this.generateCard(this.currentMember);
        }
    }

    async downloadCard() {
        if (!this.currentMember) {
            this.showNotification('Primero crea o busca una tarjeta', 'error');
            return;
        }

        try {
            const cardElement = document.getElementById('previewCard');
            
            // Usar html2canvas para convertir a imagen
            const canvas = await html2canvas(cardElement, {
                backgroundColor: null,
                scale: 2,
                useCORS: true
            });
            
            const link = document.createElement('a');
            link.download = `tarjeta-${this.currentMember.id}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            
            this.showNotification('Tarjeta descargada exitosamente', 'success');
        } catch (error) {
            console.error('Error al descargar:', error);
            this.showNotification('Error al descargar la tarjeta', 'error');
        }
    }

    openEmailModal() {
        if (!this.currentMember) {
            this.showNotification('Primero crea o busca una tarjeta', 'error');
            return;
        }
        
        document.getElementById('emailModal').classList.add('show');
    }

    closeEmailModal() {
        document.getElementById('emailModal').classList.remove('show');
    }

    async sendEmail(e) {
        e.preventDefault();
        
        const email = document.getElementById('recipientEmail').value;
        const subject = document.getElementById('emailSubject').value;
        const message = document.getElementById('emailMessage').value;

        try {
            // Generar la imagen de la tarjeta
            const cardElement = document.getElementById('previewCard');
            const canvas = await html2canvas(cardElement, {
                backgroundColor: null,
                scale: 2,
                useCORS: true
            });
            const cardImage = canvas.toDataURL('image/png');

            // Aquí integrarías con tu servicio de email
            // Por ahora simulamos el envío
            this.showNotification(`Tarjeta enviada a ${email}`, 'success');
            this.closeEmailModal();
            
        } catch (error) {
            console.error('Error al enviar email:', error);
            this.showNotification('Error al enviar el email', 'error');
        }
    }

    saveTemplate() {
        if (!this.currentMember) {
            this.showNotification('Primero crea o busca una tarjeta', 'error');
            return;
        }

        const templateData = {
            memberId: this.currentMember.id,
            template: document.getElementById('cardTemplate').value,
            accentColor: document.getElementById('accentColor').value,
            timestamp: new Date().toISOString()
        };

        // Guardar en localStorage
        const savedTemplates = JSON.parse(localStorage.getItem('cardTemplates') || '{}');
        savedTemplates[this.currentMember.id] = templateData;
        localStorage.setItem('cardTemplates', JSON.stringify(savedTemplates));

        this.showNotification('Plantilla guardada exitosamente', 'success');
    }

    updateAllCards() {
        this.showNotification('Actualizando todas las tarjetas...', 'info');
        // Aquí se implementaría la actualización masiva
        setTimeout(() => {
            this.showNotification('Todas las tarjetas han sido actualizadas', 'success');
        }, 2000);
    }

    exportAllCards() {
        this.showNotification('Preparando exportación de todas las tarjetas...', 'info');
        // Aquí se implementaría la exportación masiva
    }

    renderMembersList() {
        const membersGrid = document.getElementById('membersGrid');
        
        if (this.members.length === 0) {
            membersGrid.innerHTML = '<p class="no-members">No hay miembros registrados</p>';
            return;
        }

        membersGrid.innerHTML = this.members.map(member => `
            <div class="member-item" onclick="tarjetaGenerator.selectMember('${member.id}')">
                <div class="member-header">
                    <div class="member-name">${member.name}</div>
                    <div class="member-id">${member.id}</div>
                </div>
                <div class="member-details">
                    <div><i class="fas fa-star"></i> ${member.points} puntos</div>
                    <div><i class="fas fa-trophy"></i> Nivel ${member.level}</div>
                    <div><i class="fas fa-shopping-cart"></i> ${member.purchases} compras</div>
                    <div><i class="fas fa-dollar-sign"></i> $${member.totalSpent.toLocaleString()}</div>
                </div>
            </div>
        `).join('');
    }

    selectMember(memberId) {
        const member = this.members.find(m => m.id === memberId);
        if (member) {
            this.currentMember = member;
            this.generateCard(member);
            document.getElementById('searchMember').value = memberId;
            this.showNotification(`Seleccionado: ${member.name}`, 'success');
        }
    }

    generateSampleCard() {
        // Generar una tarjeta de ejemplo al iniciar
        const sampleMember = {
            id: 'LAB-0001',
            name: 'Ejemplo Miembro',
            level: 2,
            points: 350,
            purchases: 5,
            totalSpent: 35000,
            joinDate: '2024-01-15',
            email: 'ejemplo@email.com',
            phone: '123-4567'
        };
        
        this.currentMember = sampleMember;
        this.generateCard(sampleMember);
    }

    showNotification(message, type = 'info') {
        // Crear notificación temporal
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        // Estilos para la notificación
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#00FF88' : type === 'error' ? '#FF4444' : '#4361EE'};
            color: #333;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            z-index: 1001;
            transform: translateX(400px);
            opacity: 0;
            transition: all 0.3s ease;
            max-width: 300px;
        `;

        document.body.appendChild(notification);

        // Animación de entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
            notification.style.opacity = '1';
        }, 100);

        // Remover después de 5 segundos
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 5000);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.tarjetaGenerator = new TarjetaGenerator();
});