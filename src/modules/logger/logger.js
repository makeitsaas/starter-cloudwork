module.exports = function(prefix) {
    return function (label, ...args) {
        console.log.apply(null, [`>> ${prefix} :`].concat(label));
        if (args.length) {
            console.log(...args);
        }
    }
};