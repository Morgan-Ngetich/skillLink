import express from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isProduction = process.env.NODE_ENV === 'production'
const PORT = process.env.PORT || 3000  // For nginx upstream

async function createServer() {
  const app = express()

  // In production, nginx serves static files
  // Node.js only handles SSR requests

  // Health check endpoint for nginx
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy', service: 'node-ssr' })
  })

  // Handle all routes
  app.use(/(.*)/, async (req, res) => {
    try {
      const url = req.originalUrl.split("?")[0]
      
      // Production mode - use built files
      const template = fs.readFileSync('/usr/share/nginx/html/index.html', 'utf-8')
      const render = (await import('/app/dist/server/entry-server.js')).render

      // SSR for bots (requests proxied from nginx)
      try {
        const { html, head } = await render(url)

        const finalHtml = template
          .replace(`<!--app-head-->`, head.title + head.meta + head.link + head.script)
          .replace(`<!--app-html-->`, html)

        res.status(200).set({ 'Content-Type': 'text/html' }).end(finalHtml)
      } catch (ssrError) {
        console.error('SSR Error:', ssrError)
        // Fallback to client-side rendering
        const fallbackHtml = template
          .replace(`<!--app-head-->`, '<title>CrackMode | Master LeetCode & Algorithms</title>')
          .replace(`<!--app-html-->`, '<div id="root"></div>')
        res.status(200).set({ 'Content-Type': 'text/html' }).end(fallbackHtml)
      }

    } catch (e) {
      console.log('SSR Server Error:', e.stack)
      res.status(500).end('Server Error')
    }
  })

  app.listen(PORT, () => {
    console.log(`Node.js SSR server running on http://localhost:${PORT}`)
  })
}

createServer()