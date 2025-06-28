/**
 * Main JavaScript - Survey Platform Indonesia
 * PHP Version for Web Hosting
 */

// Utility functions
function showAlert(message, type = 'success') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    alert.style.position = 'fixed';
    alert.style.top = '20px';
    alert.style.right = '20px';
    alert.style.zIndex = '1000';
    alert.style.minWidth = '300px';
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

// Form validation
function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return true;
    
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.style.borderColor = 'var(--error)';
            isValid = false;
        } else {
            field.style.borderColor = 'var(--border)';
        }
    });
    
    return isValid;
}

// Password strength indicator
function checkPasswordStrength(password) {
    const strength = {
        score: 0,
        feedback: []
    };
    
    if (password.length >= 8) strength.score += 1;
    else strength.feedback.push('Minimal 8 karakter');
    
    if (/[A-Z]/.test(password)) strength.score += 1;
    else strength.feedback.push('Gunakan huruf besar');
    
    if (/[0-9]/.test(password)) strength.score += 1;
    else strength.feedback.push('Gunakan angka');
    
    if (/[^A-Za-z0-9]/.test(password)) strength.score += 1;
    else strength.feedback.push('Gunakan karakter khusus');
    
    return strength;
}

// Auto-save form data
function saveFormData(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    const formData = new FormData(form);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
        if (key !== 'password' && key !== 'confirm_password') {
            data[key] = value;
        }
    }
    
    localStorage.setItem(`form_${formId}`, JSON.stringify(data));
}

function loadFormData(formId) {
    const savedData = localStorage.getItem(`form_${formId}`);
    if (!savedData) return;
    
    const data = JSON.parse(savedData);
    const form = document.getElementById(formId);
    if (!form) return;
    
    Object.keys(data).forEach(key => {
        const field = form.querySelector(`[name="${key}"]`);
        if (field && field.type !== 'password') {
            field.value = data[key];
        }
    });
}

