// Utilidades
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function findFolder(folderName, folderList = folders) {
    for (let folder of folderList) {
        if (folder.name === folderName) return folder;
        if (folder.children) {
            const found = findFolder(folderName, folder.children);
            if (found) return found;
        }
    }
    return null;
}

// Datos para la estructura de carpetas - Optimizado para no crear nuevas fechas repetidamente
const DATES = {
    feb15: new Date('2023-02-15'),
    feb16: new Date('2023-02-16'),
    feb17: new Date('2023-02-17'),
    feb18: new Date('2023-02-18'),
    jan10: new Date('2023-01-10')
};

const folderStructure = [
    {
        name: "Docencia",
        type: "folder",
        icon: "fas fa-chalkboard-teacher",
        fileCount: 0,
        createdAt: DATES.feb15,
        children: [
            {
                name: "Programas Académicos",
                type: "folder",
                icon: "fas fa-book",
                fileCount: 0,
                createdAt: DATES.feb16,
                children: []
            },
            {
                name: "Material Didáctico",
                type: "folder",
                icon: "fas fa-file-alt",
                fileCount: 0,
                createdAt: DATES.feb16,
                children: []
            },
            {
                name: "Evaluaciones",
                type: "folder",
                icon: "fas fa-tasks",
                fileCount: 0,
                createdAt: DATES.feb16,
                children: []
            }
        ]
    },
    {
        name: "Investigación",
        type: "folder",
        icon: "fas fa-flask",
        fileCount: 0,
        createdAt: DATES.feb15,
        children: [
            {
                name: "Proyectos Actuales",
                type: "folder",
                icon: "fas fa-project-diagram",
                fileCount: 0,
                createdAt: DATES.feb16,
                children: []
            },
            {
                name: "Publicaciones",
                type: "folder",
                icon: "fas fa-file-alt",
                fileCount: 0,
                createdAt: DATES.feb16,
                children: []
            },
            {
                name: "Colaboraciones",
                type: "folder",
                icon: "fas fa-users",
                fileCount: 0,
                createdAt: DATES.feb16,
                children: []
            }
        ]
    },
    {
        name: "Extensión",
        type: "folder",
        icon: "fas fa-users",
        fileCount: 0,
        createdAt: DATES.feb15,
        children: [
            {
                name: "Proyectos Comunitarios",
                type: "folder",
                icon: "fas fa-hands-helping",
                fileCount: 0,
                createdAt: DATES.feb16,
                children: []
            },
            {
                name: "Eventos",
                type: "folder",
                icon: "fas fa-calendar-alt",
                fileCount: 0,
                createdAt: DATES.feb16,
                children: []
            },
            {
                name: "Convenios",
                type: "folder",
                icon: "fas fa-handshake",
                fileCount: 0,
                createdAt: DATES.feb16,
                children: []
            }
        ]
    }
];

