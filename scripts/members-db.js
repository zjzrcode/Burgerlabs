// scripts/members-db.js
// Base de datos local mejorada para The Lab Society

class MembersDB {
    constructor() {
        this.storageKey = 'burgerLabsMembers';
        this.currentMemberKey = 'currentLabMember';
        this.initDB();
    }

    initDB() {
        if (!localStorage.getItem(this.storageKey)) {
            const initialData = {
                members: [],
                nextId: 1,
                benefits: {
                    1: { 
                        name: 'Aprendiz', 
                        requiredPoints: 0, 
                        benefits: ['postre-gratis'],
                        color: '#FFD700',
                        description: 'Miembro Nuevo'
                    },
                    2: { 
                        name: 'Experimento', 
                        requiredPoints: 500, 
                        benefits: ['papas-gratis', 'descuento-10'],
                        color: '#9D4EDD',
                        description: 'Explorador del Sabor'
                    },
                    3: { 
                        name: 'Científico', 
                        requiredPoints: 1000, 
                        benefits: ['combo-gratis', 'menu-secreto'],
                        color: '#4361EE',
                        description: 'Experto en Hamburguesas'
                    },
                    4: { 
                        name: 'Maestro', 
                        requiredPoints: 2000, 
                        benefits: ['merchandising', 'burger-personalizada'],
                        color: '#FF4444',
                        description: 'Leyenda del Laboratorio'
                    }
                },
                cardTemplates: {
                    classic: {
                        name: 'Clásico',
                        background: 'linear-gradient(135deg, #2D2D44, #1A1A2E)',
                        textColor: '#FFFFFF',
                        accentColor: '#FFD700'
                    },
                    modern: {
                        name: 'Moderno',
                        background: 'linear-gradient(135deg, #1A1A2E, #16213E)',
                        textColor: '#FFFFFF',
                        accentColor: '#00FF88'
                    },
                    premium: {
                        name: 'Premium',
                        background: 'linear-gradient(135deg, #000000, #2D2D44)',
                        textColor: '#FFD700',
                        accentColor: '#FFD700'
                    },
                    neon: {
                        name: 'Neón',
                        background: 'linear-gradient(135deg, #1A1A2E, #9D4EDD)',
                        textColor: '#FFFFFF',
                        accentColor: '#00FF88'
                    }
                }
            };
            localStorage.setItem(this.storageKey, JSON.stringify(initialData));
        }
    }

    getDB() {
        return JSON.parse(localStorage.getItem(this.storageKey));
    }

    saveDB(data) {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
    }

    // Buscar miembro por cualquier campo
    findMember(identifier) {
        const db = this.getDB();
        return db.members.find(member => 
            member.email === identifier || 
            member.phone === identifier ||
            member.id === identifier
        );
    }

    // En members-db.js, mejorar el registro de miembros
registerMember(memberData) {
    const db = this.getDB();
    
    // Verificar si el miembro ya existe
    const existingMember = this.findMember(memberData.email) || this.findMember(memberData.phone);
    if (existingMember) {
        return { 
            success: false, 
            error: 'Ya eres miembro de The Lab Society. ¡Bienvenido de nuevo!', 
            member: existingMember 
        };
    }

    const newMember = {
        id: `LAB-${db.nextId.toString().padStart(4, '0')}`,
        name: memberData.nombre,
        email: memberData.email,
        phone: memberData.telefono,
        joinDate: new Date().toISOString().split('T')[0],
        level: 1,
        points: 50, // Puntos de bienvenida
        totalSpent: 0,
        purchases: 0,
        benefitsUsed: [],
        lastPurchase: null,
        birthday: memberData.cumpleanos,
        cardTemplate: 'classic',
        cardCustomization: {
            showAvatar: true,
            showQR: true,
            showLevel: true,
            showPoints: true,
            accentColor: '#FFD700'
        },
        favoriteItems: [],
        totalItems: 0,
        memberSince: new Date().toISOString(),
        lastActive: new Date().toISOString()
    };

    db.members.push(newMember);
    db.nextId++;
    this.saveDB(db);
    
    // Guardar como miembro actual
    this.setCurrentMember(newMember);
    
    return { success: true, member: newMember };
}

    // Establecer miembro actual
    setCurrentMember(member) {
        localStorage.setItem(this.currentMemberKey, JSON.stringify(member));
    }

    // Obtener miembro actual
    getCurrentMember() {
        const member = localStorage.getItem(this.currentMemberKey);
        return member ? JSON.parse(member) : null;
    }

    // Cerrar sesión
    logout() {
        localStorage.removeItem(this.currentMemberKey);
    }

