// Main JavaScript for NAS File Manager
class NASFileManager {
    constructor() {
        this.init();
        this.bindEvents();
        this.selectedFiles = [];
    }

    init() {
        // Initialize mobile menu
        this.mobileMenuToggle = document.getElementById('mobileMenuToggle');
        this.mobileNav = document.getElementById('mobileNav');
        
        // Initialize dropzone
        this.dropzone = document.getElementById('dropzone');
        this.fileInput = document.getElementById('fileInput');
        this.browseBtn = document.getElementById('browseBtn');
        this.filePreview = document.getElementById('filePreview');
        this.fileList = document.getElementById('fileList');
        this.uploadBtn = document.getElementById('uploadBtn');
        
        // Initialize progress
        this.progressContainer = document.getElementById('progressContainer');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        
        // Initialize modals
        this.createFolderModal = document.getElementById('createFolderModal');
        this.createFolderBtn = document.getElementById('createFolderBtn');
        this.closeFolderModal = document.getElementById('closeFolderModal');
        this.cancelFolderBtn = document.getElementById('cancelFolderBtn');
        this.createFolderSubmit = document.getElementById('createFolderSubmit');
        
        // Initialize view toggle
        this.viewBtns = document.querySelectorAll('.view-btn');
        this.foldersGrid = document.getElementById('foldersGrid');
    }

