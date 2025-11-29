// scripts/notifications.js - Sistema unificado de notificaciones
class NotificationSystem {
    constructor() {
        this.container = this.createContainer();
    }

    createContainer() {
        const existingContainer = document.getElementById('notification-container');
        if (existingContainer) return existingContainer;

        const container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 400px;
        `;
        document.body.appendChild(container);
        return container;
    }

    show(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${icons[type] || icons.info}"></i>
                <span>${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        // Estilos base
        notification.style.cssText = `
            background: ${this.getBackgroundColor(type)};
            color: #333;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            transform: translateX(400px);
            opacity: 0;
            transition: all 0.3s ease;
            max-width: 100%;
        `;

        this.container.appendChild(notification);

        // Animación de entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
            notification.style.opacity = '1';
        }, 100);

        // Botón de cerrar
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => this.remove(notification));

        // Auto-remover
        if (duration > 0) {
            setTimeout(() => this.remove(notification), duration);
        }

        return notification;
    }

    remove(notification) {
        notification.style.transform = 'translateX(400px)';
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }

    getBackgroundColor(type) {
        const colors = {
            success: '#00FF88',
            error: '#FF4444',
            warning: '#FFAA00',
            info: '#4361EE'
        };
        return colors[type] || colors.info;
    }
}

// Instancia global
const notifications = new NotificationSystem();