exports['cypress - e2e test: cypress integration 1'] = `

====================================================================================================

  (Run Starting)

  ┌────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ Cypress:    *.*.*                                                                              │
  │ Browser:    Electron ** (headless)                                                             │
  │ Specs:      4 found (compile-error.spec.js, fail.spec.js, runtime-error.spec.js, success.spec. │
  │             js)                                                                                │
  └────────────────────────────────────────────────────────────────────────────────────────────────┘


────────────────────────────────────────────────────────────────────────────────────────────────────
                                                                                                    
  Running:  compile-error.spec.js                                                           (1 of 4)

Oops...we found an error preparing this test file:

  cypress/integration/compile-error.spec.js

The error was:

Error: Unexpected token

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
  │ Spec Ran:     compile-error.spec.js                                                            │
  └────────────────────────────────────────────────────────────────────────────────────────────────┘


────────────────────────────────────────────────────────────────────────────────────────────────────
                                                                                                    
  Running:  fail.spec.js                                                                    (2 of 4)


  foo
    1) fails


  0 passing (***ms)
  1 failing

  1) foo
       fails:

      AssertionError: expected 1 to be above 1
      + expected - actual


      at Context.eval (http://localhost:****/__cypress/tests?p=cypress/integration/fail.spec.js:8:23)




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
  │ Spec Ran:     fail.spec.js                                                                     │
  └────────────────────────────────────────────────────────────────────────────────────────────────┘


────────────────────────────────────────────────────────────────────────────────────────────────────
                                                                                                    
  Running:  runtime-error.spec.js                                                           (3 of 4)


  foo
    1) has runtime error


  0 passing (***ms)
  1 failing

  1) foo
       has runtime error:
     Error: error thrown on purpose
      at Context.eval (http://localhost:****/__cypress/tests?p=cypress/integration/runtime-error.spec.js:8:13)




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
  │ Spec Ran:     runtime-error.spec.js                                                            │
  └────────────────────────────────────────────────────────────────────────────────────────────────┘


────────────────────────────────────────────────────────────────────────────────────────────────────
                                                                                                    
  Running:  success.spec.js                                                                 (4 of 4)


  foo
    ✓ works (***ms)


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
  │ Spec Ran:     success.spec.js                                                                  │
  └────────────────────────────────────────────────────────────────────────────────────────────────┘


====================================================================================================

  (Run Finished)


       Spec                                              Tests  Passing  Failing  Pending  Skipped  
  ┌────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ ✖  compile-error.spec.js                      ***ms        -        -        1        -        - │
  ├────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ ✖  fail.spec.js                             ***ms        1        -        1        -        - │
  ├────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ ✖  runtime-error.spec.js                     ***ms        1        -        1        -        - │
  ├────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ ✔  success.spec.js                          ***ms        1        1        -        -        - │
  └────────────────────────────────────────────────────────────────────────────────────────────────┘
    ✖  3 of 4 failed (75%)                      ***ms        3        1        3        -        -  


`
