describe('success', () => {
  it('pass after 100ms', () => {
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(100) // force test to keep the same output
    expect(true).to.not.be.false
  })
})
