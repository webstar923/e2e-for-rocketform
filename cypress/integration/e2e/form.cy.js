import { URLS, TIMEOUTS, ALERT_MESSAGES, FORM_ELEMENTS, PAGE_OPERATIONS} from '../../support/constants';
import '@4tw/cypress-drag-drop';
import "cypress-real-events/support";
import { SELECTORS } from '../../support/selectors';

function handleFormInteraction(formSelector) {
  cy.loadSelector(formSelector).click();
}

describe('RocketForm Management Tests', () => {
    beforeEach(() => {
        cy.visit(URLS.home);
        cy.loadSelector('autoModalLoginBtn').should('be.visible');
        cy.fixture('users.json').then((data) => {
            cy.clogin(data.validUser.email, data.validUser.password, 200);
        });
        cy.visit(URLS.forms);
    });

    // This is a test for when title is not entered.
    it('Fails to create a new form with blank title field', () => {
        cy.createNewForm();
        cy.contains(ALERT_MESSAGES.nameRequired, { timeout: TIMEOUTS.elementVisibility }).should('be.visible');
    });

    // This is a test for when title is entered.
    it('Create a new form', () => {
        cy.fixture('formData.json').then((data) => {
            cy.createNewForm(data.title, data.description);
        });
        cy.url({ timeout: TIMEOUTS.pageLoad }).should('match', /\/forms\/[a-f0-9-]{36}$/);
    });

    // Create a form with user defined 10 random elements
    it('Create a form with 10 random elements, verify warning alert and save the created form', () => {
        let tabStatus = {
            base: true,
            advance: false,
            payment: false
        };
        cy.fixture('formData.json').then((data) => {
          cy.openForm(data.title);
            const formElements = Object.entries(data.elements);
            formElements.forEach(([key, element], index) => {
                if (!tabStatus.base && !['calc', 'country', 'upload', 'rating', 'sign', 'selectColor'].includes(element.key) && element.key !== 'stripe') {
                    handleFormInteraction('formBase');
                    tabStatus = { base: true, advance: false, payment: false };
                } 
                if (!tabStatus.advance && ['calc', 'country', 'upload', 'rating', 'sign', 'selectColor'].includes(element.key)) {
                    cy.log('Clicking Advanced for advanced elements');
                    handleFormInteraction('formAdvance');
                    tabStatus = { base: false, advance: true, payment: false };
                } 
                if (!tabStatus.payment && element.key === 'stripe') {
                    cy.log('Clicking Payment for Stripe');
                    handleFormInteraction('formPayment');
                    tabStatus = { base: false, advance: false, payment: true };
                }
                cy.loadSelector('formElement')
                  .contains('span', element.settings.label, { timeout: TIMEOUTS.elementVisibility })
                  .should('exist', { timeout: TIMEOUTS.elementVisibility });
                cy.formDrag(element.key, element.settings.label, index+1);
            });
            // cy.log('Verifying that form elements are disabled');
            // cy.loadSelector('warnAlert')
            //   .should('be.visible')
            //   .find('span')
            //   .should('contain', ALERT_MESSAGES.formLimit);
            cy.saveForm();
        });
    });

    // Set the Form to publish and call the form
    it('Set the form to publish, call the form and fill out the form with test data', () => {
        cy.fixture('formData.json').then((data) => {
          cy.openForm(data.title);
        });
        
        // Publish Form
        cy.publishAndLinkForm();

        // Fill out the form with test data
        cy.fixture('formData.json').then((data) => {
          cy.fillForm(data.elements);
          cy.wait(1000);
          cy.intercept('POST', `${URLS.api}/submission`).as('sendRequest');
          cy.loadSelector('primaryBtn')
            .contains('span', PAGE_OPERATIONS.send)
            .click();
          cy.wait('@sendRequest', { timeout: TIMEOUTS.elementVisibility }).then((interception) => {
              const { response } = interception;
              expect(response.statusCode).to.eq(200);
          });
        });
    });

    // Delete the created form
    it('Delete the created form', () => {
      cy.fixture('formData').then((data) => {
        cy.delForm(data.title);
      });
    });
});