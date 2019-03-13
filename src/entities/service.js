
const DATABASE_STATUSES = {
    'none': 'none',
    'pending': 'pending',
    'ready': 'ready',
};

function Service(options) {
    this.id = options.id;
    this.databaseStatus = options.databaseStatus || DATABASE_STATUSES.none;
    this.repo_url = options.repo_url;
    this.path = options.path;
}


Service.prototype = {
    _isDatabaseReady: function() {
        return this.databaseStatus !== DATABASE_STATUSES.none;
    },
    _setDatabaseNone: function() {
        this.databaseStatus = DATABASE_STATUSES.none;
    },
    _setDatabasePending: function() {
        this.databaseStatus = DATABASE_STATUSES.pending;
    },
    _setDatabaseReady: function() {
        this.databaseStatus = DATABASE_STATUSES.ready;
    }
};

module.exports = {
    Service,
    DATABASE_STATUSES
};