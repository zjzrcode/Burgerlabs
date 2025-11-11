// scripts/admin-auth.js - VERSIÓN CORREGIDA
class AdminAuth {
    constructor() {
        this.isAuthenticated = false;
        this.init();
    }

    init() {
        console.log('🔐 Inicializando sistema de autenticación...');
        
        // Verificar acceso por token
        const hasValidAccess = this.checkAdminAccess();
        
        if (hasValidAccess) {
            this.isAuthenticated = true;
            this.showAdminContent();
            this.setupEventListeners();
            console.log('✅ Acceso administrativo concedido');
        } else {
            console.log('🚫 Acceso denegado, redirigiendo...');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        }
    }

    checkAdminAccess() {
        const urlParams = new URLSearchParams(window.location.search);
        
        // Método 1: Token temporal (más seguro)
        const token = urlParams.get('token');
        const timestamp = urlParams.get('t');
        
        if (token && timestamp) {
            return this.validateToken(token, timestamp);
        }
        
        // Método 2: Acceso directo para desarrollo (QUITAR EN PRODUCCIÓN)
        const directAccess = urlParams.get('admin');
        if (directAccess === 'true') {
            console.warn('⚠️ Acceso directo activado - Solo para desarrollo');
            return true;
        }
        
        return false;
    }

    validateToken(token, timestamp) {
        try {
            const tokenTime = parseInt(timestamp);
            const currentTime = Date.now();
            const timeDiff = currentTime - tokenTime;
            
            // Token válido por 24 horas
            if (timeDiff > 24 * 60 * 60 * 1000) {
                console.log('🚫 Token expirado');
                return false;
            }
            
            // Verificar token (sistema simple)
            const expectedToken = this.generateToken(tokenTime);
            const isValid = token === expectedToken;
            
            if (!isValid) {
                console.log('🚫 Token inválido');
            }
            
            return isValid;
        } catch (error) {
            console.error('Error validando token:', error);
            return false;
        }
    }

    generateToken(timestamp) {
        // CAMBIA ESTA FRASE SECRETA por una personalizada
        const secretPhrase = "persona_androide_2010";
        const baseString = timestamp + secretPhrase;
        
        // Hash simple pero efectivo
        let hash = 0;
        for (let i = 0; i < baseString.length; i++) {
            const char = baseString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(36).substring(0, 8);
    }

    setupEventListeners() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }
    }

    handleLogout() {
        this.isAuthenticated = false;
        // Limpiar URL sin recargar
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
        
        // Mostrar mensaje y redirigir
        this.showNotification('Sesión admin cerrada', 'info');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }

    showAdminContent() {
        console.log('✅ Mostrando panel administrativo');
        // El contenido ya está visible, solo actualizamos estado
        document.body.style.display = 'block'; // Asegurar que sea visible
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `admin-notification admin-notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

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
            max-width: 300px;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '1';
        }, 100);

        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    checkAuth() {
        return this.isAuthenticated;
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Ocultar body hasta verificar autenticación
    document.body.style.display = 'none';
    window.adminAuth = new AdminAuth();
});