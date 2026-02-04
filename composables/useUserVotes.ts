export const useUserVotes = () => {
  const VOTES_STORAGE_KEY = 'voted_polls';

  const getStoredVotes = (): Record<string, string> => {
    if (import.meta.server) return {};
    const stored = localStorage.getItem(VOTES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  };

  const hasVoted = (pollId: string): boolean => {
    const votes = getStoredVotes();
    return !!votes[pollId];
  };

  const getVotedOption = (pollId: string): string | null => {
    const votes = getStoredVotes();
    return votes[pollId] || null;
  };

  const markVoted = (pollId: string, optionId: string) => {
    if (import.meta.server) return;
    const votes = getStoredVotes();
    votes[pollId] = optionId;
    localStorage.setItem(VOTES_STORAGE_KEY, JSON.stringify(votes));
  };

  return {
    hasVoted,
    getVotedOption,
    markVoted,
  };
};
