const { defineConfig } = require('cypress');
const terminalReport = require("cypress-terminal-report/src/installLogsPrinter");

module.exports = defineConfig({
  retries: {
    runMode: 0,
    openMode: 0,
  },
  reporter: 'mochawesome',
  reporterOptions: {
    mochaFile: 'cypress/results/test-results-[hash].xml',
    overwrite: false,
    html: true,
    json: true,
    toConsole: true,
  },
  videosFolder: "cypress/videos",
  video: false,
  screenshotsFolder: "cypress/screenshots",
  screenshotOnRunFailure: true,
  viewportWidth: 1280,
  viewportHeight: 720,
  e2e: {
    baseUrl: 'https://rocket-forms.at/en', // production server
    // baseUrl: 'https://rocket-forms.at/en', // test server
    specPattern: 'cypress/integration',
    supportFile: 'cypress/support/index.js',
    setupNodeEvents(on, config) {
      terminalReport(on, {
        outputRoot: require('path').resolve(__dirname, 'cypress/results'),
        outputTarget: {
          'cypress/results/terminal-log.txt': 'txt',
          'cypress/results/terminal-log.html': 'html',
        },
        printLogsToConsole: 'always',
        printLogsToFile: 'always',
      });
      return config;
    },
    defaultCommandTimeout: 50000,
  }
})
