import 'cypress-iframe';
import { FORM_ELEMENTS, URLS, TIMEOUTS, AVAILABLE_FORM_ELEMENTS, PAGE_OPERATIONS } from '../../support/constants';
import '@4tw/cypress-drag-drop';
import "cypress-real-events/support";
import { SELECTORS } from '../../support/selectors';

describe('Form Builder Test', () => {
    beforeEach(() => {
        cy.visit(URLS.home);
        cy.loadSelector('autoModalLoginBtn').should('be.visible');
        cy.fixture('users.json').then((data) => {
            cy.clogin(data.paidUser.email, data.paidUser.password, 200);
        });
        cy.visit(URLS.forms);
        cy.fixture('advancedFormData').then((data) => {
            cy.wrap(data.userFormA).as('userDefinedFormA');
            cy.wrap(data.userFormB).as('userDefinedFormB');
        });
        Cypress.on('unhandledrejection', (event) => {
          if (event.reason.message.includes('Failed to fetch')) {
            return false; // Ignore the error so the test doesn't fail
          }
        });
        cy.intercept('POST', '**/r.stripe.com/b', (req) => {
            req.headers['user-agent'] =
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36';
            req.continue((res) => {
              res.send({ statusCode: 200, body: {} });
            });
        }).as('stripeRequest');
    });

    // Build a user defined form A
    it.only('Should build a user-defined form A', () => {
        cy.get('@userDefinedFormA').then((userDefinedFormA) => {
            // cy.createNewForm(userDefinedFormA.title, userDefinedFormA.description);
            cy.openForm(userDefinedFormA.title);
            cy.url({ timeout: TIMEOUTS.pageLoad }).should('match', /\/forms\/[a-f0-9-]{36}$/);
            cy.wait(TIMEOUTS.default);
            // cy.wait(200000);
            userDefinedFormA.elements.forEach( (element, index) => {
                const defaultSettings = AVAILABLE_FORM_ELEMENTS[element.key]?.defaultSettings;
                if (!defaultSettings) {
                  throw new Error(`Unsupported element type: ${element.key}`);
                }
                const settings = { ...defaultSettings, ...element.settings };
                if (FORM_ELEMENTS[element.key]) {
                    cy.formDrag(element.key, FORM_ELEMENTS[element.key][0], index + 1);
                    cy[FORM_ELEMENTS[element.key][1]](settings);
                } else {
                    throw new Error(`Unsupported element type: ${element.key}`);
                }

            });
        });

        // Save Form
        cy.saveForm();
    });

    // Build a user defined form B
    it('Should build a user-defined form B', () => {
        cy.get('@userDefinedFormB').then((userDefinedFormB) => {
            // cy.createNewForm(userDefinedFormB.title, userDefinedFormB.description);
            cy.openForm(userDefinedFormB.title);
            cy.url({ timeout: TIMEOUTS.pageLoad }).should('match', /\/forms\/[a-f0-9-]{36}$/);
            cy.wait(TIMEOUTS.default);
            userDefinedFormB.elements.forEach( (element, index) => {
                const defaultSettings = AVAILABLE_FORM_ELEMENTS[element.key]?.defaultSettings;
                if (!defaultSettings) {
                  throw new Error(`Unsupported element type: ${element.key}`);
                }
        
                const settings = { ...defaultSettings, ...element.settings };
                if (FORM_ELEMENTS[element.key]) {
                    cy.formDrag(element.key, FORM_ELEMENTS[element.key][0], index + 2);
                    cy[FORM_ELEMENTS[element.key][1]](settings);
                } else {
                    throw new Error(`Unsupported element type: ${element.key}`);
                }

            });
            // Save Form
            cy.saveForm();
            cy.assignPDF(userDefinedFormB);
            cy.saveFormDocument();
            cy.publishAndLinkForm();
            cy.fillForm(userDefinedFormB.elements);
            cy.wait(1000);
            cy.loadSelector('primaryBtn')
              .contains('span', PAGE_OPERATIONS.next)
              .click();
            cy.loadSelector('primaryBtn')
              .contains('span', PAGE_OPERATIONS.signature)
              .click();
            cy.frameLoaded('iframe[src*="https://hs-abnahme.a-trust.at"]');
            cy.iframe()
              .find('#handynummer')
              .clear()
              .type(userDefinedFormB.stripeInfo.userName);
            cy.iframe()
              .find('#signaturpasswort')
              .clear()
              .type(userDefinedFormB.stripeInfo.PW);
            cy.iframe()
              .find('#Button_Identification')
              .click();
            cy.origin('https://checkout.stripe.com', { args: { userDefinedFormB } }, ({ userDefinedFormB }) => {
              cy.on('uncaught:exception', (err, runnable) => {
                console.log('Uncaught error:', err);
                // Prevent the test from failing
                return false;
              });
              cy.wait(150000);
              cy.get('#email')
                .clear()
                .type(userDefinedFormB.stripeInfo.email);
              cy.get('#cardNumber')
                .clear()
                .type(userDefinedFormB.stripeInfo.cardNumber);
              cy.get('#cardExpiry')
                .clear()
                .type(userDefinedFormB.stripeInfo.expireDate);
              cy.get('#cardCvc')
                .clear()
                .type(userDefinedFormB.stripeInfo.cvc);
              cy.get('#billingName')
                .clear()
                .type(userDefinedFormB.stripeInfo.cardholderName);
              cy.get('#billingCountry')
                .select(userDefinedFormB.stripeInfo.country);
              if (userDefinedFormB.stripeInfo.zip !== '') {
                  cy.get('#billingPostalCode')
                    .clear()
                    .type(userDefinedFormB.stripeInfo.zip);
              }
              cy.get('.SubmitButton')
                .click();
            });
            cy.url().should('include', '?submitted');
        });
    });
    // // Delete the created form
    // it('Delete the user-defined form A', () => {
    //     cy.get('@userDefinedForm').then((userDefinedForm) => {
    //         cy.delForm(userDefinedForm.title);
    //     });
    // });
});
