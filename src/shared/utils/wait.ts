export const wait = async (milliseconds: number = 100): Promise<void> => {
    return new Promise(resolve => setTimeout(() => resolve(), milliseconds));
};

export default { wait };
