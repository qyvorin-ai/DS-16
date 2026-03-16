import { DB } from './db.js';

/**
 * Design Studio 16 - Authentication Service
 */

const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

export const AuthService = {
    login: async (id, password) => {
        const employees = DB.getEmployees();
        const user = employees.find(e => e.id === id && e.password === password);

        if (user) {
            let deviceId = localStorage.getItem('ds16_device_id');
            if (!deviceId) {
                deviceId = generateUUID();
                localStorage.setItem('ds16_device_id', deviceId);
                DB.bindDevice(deviceId, user.id);
            }

            const session = {
                id: user.id,
                role: user.role,
                deviceId: deviceId,
                loggedIn: true,
                timestamp: Date.now()
            };
            DB.setSession(session);
            return { success: true, user: session };
        }
        return { success: false, message: 'Invalid ID or Password' };
    },

    logout: () => {
        DB.clearSession();
        localStorage.removeItem('ds16_device_id');
    },

    getCurrentUser: () => {
        const session = DB.getSession();
        if (session && session.loggedIn) {
            return session;
        }
        
        // Auto-login logic for device binding
        const deviceId = localStorage.getItem('ds16_device_id');
        if (deviceId) {
            const binding = DB.getDeviceBinding(deviceId);
            if (binding) {
                const user = DB.getEmployeeById(binding.employeeId);
                if (user) {
                    const session = {
                        id: user.id,
                        role: user.role,
                        deviceId: deviceId,
                        loggedIn: true,
                        timestamp: Date.now()
                    };
                    DB.setSession(session);
                    return session;
                }
            }
        }
        return null;
    },

    isAdmin: () => {
        const user = AuthService.getCurrentUser();
        return user && user.role === 'admin';
    }
};
