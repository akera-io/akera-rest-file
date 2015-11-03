module.exports = AkeraFile;

var file_router = require('./file-router.js');

function AkeraFile(akeraWebInstance) {
    if (akeraWebInstance && akeraWebInstance.app) {
        this.akeraWebInstance = akeraWebInstance;
    } else {
        throw new Error('Invalid akera web application instance');
    }
}

AkeraFile.prototype.init = function(brokerName, route) {
    var app = this.akeraWebInstance.app;

    route = (route === '/' ? '/rest' : route) || this.akeraWebInstance.akeraServices.restRoute || '/rest';

    app.use(route + (brokerName ? '/' + brokerName : '/:broker'), new file_router(brokerName || null, this.akeraWebInstance));
    this.log('info', 'Akera file service enabled for all brokers.');
};

AkeraFile.prototype.log = function(level, message) {
    try {
        this.akeraWebInstance.log(level, message);
    } catch (err) {}
};
