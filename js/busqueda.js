/**
 * Search page functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    initializeSearch();
});

function initializeSearch() {
    // Initialize search form
    initializeSearchForm();
    
    // Initialize filters
    initializeFilters();
    
    // Initialize file viewer
    initializeFileViewer();
}

function initializeSearchForm() {
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    
    if (searchForm && searchInput) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const query = searchInput.value.trim();
            if (query) {
                performSearch(query);
            }
        });
    }
}

async function performSearch(query) {
    const searchResults = document.getElementById('search-results');
    if (!searchResults) return;

    searchResults.innerHTML = '<div class="loading">Buscando...</div>';

    // Obtener los valores de los filtros
    const category = document.getElementById('filter-category').value;
    const year = document.getElementById('filter-year').value;
    const sortBy = document.getElementById('filter-sort').value;
    const type = document.getElementById('filter-type').value;
    const author = document.getElementById('filter-author').value;

    try {
        // Obtener los archivos del dashboard
        const { files } = await getFolderContents(currentPath);
        let matchingFiles = files.filter(file => {
            // Aplicar filtros
            const matchesQuery = query ? (
                file.name.toLowerCase().includes(query.toLowerCase()) ||
                file.description?.toLowerCase().includes(query.toLowerCase()) ||
                file.author?.toLowerCase().includes(query.toLowerCase())
            ) : true;

            const matchesCategory = category === 'all' || file.category === category;
            const matchesYear = year === 'all' || new Date(file.createdAt).getFullYear().toString() === year;
            const matchesType = type === 'all' || file.type === type;
            const matchesAuthor = author === 'all' || 
                                (author === 'user' && file.author === currentUser) || 
                                (author === 'shared' && file.author !== currentUser);

            return matchesQuery && matchesCategory && matchesYear && matchesType && matchesAuthor;
        });

        // Ordenar resultados
        matchingFiles.sort((a, b) => {
            switch(sortBy) {
                case 'newest':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'oldest':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'name-asc':
                    return a.name.localeCompare(b.name);
                case 'name-desc':
                    return b.name.localeCompare(a.name);
                default:
                    return 0;
            }
        });

        // Mostrar resultados
        if (matchingFiles.length === 0) {
            searchResults.innerHTML = '<div class="no-results">No se encontraron resultados para tu búsqueda.</div>';
        } else {
            searchResults.innerHTML = '';
            matchingFiles.forEach(file => {
                const fileCard = createFileCard(file);
                searchResults.appendChild(fileCard);
            });
        }

        showNotification(`Búsqueda completada: ${matchingFiles.length} resultados encontrados`, 'info');
    } catch (error) {
        console.error('Error al buscar archivos:', error);
        searchResults.innerHTML = '<div class="error">Error al buscar archivos. Por favor, intente nuevamente.</div>';
        showNotification('Error al buscar archivos', 'error');
    }
}


function initializeFilters() {
    const filterCategory = document.getElementById('filter-category');
    const filterYear = document.getElementById('filter-year');
    const filterSort = document.getElementById('filter-sort');
    
    if (filterCategory && filterYear && filterSort) {
        // Category filter
        filterCategory.addEventListener('change', function() {
            applyFilters();
        });
        
        // Year filter
        filterYear.addEventListener('change', function() {
            applyFilters();
        });
        
        // Sort filter
        filterSort.addEventListener('change', function() {
            applyFilters();
        });
    }
}

async function applyFilters() {
    const searchResults = document.getElementById('search-results');
    if (!searchResults) return;

    searchResults.innerHTML = '<div class="loading">Aplicando filtros...</div>';

    const category = document.getElementById('filter-category').value;
    const year = document.getElementById('filter-year').value;
    const type = document.getElementById('filter-type').value;
    const author = document.getElementById('filter-author').value;
    const sortBy = document.getElementById('filter-sort').value;

    try {
        // Obtener los archivos del dashboard
        const { files } = await getFolderContents(currentPath);
        let matchingFiles = files.filter(file => {
            const matchesCategory = category === 'all' || file.category === category;
            const matchesYear = year === 'all' || new Date(file.createdAt).getFullYear().toString() === year;
            const matchesType = type === 'all' || file.type === type;
            const matchesAuthor = author === 'all' || 
                                (author === 'user' && file.author === currentUser) || 
                                (author === 'shared' && file.author !== currentUser);

            return matchesCategory && matchesYear && matchesType && matchesAuthor;
        });

        // Ordenar resultados
        matchingFiles.sort((a, b) => {
            switch(sortBy) {
                case 'newest':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'oldest':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'name-asc':
                    return a.name.localeCompare(b.name);
                case 'name-desc':
                    return b.name.localeCompare(a.name);
                default:
                    return 0;
            }
        });

        // Mostrar resultados
        if (matchingFiles.length === 0) {
            searchResults.innerHTML = '<div class="no-results">No se encontraron resultados con los filtros seleccionados.</div>';
        } else {
            searchResults.innerHTML = '';
            matchingFiles.forEach(file => {
                const fileCard = createFileCard(file);
                searchResults.appendChild(fileCard);
            });
        }

        showNotification(`Filtros aplicados: ${matchingFiles.length} resultados encontrados`, 'info');
    } catch (error) {
        console.error('Error al aplicar filtros:', error);
        searchResults.innerHTML = '<div class="error">Error al aplicar filtros. Por favor, intente nuevamente.</div>';
        showNotification('Error al aplicar filtros', 'error');
    }
}

function initializeFileViewer() {
    const fileViewer = document.getElementById('file-viewer');
    const closeViewer = document.getElementById('close-viewer');
    const viewerTitle = document.getElementById('viewer-title');
    const pdfFrame = document.getElementById('pdf-frame');
    const downloadBtn = document.getElementById('download-btn');
    
    if (fileViewer && closeViewer) {
        // Close viewer
        closeViewer.addEventListener('click', function() {
            fileViewer.style.display = 'none';
        });
        
        // Download button
        if (downloadBtn) {
            downloadBtn.addEventListener('click', function() {
                const fileName = viewerTitle.textContent;
                showNotification(`Descargando: ${fileName}`, 'success');
            });
        }
        
        // View buttons
        const viewButtons = document.querySelectorAll('.view-button');
        viewButtons.forEach(button => {
            button.addEventListener('click', function() {
                const fileId = this.getAttribute('data-id');
                const fileCard = this.closest('.file-card');
                const fileName = fileCard.querySelector('.file-title').textContent;
                
                openFileViewer(fileId, fileName);
            });
        });
        
        // Download buttons
        const downloadButtons = document.querySelectorAll('.download-button');
        downloadButtons.forEach(button => {
            button.addEventListener('click', function() {
                const fileId = this.getAttribute('data-id');
                const fileCard = this.closest('.file-card');
                const fileName = fileCard.querySelector('.file-title').textContent;
                
                showNotification(`Descargando: ${fileName}`, 'success');
            });
        });
    }
}

function openFileViewer(fileId, fileName) {
    const fileViewer = document.getElementById('file-viewer');
    const viewerTitle = document.getElementById('viewer-title');
    const pdfFrame = document.getElementById('pdf-frame');
    
    if (fileViewer && viewerTitle && pdfFrame) {
        // Set viewer title
        viewerTitle.textContent = fileName;
        
        // Set PDF source based on file ID
        // In a real app, this would load the actual file
        pdfFrame.src = `https://via.placeholder.com/800x1000/ffffff/000000?text=Preview+of+${encodeURIComponent(fileName)}`;
        
        // Show viewer
        fileViewer.style.display = 'flex';
    }
}

if (!token || !user) {
    window.location.href = 'index.html';
}