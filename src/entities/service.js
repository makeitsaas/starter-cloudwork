const DATABASE_STATUSES = {
    'none': 'none',
    'pending': 'pending',
    'ready': 'ready',
};
const DEPLOY_STATUSES = {
    'none': 'none',
    'pending': 'pending',
    'ready': 'ready',
};

function Service(options) {
    this.id = options.id;
    this.databaseStatus = options.databaseStatus || DATABASE_STATUSES.none;
    this.deployStatus = options.deployStatus || DEPLOY_STATUSES.none;
    this.repo_url = options.repo_url;
    this.path = options.path;
}


Service.prototype = {
    _isDeployed: function() {
        return this.deployStatus === DATABASE_STATUSES.ready;
    },
    _setDeployReady: function() {
        this.deployStatus = DATABASE_STATUSES.ready;
    },
    _isDatabaseReady: function() {
        return this.databaseStatus === DATABASE_STATUSES.ready;
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