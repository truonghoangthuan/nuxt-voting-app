export default defineEventHandler(async (event) => {
  const { userId } = getQuery(event);

  if (!userId || typeof userId !== 'string') {
    throw createError({
      statusCode: 400,
      message: 'User ID is required',
    });
  }

  const storage = usePollStorage();
  const polls = await storage.getJoinedPolls(userId);

  return polls;
});
