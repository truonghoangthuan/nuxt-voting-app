export default defineEventHandler(async (event) => {
  const pollId = getRouterParam(event, 'id');
  if (!pollId) {
    throw createError({ statusCode: 400, message: 'Poll ID is required' });
  }

  const body = await readBody(event);
  const { userId } = body;

  if (!userId) {
    throw createError({ statusCode: 400, message: 'User ID is required' });
  }

  const storage = usePollStorage();
  const success = await storage.closePoll(pollId, userId);

  if (!success) {
    throw createError({ statusCode: 403, message: 'Unauthorized or failed to close poll' });
  }

  return { success: true };
});
