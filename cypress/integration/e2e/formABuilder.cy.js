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
            cy.wrap(data.userFormA).as('userDefinedForm');
        });
    });

    // Build a user defined form A
    it('Should build a user-defined form A ', () => {
        cy.get('@userDefinedForm').then((userDefinedForm) => {
            cy.createNewForm(userDefinedForm.title, userDefinedForm.description);
            cy.url({ timeout: TIMEOUTS.pageLoad }).should('match', /\/forms\/[a-f0-9-]{36}$/);
            cy.wait(TIMEOUTS.default);
            userDefinedForm.elements.forEach( (element, index) => {
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

    // Delete the created form
    it('Delete the user-defined form A', () => {
        cy.get('@userDefinedForm').then((userDefinedForm) => {
            cy.delForm(userDefinedForm.title);
        });
    });
});
