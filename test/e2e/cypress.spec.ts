import spawn from 'cross-spawn'
import snapshot from 'snap-shot-it'

describe('cypress - e2e', function () {
  it('test: cypress integration', function () {
    initCypress()

    const output = runCypress()

    snapshot(output)
  })
})

function initCypress (): void {
  spawnCypressProcess('verify')
}

function runCypress (): string {
  const { stdout } = spawnCypressProcess('run')

  return normalizeCypressRunProcessStdOut(stdout)
}

function spawnCypressProcess (...args: string[]) {
  return spawn.sync('npx', ['cypress', ...args], {
    encoding: 'utf8',
    env: {
      ...process.env,
      NO_COLOR: '1',
    },
  })
}

function normalizeCypressRunProcessStdOut (output: string): string {
  return output
  .replace(/localhost:\d+/ug, 'localhost:****')
  .replace(/Cypress: +\d+.\d+.\d+.+/ug, 'Cypress:    *.*.*                                                                              │')
  .replace(/Browser: +Electron \d+.+/ug, 'Browser:    Electron ** (headless)                                                             │')
  .replace(/Node Version: +v\d+.\d+.\d+.+/ug, 'Node Version:   v*.*.*                                                                         │')
  .replace(/cypress.integration./, 'cypress/integration/')
  .replace(/compile-error.cy.js .+ms/, 'compile-error.cy.js                      ***ms'.trim())
  .replace(/fail.cy.js .+ms/, '         fail.cy.js                               ***ms'.trim())
  .replace(/pass.cy.js .+ms/, '         pass.cy.js                               ***ms'.trim())
  .replace(/runtime-error.cy.js .+ms/, 'runtime-error.cy.js                      ***ms'.trim())
  .replace(/\d+ms/ug, '***ms')
  .replace(/Module build failed .+/ug, 'Module build failed (****************************************************************************)')
  .replace(/SyntaxError: .+/ug, 'SyntaxError: ****************************************************************************')
  .replace(/at .+/ug, ' at ****************************************************************************')
  .replace(/×/ug, '✖')
  .replace(/√/ug, '✔')
  .replace(/✓/ug, '✔')
  .replace(/\\/ug, '/')
  .replace(/\r/ug, '')
  .replace(/\n\s*\n/g, '\n')
}
