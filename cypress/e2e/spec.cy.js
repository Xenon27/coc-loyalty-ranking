// loyalty_ranking_spec.js

describe('Clash of Clans Loyalty Ranking', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000') // Before each test visit the app
  })

  it('Shows correct title on browser tab', () => {
    cy.title().should('eq', 'CLASH OF CLANS LOYALTY RANKING') // Check if the title matches
  })

  it('Shows filter for clans', () => {
    cy.get('.v-select').should('exist') // Check if the filter for clans is present
  })

  it('Filters users by clan', () => {
    cy.get('.v-select input').click({ force: true }) // Click on the select input
    cy.get('.v-select').first().click({ force: true }) // Click on the first item in the dropdown
    cy.get('tbody tr').should('have.length.gt', 0) // Check if the table displays filtered users
  })

  it('Displays the correct number of table columns in the main table', () => {
    cy.get('thead tr').children().should('have.length', 4) // Check if the table has four columns
  })

  it('Expands user history', () => {
    cy.get('tbody tr').first().click({ force: true }) // Click on the first user row to expand it
    cy.get('.v-card').should('be.visible') // Check if the v-card which is in the expanded panel is visible
  })

  it('Displays user details on click', () => {
    cy.get('tbody tr').first().click({ force: true }) // Click on the first user row
    cy.contains('.v-card', 'Clan Name') // Check if user details are displayed in the v-card
    cy.contains('.v-card', 'Duration')
  })

  it('Expands user history on clicking the row again', () => {
    cy.get('tbody tr').first().click({ force: true }) // Click on the first user row to expand
    cy.get('tbody tr').first().click({ force: true }) // Click on the first user row again
    cy.get('.v-card').should('be.visible') // Check if the expanded panel is still visible
  })
})
