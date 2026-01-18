// ===================================
// THEME MANAGEMENT
// ===================================

class ThemeManager {
    constructor() {
        this.theme = this.getInitialTheme();
        this.applyTheme(this.theme);
        this.setupThemeToggle();
    }

    getInitialTheme() {
        // Check localStorage first
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            return savedTheme;
        }

        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            return 'light';
        }

        // Default to dark
        return 'dark';
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.theme = theme;
        localStorage.setItem('theme', theme);
    }

    toggleTheme() {
        const newTheme = this.theme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
    }

    setupThemeToggle() {
        const toggleButton = document.getElementById('themeToggle');

        if (toggleButton) {
            // Click handler
            toggleButton.addEventListener('click', () => {
                this.toggleTheme();
            });

            // Keyboard handler
            toggleButton.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleTheme();
                }
            });
        }

        // Listen for system theme changes
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!localStorage.getItem('theme')) {
                    this.applyTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    }
}

// ===================================
// PASSWORD VISIBILITY TOGGLE
// ===================================

class PasswordToggle {
    constructor() {
        this.setupToggle();
    }

    setupToggle() {
        const toggleButton = document.getElementById('passwordToggle');
        const passwordInput = document.getElementById('password');

        if (toggleButton && passwordInput) {
            // Click handler
            toggleButton.addEventListener('click', () => {
                this.toggle(toggleButton, passwordInput);
            });

            // Keyboard handler
            toggleButton.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggle(toggleButton, passwordInput);
                }
            });
        }
    }

    toggle(button, input) {
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        button.classList.toggle('active', isPassword);

        // Update aria-label for accessibility
        button.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
    }
}

// ===================================
// FORM VALIDATION & SUBMISSION
// ===================================

class LoginForm {
    constructor() {
        this.form = document.getElementById('loginForm');
        this.emailInput = document.getElementById('email');
        this.passwordInput = document.getElementById('password');
        this.submitButton = document.getElementById('signInButton');

        this.setupForm();
    }

    setupForm() {
        if (!this.form) return;

        // Form submission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // Real-time validation
        this.emailInput?.addEventListener('blur', () => {
            this.validateEmail();
        });

        this.passwordInput?.addEventListener('blur', () => {
            this.validatePassword();
        });

        // Clear validation on input
        this.emailInput?.addEventListener('input', () => {
            this.clearError(this.emailInput);
        });

        this.passwordInput?.addEventListener('input', () => {
            this.clearError(this.passwordInput);
        });
    }

    validateEmail() {
        const email = this.emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email) {
            this.showError(this.emailInput, 'Email is required');
            return false;
        }

        if (!emailRegex.test(email)) {
            this.showError(this.emailInput, 'Please enter a valid email');
            return false;
        }

        this.clearError(this.emailInput);
        return true;
    }

    validatePassword() {
        const password = this.passwordInput.value;

        if (!password) {
            this.showError(this.passwordInput, 'Password is required');
            return false;
        }

        if (password.length < 6) {
            this.showError(this.passwordInput, 'Password must be at least 6 characters');
            return false;
        }

        this.clearError(this.passwordInput);
        return true;
    }

    showError(input, message) {
        const wrapper = input.closest('.input-wrapper');
        const group = input.closest('.form-group');

        // Add error styling
        input.style.borderColor = '#EF4444';

        // Remove existing error message
        const existingError = group.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Add error message
        const errorElement = document.createElement('span');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        errorElement.style.cssText = `
            font-size: var(--text-xs);
            color: #EF4444;
            margin-top: var(--space-1);
            display: block;
        `;

        wrapper.after(errorElement);
    }

    clearError(input) {
        const group = input.closest('.form-group');
        const errorElement = group?.querySelector('.error-message');

        input.style.borderColor = '';

        if (errorElement) {
            errorElement.remove();
        }
    }

    setLoading(isLoading) {
        if (isLoading) {
            this.submitButton.classList.add('loading');
            this.submitButton.disabled = true;
            this.form.querySelectorAll('input').forEach(input => {
                input.disabled = true;
            });
        } else {
            this.submitButton.classList.remove('loading');
            this.submitButton.disabled = false;
            this.form.querySelectorAll('input').forEach(input => {
                input.disabled = false;
            });
        }
    }

    async handleSubmit() {
        // Validate all fields
        const isEmailValid = this.validateEmail();
        const isPasswordValid = this.validatePassword();

        if (!isEmailValid || !isPasswordValid) {
            return;
        }

        // Show loading state
        this.setLoading(true);

        // Simulate API call
        try {
            await this.simulateLogin();

            // Success - you would normally redirect here
            this.showSuccess();
        } catch (error) {
            this.showError(this.emailInput, 'Invalid credentials. Please try again.');
        } finally {
            this.setLoading(false);
        }
    }

    simulateLogin() {
        // Simulate API call with 1.5s delay
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // For demo purposes, accept any valid email/password
                resolve();
            }, 1500);
        });
    }

    showSuccess() {
        // Create success notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: var(--space-6);
            right: var(--space-6);
            background: #10B981;
            color: white;
            padding: var(--space-4) var(--space-6);
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-xl);
            font-size: var(--text-sm);
            font-weight: var(--font-weight-medium);
            z-index: var(--z-top);
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = '✓ Login successful! Redirecting...';

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// ===================================
// INPUT FOCUS EFFECTS
// ===================================

class InputEffects {
    constructor() {
        this.setupInputs();
    }

    setupInputs() {
        const inputs = document.querySelectorAll('.form-input');

        inputs.forEach(input => {
            // Focus effect on icon
            input.addEventListener('focus', () => {
                const wrapper = input.closest('.input-wrapper');
                const icon = wrapper?.querySelector('.input-icon');
                if (icon) {
                    icon.style.color = 'var(--text-secondary)';
                }
            });

            input.addEventListener('blur', () => {
                const wrapper = input.closest('.input-wrapper');
                const icon = wrapper?.querySelector('.input-icon');
                if (icon && !input.value) {
                    icon.style.color = '';
                }
            });
        });
    }
}

// ===================================
// PERFORMANCE OPTIMIZATION
// ===================================

// Add animation styles dynamically to avoid FOUC
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ===================================
// INITIALIZATION
// ===================================

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

function init() {
    // Initialize all components
    new ThemeManager();
    new PasswordToggle();
    new LoginForm();
    new InputEffects();

    // Add loaded class for any CSS transitions
    document.body.classList.add('loaded');
}

// ===================================
// UTILITY: Trap Focus in Modal (Future-proof)
// ===================================

function trapFocus(element) {
    const focusableElements = element.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    element.addEventListener('keydown', (e) => {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    });
}

// ===================================
// EXPORT (for module systems)
// ===================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ThemeManager,
        PasswordToggle,
        LoginForm,
        InputEffects
    };
}
