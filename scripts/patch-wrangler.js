import { readFileSync, writeFileSync } from 'fs'

const path = 'dist/client/wrangler.json'
const config = JSON.parse(readFileSync(path, 'utf8'))
config.main = '../server/server.js'
writeFileSync(path, JSON.stringify(config))
console.log('Patched dist/client/wrangler.json with main: ../server/server.js')
