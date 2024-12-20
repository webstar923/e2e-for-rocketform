import { SELECTORS } from './selectors';
import { URLS, TIMEOUTS, LOG_OUT_TEXT, LOGIN_BUTTON_TEXT, PAGE_OPERATIONS, FORM_ELEMENTS, AVAILABLE_FORM_ELEMENTS, FORM_HINT, MODAL_TITLE  } from './constants';

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
  const target = count === 1 ? 'form div' : `form div .rud-drop-item:nth-child(${count-1})`;
  cy.loadSelector('formElement')
    .contains('span', element)
    .parent()
    .drag(target, { force: true });
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


// Cammand to save a built form
Cypress.Commands.add('saveForm', () => {
  cy.log('Saving the created form');
  cy.intercept('PUT', `${URLS.api}/forms/*`).as('saveFormRequest');
  cy.loadSelector('saveBtn').click();
  cy.wait('@saveFormRequest').then((interception) => {
      const { response } = interception;
      expect(response.statusCode).to.eq(200);
      expect(response.body).to.have.property('success', 1);
  });
});

// Cammand to delete a form
Cypress.Commands.add('delForm', (formName) => {
  cy.wait(TIMEOUTS.default);
  cy.get(`span[title="${formName}"]`, { timeout: TIMEOUTS.elementVisibility })
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
  cy.get('.el-menu .el-menu-item:has(span:contains("' + PAGE_OPERATIONS.archived + '"))')
    .click({ force: true });
  cy.get(`a:contains("${formName}")`, { timeout: TIMEOUTS.elementVisibility })
    .closest('tr')
    .find('td:last-child .cell>button:nth-of-type(2)')
    .click();
  cy.loadSelector('modalDialog')
    .find('input')
    .clear()
    .type(formName)
    .wait(TIMEOUTS.shortDelay);
  cy.get('button:has(span:contains("' + PAGE_OPERATIONS.deleteForm + '"))')
    .click();
});

// Commands general setting for form element

Cypress.Commands.add('setLabel', (val) => {
  if (val !== undefined) {
    cy.get(`.el-input__inner[label="${PAGE_OPERATIONS.label}"]`)
      .clear()
      .type(val);
  }
});

Cypress.Commands.add('setPlaceholder', (val) => {
  if (val !== undefined) {
    cy.get(`.el-input__inner[label="${PAGE_OPERATIONS.placeholder}"]`)
      .clear()
      .type(val);
  }
});

Cypress.Commands.add('setOption', (optionKey, val) => {
  if (val == true) {
    cy.loadSelector('checkItem')
      .contains('span', PAGE_OPERATIONS[optionKey])
      .parent()
      .click();
  }
});

// Commands for each form elements

Cypress.Commands.add('setHeading', (settings) => {
  cy.get('form div')
    .find('.rud-drop-item:has(h3:contains("' + FORM_ELEMENTS.heading[0] + '"))')
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

  cy.loadSelector('closeBtn')
  .click();
});

Cypress.Commands.add('setInput', (settings) => {
  cy.get('form div')
    .find('.rud-drop-item:has(label:contains("' + FORM_ELEMENTS.input[0] + '"))')
    .last()
    .dblclick();

    cy.setLabel(settings.label);
    cy.setPlaceholder(settings.placeholder);

  if (settings.type !== undefined) {
    cy.get(`.el-select:has(span:contains("${settings.type}"))`)
      .click();
    cy.get('.el-select-dropdown__item')
      .contains('span', settings.type)
      .click();
  }

  cy.loadSelector('closeBtn')
    .click();
});

Cypress.Commands.add('setText', (settings) => {
  cy.get('form div')
    .find('.rud-drop-item')
    .filter((index, element) => {
        return new RegExp(element.value, 'i').test(Cypress.$(element).text());
    })
    .last()
    .dblclick();
  cy.setLabel(settings.label);
  cy.setPlaceholder(settings.placeholder);
  cy.setOption('clearable', settings.clearable);
  cy.setOption('autoComplete', settings.autoComplete);
  cy.setOption('showWordLimit', settings.showWordLimit);
  
  if(settings.autoSize == false)
    cy.setOption('autoSize', true);

  cy.loadSelector('closeBtn')
    .click();
});

Cypress.Commands.add('setNumber', (settings) => {
  
});

Cypress.Commands.add('setEmail', (settings) => {
  
});

