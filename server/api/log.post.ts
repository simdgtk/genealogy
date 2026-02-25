import fs from 'fs'; export default defineEventHandler(async (event) => { const body = await readBody(event); fs.writeFileSync('debug-output.json', JSON.stringify(body, null, 2)); return 'ok'; })
