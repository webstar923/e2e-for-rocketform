// Various loading timeouts
export const TIMEOUTS = {
    default: 50000,
    shortDelay: 2000,
    eventDelay: 5000,
    hoverDelay: 10000,
    urlCheck: 20000,
    apiRequest: 100000,
    pageLoad: 1000000,
    elementVisibility: 500000,
};

// URLs for visiting the sites
export const URLS = {
    home: '/',
    // api: 'https://udmformgenerator-dev-laravel-backend.azurewebsites.net/api',
    // forms: 'https://rocket-forms.at/en/v1/forms/',
    // submit: 'https://rocket-forms.at/form/',
    api: 'https://dev-udmformgenerator-laravel-backend-akfhhvh5afbcbtha.westeurope-01.azurewebsites.net/api',
    forms: 'https://dev.rocket-forms.at/en/v1/forms/',
    submit: 'https://dev.rocket-forms.at/form/',
}

// This defines the alert messages.
export const ALERT_MESSAGES = {
    invalidCredentials: 'The provided credentials are incorrect.',
    emailRequired: 'email is required',
    passwordRequired: 'password is required',
    nameRequired: 'name is required',
    formLimit: 'Subscribe to one of our plans to get access to all features and benefits.',
    deletForm: 'Are you sure to archive this?',
};

// This defines the form elements of the form page.
export const FORM_ELEMENTS = {
    container: 'Container',
    heading: 'Heading',
    input: 'Input',
    text: 'Long text',
    number: 'Number',
    email: "Email",
    checkbox: 'Checkbox',
    selection: 'Multiple selection',
    radio: 'Radio',
    dropdown: 'Dropdown',
    range: 'Range',
    dateTime: 'Date and time',
    image: 'Image',
    switch: 'Switch',
    divider: 'Divider',
    list: 'List',
    button: 'Button',
    calc: 'Calculation',
    country: 'Country',
    upload: 'File upload',
    rating: 'Rating',
    sign: 'Signature',
    selectColor: 'Select colour',
    stripe: 'Stripe Checkout'
};

export const AVAILABLE_FORM_ELEMENTS = {
    heading: {
      defaultSettings: {
        tagName: "H3",
        text: "Heading 3",
        visible: true
      }  
    },
    input: {
        defaultSettings: {
          label: "Input",
          placeholder: "Text Input",
          type: 'text',
          clearable: false,
          autocomplete: false,
          showWordLimit: false,
          minLength: null,
          maxLength: null,
        }  
    },
    selection: {
        defaultSettings: {
          label: "Multiple Choice",
          type: "Default",
          option: {
            option1: "Option1",
            option2: "Option2"
          }
        }  
    },
};

// This defines variables for general operation of the page.
export const PAGE_OPERATIONS = {
    new: "New",
    edit: "Edit",
    delete: "Delete",
    deleteForm: "Delete this form",
    add: "Add",
    archive: "Archive",
    archived: "Archived",
    publish: "Publish",
    share: "Share",
    confirm: "Confirm",
    ok: "OK",
    save: "Save",
    openNewTab: 'Open in New Tab',
    send: 'Send',
    tagName: 'Tag Name',
    headingText: 'Heading Text',
    visible: 'Visibility',
    hidden: 'Hidden',
    lable: 'Label',
    placeholder: 'Placeholder',
    type: 'Type'
};

// This defines variable for modal title.
export const MODAL_TITLE = {
    newForm: "Create New Form",
    newTemp: "Create New Template"
}

// This defines variable for placeholder on Form elements
export const FORM_HINT = {
    name: "Form Name",
}

export const LOG_OUT_TEXT = 'Log out';
export const LOGIN_BUTTON_TEXT = 'Sign in';