import { spawnSync } from 'child_process'
import snapshot from 'snap-shot-it'

describe('cypress - e2e', async () => {
  it('test: cypress integration', () => {
    initCypress()

    const output = runCypress()

    assertCompilationOutput(output)
  })
})

function initCypress (): void {
  spawnCypressProcess('verify')
}

function runCypress (): string {
  const { stdout } = spawnCypressProcess('run')

  return normalizeCypressRunProcessStdOut(stdout.toString())
}

function spawnCypressProcess (...args: string[]) {
  return spawnSync('npx', ['cypress', ...args], {
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
  .replace(/compile-error.spec.js .+ms/, 'compile-error.spec.js                    ***ms'.trim())
  .replace(/fail.spec.js .+ms/, '         fail.spec.js                             ***ms'.trim())
  .replace(/pass.spec.js .+ms/, '         pass.spec.js                             ***ms'.trim())
  .replace(/runtime-error.spec.js .+ms/, 'runtime-error.spec.js                    ***ms'.trim())
  .replace(/\d+ms/g, '***ms')
}

function assertCompilationOutput (output: string) {
  snapshot(output)
}
