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

// Defines labels for form elements.
Cypress.Commands.add('setLabel', (val) => {
  if (val !== undefined && val !== null) {
    cy.get(`.el-input__inner[label="${PAGE_OPERATIONS.label}"]`)
      .clear()
      .type(val);
  }
});

Cypress.Commands.add('setLabelWithTextarea', (val) => {
  if (val !== undefined && val !== null) {
    cy.get(`.el-textarea__inner[label="${PAGE_OPERATIONS.label}"]`)
      .clear()
      .type(val);
  }
});

// Defines Placeholders for form elements.
Cypress.Commands.add('setPlaceholder', (val) => {
  if (val !== undefined) {
    cy.get(`.el-input__inner[label="${PAGE_OPERATIONS.placeholder}"]`)
      .clear()
      .type(val);
  }
});

// Defines the types of form elements such as Input, Email, DataTime, etc.
// Cypress.Commands.add('setElementType', ( item, type ) => {
//   if (type !== undefined) {
//     cy.get(`.el-select:has(span:contains("${item}"))`)
//       .click();
//     cy.get('.el-select-dropdown__item')
//       .contains('span', type)
//       .click();
//   }
// });

// Set conditions by text input.
Cypress.Commands.add('setOptWithTx', ( item, val ) => {
  if (val !== undefined && val !==null && val !== '') {
    cy.get(`.el-input__inner[label="${item}"]`)
      .clear()
      .type(val);
  }
});

// Setting elements by true and false values
Cypress.Commands.add('setOptByBool', ( item, val ) => {
  if( val !== undefined && val !== null) {
    cy.get(`.el-form-item:has(label:contains("${item}"))`)
      .find(`input[value="${val}"]`)
      .parent()
      .parent()
      .click();
  }
});

// Setting elements types by dropdown select list with span
Cypress.Commands.add('setTypeByListWithSpan', ( item, val ) => {
  if (val !== undefined && val !== "") {
    cy.get(`.el-select:has(span:contains("${item}"))`)
      .click();
    cy.get('.el-select-dropdown__item')
      .contains('span', val)
      .click();
  }
});

// Set up by entering the components.
Cypress.Commands.add('configureFieldSettings', ( item, val ) => {
  if( val !== undefined && val !== null) {
    cy.get(`.el-form-item:has(label:contains("${PAGE_OPERATIONS[item]}"))`)
      .find('input')
      .first()
      .clear()
      .type(val);
  }
});

// Sets the initial state of the check selection elements.
Cypress.Commands.add('setOption', (optionKey, val) => {
  if (val == true) {
    cy.loadSelector('checkItem')
      .contains('span', PAGE_OPERATIONS[optionKey])
      .parent()
      .click();
  }
});

