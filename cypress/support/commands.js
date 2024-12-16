import { SELECTORS } from './selectors';
import { URLS, TIMEOUTS, LOG_OUT_TEXT, LOGIN_BUTTON_TEXT, PAGE_OPERATIONS, FORM_ELEMENTS, FORM_HINT, MODAL_TITLE  } from './constants';

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
Cypress.Commands.add('clogin', (email, password, status) => {
  cy.loadSelector('autoModalLoginBtn').click();
  if (email) {
    cy.loadSelector('emailField').type(email);
  }
  if (password) {
    cy.loadSelector('passwordField').type(password);
  }
  
  if( status != 100) {
    cy.intercept('POST', `${URLS.api}/auth/login`).as('loginRequest');
    cy.loadSelector('primaryBtn').contains(LOGIN_BUTTON_TEXT).click();
    cy.wait('@loginRequest').then((interception) => {
        const { response } = interception;
        if (status == 200) expect(response.statusCode).to.eq(200);
        else expect(response.statusCode).to.not.equal(200);
    });
    if (status == 200) cy.contains(LOG_OUT_TEXT, { timeout: TIMEOUTS.elementVisibility }).should('exist');
  }
  else cy.loadSelector('primaryBtn').contains(LOGIN_BUTTON_TEXT).click();
});
  
// Command for creating the new form
Cypress.Commands.add('createNewForm', (title = '', description = '') => {
  cy.loadSelector('primaryBtn')
    .contains('span', PAGE_OPERATIONS.new, { timeout: TIMEOUTS.elementVisibility })
    .parent()
    .click();
  cy.loadSelector('modalDialog')
    .contains('span', MODAL_TITLE.newForm, { timeout: TIMEOUTS.elementVisibility })
    .should('be.visible');
  if(title) {
    cy.get(`input[placeholder="${FORM_HINT.name}"]`).type(title);
  }
  if(description) {
    cy.loadSelector('formDescription').type(description);
  }
  cy.loadSelector('primaryBtn')
    .contains('span', PAGE_OPERATIONS.confirm, { timeout: TIMEOUTS.elementVisibility })
    .click();
  // cy.wait(TIMEOUTS.urlCheck);
});

// Cammand for draganddroping the form element
Cypress.Commands.add('formDrag', (key, element, count) => {
  cy.log(`"${key}" element drag and drop`);
  cy.wait(1000);
  if(count == 1) {
    cy.loadSelector('formElement')
      .contains('span', element)
      .parent()
      .drag('form div');
  } else {
    cy.loadSelector('formElement')
      .contains('span', element)
      .parent()
      .drag('form div .rud-drop-item:last-child');
  }
  cy.wait(TIMEOUTS.eventDelay);
  cy.get('form div')
    .find('.rud-drop-item')
    .should('have.length', count);
  cy.wait(1000);
  cy.log(`"${key}" element successfully draged and droped`);
});

// Command to open a form by title
Cypress.Commands.add('openForm', () => {
  cy.wait(TIMEOUTS.default);
  cy.fixture('formData.json').then((data) => {
    cy.get(`span[title="${data.title}"]`, { timeout: TIMEOUTS.elementVisibility }).click();
    cy.intercept('GET', `${URLS.api}/forms/*`).as('openFormRequest');
    cy.wait('@openFormRequest', { timeout: TIMEOUTS.elementVisibility }).then((interception) => {
        const { response } = interception;
        expect(response.statusCode).to.eq(200);
    });
    // cy.wait(TIMEOUTS.urlCheck);
    cy.url().should('match', /\/forms\/[a-f0-9-]{36}$/);
  });
  // cy.wait(TIMEOUTS.default);
});
  
// Commands for each form elements

Cypress.Commands.add('setHeading', (settings) => {
  cy.get('form div')
    .find('.rud-drop-item:has(h3:contains("' + FORM_ELEMENTS.heading + '"))')
    .last()
    .dblclick();

  if (settings.tagName !== undefined) {
    cy.get(`.el-select[label="${PAGE_OPERATIONS.tagName}"]`)
      .click();
    cy.get('.el-select-dropdown__item')
      .contains('span', settings.tagName)
      .click();
  }

  if (settings.text !== undefined) {
    cy.loadSelector('formDescription')
      .clear()
      .type(settings.text);
  }

  // if (settings.placeholder !== undefined) {
  //   cy.get('[data-test="input-placeholder"]').clear().type(settings.placeholder);
  // }

  // if (settings.type !== undefined) {
  //   cy.get('[data-test="input-type"]').select(settings.type);
  // }
});