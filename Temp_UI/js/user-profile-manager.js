/**
 * User Profile Manager
 * Handles user profile display and editing functionality
 */

const UserProfileManager = {
  currentUser: null,

  init() {
    this.bindEvents();
    this.refreshProfile();
    console.log('UserProfileManager initialized');
  },

  bindEvents() {
    // Edit profile button
    const editBtn = document.getElementById('edit-profile-btn');
    if (editBtn) {
      editBtn.addEventListener('click', () => this.openEditModal());
    }

    // Profile edit form
    const editForm = document.getElementById('profile-edit-form');
    if (editForm) {
      editForm.addEventListener('submit', (e) => this.handleProfileUpdate(e));
    }

    // Close modal events
    const closeBtn = document.getElementById('close-profile-modal');
    const cancelBtn = document.getElementById('cancel-profile-edit');
    const backdrop = document.getElementById('profile-modal-backdrop');

    if (closeBtn) closeBtn.addEventListener('click', () => this.closeEditModal());
    if (cancelBtn) cancelBtn.addEventListener('click', () => this.closeEditModal());
    if (backdrop) backdrop.addEventListener('click', () => this.closeEditModal());
  },

  async refreshProfile() {
    try {
      // Load user data from storage or use default
      this.currentUser = await StorageManager.load('satspay_user') || window.DefaultUser;
      
      // Update profile display
      this.updateProfileDisplay();
      
    } catch (error) {
      console.error('Error refreshing profile:', error);
      this.currentUser = window.DefaultUser;
      this.updateProfileDisplay();
    }
  },

  updateProfileDisplay() {
    if (!this.currentUser) return;

    // Update user initials
    const initials = document.getElementById('user-initials');
    if (initials) {
      const nameInitials = this.currentUser.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
      initials.textContent = nameInitials;
    }

    // Update profile info
    const nameEl = document.getElementById('user-name');
    const emailEl = document.getElementById('user-email');
    const ageEl = document.getElementById('user-age');
    const walletIdEl = document.getElementById('user-wallet-id');
    const memberSinceEl = document.getElementById('user-member-since');

    if (nameEl) nameEl.textContent = this.currentUser.name;
    if (emailEl) emailEl.textContent = this.currentUser.email;
    if (ageEl) ageEl.textContent = this.currentUser.age;
    if (walletIdEl) {
      walletIdEl.textContent = this.currentUser.walletId || 'Not generated';
    }
    if (memberSinceEl) {
      memberSinceEl.textContent = Utils.formatDate(this.currentUser.memberSince || this.currentUser.createdAt);
    }
  },

  openEditModal() {
    const modal = document.getElementById('profile-edit-modal');
    if (!modal) return;

    // Populate form with current data
    const nameInput = document.getElementById('edit-name');
    const emailInput = document.getElementById('edit-email');
    const ageInput = document.getElementById('edit-age');

    if (nameInput) nameInput.value = this.currentUser.name;
    if (emailInput) emailInput.value = this.currentUser.email;
    if (ageInput) ageInput.value = this.currentUser.age;

    // Show modal
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    
    // Focus first input
    if (nameInput) nameInput.focus();
  },

  closeEditModal() {
    const modal = document.getElementById('profile-edit-modal');
    if (!modal) return;

    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
  },

  async handleProfileUpdate(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const updatedData = {
      name: formData.get('name').trim(),
      email: formData.get('email').trim(),
      age: parseInt(formData.get('age'))
    };

    // Validate data
    const errors = this.validateProfileData(updatedData);
    if (errors.length > 0) {
      ToastManager.show(errors[0], 'error');
      return;
    }

    try {
      // Update user data
      this.currentUser = {
        ...this.currentUser,
        ...updatedData
      };

      // Save to storage
      await StorageManager.save('satspay_user', this.currentUser);
      
      // Update display
      this.updateProfileDisplay();
      
      // Close modal
      this.closeEditModal();
      
      ToastManager.show('Profile updated successfully!', 'success');
      
    } catch (error) {
      console.error('Error updating profile:', error);
      ToastManager.show('Failed to update profile', 'error');
    }
  },

  validateProfileData(data) {
    const errors = [];

    if (!data.name || data.name.length < 2) {
      errors.push('Name must be at least 2 characters long');
    }

    if (!Utils.validateEmail(data.email)) {
      errors.push('Please enter a valid email address');
    }

    if (!data.age || data.age < 18 || data.age > 120) {
      errors.push('Age must be between 18 and 120');
    }

    return errors;
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  UserProfileManager.init();
});

// Export for use in other modules
window.UserProfileManager = UserProfileManager;