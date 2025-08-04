// DOM Elements
const loginForm = document.getElementById('loginForm');
const loadingScreen = document.getElementById('loadingScreen');
const dashboardContent = document.getElementById('dashboardContent');
const logoutBtn = document.getElementById('logoutBtn');

// Show loading screen
function showLoadingScreen() {
    if (loadingScreen) loadingScreen.style.display = 'flex';
}

// Hide loading screen
function hideLoadingScreen() {
    if (loadingScreen) loadingScreen.style.display = 'none';
}

// Show error message
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        
        // Hide error after 5 seconds
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }
}

// Login function
async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        showError('Please enter both email and password');
        return;
    }
    
    try {
        showLoadingScreen();
        
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.detail || 'Login failed');
        }
        
        // Store the token
        localStorage.setItem('adminToken', data.access_token);
        
        // Redirect to dashboard
        window.location.href = '/admin/dashboard';
        
    } catch (error) {
        console.error('Login error:', error);
        showError(error.message || 'Invalid email or password');
    } finally {
        hideLoadingScreen();
    }
}

// Logout function
function logout() {
    localStorage.removeItem('adminToken');
    window.location.href = '/admin';
}

// Check authentication
function checkAuth() {
    const token = localStorage.getItem('adminToken');
    const isLoginPage = window.location.pathname === '/admin' || 
                       window.location.pathname === '/admin/';
    
    if (token && isLoginPage) {
        // If user is already logged in, redirect to dashboard
        window.location.href = '/admin/dashboard';
    } else if (!token && !isLoginPage) {
        // If not logged in and not on login page, redirect to login
        window.location.href = '/admin';
    }
}

// Initialize the page
function init() {
    // Hide loading screen after page loads
    window.addEventListener('load', () => {
        setTimeout(hideLoadingScreen, 500);
    });
    
    // Check authentication status
    checkAuth();
    
    // Add event listeners
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            login();
        });
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
}

// Start the application
init();
