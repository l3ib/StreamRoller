// jStorage - http://jstorage.info
(function(e){if(!e||!(e.toJSON||Object.toJSON||window.JSON)){throw new Error("jQuery, MooTools or Prototype needs to be loaded before jStorage!")}var f={},c={jStorage:"{}"},g=null,i=0,k=e.toJSON||Object.toJSON||(window.JSON&&(JSON.encode||JSON.stringify)),d=e.evalJSON||(window.JSON&&(JSON.decode||JSON.parse))||function(l){return String(l).evalJSON()},h=false;_XMLService={isXML:function(m){var l=(m?m.ownerDocument||m:0).documentElement;return l?l.nodeName!=="HTML":false},encode:function(m){if(!this.isXML(m)){return false}try{return new XMLSerializer().serializeToString(m)}catch(l){try{return m.xml}catch(n){}}return false},decode:function(m){var l=("DOMParser" in window&&(new DOMParser()).parseFromString)||(window.ActiveXObject&&function(o){var p=new ActiveXObject("Microsoft.XMLDOM");p.async="false";p.loadXML(o);return p}),n;if(!l){return false}n=l.call("DOMParser" in window&&(new DOMParser())||window,m,"text/xml");return this.isXML(n)?n:false}};function j(){if(window.localStorage){try{c=window.localStorage;h="localStorage"}catch(p){}}else{if(window.globalStorage){try{c=window.globalStorage[window.location.hostname];h="globalStorage"}catch(o){}}else{g=document.createElement("link");if(g.addBehavior){g.style.behavior="url(#default#userData)";document.getElementsByTagName("head")[0].appendChild(g);g.load("jStorage");var n="{}";try{n=g.getAttribute("jStorage")}catch(m){}c.jStorage=n;h="userDataBehavior"}else{g=null;return}}}if(c.jStorage){try{f=d(String(c.jStorage))}catch(l){c.jStorage="{}"}}else{c.jStorage="{}"}i=c.jStorage?String(c.jStorage).length:0}function b(){try{c.jStorage=k(f);if(g){g.setAttribute("jStorage",c.jStorage);g.save("jStorage")}i=c.jStorage?String(c.jStorage).length:0}catch(l){}}function a(l){if(!l||(typeof l!="string"&&typeof l!="number")){throw new TypeError("Key name must be string or numeric")}return true}e.jStorage={version:"0.1.4.1",set:function(l,m){a(l);if(_XMLService.isXML(m)){m={_is_xml:true,xml:_XMLService.encode(m)}}f[l]=m;b();return m},get:function(l,m){a(l);if(l in f){if(typeof f[l]=="object"&&f[l]._is_xml&&f[l]._is_xml){return _XMLService.decode(f[l].xml)}else{return f[l]}}return typeof(m)=="undefined"?null:m},deleteKey:function(l){a(l);if(l in f){delete f[l];b();return true}return false},flush:function(){f={};b();try{window.localStorage.clear()}catch(l){}return true},storageObj:function(){function l(){}l.prototype=f;return new l()},index:function(){var l=[],m;for(m in f){if(f.hasOwnProperty(m)){l.push(m)}}return l},storageSize:function(){return i},currentBackend:function(){return h}};j()})(window.jQuery||window.$);

~function() {
    
var mod = {};
mm.settings = mod;

var defaults = {
    'baseURL': '',
    'dataSourceDelegate': 'artistDataSource',
    'browserDelegate': 'groupBrowser'
};

mod.init = function() {
};

mod.show = function() {
  tree = this.get("dataSourceDelegate");
  $("#settings-" + tree).attr('checked', true);
  $('#settings').dialog({
	resizable: false,
        width: 640,
	height: 480,
	modal: true,
        draggable: false,
        title: 'StreamRoller Settings',
	buttons: {
          OK: function() {
              tree = $("#inner-settings :checked").val()
              mm.settings.set("dataSourceDelegate", tree);
              mm.reload();
              $(this).dialog('close');
          },
          Cancel: function() {
              $(this).dialog('close');
          }
        }
  });
};

mod.get = function(key) {
    return $.jStorage.get(key, defaults[key]);
};

mod.set = function(key, val) {
    $.jStorage.set(key, val);
};

}();
