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
          // Fill out the form with test data
        cy.fixture('formData.json').then((data) => {
          const formElements = Object.entries(data.elements);
          formElements.forEach(([key,element], index) => {
            switch (element.key) {
                case 'text':
                    cy.loadSelector('formItem')
                      .contains('label', new RegExp(element.value, 'i'))
                      .parent()
                      .find(SELECTORS.formDescription)
                      .type(element.data);
                    break;
                case 'email':
                    cy.loadSelector('formItem')
                      .contains('label', new RegExp(element.value, 'i'))
                      .parent()
                      .find(SELECTORS.formTitle)
                      .type(element.data);
                    break;
                case 'rating':
                    cy.loadSelector('formItem')
                      .contains('label', new RegExp(element.value, 'i'))
                      .parent()
                      .find(`span:nth-child(${element.data})`)
                      .click();
                    break;
                // case 'button':
                //     cy.contains('button', element.value).click();
                    // break;
                case 'switch':
                    cy.loadSelector('formItem')
                      .contains('label', new RegExp(element.value, 'i'))
                      .parent()
                      .find(SELECTORS.toggleBtn)
                      .click();
                    break;
                case 'input':
                    cy.loadSelector('formItem')
                      .contains('label', new RegExp(element.value, 'i'))
                      .parent()
                      .find(SELECTORS.formTitle)
                      .type(element.data);
                    break;
                case 'checkbox':
                    if ( element.data == true ) {
                      cy.loadSelector('checkItem')
                        .contains('span', new RegExp(element.value, 'i'))
                        .parent()
                        .click();
                    }
                    break;
                default:
                    cy.log('No action for element key: ' + element.key);
            }
          });
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
      cy.wait(TIMEOUTS.default);
      cy.fixture('formData.json').then((data) => {
        cy.get(`span[title="${data.title}"]`, { timeout: TIMEOUTS.elementVisibility })
          .closest('tr')
          .find('td:last-child .cell>div>button:nth-of-type(1)')
          .click();
        cy.intercept('DELETE', `${URLS.api}/forms/*`).as('deleteFormRequest');
        cy.loadSelector('confirmBox')
          .should('be.visible')
          .find(SELECTORS.primaryBtn)
          .click();      
        cy.wait('@deleteFormRequest', { timeout: TIMEOUTS.elementVisibility }).then((interception) => {
            const { response } = interception;
            expect(response.statusCode).to.eq(200);
        });
        cy.wait(TIMEOUTS.urlCheck);
      });
    });
});