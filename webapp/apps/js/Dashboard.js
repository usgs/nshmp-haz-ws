'use strict'

/**
* @fileoverview Class for index.html, this class 
*     creates the header and footer for the index page.
* 
* @class Dashboard
* @author bclayton@usgs.gov
*/

class Dashboard {
  
  /** 
  * @param {Object} config - config.json object, output from 
  *     Config.getConfig()
  */
  constructor(config) {
    /** @type {Footer} */
    this.footer = new Footer();
    this.footer.removeButtons();
    /** @type {Settings} */
    this.settings = new Settings(footer.settingsBtnEl);
    /** @type {Header} */
    this.header = new Header();
    this.header.setTitle("Dashboard");
  }
}
