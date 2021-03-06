describe('basic example', function () {
  it('works', function () {
    const data = {
      person: {
        firstName: 'Joe',
      },
    }

    expect(data.person.firstName).to.equal('Joe')

    cy.wrap(data).should('have.property', 'person')
    .should('deep.equal', { firstName: 'Joe' })
  })
})
