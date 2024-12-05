import { URLS, TIMEOUTS, LOG_OUT_TEXT, ALERT_MESSAGES } from '../support/constants';
describe('RocketForm Management Tests', () => {
    beforeEach(() => {
        cy.visit('/', { timeout: TIMEOUTS.pageLoad });
        cy.loadSelector('autoModalLoginBtn').should('be.visible');
        cy.fixture('users.json').then((data) => {
            cy.clogin(data.validUser.email, data.validUser.password);
            cy.contains(LOG_OUT_TEXT).should('exist');
        });
        cy.visit(URLS.forms, { timeout: TIMEOUTS.pageLoad });
    });

    // This is a test for when title is not entered.
    it('Fails to create a new form with blank title field', () => {
        cy.createNewForm();
        cy.contains(ALERT_MESSAGES.nameRequired).should('be.visible');
    });

    // This is a test for when title is entered.
    it('Create a new form', () => {
        cy.fixture('formData.json').then((data) => {
            cy.createNewForm(data.title, data.description);
        });
        cy.url().should('match', /\/forms\/[a-f0-9-]{36}$/);
    });
});