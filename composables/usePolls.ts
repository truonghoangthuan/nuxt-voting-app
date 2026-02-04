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

export const usePolls = () => {
  const polls = useState<Poll[]>('polls', () => []);

  const createPoll = (question: string, options: string[]) => {
    const newPoll: Poll = {
      id: Math.random().toString(36).substring(2, 9),
      question,
      options: options.map((opt) => ({
        id: Math.random().toString(36).substring(2, 9),
        text: opt,
        votes: 0,
      })),
    };
    polls.value.push(newPoll);
    return newPoll.id;
  };

  const getPoll = (id: string) => {
    return polls.value.find((p: Poll) => p.id === id);
  };

  const vote = (pollId: string, optionId: string) => {
    const poll = polls.value.find((p: Poll) => p.id === pollId);
    if (poll) {
      const option = poll.options.find((o: PollOption) => o.id === optionId);
      if (option) {
        option.votes++;
      }
    }
  };

  return {
    polls,
    createPoll,
    getPoll,
    vote,
  };
};
