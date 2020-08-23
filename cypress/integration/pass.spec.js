describe('success', () => {
  it('pass after 100ms', () => {
    cy.await(100)
    expect(1).to.be.greaterThan(0)
  })
})