// Survey modal functionality
function openSurveyModal(surveyId, surveyData) {
    const modal = document.createElement('div');
    modal.className = 'survey-modal';
    modal.innerHTML = `
        <div class="modal-backdrop" onclick="closeSurveyModal()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>${surveyData.title}</h3>
                <button onclick="closeSurveyModal()" class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <p>${surveyData.description}</p>
                <div class="survey-details">
                    <div><strong>Reward:</strong> Rp ${new Intl.NumberFormat('id-ID').format(surveyData.reward)}</div>
                    <div><strong>Durasi:</strong> ${surveyData.duration} menit</div>
                    <div><strong>Kategori:</strong> ${surveyData.category}</div>
                </div>
                <p class="survey-warning">
                    <strong>Penting:</strong> Pastikan Anda menjawab dengan jujur dan menyelesaikan survei hingga akhir untuk mendapatkan reward.
                </p>
            </div>
            <div class="modal-footer">
                <button onclick="closeSurveyModal()" class="btn btn-secondary">Batal</button>
                <button onclick="startSurveyInNewTab('${surveyId}')" class="btn btn-primary">Mulai Survei</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
}

function closeSurveyModal() {
    const modal = document.querySelector('.survey-modal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = 'auto';
    }
}

function startSurveyInNewTab(surveyId) {
    const surveyUrl = `survey.php?id=${surveyId}`;
    window.open(surveyUrl, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
    closeSurveyModal();
}

// Profile completion calculator
function updateProfileCompletion() {
    const form = document.querySelector('form');
    if (!form) return;
    
    const fields = ['name', 'email', 'phone', 'birth_date', 'gender', 'education', 'occupation', 'income'];
    let completed = 0;
    
    fields.forEach(fieldName => {
        const field = form.querySelector(`[name="${fieldName}"]`);
        if (field && field.value.trim()) {
            completed++;
        }
    });
    
    const percentage = Math.round((completed / fields.length) * 100);
    const progressBar = document.querySelector('.progress-bar');
    const progressText = document.querySelector('.progress-text');
    
    if (progressBar) {
        progressBar.style.width = `${percentage}%`;
    }
    
    if (progressText) {
        progressText.textContent = `${percentage}%`;
    }
    
    return percentage;
}

// Loading states
function showLoading(button) {
    if (!button) return;
    
    button.disabled = true;
    button.innerHTML = '<span class="spinner"></span> Memproses...';
}

function hideLoading(button, originalText) {
    if (!button) return;
    
    button.disabled = false;
    button.innerHTML = originalText;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Auto-save forms
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        if (form.id) {
            loadFormData(form.id);
            
            form.addEventListener('input', () => {
                saveFormData(form.id);
            });
        }
    });
    
    // Password strength indicator
    const passwordField = document.querySelector('input[type="password"]');
    if (passwordField) {
        passwordField.addEventListener('input', function() {
            const strength = checkPasswordStrength(this.value);
            // Add visual feedback here if needed
        });
    }
    
    // Form submission with loading states
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const submitButton = form.querySelector('button[type="submit"]');
            if (submitButton) {
                const originalText = submitButton.innerHTML;
                showLoading(submitButton);
                
                // Hide loading after 10 seconds as fallback
                setTimeout(() => {
                    hideLoading(submitButton, originalText);
                }, 10000);
            }
        });
    });
    
    // Profile completion tracking
    const profileForm = document.querySelector('#profile-form');
    if (profileForm) {
        profileForm.addEventListener('input', updateProfileCompletion);
        updateProfileCompletion();
    }
    
    // Auto-refresh dashboard stats every 5 minutes
    if (window.location.pathname.includes('dashboard.php')) {
        setInterval(() => {
            fetch('api/get-stats.php')
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        updateDashboardStats(data.stats);
                    }
                })
                .catch(console.error);
        }, 300000); // 5 minutes
    }
});

// Update dashboard stats without page refresh
function updateDashboardStats(stats) {
    const statElements = document.querySelectorAll('.stat-value');
    if (statElements.length >= 4) {
        statElements[0].textContent = stats.total_earnings;
        statElements[1].textContent = stats.completed_surveys;
        statElements[2].textContent = stats.completion_rate + '%';
        statElements[3].textContent = stats.available_surveys;
    }
}

// Handle survey completion callbacks
function handleSurveyCompletion(transactionId, reward) {
    showAlert(`Selamat! Anda telah menyelesaikan survei dan mendapatkan reward Rp ${new Intl.NumberFormat('id-ID').format(reward)}`, 'success');
    
    // Refresh page after 2 seconds to update stats
    setTimeout(() => {
        window.location.reload();
    }, 2000);
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.error);
    showAlert('Terjadi kesalahan. Silakan refresh halaman.', 'error');
});

// Add CSS for modal and loading states
const style = document.createElement('style');
style.textContent = `
    .survey-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .modal-backdrop {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
    }
    
    .modal-content {
        background: white;
        border-radius: 1rem;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        position: relative;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }
    
    .modal-header {
        padding: 1.5rem;
        border-bottom: 1px solid var(--border);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .modal-close {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: var(--text-muted);
    }
    
    .modal-body {
        padding: 1.5rem;
    }
    
    .modal-footer {
        padding: 1.5rem;
        border-top: 1px solid var(--border);
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
    }
    
    .survey-details {
        background: var(--surface);
        border-radius: 0.5rem;
        padding: 1rem;
        margin: 1rem 0;
    }
    
    .survey-details > div {
        margin-bottom: 0.5rem;
    }
    
    .survey-warning {
        background: rgb(245 158 11 / 0.1);
        border: 1px solid var(--warning);
        border-radius: 0.5rem;
        padding: 1rem;
        color: var(--warning);
        font-size: 0.875rem;
    }
`;
document.head.appendChild(style);