    // Actualizar después de compra
// En members-db.js, reemplaza SOLO esta función:

// Actualizar después de compra - FUNCIÓN CORREGIDA
updateMemberPurchase(memberId, cartTotal, items) {
    const db = this.getDB();
    const member = db.members.find(m => m.id === memberId);
    
    if (member) {
        // Calcular puntos CORREGIDO: 10 puntos por cada $1000 gastados
        const pointsEarned = Math.floor(cartTotal / 1000) * 10;
        
        member.points += pointsEarned;
        member.totalSpent += cartTotal;
        member.purchases++;
        member.lastPurchase = new Date().toISOString();
        member.lastActive = new Date().toISOString();
        member.totalItems += items.reduce((sum, item) => sum + item.quantity, 0);
        
        // Actualizar items favoritos
        items.forEach(item => {
            const existingItem = member.favoriteItems.find(fav => fav.name === item.name);
            if (existingItem) {
                existingItem.count += item.quantity;
            } else {
                member.favoriteItems.push({
                    name: item.name,
                    count: item.quantity
                });
            }
        });
        
        // Ordenar favoritos
        member.favoriteItems.sort((a, b) => b.count - a.count);
        
        // Actualizar nivel
        this.updateMemberLevel(member);
        
        this.saveDB(db);
        
        // Actualizar miembro actual
        const currentMember = this.getCurrentMember();
        if (currentMember && currentMember.id === memberId) {
            this.setCurrentMember(member);
        }
        
        return {
            pointsEarned,
            newPoints: member.points,
            newLevel: member.level,
            levelUp: member.level > currentMember?.level
        };
    }
    
    return null;
}

    // Actualizar nivel
    updateMemberLevel(member) {
        const db = this.getDB();
        const levels = Object.keys(db.benefits).map(Number).sort((a, b) => b - a);
        
        for (const level of levels) {
            if (member.points >= db.benefits[level].requiredPoints) {
                if (member.level < level) {
                    member.level = level;
                    break;
                }
            }
        }
    }

    // Obtener beneficios disponibles
    getAvailableBenefits(memberId) {
        const db = this.getDB();
        const member = db.members.find(m => m.id === memberId);
        
        if (!member) return [];
        
        const levelBenefits = db.benefits[member.level].benefits;
        const availableBenefits = levelBenefits.filter(benefit => 
            !member.benefitsUsed.includes(benefit)
        );
        
        return availableBenefits;
    }

    // Usar beneficio
    useBenefit(memberId, benefit) {
        const db = this.getDB();
        const member = db.members.find(m => m.id === memberId);
        
        if (member && !member.benefitsUsed.includes(benefit)) {
            member.benefitsUsed.push(benefit);
            this.saveDB(db);
            return true;
        }
        
        return false;
    }

    // Obtener información del nivel
    getLevelInfo(level) {
        const db = this.getDB();
        return db.benefits[level];
    }

    // Obtener plantillas de tarjeta
    getCardTemplates() {
        const db = this.getDB();
        return db.cardTemplates;
    }

    // Actualizar personalización de tarjeta
    updateCardCustomization(memberId, customization) {
        const db = this.getDB();
        const member = db.members.find(m => m.id === memberId);
        
        if (member) {
            member.cardCustomization = { ...member.cardCustomization, ...customization };
            this.saveDB(db);
            
            // Actualizar miembro actual
            const currentMember = this.getCurrentMember();
            if (currentMember && currentMember.id === memberId) {
                currentMember.cardCustomization = member.cardCustomization;
                this.setCurrentMember(currentMember);
            }
            
            return true;
        }
        
        return false;
    }

    // Cambiar plantilla de tarjeta
    changeCardTemplate(memberId, template) {
        const db = this.getDB();
        const member = db.members.find(m => m.id === memberId);
        
        if (member && db.cardTemplates[template]) {
            member.cardTemplate = template;
            this.saveDB(db);
            
            // Actualizar miembro actual
            const currentMember = this.getCurrentMember();
            if (currentMember && currentMember.id === memberId) {
                currentMember.cardTemplate = template;
                this.setCurrentMember(currentMember);
            }
            
            return true;
        }
        
        return false;
    }

    // Obtener estadísticas del miembro
    getMemberStats(memberId) {
        const member = this.findMember(memberId);
        if (!member) return null;

        const levelInfo = this.getLevelInfo(member.level);
        const nextLevelInfo = this.getLevelInfo(member.level + 1);
        
        return {
            memberSince: member.memberSince,
            totalPurchases: member.purchases,
            totalSpent: member.totalSpent,
            totalItems: member.totalItems,
            favoriteItem: member.favoriteItems[0]?.name || 'Ninguno',
            currentLevel: levelInfo,
            nextLevel: nextLevelInfo,
            pointsToNextLevel: nextLevelInfo ? nextLevelInfo.requiredPoints - member.points : 0,
            progressPercentage: nextLevelInfo ? 
                ((member.points - levelInfo.requiredPoints) / (nextLevelInfo.requiredPoints - levelInfo.requiredPoints)) * 100 : 100
        };
    }

    // Obtener todos los miembros (para admin)
    getAllMembers() {
        const db = this.getDB();
        return db.members;
    }

    // Generar reporte de miembros
    generateMembersReport() {
        const members = this.getAllMembers();
        return {
            totalMembers: members.length,
            totalPoints: members.reduce((sum, member) => sum + member.points, 0),
            totalSpent: members.reduce((sum, member) => sum + member.totalSpent, 0),
            levelDistribution: members.reduce((dist, member) => {
                dist[member.level] = (dist[member.level] || 0) + 1;
                return dist;
            }, {}),
            activeMembers: members.filter(m => {
                const lastActive = new Date(m.lastActive);
                const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                return lastActive > thirtyDaysAgo;
            }).length
        };
    }
}

// Instancia global
const membersDB = new MembersDB();