/**
 * Host half of the Vision Model workbench bundle.
 *
 * The prototype is a self-contained static page (index.html + style.css +
 * app.js + scene.svg). It is served from the Harness web server as a
 * same-origin page so the Client panel can frame it and all demo interactions
 * keep working without a build step or network dependency.
 *
 * GET|HEAD /dsh-vision-model/             -> index.html
 * GET|HEAD /dsh-vision-model/index.html   -> index.html
 * GET|HEAD /dsh-vision-model/style.css    -> style.css
 * GET|HEAD /dsh-vision-model/app.js       -> app.js
 * GET|HEAD /dsh-vision-model/scene.svg    -> scene.svg
 */
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

export const inject = ['webServer']

const PREFIX = '/dsh-vision-model'
const PAGE_DIR = fileURLToPath(new URL('./', import.meta.url))
const PAGE_ROUTES = new Map([
  [PREFIX, 'index.html'],
  [`${PREFIX}/index.html`, 'index.html'],
  [`${PREFIX}/style.css`, 'style.css'],
  [`${PREFIX}/app.js`, 'app.js'],
  [`${PREFIX}/scene.svg`, 'scene.svg'],
])

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8',
}

function sendText(res, status, body, contentType = 'text/plain; charset=utf-8') {
  res.statusCode = status
  res.setHeader('content-type', contentType)
  res.setHeader('content-length', String(Buffer.byteLength(body)))
  res.setHeader('cache-control', 'no-store')
  res.setHeader('x-content-type-options', 'nosniff')
  res.end(body)
}

function pathnameOf(req) {
  try {
    const path = new URL(req.url ?? '/', 'http://127.0.0.1').pathname
    return path.length > 1 ? path.replace(/\/+$/, '') : path
  } catch {
    return ''
  }
}

export function apply(ctx) {
  async function handler(req, res) {
    const method = req.method ?? 'GET'
    if (method !== 'GET' && method !== 'HEAD') {
      res.setHeader('allow', 'GET, HEAD')
      sendText(res, 405, 'method not allowed')
      return
    }
    const file = PAGE_ROUTES.get(pathnameOf(req))
    if (file === undefined) {
      sendText(res, 404, 'not found')
      return
    }
    try {
      const page = await readFile(new URL(file, `file://${PAGE_DIR}`))
      const extension = file.slice(file.lastIndexOf('.'))
      res.statusCode = 200
      res.setHeader('content-type', MIME[extension] ?? 'application/octet-stream')
      res.setHeader('content-length', String(page.byteLength))
      res.setHeader('cache-control', 'no-store')
      res.setHeader('x-content-type-options', 'nosniff')
      res.end(method === 'HEAD' ? undefined : page)
    } catch (error) {
      console.warn(`[vision-model] ${error instanceof Error ? error.message : String(error)}`)
      sendText(res, 500, 'vision-model page is missing')
    }
  }

  ctx.effect(
    () => ctx.webServer.register({ kind: 'prefix', path: PREFIX, handler }),
    'vision-model: local workbench page route',
  )
}
