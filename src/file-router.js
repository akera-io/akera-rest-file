var express = require('express');
var akeraApi = require('akera-api');
var p = akeraApi.call.parameter;

function getMiddleware(brokerName, akeraWebInstance) {
    var router = express.Router({
        mergeParams: true
    });

    router.get('/file*', function(req, res) {
        var path = getPath(req);
        brokerName = req.params.broker || brokerName;
        var broker = akeraWebInstance.getBroker(brokerName);
        connect(broker, function(conn, err) {
            if (err) {
                res.status(500).send(err);
                throw err;
            }
            getFile(conn, path, res);
        });
    });

    router.put('/file*', function(req, res) {
        console.log('ROUTER PUT');
        brokerName = req.params.broker || brokerName;
        var broker = akeraWebInstance.getBroker(brokerName);
        connect(broker, function(conn, err) {
            if (err) {
                akeraWebInstance.log('error', err.message);
                res.status(500).send(err);
                return;
            }
            try {
                createFile(conn, {
                    path: getPath(req),
                    isDir: req.body.isDir
                }, res);
            } catch (werr) {
                akeraWebInstance.log('error', werr.message);
                res.status(500).send(werr);
            }
        });
    });

    router.post('/file*', function(req, res) {
        brokerName = req.params.broker || brokerName;
        var broker = akeraWebInstance.getBroker(brokerName);
        connect(broker, function(conn, err) {
            if (err) {
                res.status(500).send(err);
                return;
            }
            updateFile(conn, {
                path: getPath(req),
                content: req.body.content
            }, res);
        });
    });

    router.delete('/file*', function(req, res) {
        brokerName = req.params.broker || brokerName;
        var broker = akeraWebInstance.getBroker(brokerName);
        var path = getPath(req);
        connect(broker, function(conn, err) {
            if (err) {
                res.status(500).send(err);
                return;
            }
            deleteFile(conn, path, res);
        });
    });

    return router;
}

function connect(broker, callback) {
    akeraApi.connect(broker).then(function(conn) {
        console.log('connected');
        callback(conn);
    }, function(err) {
        akeraWebInstance.log('error', err.message);
        callback(null, {
            message: 'Connection to akera rest service failed'
        });
    });
}

function getPath(req) {
    var path = req.params[0];
    path = path ? (path || '') : '';
    if (path.indexOf('/') === 0) {
        path = path.substring(1);
    }
    return path;
}

function getFile(conn, path, res) {
    try {
        conn.call.procedure('io/akera/rest/fs/read').parameters(
            p.input(path, 'character'), p.output('longchar')).run().then(
            function(result) {
                try {
                    console.log(JSON.parse(result.parameters[0]));
                    res.status(200).send(JSON.parse(result.parameters[0]));
                    conn.disconnect();
                } catch (err) {
                    res.status(200).send(result.parameters[0]);
                    conn.disconnect();
                }
            },
            function(err) {
                akeraWebInstance.log('error', err.message);
                res.status(500).json(err);
                conn.disconnect();
            });
    } catch (err) {
        akeraWebInstance.log('error', err.message);
        res.status(500).send(err);
    }
}

function createFile(conn, file, res) {
    try {
        conn.call.procedure('io/akera/rest/fs/create').parameters(
                p.input(file.path, 'character'), p.input(file.isDir, 'logical'), p.input(file.content, 'longchar'))
            .run().then(function(result) {
                console.log(result);
                res.status(200).send(result);
                conn.disconnect();
            }, function(err) {
                akeraWebInstance.log('error', err.message);
                res.status(500).send(err);
                conn.disconnect();
            });
    } catch (err) {
        akeraWebInstance.log('error', err.message);
        res.status(500).send(err);
    }
}

function updateFile(conn, file, res) {
    console.log('SAVE FILE', file);
    try {
        conn.call.procedure('io/akera/rest/fs/update').parameters(
                p.input(file.path, 'character'), p.input(file.content, 'longchar'))
            .run().then(function(result) {
                console.log(result);
                res.status(200).send(result);
                conn.disconnect();
            }, function(err) {
                akeraWebInstance.log('error', err.message);
                res.status(500).send(err);
                conn.disconnect();
            });
    } catch (err) {
        akeraWebInstance.log('error', err.message);
        res.status(500).send(err);
    }
}

function deleteFile(conn, path, res) {
    try {
        conn.call.procedure('io/akera/rest/fs/delete').parameters(
                p.input(path, 'character'))
            .run().then(function(result) {
                console.log(result);
                res.status(200).send(result);
                conn.disconnect();
            }, function(err) {
                akeraWebInstance.log('error', err.message);
                res.status(500).send(err);
                conn.disconnect();
            });
    } catch (err) {
        akeraWebInstance.log('error', err.message);
        res.status(500).send(err);
    }
}

module.exports = getMiddleware;
