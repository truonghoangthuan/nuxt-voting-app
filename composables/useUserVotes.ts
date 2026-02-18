export const useUserVotes = () => {
  const VOTES_STORAGE_KEY = 'voted_polls';

  const getStoredVotes = (): Record<string, string[]> => {
    if (import.meta.server) return {};
    const stored = localStorage.getItem(VOTES_STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : {};

    // Migrate legacy data (string -> string[])
    Object.keys(parsed).forEach((key) => {
      if (typeof parsed[key] === 'string') {
        parsed[key] = [parsed[key]];
      }
    });

    return parsed;
  };

  const hasVoted = (pollId: string): boolean => {
    const votes = getStoredVotes();
    return !!votes[pollId] && votes[pollId].length > 0;
  };

  const getVoteCount = (pollId: string): number => {
    const votes = getStoredVotes();
    return votes[pollId]?.length || 0;
  };

  const hasVotedForOption = (pollId: string, optionId: string): boolean => {
    const votes = getStoredVotes();
    return votes[pollId]?.includes(optionId) || false;
  };

  const getVotedOptions = (pollId: string): string[] => {
    const votes = getStoredVotes();
    return votes[pollId] || [];
  };

  const markVoted = (pollId: string, optionId: string) => {
    if (import.meta.server) return;
    const votes = getStoredVotes();
    if (!votes[pollId]) {
      votes[pollId] = [];
    }
    if (!votes[pollId].includes(optionId)) {
      votes[pollId].push(optionId);
    }
    localStorage.setItem(VOTES_STORAGE_KEY, JSON.stringify(votes));
  };

  return {
    hasVoted,
    getVotedOptions, // Replaces getVotedOption
    markVoted,
    getVoteCount,
    hasVotedForOption,
  };
};
