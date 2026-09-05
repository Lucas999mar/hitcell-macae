import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import db from '../database/db';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem('hitcell_user');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setUser(parsed);
            } catch { /* ignore */ }
        }
        setLoading(false);
    }, []);

    // Session timeout
    useEffect(() => {
        if (!user) return;
        let timeout;
        const resetTimer = () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                logout();
            }, 30 * 60 * 1000); // 30 min
        };
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        events.forEach(e => document.addEventListener(e, resetTimer));
        resetTimer();
        return () => {
            clearTimeout(timeout);
            events.forEach(e => document.removeEventListener(e, resetTimer));
        };
    }, [user]);

    const login = useCallback(async (email, password) => {
        const users = await db.getAll('users');
        const found = users.find(u => u.email === email && u.password === password && u.active !== false);
        if (!found) throw new Error('E-mail ou senha incorretos');
        const { password: _, ...safeUser } = found;
        setUser(safeUser);
        localStorage.setItem('hitcell_user', JSON.stringify(safeUser));
        await db.put('audit_log', {
            user_id: found.id,
            action: 'login',
            entity_type: 'auth',
            details: `Login: ${found.email}`,
        });
        return safeUser;
    }, []);

    const register = useCallback(async (data) => {
        const existing = await db.query('users', u => u.email === data.email);
        if (existing.length > 0) throw new Error('Este e-mail já está cadastrado');
        const newUser = await db.put('users', {
            ...data,
            role: 'customer',
            type: 'customer',
            active: true
        });
        const { password: _, ...safeUser } = newUser;
        setUser(safeUser);
        localStorage.setItem('hitcell_user', JSON.stringify(safeUser));
        // Create customer record
        await db.put('customers', {
            id: newUser.id,
            user_id: newUser.id,
            name: data.name,
            email: data.email,
            phone: data.phone || '',
            whatsapp: data.phone || '',
            document: data.document || '',
            privacy_consent: true,
            privacy_consent_date: new Date().toISOString()
        });
        return safeUser;
    }, []);

    const logout = useCallback(() => {
        if (user) {
            db.put('audit_log', {
                user_id: user.id,
                action: 'logout',
                entity_type: 'auth',
                details: `Logout: ${user.email}`,
            });
        }
        setUser(null);
        localStorage.removeItem('hitcell_user');
    }, [user]);

    const updateUser = useCallback(async (data) => {
        const updated = await db.put('users', { ...user, ...data });
        const { password: _, ...safeUser } = updated;
        setUser(safeUser);
        localStorage.setItem('hitcell_user', JSON.stringify(safeUser));
        return safeUser;
    }, [user]);

    const isAdmin = user?.type === 'employee' && ['admin', 'manager', 'seller', 'tech', 'stock', 'financial'].includes(user?.role);
    const isCustomer = user?.type === 'customer' || user?.role === 'customer';

    const hasPermission = useCallback((perm) => {
        if (!user) return false;
        if (user.role === 'admin') return true;
        // simplified permission check
        return true;
    }, [user]);

    return (
        <AuthContext.Provider value={{
            user, loading, login, register, logout, updateUser,
            isAdmin, isCustomer, hasPermission, isLoggedIn: !!user
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
