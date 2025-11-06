// scripts/lab-society.js

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔬 The Lab Society cargado correctamente');
    
    // Elementos del DOM para The Lab Society
    const labSocietyForm = document.getElementById('labSocietyForm');
    const memberCount = document.getElementById('memberCount');
    const membershipCard = document.querySelector('.membership-card');
    const memberName = document.querySelector('.member-name');
    const memberId = document.querySelector('.member-id');
    const pointsProgress = document.querySelector('.points-progress');
    const pointsText = document.querySelector('.points-text');
    const rewardLevels = document.querySelectorAll('.reward-level');
    
    // ===== INICIALIZACIÓN =====
    function initLabSociety() {
        console.log('🔬 Inicializando The Lab Society...');
        
        // Actualizar contador de miembros (simulado)
        updateMemberCounter();
        
        // Inicializar sistema de puntos
        initPointsSystem();
        
        // Inicializar formulario
        initLabForm();
        
        // Inicializar efectos visuales
        initVisualEffects();
        
        console.log('✅ The Lab Society inicializado correctamente');
    }
    
    // ===== CONTADOR DE MIEMBROS =====
    function updateMemberCounter() {
        if (!memberCount) return;
        
        // Simular contador creciente (en una implementación real, esto vendría de una base de datos)
        let count = 0;
        const targetCount = 495; // Número simulado de miembros
        const duration = 2000; // 2 segundos
        const steps = 50;
        const increment = targetCount / steps;
        const stepTime = duration / steps;
        
        const timer = setInterval(() => {
            count += increment;
            if (count >= targetCount) {
                count = targetCount;
                clearInterval(timer);
            }
            memberCount.textContent = Math.floor(count).toLocaleString();
        }, stepTime);
    }
    
    // ===== SISTEMA DE PUNTOS =====
    function initPointsSystem() {
        // Simular progreso de puntos (en una implementación real, esto vendría del usuario)
        const userPoints = 350; // Puntos simulados del usuario
        const nextLevelPoints = 500; // Puntos necesarios para el siguiente nivel
        const progressPercentage = (userPoints / nextLevelPoints) * 100;
        
        if (pointsProgress && pointsText) {
            pointsProgress.style.width = `${Math.min(progressPercentage, 100)}%`;
            pointsText.textContent = `${userPoints}/${nextLevelPoints}`;
        }
        
        // Resaltar nivel actual basado en puntos
        highlightCurrentLevel(userPoints);
    }
    
    function highlightCurrentLevel(points) {
        rewardLevels.forEach(level => {
            const levelNumber = parseInt(level.getAttribute('data-level'));
            let requiredPoints = 0;
            
            switch(levelNumber) {
                case 1:
                    requiredPoints = 0;
                    break;
                case 2:
                    requiredPoints = 500;
                    break;
                case 3:
                    requiredPoints = 1000;
                    break;
                case 4:
                    requiredPoints = 2000;
                    break;
            }
            
            if (points >= requiredPoints) {
                level.style.borderLeftColor = 'var(--lab-green)';
                level.querySelector('.level-icon').style.background = 'linear-gradient(135deg, var(--lab-green), var(--lab-blue))';
            }
        });
    }
    
    // ===== FORMULARIO DE REGISTRO CORREGIDO =====
    function initLabForm() {
        if (!labSocietyForm) return;
        
        labSocietyForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Obtener datos del formulario
            const formData = new FormData(this);
            const nombre = formData.get('nombre');
            const email = formData.get('email');
            const telefono = formData.get('telefono');
            const cumpleanos = formData.get('cumpleanos');
            
            // Validación básica
            if (!nombre || !email || !telefono) {
                showLabMessage('Por favor, completa todos los campos obligatorios', 'error');
                return;
            }
            
            if (!isValidEmail(email)) {
                showLabMessage('Por favor, ingresa un email válido', 'error');
                return;
            }
            
            // Registrar miembro en la base de datos local
            const registrationResult = membersDB.registerMember({
                nombre: nombre,
                email: email,
                telefono: telefono,
                cumpleanos: cumpleanos
            });
            
            if (registrationResult.success) {
                // Mostrar estado de carga
                const submitBtn = labSocietyForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> PROCESANDO...';
                submitBtn.disabled = true;
                
                // Enviar email usando FormSubmit
                const formDataToSend = new FormData();
                formDataToSend.append('_subject', 'Nuevo miembro de The Lab Society');
                formDataToSend.append('_template', 'table');
                formDataToSend.append('nombre', nombre);
                formDataToSend.append('email', email);
                formDataToSend.append('telefono', telefono);
                if (cumpleanos) formDataToSend.append('cumpleanos', cumpleanos);
                
                fetch('https://formsubmit.co/ajax/zainzair2010@gmail.com', {
                    method: 'POST',
                    body: formDataToSend
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        showSuccessMessage();
                        updateMembershipCard(registrationResult.member);
                        // Incrementar contador de miembros
                        incrementMemberCounter();
                        // Mostrar confeti
                        showCelebration();
                    } else {
                        showLabMessage('Error al enviar el formulario. Por favor, intenta nuevamente.', 'error');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    // Aún así mostrar éxito porque se guardó localmente
                    showSuccessMessage();
                    updateMembershipCard(registrationResult.member);
                    incrementMemberCounter();
                    showCelebration();
                })
                .finally(() => {
                    // Restaurar botón
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    // Limpiar formulario
                    labSocietyForm.reset();
                });
                
            } else {
                showLabMessage(registrationResult.error, 'error');
            }
        });
        
        // Verificar si hay parámetro de éxito en la URL
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('success') === 'true') {
            const currentMember = membersDB.getCurrentMember();
            if (currentMember) {
                showSuccessMessage();
                updateMembershipCard(currentMember);
            }
        }
    }
    
    function showSuccessMessage() {
        const successMessage = document.getElementById('success-message');
        const currentMember = membersDB.getCurrentMember();
        
        if (successMessage && currentMember) {
            successMessage.style.display = 'block';
            
            // Desplazar al mensaje de éxito
            successMessage.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    function updateMembershipCard(member) {
        const memberName = document.querySelector('.member-name');
        const memberId = document.querySelector('.member-id');
        
        if (memberName) memberName.textContent = member.name;
        if (memberId) memberId.textContent = `ID: ${member.id}`;
    }
    
    function incrementMemberCounter() {
        if (!memberCount) return;
        
        const currentCount = parseInt(memberCount.textContent.replace(/,/g, ''));
        memberCount.textContent = (currentCount + 1).toLocaleString();
    }
    
    function showCelebration() {
        // Crear elementos de confeti
        const colors = ['var(--lab-gold)', 'var(--lab-red)', 'var(--lab-green)', 'var(--lab-purple)', 'var(--lab-blue)'];
        
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: fixed;
                width: 10px;
                height: 10px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                top: -20px;
                left: ${Math.random() * 100}vw;
                border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
                animation: confettiFall ${Math.random() * 3 + 2}s linear forwards;
                z-index: 10000;
            `;
            
            document.body.appendChild(confetti);
            
            // Remover después de la animación
            setTimeout(() => {
                if (confetti.parentNode) {
                    confetti.remove();
                }
            }, 5000);
        }
        
        // Agregar estilos de animación para el confeti
        if (!document.getElementById('confetti-styles')) {
            const style = document.createElement('style');
            style.id = 'confetti-styles';
            style.textContent = `
                @keyframes confettiFall {
                    0% {
                        transform: translateY(0) rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(100vh) rotate(360deg);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // ===== MENSAJES =====
    function showLabMessage(message, type) {
        // Remover mensaje existente
        const existingMessage = document.querySelector('.lab-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Crear nuevo mensaje
        const messageElement = document.createElement('div');
        messageElement.className = `lab-message lab-message-${type}`;
        messageElement.innerHTML = `
            <div class="lab-message-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Estilos para el mensaje
        messageElement.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? 'var(--lab-green)' : 'var(--lab-red)'};
            color: var(--text-dark);
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            z-index: 10001;
            transform: translateX(400px);
            opacity: 0;
            transition: all 0.3s ease;
            max-width: 400px;
        `;
        
        document.body.appendChild(messageElement);
        
        // Animación de entrada
        setTimeout(() => {
            messageElement.style.transform = 'translateX(0)';
            messageElement.style.opacity = '1';
        }, 100);
        
        // Remover después de 5 segundos
        setTimeout(() => {
            messageElement.style.transform = 'translateX(400px)';
            messageElement.style.opacity = '0';
            setTimeout(() => {
                if (messageElement.parentNode) {
                    messageElement.remove();
                }
            }, 300);
        }, 5000);
    }
    
    // ===== EFECTOS VISUALES =====
    function initVisualEffects() {
        // Efecto de aparición al hacer scroll
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
        
        // Observar elementos de The Lab Society
        const labElements = document.querySelectorAll('.lab-hero-content, .reward-level, .benefit-card, .feed-item');
        labElements.forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(element);
        });
        
        // Efecto de hover para la tarjeta de membresía
        if (membershipCard) {
            membershipCard.addEventListener('mouseenter', function() {
                this.style.transform = 'rotate(0deg) scale(1.05)';
            });
            
            membershipCard.addEventListener('mouseleave', function() {
                this.style.transform = 'rotate(5deg) scale(1)';
            });
        }
    }
    
    // ===== FUNCIONES UTILITARIAS =====
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // ===== INICIALIZAR =====
    initLabSociety();
});