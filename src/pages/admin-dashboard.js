import { DB } from '../services/db.js';
import { AuthService } from '../services/auth.js';

export const AdminDashboard = {
    render: async (app) => {
        const employees = DB.getEmployees().filter(e => e.role === 'employee');
        const today = new Date().toLocaleDateString('en-CA');
        const attendance = DB.getAttendanceForDate(today);

        const total = employees.length;
        const checkedIn = attendance.filter(a => a.checkIn).length;
        const checkedOut = attendance.filter(a => a.checkOut).length;
        const absent = total - checkedIn;

        app.appElement.innerHTML = `
            <header class="header">
                <div class="logo">
                     <img src="/logo.jpg" alt="DS16" style="height: 28px; margin-right: 10px;">
                     DS<span>16</span> Admin
                </div>
                <button id="logout-btn-header" class="nav-item" style="border:none;background:none;cursor:pointer; color:var(--ds-orange); font-size:12px; font-weight:800;">LOGOUT</button>
            </header>

            <div class="container animate-fade">
                <div style="margin-bottom: 25px;">
                    <p style="font-size:12px; font-weight:700; color:#999; text-transform:uppercase; letter-spacing:1px; margin-bottom:5px;">Studio Performance</p>
                    <h2 style="font-size:24px;">Daily Metrics</h2>
                </div>
                
                <div class="metrics-grid">
                    <div class="metric-card">
                        <span class="metric-val">${total}</span>
                        <span class="metric-label">Total</span>
                    </div>
                    <div class="metric-card" style="background:#fff7ed; border-color:#ffedd5;">
                        <span class="metric-val" style="color: var(--ds-orange);">${checkedIn}</span>
                        <span class="metric-label">Checked-In</span>
                    </div>
                    <div class="metric-card" style="background:#f0fdf4; border-color:#dcfce7;">
                        <span class="metric-val" style="color: var(--ds-success);">${checkedOut}</span>
                        <span class="metric-label">Completed</span>
                    </div>
                    <div class="metric-card" style="background:#fef2f2; border-color:#fee2e2;">
                        <span class="metric-val" style="color: var(--ds-danger);">${absent}</span>
                        <span class="metric-label">Absent</span>
                    </div>
                </div>

                <div class="section-header" style="margin-top: 35px; border-bottom: 2px solid var(--ds-orange); padding-bottom: 5px; width: fit-content; margin-bottom: 20px;">
                    <h3 style="font-size:18px;">Attendance Log</h3>
                </div>

                <div class="admin-table-container">
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Status</th>
                                <th>Schedule</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${employees.map(emp => {
                                const record = attendance.find(a => a.employee === emp.id);
                                let statusMsg = 'Absent';
                                let statusColor = 'var(--ds-danger)';
                                let statusBg = '#fee2e2';
                                if (record) {
                                    if (record.checkOut) {
                                        statusMsg = 'Done';
                                        statusColor = 'var(--ds-success)';
                                        statusBg = '#dcfce7';
                                    } else {
                                        statusMsg = 'Working';
                                        statusColor = 'var(--ds-orange)';
                                        statusBg = '#ffedd5';
                                    }
                                }

                                return `
                                    <tr class="admin-row" style="cursor:pointer;">
                                        <td>
                                            <div style="font-weight:700; color:var(--ds-black); font-size:14px;">${emp.id.split('-')[1]}</div>
                                            <div style="font-size:10px; color:#999; font-weight:600;">${record ? record.checkIn.split(' ')[0] : 'No Entry'}</div>
                                        </td>
                                        <td>
                                            <span class="badge" style="background:${statusBg}; color:${statusColor}; border: 1px solid ${statusColor}44;">${statusMsg}</span>
                                        </td>
                                        <td style="text-align:right;">
                                            <div style="font-size:12px; font-weight:700; color:var(--ds-black);">${record?.working_hours ? record.working_hours + 'h' : '--'}</div>
                                            <div style="font-size:10px; color:#999;">${record?.checkOut ? record.checkOut.split(' ')[0] : 'Active'}</div>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>

                <div style="margin-top: 40px; text-align:center; padding: 20px; background: #F8F9FA; border-radius: 20px;">
                    <p style="font-size:11px; color:#999; font-weight:600; text-transform:uppercase;">System Status</p>
                    <p style="font-size:13px; font-weight:700; color:var(--ds-black); margin-top:5px;">Connected to Local Persistence</p>
                </div>
            </div>
        `;

        AdminDashboard.attachEvents(app);
    },

    attachEvents: (app) => {
        document.getElementById('logout-btn-header')?.addEventListener('click', () => {
            AuthService.logout();
            app.navigateTo('/login');
        });
    }
};
