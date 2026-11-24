import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'

const projectRoot = resolve(import.meta.dirname, '..')
const distDir = join(projectRoot, 'dist')
const expectedBase = process.env.EXPECTED_BASE_PATH || process.env.VITE_BASE_PATH || '/'

assert.ok(
  expectedBase === '/' || /^\/[^?#]+\/$/.test(expectedBase),
  'EXPECTED_BASE_PATH deve ser "/" ou iniciar e terminar com "/".',
)
assert.ok(existsSync(distDir), 'A pasta dist não foi gerada.')

const indexPath = join(distDir, 'index.html')
assert.ok(existsSync(indexPath), 'dist/index.html não existe.')

const html = readFileSync(indexPath, 'utf8')
assert.match(html, /<title>Roxy - Fonoaudiologia Infantil<\/title>/, 'O HTML produzido não é o site Roxy.')

const urls = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map((match) => match[1])
const localUrls = urls.filter((url) => !/^(?:https?:|data:|mailto:|tel:|#)/.test(url))

assert.ok(localUrls.length > 0, 'Nenhum recurso local foi encontrado no HTML.')

for (const url of localUrls) {
  assert.ok(url.startsWith(expectedBase), `Recurso fora do base path ${expectedBase}: ${url}`)
  const resourcePath = url.slice(expectedBase.length).split(/[?#]/, 1)[0]
  assert.ok(resourcePath, `Caminho de recurso inválido: ${url}`)
  assert.ok(existsSync(join(distDir, resourcePath)), `Recurso referenciado não existe na dist: ${url}`)
}

const files = []
function walk(directory) {
  for (const name of readdirSync(directory)) {
    const absolutePath = join(directory, name)
    if (statSync(absolutePath).isDirectory()) walk(absolutePath)
    else files.push(absolutePath)
  }
}
walk(distDir)

assert.ok(files.some((file) => file.endsWith('.js')), 'A dist não contém bundle JavaScript.')
assert.ok(files.some((file) => file.endsWith('.css')), 'A dist não contém CSS de produção.')
assert.ok(files.some((file) => /roxy-brand-icon-v2\.png$/.test(file)), 'A logo do Roxy não foi copiada para a dist.')

if (expectedBase !== '/') {
  for (const file of files.filter((item) => /\.(?:html|css|js)$/.test(item))) {
    const content = readFileSync(file, 'utf8')
    assert.doesNotMatch(content, /["'(]\/assets\//, `Caminho absoluto /assets/ encontrado em ${relative(distDir, file)}.`)
  }
}

console.log(`dist validada: ${files.length} arquivos, base path ${expectedBase}`)