    bindEvents() {
        // Mobile menu toggle
        if (this.mobileMenuToggle) {
            this.mobileMenuToggle.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }

        // File upload events
        if (this.browseBtn) {
            this.browseBtn.addEventListener('click', () => {
                this.fileInput.click();
            });
        }

        if (this.fileInput) {
            this.fileInput.addEventListener('change', (e) => {
                this.handleFileSelect(e.target.files);
            });
        }

        if (this.dropzone) {
            // Dropzone events
            this.dropzone.addEventListener('click', () => {
                this.fileInput.click();
            });

            this.dropzone.addEventListener('dragover', (e) => {
                e.preventDefault();
                this.dropzone.classList.add('dragover');
            });

            this.dropzone.addEventListener('dragleave', (e) => {
                e.preventDefault();
                this.dropzone.classList.remove('dragover');
            });

            this.dropzone.addEventListener('drop', (e) => {
                e.preventDefault();
                this.dropzone.classList.remove('dragover');
                this.handleFileSelect(e.dataTransfer.files);
            });
        }

        if (this.uploadBtn) {
            this.uploadBtn.addEventListener('click', () => {
                this.uploadFiles();
            });
        }

        // Modal events
        if (this.createFolderBtn) {
            this.createFolderBtn.addEventListener('click', () => {
                this.openCreateFolderModal();
            });
        }

        if (this.closeFolderModal) {
            this.closeFolderModal.addEventListener('click', () => {
                this.closeCreateFolderModal();
            });
        }

        if (this.cancelFolderBtn) {
            this.cancelFolderBtn.addEventListener('click', () => {
                this.closeCreateFolderModal();
            });
        }

        if (this.createFolderSubmit) {
            this.createFolderSubmit.addEventListener('click', () => {
                this.createFolder();
            });
        }

        // View toggle events
        this.viewBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.toggleView(btn.dataset.view);
            });
        });

        // Navigation events
        this.bindNavigationEvents();

        // Search functionality
        this.bindSearchEvents();

        // File actions
        this.bindFileActions();

        // Close modal when clicking outside
        if (this.createFolderModal) {
            this.createFolderModal.addEventListener('click', (e) => {
                if (e.target === this.createFolderModal) {
                    this.closeCreateFolderModal();
                }
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
    }

    toggleMobileMenu() {
        this.mobileMenuToggle.classList.toggle('active');
        this.mobileNav.classList.toggle('active');
    }

    handleFileSelect(files) {
        this.selectedFiles = Array.from(files);
        this.displayFilePreview();
    }

    displayFilePreview() {
        if (this.selectedFiles.length === 0) {
            this.filePreview.style.display = 'none';
            return;
        }

        this.filePreview.style.display = 'block';
        this.fileList.innerHTML = '';

        this.selectedFiles.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                </svg>
                <span>${file.name}</span>
                <span style="margin-left: auto; color: var(--text-secondary);">${this.formatFileSize(file.size)}</span>
                <button class="action-btn" onclick="nasManager.removeFile(${index})" title="Remove">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            `;
            this.fileList.appendChild(fileItem);
        });
    }

    removeFile(index) {
        this.selectedFiles.splice(index, 1);
        this.displayFilePreview();
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    uploadFiles() {
        if (this.selectedFiles.length === 0) {
            this.showNotification('Please select files to upload', 'warning');
            return;
        }

        const formData = new FormData();
        const folderId = document.getElementById('folderSelect').value;

        this.selectedFiles.forEach(file => {
            formData.append('files[]', file);
        });
        formData.append('folder_id', folderId);

        this.progressContainer.style.display = 'block';
        this.uploadBtn.disabled = true;

        // Simulate upload progress (replace with actual upload logic)
        this.simulateUpload()
            .then(() => {
                this.showNotification('Files uploaded successfully!', 'success');
                this.resetUploadForm();
            })
            .catch((error) => {
                this.showNotification('Upload failed: ' + error.message, 'error');
            })
            .finally(() => {
                this.uploadBtn.disabled = false;
                this.progressContainer.style.display = 'none';
            });
    }

    simulateUpload() {
        return new Promise((resolve, reject) => {
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 15;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(interval);
                    setTimeout(() => resolve(), 500);
                }
                this.updateProgress(progress);
            }, 200);
        });
    }

    updateProgress(percent) {
        const roundedPercent = Math.round(percent);
        this.progressFill.style.width = roundedPercent + '%';
        this.progressText.textContent = roundedPercent + '%';
    }

    resetUploadForm() {
        this.selectedFiles = [];
        this.fileInput.value = '';
        this.filePreview.style.display = 'none';
        this.progressFill.style.width = '0%';
        this.progressText.textContent = '0%';
    }

    openCreateFolderModal() {
        this.createFolderModal.classList.add('active');
        document.getElementById('folderName').focus();
    }

    closeCreateFolderModal() {
        this.createFolderModal.classList.remove('active');
        document.getElementById('folderName').value = '';
        document.getElementById('parentFolder').value = '';
    }

    createFolder() {
        const folderName = document.getElementById('folderName').value.trim();
        const parentFolder = document.getElementById('parentFolder').value;

        if (!folderName) {
            this.showNotification('Please enter a folder name', 'warning');
            return;
        }

        // Simulate folder creation (replace with actual API call)
        setTimeout(() => {
            this.showNotification(`Folder "${folderName}" created successfully!`, 'success');
            this.closeCreateFolderModal();
            // Refresh folder list here
        }, 500);
    }

    toggleView(view) {
        this.viewBtns.forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-view="${view}"]`).classList.add('active');

        if (view === 'list') {
            this.foldersGrid.style.display = 'none';
            // Show list view (implement as needed)
        } else {
            this.foldersGrid.style.display = 'grid';
        }
    }

    bindNavigationEvents() {
        // Handle navigation clicks
        const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link, .bottom-nav-item');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleNavigation(link.getAttribute('href'));
            });
        });
    }

    handleNavigation(href) {
        // Remove active class from all nav items
        document.querySelectorAll('.nav-link, .mobile-nav-link, .bottom-nav-item').forEach(item => {
            item.classList.remove('active');
        });

        // Add active class to clicked items
        document.querySelectorAll(`[href="${href}"]`).forEach(item => {
            item.classList.add('active');
        });

        // Close mobile menu if open
        this.mobileNav.classList.remove('active');
        this.mobileMenuToggle.classList.remove('active');

        // Handle section visibility (implement as needed)
        this.showSection(href.substring(1));
    }

    showSection(sectionName) {
        // Hide all sections
        const sections = document.querySelectorAll('.upload-section, .folders-section, .files-section');
        sections.forEach(section => {
            section.style.display = 'none';
        });

        // Show requested section
        switch (sectionName) {
            case 'files':
                document.querySelector('.files-section').style.display = 'block';
                break;
            case 'folders':
                document.querySelector('.folders-section').style.display = 'block';
                break;
            case 'upload':
                document.querySelector('.upload-section').style.display = 'block';
                break;
            default:
                // Show all sections by default
                sections.forEach(section => {
                    section.style.display = 'block';
                });
        }
    }

    bindSearchEvents() {
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.performSearch(e.target.value);
                }, 300);
            });
        }
    }

    performSearch(query) {
        if (!query.trim()) {
            // Show all files/folders
            this.resetSearch();
            return;
        }

        // Implement search logic here
        console.log('Searching for:', query);
        this.showNotification(`Searching for "${query}"...`, 'info');
    }

    resetSearch() {
        // Reset search results
        console.log('Resetting search');
    }

    bindFileActions() {
        // Handle file download and delete actions
        document.addEventListener('click', (e) => {
            if (e.target.closest('[title="Download"]')) {
                e.preventDefault();
                this.downloadFile(e.target.closest('tr'));
            }
            
            if (e.target.closest('[title="Delete"]')) {
                e.preventDefault();
                this.deleteFile(e.target.closest('tr'));
            }
        });
    }

    downloadFile(row) {
        const fileName = row.querySelector('.file-info span').textContent;
        this.showNotification(`Downloading ${fileName}...`, 'info');
        // Implement actual download logic here
    }

    deleteFile(row) {
        const fileName = row.querySelector('.file-info span').textContent;
        if (confirm(`Are you sure you want to delete "${fileName}"?`)) {
            this.showNotification(`Deleting ${fileName}...`, 'info');
            // Implement actual delete logic here
            setTimeout(() => {
                row.remove();
                this.showNotification(`${fileName} deleted successfully`, 'success');
            }, 1000);
        }
    }

    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + U for upload
        if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
            e.preventDefault();
            this.fileInput.click();
        }

        // Ctrl/Cmd + N for new folder
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            this.openCreateFolderModal();
        }

        // Escape to close modals
        if (e.key === 'Escape') {
            this.closeCreateFolderModal();
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
                <button class="notification-close">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
        `;

        // Add notification styles if not already added
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 9999;
                    max-width: 400px;
                    padding: 16px;
                    border-radius: 8px;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                    transform: translateX(100%);
                    transition: transform 0.3s ease-in-out;
                }
                .notification.show {
                    transform: translateX(0);
                }
                .notification-info {
                    background: #3B82F6;
                    color: white;
                }
                .notification-success {
                    background: #10B981;
                    color: white;
                }
                .notification-warning {
                    background: #F59E0B;
                    color: white;
                }
                .notification-error {
                    background: #EF4444;
                    color: white;
                }
                .notification-content {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                }
                .notification-close {
                    background: none;
                    border: none;
                    color: inherit;
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 4px;
                    opacity: 0.8;
                    transition: opacity 0.2s;
                }
                .notification-close:hover {
                    opacity: 1;
                }
            `;
            document.head.appendChild(styles);
        }

        // Add to DOM
        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Auto remove after 5 seconds
        const autoRemove = setTimeout(() => {
            this.removeNotification(notification);
        }, 5000);

        // Handle close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            clearTimeout(autoRemove);
            this.removeNotification(notification);
        });
    }

    removeNotification(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    // Utility method to update storage stats
    updateStorageStats(totalStorage, usedStorage, totalFiles) {
        const statCards = document.querySelectorAll('.stat-card');
        if (statCards.length >= 3) {
            statCards[0].querySelector('.stat-value').textContent = totalStorage;
            statCards[1].querySelector('.stat-value').textContent = usedStorage;
            statCards[2].querySelector('.stat-value').textContent = totalFiles.toLocaleString();
        }
    }

    // Method to refresh file list
    refreshFileList() {
        // Implement API call to refresh file list
        this.showNotification('Refreshing file list...', 'info');
        // Simulate refresh
        setTimeout(() => {
            this.showNotification('File list updated', 'success');
        }, 1000);
    }

    // Method to handle folder filter
    handleFolderFilter() {
        const folderFilter = document.getElementById('folderFilter');
        if (folderFilter) {
            folderFilter.addEventListener('change', (e) => {
                const selectedFolder = e.target.value;
                this.filterFilesByFolder(selectedFolder);
            });
        }
    }

    filterFilesByFolder(folderId) {
        // Implement folder filtering logic
        console.log('Filtering by folder:', folderId);
        this.showNotification(
            folderId ? `Showing files from selected folder` : 'Showing all files',
            'info'
        );
    }
}

// Initialize the NAS File Manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.nasManager = new NASFileManager();
});

// Service Worker registration for PWA capabilities
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Handle online/offline status
window.addEventListener('online', () => {
    document.body.classList.remove('offline');
    if (window.nasManager) {
        window.nasManager.showNotification('Connection restored', 'success');
    }
});

window.addEventListener('offline', () => {
    document.body.classList.add('offline');
    if (window.nasManager) {
        window.nasManager.showNotification('You are offline', 'warning');
    }
});

// Handle visibility change for performance optimization
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Page is hidden, pause any ongoing operations
        console.log('Page hidden - pausing operations');
    } else {
        // Page is visible, resume operations
        console.log('Page visible - resuming operations');
        if (window.nasManager) {
            // Optionally refresh data when page becomes visible
            // window.nasManager.refreshFileList();
        }
    }
});