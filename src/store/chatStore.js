import { create } from 'zustand';

const useChatStore = create((set) => ({
  connection: {
    isConnected: false,
    client: null,
  },
  messages: [],
  setConnection: (connectionData) =>
      set({ connection: connectionData }),
  setMessages: (newMessages) =>
      set({ messages: newMessages }),
  addMessage: (message) =>
      set((state) => ({ messages: [...state.messages, message] })),
  updateMessage: (messageId, updatedContent) =>
      set((state) => ({
        messages: state.messages.map(m =>
            m.id === messageId ? {...m, content: updatedContent} : m
        )
      })),
}));

export default useChatStore;