// Adds and removes items from form elements that have items such as a Maltese select, drop-down list, etc.
Cypress.Commands.add('setItems', (options) => {
  if (options !== undefined) {
    const userOptions = Object.entries(options);
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
});

Cypress.Commands.add('setListItems', (items) => {
  if (items !== undefined) {
    const userItems = Object.entries(items);
    let currentItemsCount = 1;
    cy.get('.option-editor-item-card')
      .should('have.length.at.least', 1)
      .then(($elements) => {
        currentItemsCount = $elements.length;
    });

    // **Add extra items if the user's items are more than the current items**
    if (userItems.length > currentItemsCount) {
        const itemsToAdd = userItems.length - currentItemsCount;
        for (let i = 0; i < itemsToAdd; i++) {
            cy.get('.option-editor-item-card:last-child')
              .find('button')
              .first() 
              .click();
            cy.wait(TIMEOUTS.shortDelay); // Wait for the new option to appear
        }
    }
    
    // **Remove extra items if the user's items are fewer than the current items**
    if (userItems.length < currentItemsCount) {
        const itemsToRemove = currentItemsCount - userItems.length;
        for (let i = 0; i < itemsToRemove; i++) {
            cy.get('.option-editor-item-card:last-child')
              .find('button')
              .last() 
              .click();
            cy.wait(TIMEOUTS.shortDelay);
        }
    }

    userItems.forEach(([key, item], index) => {
        cy.get(`.option-editor-item-card:nth-child(${index + 1})`)
          .find('textarea')
          .first()
          .clear()
          .type(item);
    });
    
    cy.get('.el-form-item:has(div:contains("' + PAGE_OPERATIONS.items + '"))')
      .find('button:has(span:contains("' + PAGE_OPERATIONS.save + '"))')
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
  cy.setTypeByListWithSpan(AVAILABLE_FORM_ELEMENTS.input.defaultSettings.type, settings.type);
  cy.setOption('clearable', settings.clearable);
  cy.setOption('autoComplete', settings.autoComplete);
  cy.setOption('showWordLimit', settings.showWordLimit);
  cy.configureFieldSettings('minLength', settings.minLength);
  cy.configureFieldSettings('maxLength', settings.maxLength);
  cy.loadSelector('closeBtn')
    .click();
});

Cypress.Commands.add('setText', (settings) => {
  cy.get('form div')
    .find('.rud-drop-item:has(label:contains("' + PAGE_OPERATIONS.longText + '"))')
    .last()
    .dblclick();
  cy.setLabel(settings.label);
  cy.setPlaceholder(settings.placeholder);
  cy.setOption('clearable', settings.clearable);
  cy.setOption('autoComplete', settings.autoComplete);
  cy.setOption('showWordLimit', settings.showWordLimit);
  
  if(settings.autoSize == false) cy.setOption('autoSize', true);
  cy.configureFieldSettings('minLength', settings.minLength);
  cy.configureFieldSettings('maxLength', settings.maxLength);
  cy.configureFieldSettings('rows', settings.rows);

  cy.loadSelector('closeBtn')
    .click();
});

Cypress.Commands.add('setNumber', (settings) => {
  cy.get('form div')
    .find('.rud-drop-item:has(label:contains("' + FORM_ELEMENTS.number[0] + '"))')
    .last()
    .dblclick();
  cy.setLabel(settings.label);
  cy.setPlaceholder(settings.placeholder);
  cy.configureFieldSettings('minValue', settings.minValue);
  cy.configureFieldSettings('maxValue', settings.maxValue);
  cy.configureFieldSettings('step', settings.step);
  cy.loadSelector('closeBtn')
    .click();
});

Cypress.Commands.add('setEmail', (settings) => {
  cy.get('form div')
    .find('.rud-drop-item:has(label:contains("' + FORM_ELEMENTS.email[0] + '"))')
    .last()
    .dblclick();
  cy.setLabel(settings.label);
  cy.setPlaceholder(settings.placeholder);
  cy.setOption('emailRecipe', settings.recipient);
  cy.setOption('clearable', settings.clearable);
  cy.setOption('autoComplete', settings.autoComplete);
  cy.loadSelector('closeBtn')
    .click();
});

Cypress.Commands.add('setCheckbox', (settings) => {
  cy.get('form div')
    .find('.rud-drop-item:has(label:contains("' + FORM_ELEMENTS.checkbox[0] + '"))')
    .last()
    .dblclick();
  cy.setLabelWithTextarea(settings.label);
  cy.setOptWithTx(PAGE_OPERATIONS.optLabel, settings.optLabel);
  cy.setOptWithTx(PAGE_OPERATIONS.customClass, settings.customClass);
  cy.loadSelector('closeBtn')
    .click();
});

Cypress.Commands.add('setRadio', (settings) => {
  cy.get('form div')
    .find('.rud-drop-item:has(label:contains("' + FORM_ELEMENTS.radio[0] + '"))')
    .last()
    .dblclick();
  cy.setLabel(settings.label);
  if (settings.type !== undefined) {
    cy.get(`.el-radio-button:has(span:contains("${settings.type}"))`)
      .click();
  }
  cy.setItems(settings.options);
  cy.loadSelector('closeBtn')
    .click();
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
  cy.setItems(settings.options);
  cy.loadSelector('closeBtn')
    .click();
});

Cypress.Commands.add('setDropdown', (settings) => {
  cy.get('form div')
    .find('.rud-drop-item:has(label:contains("' + FORM_ELEMENTS.dropdown[0] + '"))')
    .last()
    .dblclick();
  cy.setLabel(settings.label);
  cy.setPlaceholder(settings.placeholder);
  cy.setOption('clearable', settings.clearable);
  cy.setOption('filterable', settings.filterable);
  cy.setOption('multiple', settings.multiple);
  cy.setItems(settings.options);
  cy.loadSelector('closeBtn')
    .click();
});

Cypress.Commands.add('setRange', (settings) => {
  cy.get('form div')
    .find('.rud-drop-item:has(label:contains("' + FORM_ELEMENTS.range[0] + '"))')
    .last()
    .dblclick();
  cy.setLabel(settings.label);
  cy.configureFieldSettings('minValue', settings.minValue);
  cy.configureFieldSettings('maxValue', settings.maxValue);
  cy.configureFieldSettings('step', settings.step);
  cy.setOptByBool(PAGE_OPERATIONS.breakpoint, settings.breakpoint);
  cy.loadSelector('closeBtn')
    .click();  
});

Cypress.Commands.add('setDateTime', (settings) => {
  cy.get('form div')
    .find('.rud-drop-item:has(label:contains("' + PAGE_OPERATIONS.dateTime + '"))')
    .last()
    .dblclick();
  cy.setLabel(settings.label);
  cy.setPlaceholder(settings.placeholder);
  cy.setTypeByListWithSpan(AVAILABLE_FORM_ELEMENTS.dateTime.defaultSettings.type, settings.type);
  cy.configureFieldSettings('format', settings.format);
  cy.configureFieldSettings('valFormat', settings.valFormat);
  cy.loadSelector('closeBtn')
    .click();
  cy.get('form div')
    .find('.rud-drop-item:has(label:contains("' + settings.label + '"))')
    .last()
    .click();
});

Cypress.Commands.add('setImage', (settings) => {
  cy.get('form div')
    .find('.rud-drop-item:has(div:contains("' + FORM_ELEMENTS.image[0] + '"))')
    .last()
    .dblclick();
  cy.setLabel(settings.label);
  if( settings.url !== null ) {
    cy.get(`textarea[placeholder="${PAGE_OPERATIONS.extURL}"]`)
      .clear()
      .type(settings.url);
  }
  cy.setTypeByListWithSpan(PAGE_OPERATIONS.select, settings.type);
  cy.setOptByBool(PAGE_OPERATIONS.lazy, settings.lazy);
  cy.setOptWithTx(PAGE_OPERATIONS.alt, settings.alt);
  cy.loadSelector('closeBtn')
    .click();
});

Cypress.Commands.add('setSwitch', (settings) => {
  cy.get('form div')
    .find('.rud-drop-item:has(label:contains("' + FORM_ELEMENTS.switch[0] + '"))')
    .last()
    .dblclick();
  cy.setLabel(settings.label);
  cy.setOptWithTx(PAGE_OPERATIONS.activeText, settings.activeText);
  cy.setOptWithTx(PAGE_OPERATIONS.inactiveText, settings.inactiveText);
  cy.setOptWithTx(PAGE_OPERATIONS.width, settings.width);
  cy.setOptByBool(PAGE_OPERATIONS.prompt, settings.prompt);
  cy.loadSelector('closeBtn')
    .click();
});

Cypress.Commands.add('setDivider', (settings) => {
  cy.get('form div')
    .find('.rud-drop-item:has(.el-divider.el-divider--horizontal)')
    .last()
    .dblclick();
  cy.setTypeByListWithSpan(AVAILABLE_FORM_ELEMENTS.divider.defaultSettings.borderStyle, settings.borderStyle);
  cy.setLabel(settings.label);
  [settings.lazy1, settings.lazy2].forEach(lazySetting => {
    if (lazySetting !== undefined) {
      cy.get(`.el-radio-button:has(span:contains("${lazySetting}"))`).click();
    }
  });
  cy.loadSelector('closeBtn')
    .click();
});

Cypress.Commands.add('setList', (settings) => {
  cy.get('form div')
    .find('.rud-drop-item:has(P:contains("' + FORM_ELEMENTS.list[0] + '"))')
    .last()
    .dblclick();
  cy.setLabelWithTextarea(settings.label);
  cy.setTypeByListWithSpan(AVAILABLE_FORM_ELEMENTS.list.defaultSettings.type, settings.type);
  cy.setListItems(settings.items);
  cy.loadSelector('closeBtn')
    .click();
});

Cypress.Commands.add('setButton', (settings) => {
  cy.get('form div')
    .find('.rud-drop-item:has(button:contains("' + AVAILABLE_FORM_ELEMENTS.button.defaultSettings.label + '"))')
    .last()
    .dblclick();
  cy.setLabel(settings.label);
  cy.setTypeByListWithSpan(AVAILABLE_FORM_ELEMENTS.button.defaultSettings.type, settings.type);
  cy.setOptWithTx(PAGE_OPERATIONS.customClass, settings.className);
  cy.loadSelector('closeBtn')
    .click();
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

  cy.setTypeByListWithSpan(AVAILABLE_FORM_ELEMENTS.stripe.defaultSettings.currency, settings.currency);
  cy.setTypeByListWithSpan(PAGE_OPERATIONS.select, settings.paymentType);

  // cy.get('#pane-Stripe button:has(span:contains("' + PAGE_OPERATIONS.connect + '"))')
  //   .click();

  cy.get('#pane-Stripe button:has(span:contains("' + PAGE_OPERATIONS.save + '"))')
    .click();

  cy.loadSelector('closeBtn')
    .click();
});