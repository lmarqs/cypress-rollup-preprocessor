import { spawnSync } from 'child_process'
import snapshot from 'snap-shot-it'

describe('cypress - e2e', async () => {
  it(`test: cypress integration`, async () => {
    const keepSameOutputForCiEnvVars = {
      NO_COLOR: '1',
      CYPRESS_INTERNAL_E2E_TESTS: '1',
    }

    const result = spawnSync('npx', ['cypress', 'run'], {
      encoding: 'utf8',
      env: {
        ...process.env,
        ...keepSameOutputForCiEnvVars,
      },
    })
    const output = sanitizeOutput(result.stdout.toString())

    snapshot(output)
  }).timeout(60_000)
})

function sanitizeOutput (output: string): string {
  return output
  .replace(/\d+ms/g, '***ms')
  .replace(/localhost:\d+/g, 'localhost:****')
  .replace(/Cypress: {4}\d+.\d+.\d+/g, 'Cypress:    *.*.*')
  .replace(/Browser: {4}Electron \d+/g, 'Browser:    Electron **')
}
