import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import test from 'node:test'

const root = resolve(import.meta.dirname, '..')
const read = (path) => readFileSync(resolve(root, path), 'utf8')

test('o Vite recebe um base path configurável e seguro', () => {
  const config = read('vite.config.ts')
  assert.match(config, /VITE_BASE_PATH/)
  assert.match(config, /base,/) 
  assert.match(config, /startsWith\('\/'\)/)
  assert.match(config, /endsWith\('\/'\)/)
})

test('os dados públicos usam BASE_URL em vez de caminhos absolutos', () => {
  const data = read('src/data.ts')
  assert.match(data, /import\.meta\.env\.BASE_URL/)
  assert.doesNotMatch(data, /['"]\/assets\//)
})

test('a aplicação usa uma única rota compatível com GitHub Pages', () => {
  const packageJson = JSON.parse(read('package.json'))
  assert.equal(packageJson.dependencies?.['react-router-dom'], undefined)
  assert.match(read('src/types.ts'), /export type AppView/)
})

test('o pipeline só publica depois das verificações obrigatórias', () => {
  const workflow = read('.github/workflows/deploy-pages.yml')
  for (const command of ['npm ci', 'npm run lint', 'npm test', 'npm run build', 'npm run verify:dist']) {
    assert.match(workflow, new RegExp(command.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  }
  assert.match(workflow, /pages: write/)
  assert.match(workflow, /id-token: write/)
  assert.match(workflow, /cache: npm/)
  assert.match(workflow, /deploy:[\s\S]*needs: build/)
  assert.match(workflow, /smoke-test:[\s\S]*needs: deploy/)
  assert.match(workflow, /cancel-in-progress: false/)
})
