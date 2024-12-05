import { SELECTORS } from './selectors';
import { TIMEOUTS, LOGIN_BUTTON_TEXT } from './constants';

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

Cypress.Commands.add('clogin', (email, password) => {
  cy.loadSelector('autoModalLoginButton').click();
  if (email) {
    cy.loadSelector('emailField').type(email);
  }
  if (password) {
    cy.loadSelector('passwordField').type(password);
  }
  cy.loadSelector('primaryButton').contains(LOGIN_BUTTON_TEXT).click();
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
  