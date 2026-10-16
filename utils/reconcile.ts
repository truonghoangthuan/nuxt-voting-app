export interface ReconcileOption {
  id: string;
  text?: string;
  votes: number;
  voters: string[] | null;
  voterIds?: string[];
}

export function reconcileVotes<T extends ReconcileOption>(
  options: T[],
  uniqueOptionIds: string[],
  userId?: string,
  voterName?: string
): T[] {
  return options.map((targetOption) => {
    const voters = targetOption.voters ? [...targetOption.voters] : [];
    const voterIds = targetOption.voterIds ? [...targetOption.voterIds] : [];
    const shouldBeVoted = uniqueOptionIds.includes(targetOption.id);

    if (userId) {
      const existingIndex = voterIds.indexOf(userId);
      const wasVoted = existingIndex !== -1;

      if (!wasVoted && shouldBeVoted) {
        voterIds.push(userId);
        if (voterName) voters.push(voterName);
        return {
          ...targetOption,
          votes: (targetOption.votes || 0) + 1,
          voters,
          voterIds,
        };
      }

      if (wasVoted && !shouldBeVoted) {
        voterIds.splice(existingIndex, 1);
        if (voterName) {
          const nameIdx = voters.indexOf(voterName);
          if (nameIdx !== -1) {
            voters.splice(nameIdx, 1);
          }
        }
        return {
          ...targetOption,
          votes: Math.max(0, (targetOption.votes || 0) - 1),
          voters,
          voterIds,
        };
      }

      return {
        ...targetOption,
        voters,
        voterIds,
      };
    }

    // Fallback when no userId is provided
    if (shouldBeVoted) {
      if (voterName) voters.push(voterName);
      return {
        ...targetOption,
        votes: (targetOption.votes || 0) + 1,
        voters,
        voterIds,
      };
    }

    return targetOption;
  });
}
