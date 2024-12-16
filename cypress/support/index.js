import './commands';

// Global error handler to ignore "YT is not defined"
Cypress.on('uncaught:exception', (err) => {
    const ignoreErrors = ['YT is not defined', 'ResizeObserver loop limit exceeded'];
    if (ignoreErrors.some(errorMessage => err.message.includes(errorMessage))) {
        return false; // Prevent Cypress from failing the test
    }
    return true; // Default behavior: fail the test on other errors
});
