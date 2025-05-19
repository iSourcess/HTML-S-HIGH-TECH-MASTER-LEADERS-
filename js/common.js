/**
 * Common functionality for all pages
 */

function initializeSidebar() {
    // Menu toggle for mobile
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    const closeSidebar = document.querySelector('.close-sidebar');
    
    if (menuToggle && sidebar && mainContent) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
        
        if (closeSidebar) {
            closeSidebar.addEventListener('click', function() {
                sidebar.classList.remove('active');
            });
        }
        
        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', function(e) {
            if (window.innerWidth <= 992) {
                if (!sidebar.contains(e.target) && e.target !== menuToggle && !menuToggle.contains(e.target)) {
                    sidebar.classList.remove('active');
                }
            }
        });
    }
    
    // Submenu toggle
    const menuItems = document.querySelectorAll('.nav-link.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const parent = this.parentElement;
            parent.classList.toggle('open');
        });
    });
    
    // Category filter
    const categoryLinks = document.querySelectorAll('.nav-link[data-category]');
    categoryLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.getAttribute('data-category');
            filterByCategory(category);
        });
    });
}

function filterByCategory(category) {
    // In a real app, this would filter content by category
    console.log(`Filtering by category: ${category}`);
    
    // Show notification
    showNotification(`Filtrando por categoría: ${category}`, 'info');
}

function initializeThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    
    if (themeToggle && themeIcon) {
        // Check for saved theme preference
        const darkMode = localStorage.getItem('darkMode') === 'true';
        
        // Apply theme
        if (darkMode) {
            document.body.classList.add('dark-theme');
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        }
        
        // Toggle theme
        themeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-theme');
            
            const isDark = document.body.classList.contains('dark-theme');
            localStorage.setItem('darkMode', isDark);
            
            if (isDark) {
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
            } else {
                themeIcon.classList.remove('fa-sun');
                themeIcon.classList.add('fa-moon');
            }
        });
    }
}

// Initialize all functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeSidebar();
    initializeThemeToggle();
    initializeNotifications();
    initializeUserMenu();
});

function initializeNotifications() {
    const notificationToggle = document.getElementById('notification-toggle');
    const notificationPanel = document.getElementById('notification-panel');
    const notificationList = document.getElementById('notification-list');
    const markAllRead = document.querySelector('.mark-all-read');
    
    if (notificationToggle && notificationPanel && notificationList) {
        // Toggle notification panel
        notificationToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            notificationPanel.classList.toggle('active');
            
            // Load notifications if panel is active
            if (notificationPanel.classList.contains('active')) {
                loadNotifications();
            }
        });
        
        // Close panel when clicking outside
        document.addEventListener('click', function(e) {
            if (!notificationPanel.contains(e.target) && e.target !== notificationToggle) {
                notificationPanel.classList.remove('active');
            }
        });
        
        // Mark all as read
        if (markAllRead) {
            markAllRead.addEventListener('click', function() {
                const notifications = notificationList.querySelectorAll('.notification-item');
                notifications.forEach(notification => {
                    notification.classList.add('read');
                });
                
                // Update notification count
                updateNotificationCount(0);
                
                showNotification('Todas las notificaciones marcadas como leídas', 'success');
            });
        }
    }
}

function loadNotifications() {
    const notificationList = document.getElementById('notification-list');
    
    if (notificationList) {
        // Clear current notifications
        notificationList.innerHTML = '';
        
        // Sample notifications
        const notifications = [
            {
                title: 'Nuevo comentario',
                message: 'El Dr. García ha comentado en tu artículo sobre IA.',
                time: '10 minutos',
                read: false
            },
            {
                title: 'Recordatorio',
                message: 'Reunión departamental mañana a las 10:00 AM.',
                time: '1 hora',
                read: false
            },
            {
                title: 'Actualización de sistema',
                message: 'El sistema se actualizará esta noche a las 2:00 AM.',
                time: '3 horas',
                read: false
            },
            {
                title: 'Solicitud de revisión',
                message: 'Tienes una nueva solicitud de revisión de tesis.',
                time: '1 día',
                read: true
            },
            {
                title: 'Publicación aceptada',
                message: 'Tu artículo ha sido aceptado para publicación.',
                time: '2 días',
                read: true
            }
        ];
        
        // Add notifications to list
        notifications.forEach(notification => {
            const notificationItem = document.createElement('div');
            notificationItem.className = `notification-item ${notification.read ? 'read' : ''}`;
            
            notificationItem.innerHTML = `
                <div class="notification-title">${notification.title}</div>
                <div class="notification-message">${notification.message}</div>
                <div class="notification-time">Hace ${notification.time}</div>
            `;
            
            notificationItem.addEventListener('click', function() {
                this.classList.add('read');
                
                // Update notification count
                const unreadCount = document.querySelectorAll('.notification-item:not(.read)').length;
                updateNotificationCount(unreadCount);
            });
            
            notificationList.appendChild(notificationItem);
        });
        
        // Update notification count
        const unreadCount = notifications.filter(n => !n.read).length;
        updateNotificationCount(unreadCount);
    }
}

function updateNotificationCount(count) {
    const notificationCount = document.getElementById('notification-count');
    
    if (notificationCount) {
        notificationCount.textContent = count;
        
        if (count === 0) {
            notificationCount.style.display = 'none';
        } else {
            notificationCount.style.display = 'flex';
        }
    }
}

function initializeUserMenu() {
    const userMenu = document.querySelector('.user-menu');
    
    if (userMenu) {
        userMenu.addEventListener('click', function() {
            // In a real app, this would show a user menu
            showNotification('Funcionalidad de menú de usuario en desarrollo', 'info');
        });
    }
}

function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Set icon based on type
    let icon = 'fa-info-circle';
    if (type === 'success') {
        icon = 'fa-check-circle';
    } else if (type === 'error') {
        icon = 'fa-exclamation-circle';
    } else if (type === 'warning') {
        icon = 'fa-exclamation-triangle';
    }
    
    // Set content
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas ${icon}"></i>
        </div>
        <div class="notification-message">${message}</div>
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Remove after delay
    setTimeout(function() {
        notification.classList.add('fade-out');
        
        setTimeout(function() {
            notification.remove();
        }, 300);
    }, 3000);
}