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
  status: 'active' | 'closed';
  creatorId: string | null;
  deadline?: number | null;
  comments?: { id: string; text: string; author: string; createdAt: number }[];
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

  const create = async (question: string, options: string[], maxVotes: number = 1, creatorId: string | null = null, deadline: number | null = null) => {
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
      status: 'active',
      creatorId,
      deadline,
      comments: [],
    };

    await firestore.collection('polls').doc(id).set(poll);
    return poll;
  };

  const vote = async (pollId: string, optionIds: string[], voterName?: string, userId?: string) => {
    const pollRef = firestore.collection('polls').doc(pollId);

    try {
      await firestore.runTransaction(async (t: Transaction) => {
        const doc = await t.get(pollRef);
        if (!doc.exists) throw new Error('Poll not found');

        const poll = doc.data() as Poll;
        const maxVotes = poll.maxVotes || 1;

        // Create a deep copy of the options array to modify
        const updatedOptions: PollOption[] = [...poll.options];

        // Validate and update each selected option
        for (const optionId of optionIds) {
          const optionIndex = updatedOptions.findIndex((o) => o.id === optionId);
          if (optionIndex === -1) throw new Error(`Option ${optionId} not found`);

          const targetOption = updatedOptions[optionIndex];
          if (!targetOption) throw new Error('Option structure invalid');

          const updatedOption: PollOption = {
            ...targetOption,
            voters: targetOption.voters ? [...targetOption.voters] : [],
            voterIds: targetOption.voterIds ? [...targetOption.voterIds] : [],
          };

          // Check if user already voted for this SPECIFIC option
          if (userId && updatedOption.voterIds?.includes(userId)) {
            throw new Error('Already voted for this option');
          }

          updatedOption.votes += 1;

          if (voterName) {
            updatedOption.voters = updatedOption.voters ? [...updatedOption.voters, voterName] : [voterName];
          }

          if (userId) {
            updatedOption.voterIds!.push(userId);
          }

          updatedOptions[optionIndex] = updatedOption;
        }

        const updateData: any = { options: updatedOptions };

        // If userId is provided, add it to participants list and check maxVotes logic across ALL options
        if (userId) {
          let userTotalVotes = 0;

          updatedOptions.forEach((opt) => {
            if (opt.voterIds?.includes(userId)) {
              userTotalVotes++;
            }
          });

          if (userTotalVotes > maxVotes) {
            throw new Error(`Max votes (${maxVotes}) reached. You have ${userTotalVotes} votes.`);
          }

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

  const addOption = async (pollId: string, optionText: string) => {
    const pollRef = firestore.collection('polls').doc(pollId);
    
    try {
      await firestore.runTransaction(async (t: Transaction) => {
        const doc = await t.get(pollRef);
        if (!doc.exists) throw new Error('Poll not found');
        
        const poll = doc.data() as Poll;
        if (poll.status !== 'active') throw new Error('Poll is closed');
        
        const newOption: PollOption = {
          id: Math.random().toString(36).substring(2, 9),
          text: optionText,
          votes: 0,
          voters: [],
          voterIds: [],
        };
        
        const updatedOptions = [...poll.options, newOption];
        t.update(pollRef, { options: updatedOptions });
      });
      return true;
    } catch (e) {
      console.error('Failed to add option', e);
      return false;
    }
  };

  const closePoll = async (pollId: string, userId: string) => {
    const pollRef = firestore.collection('polls').doc(pollId);
    
    try {
      await firestore.runTransaction(async (t: Transaction) => {
        const doc = await t.get(pollRef);
        if (!doc.exists) throw new Error('Poll not found');
        
        const poll = doc.data() as Poll;
        if (poll.creatorId !== userId) throw new Error('Unauthorized');
        
        t.update(pollRef, { status: 'closed' });
      });
      return true;
    } catch (e) {
      console.error('Failed to close poll', e);
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
    addOption,
    closePoll,
  };
};
