/**
 * Design Studio 16 - Centralized Storage Layer
 * Abstracted database using localStorage for Phase 1.
 */

const DB_KEY = 'ds16_workforce_db';

const INITIAL_DB = {
    employees: [],
    attendance: [],
    sessions: {},
    devices: []
};

const getDB = () => {
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : INITIAL_DB;
};

const saveDB = (db) => {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
};

export const DB = {
    // Employee methods
    getEmployees: () => getDB().employees,
    saveEmployee: (employee) => {
        const db = getDB();
        const index = db.employees.findIndex(e => e.id === employee.id);
        if (index > -1) {
            db.employees[index] = employee;
        } else {
            db.employees.push(employee);
        }
        saveDB(db);
    },
    getEmployeeById: (id) => getDB().employees.find(e => e.id === id),

    // Attendance methods
    getAttendance: () => getDB().attendance,
    saveAttendance: (record) => {
        const db = getDB();
        const index = db.attendance.findIndex(a => a.employee === record.employee && a.date === record.date);
        if (index > -1) {
            db.attendance[index] = { ...db.attendance[index], ...record };
        } else {
            db.attendance.push(record);
        }
        saveDB(db);
    },
    getAttendanceByEmployee: (employeeId) => {
        return getDB().attendance.filter(a => a.employee === employeeId);
    },
    getAttendanceForDate: (date) => {
        return getDB().attendance.filter(a => a.date === date);
    },

    // Session methods
    getSession: () => getDB().sessions,
    setSession: (session) => {
        const db = getDB();
        db.sessions = session;
        saveDB(db);
    },
    clearSession: () => {
        const db = getDB();
        db.sessions = {};
        saveDB(db);
    },

    // Device binding
    getDevices: () => getDB().devices,
    bindDevice: (deviceId, employeeId) => {
        const db = getDB();
        db.devices.push({ deviceId, employeeId, timestamp: new Date().toISOString() });
        saveDB(db);
    },
    getDeviceBinding: (deviceId) => {
        return getDB().devices.find(d => d.deviceId === deviceId);
    },

    // Initialization
    seed: (employees) => {
        const db = getDB();
        if (db.employees.length === 0) {
            db.employees = employees;
            saveDB(db);
        }
    }
};
