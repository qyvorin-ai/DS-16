import { DB } from '../services/db.js';
import { AuthService } from '../services/auth.js';

export const EmployeeDashboard = {
    render: async (app) => {
        const user = AuthService.getCurrentUser();
        const today = new Date().toLocaleDateString('en-CA');
        const records = DB.getAttendanceByEmployee(user.id);
        const todayRecord = records.find(r => r.date === today);

        let statusText = 'Pending';
        let statusClass = 'status-absent';
        let checkInTime = '--:--';
        let checkOutTime = '--:--';
        let workingHours = '0.0';

        if (todayRecord) {
            checkInTime = todayRecord.checkIn || '--:--';
            checkOutTime = todayRecord.checkOut || '--:--';
            workingHours = todayRecord.working_hours || '0.0';

            if (todayRecord.checkOut) {
                statusText = 'Completed';
                statusClass = 'status-completed';
            } else {
                statusText = 'On-Duty';
                statusClass = 'status-working';
            }
        }

        const initials = user.id.split('-')[1]?.substring(2) || user.id.substring(0, 2);

        app.appElement.innerHTML = `
            <header class="header">
                <div class="logo">
                     <img src="/logo.jpg" alt="DS16" style="height: 28px; margin-right: 10px;">
                     DS<span>16</span>
                </div>
                <div class="attendance-status-pill ${statusClass}">
                    ${statusText}
                </div>
            </header>

            <div class="container animate-fade">
                <div class="employee-profile">
                    <div class="avatar">${initials}</div>
                    <div>
                        <p style="font-size:12px; font-weight:600;">Welcome back,</p>
                        <h2 style="font-size:20px;">${user.id}</h2>
                    </div>
                </div>

                <div class="time-display-card">
                    <p style="font-size:12px; font-weight:700; color:rgba(255,255,255,0.6); text-transform:uppercase; letter-spacing:1px;">Indian Standard Time</p>
                    <div id="big-clock" class="big-clock">--:--:--</div>
                    <p id="current-date" style="font-size:14px; color:var(--ds-orange); font-weight:600;">${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}</p>
                    
                    <div class="stats-row">
                        <div class="stat-item">
                            <span class="stat-label">In Time</span>
                            <span class="stat-value">${checkInTime.split(' ')[0]}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Work Hrs</span>
                            <span class="stat-value">${workingHours}h</span>
                        </div>
                    </div>
                </div>

                <div style="margin-bottom: 30px;">
                    ${!todayRecord ? `
                        <button id="check-in-btn" class="btn btn-primary">
                            <span>📍</span> Check-In For Today
                        </button>
                    ` : (todayRecord && !todayRecord.checkOut) ? `
                        <button id="check-out-btn" class="btn btn-outline">
                            <span>👋</span> Complete Shift
                        </button>
                    ` : `
                        <div class="success-message">
                            <strong>Shift Completed</strong>
                            <p style="font-size:12px; margin-top:4px;">You have successfully checked out at ${checkOutTime}.</p>
                        </div>
                    `}
                </div>

                <div class="section-header">
                    <h3 style="font-size:18px;">Recent Activity</h3>
                    <a href="/employee/history" class="view-history-link" style="color:var(--ds-orange); text-decoration:none; font-size:13px; font-weight:700;">View Full History</a>
                </div>

                <div class="history-list">
                    ${records.slice(-4).reverse().map(r => `
                        <div class="history-card">
                            <div class="history-info">
                                <h4>${new Date(r.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</h4>
                                <p>${r.checkIn} - ${r.checkOut || 'Active'}</p>
                            </div>
                            <div class="history-badge">${r.working_hours || '0.0'}h</div>
                        </div>
                    `).join('') || '<p style="text-align:center; color:#999; margin-top:20px;">No recent activity.</p>'}
                </div>
            </div>

            <nav class="bottom-nav">
                <a href="/employee/dashboard" class="nav-item active">
                    <span class="icon">🏠</span>
                    <span>Home</span>
                </a>
                <a href="/employee/history" class="nav-item">
                    <span class="icon">📅</span>
                    <span>History</span>
                </a>
                <a href="#" id="logout-btn-nav" class="nav-item">
                    <span class="icon">🚪</span>
                    <span>Logout</span>
                </a>
            </nav>
        `;

        EmployeeDashboard.startClock();
        EmployeeDashboard.attachEvents(app, todayRecord);
    },

    startClock: () => {
        const update = () => {
            const clock = document.getElementById('big-clock');
            if (clock) {
                clock.textContent = new Date().toLocaleTimeString('en-IN', { hour12: false, timeZone: 'Asia/Kolkata' });
            }
        };
        update();
        setInterval(update, 1000);
    },

    attachEvents: (app, todayRecord) => {
        // Attendance
        document.getElementById('check-in-btn')?.addEventListener('click', () => EmployeeDashboard.handleAttendance(app, 'check-in'));
        document.getElementById('check-out-btn')?.addEventListener('click', () => EmployeeDashboard.handleAttendance(app, 'check-out', todayRecord));

        // Navigation
        document.querySelector('.view-history-link')?.addEventListener('click', (e) => {
            e.preventDefault();
            app.navigateTo('/employee/history');
        });

        document.querySelectorAll('.bottom-nav .nav-item').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href !== '#') {
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
    },

    handleAttendance: async (app, type, existingRecord = null) => {
        const user = AuthService.getCurrentUser();
        const now = new Date();
        const istTime = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' }) + ' IST';
        const date = now.toLocaleDateString('en-CA');

        if (type === 'check-in') {
            const record = {
                employee: user.id,
                date: date,
                checkIn: istTime,
                latitude: 0,
                longitude: 0,
                rawCheckIn: now.getTime()
            };
            
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    record.latitude = pos.coords.latitude;
                    record.longitude = pos.coords.longitude;
                    DB.saveAttendance(record);
                    EmployeeDashboard.render(app);
                },
                () => {
                    DB.saveAttendance(record);
                    EmployeeDashboard.render(app);
                }
            );
        } else {
            const startTime = existingRecord.rawCheckIn;
            const endTime = now.getTime();
            const hours = ((endTime - startTime) / (1000 * 60 * 60)).toFixed(1);

            const record = {
                ...existingRecord,
                checkOut: istTime,
                working_hours: hours
            };
            DB.saveAttendance(record);
            EmployeeDashboard.render(app);
        }
    }
};
