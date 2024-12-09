// Various loading timeouts
export const TIMEOUTS = {
    default: 50000,
    apiRequest: 100000,
    pageLoad: 1000000,
    elementVisibility: 100000,
};

// URLs for visiting the sites
export const URLS = {
    home: '/',
    api: 'https://udmformgenerator-dev-laravel-backend.azurewebsites.net/api',
    forms: 'https://rocket-forms.at/en/v1/forms/',
}

// This defines the alert messages.
export const ALERT_MESSAGES = {
    invalidCredentials: 'The provided credentials are incorrect.',
    emailRequired: 'email is required',
    passwordRequired: 'password is required',
    nameRequired: 'name is required',
    formLimit: 'Subscribe to one of our plans to get access to all features and benefits.',
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

// This defines variables for general operation of the page.
export const PAGE_OPERATIONS = {
    new: "New",
    edit: "Edit",
    delete: "Delete",
    add: "Add",
    archive: "Archive",
    publish: "Publish",
    share: "Share",
    confirm: "Confirm",
    ok: "OK",
    openNewTab: 'Open in New Tab',
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