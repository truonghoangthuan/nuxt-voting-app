export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { question, options, maxVotes } = body;

  if (!question || !options || !Array.isArray(options) || options.length < 2) {
    throw createError({
      statusCode: 400,
      message: 'Invalid input',
    });
  }

  const storage = usePollStorage();
  const poll = await storage.create(question, options, maxVotes);

  return poll;
});
