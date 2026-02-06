import type { H3Event } from 'h3';
import { FieldValue } from 'firebase-admin/firestore';
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
}

// Store active SSE connections locally
const clients: Record<string, Set<H3Event>> = {};
// Store active Firestore listeners
const listeners: Record<string, () => void> = {};

export const usePollStorage = () => {
  const getAll = async (): Promise<Poll[]> => {
    const snapshot = await firestore.collection('polls').get();
    return snapshot.docs.map((doc: any) => doc.data() as Poll);
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
    };
    
    await firestore.collection('polls').doc(id).set(poll);
    return poll;
  };

  const vote = async (pollId: string, optionId: string, voterName?: string) => {
    const pollRef = firestore.collection('polls').doc(pollId);

    try {
      await firestore.runTransaction(async (t: any) => {
        const doc = await t.get(pollRef);
        if (!doc.exists) throw new Error('Poll not found');

        const poll = doc.data() as Poll;
        const optionIndex = poll.options.findIndex((o) => o.id === optionId);
        
        if (optionIndex === -1) throw new Error('Option not found');

        // Update in memory first to construct the update path or object
        // Since we are storing options as an array, we need to update the whole array or use a more complex field path.
        // For simplicity and to ensure consistency, we'll read, modify, and set (or update) the whole options array or specific object.
        // However, updating nested array items in Firestore is tricky without reading.
        // We already read it.
        
        poll.options[optionIndex].votes++;
        if (voterName) {
           if (!poll.options[optionIndex].voters) {
             poll.options[optionIndex].voters = [];
           }
           poll.options[optionIndex].voters.push(voterName);
        }

        t.update(pollRef, { options: poll.options });
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
       const unsubscribe = firestore.collection('polls').doc(pollId).onSnapshot((doc) => {
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
    get,
    create,
    vote,
    subscribe,
  };
};
