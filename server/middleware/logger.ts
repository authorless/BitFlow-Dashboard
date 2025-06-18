export default defineEventHandler((event) => {
  const start = Date.now()
  
  event.node.res.on('finish', () => {
    const duration = Date.now() - start
    console.log(`${event.node.req.method} ${event.node.req.url} - ${duration}ms`)
  })
})
