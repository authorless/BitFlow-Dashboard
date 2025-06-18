import { defineNitroPlugin } from 'nitropack/runtime/plugin'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('error', (error) => {
    console.error('Application error:', {
      message: error.message,
      stack: error.stack,
      data: (error as any)?.data
    })
  })
})
