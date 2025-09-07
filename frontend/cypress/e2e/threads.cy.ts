// cypress/e2e/threads.cy.ts
describe('Thread Management', () => {
  beforeEach(() => {
    // Visit the home page
    cy.visit('/')
  })

  it('should display the home page with thread creation form', () => {
    cy.contains('Discussion Threads')
    cy.contains('Create New Thread')
    cy.get('input[placeholder="Enter thread title"]').should('be.visible')
    cy.get('textarea[placeholder="Enter thread content"]').should('be.visible')
  })

  it('should create a new thread and navigate to it', () => {
    const threadTitle = 'Test Thread Title'
    const threadContent = 'This is a test thread content for Cypress E2E testing.'

    // Create a new thread
    cy.get('input[placeholder="Enter thread title"]').type(threadTitle)
    cy.get('textarea[placeholder="Enter thread content"]').type(threadContent)
    cy.get('button').contains('Create Thread').click()

    // Wait for the thread to appear and click on it
    cy.contains(threadTitle).should('be.visible')
    cy.contains(threadTitle).click()

    // Verify we're on the thread page
    cy.url().should('include', '/thread/')
    cy.contains(threadTitle).should('be.visible')
    cy.contains(threadContent).should('be.visible')
    cy.contains('Add a Reply').should('be.visible')
  })

  it('should create a thread, navigate to it, and post a reply', () => {
    const threadTitle = 'Thread for Reply Test'
    const threadContent = 'This thread will receive a reply.'
    const replyContent = 'This is a test reply to the thread.'

    // Create a new thread
    cy.get('input[placeholder="Enter thread title"]').type(threadTitle)
    cy.get('textarea[placeholder="Enter thread content"]').type(threadContent)
    cy.get('button').contains('Create Thread').click()

    // Navigate to the thread
    cy.contains(threadTitle).click()

    // Verify we're on the thread page
    cy.url().should('include', '/thread/')
    cy.contains('Replies (0)').should('be.visible')

    // Add a reply
    cy.get('textarea[placeholder="Enter your reply"]').type(replyContent)
    cy.get('button').contains('Post Reply').click()

    // Verify the reply appears
    cy.contains('Replies (1)').should('be.visible')
    cy.contains(replyContent).should('be.visible')
  })

  it('should navigate back to home from thread page', () => {
    const threadTitle = 'Navigation Test Thread'
    const threadContent = 'Testing navigation between pages.'

    // Create a new thread
    cy.get('input[placeholder="Enter thread title"]').type(threadTitle)
    cy.get('textarea[placeholder="Enter thread content"]').type(threadContent)
    cy.get('button').contains('Create Thread').click()

    // Navigate to the thread
    cy.contains(threadTitle).click()

    // Click back to all threads
    cy.contains('← Back to all threads').click()

    // Verify we're back on the home page
    cy.url().should('eq', 'http://localhost:3000/')
    cy.contains('Discussion Threads').should('be.visible')
  })

  it('should handle empty thread creation gracefully', () => {
    // Try to create a thread without filling required fields
    cy.get('button').contains('Create Thread').click()

    // Form validation should prevent submission
    cy.get('input[placeholder="Enter thread title"]').should('have.attr', 'required')
    cy.get('textarea[placeholder="Enter thread content"]').should('have.attr', 'required')
  })
})
