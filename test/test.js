var assert = require("assert"); 
var proxies = require("../app.js");
 

describe('Test proxies', function(){
  

  describe('#DefaultFileisEmpty', function(){
    it('should return an empty list of proxies for the default file', function(done){
     
     	proxies.loadDefaultProxies(function(error, proxies) {
     		//console.log("Test result : " + proxies.getProxies()); 
     	 	assert.equal(0, proxies.getNumberOfProxies());
     	 	
     	 	done(); 
     	 	
     	 });
    });
  });


  describe('#isInvalidFormat', function(){
    
    it('should return an empty list of proxies for the file & an invalid status : invalidformat.txt', function(done){
    	config = proxies.cloneConfig();
    	config.proxyFile = "./test/files/invalidformat.txt";
    	proxies.loadProxyFile(config, function(error, proxies) { 
      		assert(error);
      		done();
      	});
    });
  }); 
  
 
  describe('#FileNotExist', function(){
		
		  it('File should not exist : xxxxx.txt', function(done){
			    config = proxies.cloneConfig();
		    	config.proxyFile = "./test/files/invalidformat.txt";
		    	proxies.loadProxyFile(config, function(error, proxies) { 
		    		assert(error);
		      		done();
		      	});
		    });
  });
  
	
  describe('#isCorrectFormat', function(){
		
	  	var loadedProxies = null; 
	  	
	  	before(function(done){
	  		config = proxies.cloneConfig();
	  		config.proxyFile = "./test/files/goodformat.txt";
	    	config.removeInvalidProxies = false;
	  		proxies.loadProxyFile(config, function(error, result) {	
	  			loadedProxies = result; 
	  			done(); 
	  			
	  		});
	  	});	
		
	    it('should be a correct list of proxies', function(){
	    		assert.equal(5, loadedProxies.getNumberOfProxies());
		    	assert.equal(5, loadedProxies.getProxies().length);    
		    	
	     });
	    
	    it('Invalid domain host or port for the first proxy', function(){
	    	var firstProxy = loadedProxies.getProxy(); 
	    	assert.equal(false, firstProxy.valid);
	      
	    });
    
	    
		it('Invalid user or password or url for the second proxy', function(){
	   
	      var proxy = loadedProxies.getProxies()[1]; 
	      assert.equal(proxy.userName, "usertest");
	      assert.equal(proxy.password, "passwordtest");
	      assert.equal(proxy.getUrl(), "http://usertest:passwordtest@myproxydomaine.com:1235");
	    });
	    
    
  }); 
  
  
  
  describe('#DontPassCheckAndKeepInvalid', function(){
	  
	  var loadedProxies = null; 
	  	
	  before(function(done){
		    config = proxies.cloneConfig();
	    	config.proxyFile ="./test/files/goodformat.txt";
	  		config.removeInvalidProxies = false;
	  		proxies.loadProxyFile(config, function(error, result) {	
	  			loadedProxies = result; 
	  			done(); 
	  			
	  		});
	  });		  
	  
	  it('Should be all invalid', function(){
		  assert.equal(5, loadedProxies.getNumberOfProxies());
		  for(var i=0;i<loadedProxies.getProxies().length;i++) {
			  assert.equal(false, loadedProxies.getProxies()[i].valid);
		  }
		  
	  });
	  
	  
	  // Add more test - make a difference between a ping and a request error ? 
  });
  
  
  describe('#DontPassCheckAndRemoveInvalid', function(){
	  
	  it('should return an empty list of proxies', function(done){
		  
		  config = proxies.cloneConfig();
	      config.proxyFile = "./test/files/goodformat.txt";   
		  proxies.loadProxyFile(config, function(error, result){
	     		//console.log("Test result : " + proxies.getProxies()); 
	     	 	assert.equal(0, result.getNumberOfProxies());
	     	 	done(); 
	     	 	
	     	 });
	    });
	  
	  
  }); 
      
});

