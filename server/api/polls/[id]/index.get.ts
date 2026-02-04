export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id');
  const storage = usePollStorage();
  const poll = storage.get(id!);

  if (!poll) {
    throw createError({
      statusCode: 404,
      message: 'Poll not found',
    });
  }

  return poll;
});
