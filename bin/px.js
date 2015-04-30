#!/usr/bin/env node
var inquirer   = require("inquirer");
var fsChecker  = require("./fs-check.js");
var dbChecker  = require("./db-check.js");
var dbImporter = require("./db-import.js");

var mongoStore = require("../lib/mongoDBStore");


/**
 * Global application (command line) used to  :
 * - Check proxies that are in a text file
 * - Import proxies from a text file into a db
 * - Check proxies that are in a db
 *
 */
if ( process.argv.length != 3 ) {
   console.log('Usage: px [fcheck|dimport|dcheck]\n');
   return;
}

switch (process.argv[2]) {

      case "fcheck":
          fsCheck();
          break;

      case "dimport" :
          dbImport();
          break;

      case "dcheck":
          dbCheck();
          break;

      default:
          console.log("Invalid command, use : px [fcheck|dimport|dcheck]");
          break;
}

function fsCheck() {

  inquirer.prompt([{"type": "input", "name" : "file", "message" : "file path", "default" : "./proxies.txt"}], function( answers ) {

    console.log("Checking proxies for the file : " + answers.file + " ...");
    var checker = new fsChecker.FsChecker(answers.file);
    checker.check();

  });
}

function dbImport() {

  inquirer.prompt(getImportDBQuestions(), function( answers ) {

        if (answers.dbtype == "mongodb") {
          var pm = new mongoStore.MongoDBProxyStore({"url" : answers.dbServer + "/" + answers.dbName, "collection" : answers.collectionName});
          var importer = new dbImporter.DbImport(answers.file, pm);
          importer.import();
        }
        else {
          console.log("This kind of db is not yet supported");
        }


  });

}

function dbCheck() {

  inquirer.prompt(getCheckDBQuestions(), function( answers ) {

        if (answers.dbtype == "mongodb") {
          var pm = new mongoStore.MongoDBProxyStore({"url" : answers.dbServer + "/" + answers.dbName, "collection" : answers.collectionName});
          var checker = new dbChecker.DbChecker(pm);
          checker.check();
        }
        else {
          console.log("This kind of db is not yet supported");
        }
  });
}


function getImportDBQuestions() {

  return [{"type": "input", "name" : "file", "message" : "file path", "default" : "./proxies.txt"},
          {"type": "list", "name" : "dbtype", "message" : "DB Type", "choices" : ["mongodb", "riak"]},
          {
           "type": "input", "name" : "dbServer", "message" : "db server", "default" : "mongodb://127.0.0.1:27017",
           "when" : function(answer){ return answer.dbtype=="mongodb"}
          },
          {
           "type": "input", "name" : "dbName", "message" : "db name", "default" : "seo",
           "when" : function(answer){ return answer.dbtype=="mongodb"}
          },
          {
           "type": "input", "name" : "collectionName", "message" : "collection name", "default" : "proxies",
           "when" : function(answer){ return answer.dbtype=="mongodb"}
          }]
}


function getCheckDBQuestions() {

  return [{"type": "list", "name" : "dbtype", "message" : "DB Type", "choices" : ["mongodb", "riak"]},
          {
           "type": "input", "name" : "dbServer", "message" : "db server", "default" : "mongodb://127.0.0.1:27017",
           "when" : function(answer){ return answer.dbtype=="mongodb"}
          },
          {
           "type": "input", "name" : "dbName", "message" : "db name", "default" : "seo",
           "when" : function(answer){ return answer.dbtype=="mongodb"}
          },
          {
           "type": "input", "name" : "collectionName", "message" : "collection name", "default" : "proxies",
           "when" : function(answer){ return answer.dbtype=="mongodb"}
          }]
}
