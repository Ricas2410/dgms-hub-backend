// DGMS Hub Admin Dashboard JavaScript
// Professional application management system

class DGMSAdmin {
    constructor() {
        this.applications = [
            {
                id: 1,
                name: 'Google Classroom',
                description: 'Online learning platform for assignments and resources',
                category: 'Education',
                url: 'https://classroom.google.com',
                icon: 'https://ssl.gstatic.com/classroom/favicon.png',
                isActive: true
            },
            {
                id: 2,
                name: 'Khan Academy',
                description: 'Free online courses and practice exercises',
                category: 'Education',
                url: 'https://www.khanacademy.org',
                icon: 'https://cdn.kastatic.org/images/favicon.ico',
                isActive: true
            },
            {
                id: 3,
                name: 'Zoom',
                description: 'Video conferencing for virtual classes',
                category: 'Communication',
                url: 'https://zoom.us',
                icon: 'https://zoom.us/favicon.ico',
                isActive: true
            },
            {
                id: 4,
                name: 'Microsoft Teams',
                description: 'Collaboration platform for team communication',
                category: 'Communication',
                url: 'https://teams.microsoft.com',
                icon: 'https://res.cdn.office.net/teams/favicon.ico',
                isActive: true
            }
        ];
        
        this.categories = ['Education', 'Communication', 'Productivity', 'Services'];
        this.currentEditId = null;
        
        this.init();
    }

    init() {
        this.loadApplications();
        this.updateStats();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Form submission
        document.getElementById('appForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveApplication();
        });

        // Close modal when clicking outside
        document.getElementById('appModal').addEventListener('click', (e) => {
            if (e.target.id === 'appModal') {
                this.closeModal();
            }
        });
    }

    loadApplications() {
        const appList = document.getElementById('appList');
        appList.innerHTML = '';

        this.applications.forEach(app => {
            const appElement = this.createApplicationElement(app);
            appList.appendChild(appElement);
        });
    }

    createApplicationElement(app) {
        const div = document.createElement('div');
        div.className = 'app-item';
        div.innerHTML = `
            <div class="app-icon">
                ${app.icon ? `<img src="${app.icon}" alt="${app.name}" style="width: 30px; height: 30px; border-radius: 6px;">` : '<i class="fas fa-globe"></i>'}
            </div>
            <div class="app-info">
                <h4>${app.name}</h4>
                <p>${app.description}</p>
                <small style="color: #8b5cf6; font-weight: 600;">${app.category}</small>
            </div>
            <div class="app-actions">
                <button class="btn btn-primary btn-sm" onclick="admin.editApplication(${app.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-danger btn-sm" onclick="admin.deleteApplication(${app.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
                <button class="btn btn-success btn-sm" onclick="admin.toggleApplication(${app.id})">
                    <i class="fas fa-${app.isActive ? 'eye-slash' : 'eye'}"></i> ${app.isActive ? 'Hide' : 'Show'}
                </button>
            </div>
        `;
        return div;
    }

    openAddModal() {
        this.currentEditId = null;
        document.getElementById('modalTitle').textContent = 'Add New Application';
        document.getElementById('appForm').reset();
        document.getElementById('appModal').style.display = 'block';
    }

    editApplication(id) {
        const app = this.applications.find(a => a.id === id);
        if (!app) return;

        this.currentEditId = id;
        document.getElementById('modalTitle').textContent = 'Edit Application';
        document.getElementById('appName').value = app.name;
        document.getElementById('appDescription').value = app.description;
        document.getElementById('appCategory').value = app.category;
        document.getElementById('appUrl').value = app.url;
        document.getElementById('appIcon').value = app.icon || '';
        document.getElementById('appModal').style.display = 'block';
    }

    saveApplication() {
        const formData = {
            name: document.getElementById('appName').value,
            description: document.getElementById('appDescription').value,
            category: document.getElementById('appCategory').value,
            url: document.getElementById('appUrl').value,
            icon: document.getElementById('appIcon').value,
            isActive: true
        };

        if (this.currentEditId) {
            // Edit existing application
            const index = this.applications.findIndex(a => a.id === this.currentEditId);
            if (index !== -1) {
                this.applications[index] = { ...this.applications[index], ...formData };
            }
        } else {
            // Add new application
            const newId = Math.max(...this.applications.map(a => a.id)) + 1;
            this.applications.push({ id: newId, ...formData });
        }

        this.loadApplications();
        this.updateStats();
        this.closeModal();
        this.updateMobileApp();
        this.showNotification(this.currentEditId ? 'Application updated successfully!' : 'Application added successfully!');
    }

    deleteApplication(id) {
        if (confirm('Are you sure you want to delete this application?')) {
            this.applications = this.applications.filter(a => a.id !== id);
            this.loadApplications();
            this.updateStats();
            this.updateMobileApp();
            this.showNotification('Application deleted successfully!');
        }
    }

    toggleApplication(id) {
        const app = this.applications.find(a => a.id === id);
        if (app) {
            app.isActive = !app.isActive;
            this.loadApplications();
            this.updateStats();
            this.updateMobileApp();
            this.showNotification(`Application ${app.isActive ? 'activated' : 'deactivated'} successfully!`);
        }
    }

    closeModal() {
        document.getElementById('appModal').style.display = 'none';
        this.currentEditId = null;
    }

    updateStats() {
        const totalApps = this.applications.length;
        const activeApps = this.applications.filter(a => a.isActive).length;
        const totalCategories = [...new Set(this.applications.map(a => a.category))].length;

        document.getElementById('totalApps').textContent = totalApps;
        document.getElementById('activeApps').textContent = activeApps;
        document.getElementById('totalCategories').textContent = totalCategories;
    }

    updateMobileApp() {
        // This would sync with the mobile app's data source
        // For now, we'll update localStorage to simulate real-time sync
        localStorage.setItem('dgms_applications', JSON.stringify(this.applications));
        console.log('Mobile app data updated:', this.applications);
    }

    exportData() {
        const dataStr = JSON.stringify(this.applications, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'dgms-hub-applications.json';
        link.click();
        this.showNotification('Data exported successfully!');
    }

    manageCategoriesModal() {
        alert('Category management feature coming soon!\n\nCurrent categories:\n• ' + this.categories.join('\n• '));
    }

    viewMobileApp() {
        // Open the mobile app in a new window
        window.open('http://localhost:8081', '_blank');
    }

    showNotification(message) {
        // Create a simple notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            z-index: 10000;
            font-weight: 600;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Global functions for onclick handlers
let admin;

function openAddModal() {
    admin.openAddModal();
}

function closeModal() {
    admin.closeModal();
}

function manageCategoriesModal() {
    admin.manageCategoriesModal();
}

function exportData() {
    admin.exportData();
}

function viewMobileApp() {
    admin.viewMobileApp();
}

// Initialize the admin dashboard when the page loads
document.addEventListener('DOMContentLoaded', () => {
    admin = new DGMSAdmin();
});

// Auto-save functionality
setInterval(() => {
    if (admin) {
        admin.updateMobileApp();
    }
}, 30000); // Auto-save every 30 seconds
