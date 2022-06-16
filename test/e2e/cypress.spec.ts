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
  .replace(/localhost:\d+/g, 'localhost:****')
  .replace(/Cypress: +\d+.\d+.\d+.+/g, 'Cypress:    *.*.*                                                                              │')
  .replace(/Browser: +Electron \d+.+/g, 'Browser:    Electron ** (headless)                                                             │')
  .replace(/Node Version: +v\d+.\d+.\d+.+/g, 'Node Version:   v*.*.*                                                                         │')
  .replace(/cypress.integration./, 'cypress/integration/')
  .replace(/compile-error.spec.js .+ms/, 'compile-error.spec.js                    ***ms'.trim())
  .replace(/fail.spec.js .+ms/, '         fail.spec.js                             ***ms'.trim())
  .replace(/pass.spec.js .+ms/, '         pass.spec.js                             ***ms'.trim())
  .replace(/runtime-error.spec.js .+ms/, 'runtime-error.spec.js                    ***ms'.trim())
  .replace(/\d+ms/g, '***ms')
  .replace(/at .+/g, ' at ****************************************************************************')
  .replace(/\\/g, '/')
  .replace(/\r/g, '')
}