document.addEventListener('DOMContentLoaded', () => {
    // Cache DOM selectors - Mejora la eficiencia al evitar búsquedas repetidas en el DOM
    const DOM = {
        menuToggle: document.getElementById('menuToggle'),
        sidebar: document.querySelector('.sidebar'),
        closeSidebar: document.querySelector('.close-sidebar'),
        explorerContent: document.getElementById('explorer-content'),
        folderItems: document.querySelectorAll('.folder-item'),
        breadcrumb: document.querySelector('.breadcrumb'),
        explorerSearch: document.querySelector('.explorer-search input'),
        sortButton: document.querySelector('.explorer-actions .action-btn'),
        createFolderBtn: document.getElementById('createFolderBtn'),
        createFolderDialog: document.getElementById('createFolderDialog'),
        closeFolderDialog: document.getElementById('closeFolderDialog'),
        cancelFolder: document.getElementById('cancelFolder'),
        confirmFolder: document.getElementById('confirmFolder'),
        folderNameInput: document.getElementById('folderName'),
        uploadBtn: document.getElementById('uploadBtn'),
        uploadProgress: document.getElementById('uploadProgress'),
        notificationToggle: document.getElementById('notification-toggle'),
        notificationPanel: document.getElementById('notification-panel'),
        notificationList: document.getElementById('notification-list'),
        markAllRead: document.querySelector('.mark-all-read')
    };

    // Sidebar Toggle
    DOM.menuToggle.addEventListener('click', () => {
        DOM.sidebar.classList.toggle('open');
    });

    // Convertir a PDF
    const refreshBtn = document.getElementById('refreshBtn');
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.txt,.doc,.docx,.xls,.xlsx';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);

    refreshBtn.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', async (e) => {
        if (!e.target.files.length) return;

        const file = e.target.files[0];
        const fileType = file.name.split('.').pop().toLowerCase();

        // Crear FormData y agregar el archivo
        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileType', fileType);

        try {
            showNotification('Convirtiendo archivo...', 'info');

            const response = await fetch('http://localhost:5000/api/convert-to-pdf', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                // Crear un enlace temporal para descargar el PDF
                const downloadLink = document.createElement('a');
                downloadLink.href = data.pdfUrl;
                downloadLink.download = data.filename;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);

                showNotification('Archivo convertido exitosamente', 'success');
            } else {
                throw new Error(data.error || 'Error al convertir el archivo');
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification(error.message || 'Error al convertir el archivo', 'error');
        }

        // Limpiar el input
        fileInput.value = '';
    });

    DOM.closeSidebar.addEventListener('click', () => {
        DOM.sidebar.classList.remove('open');
    });

    // Función para crear elemento de carpeta
    function createFolderElement(folder) {
        const folderElement = document.createElement('div');
        folderElement.className = 'folder-item';
        folderElement.dataset.name = folder.name;
        
        folderElement.innerHTML = `
            <div class="folder-icon"><i class="${folder.icon}"></i></div>
            <div class="folder-details">
                <div class="folder-name">${folder.name}</div>
                <div class="file-meta">${folder.fileCount} elementos</div>
            </div>
        `;
        
        // Agregar evento de click para navegar a las subcarpetas
        folderElement.addEventListener('click', function() {
            navigateToFolder(folder);
        });
        
        return folderElement;
    }
    
    // Función para navegar a una carpeta
    function navigateToFolder(folder) {
        // Actualizar breadcrumb
        updateBreadcrumb(folder.name);
        
        // Limpiar el contenedor
        DOM.explorerContent.innerHTML = '';
        
        // Si tiene subcarpetas, mostrarlas
        if (folder.children && folder.children.length > 0) {
            // Crear un fragmento para mejorar el rendimiento al agregar múltiples elementos
            const fragment = document.createDocumentFragment();
            folder.children.forEach(child => {
                fragment.appendChild(createFolderElement(child));
            });
            DOM.explorerContent.appendChild(fragment);
        } else {
            // Mostrar mensaje de carpeta vacía
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-folder-message';
            emptyMessage.textContent = 'Esta carpeta está vacía';
            emptyMessage.style.gridColumn = '1 / -1';
            emptyMessage.style.textAlign = 'center';
            emptyMessage.style.padding = '50px 0';
            emptyMessage.style.color = 'var(--text-secondary)';
            DOM.explorerContent.appendChild(emptyMessage);
        }
    }
    
    // Función para actualizar la navegación de breadcrumb
    function updateBreadcrumb(folderName) {
        // Si es una subcarpeta, mostrar la ruta completa
        if (folderName) {
            DOM.breadcrumb.innerHTML = `
                <span class="breadcrumb-item" data-path="home">Inicio</span>
                <span class="separator">/</span>
                <span class="breadcrumb-item" data-path="my-documents">Mis documentos</span>
                <span class="separator">/</span>
                <span class="breadcrumb-item active">${folderName}</span>
            `;
        } else {
            // Si es la raíz, mostrar solo Inicio / Mis documentos
            DOM.breadcrumb.innerHTML = `
                <span class="breadcrumb-item" data-path="home">Inicio</span>
                <span class="separator">/</span>
                <span class="breadcrumb-item active">Mis documentos</span>
            `;
        }
    }

    // Initialize theme toggle functionality from common.js
    document.addEventListener('DOMContentLoaded', () => {
        initializeThemeToggle();
    });

    // Submenu Toggle - Delegación de eventos para mejor rendimiento
    document.querySelector('.nav-menu').addEventListener('click', (e) => {
        if (e.target.closest('.menu-item')) {
            const item = e.target.closest('.menu-item');
            const submenu = item.nextElementSibling;
            if (submenu && submenu.classList.contains('submenu')) {
                submenu.classList.toggle('open');
                const chevron = item.querySelector('.submenu-toggle i');
                chevron.classList.toggle('fa-chevron-right');
                chevron.classList.toggle('fa-chevron-down');
            }
        }
    });

    // File Explorer Enhanced Functionality
    class FileExplorer {
        constructor() {
            this.items = [];
            this.contextMenu = null;
            this.currentPath = ['Inicio'];
            this.rootItems = []; // Store the initial root items
            this.sortOptions = [
                { name: 'Nombre (A-Z)', method: this.sortByName },
                { name: 'Nombre (Z-A)', method: this.sortByNameReverse },
                { name: 'Fecha de creación (más reciente)', method: this.sortByNewest },
                { name: 'Fecha de creación (más antigua)', method: this.sortByOldest },
                { name: 'Tamaño (mayor a menor)', method: this.sortBySizeDescending },
                { name: 'Cantidad de archivos', method: this.sortByFileCount }
            ];
            
            // Memorización para evitar cálculos repetidos
            this.fileIconCache = {};
        }

        // Sorting methods
        sortByName(a, b) {
            return a.name.localeCompare(b.name);
        }

        sortByNameReverse(a, b) {
            return b.name.localeCompare(a.name);
        }

        sortByNewest(a, b) {
            return new Date(b.createdAt) - new Date(a.createdAt);
        }

        sortByOldest(a, b) {
            return new Date(a.createdAt) - new Date(b.createdAt);
        }

        sortBySizeDescending(a, b) {
            return b.size - a.size;
        }

        sortByFileCount(a, b) {
            return b.fileCount - a.fileCount;
        }

        // Render items
        renderItems(items) {
            // Usar un fragmento de documento para mejor rendimiento
            const fragment = document.createDocumentFragment();
            
            DOM.explorerContent.innerHTML = '';
            items.forEach(item => {
                const itemElement = this.createItemElement(item);
                fragment.appendChild(itemElement);
            });
            
            DOM.explorerContent.appendChild(fragment);
        }

        createItemElement(item) {
            const itemElement = document.createElement('div');
            itemElement.classList.add(item.type === 'folder' ? 'folder-item' : 'file-item');
            
            const iconClass = item.type === 'folder' 
                ? 'fas fa-folder' 
                : this.getFileIcon(item.extension);
            
            itemElement.innerHTML = `
                <div class="${item.type}-icon">
                    <i class="${iconClass}"></i>
                </div>
                <div class="${item.type}-details">
                    <div class="${item.type}-name">${item.name}</div>
                    <div class="file-meta">
                        ${item.type === 'folder' 
                            ? `${item.fileCount} elementos` 
                            : `${item.extension.toUpperCase()} • ${(item.size / 1024).toFixed(1)} KB`}
                    </div>
                </div>
            `;

            // Usar eventos delegados para evitar múltiples listeners
            itemElement.dataset.itemName = item.name;
            itemElement.dataset.itemType = item.type;
            if (item.type === 'file') {
                itemElement.dataset.extension = item.extension;
                itemElement.dataset.size = item.size;
            }

            // Remove previous action buttons and add context menu
            itemElement.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.showContextMenu(e, item);
            });

            itemElement.addEventListener('click', () => this.handleItemClick(item));
            return itemElement;
        }

        showContextMenu(event, item) {
            // Remove any existing context menu
            if (this.contextMenu) {
                this.contextMenu.remove();
            }

            // Create context menu
            this.contextMenu = document.createElement('div');
            this.contextMenu.classList.add('context-menu');
            
            // Context menu items based on item type
            const menuItems = [
                { 
                    label: 'Vista previa', 
                    icon: 'fas fa-eye', 
                    action: () => this.previewItem(item) 
                },
                { 
                    label: 'Renombrar', 
                    icon: 'fas fa-edit', 
                    action: () => this.renameItem(item) 
                },
                { 
                    label: 'Eliminar', 
                    icon: 'fas fa-trash', 
                    action: () => this.deleteItem(item) 
                }
            ];

            // Render menu items
            this.contextMenu.innerHTML = menuItems.map(menuItem => `
                <div class="context-menu-item">
                    <i class="${menuItem.icon} context-menu-icon"></i>
                    ${menuItem.label}
                </div>
            `).join('');

            // Position the context menu
            this.contextMenu.style.position = 'fixed';
            this.contextMenu.style.top = `${event.clientY}px`;
            this.contextMenu.style.left = `${event.clientX}px`;

            // Add event listeners to menu items - Delegación de eventos
            this.contextMenu.addEventListener('click', (e) => {
                const menuItem = e.target.closest('.context-menu-item');
                if (menuItem) {
                    const index = Array.from(this.contextMenu.children).indexOf(menuItem);
                    if (index !== -1) {
                        menuItems[index].action();
                        this.removeContextMenu();
                    }
                }
            });

            // Append to body
            document.body.appendChild(this.contextMenu);

            // Remove context menu when clicking outside
            const removeContextMenu = (e) => {
                if (this.contextMenu && !this.contextMenu.contains(e.target)) {
                    this.removeContextMenu();
                    document.removeEventListener('click', removeContextMenu);
                }
            };
            document.addEventListener('click', removeContextMenu);
        }

        removeContextMenu() {
            if (this.contextMenu) {
                this.contextMenu.remove();
                this.contextMenu = null;
            }
        }

        getFileIcon(extension) {
            // Uso de caché para no repetir la lógica de switch
            if (!extension) return 'fas fa-file-alt';
            
            if (this.fileIconCache[extension]) {
                return this.fileIconCache[extension];
            }
            
            let icon;
            switch(extension.toLowerCase()) {
                case 'pdf': icon = 'fas fa-file-pdf'; break;
                case 'docx':
                case 'doc': icon = 'fas fa-file-word'; break;
                case 'xlsx':
                case 'xls': icon = 'fas fa-file-excel'; break;
                case 'pptx':
                case 'ppt': icon = 'fas fa-file-powerpoint'; break;
                case 'png':
                case 'jpg':
                case 'jpeg':
                case 'gif': icon = 'fas fa-file-image'; break;
                default: icon = 'fas fa-file-alt'; break;
            }
            
            this.fileIconCache[extension] = icon;
            return icon;
        }

        handleItemClick(item) {
            if (item.type === 'folder') {
                this.navigateToFolder(item);
            } else {
                this.openFile(item);
            }
        }

        navigateToFolder(folder) {
            this.currentPath.push(folder.name);
            this.updateBreadcrumb();
            
            // Simulated folder contents (would be fetched from backend in real scenario)
            const simulatedFolderContents = [
                { 
                    name: 'Documento ejemplo.pdf', 
                    type: 'file',
                    extension: 'pdf', 
                    size: 2400, 
                    createdAt: new Date('2023-01-15') 
                },
                { 
                    name: 'Presentación.pptx', 
                    type: 'file', 
                    extension: 'pptx', 
                    size: 5200, 
                    createdAt: new Date('2023-02-20') 
                }
            ];

            this.renderItems(simulatedFolderContents);
        }

        updateBreadcrumb() {
            DOM.breadcrumb.innerHTML = this.currentPath.map((pathItem, index) => `
                <span${index === this.currentPath.length - 1 ? ' class="current"' : ''} 
                      data-index="${index}"
                      class="breadcrumb-item">
                    ${pathItem}
                </span>
                ${index < this.currentPath.length - 1 ? '<span class="separator">/</span>' : ''}
            `).join('');

            // Add click event to breadcrumb items for navigation - Delegación de eventos
            DOM.breadcrumb.addEventListener('click', (e) => {
                const breadcrumbItem = e.target.closest('.breadcrumb-item');
                if (breadcrumbItem) {
                    const index = parseInt(breadcrumbItem.dataset.index);
                    if (!isNaN(index)) {
                        this.navigateToBreadcrumbIndex(index);
                    }
                }
            });
        }

        navigateToBreadcrumbIndex(index) {
            // Trim the current path to the selected index
            this.currentPath = this.currentPath.slice(0, index + 1);
            this.updateBreadcrumb();

            // Render items based on the navigation level
            if (index === 0) {
                // Return to root
                this.renderItems(this.rootItems);
            } else {
                // Simulate navigating to a specific folder
                const simulatedFolderContents = [
                    { 
                        name: 'Documento ejemplo.pdf', 
                        type: 'file', 
                        extension: 'pdf', 
                        size: 2400, 
                        createdAt: new Date('2023-01-15') 
                    }
                ];
                this.renderItems(simulatedFolderContents);
            }
        }

        openFile(file) {
            // Implement file preview logic
            console.log('Opening file:', file);
        }

        previewItem(item) {
            const filePreview = document.getElementById('filePreview');
            const previewTitle = document.getElementById('previewTitle');
            const previewInfo = document.getElementById('previewInfo');
            const previewImg = document.getElementById('previewImg');
            const closePreview = document.getElementById('closePreview');

            previewTitle.textContent = item.name;
            previewInfo.textContent = `${item.extension.toUpperCase()} • ${(item.size / 1024).toFixed(1)} KB • Subido el ${item.createdAt.toLocaleDateString()}`;
            
            // Show preview based on file type
            if (['jpg', 'jpeg', 'png', 'gif'].includes(item.extension.toLowerCase())) {
                // For images, show the image preview
                previewImg.src = `path/to/images/${item.name}`; // Replace with actual path
                previewImg.style.display = 'block';
            } else {
                // For other file types, hide the image preview
                previewImg.style.display = 'none';
            }
            
            // Show the preview modal
            filePreview.style.opacity = '1';
            filePreview.style.pointerEvents = 'auto';
            
            // Close preview when close button is clicked
            closePreview.addEventListener('click', () => {
                filePreview.style.opacity = '0';
                filePreview.style.pointerEvents = 'none';
            });
        }
        
        deleteItem(item) {
            if (confirm(`¿Estás seguro de que deseas eliminar "${item.name}"?`)) {
                // In a real implementation, this would send a delete request to the backend
                console.log(`Deleting ${item.type}: ${item.name}`);
                
                // Remove the item from the current display
                this.items = this.items.filter(i => i.name !== item.name);
                this.renderItems(this.items);
            }
        }
        
        renameItem(item) {
            const newName = prompt(`Renombrar ${item.type === 'folder' ? 'carpeta' : 'archivo'}:`, item.name);
            if (newName && newName.trim() !== '') {
                // In a real implementation, this would send a rename request to the backend
                console.log(`Renaming ${item.type} from "${item.name}" to "${newName}"`);
                
                // Update the item name in the current display
                const itemToUpdate = this.items.find(i => i.name === item.name);
                if (itemToUpdate) {
                    itemToUpdate.name = newName;
                    this.renderItems(this.items);
                }
            }
        }

        searchItems(query) {
            const filteredItems = this.items.filter(item => 
                item.name.toLowerCase().includes(query.toLowerCase())
            );
            this.renderItems(filteredItems);
        }

        showSortOptions() {
            const sortMenu = document.createElement('div');
            sortMenu.classList.add('context-menu');
            sortMenu.innerHTML = this.sortOptions.map(option => 
                `<div class="context-menu-item">${option.name}</div>`
            ).join('');
            
            document.body.appendChild(sortMenu);
            
            // Position the menu near the sort button
            const buttonRect = DOM.sortButton.getBoundingClientRect();
            sortMenu.style.top = `${buttonRect.bottom + window.scrollY}px`;
            sortMenu.style.left = `${buttonRect.left + window.scrollX}px`;
            
            // Add event listeners to menu items - Delegación de eventos
            sortMenu.addEventListener('click', (e) => {
                const menuItem = e.target.closest('.context-menu-item');
                if (menuItem) {
                    const index = Array.from(sortMenu.children).indexOf(menuItem);
                    if (index !== -1) {
                        this.items.sort(this.sortOptions[index].method.bind(this));
                        this.renderItems(this.items);
                        sortMenu.remove();
                    }
                }
            });
            
            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!sortMenu.contains(e.target) && e.target !== DOM.sortButton) {
                    sortMenu.remove();
                }
            }, { once: true });
        }
    }

    // Initialize file explorer
    const fileExplorer = new FileExplorer();
    
    // Initial data (would be fetched from backend in real scenario) - Optimizado para reutilizar fechas
    fileExplorer.items = [
        { 
            name: 'Docencia', 
            type: 'folder', 
            fileCount: 3, 
            createdAt: DATES.jan10
        },
        { 
            name: 'Investigación', 
            type: 'folder', 
            fileCount: 3, 
            createdAt: DATES.feb15
        },
        { 
            name: 'Extensión', 
            type: 'folder', 
            fileCount: 3, 
            createdAt: DATES.feb15
        },
        { 
            name: 'Artículos Científicos', 
            type: 'folder', 
            fileCount: 3, 
            createdAt: DATES.feb15
        },
        { 
            name: 'Tutorías', 
            type: 'folder', 
            fileCount: 3, 
            createdAt: DATES.feb15
        },
        {
            name: 'Gestión',
            type: 'folder',
            fileCount: 3,
            createdAt: DATES.feb15,
        }
    ];
    
    // Store root items for navigation
    fileExplorer.rootItems = [...fileExplorer.items];
    
    // Render initial items
    fileExplorer.renderItems(fileExplorer.items);
    
    // Update breadcrumb
    fileExplorer.updateBreadcrumb();
    
    // Set up event listeners
    if (DOM.explorerSearch) {
        // Evitar muchas búsquedas mientras escribe (debounce)
        let searchTimeout;
        DOM.explorerSearch.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                fileExplorer.searchItems(e.target.value);
            }, 300);
        });
    }
    
    if (DOM.sortButton) {
        DOM.sortButton.addEventListener('click', () => {
            fileExplorer.showSortOptions();
        });
    }

    // Create Folder Dialog
    DOM.createFolderBtn.addEventListener('click', () => {
        DOM.createFolderDialog.style.display = 'flex';
    });

    [DOM.closeFolderDialog, DOM.cancelFolder].forEach(el => {
        el.addEventListener('click', () => {
            DOM.createFolderDialog.style.display = 'none';
            DOM.folderNameInput.value = '';
        });
    });

    DOM.confirmFolder.addEventListener('click', () => {
        const folderName = DOM.folderNameInput.value.trim();
        if (folderName) {
            const newFolder = {
                name: folderName,
                type: 'folder',
                fileCount: 0,
                createdAt: new Date()
            };
            fileExplorer.items.push(newFolder);
            fileExplorer.renderItems(fileExplorer.items);
            DOM.createFolderDialog.style.display = 'none';
            DOM.folderNameInput.value = '';
        }
    });

    // File Upload Functionality
    DOM.uploadBtn.addEventListener('click', () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.multiple = true;
        fileInput.addEventListener('change', handleFileUpload);
        fileInput.click();
    });

    function handleFileUpload(event) {
        const files = event.target.files;
        if (files.length > 0) {
            DOM.uploadProgress.style.display = 'block';
            
            // Simulate upload progress
            let progress = 0;
            const progressBar = DOM.uploadProgress.querySelector('.progress-fill');
            const progressText = DOM.uploadProgress.querySelector('.upload-percentage');
            
            const uploadInterval = setInterval(() => {
                progress += 10;
                progressBar.style.width = `${progress}%`;
                progressText.textContent = `${progress}%`;
                
                if (progress >= 100) {
                    clearInterval(uploadInterval);
                    setTimeout(() => {
                        DOM.uploadProgress.style.display = 'none';
                        addUploadedFilesToExplorer(files);
                    }, 500);
                }
            }, 200);
        }
    }

    function addUploadedFilesToExplorer(files) {
        // Crear todos los archivos a la vez usando un fragmento
        const newFiles = [];
        for (let file of files) {
            const ext = file.name.split('.').pop().toLowerCase();
            const newFile = {
                name: file.name,
                type: 'file',
                extension: ext,
                size: file.size,
                createdAt: new Date()
            };
            newFiles.push(newFile);
        }
        
        fileExplorer.items = fileExplorer.items.concat(newFiles);
        fileExplorer.renderItems(fileExplorer.items);
    }

    // Notification Functionality
    DOM.notificationToggle.addEventListener('click', () => {
        DOM.notificationPanel.classList.toggle('open');
    });

    // Mock notification data
    const notifications = [
        { title: 'Nueva tarea asignada', description: 'Revisión de artículo de investigación', time: 'Hace 10 min' },
        { title: 'Reunión programada', description: 'Reunión de departamento a las 2 PM', time: 'Hace 30 min' },
        { title: 'Archivo compartido', description: 'Dr. María García compartió un documento', time: 'Hace 1 hora' }
    ];

    function loadNotifications() {
        // Crear todas las notificaciones a la vez usando un fragmento
        const fragment = document.createDocumentFragment();
        
        const notificationsHTML = notifications.map(notification => {
            const notifItem = document.createElement('div');
            notifItem.className = 'notification-item';
            notifItem.innerHTML = `
                <div class="notification-content">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-description">${notification.description}</div>
                    <div class="notification-time">${notification.time}</div>
                </div>
                <button class="mark-read">Marcar como leído</button>
            `;
            return notifItem;
        });
        
        notificationsHTML.forEach(el => fragment.appendChild(el));
        DOM.notificationList.innerHTML = '';
        DOM.notificationList.appendChild(fragment);

        // Usar delegación de eventos para mejorar rendimiento
        DOM.notificationList.addEventListener('click', (e) => {
            if (e.target.classList.contains('mark-read')) {
                e.target.closest('.notification-item').remove();
                updateNotificationCount();
            }
        });
    }

    DOM.markAllRead.addEventListener('click', () => {
        DOM.notificationList.innerHTML = '';
        updateNotificationCount();
    });

    function updateNotificationCount() {
        const notificationCount = document.getElementById('notification-count');
        const remainingNotifications = DOM.notificationList.children.length;
        notificationCount.textContent = remainingNotifications;
    }

    // Initial load of notifications
    loadNotifications();
});