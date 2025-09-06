import express from 'express'
// Remove vite import - only import conditionally
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isProduction = process.env.NODE_ENV === 'production'
const PORT = process.env.PORT || 8080

console.log('Starting server from:', __dirname)
console.log('Production mode:', isProduction)

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
    // Only import vite in development
    const { createServer: createViteServer } = await import('vite')
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom'
    })
    app.use(vite.middlewares)
  } else {
    // Serve static files in production - nginx handles this anyway
    console.log('Production mode: nginx will serve static files')
  }

  // Handle all routes
  app.use(/(.*)/, async (req, res) => {
    try {
      const url = req.originalUrl.split("?")[0]
      console.log("SSR request for:", url)
      
      let template, render
      
      if (!isProduction) {
        // Dev mode
        template = fs.readFileSync(path.resolve('index.html'), 'utf-8')
        template = await vite.transformIndexHtml(url, template)
        render = (await vite.ssrLoadModule('/src/seo/entry-server.tsx')).render
      } else {
        // Production mode
        console.log('Loading production template and server...')
        
        // Template from nginx html directory
        template = fs.readFileSync('/usr/share/nginx/html/index.html', 'utf-8')
        
        // Server entry - use the fixed relative path
        const serverPath = path.resolve(__dirname, '../dist/server/entry-server.js')
        console.log('Loading server from:', serverPath)
        
        if (!fs.existsSync(serverPath)) {
          throw new Error(`Server entry not found at: ${serverPath}`)
        }
        
        render = (await import(serverPath)).render
      }

      // Check if this is a bot/crawler
      const userAgent = req.get('User-Agent') || ''
      const isBot = /bot|crawler|spider|crawling/i.test(userAgent) || 
                    /facebookexternalhit|twitterbot|linkedinbot|slackbot|telegrambot|whatsapp|discordbot/i.test(userAgent)

      // Always do SSR in this setup since nginx routes bots to us
      try {
        console.log('Attempting SSR...')
        const { html, head } = await render(url)

        const finalHtml = template
          .replace(`<!--app-head-->`, head.title + head.meta + head.link + head.script)
          .replace(`<!--app-html-->`, html)

        res.status(200).set({ 'Content-Type': 'text/html' }).end(finalHtml)
        console.log('SSR successful for:', url)
      } catch (ssrError) {
        console.error('SSR Error:', ssrError)
        
        // Fallback with route-specific content
        const fallback = getFallbackContent(url)
        const fallbackHtml = template
          .replace(`<!--app-head-->`, 
            `<title>${fallback.title}</title>
             <meta name="description" content="${fallback.description}">`)
          .replace(`<!--app-html-->`, fallback.content)

        res.status(200).set({ 'Content-Type': 'text/html' }).end(fallbackHtml)
        console.log('Served fallback for:', url)
      }

    } catch (e) {
      console.error('Route handler error:', e)
      
      // Ultimate fallback
      const fallback = getFallbackContent(req.originalUrl.split("?")[0])
      const errorHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${fallback.title}</title>
          <meta name="description" content="${fallback.description}">
        </head>
        <body>
          ${fallback.content}
          <script>console.error('Server error:', ${JSON.stringify(e.message)})</script>
        </body>
        </html>
      `
      
      res.status(500).set({ 'Content-Type': 'text/html' }).end(errorHtml)
    }
  })

  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`)
  })
}

createServer().catch(console.error)