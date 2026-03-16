import { AuthService } from './services/auth.js';
import { DB } from './services/db.js';
import { EmployeeDashboard } from './pages/employee-dashboard.js';
import { AdminDashboard } from './pages/admin-dashboard.js';
import { EmployeeHistory } from './pages/employee-history.js';

/**
 * Design Studio 16 - Main Application Logic
 */

const SEED_EMPLOYEES = [
    { id: 'admin', password: 'DS16_admin_secure', role: 'admin' },
    ...Array.from({ length: 10 }, (_, i) => ({
        id: `Employee-DS00${i + 1}`.replace('0010', '010'),
        password: `DS16_emp_00${i + 1}`.replace('0010', '010'),
        role: 'employee'
    }))
];

class App {
    constructor() {
        this.appElement = document.getElementById('app');
        this.init();
    }

    async init() {
        // Seed data if first run
        DB.seed(SEED_EMPLOYEES);

        // Handle routing
        window.addEventListener('popstate', () => this.route());
        this.route();
    }

    async route() {
        const path = window.location.pathname;
        const user = AuthService.getCurrentUser();

        if (!user && path !== '/login') {
            return this.navigateTo('/login');
        }

        if (user && path === '/login') {
            return this.navigateTo(user.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard');
        }

        switch (path) {
            case '/login':
                this.renderLogin();
                break;
            case '/admin/dashboard':
                if (AuthService.isAdmin()) this.renderAdminDashboard();
                else this.navigateTo('/employee/dashboard');
                break;
            case '/employee/dashboard':
                this.renderEmployeeDashboard();
                break;
            case '/employee/history':
                this.renderEmployeeHistory();
                break;
            default:
                this.navigateTo('/login');
        }
    }

    navigateTo(path) {
        window.history.pushState({}, '', path);
        this.route();
    }

    renderHeader(title, showLogout = true) {
        return `
            <header class="header">
                <div class="logo">
                    <img src="/logo.jpg" alt="DS16" style="height: 32px; vertical-align: middle; margin-right: 8px;">
                    DS<span>16</span> Studio
                </div>
                ${showLogout ? '<button id="logout-btn" class="nav-item" style="border:none;background:none;cursor:pointer;"><span class="icon">🚪</span>Logout</button>' : ''}
            </header>
        `;
    }

    renderLogin() {
        this.appElement.innerHTML = `
            <div class="container" style="padding-top: 40px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <img src="/logo.jpg" alt="Logo" style="width: 80px; height: 80px; margin-bottom: 15px;">
                    <h1 style="font-size: 28px; margin-bottom: 5px;">Design Studio <span style="color:var(--ds-orange)">16</span></h1>
                    <p style="color: var(--ds-gray-dark)">Internal Workforce System</p>
                </div>
                <div class="card">
                    <form id="login-form">
                        <div class="form-group">
                            <label>Employee ID / Admin ID</label>
                            <input type="text" id="user-id" class="form-input" placeholder="e.g. Employee-DS001" required>
                        </div>
                        <div class="form-group">
                            <label>Password</label>
                            <input type="password" id="password" class="form-input" placeholder="••••••••" required>
                        </div>
                        <button type="submit" class="btn btn-primary" style="margin-top: 10px;">Login to System</button>
                    </form>
                    <div id="login-error" style="color: var(--ds-danger); margin-top: 15px; text-align: center; display: none;"></div>
                </div>
            </div>
        `;

        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('user-id').value;
            const pass = document.getElementById('password').value;
            const res = await AuthService.login(id, pass);
            if (res.success) {
                this.navigateTo(res.user.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard');
            } else {
                const err = document.getElementById('login-error');
                err.textContent = res.message;
                err.style.display = 'block';
            }
        });
    }

    renderEmployeeDashboard() {
        EmployeeDashboard.render(this);
    }

    renderAdminDashboard() {
        AdminDashboard.render(this);
    }

    renderEmployeeHistory() {
        EmployeeHistory.render(this);
    }

    bindLogout() {
        const btn = document.getElementById('logout-btn');
        if (btn) {
            btn.addEventListener('click', () => {
                AuthService.logout();
                this.navigateTo('/login');
            });
        }
    }
}

// Global instance
window.app = new App();
