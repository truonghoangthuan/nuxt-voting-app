export default defineEventHandler(async (event) => {
  const pollId = getRouterParam(event, 'id');
  if (!pollId) {
    throw createError({ statusCode: 400, message: 'Poll ID is required' });
  }

  const body = await readBody(event);
  const { optionText } = body;

  if (!optionText || typeof optionText !== 'string' || optionText.trim().length === 0) {
    throw createError({ statusCode: 400, message: 'Valid option text is required' });
  }

  const storage = usePollStorage();
  const success = await storage.addOption(pollId, optionText.trim());

  if (!success) {
    throw createError({ statusCode: 500, message: 'Failed to add option. Poll may be closed or not found.' });
  }

  return { success: true };
});
