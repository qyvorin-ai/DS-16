import { DB } from '../services/db.js';
import { AuthService } from '../services/auth.js';

export const EmployeeHistory = {
    render: async (app) => {
        const user = AuthService.getCurrentUser();
        const records = DB.getAttendanceByEmployee(user.id).reverse();

        app.appElement.innerHTML = `
            <header class="header">
                <div class="logo" id="back-home" style="cursor:pointer;">
                     <img src="/logo.jpg" alt="DS16" style="height: 24px; margin-right: 8px;">
                     DS<span>16</span> History
                </div>
            </header>

            <div class="container animate-fade" style="padding-bottom: 100px;">
                <h2 style="margin-bottom: 20px;">Monthly Activity</h2>
                
                ${records.map(r => `
                    <div class="history-card" style="padding: 20px;">
                        <div style="flex: 1;">
                            <h4 style="font-size: 16px;">${new Date(r.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</h4>
                            <p style="margin-top:4px;">📍 ${r.latitude ? r.latitude.toFixed(4) : '0.0000'}, ${r.longitude ? r.longitude.toFixed(4) : '0.0000'}</p>
                            <div style="display:flex; gap:15px; margin-top:10px;">
                                <div style="font-size:11px; font-weight:700; color:#999;">IN: <span style="color:#111;">${r.checkIn.split(' ')[0]}</span></div>
                                <div style="font-size:11px; font-weight:700; color:#999;">OUT: <span style="color:#111;">${r.checkOut ? r.checkOut.split(' ')[0] : '--:--'}</span></div>
                            </div>
                        </div>
                        <div style="text-align: right;">
                             <div class="history-badge" style="background:var(--ds-black); color:white; padding:8px 12px; border-radius:12px;">${r.working_hours || '0.0'}h</div>
                        </div>
                    </div>
                `).join('') || '<div class="card" style="text-align:center;">No records found yet.</div>'}
            </div>

            <nav class="bottom-nav">
                <a href="/employee/dashboard" class="nav-item">
                    <span class="icon">🏠</span>
                    <span>Home</span>
                </a>
                <a href="/employee/history" class="nav-item active">
                    <span class="icon">📅</span>
                    <span>History</span>
                </a>
                <a href="#" id="logout-btn-nav" class="nav-item">
                    <span class="icon">🚪</span>
                    <span>Logout</span>
                </a>
            </nav>
        `;

        EmployeeHistory.attachEvents(app);
    },

    attachEvents: (app) => {
        document.getElementById('back-home')?.addEventListener('click', () => app.navigateTo('/employee/dashboard'));
        
        document.querySelectorAll('.bottom-nav .nav-item').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href && href !== '#') {
                    e.preventDefault();
                    app.navigateTo(href);
                }
            });
        });

        document.getElementById('logout-btn-nav')?.addEventListener('click', (e) => {
            e.preventDefault();
            AuthService.logout();
            app.navigateTo('/login');
        });
    }
};
