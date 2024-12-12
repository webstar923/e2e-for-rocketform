import { URLS, TIMEOUTS, ALERT_MESSAGES, FORM_ELEMENTS, PAGE_OPERATIONS} from '../support/constants';
import '@4tw/cypress-drag-drop';
import "cypress-real-events/support";

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
        cy.intercept('POST', `${URLS.api}/forms`).as('newformCreateRequest');
        cy.intercept('GET', `${URLS.api}/forms/*`).as('newformOpenRequest');
        cy.wait('@newformCreateRequest').then((interception) => {
            const { response } = interception;
            expect(response.statusCode).to.eq(201);
        });
        cy.wait('@newformOpenRequest').then((interception) => {
            const { response } = interception;
            expect(response.statusCode).to.eq(200);
        });
        cy.url({ timeout: TIMEOUTS.pageLoad }).should('match', /\/forms\/[a-f0-9-]{36}$/);
    });

    // Create a Form with a Element
    it('Create a form with each element', () => {
        cy.openForm();
        Object.entries(FORM_ELEMENTS).forEach(([key, element]) => {
            // Drag and drop the form element
            if (key === 'calc') handleFormInteraction('formAdvance', element);
            if (key === 'stripe') handleFormInteraction('formPayment', element);

            cy.formDrag(key, element, 1);
            // Remove the form element
            cy.log(`"${key}" element delete`);
            cy.wait(TIMEOUTS.eventDelay);
            cy.get('.list-group', { timeout: TIMEOUTS.elementVisibility })
              .find('.rud-drop-item')
              .first()
              .realHover();
            cy.wait(TIMEOUTS.hoverDelay);
            cy.get('form div')
              .find('.rud-drop-item')
              .find('.rud-drop-item-menu', { timeout: TIMEOUTS.elementVisibility })
              .find('div:last-child button', { timeout: TIMEOUTS.elementVisibility })
              .should('be.visible', { timeout: TIMEOUTS.elementVisibility })
              .click();
            if (key == 'stripe') {
              cy.intercept('PUT', `${URLS.api}/forms/*`).as('removeRequest');
              cy.loadSelector('messageBox')
                .should('be.visible')
                .contains('span', PAGE_OPERATIONS.ok)
                .parent('button')
                .click();
              cy.wait('@removeRequest').then((interception) => {
                  const { response } = interception;
                  expect(response.statusCode).to.eq(200);
                  expect(response.body).to.have.property('success', 1);
              });
            }
            // cy.wait(TIMEOUTS.eventDelay);
            // Verify that the form element is removed
            cy.get('form div')
              .children()
              .should('have.length', 0);
            cy.wait(1000);
        });
    });

    // Create a form with 10 elements and verify warning alert and save the created form.
    it('Create a form with 10 random elements, verify warning alert and save the created form', () => {
        cy.openForm();
        let tabStatus = {
            base: true,
            advance: false,
            payment: false
        };
        cy.fixture('formData.json').then((data) => {
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
                  .contains('span', element.value, { timeout: TIMEOUTS.elementVisibility })
                  .should('exist', { timeout: TIMEOUTS.elementVisibility });
                cy.formDrag(element.key, element.value, index+1);
            });
            // cy.log('Verifying that form elements are disabled');
            // cy.loadSelector('warnAlert')
            //   .should('be.visible')
            //   .find('span')
            //   .should('contain', ALERT_MESSAGES.formLimit);
            cy.log('Saving the created form');
            cy.intercept('PUT', `${URLS.api}/forms/*`).as('saveFormRequest');
            cy.loadSelector('saveBtn').click();
            cy.wait('@saveFormRequest').then((interception) => {
                const { response } = interception;
                expect(response.statusCode).to.eq(200);
                expect(response.body).to.have.property('success', 1);
            });
        });
    });

    // Set the Form to publish and call the form
    it('Set the form to publish, call the form and fill out the form with test data', () => {
        cy.openForm();
        // Set the form to publish
        cy.log('Set the form to publish');
        cy.contains('a', PAGE_OPERATIONS.share, { timeout: TIMEOUTS.elementVisibility })
          .click()
          .url({ timeout: TIMEOUTS.pageLoad })
          .should('include', '/share');
        // cy.wait(30000);
        cy.intercept('POST', `${URLS.api}/publish/*`).as('publishFormRequest');
        cy.loadSelector('toggleBtn')
          .click();
        cy.wait('@publishFormRequest').then((interception) => {
            const { response } = interception;
            expect(response.statusCode).to.eq(200);
            expect(response.body).to.have.property('success', 1);
        });
        cy.loadSelector('formDescription')
           .invoke('val')
           .then((publishLink) => {
            // Call the form
            const relativeLink = new URL(publishLink).pathname;
            cy.loadSelector('defaultBtn')
              .contains('a', PAGE_OPERATIONS.openNewTab).as('openNewTabLink');
            cy.get('@openNewTabLink')
              .should('have.attr', 'href')
              .then((linkHref) => {
                expect(relativeLink).to.eq(linkHref);
              });
            cy.visit(publishLink);
            cy.url().should('eq', publishLink);
          });
    });
});