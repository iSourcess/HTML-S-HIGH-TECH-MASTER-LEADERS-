document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const menuToggle = document.getElementById('menuToggle');
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const sidebar = document.getElementById('sidebar');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const overlay = document.getElementById('overlay');
    const submenuToggles = document.querySelectorAll('.toggle-submenu');
    const viewButtons = document.querySelectorAll('.view-btn');
    const explorerContent = document.querySelector('.explorer-content');
    const folderItems = document.querySelectorAll('.folder-item');
    const fileItems = document.querySelectorAll('.file-item');
    const createFolderBtn = document.querySelector('.create-folder-btn');
    const uploadBtn = document.querySelector('.upload-btn');

    // State variables
    let currentPath = ['Mis Documentos'];
    let sidebarOpen = false;
    let isDarkMode = localStorage.getItem('darkMode') === 'true';

    // Initialize theme
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    }

    // Toggle menu dropdown
    menuToggle.addEventListener('click', function() {
        dropdownMenu.classList.toggle('active');
        // Close sidebar if open
        if (sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            document.querySelector('.main-content').classList.remove('sidebar-open');
            sidebarOpen = false;
        }
    });

    // Close dropdown when clicking elsewhere
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.menu-toggle') && !event.target.closest('.dropdown-menu')) {
            dropdownMenu.classList.remove('active');
        }
    });

    // Toggle theme (dark/light mode)
    themeToggle.addEventListener('click', function() {
        isDarkMode = !isDarkMode;
        localStorage.setItem('darkMode', isDarkMode);
        applyTheme(isDarkMode);
    });

    // Toggle sidebar
    document.addEventListener('DOMContentLoaded', function() {
        isDarkMode = localStorage.getItem('darkMode') === 'true';
        applyTheme(isDarkMode);
    });

    function applyTheme(isDarkMode) {
        if (isDarkMode) {
            document.body.classList.add('dark-theme');
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        } else {
            document.body.classList.remove('dark-theme');
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        }
    }

    // Toggle submenu in sidebar
    submenuToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            const submenu = this.parentElement.nextElementSibling;
            submenu.classList.toggle('active');
            this.classList.toggle('rotate');
        });
    });

    // Handle sidebar links
    const sidebarLinks = document.querySelectorAll('.sidebar a');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // If on mobile, close the sidebar after clicking a link
            if (window.innerWidth < 768) {
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
                document.querySelector('.main-content').classList.remove('sidebar-open');
                sidebarOpen = false;
            }
        });
    });

    // Toggle view (grid/list)
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            viewButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const viewType = this.getAttribute('data-view');
            explorerContent.className = 'explorer-content ' + viewType + '-view';
        });
    });

    // Folder click handler
    folderItems.forEach(folder => {
        folder.addEventListener('click', function(e) {
            const section = this.getAttribute('data-section');
            navigateToFolder(section);
        });
    });

    // File click handler
    fileItems.forEach(file => {
        file.addEventListener('click', function(e) {
            openFilePreview(this);
        });
        
        // Right-click context menu for files
        file.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            showContextMenu(e, this);
        });
    });

    // Create folder modal
    createFolderBtn.addEventListener('click', function() {
        showCreateFolderModal();
    });

    // Upload file handler
    uploadBtn.addEventListener('click', function() {
        // Create a hidden file input
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.multiple = true;
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);
        
        // Trigger click on file input
        fileInput.click();
        
        // Handle file selection
        fileInput.addEventListener('change', function() {
            if (this.files.length > 0) {
                handleFileUpload(this.files);
            }
            // Remove the input element after use
            document.body.removeChild(fileInput);
        });
    });

    // Functions for file explorer
    function navigateToFolder(folderName) {
        // Update breadcrumb and current path
        currentPath.push(folderName);
        updateBreadcrumb();
        
        // Here you would normally fetch the folder contents from the server
        // For demo, we'll just clear the explorer and add a message
        const explorerContent = document.querySelector('.explorer-content');
        explorerContent.innerHTML = '';
        
        // Show loading indicator
        explorerContent.innerHTML = '<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i><p>Cargando contenido...</p></div>';
        
        // Simulate loading time
        setTimeout(() => {
            // Check if we have predefined content for this folder
            const folderContent = getFolderContents(folderName);
            
            if (folderContent && folderContent.length > 0) {
                explorerContent.innerHTML = '';
                folderContent.forEach(item => {
                    explorerContent.appendChild(item);
                });
            } else {
                document.querySelector('.no-items-message').style.display = 'flex';
                explorerContent.innerHTML = '';
            }
        }, 800);
    }

    function updateBreadcrumb() {
        const breadcrumb = document.querySelector('.breadcrumb');
        breadcrumb.innerHTML = '';
        
        // Add home icon
        const homeSpan = document.createElement('span');
        homeSpan.innerHTML = '<i class="fas fa-home"></i>';
        homeSpan.addEventListener('click', function() {
            currentPath = ['Mis Documentos'];
            updateBreadcrumb();
            loadInitialContent();
        });
        breadcrumb.appendChild(homeSpan);
        
        // Add each path segment
        currentPath.forEach((path, index) => {
            const separator = document.createElement('span');
            separator.className = 'separator';
            separator.textContent = '/';
            breadcrumb.appendChild(separator);
            
            const pathSpan = document.createElement('span');
            pathSpan.textContent = path;
            
            // Make all but the last path clickable
            if (index < currentPath.length - 1) {
                pathSpan.addEventListener('click', function() {
                    currentPath = currentPath.slice(0, index + 1);
                    updateBreadcrumb();
                    // If we're going back to root, load initial content
                    if (index === 0) {
                        loadInitialContent();
                    } else {
                        navigateToFolder(currentPath[index]);
                    }
                });
                pathSpan.style.cursor = 'pointer';
            }
            
            breadcrumb.appendChild(pathSpan);
        });
    }

    function loadInitialContent() {
        // Reset explorer content to initial state
        document.querySelector('.no-items-message').style.display = 'none';
        const explorerContent = document.querySelector('.explorer-content');
        
        // Clone initial content from the HTML template
        const template = document.createElement('template');
        template.innerHTML = document.querySelector('.explorer-content').innerHTML;
        explorerContent.innerHTML = template.innerHTML;
        
        // Reattach event listeners to new elements
        document.querySelectorAll('.folder-item').forEach(folder => {
            folder.addEventListener('click', function() {
                const section = this.getAttribute('data-section');
                navigateToFolder(section);
            });
        });
        
        document.querySelectorAll('.file-item').forEach(file => {
            file.addEventListener('click', function() {
                openFilePreview(this);
            });
            file.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                showContextMenu(e, this);
            });
        });
    }

    function getFolderContents(folderName) {
        // This would normally fetch data from the server
        // For demo purposes, we'll create some dummy content based on the folder name
        
        let contents = [];
        
        switch(folderName) {
            case 'docencia':
                contents = createDummyFolderContents(['Cursos', 'Material didáctico', 'Evaluaciones', 'Programas'], 
                    [{name: 'Syllabus 2025-1.pdf', type: 'pdf', date: '10/01/2025'},
                     {name: 'Calendario académico.xlsx', type: 'excel', date: '15/01/2025'},
                     {name: 'Guía didáctica.docx', type: 'word', date: '12/01/2025'}]);
                break;
            case 'investigacion':
                contents = createDummyFolderContents(['Proyectos actuales', 'Publicaciones', 'Colaboraciones', 'Financiamiento'],
                    [{name: 'Propuesta de investigación.pdf', type: 'pdf', date: '05/02/2025'},
                     {name: 'Datos experimentales.xlsx', type: 'excel', date: '28/01/2025'},
                     {name: 'Manuscrito en preparación.docx', type: 'word', date: '10/02/2025'}]);
                break;
            case 'extension':
                contents = createDummyFolderContents(['Conferencias', 'Talleres', 'Eventos públicos', 'Medios de comunicación'],
                    [{name: 'Programa de conferencia.pdf', type: 'pdf', date: '20/01/2025'},
                     {name: 'Registro de asistentes.xlsx', type: 'excel', date: '25/01/2025'},
                     {name: 'Presentación TED.pptx', type: 'powerpoint', date: '15/02/2025'}]);
                break;
            case 'articulos':
                contents = createDummyFolderContents(['Publicados', 'En revisión', 'En preparación', 'Colaboraciones'],
                    [{name: 'Artículo Journal of Science.pdf', type: 'pdf', date: '15/01/2025'},
                     {name: 'Revisión por pares - comentarios.docx', type: 'word', date: '10/02/2025'},
                     {name: 'Datos para gráficas.xlsx', type: 'excel', date: '05/02/2025'}]);
                break;
            case 'tutorias':
                contents = createDummyFolderContents(['Estudiantes actuales', 'Graduados', 'Proyectos de tesis', 'Asesorías'],
                    [{name: 'Lista de tesistas.pdf', type: 'pdf', date: '10/01/2025'},
                     {name: 'Horarios de tutorías.xlsx', type: 'excel', date: '15/01/2025'},
                     {name: 'Guía para tesistas.docx', type: 'word', date: '20/01/2025'}]);
                break;
            case 'gestion':
                contents = createDummyFolderContents(['Comités', 'Coordinación', 'Proyectos administrativos', 'Informes'],
                    [{name: 'Acta de reunión comité.pdf', type: 'pdf', date: '25/01/2025'},
                     {name: 'Presupuesto departamental.xlsx', type: 'excel', date: '10/02/2025'},
                     {name: 'Informe anual actividades.docx', type: 'word', date: '15/02/2025'}]);
                break;
            default:
                return null;
        }
        
        return contents;
    }

    function createDummyFolderContents(folderNames, fileItems) {
        const contents = [];
        
        // Add folders
        folderNames.forEach(name => {
            const folderItem = document.createElement('div');
            folderItem.className = 'folder-item';
            folderItem.innerHTML = `
                <div class="folder-icon">
                    <i class="fas fa-folder"></i>
                </div>
                <div class="folder-details">
                    <span class="folder-name">${name}</span>
                </div>
            `;
            folderItem.addEventListener('click', function() {
                navigateToFolder(name);
            });
            contents.push(folderItem);
        });
        
        // Add files
        fileItems.forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            
            let iconClass = 'fa-file';
            switch (file.type) {
                case 'pdf': iconClass = 'fa-file-pdf'; break;
                case 'word': iconClass = 'fa-file-word'; break;
                case 'excel': iconClass = 'fa-file-excel'; break;
                case 'powerpoint': iconClass = 'fa-file-powerpoint'; break;
                case 'image': iconClass = 'fa-file-image'; break;
                case 'video': iconClass = 'fa-file-video'; break;
                default: iconClass = 'fa-file';
            }
            
            fileItem.innerHTML = `
                <div class="file-icon">
                    <i class="fas ${iconClass}"></i>
                </div>
                <div class="file-details">
                    <span class="file-name">${file.name}</span>
                    <span class="file-meta">${file.date} | ${file.type.toUpperCase()}</span>
                </div>
            `;
            
            fileItem.addEventListener('click', function() {
                openFilePreview(this);
            });
            
            fileItem.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                showContextMenu(e, this);
            });
            
            contents.push(fileItem);
        });
        
        return contents;
    }

    function openFilePreview(fileElement) {
        const fileName = fileElement.querySelector('.file-name').textContent;
        const fileType = fileElement.querySelector('.file-meta').textContent.split('|')[1].trim().toLowerCase();
        
        // Create modal for file preview
        const previewModal = document.createElement('div');
        previewModal.className = 'file-preview';
        
        let previewContent = '';
        
        if (fileType === 'pdf') {
            previewContent = `
                <div class="preview-content">
                    <div style="text-align: center;">
                        <i class="fas fa-file-pdf" style="font-size: 5rem; color: #e74c3c;"></i>
                        <p style="margin-top: 1rem; font-size: 1.2rem;">Vista previa no disponible para archivos PDF</p>
                        <button class="action-btn" style="margin-top: 1rem;">
                            <i class="fas fa-download"></i> Descargar archivo
                        </button>
                    </div>
                </div>
            `;
        } else if (fileType === 'doc' || fileType === 'docx' || fileType === 'word') {
            previewContent = `
                <div class="preview-content">
                    <div style="text-align: center;">
                        <i class="fas fa-file-word" style="font-size: 5rem; color: #4285f4;"></i>
                        <p style="margin-top: 1rem; font-size: 1.2rem;">Vista previa no disponible para archivos Word</p>
                        <button class="action-btn" style="margin-top: 1rem;">
                            <i class="fas fa-download"></i> Descargar archivo
                        </button>
                    </div>
                </div>
            `;
        } else if (fileType === 'xls' || fileType === 'xlsx' || fileType === 'excel') {
            previewContent = `
                <div class="preview-content">
                    <div style="text-align: center;">
                        <i class="fas fa-file-excel" style="font-size: 5rem; color: #34a853;"></i>
                        <p style="margin-top: 1rem; font-size: 1.2rem;">Vista previa no disponible para archivos Excel</p>
                        <button class="action-btn" style="margin-top: 1rem;">
                            <i class="fas fa-download"></i> Descargar archivo
                        </button>
                    </div>
                </div>
            `;
        } else if (fileType === 'ppt' || fileType === 'pptx' || fileType === 'powerpoint') {
            previewContent = `
                <div class="preview-content">
                    <div style="text-align: center;">
                        <i class="fas fa-file-powerpoint" style="font-size: 5rem; color: #fbbc05;"></i>
                        <p style="margin-top: 1rem; font-size: 1.2rem;">Vista previa no disponible para archivos PowerPoint</p>
                        <button class="action-btn" style="margin-top: 1rem;">
                            <i class="fas fa-download"></i> Descargar archivo
                        </button>
                    </div>
                </div>
            `;
        } else {
            previewContent = `
                <div class="preview-content">
                    <div style="text-align: center;">
                        <i class="fas fa-file" style="font-size: 5rem; color: #607d8b;"></i>
                        <p style="margin-top: 1rem; font-size: 1.2rem;">Vista previa no disponible para este tipo de archivo</p>
                        <button class="action-btn" style="margin-top: 1rem;">
                            <i class="fas fa-download"></i> Descargar archivo
                        </button>
                    </div>
                </div>
            `;
        }
        
        previewModal.innerHTML = `
            <div class="preview-header">
                <div class="preview-title">${fileName}</div>
                <button class="preview-close"><i class="fas fa-times"></i></button>
            </div>
            ${previewContent}
            <div class="preview-footer">
                <div class="preview-info">
                    Última modificación: ${fileElement.querySelector('.file-meta').textContent.split('|')[0].trim()}
                </div>
                <div class="preview-controls">
                    <button class="action-btn"><i class="fas fa-download"></i> Descargar</button>
                    <button class="action-btn"><i class="fas fa-share"></i> Compartir</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(previewModal);
        
        // Show the preview with animation
        setTimeout(() => {
            previewModal.classList.add('active');
        }, 10);
        
        // Close preview on click
        previewModal.querySelector('.preview-close').addEventListener('click', function() {
            previewModal.classList.remove('active');
            setTimeout(() => {
                document.body.removeChild(previewModal);
            }, 300);
        });
        
        // Close on ESC key
        document.addEventListener('keydown', function closeOnEsc(e) {
            if (e.key === 'Escape') {
                previewModal.classList.remove('active');
                setTimeout(() => {
                    document.body.removeChild(previewModal);
                }, 300);
                document.removeEventListener('keydown', closeOnEsc);
            }
        });
    }

    function showContextMenu(event, element) {
        // Remove any existing context menus
        const existingMenu = document.querySelector('.context-menu');
        if (existingMenu) {
            document.body.removeChild(existingMenu);
        }
        
        // Create context menu
        const contextMenu = document.createElement('div');
        contextMenu.className = 'context-menu';
        
        // Determine if this is a file or folder
        const isFolder = element.classList.contains('folder-item');
        
        // Set menu items based on element type
        let menuItems;
        if (isFolder) {
            menuItems = [
                { icon: 'fa-folder-open', text: 'Abrir', action: () => navigateToFolder(element.getAttribute('data-section')) },
                { icon: 'fa-edit', text: 'Renombrar', action: () => renameItem(element) },
                { icon: 'fa-trash-alt', text: 'Eliminar', action: () => deleteItem(element) },
                { icon: 'fa-share', text: 'Compartir', action: () => shareItem(element) }
            ];
        } else {
            menuItems = [
                { icon: 'fa-eye', text: 'Vista previa', action: () => openFilePreview(element) },
                { icon: 'fa-download', text: 'Descargar', action: () => downloadFile(element) },
                { icon: 'fa-edit', text: 'Renombrar', action: () => renameItem(element) },
                { icon: 'fa-trash-alt', text: 'Eliminar', action: () => deleteItem(element) },
                { icon: 'fa-share', text: 'Compartir', action: () => shareItem(element) }
            ];
        }
        
        // Add items to menu
        menuItems.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.className = 'context-menu-item';
            menuItem.innerHTML = `<i class="fas ${item.icon}"></i> ${item.text}`;
            menuItem.addEventListener('click', () => {
                document.body.removeChild(contextMenu);
                item.action();
            });
            contextMenu.appendChild(menuItem);
        });
        
        // Position menu at cursor
        contextMenu.style.top = `${event.pageY}px`;
        contextMenu.style.left = `${event.pageX}px`;
        
        // Add to DOM
        document.body.appendChild(contextMenu);
        
        // Check if menu goes off screen and adjust
        const menuRect = contextMenu.getBoundingClientRect();
        if (menuRect.right > window.innerWidth) {
            contextMenu.style.left = `${window.innerWidth - menuRect.width - 10}px`;
        }
        if (menuRect.bottom > window.innerHeight) {
            contextMenu.style.top = `${event.pageY - menuRect.height}px`;
        }
        
        // Close on click outside
        document.addEventListener('click', function closeMenu() {
            document.body.removeChild(contextMenu);
            document.removeEventListener('click', closeMenu);
        });
    }

    function showCreateFolderModal() {
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Nueva Carpeta</h3>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="folderName">Nombre de la carpeta</label>
                        <input type="text" id="folderName" class="form-control" placeholder="Ingresa el nombre de la carpeta">
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="action-btn btn-secondary" id="cancelBtn">Cancelar</button>
                    <button class="action-btn" id="createBtn">Crear</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Show modal
        setTimeout(() => {
            modal.classList.add('active');
            document.getElementById('folderName').focus();
        }, 10);
        
        // Handle cancel button
        document.getElementById('cancelBtn').addEventListener('click', function() {
            modal.classList.remove('active');
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 300);
        });
        
        // Handle create button
        document.getElementById('createBtn').addEventListener('click', function() {
            const folderName = document.getElementById('folderName').value.trim();
            if (folderName) {
                createNewFolder(folderName);
                modal.classList.remove('active');
                setTimeout(() => {
                    document.body.removeChild(modal);
                }, 300);
            } else {
                document.getElementById('folderName').classList.add('error');
                document.getElementById('folderName').placeholder = 'El nombre no puede estar vacío';
            }
        });
        
        // Handle ESC key
        document.addEventListener('keydown', function closeOnEsc(e) {
            if (e.key === 'Escape') {
                modal.classList.remove('active');
                setTimeout(() => {
                    document.body.removeChild(modal);
                }, 300);
                document.removeEventListener('keydown', closeOnEsc);
            }
        });
    }

    function createNewFolder(folderName) {
        // Create new folder element
        const newFolder = document.createElement('div');
        newFolder.className = 'folder-item';
        newFolder.innerHTML = `
            <div class="folder-icon">
                <i class="fas fa-folder"></i>
            </div>
            <div class="folder-details">
                <span class="folder-name">${folderName}</span>
            </div>
        `;
        
        // Add event listener
        newFolder.addEventListener('click', function() {
            navigateToFolder(folderName);
        });
        
        // Add to explorer content
        const explorerContent = document.querySelector('.explorer-content');
        explorerContent.appendChild(newFolder);
        
        // Hide "no items" message if visible
        document.querySelector('.no-items-message').style.display = 'none';
    }

    function handleFileUpload(files) {
        // Create upload progress container
        const uploadContainer = document.createElement('div');
        uploadContainer.className = 'upload-progress';
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            // Create progress element for this file
            const progressElement = document.createElement('div');
            progressElement.innerHTML = `
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <span>${file.name}</span>
                    <span class="upload-percentage">0%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 0%"></div>
                </div>
            `;
            
            uploadContainer.appendChild(progressElement);
            
            // Simulate upload progress
            simulateFileUpload(progressElement, file);
        }
        
        // Create modal to show progress
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Subiendo archivos</h3>
                </div>
                <div class="modal-body">
                    ${uploadContainer.outerHTML}
                </div>
                <div class="modal-footer">
                    <button class="action-btn btn-secondary" id="cancelUploadBtn">Cancelar</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Show modal
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
        
        // Handle cancel button
        document.getElementById('cancelUploadBtn').addEventListener('click', function() {
            modal.classList.remove('active');
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 300);
        });
    }

    function simulateFileUpload(progressElement, file) {
        const progressFill = progressElement.querySelector('.progress-fill');
        const percentageText = progressElement.querySelector('.upload-percentage');
        let progress = 0;
        
        const interval = setInterval(() => {
            // Increment progress randomly
            progress += Math.random() * 10;
            
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                
                // Add the file to the explorer
                const explorerContent = document.querySelector('.explorer-content');
                
                // Determine file type
                const fileExtension = file.name.split('.').pop().toLowerCase();
                let fileType = 'file';
                let iconClass = 'fa-file';
                
                if (['pdf'].includes(fileExtension)) {
                    fileType = 'pdf';
                    iconClass = 'fa-file-pdf';
                } else if (['doc', 'docx'].includes(fileExtension)) {
                    fileType = 'word';
                    iconClass = 'fa-file-word';
                } else if (['xls', 'xlsx'].includes(fileExtension)) {
                    fileType = 'excel';
                    iconClass = 'fa-file-excel';
                } else if (['ppt', 'pptx'].includes(fileExtension)) {
                    fileType = 'powerpoint';
                    iconClass = 'fa-file-powerpoint';
                } else if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
                    fileType = 'image';
                    iconClass = 'fa-file-image';
                } else if (['mp4', 'avi', 'mov'].includes(fileExtension)) {
                    fileType = 'video';
                    iconClass = 'fa-file-video';
                }
                
                // Create new file element
                const newFile = document.createElement('div');
                newFile.className = 'file-item';
                newFile.innerHTML = `
                    <div class="file-icon">
                        <i class="fas ${iconClass}"></i>
                    </div>
                    <div class="file-details">
                        <span class="file-name">${file.name}</span>
                        <span class="file-meta">${getCurrentDate()} | ${fileType.toUpperCase()}</span>
                    </div>
                `;
                
                // Add event listeners
                newFile.addEventListener('click', function() {
                    openFilePreview(this);
                });
                
                newFile.addEventListener('contextmenu', function(e) {
                    e.preventDefault();
                    showContextMenu(e, this);
                });
                
                // Add to explorer content
                explorerContent.appendChild(newFile);
                
                // Hide "no items" message if visible
                document.querySelector('.no-items-message').style.display = 'none';
                
                // Show upload complete notification
                showNotification(`Archivo "${file.name}" subido correctamente`);
            }
            
            // Update progress UI
            progressFill.style.width = `${progress}%`;
            percentageText.textContent = `${Math.round(progress)}%`;
        }, 200);
    }
    
    function getCurrentDate() {
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        return `${day}/${month}/${year}`;
    }
    
    function renameItem(element) {
        const isFolder = element.classList.contains('folder-item');
        const nameSpan = isFolder ? 
            element.querySelector('.folder-name') : 
            element.querySelector('.file-name');
        const currentName = nameSpan.textContent;
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Renombrar ${isFolder ? 'carpeta' : 'archivo'}</h3>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="itemName">Nuevo nombre</label>
                        <input type="text" id="itemName" class="form-control" value="${currentName}">
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="action-btn btn-secondary" id="cancelBtn">Cancelar</button>
                    <button class="action-btn" id="renameBtn">Renombrar</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Show modal
        setTimeout(() => {
            modal.classList.add('active');
            const input = document.getElementById('itemName');
            input.focus();
            // Select name without extension for files
            if (!isFolder && currentName.includes('.')) {
                const dot = currentName.lastIndexOf('.');
                input.setSelectionRange(0, dot);
            } else {
                input.select();
            }
        }, 10);
        
        // Handle cancel button
        document.getElementById('cancelBtn').addEventListener('click', function() {
            modal.classList.remove('active');
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 300);
        });
        
        // Handle rename button
        document.getElementById('renameBtn').addEventListener('click', function() {
            const newName = document.getElementById('itemName').value.trim();
            if (newName) {
                nameSpan.textContent = newName;
                modal.classList.remove('active');
                setTimeout(() => {
                    document.body.removeChild(modal);
                }, 300);
                showNotification(`${isFolder ? 'Carpeta' : 'Archivo'} renombrado correctamente`);
            }
        });
        
        // Handle ESC key
        document.addEventListener('keydown', function closeOnEsc(e) {
            if (e.key === 'Escape') {
                modal.classList.remove('active');
                setTimeout(() => {
                    document.body.removeChild(modal);
                }, 300);
                document.removeEventListener('keydown', closeOnEsc);
            }
        });
    }
    
    function deleteItem(element) {
        const isFolder = element.classList.contains('folder-item');
        const name = isFolder ? 
            element.querySelector('.folder-name').textContent : 
            element.querySelector('.file-name').textContent;
        
        // Create confirmation modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Confirmar eliminación</h3>
                </div>
                <div class="modal-body">
                    <p>¿Estás seguro de que deseas eliminar ${isFolder ? 'la carpeta' : 'el archivo'} "${name}"?</p>
                    <p class="warning">${isFolder ? 'Esta acción eliminará todos los contenidos de la carpeta.' : ''}</p>
                </div>
                <div class="modal-footer">
                    <button class="action-btn btn-secondary" id="cancelBtn">Cancelar</button>
                    <button class="action-btn btn-danger" id="deleteBtn">Eliminar</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Show modal
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
        
        // Handle cancel button
        document.getElementById('cancelBtn').addEventListener('click', function() {
            modal.classList.remove('active');
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 300);
        });
        
        // Handle delete button
        document.getElementById('deleteBtn').addEventListener('click', function() {
            // Remove the element from DOM
            element.parentNode.removeChild(element);
            
            modal.classList.remove('active');
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 300);
            
            showNotification(`${isFolder ? 'Carpeta' : 'Archivo'} eliminado correctamente`);
            
            // Show "no items" message if there are no more items
            const explorerContent = document.querySelector('.explorer-content');
            if (explorerContent.querySelectorAll('.folder-item, .file-item').length === 0) {
                document.querySelector('.no-items-message').style.display = 'flex';
            }
        });
        
        // Handle ESC key
        document.addEventListener('keydown', function closeOnEsc(e) {
            if (e.key === 'Escape') {
                modal.classList.remove('active');
                setTimeout(() => {
                    document.body.removeChild(modal);
                }, 300);
                document.removeEventListener('keydown', closeOnEsc);
            }
        });
    }
    
    function shareItem(element) {
        const isFolder = element.classList.contains('folder-item');
        const name = isFolder ? 
            element.querySelector('.folder-name').textContent : 
            element.querySelector('.file-name').textContent;
        
        // Create share modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Compartir ${isFolder ? 'carpeta' : 'archivo'}</h3>
                </div>
                <div class="modal-body">
                    <p>Compartir "${name}" con:</p>
                    <div class="form-group">
                        <input type="email" placeholder="Ingresa direcciones de correo electrónico" class="form-control">
                    </div>
                    <div class="share-options">
                        <div class="option">
                            <input type="radio" name="permission" id="viewOnly" checked>
                            <label for="viewOnly">Solo lectura</label>
                        </div>
                        <div class="option">
                            <input type="radio" name="permission" id="canEdit">
                            <label for="canEdit">Puede editar</label>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="shareMessage">Mensaje (opcional)</label>
                        <textarea id="shareMessage" class="form-control" placeholder="Agrega un mensaje"></textarea>
                    </div>
                    <div class="link-share">
                        <p>O comparte mediante enlace:</p>
                        <div class="share-link-container">
                            <input type="text" class="form-control" value="https://docs.ejemplo.com/share/x8f7g9h2" readonly>
                            <button class="action-btn">Copiar</button>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="action-btn btn-secondary" id="cancelBtn">Cancelar</button>
                    <button class="action-btn" id="shareBtn">Compartir</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Show modal
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
        
        // Handle cancel button
        document.getElementById('cancelBtn').addEventListener('click', function() {
            modal.classList.remove('active');
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 300);
        });
        
        // Handle share button
        document.getElementById('shareBtn').addEventListener('click', function() {
            modal.classList.remove('active');
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 300);
            
            showNotification(`${isFolder ? 'Carpeta' : 'Archivo'} compartido correctamente`);
        });
        
        // Handle ESC key
        document.addEventListener('keydown', function closeOnEsc(e) {
            if (e.key === 'Escape') {
                modal.classList.remove('active');
                setTimeout(() => {
                    document.body.removeChild(modal);
                }, 300);
                document.removeEventListener('keydown', closeOnEsc);
            }
        });
    }
    
    function downloadFile(element) {
        const fileName = element.querySelector('.file-name').textContent;
        
        // Show notification
        showNotification(`Descargando "${fileName}"`);
        
        // In a real app, this would trigger an actual download
        // For demo, just show a notification after a delay
        setTimeout(() => {
            showNotification(`Archivo "${fileName}" descargado correctamente`);
        }, 2000);
    }
    
    function showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-check-circle"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add to DOM
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('active');
        }, 10);
        
        // Auto remove after timeout
        setTimeout(() => {
            notification.classList.remove('active');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    // Sidebar toggle button event handler (not defined earlier)
    const sidebarToggleBtn = document.getElementById('sidebarToggle');
    if (sidebarToggleBtn) {
        sidebarToggleBtn.addEventListener('click', function() {
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
            document.querySelector('.main-content').classList.toggle('sidebar-open');
            sidebarOpen = !sidebarOpen;
        });
    }

    // Overlay click to close sidebar
    overlay.addEventListener('click', function() {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        document.querySelector('.main-content').classList.remove('sidebar-open');
        sidebarOpen = false;
    });
    
    // Initialize breadcrumb
    updateBreadcrumb();
});