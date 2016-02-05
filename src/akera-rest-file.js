module.exports = AkeraFile;

var file_router = require('./file-router.js');

function AkeraFile() {
    
}

AkeraFile.prototype.init = function(config, router) {
   file_router(config, router);
};
