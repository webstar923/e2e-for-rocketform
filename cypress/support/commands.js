import 'cypress-file-upload';
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
  cy.wait(500);
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
  cy.wait(500);
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

// Command for draganddroping the form element
Cypress.Commands.add('formDrag', (key, element, count) => {
  cy.log(`"${key}" element drag and drop`);
  cy.wait(2500);
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

// Command for draganddroping the form element in pdf
Cypress.Commands.add('formDragInPDF', (element, pdfTitle) => {
  cy.wait(500);
  cy.log(`"${element.key}" element drag and drop`);
  cy.get('#tab-forms').click();
  const target = `div[label="${pdfTitle}"] .vue-pdf`;
  cy.get('.form-element:has(span:contains("' + element.settings.label + '"))')
    .drag(target);
  cy.log(`"${element.key}" element successfully draged and droped`);
});
// Command to open a form by title
Cypress.Commands.add('openForm', (formName) => {
  cy.wait(TIMEOUTS.default);
  cy.get(`span[title="${formName}"]`, { timeout: TIMEOUTS.elementVisibility }).click();
  cy.intercept('GET', `${URLS.api}/forms/*`).as('openFormRequest');
  cy.wait('@openFormRequest', { timeout: TIMEOUTS.elementVisibility }).then((interception) => {
      const { response } = interception;
      expect(response.statusCode).to.eq(200);
  });
  // cy.wait(TIMEOUTS.urlCheck);
  cy.url().should('match', /\/forms\/[a-f0-9-]{36}$/);
  // cy.wait(TIMEOUTS.default);
});

// Command to fill a form with data
Cypress.Commands.add('fillForm', (formElements) => {
  cy.wait(TIMEOUTS.hoverDelay);
  const userFormElements = Object.entries(formElements);
  userFormElements.forEach(([key,element], index) => {
    switch (element.key) {
        case 'text':
            cy.loadSelector('formItem')
              .contains('label', new RegExp(element.settings.label, 'i'))
              .parent()
              .find(SELECTORS.formDescription)
              .type(element.data);
            break;
        case 'email':
            cy.loadSelector('formItem')
              .contains('label', new RegExp(element.settings.label, 'i'))
              .parent()
              .find(SELECTORS.formTitle)
              .type(element.data);
            break;
        case 'rating':
            cy.loadSelector('formItem')
              .contains('label', new RegExp(element.settings.label, 'i'))
              .parent()
              .find(`span:nth-child(${element.data})`)
              .click();
            break;
        // case 'button':
        //     cy.contains('button', element.settings.label).click();
            // break;
        case 'switch':
            cy.loadSelector('formItem')
              .contains('label', new RegExp(element.settings.label, 'i'))
              .parent()
              .find(SELECTORS.toggleBtn)
              .click();
            break;
        case 'input':
            cy.loadSelector('formItem')
              .contains('label', new RegExp(element.settings.label, 'i'))
              .parent()
              .find(SELECTORS.formTitle)
              .clear()
              .type(element.data);
            break;
        case 'number':
            cy.loadSelector('formItem')
              .contains('label', new RegExp(element.settings.label, 'i'))
              .parent()
              .find(SELECTORS.formTitle)
              .clear()
              .type(element.data);
            break;
        case 'checkbox':
            if ( element.data == true ) {
              cy.loadSelector('checkItem')
                .contains('span', new RegExp(element.settings.label, 'i'))
                .parent()
                .click();
            }
            break;
        case 'upload':
          if (element.settings.multiple) {
            const files = element.data.map(filePath => ({
              filePath
            }));
            cy.get('input[type="file"]').attachFile(files);
          } else {
            cy.get('input[type="file"]').attachFile({
              filePath: element.data[0]
            });
          }
          break;
        case 'country':
          cy.get(`.el-select--default[label="${element.settings.label}"]`)
            .find('ul')
            .contains(element.data)
            .click({force: true});
          break;
        case 'sign':
          cy.get('canvas')
            .trigger('mousedown', { clientX: 50, clientY: 50, force: true  })  // Start drawing
            .trigger('mousemove', { clientX: 150, clientY: 150, force: true  }) // Draw a diagonal line
            .trigger('mousemove', { clientX: 250, clientY: 50, force: true  })  // Continue drawing
            .trigger('mousemove', { clientX: 0, clientY: 50, force: true  })  // Continue drawing
            .trigger('mousemove', { clientX: 50, clientY: 0, force: true  })  // Continue drawing
            .trigger('mouseup', { force: true });
          cy.get(`div[label="${element.settings.label}"]`)
            .find('button')
            .contains('Save')
            .click(); 
          break;
        default:
            cy.log('No action for element key: ' + element.key);
    }
  });
});

// Command to save a built form
Cypress.Commands.add('saveForm', () => {
  cy.wait(500);
  cy.log('Saving the created form');
  cy.intercept('PUT', `${URLS.api}/forms/*`).as('saveFormRequest');
  cy.loadSelector('saveBtn').click();
  cy.wait('@saveFormRequest').then((interception) => {
      const { response } = interception;
      expect(response.statusCode).to.eq(200);
      expect(response.body).to.have.property('success', 1);
  });
});

// Command to publish and link a built form
Cypress.Commands.add('publishAndLinkForm', () => {
  cy.wait(500);
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

// Command to delete a form
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

// Command to assign pdf to the form
Cypress.Commands.add('assignPDF', (userForm) =>{
  cy.wait(500);
  // Assign PDF
  const document = userForm.document;
  const elements = userForm.elements;
  cy.log('Assign pdf to the Form');
  cy.contains('a', PAGE_OPERATIONS.assignPDF, { timeout: TIMEOUTS.elementVisibility })
    .click()
    .url({ timeout: TIMEOUTS.pageLoad })
    .should('include', '/documents');
  cy.contains('button', 'Add Document').click();
  if (document.settings.title != undefined && document.settings.title != null) {
    cy.contains('label', PAGE_OPERATIONS.title)
      .parent()
      .find('input.el-input__inner')
      .clear()
      .type(document.settings.title);
  }
  if (document.settings.file != undefined && document.settings.file != null) {
    cy.fixture('mediaLib').then((mediaLib) => {
      cy.get('button.el-button.el-button--info.is-circle')
        .scrollIntoView()
        .should('be.visible')
        .click();
        cy.get('span.el-tree-node__label').then(($el) => {
          if ($el.text().includes('Mdocuments')) {
            cy.log('Element already exists, proceeding...');
          } else {
            cy.get('span.el-tree-node__label').contains('root').click();
            cy.get('.el-dialog__body > div:nth-child(2) > div:first-child button:first-child')
              .click();
            cy.get('.el-form-item:has(label:contains("Folder Name"))')
              .find('input')
              .type('Mdocuments');
            cy.get('button:has(span:contains("Create"))')
              .click();
          }
          cy.contains('div.el-tree-node', 'Mdocuments')
            .should('exist')
            .click({ force: true });
          cy.get('button[title="Upload Files"]').click();
          cy.intercept('POST', '**/api/upload_file').as('uploadFileRequest');
          cy.fixture('mediaLib').then((mediaLib) => {
            const documentName = mediaLib.documents[document.settings.file];
            cy.get('.upload-demo').find('input[type="file"]').attachFile('media/documents/'+ documentName);
            cy.wait('@uploadFileRequest').then((interception) => {
              const fileName = interception.response.body.file_name;
              const realFileName = fileName.split('/').pop();
              cy.wait(3000);
              // cy.get('.el-dialog__header')
              //   .find('button.el-dialog__headerbtn')
              //   .click({force:true});
              cy.get(`div[title="${realFileName}"]`)
                .should('exist')
                .click();
              cy.contains('button', PAGE_OPERATIONS.select)
                .should('exist')
                .click();
            });
          });
        }); 
    });
  }
  if (document.settings.show != undefined && document.settings.show != null) {
    cy.setOption('show', document.settings.show);
  }
  if (document.settings.eSign != undefined && document.settings.eSign != null) {
    cy.setOption('eSign', document.settings.eSign);
  }
  cy.get('button:has(span:contains("Save"))').click();
  document.elementOrder.forEach((value) => {
    cy.formDragInPDF(elements[value], document.settings.title);
  });
  if (document.signature != undefined && document.signature != null) {
    cy.get('#tab-sig').click();
    cy.get('#pane-sig > div').then(($div) => {
      if ($div.text().includes(document.signature)) {
        cy.log('Element already exists, proceeding...');
      } else {
        cy.contains('a', 'Create a new template').click();
        cy.get('input.el-input__inner[placeholder="Name"]')
          .clear()
          .type(document.signature);
          cy.get('textarea.el-textarea__inner[placeholder="Description"]')
          .clear()
          .type(document.signature);
        cy.get('button.is-circle').click();
        cy.get('span.el-tree-node__label').then(($el) => {
          if ($el.text().includes('Msignature')) {
            cy.log('Folder already exists, proceeding...');
          } else {
            cy.get('span.el-tree-node__label').contains('root').click();
            cy.get('.el-dialog__body > div:nth-child(2) > div:first-child button:first-child')
              .click();
            cy.get('.el-form-item:has(label:contains("Folder Name"))')
              .find('input')
              .type('Msignature');
            cy.get('button:has(span:contains("Create"))')
              .click();
          }
          cy.get('span.el-tree-node__label').contains('Msignature').click({force: true});
          cy.get('button[title="Upload Files"]').click();
          cy.intercept('POST', '**/api/upload_file').as('uploadFileRequestSign');
          cy.fixture('mediaLib').then((mediaLib) => {
            const signatureName = mediaLib.signature[document.signature];
            cy.get('.upload-demo').find('input[type="file"]').attachFile('media/signature/'+ signatureName);
            cy.wait('@uploadFileRequestSign').then((interception) => {
              const fileName = interception.response.body.file_name;
              const realFileName = fileName.split('/').pop();
              cy.wait(3000);
              cy.get(`div[title="${realFileName}"]`)
                .should('exist')
                .click();
              cy.contains('button', PAGE_OPERATIONS.select)
                .should('exist')
                .click();
            });
          });
        });
        cy.get('.el-checkbox__input').click();
        cy.contains('button', 'Save').click();
        cy.wait(2000);
        cy.go('back');
        cy.get('#tab-sig').click();
      };
    });
    cy.contains('div', document.signature)
      .should('exist')
      .drag(`div[label="${document.settings.title}"] .vue-pdf`);
  }
});

// Command to save added document on form
Cypress.Commands.add('saveFormDocument', () => {
  cy.wait(500);
  cy.log('Saving the created document');
  cy.intercept('PUT', `${URLS.api}/documents/*`).as('saveDocumentRequest');
  cy.loadSelector('saveBtn').click();
  cy.wait('@saveDocumentRequest').then((interception) => {
      const { response } = interception;
      expect(response.statusCode).to.eq(200);
      expect(response.body).to.have.property('success', 1);
  });
});

// Commands general setting for form element

// Defines labels for form elements.
Cypress.Commands.add('setLabel', (val) => {
  cy.wait(500);
  if (val !== undefined && val !== null) {
    cy.get(`.el-input__inner[label="${PAGE_OPERATIONS.label}"]`)
      .clear()
      .type(val);
  }
});

Cypress.Commands.add('setLabelWithTextarea', (val) => {
  cy.wait(500);
  if (val !== undefined && val !== null) {
    cy.get(`.el-textarea__inner[label="${PAGE_OPERATIONS.label}"]`)
      .clear()
      .type(val);
  }
});

// Defines Placeholders for form elements.
Cypress.Commands.add('setPlaceholder', (val) => {
  cy.wait(500);
  if (val !== undefined) {
    cy.get(`.el-input__inner[label="${PAGE_OPERATIONS.placeholder}"]`)
      .clear()
      .type(val);
  }
});

// Set conditions by text input.
Cypress.Commands.add('setOptWithTx', ( item, val ) => {
  cy.wait(500);
  if (val !== undefined && val !==null && val !== '') {
    cy.get(`.el-input__inner[label="${item}"]`)
      .clear()
      .type(val);
  }
});

// Setting elements by true and false values
Cypress.Commands.add('setOptByBool', ( item, val ) => {
  cy.wait(500);
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
  cy.wait(500);
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
  cy.wait(500);
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
  cy.wait(500);
  if (val == true) {
    cy.loadSelector('checkItem')
      .contains('span', PAGE_OPERATIONS[optionKey])
      .parent()
      .click();
  }
});

// Adds and removes items from form elements that have items such as a Maltese select, drop-down list, etc.
Cypress.Commands.add('setItems', (options) => {
  cy.wait(500);
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
  cy.wait(500);
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
    cy.wait(500);
    cy.get('.el-form-item:has(div:contains("' + PAGE_OPERATIONS.items + '"))')
      .find('button:has(span:contains("' + PAGE_OPERATIONS.save + '"))')
      .click();
  }  
});

// Commands for each form elements

Cypress.Commands.add('setHeading', (settings) => {
  cy.wait(500);
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
  cy.wait(500);
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
  cy.wait(500);
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
  cy.wait(500);
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
  cy.wait(500);
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
  cy.wait(500);
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
  cy.wait(500);
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
  cy.wait(500);
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
  cy.wait(500);
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
  cy.wait(500);
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
  cy.wait(500);
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
    .click({force: true});
});

Cypress.Commands.add('setImage', (settings) => {
  cy.wait(500);
  cy.get('form div')
    .find('.rud-drop-item:has(div:contains("' + FORM_ELEMENTS.image[0] + '"))')
    .last()
    .dblclick();
  cy.setLabel(settings.label);
  if( settings.url !== null ) {
    // cy.get(`textarea[placeholder="${PAGE_OPERATIONS.extURL}"]`)
    //   .clear()
    //   .type(settings.url);
    cy.wait(500);
    cy.contains('label', 'Image URL')
      .siblings()     
      .find('button') 
      .click();
      cy.wait(500);
      cy.get('span.el-tree-node__label').then(($el) => {
        if ($el.text().includes('Mimages')) {
          cy.log('Element already exists, proceeding...');
        } else {
          cy.get('span.el-tree-node__label').contains('root').click();
          cy.wait(500);
          cy.get('.el-dialog__body > div:nth-child(2) > div:first-child button:first-child')
            .click();       
          cy.wait(500); 
          cy.get('.el-form-item:has(label:contains("Folder Name"))')
            .find('input')
            .type('Mimages');
          cy.wait(500);
          cy.get('button:has(span:contains("Create"))')
            .click();
        }
        cy.wait(500);
        cy.get('span.el-tree-node__label').contains('Mimages').click({force: true});
        cy.get('button[title="Upload Files"]').click();
        cy.intercept('POST', '**/api/upload_file').as('uploadFileRequest');
        cy.fixture('mediaLib').then((mediaLib) => {
          const imageName = mediaLib.images[settings.url];
          cy.get('.upload-demo').find('input[type="file"]').attachFile('media/images/'+ imageName);
          cy.wait('@uploadFileRequest').then((interception) => {
            const fileName = interception.response.body.file_name;
            cy.wait(3000);
            cy.get('.el-dialog__header')
              .find('button.el-dialog__headerbtn')
              .click({force:true});
            cy.get(`textarea[placeholder="${PAGE_OPERATIONS.extURL}"]`)
              .clear()
              .type(fileName);
          });
        });
      }); 
    }
  cy.setTypeByListWithSpan(PAGE_OPERATIONS.select, settings.type);
  cy.setOptByBool(PAGE_OPERATIONS.lazy, settings.lazy);
  cy.setOptWithTx(PAGE_OPERATIONS.alt, settings.alt);
  cy.loadSelector('closeBtn')
    .click();
});

Cypress.Commands.add('setSwitch', (settings) => {
  cy.wait(500);
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
  cy.wait(500);
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
  cy.wait(500);
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
  cy.wait(500);
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

Cypress.Commands.add('setCalc', (settings) => {
  cy.wait(500);
  cy.get('form div')
    .find('.rud-drop-item:has(label:contains("' + AVAILABLE_FORM_ELEMENTS.calc.defaultSettings.label + '"))')
    .last()
    .dblclick();
  cy.setLabel(settings.label);
  cy.setPlaceholder(settings.placeholder);
  cy.get('button')
    .contains('Add Field')
    .click();
  cy.wait(500);
  settings.op.forEach(op => {
    cy.get('div.rtw-cursor-pointer')
      .contains(op.key)
      .click({ force: true });
    cy.get('.el-button.rtw-w-full')
      .contains(op.symbol)
      .click();
    cy.wait(500);
  });
  cy.get('form.el-form--label-top')
    .find('button')
    .contains('Save')
    .click({force: true});
  cy.wait(500);
  cy.loadSelector('closeBtn')
    .click();
});

Cypress.Commands.add('setCountry', (settings) => {
  cy.wait(500);
  cy.get('form div')
    .find('.rud-drop-item:has(label:contains("' + AVAILABLE_FORM_ELEMENTS.country.defaultSettings.label + '"))')
    .last()
    .dblclick();
  cy.setLabel(settings.label);
  cy.setPlaceholder(settings.placeholder);
  cy.setOption('clearable', settings.clearable);
  cy.loadSelector('closeBtn')
  .click();
});

Cypress.Commands.add('setFileUpload', (settings) => {
  cy.wait(500);
  cy.get('form div')
    .find('.rud-drop-item:has(div:contains("' + AVAILABLE_FORM_ELEMENTS.upload.defaultSettings.label + '"))')
    .last()
    .dblclick();
  cy.setLabel(settings.label);
  cy.setOptWithTx(PAGE_OPERATIONS.uploadText, settings.uploadText);
  cy.setOption('multiple', settings.multiple);
  cy.setOption('dragAndDrop', settings.dragAndDrop);
  cy.configureFieldSettings('limit', settings.limit);
  cy.setOptWithTx(PAGE_OPERATIONS.accept, settings.accept);
  cy.loadSelector('closeBtn')
  .click();
});

Cypress.Commands.add('setRating', (settings) => {
  cy.wait(500);
  cy.get('form div')
    .find('.rud-drop-item:has(label:contains("' + AVAILABLE_FORM_ELEMENTS.rating.defaultSettings.label + '"))')
    .last()
    .dblclick();
  cy.setLabel(settings.label);
  cy.setOptByBool(PAGE_OPERATIONS.clearable, settings.clearable);
  cy.setOptByBool(PAGE_OPERATIONS.disabled, settings.disabled);
  cy.setOptByBool(PAGE_OPERATIONS.showScore, settings.showScore);
  cy.setOptWithTx(PAGE_OPERATIONS.scoreTemp, settings.scoreTemp);
  cy.loadSelector('closeBtn')
  .click();
});

Cypress.Commands.add('setSign', (settings) => {
  cy.wait(500);
  cy.get('form div')
    .find('.rud-drop-item:has(div:contains("' + AVAILABLE_FORM_ELEMENTS.sign.defaultSettings.label + '"))')
    .last()
    .dblclick();
  cy.setLabel(settings.label);
  cy.setOptWithTx(PAGE_OPERATIONS.width, settings.width);
  cy.setOptWithTx(PAGE_OPERATIONS.height, settings.height);
  cy.loadSelector('closeBtn')
  .click();
});

Cypress.Commands.add('setColor', (settings) => {
  cy.wait(500);
  cy.get('form div')
    .find('.rud-drop-item:has(div:contains("' + AVAILABLE_FORM_ELEMENTS.selectColor.defaultSettings.label + '"))')
    .last()
    .dblclick();
  cy.setLabel(settings.label);
  cy.setOptWithTx(PAGE_OPERATIONS.defaultValue, settings.defaultValue);
  cy.loadSelector('closeBtn')
  .click();
});

Cypress.Commands.add('setStripe', (settings) => {
  cy.wait(500);
  const {
    mode,
    currency,
    paymentType,
    paymentBoxLabel,
    suggestedAmount,
    setAsMinimum = false,
    fixedAmount = false,
  } = settings;

  cy.log('Configuring Stripe element');

  // Open the configuration modal
  cy.get('form div')
    .find('.rud-drop-item:has(div:contains("' + PAGE_OPERATIONS.stripeProducts + '"))')
    .last()
    .dblclick();
  cy.wait(500);
  // Navigate to the Stripe tab
  cy.log('Navigating to Stripe tab');
  cy.get('.el-tabs__item:contains("' + PAGE_OPERATIONS.stripe + '")')
    .click();
  cy.wait(500);
  if (mode !== undefined) {
    cy.get(`.el-radio-button:has(span:contains("${mode}"))`)
      .click();
  }
  // Save Stripe settings
  cy.setTypeByListWithSpan(AVAILABLE_FORM_ELEMENTS.stripe.defaultSettings.currency, currency);
  cy.setTypeByListWithSpan(PAGE_OPERATIONS.select, paymentType);

  cy.log('Saving Stripe settings');
  cy.get('#pane-Stripe button:has(span:contains("' + PAGE_OPERATIONS.save + '"))')
    .click();
  cy.wait(500);
  cy.log('Navigating to Content tab');
  cy.get('.el-tabs__item:contains("' + PAGE_OPERATIONS.content + '")').click();
  cy.wait(500);
  // Configure Content tab and save settings
  cy.log('Configuring Content tab');
  if (paymentBoxLabel) {
    cy.get('input[placeholder="' + PAGE_OPERATIONS.paymentBoxLabel + '"]')
      .clear()
      .type(paymentBoxLabel);
  }

  if (suggestedAmount) {
    cy.get('input[placeholder="' + PAGE_OPERATIONS.suggestAmount + '"]')
      .clear()
      .type(suggestedAmount);
  }
  cy.wait(500);
  if (setAsMinimum) {
    cy.get('span:contains("' + PAGE_OPERATIONS.setSuggestAmount + '")')
      .parent()
      .find('.el-switch')
      .click({force:true});
  }
  cy.wait(500);
  if (fixedAmount) {
    cy.get('span:contains("' + PAGE_OPERATIONS.fixedAmount + '")')
      .parent()
      .find('.el-switch')
      .click({force:true});
  }
  cy.wait(500);
  cy.log('Saving Content settings');
  cy.get('span:contains("' + PAGE_OPERATIONS.fixedAmount + '")')
    .parent()
    .parent()
    .find('button:has(span:contains("Save"))')
    .click();
  cy.loadSelector('closeBtn')
    .click();
  cy.saveForm();

  // Open the configuration modal
  cy.get('form div')
    .find('.rud-drop-item:has(div:contains("' + PAGE_OPERATIONS.stripeProducts + '"))')
    .last()
    .dblclick();
  // Navigate to the Stripe tab
  cy.wait(500);
  cy.log('Navigating to Stripe tab');
  cy.get('.el-tabs__item:contains("' + PAGE_OPERATIONS.stripe + '")')
    .click();
  // Handle Connect
  cy.log('Connecting Stripe');

  // Log and allow window.open behavior
  cy.window().then((win) => {
    cy.stub(win, 'open').callsFake((url, target, features) => {
      cy.log(`Popup URL: ${url}`);
      return win.open(url, target, features);  // Call the original window.open behavior
    });
  });

  // Click the Connect button to trigger the popup
  cy.get('button').contains(PAGE_OPERATIONS.connect).click();
  cy.wait(5000);
  // Wait for the popup to open
  cy.window().then((win) => {
    const openCalls = win.open.getCalls();
    cy.log(`Number of open calls: ${openCalls.length}`);
    expect(openCalls.length).to.equal(1);
    expect(openCalls[0].args[0]).to.include('https://connect.stripe.com/oauth/authorize');
    
    const popupUrl = openCalls[0].args[0];
    cy.visit(popupUrl); // Visit the Stripe URL directly
  });
  cy.intercept('POST', '/api/payment/connection/confirm').as('stripeConfirm');
  // Now interact with the Stripe popup
  cy.origin('https://connect.stripe.com', { args: { TIMEOUTS, PAGE_OPERATIONS } }, ({ TIMEOUTS, PAGE_OPERATIONS }) => {
    cy.get('#skip-account-app', { timeout: 60000 }).should('be.visible').click();
  });

  // After clicking the "Skip this form" button, wait for the redirect URL
  cy.url({ timeout: 60000 }).should('include', 'stripe-callback');
  cy.wait('@stripeConfirm', { timeout: 100000 }).then((interception) => {
    expect(interception.response.statusCode).to.eq(200);
    cy.log('Stripe redirect successful');
  });
  cy.wait(10000);
  cy.go(-2);
  // Further assertions after redirect
  cy.url().should('include', 'https://dev.rocket-forms.at');
  
});