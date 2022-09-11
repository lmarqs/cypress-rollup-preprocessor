exports['cypress - e2e test: cypress integration 1'] = `

====================================================================================================
  (Run Starting)
  ┌────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ Cypress:    *.*.*                                                                              │
  │ Browser:    Chrome *** (headless)                                                              │
  │ Node Version:   v14.*.*                                                                        │
  │ Specs:          4 found (compile-error.cy.js, fail.cy.js, pass.cy.js, runtime-error.cy.js)     │
  │ Searched:       cypress/e2e/**/*.cy.{js,jsx,ts,tsx}                                            │
  └────────────────────────────────────────────────────────────────────────────────────────────────┘
────────────────────────────────────────────────────────────────────────────────────────────────────
  Running:  compile-error.cy.js                                                             (1 of 4)
Oops...we found an error preparing this test file:
  > cypress/e2e/compile-error.cy.js
The error was:
Error: Unexpected token
1: describe('compile error', () => {
2:   it('has syntax error'() => {}})
                             ^
3: })
/cypress/e2e/compile-error.cy.js:2:26
    at ****************************************************************************
    at ****************************************************************************
    at ****************************************************************************
    at ****************************************************************************
    at ****************************************************************************
This occurred while Cypress was compiling and bundling your test code. This is usually caused by:
- A missing file or dependency
- A syntax error in the file or one of its dependencies
Fix the error in your code and re-run your tests.
  (Results)
  ┌────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ Tests:        0                                                                                │
  │ Passing:      0                                                                                │
  │ Failing:      1                                                                                │
  │ Pending:      0                                                                                │
  │ Skipped:      0                                                                                │
  │ Screenshots:  0                                                                                │
  │ Video:        false                                                                            │
  │ Duration:     0 seconds                                                                        │
  │ Spec Ran:     compile-error.cy.js                                                              │
  └────────────────────────────────────────────────────────────────────────────────────────────────┘
────────────────────────────────────────────────────────────────────────────────────────────────────
  Running:  fail.cy.js                                                                      (2 of 4)
  fail on purpose
    1) fails
  0 passing (***ms)
  1 failing
  1) fail on purpose
       fails:
      AssertionError: expected 1 to be above 1
      + expected - actual
      at ****************************************************************************
  (Results)
  ┌────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ Tests:        1                                                                                │
  │ Passing:      0                                                                                │
  │ Failing:      1                                                                                │
  │ Pending:      0                                                                                │
  │ Skipped:      0                                                                                │
  │ Screenshots:  0                                                                                │
  │ Video:        false                                                                            │
  │ Duration:     0 seconds                                                                        │
  │ Spec Ran:     fail.cy.js                                                                       │
  └────────────────────────────────────────────────────────────────────────────────────────────────┘
────────────────────────────────────────────────────────────────────────────────────────────────────
  Running:  pass.cy.js                                                                      (3 of 4)
  success
    ✔ pass after ***ms (***ms)
  1 passing (***ms)
  (Results)
  ┌────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ Tests:        1                                                                                │
  │ Passing:      1                                                                                │
  │ Failing:      0                                                                                │
  │ Pending:      0                                                                                │
  │ Skipped:      0                                                                                │
  │ Screenshots:  0                                                                                │
  │ Video:        false                                                                            │
  │ Duration:     0 seconds                                                                        │
  │ Spec Ran:     pass.cy.js                                                                       │
  └────────────────────────────────────────────────────────────────────────────────────────────────┘
────────────────────────────────────────────────────────────────────────────────────────────────────
  Running:  runtime-error.cy.js                                                             (4 of 4)
  runtime error
    1) throws a error
  0 passing (***ms)
  1 failing
  1) runtime error
       throws a error:
     Error: error thrown on purpose
      at ****************************************************************************
  (Results)
  ┌────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ Tests:        1                                                                                │
  │ Passing:      0                                                                                │
  │ Failing:      1                                                                                │
  │ Pending:      0                                                                                │
  │ Skipped:      0                                                                                │
  │ Screenshots:  0                                                                                │
  │ Video:        false                                                                            │
  │ Duration:     0 seconds                                                                        │
  │ Spec Ran:     runtime-error.cy.js                                                              │
  └────────────────────────────────────────────────────────────────────────────────────────────────┘
====================================================================================================
  (Run Finished)
       Spec                                              Tests  Passing  Failing  Pending  Skipped  
  ┌────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ ✖  compile-error.cy.js                      ***ms        -        -        1        -        - │
  ├────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ ✖  fail.cy.js                               ***ms        1        -        1        -        - │
  ├────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ ✔  pass.cy.js                               ***ms        1        1        -        -        - │
  ├────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ ✖  runtime-error.cy.js                      ***ms        1        -        1        -        - │
  └────────────────────────────────────────────────────────────────────────────────────────────────┘
    ✖  3 of 4 failed (75%)                      ***ms        3        1        3        -        -  

`
