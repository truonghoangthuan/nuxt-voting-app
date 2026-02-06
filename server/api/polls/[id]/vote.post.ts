export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  const body = await readBody(event);
  const { optionId, voterName } = body;

  const storage = usePollStorage();
  const success = await storage.vote(id!, optionId, voterName);

  if (!success) {
    throw createError({
      statusCode: 400,
      message: 'Vote failed',
    });
  }

  return { success: true };
});
