import { URLS, TIMEOUTS, LOG_OUT_TEXT, LOGIN_BUTTON_TEXT, ALERT_MESSAGES } from '../support/constants';

describe('Logout Tests', () => {
  beforeEach(() => {
    cy.visit(URLS.home, { timeout: TIMEOUTS.pageLoad });
    cy.loadSelector('autoModalLoginBtn').should('be.visible');
    cy.fixture('users.json').then((data) => {
        cy.clogin(data.validUser.email, data.validUser.password);
        cy.contains(LOG_OUT_TEXT).should('exist');
    });
  });

  // This is when clicking the logout button.
  it('Should log the user out and redirect to the home page', () => {
    cy.fixture('users.json').then((data) => {
        cy.loadSelector('dropdown')
          .contains('div', data.validUser.name)
          .parent()
          .click();
        cy.contains(LOG_OUT_TEXT).click();
    });
    cy.url().should('eq', Cypress.config('baseUrl'));
    // cy.getCookie('session_id').should('not.exist');
  });
});