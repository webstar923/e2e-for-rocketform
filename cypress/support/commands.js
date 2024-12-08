import { SELECTORS } from './selectors';
import { TIMEOUTS, LOGIN_BUTTON_TEXT, PAGE_OPERATIONS, FORM_HINT, MODAL_TITLE  } from './constants';

// Select the element
Cypress.Commands.add('loadSelector', (selectorName, options = {}) => {
  const { shouldExist = true, timeout = TIMEOUTS.elementVisibility } = options;

  const selector = SELECTORS[selectorName];
  if (!selector) {
    throw new Error(`Selector "${selectorName}" is not defined in SELECTORS.`);
  }

  const element = cy.get(selector, { timeout });

  if (shouldExist) {
    element.should('exist');
  }

  return element;
});

// Command for log in 
Cypress.Commands.add('clogin', (email, password) => {
  cy.loadSelector('autoModalLoginBtn').click();
  if (email) {
    cy.loadSelector('emailField').type(email);
  }
  if (password) {
    cy.loadSelector('passwordField').type(password);
  }
  cy.loadSelector('primaryBtn').contains(LOGIN_BUTTON_TEXT).click();
});
  
// Command for creating the new form
Cypress.Commands.add('createNewForm', (title = '', description = '') => {
  cy.loadSelector('primaryBtn')
    .contains('span', PAGE_OPERATIONS.new)
    .parent()
    .click();
  cy.loadSelector('modalDialog')
    .contains('span', MODAL_TITLE.newForm)
    .should('be.visible');
  if(title) {
    cy.get(`input[placeholder="${FORM_HINT.name}"]`).type(title);
  }
  if(description) {
    cy.loadSelector('formDescription').type(description);
  }
  cy.loadSelector('primaryBtn')
    .contains('span', PAGE_OPERATIONS.confirm)
    .click();
});

// Cammand for draganddroping the form element
Cypress.Commands.add('formDrag', (key, element) => {
  cy.log(`"${key}" element drag and drop`);
  cy.loadSelector('formElement')
    .contains('span', element)
    .parent()
    .drag('form div');
  cy.get('form div')
    .children()
    .should('exist');
  cy.wait(1000);
  cy.log(`"${key}" element successfully draged and droped`);
});
//   Cypress.Commands.add('createTestForm', () => {
//     cy.get('button#createNewForm').click();
//     cy.get('#formName').type('Test Form');
//     cy.get('#addElement').click();
//   });
  
//   Cypress.Commands.add('publishTestForm', () => {
//     cy.get('button#publishForm').click();
//     cy.contains('Form published successfully').should('be.visible');
//   });
  