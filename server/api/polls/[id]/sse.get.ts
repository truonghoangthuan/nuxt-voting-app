export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  const storage = usePollStorage();

  // Headers for SSE
  setHeader(event, 'Content-Type', 'text/event-stream');
  setHeader(event, 'Cache-Control', 'no-cache');
  setHeader(event, 'Connection', 'keep-alive');

  // Send initial state
  const poll = await storage.get(id!);
  if (poll) {
    event.node.res.write(`data: ${JSON.stringify(poll)}\n\n`);
  }

  // Subscribe to updates
  await storage.subscribe(id!, event);

  // Keep connection alive
  const keepAlive = setInterval(() => {
    event.node.res.write(': keep-alive\n\n');
  }, 30000);

  event.node.req.on('close', () => {
    clearInterval(keepAlive);
  });

  // Return stream promise to prevent handler from finishing
  return new Promise(() => {});
});
