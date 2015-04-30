/*
 *  Component used to store proxies in a MongoDB Store
 *
 */

var MongoClient = require('mongodb').MongoClient;
var log = require('./logging').Logger;
var _ = require("underscore");

/**
 *  Init the MongoDBProxyStore component
 *  There are 2 different ways to init this component
 *  1. With only one arg : dbconfig which is a json structure =
 *       {
 *         "url" : "[MongoDB url]",
 *          "collection" : "[name of the collection used to store the proxies]"
 *       }
 *     This requires to call the method connect() later
 *  2. With 2 args :
 *     - a MongoClient object that is already connected
 *     - the collection name used to store the proxies
 */
function MongoDBProxyStore (dbconfig, collection) {
    if (_.has(dbconfig, "url")) {
        this.url = dbconfig.url;
        this.collection = dbconfig.collection;
    }
    else{
      //Suppose to be an already connected MongoClient object
      this.db = dbconfig;
      if (collection) {
        this.collection = collection;

      }
      else {
          log.error("Collection name is not defined for the MongoDBProxyStore");
      }
    }

};

MongoDBProxyStore.prototype.connect = function(callback) {

  var self = this;
  MongoClient.connect(this.url, function(error, mongoDB) {
      if(!error) {
        log.info("Correctly connected to the DB");

        if (! mongoDB) {
          error = new Error("mongoDb client is null");
        }
        self.db = mongoDB;
      }
      else {
        log.error("Impossible to connect to the DB : " + error);
      }
      callback(error);
  });
}

MongoDBProxyStore.prototype.close = function () {

  if (this.db) {
    this.db.close();
  }

}


MongoDBProxyStore.prototype.insert= function(proxies) {
  var collection = this.db.collection(this.collection);
  collection.insert(proxies, {w:0});

}

MongoDBProxyStore.prototype.delete = function(proxy) {
  var collection = this.db.collection(this.collection);
  collection.remove({host:proxy.host, port:proxy.port}, {w:0});

}

MongoDBProxyStore.prototype.deleteAll = function() {
  var collection = this.db.collection(this.collection);
  collection.remove({}, {w:0});

}

MongoDBProxyStore.prototype.findAll = function(callback) {

  var collection = this.db.collection(this.collection);
  collection.find().toArray(function (error, proxies) {
    callback(error, proxies);
  });

}

MongoDBProxyStore.prototype.findValids = function(callback) {
  var collection = this.db.collection(this.collection);
  collection.find({valid:true}).toArray(function (error, proxies) {
    callback(error, proxies);
  });
}


MongoDBProxyStore.prototype.getDb = function() {
  return this.db;
}

MongoDBProxyStore.prototype.getCollection = function() {
  return this.db.collection(this.collection);
}



module.exports.MongoDBProxyStore = MongoDBProxyStore;
