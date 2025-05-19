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

            // Agregar eventos de arrastrar y soltar
            if (item.type === 'file') {
                itemElement.setAttribute('draggable', true);
                itemElement.addEventListener('dragstart', (e) => this.handleDragStart(e, item));
            }

            if (item.type === 'folder') {
                itemElement.addEventListener('dragover', (e) => this.handleDragOver(e));
                itemElement.addEventListener('drop', (e) => this.handleDrop(e, item));
            }

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
            fileCount: 2, 
            createdAt: DATES.jan10
        },
        { 
            name: 'Investigación', 
            type: 'folder', 
            fileCount: 2, 
            createdAt: DATES.feb15
        },
        { 
            name: 'Extensión', 
            type: 'folder', 
            fileCount: 2, 
            createdAt: DATES.feb15
        },
        { 
            name: 'Artículos Científicos', 
            type: 'folder', 
            fileCount: 2, 
            createdAt: DATES.feb15
        },
        { 
            name: 'Tutorías', 
            type: 'folder', 
            fileCount: 2, 
            createdAt: DATES.feb15
        },
        {
            name: 'Gestión',
            type: 'folder',
            fileCount: 2,
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
    
    // Primero necesitamos cargar la biblioteca jsPDF desde CDN
function loadJsPDF() {
    return new Promise((resolve, reject) => {
        // Verificar si jsPDF ya está cargado
        if (window.jspdf && window.jspdf.jsPDF) {
            resolve(window.jspdf.jsPDF);
            return;
        }

        // Cargar el script de jsPDF
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script.onload = () => resolve(window.jspdf.jsPDF);
        script.onerror = () => reject(new Error('No se pudo cargar jsPDF'));
        document.head.appendChild(script);
    });
}

// También necesitamos html2canvas para capturar contenido HTML
function loadHtml2Canvas() {
    return new Promise((resolve, reject) => {
        // Verificar si html2canvas ya está cargado
        if (window.html2canvas) {
            resolve(window.html2canvas);
            return;
        }

        // Cargar el script de html2canvas
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        script.onload = () => resolve(window.html2canvas);
        script.onerror = () => reject(new Error('No se pudo cargar html2canvas'));
        document.head.appendChild(script);
    });
}

    // Clase principal para el convertidor a PDF
    class PDFConverter {
        constructor() {
            this.selectedFiles = [];
            this.jsPDF = null;
            this.html2canvas = null;
            this.init();
        }

        async init() {
            try {
                // Cargar las bibliotecas necesarias
                this.jsPDF = await loadJsPDF();
                this.html2canvas = await loadHtml2Canvas();
                
                // Inicializar los botones
                this.initButtons();
                
                console.log('PDF Converter inicializado correctamente');
            } catch (error) {
                console.error('Error al inicializar PDF Converter:', error);
                this.showNotification('Error al cargar las herramientas de conversión', 'error');
            }
        }

        initButtons() {
            // Botón de Convertir a PDF
            const convertBtn = document.getElementById('refreshBtn'); // Usando el botón existente
            if (convertBtn) {
                convertBtn.innerHTML = '<i class="fas fa-file-pdf"></i> Convertir a PDF';
                convertBtn.addEventListener('click', () => this.showConvertDialog());
            }

            // Agregar funcionalidad para seleccionar archivos
            document.addEventListener('click', (e) => {
                if (e.target.closest('.file-item')) {
                    const fileItem = e.target.closest('.file-item');
                    this.toggleFileSelection(fileItem);
                }
            });
        }

        toggleFileSelection(fileItem) {
            const fileId = fileItem.dataset.id;
            const fileName = fileItem.querySelector('.file-name').textContent;
            
            if (fileItem.classList.contains('selected')) {
                fileItem.classList.remove('selected');
                this.selectedFiles = this.selectedFiles.filter(file => file.id !== fileId);
            } else {
                fileItem.classList.add('selected');
                this.selectedFiles.push({
                    id: fileId,
                    name: fileName,
                    element: fileItem
                });
            }
        }

        showConvertDialog() {
            // Si no hay archivos seleccionados, mostrar mensaje
            if (this.selectedFiles.length === 0) {
                // Verificar si hay algún archivo en el explorador
                const files = document.querySelectorAll('.file-item:not(.folder-item)');
                
                if (files.length === 0) {
                    this.showNotification('No hay archivos disponibles para convertir', 'warning');
                    return;
                } else {
                    this.showNotification('Seleccione al menos un archivo para convertir', 'info');
                    return;
                }
            }

            // Crear y mostrar el diálogo
            const dialogHTML = `
                <div class="dialog-overlay" id="convertDialog">
                    <div class="dialog">
                        <div class="dialog-header">
                            <h3>Convertir a PDF</h3>
                            <button class="close-dialog" id="closeConvertDialog"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="dialog-content">
                            <p>Se convertirán ${this.selectedFiles.length} archivo(s) a formato PDF.</p>
                            <div class="selected-files-list">
                                ${this.selectedFiles.map(file => `
                                    <div class="selected-file">
                                        <i class="fas fa-file"></i>
                                        <span>${file.name}</span>
                                    </div>
                                `).join('')}
                            </div>
                            <div class="form-group">
                                <label for="pdfFileName">Nombre del archivo PDF resultante</label>
                                <input type="text" id="pdfFileName" placeholder="documento_convertido" value="documento_convertido">
                            </div>
                        </div>
                        <div class="dialog-footer">
                            <button class="cancel-btn" id="cancelConvert">Cancelar</button>
                            <button class="create-btn" id="confirmConvert">Convertir</button>
                        </div>
                    </div>
                </div>
            `;

            // Insertar el diálogo en el DOM
            const dialogContainer = document.createElement('div');
            dialogContainer.innerHTML = dialogHTML;
            document.body.appendChild(dialogContainer.firstElementChild);

            // Configurar eventos
            document.getElementById('closeConvertDialog').addEventListener('click', () => this.closeConvertDialog());
            document.getElementById('cancelConvert').addEventListener('click', () => this.closeConvertDialog());
            document.getElementById('confirmConvert').addEventListener('click', () => this.convertToPDF());
        }

        closeConvertDialog() {
            const dialog = document.getElementById('convertDialog');
            if (dialog) {
                dialog.remove();
            }
        }

        async convertToPDF() {
            // Obtener el nombre del archivo
            const pdfFileName = document.getElementById('pdfFileName').value || 'documento_convertido';
            
            try {
                // Mostrar progreso
                this.showProgressBar();
                
                // Crear un nuevo documento PDF
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4'
                });

                let currentPage = 1;
                
                // Convertir cada archivo seleccionado
                for (let i = 0; i < this.selectedFiles.length; i++) {
                    const file = this.selectedFiles[i];
                    
                    // Actualizar la barra de progreso
                    this.updateProgress((i / this.selectedFiles.length) * 100);
                    
                    // Para esta demo, simulamos contenido diferente según el tipo de archivo
                    // En una implementación real, se procesaría el archivo según su formato
                    const fileElement = file.element;
                    const fileType = this.getFileType(file.name);
                    
                    if (i > 0) {
                        pdf.addPage();
                        currentPage++;
                    }

                    // Agregar encabezado con el nombre del archivo
                    pdf.setFont('helvetica', 'bold');
                    pdf.setFontSize(16);
                    pdf.text(file.name, 20, 20);
                    
                    // Agregar contenido según el tipo de archivo
                    pdf.setFont('helvetica', 'normal');
                    pdf.setFontSize(12);
                    
                    if (fileType === 'txt' || fileType === 'doc' || fileType === 'docx') {
                        // Simular texto para documentos de texto
                        pdf.text('Contenido del documento: ' + file.name, 20, 30);
                        
                        // Simular párrafos
                        let yPos = 40;
                        for (let p = 0; p < 5; p++) {
                            pdf.text('Párrafo ' + (p + 1) + ': Este es un texto de ejemplo para el documento ' + file.name, 20, yPos);
                            yPos += 10;
                        }
                    } else if (fileType === 'jpg' || fileType === 'png' || fileType === 'jpeg') {
                        // Para imágenes, podríamos capturar el elemento y convertirlo
                        pdf.text('Imagen: ' + file.name, 20, 30);
                        
                        // En un caso real, se cargaría la imagen y se agregaría al PDF
                        pdf.text('(Contenido de imagen convertido a PDF)', 20, 40);
                    } else {
                        // Para otros tipos de archivos
                        pdf.text('Archivo: ' + file.name, 20, 30);
                        pdf.text('Tipo: ' + fileType, 20, 40);
                        pdf.text('(Contenido convertido a PDF)', 20, 50);
                    }
                    
                    // Agregar número de página
                    pdf.setFontSize(10);
                    pdf.text('Página ' + currentPage, pdf.internal.pageSize.getWidth() - 40, pdf.internal.pageSize.getHeight() - 10);
                }
                
                // Actualizar la barra de progreso al 100%
                this.updateProgress(100);
                
                // Guardar el PDF
                setTimeout(() => {
                    pdf.save(pdfFileName + '.pdf');
                    
                    // Mostrar notificación de éxito
                    this.hideProgressBar();
                    this.showNotification('Conversión a PDF completada con éxito', 'success');
                    
                    // Cerrar el diálogo
                    this.closeConvertDialog();
                    
                    // Deseleccionar los archivos
                    this.deselectAllFiles();
                }, 500);
                
            } catch (error) {
                console.error('Error al convertir a PDF:', error);
                this.hideProgressBar();
                this.showNotification('Error al convertir a PDF', 'error');
            }
        }

        showProgressBar() {
            // Crear la barra de progreso si no existe
            if (!document.getElementById('pdfConversionProgress')) {
                const progressHTML = `
                    <div class="upload-container" id="pdfConversionProgress">
                        <div class="upload-progress">
                            <div class="upload-file-info">
                                <i class="fas fa-file-pdf"></i>
                                <span>Convirtiendo a PDF...</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" id="pdfProgressFill" style="width: 0%;"></div>
                            </div>
                            <div class="upload-percentage" id="pdfProgressPercentage">0%</div>
                        </div>
                    </div>
                `;
                
                const progressContainer = document.createElement('div');
                progressContainer.innerHTML = progressHTML;
                document.body.appendChild(progressContainer.firstElementChild);
            }
            
            // Mostrar la barra de progreso
            document.getElementById('pdfConversionProgress').style.display = 'block';
        }

        updateProgress(percentage) {
            const fill = document.getElementById('pdfProgressFill');
            const text = document.getElementById('pdfProgressPercentage');
            
            if (fill && text) {
                const roundedPercentage = Math.round(percentage);
                fill.style.width = roundedPercentage + '%';
                text.textContent = roundedPercentage + '%';
            }
        }

        hideProgressBar() {
            const progressBar = document.getElementById('pdfConversionProgress');
            if (progressBar) {
                setTimeout(() => {
                    progressBar.remove();
                }, 1000);
            }
        }

        showNotification(message, type = 'info') {
            // Crear un sistema de notificaciones si no existe en la aplicación
            if (!document.getElementById('notification-system')) {
                const notifContainer = document.createElement('div');
                notifContainer.id = 'notification-system';
                notifContainer.style.position = 'fixed';
                notifContainer.style.top = '20px';
                notifContainer.style.right = '20px';
                notifContainer.style.zIndex = '9999';
                document.body.appendChild(notifContainer);
            }
            
            // Crear la notificación
            const notif = document.createElement('div');
            notif.className = `notification notification-${type}`;
            notif.innerHTML = `
                <div class="notification-icon">
                    <i class="fas ${this.getIconForType(type)}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-message">${message}</div>
                </div>
                <button class="notification-close">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            // Estilar la notificación
            notif.style.display = 'flex';
            notif.style.alignItems = 'center';
            notif.style.backgroundColor = this.getColorForType(type);
            notif.style.color = '#fff';
            notif.style.borderRadius = '5px';
            notif.style.padding = '10px 15px';
            notif.style.marginBottom = '10px';
            notif.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
            notif.style.transition = 'all 0.3s ease';
            notif.style.opacity = '0';
            
            // Agregar la notificación al contenedor
            document.getElementById('notification-system').appendChild(notif);
            
            // Mostrar la notificación con una animación
            setTimeout(() => {
                notif.style.opacity = '1';
            }, 10);
            
            // Configurar el botón de cierre
            notif.querySelector('.notification-close').addEventListener('click', () => {
                notif.style.opacity = '0';
                setTimeout(() => {
                    notif.remove();
                }, 300);
            });
            
            // Auto-eliminar después de 5 segundos
            setTimeout(() => {
                notif.style.opacity = '0';
                setTimeout(() => {
                    notif.remove();
                }, 300);
            }, 5000);
        }

        getIconForType(type) {
            switch (type) {
                case 'success': return 'fa-check-circle';
                case 'error': return 'fa-exclamation-circle';
                case 'warning': return 'fa-exclamation-triangle';
                case 'info': 
                default: return 'fa-info-circle';
            }
        }

        getColorForType(type) {
            switch (type) {
                case 'success': return '#28a745';
                case 'error': return '#dc3545';
                case 'warning': return '#ffc107';
                case 'info': 
                default: return '#17a2b8';
            }
        }

        getFileType(fileName) {
            const extension = fileName.split('.').pop().toLowerCase();
            return extension || 'unknown';
        }

        deselectAllFiles() {
            this.selectedFiles.forEach(file => {
                if (file.element) {
                    file.element.classList.remove('selected');
                }
            });
            this.selectedFiles = [];
        }
    }

    // Iniciar el convertidor cuando la página esté lista
    document.addEventListener('DOMContentLoaded', () => {
        window.pdfConverter = new PDFConverter();
        
        // Agregar estilos CSS para la funcionalidad de conversión a PDF
        const style = document.createElement('style');
        style.textContent = `
            .file-item.selected {
                background-color: rgba(0, 123, 255, 0.1);
                border: 1px solid #007bff;
            }
            
            .selected-files-list {
                max-height: 200px;
                overflow-y: auto;
                margin: 15px 0;
                border: 1px solid #eee;
                border-radius: 5px;
                padding: 10px;
            }
            
            .selected-file {
                display: flex;
                align-items: center;
                padding: 5px 0;
                border-bottom: 1px solid #f0f0f0;
            }
            
            .selected-file:last-child {
                border-bottom: none;
            }
            
            .selected-file i {
                margin-right: 10px;
                color: #666;
            }
            
            #notification-system {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
            }
        `;
        document.head.appendChild(style);
    });

    // Función para manejar la carga de archivos
    function handleFileUpload(event) {
        const files = event.target.files;
        if (files.length === 0) return;
        
        // Mostrar indicador de progreso
        DOM.uploadProgress.style.display = 'block';
        
        // Simular progreso de carga (en una aplicación real esto sería parte de la carga real)
        let progress = 0;
        const progressFill = DOM.uploadProgress.querySelector('.progress-fill');
        const progressText = DOM.uploadProgress.querySelector('.upload-percentage');
        
        const progressInterval = setInterval(() => {
            progress += 5;
            progressFill.style.width = `${progress}%`;
            progressText.textContent = `${progress}%`;
            
            if (progress >= 100) {
                clearInterval(progressInterval);
                setTimeout(() => {
                    DOM.uploadProgress.style.display = 'none';
                    
                    // Añadir archivos al explorador
                    addUploadedFilesToExplorer(files);
                    
                    // Verificar si existe la instancia del convertidor PDF
                    if (window.pdfConverter) {
                        // Iniciar el proceso de selección para convertir a PDF si se desea
                        // Puedes mostrar un mensaje o activar alguna funcionalidad aquí
                        console.log('Archivos subidos correctamente. Puede seleccionarlos para convertir a PDF.');
                    }
                }, 500);
            }
        }, 100);
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
    // === Mostrar nombre del usuario logueado y manejar el menú ===
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

if (!token || !user) {
    window.location.href = 'index.html';
}

const userButton = document.getElementById('userButton');
const userDropdown = document.getElementById('userDropdown');
const userDisplayName = document.getElementById('userDisplayName');
const logoutBtn = document.getElementById('logoutBtn');

if (userButton && userDropdown && userDisplayName && logoutBtn) {
    userButton.textContent = `👤 ${user.nombre}`;
    userDisplayName.textContent = `${user.nombre} ${user.apellidos}`;

    userButton.addEventListener('click', () => {
        userDropdown.style.display = userDropdown.style.display === 'block' ? 'none' : 'block';
    });

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    });
}

});