document.addEventListener('DOMContentLoaded', function() {
    // Verificar si el usuario es administrador
    checkAdminAuth();
    
    // Referencias a elementos comunes
    const menuItems = document.querySelectorAll('.admin-menu ul li');
    const contentSections = document.querySelectorAll('.content-section');
    const logoutBtn = document.getElementById('logoutBtn');
    const refreshBtn = document.getElementById('refreshData');
    
    // Datos de ejemplo para el panel
    let ticketsData = [];
    let usersData = [];
    
    // Paginación
    let currentTicketPage = 1;
    let currentUserPage = 1;
    let ticketsPerPage = 5;
    let usersPerPage = 5;
    
    // Inicializar datos
    initializeData();
    updateDashboard();
    
    // Event listeners
    menuItems.forEach(item => {
        if (item.id !== 'logoutBtn') {
            item.addEventListener('click', () => switchSection(item.dataset.section));
        }
    });
    
    document.querySelectorAll('.view-all').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchSection(link.dataset.section);
        });
    });
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshData);
    }
    
    // Filtros y búsqueda
    const ticketSearch = document.getElementById('ticketSearch');
    const ticketStatusFilter = document.getElementById('ticketStatusFilter');
    
    if (ticketSearch) {
        ticketSearch.addEventListener('input', filterTickets);
    }
    
    if (ticketStatusFilter) {
        ticketStatusFilter.addEventListener('change', filterTickets);
    }
    
    // Paginación
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const prevUserPageBtn = document.getElementById('prevUserPage');
    const nextUserPageBtn = document.getElementById('nextUserPage');
    
    if (prevPageBtn && nextPageBtn) {
        prevPageBtn.addEventListener('click', () => changePage('tickets', -1));
        nextPageBtn.addEventListener('click', () => changePage('tickets', 1));
    }
    
    if (prevUserPageBtn && nextUserPageBtn) {
        prevUserPageBtn.addEventListener('click', () => changePage('users', -1));
        nextUserPageBtn.addEventListener('click', () => changePage('users', 1));
    }
    
    // Modal de ticket
    const modal = document.getElementById('ticketDetailModal');
    const closeModal = document.querySelector('.close-modal');
    
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }
    
    // Al hacer clic fuera del modal, cerrarlo
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Botones de enviar respuesta
    const sendReplyBtn = document.getElementById('sendReply');
    
    if (sendReplyBtn) {
        sendReplyBtn.addEventListener('click', sendTicketReply);
    }
    
    // Formularios de configuración
    const generalSettingsForm = document.getElementById('generalSettingsForm');
    const ticketSettingsForm = document.getElementById('ticketSettingsForm');
    const securitySettingsForm = document.getElementById('securitySettingsForm');
    
    if (generalSettingsForm) {
        generalSettingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveSettings('general');
        });
    }
    
    if (ticketSettingsForm) {
        ticketSettingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveSettings('tickets');
        });
    }
    
    if (securitySettingsForm) {
        securitySettingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveSettings('security');
        });
    }

    // Funciones principales
    
    // Verificar autenticación del administrador
    function checkAdminAuth() {
        const adminEmail = sessionStorage.getItem('adminEmail');
        
        if (!adminEmail || adminEmail !== 'admin.cualtos@cualtos.udg.mx') {
            // Redirigir al login si no es administrador
            window.location.href = '../index.html';
        }
    }
    
    // Cambiar entre secciones
    function switchSection(sectionId) {
        menuItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.section === sectionId) {
                item.classList.add('active');
            }
        });
        
        contentSections.forEach(section => {
            section.classList.remove('active');
            if (section.id === `${sectionId}-section`) {
                section.classList.add('active');
            }
        });
        
        // Cargar datos específicos de la sección
        if (sectionId === 'tickets') {
            loadTickets();
        } else if (sectionId === 'users') {
            loadUsers();
        }
    }
    
    // Cerrar sesión
    function handleLogout() {
        sessionStorage.removeItem('adminEmail');
        window.location.href = '../index.html';
    }
    
    // Actualizar datos
    function refreshData() {
        initializeData();
        updateDashboard();
        
        const activeSection = document.querySelector('.content-section.active');
        if (activeSection) {
            const sectionId = activeSection.id.replace('-section', '');
            if (sectionId === 'tickets') {
                loadTickets();
            } else if (sectionId === 'users') {
                loadUsers();
            }
        }
        
        // Mostrar notificación de actualización
        showNotification('Datos actualizados correctamente');
    }
    
    // Inicializar datos de ejemplo
    function initializeData() {
        // Datos de tickets
        ticketsData = [
            {
                id: 'TK001',
                subject: 'Problema de acceso a plataforma Moodle',
                description: 'No puedo ingresar a mi cuenta en la plataforma Moodle. He intentado restablecer mi contraseña pero sigo sin poder acceder.',
                user: 'Carlos González',
                email: 'carlos.gonzalez@academicos.udg.mx',
                date: '2025-05-10',
                status: 'pending',
                attachments: ['captura_error.png'],
                conversation: [
                    {
                        sender: 'Carlos González',
                        message: 'No puedo ingresar a mi cuenta en la plataforma Moodle. He intentado restablecer mi contraseña pero sigo sin poder acceder.',
                        date: '2025-05-10 09:15:22',
                        isAdmin: false
                    }
                ]
            },
            {
                id: 'TK002',
                subject: 'Solicitud de software especializado',
                description: 'Necesito que se instale el software SPSS en las computadoras del laboratorio 3 para la clase de Estadística Avanzada del próximo lunes.',
                user: 'Ana Martínez',
                email: 'ana.martinez@academicos.udg.mx',
                date: '2025-05-09',
                status: 'inProgress',
                attachments: [],
                conversation: [
                    {
                        sender: 'Ana Martínez',
                        message: 'Necesito que se instale el software SPSS en las computadoras del laboratorio 3 para la clase de Estadística Avanzada del próximo lunes.',
                        date: '2025-05-09 14:22:10',
                        isAdmin: false
                    },
                    {
                        sender: 'Administrador',
                        message: 'Estamos procesando su solicitud. ¿Cuántas computadoras necesitan el software?',
                        date: '2025-05-09 15:40:05',
                        isAdmin: true
                    },
                    {
                        sender: 'Ana Martínez',
                        message: 'Son 25 computadoras en total, gracias por la pronta respuesta.',
                        date: '2025-05-09 16:05:18',
                        isAdmin: false
                    }
                ]
            },
            {
                id: 'TK003',
                subject: 'Problema con proyector en aula 202',
                description: 'El proyector del aula 202 no está funcionando correctamente. La imagen se ve borrosa y con líneas verticales.',
                user: 'Miguel Sánchez',
                email: 'miguel.sanchez@academicos.udg.mx',
                date: '2025-05-08',
                status: 'resolved',
                attachments: ['foto_proyector.jpg'],
                conversation: [
                    {
                        sender: 'Miguel Sánchez',
                        message: 'El proyector del aula 202 no está funcionando correctamente. La imagen se ve borrosa y con líneas verticales.',
                        date: '2025-05-08 11:30:15',
                        isAdmin: false
                    },
                    {
                        sender: 'Administrador',
                        message: 'Gracias por reportar el problema. Enviaremos a un técnico para revisarlo lo antes posible.',
                        date: '2025-05-08 12:15:40',
                        isAdmin: true
                    },
                    {
                        sender: 'Administrador',
                        message: 'El técnico ya revisó el proyector. Era necesario recalibrar los ajustes de color y remplazar un cable HDMI defectuoso. Ya debería estar funcionando correctamente.',
                        date: '2025-05-08 16:45:22',
                        isAdmin: true
                    },
                    {
                        sender: 'Miguel Sánchez',
                        message: 'Excelente, muchas gracias por la rápida solución.',
                        date: '2025-05-08 17:20:10',
                        isAdmin: false
                    }
                ]
            },
            {
                id: 'TK004',
                subject: 'Solicitud de acceso al laboratorio de Química',
                description: 'Necesito acceso especial al laboratorio de Química avanzada este fin de semana para terminar un proyecto de investigación.',
                user: 'Laura Torres',
                email: 'laura.torres@academicos.udg.mx',
                date: '2025-05-07',
                status: 'pending',
                attachments: ['carta_solicitud.pdf'],
                conversation: [
                    {
                        sender: 'Laura Torres',
                        message: 'Necesito acceso especial al laboratorio de Química avanzada este fin de semana para terminar un proyecto de investigación.',
                        date: '2025-05-07 15:08:45',
                        isAdmin: false
                    }
                ]
            },
            {
                id: 'TK005',
                subject: 'Reporte de filtración en techo de biblioteca',
                description: 'Hay una filtración de agua en el techo de la biblioteca cerca de la sección de revistas científicas. El agua podría dañar el material bibliográfico.',
                user: 'Roberto Mendoza',
                email: 'roberto.mendoza@academicos.udg.mx',
                date: '2025-05-06',
                status: 'inProgress',
                attachments: ['foto_filtracion.jpg'],
                conversation: [
                    {
                        sender: 'Roberto Mendoza',
                        message: 'Hay una filtración de agua en el techo de la biblioteca cerca de la sección de revistas científicas. El agua podría dañar el material bibliográfico.',
                        date: '2025-05-06 10:25:18',
                        isAdmin: false
                    },
                    {
                        sender: 'Administrador',
                        message: 'Gracias por reportar la situación. Ya hemos enviado personal de mantenimiento para evaluar la situación y proteger el material bibliográfico. Se realizará una reparación temporal hoy mismo.',
                        date: '2025-05-06 11:40:30',
                        isAdmin: true
                    }
                ]
            },
            {
                id: 'TK006',
                subject: 'Problema con aire acondicionado en sala de cómputo',
                description: 'El aire acondicionado de la sala de cómputo 3 no está funcionando y hace demasiado calor, lo que afecta el funcionamiento de los equipos.',
                user: 'Pedro Ramírez',
                email: 'pedro.ramirez@academicos.udg.mx',
                date: '2025-05-05',
                status: 'resolved',
                attachments: [],
                conversation: [
                    {
                        sender: 'Pedro Ramírez',
                        message: 'El aire acondicionado de la sala de cómputo 3 no está funcionando y hace demasiado calor, lo que afecta el funcionamiento de los equipos.',
                        date: '2025-05-05 13:45:20',
                        isAdmin: false
                    },
                    {
                        sender: 'Administrador',
                        message: 'Entendemos la urgencia. El técnico de climatización estará ahí en aproximadamente 30 minutos.',
                        date: '2025-05-05 14:15:10',
                        isAdmin: true
                    },
                    {
                        sender: 'Administrador',
                        message: 'El problema ha sido resuelto. Se reemplazó un fusible defectuoso en la unidad de aire acondicionado.',
                        date: '2025-05-05 16:30:45',
                        isAdmin: true
                    }
                ]
            }
        ];

        // Datos de usuarios
        usersData = [
            {
                id: 'USR001',
                firstName: 'Carlos',
                lastName: 'González',
                email: 'carlos.gonzalez@academicos.udg.mx',
                registerDate: '2024-09-15',
                ticketsCount: 3,
                status: 'active'
            },
            {
                id: 'USR002',
                firstName: 'Ana',
                lastName: 'Martínez',
                email: 'ana.martinez@academicos.udg.mx',
                registerDate: '2024-10-03',
                ticketsCount: 1,
                status: 'active'
            },
            {
                id: 'USR003',
                firstName: 'Miguel',
                lastName: 'Sánchez',
                email: 'miguel.sanchez@academicos.udg.mx',
                registerDate: '2024-08-22',
                ticketsCount: 5,
                status: 'active'
            },
            {
                id: 'USR004',
                firstName: 'Laura',
                lastName: 'Torres',
                email: 'laura.torres@academicos.udg.mx',
                registerDate: '2024-11-05',
                ticketsCount: 2,
                status: 'active'
            },
            {
                id: 'USR005',
                firstName: 'Roberto',
                lastName: 'Mendoza',
                email: 'roberto.mendoza@academicos.udg.mx',
                registerDate: '2024-09-30',
                ticketsCount: 4,
                status: 'active'
            },
            {
                id: 'USR006',
                firstName: 'Pedro',
                lastName: 'Ramírez',
                email: 'pedro.ramirez@academicos.udg.mx',
                registerDate: '2024-10-10',
                ticketsCount: 1,
                status: 'active'
            },
            {
                id: 'USR007',
                firstName: 'Silvia',
                lastName: 'López',
                email: 'silvia.lopez@academicos.udg.mx',
                registerDate: '2024-08-15',
                ticketsCount: 0,
                status: 'inactive'
            },
            {
                id: 'USR008',
                firstName: 'Javier',
                lastName: 'Fernández',
                email: 'javier.fernandez@academicos.udg.mx',
                registerDate: '2024-07-20',
                ticketsCount: 2,
                status: 'active'
            }
        ];
    }

    // Actualiza el dashboard con los datos
    function updateDashboard() {
        // Actualizar contadores
        const pendingTicketsCount = ticketsData.filter(ticket => ticket.status === 'pending').length;
        const resolvedTicketsCount = ticketsData.filter(ticket => ticket.status === 'resolved').length;
        const totalUsersCount = usersData.length;
        
        document.getElementById('pendingTicketsCount').textContent = pendingTicketsCount;
        document.getElementById('resolvedTicketsCount').textContent = resolvedTicketsCount;
        document.getElementById('totalUsersCount').textContent = totalUsersCount;
        document.getElementById('ticketsCount').textContent = pendingTicketsCount;
        
        // Actualizar fecha actual
        const currentDate = new Date();
        const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById('currentDate').textContent = currentDate.toLocaleDateString('es-ES', dateOptions);
        
        // Cargar tickets recientes
        loadRecentTickets();
    }
    
    // Carga los tickets recientes en el dashboard
    function loadRecentTickets() {
        const recentTicketsList = document.getElementById('recentTicketsList');
        const recentTickets = ticketsData.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
        
        if (recentTickets.length > 0) {
            recentTicketsList.innerHTML = '';
            
            recentTickets.forEach(ticket => {
                const statusClass = getStatusClass(ticket.status);
                const statusText = getStatusText(ticket.status);
                
                const ticketItem = document.createElement('div');
                ticketItem.className = 'ticket-item';
                ticketItem.innerHTML = `
                    <div class="ticket-info">
                        <h4>${ticket.subject}</h4>
                        <p>Por: ${ticket.user}</p>
                        <p class="ticket-date">${formatDate(ticket.date)}</p>
                    </div>
                    <div class="ticket-status">
                        <span class="status-badge ${statusClass}">${statusText}</span>
                    </div>
                `;
                
                // Agregar evento para ver detalles
                ticketItem.addEventListener('click', () => {
                    showTicketDetails(ticket.id);
                });
                
                recentTicketsList.appendChild(ticketItem);
            });
        } else {
            recentTicketsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-ticket-alt"></i>
                    <p>No hay tickets recientes</p>
                </div>
            `;
        }
    }
    
    // Carga los tickets en la tabla
    function loadTickets() {
        const tableBody = document.getElementById('ticketsTableBody');
        const statusFilter = document.getElementById('ticketStatusFilter').value;
        const searchQuery = document.getElementById('ticketSearch').value.toLowerCase();
        
        // Filtrar tickets
        let filteredTickets = ticketsData;
        
        if (statusFilter !== 'all') {
            filteredTickets = filteredTickets.filter(ticket => ticket.status === statusFilter);
        }
        
        if (searchQuery) {
            filteredTickets = filteredTickets.filter(ticket => 
                ticket.subject.toLowerCase().includes(searchQuery) || 
                ticket.user.toLowerCase().includes(searchQuery) ||
                ticket.id.toLowerCase().includes(searchQuery)
            );
        }
        
        // Ordenar por fecha (más recientes primero)
        filteredTickets = filteredTickets.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Paginación
        const totalTickets = filteredTickets.length;
        const totalPages = Math.ceil(totalTickets / ticketsPerPage);
        
        document.getElementById('currentPage').textContent = currentTicketPage;
        document.getElementById('totalPages').textContent = totalPages || 1;
        
        // Habilitar/deshabilitar botones de paginación
        document.getElementById('prevPage').disabled = currentTicketPage <= 1;
        document.getElementById('nextPage').disabled = currentTicketPage >= totalPages || totalPages === 0;
        
        // Calcular índices para la paginación
        const startIndex = (currentTicketPage - 1) * ticketsPerPage;
        const endIndex = startIndex + ticketsPerPage;
        const paginatedTickets = filteredTickets.slice(startIndex, endIndex);
        
        if (paginatedTickets.length > 0) {
            tableBody.innerHTML = '';
            
            paginatedTickets.forEach(ticket => {
                const statusClass = getStatusClass(ticket.status);
                const statusText = getStatusText(ticket.status);
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${ticket.id}</td>
                    <td>${ticket.subject}</td>
                    <td>${ticket.user}</td>
                    <td>${formatDate(ticket.date)}</td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td class="actions-cell">
                        <button class="action-btn view-btn" title="Ver detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                `;
                
                // Agregar evento para ver detalles
                row.querySelector('.view-btn').addEventListener('click', () => {
                    showTicketDetails(ticket.id);
                });
                
                tableBody.appendChild(row);
            });
        } else {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="no-records">No se encontraron tickets</td>
                </tr>
            `;
        }
    }
    
    // Carga los usuarios en la tabla
    function loadUsers() {
        const tableBody = document.getElementById('usersTableBody');
        const searchQuery = document.getElementById('userSearch') ? document.getElementById('userSearch').value.toLowerCase() : '';
        
        // Filtrar usuarios
        let filteredUsers = usersData;
        
        if (searchQuery) {
            filteredUsers = filteredUsers.filter(user => 
                user.firstName.toLowerCase().includes(searchQuery) || 
                user.lastName.toLowerCase().includes(searchQuery) ||
                user.email.toLowerCase().includes(searchQuery) ||
                user.id.toLowerCase().includes(searchQuery)
            );
        }
        
        // Ordenar por ID
        filteredUsers = filteredUsers.sort((a, b) => a.id.localeCompare(b.id));
        
        // Paginación
        const totalUsers = filteredUsers.length;
        const totalPages = Math.ceil(totalUsers / usersPerPage);
        
        document.getElementById('currentUserPage').textContent = currentUserPage;
        document.getElementById('totalUserPages').textContent = totalPages || 1;
        
        // Habilitar/deshabilitar botones de paginación
        document.getElementById('prevUserPage').disabled = currentUserPage <= 1;
        document.getElementById('nextUserPage').disabled = currentUserPage >= totalPages || totalPages === 0;
        
        // Calcular índices para la paginación
        const startIndex = (currentUserPage - 1) * usersPerPage;
        const endIndex = startIndex + usersPerPage;
        const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
        
        if (paginatedUsers.length > 0) {
            tableBody.innerHTML = '';
            
            paginatedUsers.forEach(user => {
                const statusClass = user.status === 'active' ? 'status-active' : 'status-inactive';
                const statusText = user.status === 'active' ? 'Activo' : 'Inactivo';
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${user.id}</td>
                    <td>${user.firstName}</td>
                    <td>${user.lastName}</td>
                    <td>${user.email}</td>
                    <td>${formatDate(user.registerDate)}</td>
                    <td>${user.ticketsCount}</td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td class="actions-cell">
                        <button class="action-btn edit-btn" title="Editar usuario">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" title="Eliminar usuario">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                `;
                
                // Agregar eventos para botones de acción
                row.querySelector('.edit-btn').addEventListener('click', () => {
                    editUser(user.id);
                });
                
                row.querySelector('.delete-btn').addEventListener('click', () => {
                    deleteUser(user.id);
                });
                
                tableBody.appendChild(row);
            });
        } else {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="no-records">No se encontraron usuarios</td>
                </tr>
            `;
        }
    }
    
    // Muestra los detalles de un ticket en el modal
    function showTicketDetails(ticketId) {
        const ticket = ticketsData.find(t => t.id === ticketId);
        
        if (ticket) {
            // Llenar detalles del ticket
            document.getElementById('ticketSubject').textContent = ticket.subject;
            document.getElementById('ticketId').textContent = ticket.id;
            document.getElementById('ticketUser').textContent = ticket.user;
            document.getElementById('ticketUserEmail').textContent = ticket.email;
            document.getElementById('ticketDate').textContent = formatDate(ticket.date);
            document.getElementById('ticketDescription').textContent = ticket.description;
            
            // Establecer estado
            const ticketStatus = document.getElementById('ticketStatus');
            ticketStatus.className = 'ticket-status';
            ticketStatus.classList.add(getStatusClass(ticket.status));
            ticketStatus.textContent = getStatusText(ticket.status);
            
            // Selector de estado
            const changeStatus = document.getElementById('changeStatus');
            changeStatus.value = ticket.status;
            
            // Archivos adjuntos
            const attachmentsList = document.getElementById('attachmentsList');
            
            if (ticket.attachments && ticket.attachments.length > 0) {
                document.getElementById('ticketAttachments').style.display = 'block';
                attachmentsList.innerHTML = '';
                
                ticket.attachments.forEach(attachment => {
                    const fileItem = document.createElement('div');
                    fileItem.className = 'attachment-item';
                    
                    let fileIcon = 'fa-file';
                    if (attachment.endsWith('.pdf')) fileIcon = 'fa-file-pdf';
                    else if (attachment.endsWith('.jpg') || attachment.endsWith('.png')) fileIcon = 'fa-file-image';
                    
                    fileItem.innerHTML = `
                        <i class="fas ${fileIcon}"></i>
                        <span>${attachment}</span>
                        <a href="#" class="download-link"><i class="fas fa-download"></i></a>
                    `;
                    
                    attachmentsList.appendChild(fileItem);
                });
            } else {
                document.getElementById('ticketAttachments').style.display = 'none';
            }
            
            // Conversación
            const conversationThread = document.getElementById('conversationThread');
            conversationThread.innerHTML = '';
            
            ticket.conversation.forEach(message => {
                const messageItem = document.createElement('div');
                messageItem.className = `message ${message.isAdmin ? 'admin-message' : 'user-message'}`;
                
                messageItem.innerHTML = `
                    <div class="message-header">
                        <span class="message-sender">${message.sender}</span>
                        <span class="message-date">${message.date}</span>
                    </div>
                    <div class="message-content">
                        ${message.message}
                    </div>
                `;
                
                conversationThread.appendChild(messageItem);
            });
            
            // Limpiar campo de respuesta
            document.getElementById('replyMessage').value = '';
            
            // Guardar ID de ticket actual
            document.getElementById('sendReply').dataset.ticketId = ticketId;
            
            // Mostrar modal
            document.getElementById('ticketDetailModal').style.display = 'block';
        }
    }
    
    // Enviar respuesta a un ticket
    function sendTicketReply() {
        const ticketId = document.getElementById('sendReply').dataset.ticketId;
        const replyMessage = document.getElementById('replyMessage').value.trim();
        const newStatus = document.getElementById('changeStatus').value;
        
        if (replyMessage) {
            const ticket = ticketsData.find(t => t.id === ticketId);
            
            if (ticket) {
                // Actualizar estado si cambió
                if (ticket.status !== newStatus) {
                    ticket.status = newStatus;
                }
                
                // Agregar mensaje a la conversación
                const now = new Date();
                const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
                
                ticket.conversation.push({
                    sender: 'Administrador',
                    message: replyMessage,
                    date: formattedDate,
                    isAdmin: true
                });
                
                // Actualizar la interfaz de usuario
                const conversationThread = document.getElementById('conversationThread');
                const messageItem = document.createElement('div');
                messageItem.className = 'message admin-message';
                
                messageItem.innerHTML = `
                    <div class="message-header">
                        <span class="message-sender">Administrador</span>
                        <span class="message-date">${formattedDate}</span>
                    </div>
                    <div class="message-content">
                        ${replyMessage}
                    </div>
                `;
                
                conversationThread.appendChild(messageItem);
                
                // Limpiar campo de respuesta
                document.getElementById('replyMessage').value = '';
                
                // Actualizar badge de estado
                const ticketStatus = document.getElementById('ticketStatus');
                ticketStatus.className = 'ticket-status';
                ticketStatus.classList.add(getStatusClass(newStatus));
                ticketStatus.textContent = getStatusText(newStatus);
                
                // Mostrar notificación de éxito
                showNotification('Respuesta enviada correctamente');
                
                // Actualizar contadores del dashboard si es necesario
                updateDashboard();
            }
        } else {
            // Mostrar error si el mensaje está vacío
            showNotification('Por favor, escribe un mensaje de respuesta', 'error');
        }
    }
    
    // Funciones de filtrado
    function filterTickets() {
        // Resetear paginación
        currentTicketPage = 1;
        loadTickets();
    }
    
    // Funciones de paginación
    function changePage(type, direction) {
        if (type === 'tickets') {
            const nextPage = currentTicketPage + direction;
            const totalPages = Math.ceil(ticketsData.length / ticketsPerPage);
            
            if (nextPage >= 1 && nextPage <= totalPages) {
                currentTicketPage = nextPage;
                loadTickets();
            }
        } else if (type === 'users') {
            const nextPage = currentUserPage + direction;
            const totalPages = Math.ceil(usersData.length / usersPerPage);
            
            if (nextPage >= 1 && nextPage <= totalPages) {
                currentUserPage = nextPage;
                loadUsers();
            }
        }
    }
    
    // Editar usuario
    function editUser(userId) {
        const user = usersData.find(u => u.id === userId);
        
        if (user) {
            // En una aplicación real, aquí abriríamos un modal con un formulario para editar
            // Para esta demo, simplemente mostramos una alerta
            alert(`Editando usuario: ${user.firstName} ${user.lastName}`);
            
            // Aquí iría el código para mostrar un modal con los datos del usuario y permitir editarlos
            // Por ahora simulamos la edición cambiando el estado
            user.status = user.status === 'active' ? 'inactive' : 'active';
            
            // Recargar la tabla
            loadUsers();
            showNotification('Usuario actualizado correctamente');
        }
    }
    
    // Eliminar usuario
    function deleteUser(userId) {
        // En una aplicación real, pediríamos confirmación y enviaríamos una petición al servidor
        if (confirm('¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.')) {
            usersData = usersData.filter(user => user.id !== userId);
            loadUsers();
            updateDashboard();
            showNotification('Usuario eliminado correctamente');
        }
    }
    
    // Guardar configuración
    function saveSettings(type) {
        let message;
        
        switch (type) {
            case 'general':
                // Aquí guardaríamos los valores en la base de datos
                message = 'Configuración general guardada correctamente';
                break;
            case 'tickets':
                // Actualizar número de tickets por página
                const newTicketsPerPage = parseInt(document.getElementById('ticketsPerPage').value);
                if (newTicketsPerPage !== ticketsPerPage) {
                    ticketsPerPage = newTicketsPerPage;
                    currentTicketPage = 1; // Resetear paginación
                    loadTickets();
                }
                message = 'Configuración de tickets guardada correctamente';
                break;
            case 'security':
                // Validar que las contraseñas coincidan
                const password = document.getElementById('adminPassword').value;
                const confirmPassword = document.getElementById('confirmPassword').value;
                
                if (password && password !== confirmPassword) {
                    showNotification('Las contraseñas no coinciden', 'error');
                    return;
                }
                
                message = 'Configuración de seguridad guardada correctamente';
                break;
        }
        
        showNotification(message);
    }
    
    // Funciones de utilidad
    
    // Formatear fecha
    function formatDate(dateString) {
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    }
    
    // Obtener clase de estado
    function getStatusClass(status) {
        switch (status) {
            case 'pending':
                return 'status-pending';
            case 'inProgress':
                return 'status-progress';
            case 'resolved':
                return 'status-resolved';
            default:
                return '';
        }
    }
    
    // Obtener texto de estado
    function getStatusText(status) {
        switch (status) {
            case 'pending':
                return 'Pendiente';
            case 'inProgress':
                return 'En proceso';
            case 'resolved':
                return 'Resuelto';
            default:
                return 'Desconocido';
        }
    }
    
    // Mostrar notificación
    function showNotification(message, type = 'success') {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        // Icono según tipo
        let icon = 'fa-check-circle';
        if (type === 'error') icon = 'fa-exclamation-circle';
        else if (type === 'warning') icon = 'fa-exclamation-triangle';
        
        notification.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${message}</span>
        `;
        
        // Agregar al DOM
        document.body.appendChild(notification);
        
        // Mostrar con animación
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Ocultar después de 3 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    // Inicialización de eventos para botones dinámicos
    document.getElementById('userSearch') && document.getElementById('userSearch').addEventListener('input', () => {
        currentUserPage = 1;
        loadUsers();
    });
    
    // Inicializar la aplicación
    switchSection('dashboard');
});