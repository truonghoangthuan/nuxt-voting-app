export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { question, options, maxVotes, creatorId, deadline } = body;

  if (!question || !options || !Array.isArray(options) || options.length < 2) {
    throw createError({
      statusCode: 400,
      message: 'Invalid input',
    });
  }

  const storage = usePollStorage();
  const poll = await storage.create(question, options, maxVotes, creatorId || null, deadline || null);

  return poll;
});
