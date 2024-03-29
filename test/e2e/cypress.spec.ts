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
  const { stdout } = spawnCypressProcess('run', '--browser', 'chrome')

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
  .replace(/Browser: +Chrome \d+.+/ug, 'Browser:    Chrome *** (headless)                                                              │')
  .replace(/Node Version: +v14.\d+.\d+.+/ug, 'Node Version:   v14.*.*                                                                        │')
  .replace(/cypress.integration./, 'cypress/integration/')
  .replace(/compile-error.cy.js .+ms/, 'compile-error.cy.js                      ***ms'.trim())
  .replace(/fail.cy.js .+ms/, '         fail.cy.js                               ***ms'.trim())
  .replace(/pass.cy.js .+ms/, '         pass.cy.js                               ***ms'.trim())
  .replace(/runtime-error.cy.js .+ms/, 'runtime-error.cy.js                      ***ms'.trim())
  .replace(/\d+ms/ug, '***ms')
  .replace(/at .+/ug, 'at ****************************************************************************')
  .replace(/×/ug, '✖')
  .replace(/√/ug, '✔')
  .replace(/✓/ug, '✔')
  .replace(/\\/ug, '/')
  .replace(/\r/ug, '')
  .replace(process.cwd().replace(/\\/ug, '/'), '')
  .replace(/\n\s*\n/g, '\n')
}
