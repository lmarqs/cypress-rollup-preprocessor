describe('basic example', () => {
  it('works', () => {
    interface Data {
      person: {
        firstName: string
      }
    }

    const data: Data = {
      person: {
        firstName: 'Joe',
      },
    }

    expect(data.person.firstName).to.equal('Joe')

    cy.wrap(data).should('have.property', 'person')
    .should('deep.equal', { firstName: 'Joe' })
  })
})
