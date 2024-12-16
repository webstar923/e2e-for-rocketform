import { URLS, TIMEOUTS, LOGIN_BUTTON_TEXT, ALERT_MESSAGES } from '../support/constants';

Cypress.on('uncaught:exception', (err, runnable) => {
  if (err.message.includes('YT is not defined')) {
    return false; // Prevent Cypress from failing the test
  }
  return true; // Default behavior: fail the test on other errors
});

describe('Login Tests', () => {
  beforeEach(() => {
    cy.visit(URLS.home);
    cy.loadSelector('autoModalLoginBtn').should('be.visible');
  });

  // This is a test for displaying the login modal when clicking the login button.
  it('Should open the login modal when clicking the login button', () => {
    cy.loadSelector('autoModalLoginBtn').click();
    cy.loadSelector('emailField').should('exist');
    cy.loadSelector('passwordField').should('exist');
    cy.loadSelector('primaryBtn').contains(LOGIN_BUTTON_TEXT).should('exist');
  });

  // This is a test for logging in with correct user information.
  it('Logs in with correct credentials', () => {
    cy.fixture('users.json').then((data) => {
      cy.clogin(data.validUser.email, data.validUser.password, 200);
    });
  });

  // This is a test for logging in with incorrect user information.
  it('Fails to log in with incorrect credentials', () => {
    cy.fixture('users.json').then((data) => {
      cy.clogin(data.invalidUser.email, data.invalidUser.password, 422);
      cy.loadSelector('errorAlert')
        .contains(ALERT_MESSAGES.invalidCredentials, { timeout: TIMEOUTS.elementVisibility })
        .should('be.visible');
    });
  });

  // This is a test for when user information is not entered.
  it('Fails to log in with blank email and password fields', () => {
    cy.clogin('', '', 100);
    cy.contains(ALERT_MESSAGES.emailRequired, { timeout: TIMEOUTS.elementVisibility }).should('be.visible');
    cy.contains(ALERT_MESSAGES.passwordRequired, { timeout: TIMEOUTS.elementVisibility }).should('be.visible');
  });
});