// scripts/admin-auth.js - VERSIÓN SEGURA
class AdminAuth {
    constructor() {
        this.isAuthenticated = false;
        this.init();
    }

    init() {
        console.log('🔐 Inicializando sistema de autenticación seguro...');
        
        // Verificar acceso por token temporal
        const hasValidToken = this.checkTempAccess();
        
        if (!hasValidToken) {
            this.redirectToHome();
            return;
        }

        this.isAuthenticated = true;
        this.showAdminContent();
        this.setupEventListeners();
        
        // El token expira en 24 horas
        setTimeout(() => {
            this.handleLogout();
        }, 24 * 60 * 60 * 1000);
    }

    checkTempAccess() {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const timestamp = urlParams.get('t');
        
        if (!token || !timestamp) {
            return false;
        }

        // Verificar que el token no tenga más de 24 horas
        const currentTime = Date.now();
        const tokenTime = parseInt(timestamp);
        const timeDiff = currentTime - tokenTime;
        
        if (timeDiff > 24 * 60 * 60 * 1000) {
            console.log('🚫 Token expirado');
            return false;
        }

        // Verificar token (sistema simple pero efectivo)
        const expectedToken = this.generateToken(tokenTime);
        return token === expectedToken;
    }

    generateToken(timestamp) {
        // Token basado en fecha + frase secreta
        // CAMBIA ESTA FRASE SECRETA por algo único tuyo
        const secretPhrase = " persona_androide_2010";
        const baseString = timestamp + secretPhrase;
        
        // Hash simple (en producción usaría algo más seguro)
        let hash = 0;
        for (let i = 0; i < baseString.length; i++) {
            const char = baseString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(36);
    }

    setupEventListeners() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }
    }

    handleLogout() {
        this.isAuthenticated = false;
        localStorage.removeItem('adminAuthenticated');
        this.redirectToHome();
    }

    showAdminContent() {
        console.log('✅ Acceso administrativo concedido');
    }

    redirectToHome() {
        console.log('🚫 Redirigiendo al inicio...');
        window.location.href = 'index.html';
    }

    checkAuth() {
        if (!this.isAuthenticated) {
            this.redirectToHome();
            return false;
        }
        return true;
    }
}

// Instancia global
const adminAuth = new AdminAuth();