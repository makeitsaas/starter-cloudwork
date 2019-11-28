export default {
    date: (stringDate: string) => {
        try {
            return new Date(stringDate);
            /*
            Finally, it is better to return the date, even if it is invalid.
            That will be checked anyway in automatic processes and it is better for debugging purposes to bring this everywhere
            if(!isNaN(parsed.getTime())) {
              return parsed;
            } else {
              return null;
            }
            */
        } catch (e) {
            return null;
        }
    },
    json: (stringified: string) => {
        try {
            return JSON.parse(stringified);
        } catch (e) {
            return null;
        }
    }
};
