import type { H3Event } from 'h3';
import { FieldValue } from 'firebase-admin/firestore';
import type { QueryDocumentSnapshot, Transaction } from 'firebase-admin/firestore';
import { firestore } from './firebase';

export interface PollOption {
  id: string;
  text: string;
  votes: number;
  voters: string[] | null;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  participants: string[]; // List of user IDs who have voted
  createdAt: number;
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

  const create = async (question: string, options: string[]) => {
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

        // If userId is provided, add it to participants list
        if (userId) {
          // We use arrayUnion to avoid duplicates safely, but inside transaction we need to be careful.
          // Since we are reading the doc, we can just check deeply.
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
