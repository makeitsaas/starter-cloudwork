// DEPRECATED : use @utils/wait instead

export const FakeDelay = {
    wait: async (delay: number = 100): Promise<void> => {
        return new Promise(resolve => setTimeout(() => resolve(), delay));
    }
};
