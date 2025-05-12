/**
 * Profile page functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    initializeProfile();
    
    // Initialize report issue functionality
    const reportIssueBtn = document.getElementById('report-issue-btn');
    
    if (reportIssueBtn) {
        reportIssueBtn.addEventListener('click', () => {
            // You could replace this with a modal or a more sophisticated reporting mechanism
            const issueDetails = prompt('Por favor, describe el problema que estás experimentando:');
            
            if (issueDetails) {
                // In a real application, you would send this to a backend service
                alert('Gracias por reportar el problema. Nuestro equipo de soporte lo revisará pronto.');
                
                // Optional: Log the issue (in a real app, this would be an API call)
                console.log('Problema reportado:', issueDetails);
            }
        });
    }
});

function initializeProfile() {
    // Initialize profile editing
    initializeProfileEditing();
    
    // Initialize profile image upload
    initializeImageUpload();
    
    // Initialize CV management
    initializeCVManagement();
    
    // Initialize activity chart
    initializeActivityChart();
    
    // Load recent activity
    loadRecentActivity();
}

function initializeProfileEditing() {
    const editInfoBtn = document.getElementById('edit-info');
    const saveInfoBtn = document.getElementById('save-info');
    const cancelEditBtn = document.getElementById('cancel-edit-info');
    const infoForm = document.getElementById('info-form');
    
    if (editInfoBtn && saveInfoBtn && cancelEditBtn && infoForm) {
        // Store original form values
        let originalValues = {};
        
        // Edit button click
        editInfoBtn.addEventListener('click', function() {
            // Store original values
            const inputs = infoForm.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                originalValues[input.id] = input.value;
                input.disabled = false;
            });
            
            // Show save and cancel buttons, hide edit button
            saveInfoBtn.style.display = 'block';
            cancelEditBtn.style.display = 'block';
            editInfoBtn.style.display = 'none';
        });
        
        // Cancel button click
        cancelEditBtn.addEventListener('click', function() {
            // Restore original values
            const inputs = infoForm.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                input.value = originalValues[input.id];
                input.disabled = true;
            });
            
            // Hide save and cancel buttons, show edit button
            saveInfoBtn.style.display = 'none';
            cancelEditBtn.style.display = 'none';
            editInfoBtn.style.display = 'block';
        });
        
        // Save button click
        saveInfoBtn.addEventListener('click', function() {
            // Update profile info
            updateProfileInfo();
            
            // Disable inputs
            const inputs = infoForm.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                input.disabled = true;
            });
            
            // Hide save and cancel buttons, show edit button
            saveInfoBtn.style.display = 'none';
            cancelEditBtn.style.display = 'none';
            editInfoBtn.style.display = 'block';
            
            // Show success notification
            showNotification('Perfil actualizado correctamente', 'success');
        });
    }
}

function updateProfileInfo() {
    // Get form values
    const nombre = document.getElementById('nombre').value;
    const apellido = document.getElementById('apellido').value;
    const departamento = document.getElementById('departamento').value;
    const posicion = document.getElementById('posicion').value;
    
    // Update profile info
    const profileName = document.querySelector('.profile-name');
    const profilePosition = document.querySelector('.profile-position');
    const profileDepartment = document.querySelector('.profile-department');
    
    if (profileName && profilePosition && profileDepartment) {
        profileName.textContent = `Dr. ${nombre} ${apellido}`;
        profilePosition.textContent = posicion;
        profileDepartment.textContent = departamento;
    }
    
    // Update user menu
    const userName = document.querySelector('.user-name');
    if (userName) {
        userName.textContent = `Dr. ${nombre} ${apellido}`;
    }
}

function initializeImageUpload() {
    const uploadBtn = document.getElementById('upload-image-btn');
    const profileImage = document.querySelector('.profile-image');
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    
    // Set default icon when no profile picture exists
    if (!profileImage.src || profileImage.src.includes('placeholder')) {
        profileImage.src = 'path/to/default-profile-icon.svg'; // Replace with actual path to a default icon
    }

    if (uploadBtn && profileImage) {
        uploadBtn.addEventListener('click', function() {
            fileInput.click();
        });

        fileInput.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    // Set profile image to uploaded file
                    profileImage.src = e.target.result;
                    
                    // Update user menu avatar
                    const userAvatar = document.querySelector('.user-avatar');
                    if (userAvatar) {
                        userAvatar.src = profileImage.src;
                    }
                    
                    // Optional: Save to localStorage for persistence
                    localStorage.setItem('profilePicture', e.target.result);
                    
                    showNotification('Imagen de perfil actualizada', 'success');
                };
                
                reader.readAsDataURL(file);
            } else {
                showNotification('Por favor, seleccione un archivo de imagen válido', 'error');
            }
        });
    }

    // Load saved profile picture on page load
    const savedProfilePicture = localStorage.getItem('profilePicture');
    if (savedProfilePicture) {
        profileImage.src = savedProfilePicture;
        
        // Update user menu avatar
        const userAvatar = document.querySelector('.user-avatar');
        if (userAvatar) {
            userAvatar.src = savedProfilePicture;
        }
    }
}

function initializeActivityChart() {
    const ctx = document.getElementById('activityChart');
    
    if (ctx) {
        // Sample data
        const data = {
            labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
            datasets: [
                {
                    label: 'Documentos',
                    data: [5, 3, 7, 4, 6, 8, 5, 3, 9, 6, 4, 7],
                    backgroundColor: 'rgba(74, 111, 220, 0.2)',
                    borderColor: 'rgba(74, 111, 220, 1)',
                    borderWidth: 2,
                    tension: 0.4
                },
                {
                    label: 'Publicaciones',
                    data: [2, 1, 0, 1, 3, 1, 0, 2, 1, 2, 1, 2],
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 2,
                    tension: 0.4
                }
            ]
        };
        
        // Create chart
        new Chart(ctx, {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(200, 200, 200, 0.1)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top'
                    },
                    title: {
                        display: true,
                        text: 'Actividad anual'
                    }
                }
            }
        });
    }
}

// CV Upload and Download Functionality
function initializeCVManagement() {
    const cvUploadBtn = document.getElementById('cv-upload-btn');
    const cvDownloadBtn = document.getElementById('cv-download-btn');
    const cvFileInput = document.getElementById('cv-file-input');

    // Initialize CV data in localStorage if not exists
    if (!localStorage.getItem('cvData')) {
        const initialCVData = {
            formacionAcademica: document.getElementById('formacion-academica').value.trim(),
            experienciaProfesional: document.getElementById('experiencia-profesional').value.trim(),
            publicaciones: document.getElementById('publicaciones').value.trim(),
            proyectos: document.getElementById('proyectos').value.trim()
        };
        localStorage.setItem('cvData', JSON.stringify(initialCVData));
    }

    // Upload button click handler
    cvUploadBtn.addEventListener('click', () => {
        cvFileInput.click();
    });

    // Download button click handler
    cvDownloadBtn.addEventListener('click', generatePDF);

    // File input change handler
    cvFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.type === 'application/pdf') {
                mammoth.extractRawText({ arrayBuffer: file })
                    .then((result) => {
                        localStorage.setItem('uploadedCVContent', result.value);
                        showNotification('CV subido exitosamente', 'success');
                    })
                    .catch((error) => {
                        console.error('Error processing PDF:', error);
                        showNotification('Error al procesar el CV', 'error');
                    });
            } else if (file.type === 'text/plain' || file.type === 'application/msword') {
                preserveCVFormat(file);
            } else {
                showNotification('Por favor, suba un archivo PDF o de texto', 'error');
            }
        }
    });

    // Initialize CV form with data from localStorage
    const cvData = JSON.parse(localStorage.getItem('cvData') || '{}');
    document.getElementById('formacion-academica').value = cvData.formacionAcademica || '';
    document.getElementById('experiencia-profesional').value = cvData.experienciaProfesional || '';
    document.getElementById('publicaciones').value = cvData.publicaciones || '';
    document.getElementById('proyectos').value = cvData.proyectos || '';
}

function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Retrieve CV data
    const cvData = JSON.parse(localStorage.getItem('cvData') || '{}');

    // Check if a custom CV has been uploaded
    const uploadedCV = localStorage.getItem('uploadedCVContent');

    if (uploadedCV) {
        // If a custom CV has been uploaded, use its content directly
        doc.setFontSize(12);
        const splitText = doc.splitTextToSize(uploadedCV, 180);
        doc.text(splitText, 15, 20);
        doc.save('curriculum_vitae.pdf');
        return;
    }

    // Default professional layout
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Curriculum Vitae', 105, 20, null, null, 'center');

    let yOffset = 40;

    // Personal Information Section
    doc.setFontSize(14);
    doc.text('Información Personal', 20, yOffset);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    yOffset += 10;

    doc.text(`Nombre: ${cvData.nombre || 'No especificado'}`, 30, yOffset);
    yOffset += 7;
    doc.text(`Correo: ${cvData.correo || 'No especificado'}`, 30, yOffset);
    yOffset += 7;
    doc.text(`Teléfono: ${cvData.telefono || 'No especificado'}`, 30, yOffset);
    yOffset += 15;

    // Sections with dynamic content
    const sections = [
        { title: 'Formación Académica', content: 'formacionAcademica' },
        { title: 'Experiencia Profesional', content: 'experienciaProfesional' },
        { title: 'Publicaciones', content: 'publicaciones' },
        { title: 'Proyectos', content: 'proyectos' }
    ];

    sections.forEach(section => {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(section.title, 20, yOffset);
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        yOffset += 10;

        const content = cvData[section.content] || 'No hay información disponible';
        const lines = doc.splitTextToSize(content, 170);
        doc.text(lines, 30, yOffset);
        yOffset += lines.length * 7 + 10;
    });

    // Save the PDF
    doc.save('curriculum_vitae.pdf');
}

// Enhanced CV upload function to preserve original formatting
function preserveCVFormat(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const content = e.target.result;
        localStorage.setItem('uploadedCVContent', content);
        showNotification('CV subido con su formato original', 'success');
    };
    reader.readAsText(file);
}
    const cvEditBtn = document.getElementById('cv-edit-btn');
    const cvForm = document.getElementById('cv-form');
    const cvFileInput = document.getElementById('cv-file-input');

    // CV Upload handling
    if (cvUploadBtn && cvFileInput) {
        cvUploadBtn.addEventListener('click', () => {
            cvFileInput.click();
        });

        cvFileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                // Check file type
                if (file.type === 'application/pdf') {
                    // Read and parse PDF file
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        // Use mammoth to extract text from PDF
                        mammoth.extractRawText({ arrayBuffer: e.target.result })
                            .then((result) => {
                                // Populate CV form with extracted text
                                populateCVForm(result.value);
                                showNotification('CV subido exitosamente', 'success');
                            })
                            .catch((error) => {
                                console.error('Error processing PDF:', error);
                                showNotification('Error al procesar el CV', 'error');
                            });
                    };
                    reader.readAsArrayBuffer(file);
                } else {
                    showNotification('Por favor, suba un archivo PDF', 'error');
                }
            }
        });
    }

    // CV Edit handling
    if (cvEditBtn && cvForm) {
        cvEditBtn.addEventListener('click', () => {
            const inputs = cvForm.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                input.disabled = false;
            });
            cvEditBtn.style.display = 'none';
            document.getElementById('cv-save-btn').style.display = 'block';
            document.getElementById('cv-cancel-btn').style.display = 'block';
        });
    }

    // CV Save handling
    const cvSaveBtn = document.getElementById('cv-save-btn');
    if (cvSaveBtn) {
        cvSaveBtn.addEventListener('click', () => {
            // Validate and save CV information
            saveCVInformation();
            
            // Disable inputs
            const inputs = cvForm.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                input.disabled = true;
            });

            // Hide save and cancel, show edit
            cvSaveBtn.style.display = 'none';
            document.getElementById('cv-cancel-btn').style.display = 'none';
            cvEditBtn.style.display = 'block';

            showNotification('CV actualizado correctamente', 'success');
        });
    }

    // CV Download handling
    if (cvDownloadBtn) {
        cvDownloadBtn.addEventListener('click', () => {
            generatePDF();
        });
    }

function populateCVForm(text) {
    // Basic text parsing (this would need to be more sophisticated)
    const sections = {
        'Datos Personales': ['nombre', 'correo', 'telefono'],
        'Formación Académica': ['formacion-academica'],
        'Experiencia Profesional': ['experiencia-profesional'],
        'Publicaciones': ['publicaciones'],
        'Proyectos': ['proyectos']
    };

    // Simple parsing logic (would need refinement)
    Object.entries(sections).forEach(([section, fields]) => {
        fields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                // Basic text extraction for each field
                const sectionStart = text.indexOf(section);
                if (sectionStart !== -1) {
                    // Extract text for this field (very basic implementation)
                    const nextSectionStart = Object.keys(sections).find(
                        key => text.indexOf(key, sectionStart + section.length) !== -1
                    );
                    const sectionText = nextSectionStart 
                        ? text.substring(sectionStart, text.indexOf(nextSectionStart))
                        : text.substring(sectionStart);
                    
                    element.value = sectionText.trim();
                }
            }
        });
    });
}

function saveCVInformation() {
    // Collect form data
    const cvData = {
        nombre: document.getElementById('nombre').value,
        correo: document.getElementById('correo').value,
        telefono: document.getElementById('telefono').value,
        formacionAcademica: document.getElementById('formacion-academica').value,
        experienciaProfesional: document.getElementById('experiencia-profesional').value,
        publicaciones: document.getElementById('publicaciones').value,
        proyectos: document.getElementById('proyectos').value
    };

    // In a real application, this would be saved to a backend
    localStorage.setItem('cvData', JSON.stringify(cvData));
}

function generatePDF() {
    // Use jsPDF to generate a professional CV PDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Retrieve CV data
    const cvData = JSON.parse(localStorage.getItem('cvData') || '{}');

    // Set up PDF layout
    doc.setFontSize(18);
    doc.text('Curriculum Vitae', 105, 20, null, null, 'center');

    doc.setFontSize(12);
    let yOffset = 40;

    // Personal Information
    doc.setFont('helvetica', 'bold');
    doc.text('Datos Personales', 20, yOffset);
    doc.setFont('helvetica', 'normal');
    yOffset += 10;
    doc.text(`Nombre: ${cvData.nombre || ''}`, 30, yOffset);
    yOffset += 7;
    doc.text(`Correo: ${cvData.correo || ''}`, 30, yOffset);
    yOffset += 7;
    doc.text(`Teléfono: ${cvData.telefono || ''}`, 30, yOffset);
    yOffset += 15;

    // Academic Formation
    doc.setFont('helvetica', 'bold');
    doc.text('Formación Académica', 20, yOffset);
    doc.setFont('helvetica', 'normal');
    yOffset += 10;
    const formacionLines = doc.splitTextToSize(cvData.formacionAcademica || '', 170);
    doc.text(formacionLines, 30, yOffset);
    yOffset += formacionLines.length * 7 + 10;

    // Professional Experience
    doc.setFont('helvetica', 'bold');
    doc.text('Experiencia Profesional', 20, yOffset);
    doc.setFont('helvetica', 'normal');
    yOffset += 10;
    const experienciaLines = doc.splitTextToSize(cvData.experienciaProfesional || '', 170);
    doc.text(experienciaLines, 30, yOffset);
    yOffset += experienciaLines.length * 7 + 10;

    // Publications
    doc.setFont('helvetica', 'bold');
    doc.text('Publicaciones', 20, yOffset);
    doc.setFont('helvetica', 'normal');
    yOffset += 10;
    const publicacionesLines = doc.splitTextToSize(cvData.publicaciones || '', 170);
    doc.text(publicacionesLines, 30, yOffset);
    yOffset += publicacionesLines.length * 7 + 10;

    // Projects
    doc.setFont('helvetica', 'bold');
    doc.text('Proyectos', 20, yOffset);
    doc.setFont('helvetica', 'normal');
    yOffset += 10;
    const proyectosLines = doc.splitTextToSize(cvData.proyectos || '', 170);
    doc.text(proyectosLines, 30, yOffset);

    // Save the PDF
    doc.save('curriculum_vitae.pdf');
}

function loadRecentActivity() {
    const activityList = document.getElementById('activity-list');
    
    if (activityList) {
        // Sample activities
        const activities = [
            {
                icon: 'fa-file-alt',
                title: 'Subiste un nuevo documento',
                description: 'Programa de estudio - Matemáticas avanzadas',
                time: '2 horas'
            },
            {
                icon: 'fa-comment',
                title: 'Comentaste en un documento',
                description: 'Investigación sobre Machine Learning',
                time: '1 día'
            },
            {
                icon: 'fa-share-alt',
                title: 'Compartiste un documento',
                description: 'Conferencia: Inteligencia Artificial y Ética',
                time: '2 días'
            },
            {
                icon: 'fa-edit',
                title: 'Editaste un documento',
                description: 'Datos de investigación 2023',
                time: '3 días'
            },
            {
                icon: 'fa-folder-plus',
                title: 'Creaste una nueva carpeta',
                description: 'Artículos',
                time: '1 semana'
            }
        ];
        
        // Add activities to list
        activities.forEach(activity => {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            
            activityItem.innerHTML = `
                <div class="activity-icon">
                    <i class="fas ${activity.icon}"></i>
                </div>
                <div class="activity-details">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-description">${activity.description}</div>
                    <div class="activity-time">Hace ${activity.time}</div>
                </div>
            `;
            
            activityList.appendChild(activityItem);
        });
    }
}