Cypress.Commands.add('setCheckbox', (settings) => {
  
});

Cypress.Commands.add('setRadio', (settings) => {
  
});

Cypress.Commands.add('setSelection', (settings) => {
  cy.get('form div')
    .find('.rud-drop-item:has(label:contains("' + AVAILABLE_FORM_ELEMENTS.selection.defaultSettings.label + '"))')
    .last()
    .dblclick();

  cy.setLabel(settings.label);

  if (settings.type !== undefined) {
    cy.get(`.el-radio-button:has(span:contains("${settings.type}"))`)
      .click();
  }

  if (settings.options !== undefined) {
    const userOptions = Object.entries(settings.options);
    let currentOptionsCount = 2;
    cy.get('.option-editor-item-card')
      .should('have.length.at.least', 1)
      .then(($elements) => {
        currentOptionsCount = $elements.length;
    });

    // **Add extra options if the user's options are more than the current options**
    if (userOptions.length > currentOptionsCount) {
        const optionsToAdd = userOptions.length - currentOptionsCount;
        for (let i = 0; i < optionsToAdd; i++) {
            cy.get('.option-editor-item-card:last-child')
              .realHover()
              .wait(TIMEOUTS.shortDelay)
              .find('.rtw-card-action button')
              .first() 
              .click();
            cy.wait(TIMEOUTS.shortDelay); // Wait for the new option to appear
        }
    }
    
    // **Remove extra options if the user's options are fewer than the current options**
    if (userOptions.length < currentOptionsCount) {
        const optionsToRemove = currentOptionsCount - userOptions.length;
        for (let i = 0; i < optionsToRemove; i++) {
            cy.get('.option-editor-item-card:last-child')
              .realHover()
              .wait(TIMEOUTS.shortDelay)
              .find('.rtw-card-action button')
              .last() 
              .click();
            cy.wait(TIMEOUTS.shortDelay);
        }
    }

    userOptions.forEach(([key, option], index) => {
        cy.get(`.option-editor-item-card:nth-child(${index + 1})`)
          .find('input')
          .first()
          .clear()
          .type(key);
        cy.get(`.option-editor-item-card:nth-child(${index + 1})`)
          .find('textarea')
          .first()
          .clear()
          .type(option);
    });
    
    cy.get('div[name="options"] button:has(span:contains("' + PAGE_OPERATIONS.save + '"))')
      .click();
  }

  cy.loadSelector('closeBtn')
    .click();
});

Cypress.Commands.add('setDropdown', (settings) => {
  
});

Cypress.Commands.add('setRange', (settings) => {
  
});

Cypress.Commands.add('setDateTime', (settings) => {
  
});

Cypress.Commands.add('setImage', (settings) => {
  
});

Cypress.Commands.add('setSwitch', (settings) => {
  
});

Cypress.Commands.add('setDivider', (settings) => {
  
});

Cypress.Commands.add('setList', (settings) => {
  
});

Cypress.Commands.add('setButton', (settings) => {
  
});

Cypress.Commands.add('setStripe', (settings) => {
  cy.get('form div')
    .find('.rud-drop-item:has(div:contains("' + PAGE_OPERATIONS.stripeProducts + '"))')
    .last()
    .dblclick();

  cy.get('.el-tabs__item:contains("' + PAGE_OPERATIONS.stripe + '")')
    .click();

  if (settings.mode !== undefined) {
    cy.get(`.el-radio-button:has(span:contains("${settings.mode}"))`)
      .click();
  }

  if (settings.currency !== undefined) {
    cy.get(`.el-select:has(span:contains("${AVAILABLE_FORM_ELEMENTS.stripe.defaultSettings.currency}"))`)
      .click();
    cy.get('.el-select-dropdown__item')
      .contains('span', settings.currency)
      .click();
  }

  if (settings.paymentType !== undefined || settings.paymentType !== "") {
    cy.get(`.el-select:has(span:contains("${PAGE_OPERATIONS.select}"))`)
      .click();
    cy.get('.el-select-dropdown__item')
      .contains('span', settings.paymentType)
      .click();
  }

  // cy.get('#pane-Stripe button:has(span:contains("' + PAGE_OPERATIONS.connect + '"))')
  //   .click();

  cy.get('#pane-Stripe button:has(span:contains("' + PAGE_OPERATIONS.save + '"))')
    .click();

  cy.loadSelector('closeBtn')
    .click();
});