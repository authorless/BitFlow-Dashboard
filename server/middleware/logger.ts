export default defineEventHandler((event) => {
  if (event.path === '/api/health') return

  const start = Date.now()

  event.node.res.on('finish', () => {
    const duration = Date.now() - start
    const status = event.node.res.statusCode

    if (process.env.NODE_ENV !== 'production' || status >= 500 || duration >= 1000) {
      console.info(
        `${event.node.req.method} ${event.path} - ${status} - ${duration}ms`,
      )
    }
  })
})
