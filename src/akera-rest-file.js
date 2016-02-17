module.exports = AkeraRestFile;

var akeraApi = require('akera-api');
var p = akeraApi.call.parameter;
var akeraApp = null;

function AkeraRestFile(akeraWebApp) {
  var self = this;

  this.error = function(err, res) {
    if (err) {
      if (err instanceof Error) {
        err = err.message;
      }

      res.status(500).send({
          message : err
      });
      
      akeraApp.log('error', err);
    }
  };

  this.connect = function(broker, callback) {
    akeraApi.connect(broker).then(function(conn) {
      callback(null, conn);
    }, function(err) {
      callback(err);
    });
  };

  this.getPath = function(req) {
    var path = req.params[0] || '/';

    if (path.indexOf('/') === 0) {
      return path.substring(1);
    }

    return path;
  };

  this.getFile = function(conn, path, cb) {
    try {
      conn.call.procedure('io/akera/rest/fs/read').parameters(
          p.input(path, 'character'), p.output('longchar')).run().then(
          function(result) {
            var data = null;
            try {
              data = JSON.parse(result.parameters[0]);
            } catch (err) {
              data = result.parameters[0];
            }

            cb(null, data);
          }, function(err) {
            cb(err);
          });
    } catch (err) {
      cb(err);
    }
  };

  this.createFile = function(conn, file, cb) {
    try {
      conn.call.procedure('io/akera/rest/fs/create').parameters(
          p.input(file.path, 'character'), p.input(file.isDir, 'logical'),
          p.input(file.content, 'longchar')).run().then(function(result) {
        cb(null, result);
      }, function(err) {
        cb(err);
      });
    } catch (err) {
      cb(err);
    }
  };

  this.updateFile = function(conn, file, cb) {
    try {
      conn.call.procedure('io/akera/rest/fs/update').parameters(
          p.input(file.path, 'character'), p.input(file.content, 'longchar'))
          .run().then(function(result) {
            cb(null, result);
          }, function(err) {
            cb(err);
          });
    } catch (err) {
      cb(err);
    }
  };

  this.deleteFile = function(conn, path, cb) {
    try {
      conn.call.procedure('io/akera/rest/fs/delete').parameters(
          p.input(path, 'character')).run().then(function(result) {
        cb(null, result);
      }, function(err) {
        cb(err);
      });
    } catch (err) {
      cb(err);
    }
  };

  this.doGet = function(req, res) {
    self.connect(req.broker, function(err, conn) {
      if (err) {
        self.error(err, res);
      } else {
        self.getFile(conn, self.getPath(req), function(err, data) {
          conn.disconnect();
          if (err) {
            self.error(err, res);
          } else {
            res.status(200).send(data);
          }
        });
      }
    });
  };

  this.doPost = function(req, res) {
    self.connect(req.broker, function(err, conn) {
      if (err) {
        self.error(err, res);
      } else {
        self.updateFile(conn, {
          path : self.getPath(req),
          content : req.body.content
        }, function(err, data) {
          conn.disconnect();
          if (err) {
            self.error(err, res);
          } else {
            res.status(200).send(data);
          }
        });
      }
    });
  };

  this.doPut = function(req, res) {
    self.connect(req.broker, function(err, conn) {
      if (err) {
        self.error(err, res);
      } else {
        self.createFile(conn, {
          path : self.getPath(req),
          isDir : req.body.isDir || false
        }, function(err, data) {
          conn.disconnect();
          if (err) {
            self.error(err, res);
          } else {
            res.status(200).send(data);
          }
        });
      }
    });
  };
  
  this.doDelete = function(req, res) {
    self.connect(req.broker, function(err, conn) {
      if (err) {
        self.error(err, res);
      } else {
        self.deleteFile(conn, self.getPath(req), function(err, data) {
          conn.disconnect();
          if (err) {
            self.error(err, res);
          } else {
            res.status(200).send(data);
          }
        });
      }
    });
  };

  this.init = function(config, router) {

    if (!router || !router.__app || typeof router.__app.require !== 'function') {
      throw new Error('Invalid Akera web service router.');
    }

    config = config || {};
    akeraApp = router.__app;
    config.route = akeraApp.getRoute(config.route || '/rest/file/');

    var restRoute = config.route + '*';
    
    router.get(restRoute, self.doGet);
    router.post(restRoute, self.doPost);
    router.put(restRoute, self.doPut);
    router['delete'](restRoute, self.doDelete);
  };

  if (akeraWebApp !== undefined) {
    throw new Error(
        'Rest File service can only be mounted at the broker level.');
  }
}

AkeraRestFile.init = function(config, router) {
  var akeraRestFile = new AkeraRestFile();
  akeraRestFile.init(config, router);
};