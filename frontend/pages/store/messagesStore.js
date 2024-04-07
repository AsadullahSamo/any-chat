import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export const useMessagesStore = create(
    persist(
        devtools((set) => ({
        messages: [],
        getMessage: () => {
            return set((state) => state.messages);
        },
        addMessage: (message) =>
            set((state) => ({ messages: [...state.messages, message] })),
        })),
        {
        name: "messages-storage",
        }
    )
);

