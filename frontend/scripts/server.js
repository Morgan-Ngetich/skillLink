import express from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isProduction = process.env.RAILWAY_ENVIRONMENT === 'production'
const PORT = process.env.PORT || 8080

console.log('Starting server from:', __dirname)
console.log('Production mode:', isProduction)

// Fallback content generator
function getFallbackContent(url) {
  return {
    title: 'MENTspace | Get your Mentor',
    description: 'Master your craft. Get a Mentor, Today.',
    content: '<div id="root"></div>',
    head: `<title>MENTspace | Get your Mentor</title>
    <meta name="description" content="Master your craft. Get a Mentor, Today." />`
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
    // Serve static files in production
    console.log('Production mode: serving static files from dist/client')
    app.use(express.static(path.resolve(__dirname, '../dist/client')))
  }

  // ✅ Handle all routes EXCEPT static assets
  app.use('*', async (req, res, next) => {
    const url = req.originalUrl
    
    console.log('📥 Incoming request:', url);
    
    // Skip SSR for static assets and Vite's special paths
    if (
      url.startsWith('/@') ||           // Vite internal routes
      url.startsWith('/node_modules') || // Vite deps
      url.startsWith('/src/') ||        // Source files in dev
      url.startsWith('/api/') ||        // Your API routes
      url.match(/\.(js|ts|tsx|jsx|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)(\?.*)?$/) || // Static files
      url.includes('__vite') ||         // Vite HMR
      url.includes('.well-known')       // Browser special paths
    ) {
      console.log('⏭️  Skipping SSR for:', url);
      return next()
    }

    console.log('🎯 Processing SSR for:', url);

    try {
      const cleanUrl = url.split("?")[0]

      let template, render

      if (!isProduction) {
        // Dev mode
        template = fs.readFileSync(path.resolve('index.html'), 'utf-8')
        template = await vite.transformIndexHtml(url, template)
        render = (await vite.ssrLoadModule('/src/seo/entry-server.tsx')).render
      } else {
        // Production mode
        console.log('Loading production template and server...')

        // Template from dist/client
        const templatePath = path.resolve(__dirname, '../dist/client/index.html')
        console.log('📄 Loading production template from:', templatePath)
        template = fs.readFileSync(templatePath, 'utf-8')

        // Server entry
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

      console.log('User-Agent:', userAgent)
      console.log('Is Bot:', isBot)

      try {
        console.log('Attempting SSR...')

        // Get the full URL for context
        const protocol = req.get('x-forwarded-proto') || req.protocol || 'http'
        const host = req.get('host') || 'localhost:8080'
        const fullUrl = `${protocol}://${host}${req.originalUrl}`

        console.log('Full URL:', fullUrl)

        // Pass cookies and full URL context to SSR render
        const cookies = req.headers.cookie || ""
        const { html, head } = await render({
          url: cleanUrl,
          cookies,
          host,
          protocol,
          fullUrl
        })

        // DEBUG: Check what the server is generating
        console.log('=== SSR DEBUG ===')
        console.log('URL:', cleanUrl)
        console.log('Head length:', head.length)
        console.log('Head content (first 500 chars):', head.substring(0, 500))
        console.log('Contains "og:":', head.includes('og:'))
        console.log('Contains "og:title":', head.includes('og:title'))
        console.log('Contains "twitter:":', head.includes('twitter:'))
        console.log('=== END DEBUG ===')

        // If no head content was generated, use fallback
        const finalHead = head && head.trim() ? head : getFallbackContent(cleanUrl).head

        const finalHtml = template
          .replace(`<!--app-head-->`, finalHead)
          .replace(`<!--app-html-->`, html);

        res.status(200).set({ 'Content-Type': 'text/html' }).end(finalHtml)
        console.log('✅ SSR successful for:', cleanUrl)
      } catch (ssrError) {
        console.error('SSR Error:', ssrError)
        console.error('Stack:', ssrError.stack)

        // Fallback with route-specific content
        const fallback = getFallbackContent(cleanUrl)
        const fallbackHtml = template
          .replace(`<!--app-head-->`, fallback.head)
          .replace(`<!--app-html-->`, fallback.content)

        res.status(200).set({ 'Content-Type': 'text/html' }).end(fallbackHtml)
        console.log('Served fallback for:', cleanUrl)
      }

    } catch (e) {
      console.error('Route handler error:', e)
      console.error('Stack:', e.stack)

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