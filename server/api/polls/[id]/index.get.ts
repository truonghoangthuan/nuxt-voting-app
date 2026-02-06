export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  const storage = usePollStorage();
  const poll = await storage.get(id!);

  if (!poll) {
    throw createError({
      statusCode: 404,
      message: 'Poll not found',
    });
  }

  return poll;
});
