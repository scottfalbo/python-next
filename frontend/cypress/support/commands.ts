// cypress/support/commands.ts
// Define custom commands here
// Example: Cypress.Commands.add('login', (email, password) => { ... })

declare global {
  namespace Cypress {
    interface Chainable {
      // Add custom command types here
    }
  }
}

export {};
