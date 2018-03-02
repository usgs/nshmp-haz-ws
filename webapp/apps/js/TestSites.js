'use strict';

import D3MapPlot from './lib/D3MapPlot.js';
import Footer from './lib/Footer.js';
import Header from './lib/Header.js';
import Settings from './lib/Settings.js';

/**
* @fileoverview JavaScript class for test-sites.js.
* This class creates the header, footer, and map.
*
* @class TestSites
* @author bclayton@usgs.gov (Brandon Clayton)
*/
export default class TestSites {

  /**
  * @param {Config.getConfig} config - Output from Config.getConfig()
  */
  constructor(config) {
    /** @type {Footer} */
    this.footer = new Footer();
    let options = {
        rawBtnDisable: true,
        updateBtnDisable: true
    };
    this.footer.setOptions(options);
    /** @type {Header} */
    this.header = new Header();
    this.header.setTitle("Test Sites");
    /** @type {Settings} */
    //this.settings = new Settings(footer.settingsBtnEl);
    /** @type {HTMLElement} */
    this.el = document.querySelector("#testsites");
    /** @type {D3MapPlot} */
    this.map = new D3MapPlot(this.el, {}, this.settings, config);
  }
}
