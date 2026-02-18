import type { H3Event } from 'h3';
import { FieldValue } from 'firebase-admin/firestore';
import type { QueryDocumentSnapshot, Transaction } from 'firebase-admin/firestore';
import { firestore } from './firebase';

export interface PollOption {
  id: string;
  text: string;
  votes: number;
  voters: string[] | null;
  voterIds?: string[]; // IDs of users who voted for this option
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  participants: string[]; // List of user IDs who have voted
  createdAt: number;
  maxVotes?: number;
}

// Store active SSE connections locally
const clients: Record<string, Set<H3Event>> = {};
// Store active Firestore listeners
const listeners: Record<string, () => void> = {};

export const usePollStorage = () => {
  const getAll = async (): Promise<Poll[]> => {
    const snapshot = await firestore.collection('polls').get();
    return snapshot.docs.map((doc: QueryDocumentSnapshot) => doc.data() as Poll);
  };

  const getJoinedPolls = async (userId: string): Promise<Poll[]> => {
    // Firestore query specifically for array-contains
    const snapshot = await firestore.collection('polls').where('participants', 'array-contains', userId).get();

    return snapshot.docs.map((doc: QueryDocumentSnapshot) => doc.data() as Poll);
  };

  const get = async (id: string): Promise<Poll | null> => {
    const doc = await firestore.collection('polls').doc(id).get();
    return doc.exists ? (doc.data() as Poll) : null;
  };

  const create = async (question: string, options: string[], maxVotes: number = 1) => {
    const id = Math.random().toString(36).substring(2, 9);
    const poll: Poll = {
      id,
      question,
      options: options.map((text) => ({
        id: Math.random().toString(36).substring(2, 9),
        text,
        votes: 0,
        voters: [],
      })),
      participants: [],
      createdAt: Date.now(),
      maxVotes,
    };

    await firestore.collection('polls').doc(id).set(poll);
    return poll;
  };

  const vote = async (pollId: string, optionId: string, voterName?: string, userId?: string) => {
    const pollRef = firestore.collection('polls').doc(pollId);

    try {
      await firestore.runTransaction(async (t: Transaction) => {
        const doc = await t.get(pollRef);
        if (!doc.exists) throw new Error('Poll not found');

        const poll = doc.data() as Poll;
        const optionIndex = poll.options.findIndex((o) => o.id === optionId);

        if (optionIndex === -1) throw new Error('Option not found');

        // Create a deep copy of the options array to modify
        const updatedOptions: PollOption[] = [...poll.options];
        const targetOption = updatedOptions[optionIndex];

        if (!targetOption) throw new Error('Option structure invalid');

        const updatedOption: PollOption = {
          ...targetOption,
          voters: targetOption.voters ? [...targetOption.voters] : [],
        };

        updatedOption.votes += 1;

        if (voterName) {
          updatedOption.voters = updatedOption.voters ? [...updatedOption.voters, voterName] : [voterName];
        }

        updatedOptions[optionIndex] = updatedOption;

        const updateData: any = { options: updatedOptions };

        // If userId is provided, add it to participants list and check maxVotes
        if (userId) {
          // Check max votes
          const maxVotes = poll.maxVotes || 1;
          let userTotalVotes = 0;

          updatedOptions.forEach((opt) => {
            if (opt.voterIds && opt.voterIds.includes(userId)) {
              // Count how many times this user appears in voterIds
              // Since array-contains checks for existence, we might need a better way if we allow multiple votes on SAME option?
              // Implementation plan says "users can cast votes for multiple options".
              // Usually one vote per option is standard, but maxVotes allows voting for X different options.
              // Or X votes total? Let's assume X votes total, allowing multiple on same option?
              // The UI usually toggles. Let's assume 1 vote per option, but max N options.
              // IF we want to allow multiple votes on same option, we need array that stores duplicates or counts.
              // For simplicity and typical UI (toggle), let's say "Select up to N options".
              // So one vote per option.
              // Wait, if I use `voterIds.includes(userId)`, I'm counting options voted for.
              // BUT, `voterIds` needs to be initialized.
            }
            // Count occurrences if we store duplicates, or just count options if set.
            // Let's count options the user has voted for.
            if (opt.voterIds?.includes(userId)) {
              userTotalVotes++;
            }
          });

          if (userTotalVotes >= maxVotes) {
            // Check if user is UNVOTING (toggling off) - handled by UI?
            // The vote function currently only ADDS vote (increments).
            // It doesn't handle unvoting.
            // If the user already voted for THIS option, and they click again, the UI might calculate valid state.
            // But here we are VALIDATING a NEW vote.
            // If user already voted for this option, we shouldn't be here if it's a simple increment?
            // The current implementation is simple increment.

            // If we want to support unvoting, we need a toggle logic.
            // For now, let's stick to "adding a vote".
            // If user already voted for THIS option, return false or error?

            if (updatedOptions[optionIndex].voterIds?.includes(userId)) {
              // Already voted for this option. Do nothing or throw?
              // If we want to allow un-voting, we need a separate `removeVote` or `toggleVote`.
              // Existing code just does `updatedOption.votes += 1`.
              // Let's assume for now we only ADD votes.
              throw new Error('Already voted for this option');
            }

            if (userTotalVotes >= maxVotes) {
              throw new Error(`Max votes (${maxVotes}) reached`);
            }
          }

          // Add userId to option's voterIds
          updatedOption.voterIds = updatedOption.voterIds ? [...updatedOption.voterIds, userId] : [userId];

          const currentParticipants = poll.participants || [];
          if (!currentParticipants.includes(userId)) {
            updateData.participants = FieldValue.arrayUnion(userId);
          }
        }

        t.update(pollRef, updateData);
      });
      return true;
    } catch (e) {
      console.error('Vote failed', e);
      return false;
    }
  };

  // SSE Helpers
  const subscribe = async (pollId: string, event: H3Event) => {
    if (!clients[pollId]) {
      clients[pollId] = new Set();
    }
    clients[pollId].add(event);

    // If this is the first client, start listening to Firestore
    if (!listeners[pollId]) {
      const unsubscribe = firestore
        .collection('polls')
        .doc(pollId)
        .onSnapshot((doc) => {
          if (doc.exists) {
            const poll = doc.data() as Poll;
            broadcast(pollId, poll);
          }
        });
      listeners[pollId] = unsubscribe;
    }

    // Clean up on close
    event.node.req.on('close', () => {
      const clientSet = clients[pollId];
      if (clientSet) {
        clientSet.delete(event);
        if (clientSet.size === 0) {
          // No more clients, stop listening to Firestore
          const unsubscribe = listeners[pollId];
          if (unsubscribe) {
            unsubscribe();
            delete listeners[pollId];
          }
          delete clients[pollId];
        }
      }
    });
  };

  const broadcast = (pollId: string, poll: Poll) => {
    if (!clients[pollId]) return;

    for (const client of clients[pollId]) {
      client.node.res.write(`data: ${JSON.stringify(poll)}\n\n`);
    }
  };

  return {
    getAll,
    getJoinedPolls,
    get,
    create,
    vote,
    subscribe,
  };
};
