import createCache from '@emotion/cache'

export function createEmotionCache() {
  return createCache({ 
    key: 'css',
    prepend: true, // Ensures styles are prepended to <head>
  })
}