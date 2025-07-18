// DGMS Hub Admin Dashboard JavaScript
// Professional application management system with persistent data

class DGMSAdmin {
    constructor() {
        this.applications = [];
        this.categories = ['Education', 'Communication', 'Productivity', 'Services'];
        this.currentEditId = null;
        this.apiUrl = 'http://localhost:3001/api';

        this.init();
    }

    async init() {
        await this.loadApplications();
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

    async loadApplications() {
        try {
            const response = await fetch(`${this.apiUrl}/applications`);
            if (response.ok) {
                const result = await response.json();
                if (Array.isArray(result)) {
                    // Local API returns array directly
                    this.applications = result;
                } else if (result.success && Array.isArray(result.data.applications)) {
                    // Production API format (fallback)
                    this.applications = result.data.applications.map(app => ({
                        id: parseInt(app.id),
                        name: app.name,
                        description: app.description,
                        category: app.category,
                        url: app.url,
                        icon: app.iconUrl || `https://www.google.com/s2/favicons?domain=${new URL(app.url).hostname}`,
                        isActive: app.isActive
                    }));
                } else {
                    console.error('Invalid API response format');
                    this.showNotification('Invalid API response format', 'error');
                }
            } else {
                console.error('Failed to load applications');
                this.showNotification('Failed to load applications', 'error');
            }
        } catch (error) {
            console.error('Error loading applications:', error);
            this.showNotification('Error connecting to server', 'error');
        }

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

    async saveApplication() {
        const formData = {
            name: document.getElementById('appName').value,
            description: document.getElementById('appDescription').value,
            category: document.getElementById('appCategory').value,
            url: document.getElementById('appUrl').value,
            iconUrl: document.getElementById('appIcon').value || null,
            isActive: true,
            backgroundColor: '#1976D2',
            textColor: '#FFFFFF',
            requiresAuth: false,
            openInNewTab: false
        };

        try {
            let response;
            if (this.currentEditId) {
                // Edit existing application
                response = await fetch(`${this.apiUrl}/applications/${this.currentEditId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
            } else {
                // Add new application
                response = await fetch(`${this.apiUrl}/applications`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
            }

            if (response.ok) {
                await this.loadApplications();
                this.updateStats();
                this.closeModal();
                this.updateMobileApp();
                this.showNotification(this.currentEditId ? 'Application updated successfully!' : 'Application added successfully!');
            } else {
                const errorData = await response.text();
                console.error('API Error:', errorData);
                this.showNotification(`Failed to save application: ${response.status}`, 'error');
            }
        } catch (error) {
            console.error('Error saving application:', error);
            this.showNotification('Error connecting to server. Check console for details.', 'error');
        }
    }

    async deleteApplication(id) {
        if (confirm('Are you sure you want to delete this application?')) {
            try {
                const response = await fetch(`${this.apiUrl}/applications/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    await this.loadApplications();
                    this.updateStats();
                    this.updateMobileApp();
                    this.showNotification('Application deleted successfully!');
                } else {
                    const errorData = await response.text();
                    console.error('Delete Error:', errorData);
                    this.showNotification(`Failed to delete application: ${response.status}`, 'error');
                }
            } catch (error) {
                console.error('Error deleting application:', error);
                this.showNotification('Error connecting to server. Check console for details.', 'error');
            }
        }
    }

    async toggleApplication(id) {
        const app = this.applications.find(a => a.id === id);
        if (app) {
            try {
                const response = await fetch(`${this.apiUrl}/applications/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ isActive: !app.isActive })
                });

                if (response.ok) {
                    await this.loadApplications();
                    this.updateStats();
                    this.updateMobileApp();
                    this.showNotification(`Application ${!app.isActive ? 'activated' : 'deactivated'} successfully!`);
                } else {
                    this.showNotification('Failed to update application', 'error');
                }
            } catch (error) {
                console.error('Error toggling application:', error);
                this.showNotification('Error connecting to server', 'error');
            }
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

    showNotification(message, type = 'success') {
        // Create a simple notification
        const notification = document.createElement('div');
        const bgColor = type === 'error'
            ? 'linear-gradient(135deg, #ef4444, #dc2626)'
            : 'linear-gradient(135deg, #10b981, #059669)';

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${bgColor};
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
        }, type === 'error' ? 5000 : 3000);
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
