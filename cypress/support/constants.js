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

// This defines variables for general operation of the page.
export const PAGE_OPERATIONS = {
  add: 'Add',
  activeText: 'Active Text',
  alt: 'Alt',
  archive: 'Archive',
  archived: 'Archived',
  assignPDF: 'Assign PDF',
  autoComplete: 'Autocomplete',
  autoSize: 'Autosize',
  breakpoint: 'Show Breakpoints',
  clearable: 'Clearable',
  customClass: 'Custom Class',
  confirm: 'Confirm',
  connect: 'Connect',
  connected: 'Connected',
  connectmsg: 'We are connecting...',
  content: 'Content',
  dateTime: 'DateTime',
  delete: "Delete",
  deleteForm: 'Delete this form',
  documents: "documents",
  edit: "Edit",
  emailRecipe: 'E-Mail as recipient',
  eSign: 'Electronic signature',
  extURL: 'External URL or Media library',
  filterable: 'Filterable',
  fixedAmount: 'Fixed Amount',
  format: 'Format',
  general: 'General',
  headingText: 'Heading Text',
  hidden: 'Hidden',
  inactiveText: 'Inactive Text',
  items: 'Items',
  label: 'Label',
  lazy: 'Lazy',
  longText: 'Long Text',
  next: 'Next',
  minLength: 'Min Length',
  minValue: 'Minimum Value',
  maxLength: 'Max Length',
  maxValue: 'Maximum Value',
  multiple: 'Multiple',
  new: "New",
  ok: 'OK',
  openNewTab: 'Open in New Tab',
  optLabel: 'Optional Label Backend',
  placeholder: 'Placeholder',
  paymentBoxLabel: 'Payment Box Sub Label',
  publish: 'Publish',
  prompt: 'Inline Prompt',
  rows: 'Rows',
  save: 'Save',
  select: 'Select',
  send: 'Send',
  share: 'Share',
  show: 'Show',
  showWordLimit: 'Show Word Limit',
  signature: 'Signature',
  skipForm: 'Skip this form',
  step: 'Step',
  stripe: 'Stripe',
  stripeProducts: 'My Products',
  suggestAmount: 'Suggested Amount',
  setSuggestAmount: 'Set \\"Suggested Amount\\" as Minimum',
  title: 'Title',
  type: 'Type',
  tagName: 'Tag Name',
  valFormat: 'Value Format',
  visible: 'Visibility',
  width: 'Width'
};

// This defines the form elements of the form page.
export const FORM_ELEMENTS = {
    container: ['Container', ''],
    heading: ['Heading', 'setHeading'],
    input: ['Input', 'setInput'],
    text: ['Long text', 'setText'],
    number: ['Number', 'setNumber'],
    email: ["Email", 'setEmail'],
    checkbox: ['Checkbox', 'setCheckbox'],
    selection: ['Multiple selection', 'setSelection'],
    radio: ['Radio', 'setRadio'],
    dropdown: ['Dropdown', 'setDropdown'],
    range: ['Range','setRange'],
    dateTime: ['Date and time', 'setDateTime'],
    image: ['Image', 'setImage'],
    switch: ['Switch', 'setSwitch'],
    divider: ['Divider', 'setDivider'],
    list: ['List', 'setList'],
    button: ['Button', 'setButton'],
    calc: ['Calculation', ''],
    country: ['Country', ''],
    upload: ['File upload', ''],
    rating: ['Rating', ''],
    sign: ['Signature', ''],
    selectColor: ['Select colour', ''],
    stripe: ['Stripe Checkout', 'setStripe']
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
          autoComplete: false,
          showWordLimit: false,
          minLength: null,
          maxLength: null,
        }  
    },

    text: {
      defaultSettings: {
        label: "Long Text",
        placeholder: "Long Text Input",
        clearable: false,
        autoComplete: false,
        showWordLimit: false,
        autoSize: true,
        minLength: null,
        maxLength: null,
        rows: 2
      }
    },

    number: {
      defaultSettings: {
        label: "Number",
        placeholder: "Number Input",
        minValue: null,
        maxValue: null,
        step: 1
      }
    },

    email: {
      defaultSettings: {
        label: "Email",
        placeholder: "John@udm.at",
        recipient: false,
        clearable: false,
        autoComplete: false,
      }
    },

    checkbox: {
      defaultSettings: {
        label: "Checkbox",
        optLabel: '',
        customClass: ''
      }
    },

    radio: {
      defaultSettings: {
        label: "Radio",
        type: "Default",
        options: {
          option1: "Option1",
          option2: "Option2"
        }
      }  
    },

    selection: {
        defaultSettings: {
          label: "Multiple Choice",
          type: "Default",
          options: {
            option1: "Option1",
            option2: "Option2"
          }
        }  
    },

    dropdown: {
      defaultSettings: {
        label: "Dropdown",
        placeholder: "Choose an option",
        clearable: false,
        filterable: false,
        multiple: false,
        options: {
          option1: "Option1",
          option2: "Option2"
        }
      }  
    },

    range: {
      defaultSettings: {
        label: "Range",
        minValue: 0,
        maxValue: 100,
        step: 1,
        breakpoint: false
      }
    },

    dateTime: {
      defaultSettings: {
        label: "DateTime",
        placeholder: "Pick a Date",
        type: "date",
        format: "YYYY-MM-DD HH:mm:ss",
        valFormat: "YYYY-MM-DD HH:mm:ss"
      }
    },

    image: {
      defaultSettings: {
        label: "Image",
        url: null,
        type: null,
        lazy: false,
        alt: "native attribute alt"
      }
    },

    switch: {
      defaultSettings: {
        label: "Switch",
        activeText: null,
        inactiveText: null,
        width: null,
        prompt: false
      }
    },

    divider: {
      defaultSettings: {
        borderStyle: "Solid",
        label: null,
        lazy1: "Center",
        lazy2: "Horizontal"
      }
    },

    list: {
      defaultSettings: {
        label: "List",
        type: "Disc",
        items: {
          item1: "item"
        }
      }  
    },

    button: {
      defaultSettings: {
        label: "Button Text",
        type: "Primary",
        className: null
      }  
    },

    stripe: {
      defaultSettings: {
        mode: "Test",
        currency: "EUR - European Union Currency",
        paymentType: "",
        paymentBoxLabel: "",
        suggestedAmount: 0,
        setAsMinimum: false,
        fixedAmount: false
      }  
  },
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