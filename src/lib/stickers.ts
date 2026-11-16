export const PISHI_STICKERS = Array.from(
    { length: 24 },
    (_, index) => {
        const number = index + 1;

        return {
            code: `:cat${number}:`,
            src: `/stickers/pishi/cat${number}.png`,
        };
    }
);