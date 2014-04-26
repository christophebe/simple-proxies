/*
 *  Component used to store proxies in a MongoDB Store
 *  dbconfig is a json structuee= {
 *         "url" : "[MongoDB url]",
 *          "collection" : "[name of the collaction used to store the proxies]"
 *  }
 *
 */


var MongoClient = require('mongodb').MongoClient;
var log = require('./lib/logging').Logger;

function MongoDBProxyStore (dbconfig) {
    this.dbconfig = dbconfig;
    this.db = null;
};


MongoDBProxyStore.prototype.connect = function(callback) {
  //'mongodb://127.0.0.1:27017/' + DB_NAME
  var self = this;
  MongoClient.connect(this.dbconfig.url, function(error, mongoDB) {
      if(!error) {
        log.info("Correctly connected to the DB");

        if (! mongoDB) {
          error = new Error("mongoDb client is null");
        }
        self.db = mongoDB;
        //this.db.createCollection(this.dbconfig.collection, function(err, collection) {});
      }
      else {
        log.error("Impossible to connect to the DB : " + error);
      }
      callback(error);
  });
}


MongoDBProxyStore.prototype.insert= function(proxies) {
  var collection = this.db.collection(this.dbconfig.collection);
  collection.insert(proxies, {w:0});

}

MongoDBProxyStore.prototype.delete = function(proxy) {
  var collection = this.db.collection(this.dbconfig.collection);
  collection.remove({host:proxy.host, port:proxy.port}, {w:0});

}

MongoDBProxyStore.prototype.deleteAll = function() {
  var collection = this.db.collection(this.dbconfig.collection);
  collection.remove({}, {w:0});

}

MongoDBProxyStore.prototype.findAll = function(callback) {
  var collection = this.db.collection(this.dbconfig.collection);
  collection.find().toArray(function (error, proxies) {
    callback(error, proxies);
  });

}

MongoDBProxyStore.prototype.findValids = function() {
  var collection = this.db.collection(this.dbconfig.collection);
  collection.find({valid:true}).toArray(function (error, proxies) {
    callback(error, proxies);
  });
}


MongoDBProxyStore.prototype.getDb = function() {
  return this.db;
}

MongoDBProxyStore.prototype.getCollection = function() {
  return this.db.collection(this.dbconfig.collection);
}



module.exports.MongoDBProxyStore = MongoDBProxyStore;
