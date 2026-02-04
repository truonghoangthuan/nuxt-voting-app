export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  const body = await readBody(event);
  const { optionId } = body;

  const storage = usePollStorage();
  const success = storage.vote(id!, optionId);

  if (!success) {
    throw createError({
      statusCode: 400,
      message: 'Vote failed',
    });
  }

  return { success: true };
});
