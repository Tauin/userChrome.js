// ==UserScript==
// @name           show_SearchBar_Histrory_Dropmarker.uc.js
// @namespace      http://space.geocities.yahoo.co.jp/gl/alice0775
// @description    Show Searchbar Histrory Dropmarker
// @include        main
// @compatibility  Firefox 69
// @version        2019/07/13 01:00 Fix 68 Bug 1556561 - Remove children usage from autocomplete binding
// @version        2019/06/10 01:00 Fix 67.0a1 Bug 1492475 The search service init() method should simply return a Promise
// @version        2019/05/24 11:00 Fix overflowed/underflowed
// @version        2018-09-16 fix button click
// @version        2018-07-21 add button toggle popup when click
// @version        2018-07-21 add button style open state
// @version        1.0
// @original       https://u6.getuploader.com/script/download/1670
// ==/UserScript==
var showSearchBarHistroryDropmarker = {
  init2: function() {
    const kNSXUL = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
    let bar = BrowserSearch.searchBar;
    if (!bar)
      return;
    let ref = bar.querySelector(".search-go-container");
    if (ref.parentNode.querySelector(".searchBar-history-dropmarker"))
      return;
    let btn = document.createElementNS(kNSXUL, "dropmarker");
    btn.setAttribute("anonid", "historydropmarker");
    btn.setAttribute("class", "searchBar-history-dropmarker chromeclass-toolbar-additional");
    btn.setAttribute("tooltiptext", "Show history");
    btn.setAttribute("inherits", "open,parentfocused=focused,usertyping");
    btn.setAttribute("ordinal", "99");
    btn.setAttribute("type", "checkbox");
    btn.setAttribute("autoCheck", "false");
    this.btn = ref.parentNode.insertBefore(btn, ref);
    btn.addEventListener("click", this, false);
    btn.addEventListener("mousedown", this, false);
  },

  init: function() {
    window.addEventListener("unload", this, false);
    window.addEventListener('aftercustomization', this, false);
    Services.prefs.addObserver('browser.search.widget.inNavBar', this, false);
    window.addEventListener("resize", this, false);
    this.popup = document.getElementById("PopupSearchAutoComplete");
    this.popup.addEventListener("popupshown", this, false);
    this.popup.addEventListener("popuphidden", this, false);
    Services.search.init().then(rv => { 
      if (Components.isSuccessCode(rv)) {
        this.init2();
      }
    });
    let style = `
      .search-go-container {
        /* -moz-box-ordinal-group:500; */  /* V-> */
      }
      .searchBar-history-dropmarker {
        -moz-appearance: none;
        list-style-image: url(chrome://global/skin/icons/arrow-dropdown-16.svg);
        opacity: 0.6;
      }
      .searchBar-history-dropmarker:active,
      .searchBar-history-dropmarker[checked] {
        background-color: var(--toolbarbutton-active-background);
      }
      .searchBar-history-dropmarker:hover {
        background-color: var(--toolbarbutton-hover-background);
      }
      toolbar[brighttext] .searchBar-history-dropmarker {
        -moz-context-properties: fill, fill-opacity;
        fill: currentColor;
        fill-opacity: var(--toolbarbutton-icon-fill-opacity);
      }
      `.replace(/\s+/g, " ");

    let sspi = document.createProcessingInstruction(
      'xml-stylesheet',
      'type="text/css" href="data:text/css,' + encodeURIComponent(style) + '"'
    );
    document.insertBefore(sspi, document.documentElement);
    sspi.getAttribute = function(name) {
      return document.documentElement.getAttribute(name);
    };
  },

  uninit: function() {
    window.removeEventListener("unload", this, false);
    window.removeEventListener('aftercustomization', this, false);
    Services.prefs.removeObserver('browser.search.widget.inNavBar', this);
    window.removeEventListener("resize", this, false);
  },

  showHistory: function(event) {
    event.stopPropagation();
  	let bar = document.getElementById("searchbar");
    if (event.target.hasAttribute("checked")) {
      bar._textbox.closePopup();
      return;
    }
  	let v = '';
		if(bar._textbox.value)
		  v = bar._textbox.value;
		bar._textbox.value = '';
		bar._textbox.showHistoryPopup();
		bar._textbox.value = v;
	},

  popupshown: function(event) {
    this.btn.setAttribute("checked", true);
  },

  popuphidden: function(event) {
    setTimeout(function(){this.btn.removeAttribute("checked");}.bind(this), 0);
  },
  
  observe(aSubject, aTopic, aPrefstring) {
      if (aTopic == 'nsPref:changed') {
        // 設定が変更された時の処理
        setTimeout(function(){showSearchBarHistroryDropmarker.init2();}, 0);
      }
  },

  _timer: null,
  handleEvent: function(event) {
    switch(event.type) {
      case "resize":
        if (!this._timer)
          clearTimeout(this._timer);
        this._timer = setTimeout(() => this.init2(), 250);
        break;
      case "aftercustomization":
        this.init2();
        break;
      case "mousedown":
        if (event.button == 0)
          this.showHistory(event);
        break;
      case "click":
        if (event.button == 0) {
          //event.stopPropagation();
          //event.preventDefault();
        }
        break;
      case "popupshown":
        this.popupshown(event);
        break;
      case "popuphidden":
        this.popuphidden(event);
        break;
      case "unload":
        this.uninit();
        break;
    }
  }
}
showSearchBarHistroryDropmarker.init();
