'use strict'

/**
* @fileoverview Static method to read two possible config files:
*     1. /nshmp-haz-ws/apps/js/lib/config.json
*     2. /nshmp-haz-ws/config.json
* The first config file, /nshmp-haz-ws/apps/config.json, is
*     the default config file and remains in the repository.
* The second config file, /nshmp-haz-ws/config.js, is ignored by github and
*     is for developmental purposes. If this file exists it will be read in 
*     and merged with the default, overriding any keys present in the first
*     config file.
* The second file will be ignored if it is not present.
*
* @class Config
* @author bclayton@usgs.gov (Brandon Clayton)
*/
class Config {

  /**
  * @param {Class} callback - The callback must be a class as 
  *     new callback(config) will be called. 
  */
  static getConfig(callback){
    let p1 = $.ajax({url: '/nshmp-haz-ws/apps/config.json'});
    let p2 = $.ajax({url: '/nshmp-haz-ws/config.json'});
    
    $.when(p1, p2).done((c1, c2) => {
      let config = $.extend({}, c1[0], c2[0]);
      new callback(config);
    }).fail(() => {
      console.clear();
      p1.done((config) => {
        new callback(config);
      });
    });
  }

}
