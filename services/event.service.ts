
import { EventSession } from '../types';

let MOCK_EVENTS: EventSession[] = [
  { 
    id: '1', 
    title: 'Nouvelles règles Entrée Express 2024', 
    type: 'Webinaire', 
    date: '25 Mars, 14:00', 
    isPaid: false, 
    status: 'Publié',
    meetingLink: 'https://zoom.us/j/123456789'
  },
  { 
    id: '2', 
    title: 'Session de formation CRIC : Éthique', 
    type: 'Formation', 
    date: '12 Avril, 09:00', 
    isPaid: true, 
    price: 45,
    status: 'Publié',
    meetingLink: 'https://zoom.us/j/987654321'
  },
  { 
    id: '3', 
    title: 'Comment s\'installer au Nouveau-Brunswick', 
    type: 'Session Info', 
    date: 'En direct', 
    isPaid: false, 
    status: 'En direct',
    meetingLink: 'https://zoom.us/j/456123789'
  },
  { 
    id: '4', 
    title: 'Le permis d\'études étape par étape', 
    type: 'Webinaire', 
    date: 'Archives', 
    isPaid: false, 
    status: 'Replay',
    bannerUrl: 'https://images.unsplash.com/photo-1523050853064-db0ef917f30d?auto=format&fit=crop&q=80&w=400'
  },
];

const REGISTERED_EVENTS = new Set<string>();

export const eventService = {
  getEvents: (): EventSession[] => {
    return MOCK_EVENTS;
  },
  
  createEvent: async (event: Omit<EventSession, 'id'>): Promise<EventSession> => {
    const newEvent = {
      ...event,
      id: Math.random().toString(36).substr(2, 9),
      meetingLink: event.meetingLink || 'https://zoom.us/j/default'
    };
    MOCK_EVENTS = [newEvent, ...MOCK_EVENTS];
    await new Promise(resolve => setTimeout(resolve, 1000));
    return newEvent;
  },

  registerForEvent: async (eventId: string): Promise<boolean> => {
    console.log(`Inscription à l'événement ${eventId}`);
    await new Promise(resolve => setTimeout(resolve, 800));
    REGISTERED_EVENTS.add(eventId);
    return true;
  },

  isRegistered: (eventId: string): boolean => {
    return REGISTERED_EVENTS.has(eventId);
  },

  getRegisteredEventIds: (): string[] => {
    return Array.from(REGISTERED_EVENTS);
  }
};
