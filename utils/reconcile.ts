export interface ReconcileOption {
  id: string;
  text?: string;
  votes: number;
  voters: string[] | null;
  voterIds?: string[];
  addedBy?: string | null;
  addedByUserId?: string | null;
}

export interface PollActivity {
  id: string;
  type: 'vote' | 'change_vote' | 'unvote' | 'add_option';
  actorName: string;
  actorId?: string | null;
  optionTexts: string[];
  previousOptionTexts?: string[];
  createdAt: number;
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

export function buildVoteActivity(
  options: ReconcileOption[],
  uniqueOptionIds: string[],
  userId?: string,
  voterName?: string,
  now: number = Date.now()
): PollActivity | null {
  const previousOptions = userId ? options.filter((o) => o.voterIds?.includes(userId)) : [];
  const nextOptions = options.filter((o) => uniqueOptionIds.includes(o.id));

  const prevIds = previousOptions.map((o) => o.id).sort();
  const nextIds = [...uniqueOptionIds].sort();

  if (prevIds.length === nextIds.length && prevIds.every((id, idx) => id === nextIds[idx])) {
    return null;
  }

  const actorName = voterName || 'Guest';
  const actorId = userId || null;

  if (previousOptions.length === 0 && nextOptions.length > 0) {
    return {
      id: Math.random().toString(36).substring(2, 9),
      type: 'vote',
      actorName,
      actorId,
      optionTexts: nextOptions.map((o) => o.text || o.id),
      createdAt: now,
    };
  }

  if (previousOptions.length > 0 && nextOptions.length === 0) {
    return {
      id: Math.random().toString(36).substring(2, 9),
      type: 'unvote',
      actorName,
      actorId,
      optionTexts: previousOptions.map((o) => o.text || o.id),
      previousOptionTexts: previousOptions.map((o) => o.text || o.id),
      createdAt: now,
    };
  }

  return {
    id: Math.random().toString(36).substring(2, 9),
    type: 'change_vote',
    actorName,
    actorId,
    previousOptionTexts: previousOptions.map((o) => o.text || o.id),
    optionTexts: nextOptions.map((o) => o.text || o.id),
    createdAt: now,
  };
}
