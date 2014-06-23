var merge = require('./merge')
  , load = require('./load')
  , path = require('path')
  , fs = require('fs')

module.exports = function(basePath, alwaysRequireEnv) {
  basePath = path.normalize(basePath);
  var domains = {};
  var env = process.env.NODE_ENV || 'development';
  var applicationName = process.env.APPLICATION_NAME || 'default';
  var files = fs.readdirSync(basePath)
  
  var get = function (domain, requireEnv) {
    var config;

    // default to global expectation unless specifically overridden.
    if (requireEnv !== false && alwaysRequireEnv === true) {
      requireEnv = true;
    }

    if (domains.hasOwnProperty(domain)) {
      return domains[domain];
    }

    if(applicationName!='default'){
        config = merge(
            load(path.join(basePath+'/default', domain + '.json'), domain, true)
            ,load(path.join(basePath+'/common'+'/'+env, domain + '.json'), domain, false)
            
        );

        config = merge(
            config
            ,load(path.join(basePath+ '/' + applicationName + '/' + env , domain + '.json'), domain, false)
        );

    }else{
        config = merge(
            load(path.join(basePath, domain + '.json'), domain, true),
            load(path.join(basePath, domain + '.' + env + '.json'), domain + "." + env, !!(requireEnv === true))
        );
    }
    domains[domain] = config;
    
    return config;
  }
  
  get.all = function () {
    files.forEach(function (file) {
      if(file.match(/^\./)) return;
      if(!file.match(/\.json$/i)) return;
      var domain = file.match(/^(.*?)\./i)[1];
      if(domains.hasOwnProperty(domain)) return;
            var d ="";
            if(applicationName!='default'){
                d = merge(
                    load(path.join(basePath+'/default', domain + '.json'), domain, true)
                    ,load(path.join(basePath+'/common'+'/'+env, domain + '.json'), domain, false)
                );
                domains[domain] = merge(
                    d
                    ,load(path.join(basePath+ '/' + applicationName + '/' + env , domain + '.json'), domain, false)
                );
            }else{
                domains[domain] = merge(
                  load(path.join(basePath, domain + '.json'), domain, true)
                , load(path.join(basePath, domain + '.' + env + '.json'), domain, false)
              );
            }
    
    });
    
    return domains;
  }
  
  get.clear = function () {
    domains = {};
    files = fs.readdirSync(basePath)
  }
  
  return get
};
