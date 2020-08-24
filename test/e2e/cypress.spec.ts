import { spawnSync } from 'child_process'
import snapshot from 'snap-shot-it'

describe('cypress - e2e', async () => {
  it(`test: cypress integration`, async () => {
    spawnSync('npx', ['cypress', 'verify'])

    const result = spawnSync('npx', ['cypress', 'run'], {
      encoding: 'utf8',
      env: {
        ...process.env,
        NO_COLOR: '1',
      },
    })
    const output = sanitizeOutput(result.stdout.toString())

    snapshot(output)
  }).timeout(60_000)
})

function sanitizeOutput (output: string): string {
  return output
  .replace(/localhost:\d+/g, 'localhost:****')
  .replace(/Cypress: \d+.\d+.\d+.+/g, 'Cypress:    *.*.*                                                                              │')
  .replace(/Browser: +Electron \d+.+/g, 'Browser:    Electron ** (headless)                                                             │')
  .replace(/compile-error.spec.js .+ms/, 'compile-error.spec.js                    ***ms'.trim())
  .replace(/fail.spec.js .+ms/, '         fail.spec.js                             ***ms'.trim())
  .replace(/pass.spec.js .+ms/, '         pass.spec.js                             ***ms'.trim())
  .replace(/runtime-error.spec.js .+ms/, 'runtime-error.spec.js                    ***ms'.trim())
  .replace(/\d+ms/g, '***ms')
}
