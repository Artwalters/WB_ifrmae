import { execSync } from 'node:child_process'
import { copyFileSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const TARGET = resolve(ROOT, '../WB_v8')
const REPO = 'Artwalters/WB_v8'
const FILES = ['app.js', 'app.css']

const run = (cmd, cwd = ROOT) =>
  execSync(cmd, { cwd, stdio: 'inherit' })
const capture = (cmd, cwd = ROOT) =>
  execSync(cmd, { cwd }).toString().trim()

if (!existsSync(TARGET)) {
  console.error(`✗ Target repo not found at ${TARGET}`)
  console.error('  Clone it first: git clone https://github.com/Artwalters/WB_v8.git ../WB_v8')
  process.exit(1)
}

console.log('→ Production build')
run('pnpm build')

console.log('→ Copy build files')
for (const file of FILES) {
  copyFileSync(resolve(ROOT, 'dist', file), resolve(TARGET, file))
}

console.log('→ Stage')
run(`git add ${FILES.join(' ')}`, TARGET)

const status = capture('git status --porcelain', TARGET)
if (!status) {
  console.log('✓ No changes — already up to date')
  process.exit(0)
}

const sourceHash = capture('git rev-parse --short HEAD', ROOT)
const sourceMsg = capture('git log -1 --pretty=%s', ROOT).replace(/"/g, '\\"')
const message = `Build ${sourceHash}: ${sourceMsg}`

console.log(`→ Commit: ${message}`)
run(`git commit -m "${message}"`, TARGET)

console.log('→ Push')
run('git push origin main', TARGET)

const newHash = capture('git rev-parse --short HEAD', TARGET)

console.log('→ Purge jsDelivr cache')
for (const file of FILES) {
  try {
    const res = await fetch(`https://purge.jsdelivr.net/gh/${REPO}@main/${file}`)
    console.log(`  ${file}: ${res.status}`)
  } catch (e) {
    console.warn(`  ${file}: purge failed (${e.message})`)
  }
}

console.log(`\n✓ Deployed ${newHash}\n`)
console.log('Latest (cached 12h):')
for (const file of FILES) {
  console.log(`  https://cdn.jsdelivr.net/gh/${REPO}@main/${file}`)
}
console.log('\nPinned (immutable):')
for (const file of FILES) {
  console.log(`  https://cdn.jsdelivr.net/gh/${REPO}@${newHash}/${file}`)
}
