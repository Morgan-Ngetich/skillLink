import express from 'express'
import { createServer as createViteServer } from 'vite'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isProduction = process.env.NODE_ENV === 'production'
const PORT = process.env.PORT || 8080

// Fallback content generator
function getFallbackContent(url) {
  if (url === '/' || url === '') {
    return {
      title: 'MENTspace | Get your Mentor',
      description: 'Master your craft. Get a Mentor, Today.',
      content: `
        <div id="root">
          <header style="text-align: center; padding: 2rem;">
            <h1>MENTspace</h1>
            <p>Master your craft. Get a Mentor, Today.</p>
          </header>
        </div>
      `
    }
  } else if (url.startsWith('/crackmode')) {
    return {
      title: 'CrackMode | Master LeetCode & Algorithms',
      description: 'Master coding interviews with comprehensive LeetCode solutions and algorithm tutorials',
      content: `
        <div id="root">
          <header style="text-align: center; padding: 2rem;">
            <h1>CrackMode</h1>
            <p>Master LeetCode & Algorithms</p>
            <p>Your ultimate platform for coding interviews.</p>
          </header>
        </div>
      `
    }
  } else {
    // Default fallback for other routes
    return {
      title: 'MENTspace | Get your Mentor',
      description: 'Master your craft. Get a Mentor, Today.',
      content: '<div id="root"></div>'
    }
  }
}

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
      const url = req.originalUrl.split("?")[0]
      console.log("url", url)
      let template, render
      if (!isProduction) {
        // Dev mode - read template and transform
        template = fs.readFileSync(path.resolve('index.html'), 'utf-8')
        template = await vite.transformIndexHtml(url, template)
        render = (await vite.ssrLoadModule('/src/seo/entry-server.tsx')).render
      } else {
        // Production mode - use built files
        template = fs.readFileSync(path.resolve('/usr/share/nginx/html/index.html'), 'utf-8')
        render = (await import(path.resolve(__dirname, '../dist/server/entry-server.js'))).render
      }

      // Check if this is a bot/crawler
      const userAgent = req.get('User-Agent') || ''
      const isBot = /bot|crawler|spider|crawling/i.test(userAgent) || /facebookexternalhit|twitterbot|linkedinbot|slackbot|telegrambot|whatsapp|discordbot/i.test(userAgent)

      if (true) {
        // SSR for everyone
        try {
          const { html, head } = await render(url)

          const finalHtml = template
            .replace(`<!--app-head-->`, head.title + head.meta + head.link + head.script)
            .replace(`<!--app-html-->`, html)

          res.status(200).set({ 'Content-Type': 'text/html' }).end(finalHtml)
        } catch (ssrError) {
          console.error('SSR Error:', ssrError)
          
          // Enhanced fallback with route-specific content
          const fallback = getFallbackContent(url)
          const fallbackHtml = template
            .replace(`<!--app-head-->`, 
              `<title>${fallback.title}</title>
               <meta name="description" content="${fallback.description}">`)
            .replace(`<!--app-html-->`, fallback.content)

          res.status(200).set({ 'Content-Type': 'text/html' }).end(fallbackHtml)
        }
      } else {
        // Client-side rendering for regular users
        const fallback = getFallbackContent(url)
        const clientHtml = template
          .replace(`<!--app-head-->`, `<title>${fallback.title}</title>`)
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