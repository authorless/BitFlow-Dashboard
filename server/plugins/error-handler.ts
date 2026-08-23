import { defineNitroPlugin } from 'nitropack/runtime/plugin'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('error', (error) => {
    const statusCode = (error as { statusCode?: unknown }).statusCode

    if (typeof statusCode === 'number' && statusCode < 500) return

    const details: Record<string, unknown> = {
      message: error.message,
      statusCode: typeof statusCode === 'number' ? statusCode : 500,
    }

    if (process.env.NODE_ENV !== 'production') {
      details.stack = error.stack
    }

    console.error('Application error:', details)
  })
})
