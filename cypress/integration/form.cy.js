import { URLS, TIMEOUTS, LOG_OUT_TEXT, ALERT_MESSAGES, FORM_ELEMENTS, PAGE_OPERATIONS} from '../support/constants';
import '@4tw/cypress-drag-drop';
import "cypress-real-events/support";

describe('RocketForm Management Tests', () => {
    beforeEach(() => {
        cy.visit(URLS.home, { timeout: TIMEOUTS.pageLoad });
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

    // Create a Form with a Element
    it('Create a form with each element', () => {
        cy.wait(50000);
        cy.fixture('formData.json').then((data) => {
            cy.get(`a[title="${data.title}"]`).click();
            cy.url().should('match', /\/forms\/[a-f0-9-]{36}$/);
        });
        cy.wait(30000);
        Object.entries(FORM_ELEMENTS).forEach(([key, element]) => {
            // Drag and drop the form element
            if(key == 'calc') {
                cy.loadSelector('formAdvance').click();
            } else if(key == 'stripe') {
                cy.loadSelector('formPayment').click();
            };
            cy.formDrag(key, element, 1);
            // Remove the form element
            cy.log(`"${key}" element delete`);
            cy.get('.list-group')
              .find('.rud-drop-item')
              .first()
              .realHover();
            cy.get('form div')
              .find('.rud-drop-item')
              .find('.rud-drop-item-menu')
              .find('div:last-child button')
              .should('be.visible')
              .click(); 
            if (key == 'stripe') {
                cy.loadSelector('messageBox')
                  .should('be.visible')
                  .contains('span', PAGE_OPERATIONS.ok)
                  .parent('button')
                  .click();
            }
            // Verify that the form element is removed
            cy.get('form div')
              .children()
              .should('have.length', 0);
            cy.wait(1000);
        });
    });

    // Create a form with 10 elements and verify warning alert and save the created form.
    it('Create a form with 10 random elements, verify warning alert and save the created form', () => {
        cy.wait(50000);
        cy.fixture('formData.json').then((data) => {
            cy.get(`a[title="${data.title}"]`).click();
            cy.url().should('match', /\/forms\/[a-f0-9-]{36}$/);
        });
        cy.wait(30000);
        let baseClicked    = true;
        let advanceClicked = false;
        let paymentClicked = false;
        cy.fixture('formData.json').then((data) => {
            const formElements = Object.entries(data.elements);
            formElements.forEach(([key, element], index) => {
                if (!baseClicked) {
                    cy.loadSelector('formBase').click();
                    baseClicked    = true;
                    advanceClicked = false;
                    paymentClicked = false;
                } 
                if (!advanceClicked && ['calc', 'country', 'upload', 'rating', 'sign', 'selectColor'].includes(element.key)) {
                    cy.log('Clicking Advanced for advanced elements');
                    cy.loadSelector('formAdvance').click();
                    baseClicked    = false;
                    advanceClicked = true;
                    paymentClicked = false;
                } 
                if (!paymentClicked && element.key === 'stripe') {
                    cy.log('Clicking Payment for Stripe');
                    cy.loadSelector('formPayment').click();
                    baseClicked    = false;
                    advanceClicked = false;
                    paymentClicked = true;
                }
                cy.formDrag(element.key, element.value, index+1);
            });
            cy.log('Verifying that form elements are disabled');
            cy.loadSelector('warnAlert')
              .should('be.visible')
              .find('span')
              .should('contain', ALERT_MESSAGES.formLimit);
            cy.log('Saving the created form');
            cy.loadSelector('saveBtn').click();
            cy.intercept('PUT', `${URLS.api}/forms/*`).as('saveFormRequest');
            cy.wait('@saveFormRequest').then((interception) => {
                const { response } = interception;
                expect(response.statusCode).to.eq(200);
                expect(response.body).to.have.property('success', 1);
            });
        });
    });
});