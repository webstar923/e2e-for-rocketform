import { TIMEOUTS, LOG_OUT_TEXT, LOGIN_BUTTON_TEXT, ALERT_MESSAGES } from '../support/constants';

describe('Login Tests', () => {
  beforeEach(() => {
    cy.visit('/', { timeout: TIMEOUTS.pageLoad });
    cy.loadSelector('autoModalLoginButton').should('be.visible');
  });

  it('Should open the login modal when clicking the login button', () => {
    cy.loadSelector('autoModalLoginButton').click();
    cy.loadSelector('emailField').should('exist');
    cy.loadSelector('passwordField').should('exist');
    cy.loadSelector('primaryButton').contains(LOGIN_BUTTON_TEXT).should('exist');
  });

  it('Logs in with correct credentials', () => {
    cy.fixture('users.json').then((data) => {
      cy.clogin(data.validUser.email, data.validUser.password);
      cy.contains(LOG_OUT_TEXT).should('exist');
    });
  });

  it('Fails to log in with incorrect credentials', () => {
    cy.fixture('users.json').then((data) => {
      cy.clogin(data.invalidUser.email, data.invalidUser.password);
      cy.loadSelector('errorAlert')
        .contains(ALERT_MESSAGES.invalidCredentials)
        .should('be.visible');
    });
  });

  it('Fails to log in with blank email and password fields', () => {
    cy.clogin('', '');
    cy.contains(ALERT_MESSAGES.emailRequired).should('be.visible');
    cy.contains(ALERT_MESSAGES.passwordRequired).should('be.visible');
  });
});