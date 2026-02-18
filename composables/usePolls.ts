import type { Poll } from '~/server/utils/storage';

export const usePolls = () => {
  const createPoll = async (question: string, options: string[], maxVotes: number = 1) => {
    const { data } = await useFetch<Poll>('/api/polls', {
      method: 'POST',
      body: { question, options, maxVotes },
    });
    return data.value?.id;
  };

  const getPoll = async (id: string) => {
    const { data } = await useFetch<Poll>(`/api/polls/${id}`);
    return data;
  };

  const getJoinedPolls = async (userId: string) => {
    const { data } = await useFetch<Poll[]>('/api/polls/user/joined', {
      params: { userId },
    });
    return data;
  };

  const vote = async (pollId: string, optionId: string, voterName?: string | null, userId?: string) => {
    await useFetch(`/api/polls/${pollId}/vote`, {
      method: 'POST',
      body: { optionId, voterName, userId },
    });
  };

  const subscribe = (pollId: string, onUpdate: (poll: Poll) => void) => {
    if (import.meta.server) return;

    const eventSource = new EventSource(`/api/polls/${pollId}/sse`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onUpdate(data);
    };

    return () => {
      eventSource.close();
    };
  };

  return {
    createPoll,
    getPoll,
    getJoinedPolls,
    vote,
    subscribe,
  };
};
