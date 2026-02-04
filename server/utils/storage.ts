import type { H3Event } from 'h3';

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
}

// Global in-memory storage
const polls: Record<string, Poll> = {};
// Store active SSE connections
const clients: Record<string, Set<H3Event>> = {};

export const usePollStorage = () => {
  const getAll = () => Object.values(polls);

  const get = (id: string) => polls[id];

  const create = (question: string, options: string[]) => {
    const id = Math.random().toString(36).substring(2, 9);
    polls[id] = {
      id,
      question,
      options: options.map((text) => ({
        id: Math.random().toString(36).substring(2, 9),
        text,
        votes: 0,
      })),
    };
    return polls[id];
  };

  const vote = (pollId: string, optionId: string) => {
    const poll = polls[pollId];
    if (!poll) return false;

    const option = poll.options.find((o) => o.id === optionId);
    if (!option) return false;

    option.votes++;
    broadcast(pollId);
    return true;
  };

  // SSE Helpers
  const subscribe = (pollId: string, event: H3Event) => {
    if (!clients[pollId]) {
      clients[pollId] = new Set();
    }
    clients[pollId].add(event);

    // Clean up on close
    event.node.req.on('close', () => {
      clients[pollId]?.delete(event);
    });
  };

  const broadcast = (pollId: string) => {
    const poll = polls[pollId];
    if (!poll || !clients[pollId]) return;

    for (const client of clients[pollId]) {
      client.node.res.write(`data: ${JSON.stringify(poll)}\n\n`);
    }
  };

  return {
    getAll,
    get,
    create,
    vote,
    subscribe,
  };
};
