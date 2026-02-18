import type { Poll } from '~/server/utils/storage';

export const useUserVotes = () => {
  const { user } = useAuth();

  const hasVoted = (poll: Poll): boolean => {
    if (!poll || !user.value?.uid) return false;

    // Check if user is in participants list
    return poll.participants?.includes(user.value.uid) || false;
  };

  const getVoteCount = (poll: Poll): number => {
    if (!poll || !user.value?.uid) return 0;

    let count = 0;
    poll.options.forEach((option) => {
      if (option.voterIds?.includes(user.value!.uid)) {
        count++;
      }
    });
    return count;
  };

  const hasVotedForOption = (poll: Poll, optionId: string): boolean => {
    if (!poll || !user.value?.uid) return false;

    const option = poll.options.find((o) => o.id === optionId);
    return option?.voterIds?.includes(user.value.uid) || false;
  };

  const getVotedOptions = (poll: Poll): string[] => {
    if (!poll || !user.value?.uid) return [];

    return poll.options.filter((option) => option.voterIds?.includes(user.value!.uid)).map((option) => option.id);
  };

  return {
    hasVoted,
    getVoteCount,
    hasVotedForOption,
    getVotedOptions,
  };
};
