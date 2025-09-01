import express from 'express'
import { createServer as createViteServer } from 'vite'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isProduction = process.env.NODE_ENV === 'production'
const PORT = process.env.PORT || 5173

async function createServer() {
  const app = express()

  let vite
  if (!isProduction) {
    // Create Vite server in middleware mode
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom'
    })
    app.use(vite.middlewares)
  } else {
    // Serve static files in production
    app.use(express.static(path.resolve('dist/client')))
  }

  // Handle all routes
  app.use(/(.*)/, async (req, res) => {
    try {
      const url = req.url.split("?")[0]
      let template, render
      if (!isProduction) {
        // Dev mode - read template and transform
        template = fs.readFileSync(path.resolve('index.html'), 'utf-8')
        template = await vite.transformIndexHtml(url, template)
        render = (await vite.ssrLoadModule('/src/seo/entry-server.tsx')).render
      } else {
        // Production mode - use built files
        template = fs.readFileSync(path.resolve('dist/client/index.html'), 'utf-8')
        render = (await import(path.resolve(__dirname, '../dist/server/entry-server.js'))).render
      }

      // Check if this is a bot/crawler
      const userAgent = req.get('User-Agent') || ''
      const isBot = /bot|crawler|spider|crawling/i.test(userAgent) || /facebookexternalhit|twitterbot|linkedinbot|slackbot|telegrambot|whatsapp|discordbot/i.test(userAgent)

      if (isBot || req.query._escaped_fragment_ !== undefined) {
        // SSR for bots
        try {
          const { html, head } = await render(url)

          const finalHtml = template
            .replace(`<!--app-head-->`, head.title + head.meta + head.link + head.script)
            .replace(`<!--app-html-->`, html)

          res.status(200).set({ 'Content-Type': 'text/html' }).end(finalHtml)
        } catch (ssrError) {
          // TODO: Have a fallback to "/" and "/crackmode"
          console.error('SSR Error:', ssrError)
          // Fallback to client-side rendering
          const fallbackHtml = template
            .replace(`<!--app-head-->`, '<title>CrackMode | Master LeetCode & Algorithms</title>')
            .replace(`<!--app-html-->`, '<div id="root"></div>')

          res.status(200).set({ 'Content-Type': 'text/html' }).end(fallbackHtml)
        }
      } else {
        // Client-side rendering for regular users
        // TODO: Have a fallback to "/" and "/crackmode"
        const clientHtml = template
          .replace(`<!--app-head-->`, '<title>CrackMode | Master LeetCode & Algorithms</title>')
          .replace(`<!--app-html-->`, '<div id="root"></div>')

        res.status(200).set({ 'Content-Type': 'text/html' }).end(clientHtml)
      }

    } catch (e) {
      if (!isProduction && vite) {
        vite.ssrFixStacktrace(e)
      }
      console.log(e.stack)
      res.status(500).end(e.stack)
    }
  })

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
  })
}

createServer()