~function() {
  window.mm = {};
  
  var defaultCols = ['id3_track', 'id3_title', 'id3_album', 'id3_artist' ],
      defaultLabels = ['#', 'Title', 'Album', 'Artist'],
      ajaxHandle,
      currData;
  
  mm.pageHistory = function(e) {
    mm.showDir(e.path, '#listing');
  };
  
  mm.renderTable = function(dir, data, columns, headers) {
    var table = $(mm.tmpl('tmpl_mediatable', {data: data, columns: columns, headers: headers, parent: mm.utils.findParentDir(dir) }));
    $(table).find('tbody tr').bind('click', mm.clickRow);
    return table;
  };
  
  mm.clickRow = function(e) {
    var o = currData[this.getAttribute('data-rowindex')];
    if (!o) {
      window.location.hash = mm.utils.findParentDir(window.location.hash);
      return false;
    }
    
    if (o.folder == 't') {
      
      window.location.hash = ((o.path == '.') ? '' : o.path +'/') + o.file;
      return false;
    }
    
    mm.playlist.addSong(o);
    return false;
  };
  
  mm.showDir = function(dir, div) {
    dir = mm.utils.stripSlashes(dir);
    if (ajaxHandle) {
      ajaxHandle.abort();
    }

    function showDirCallback(data, textStatus) {
      if (!data) {
        alert('Failed');
        return;
      }
      currData = data;
      var content = mm.renderTable(dir, data, defaultCols, defaultLabels);
      $(div).html(content);

      songs = [];
      for (var i=0; data[i]; i++) {
        if (!data[i].folder) {
          songs.push(data[i]);
        }
      }
      var title = (dir) ? ' ('+dir+')' : '';
      $('#browser .title').text('Browser'+ title);
      $(window).trigger('resize');
    }
    ajaxHandle = $.getJSON('/list/'+dir, showDirCallback);
  };
  
  mm.resize = function(e) {
    var winheight = $(this).height();
    var controls = $('#controls');

    $('#body').height( winheight - controls.height() );
    $('#folders').height( winheight - controls.height() );
  };
  
  mm.addFolder = function() {
    var newSongs = [];
    for (var i=0; currData[i]; i++) {
      if (!currData[i].folder) {
        newSongs.push(currData[i]);
      }
    }
    $('#playlist-settings').hide();
    mm.playlist.addSongs(newSongs);
  };
  
  mm.clearPlaylist = function() {
    $('#playlist-settings').hide();
    mm.playlist.newList();
  };
  
  mm.downloadM3U = function() {
    mm.playlist.generateM3U();
  };
}();

// Simple JavaScript Templating
// John Resig - http://ejohn.org/ - MIT Licensed
var cache = {};
mm.tmpl = function tmpl(str, data) {
    // Figure out if we're getting a template, or if we need to
    // load the template - and be sure to cache the result.
    var fn = !/\W/.test(str) ?
  cache[str] = cache[str] ||
    tmpl(document.getElementById(str).innerHTML) :

    // Generate a reusable function that will serve as a template
    // generator (and which will be cached).
  new Function("obj",
    "var p=[],print=function(){p.push.apply(p,arguments);};" +

    // Introduce the data as local variables using with(){}
    "with(obj){p.push('" +

    // Convert the template into pure JavaScript
    str.replace(/[\r\t\n]/g, " ")
       .replace(/'(?=[^%]*%>)/g,"\t")
       .split("'").join("\\'")
       .split("\t").join("'")
       .replace(/<%=(.+?)%>/g, "',$1,'")
       .split("<%").join("');")
       .split("%>").join("p.push('")
       + "');}return p.join('');");

    // Provide some basic currying to the user
    return data ? fn(data) : fn;
};

$(document).ready(function() {

  if (!window.console) {
    window.console = { log: function(){}, dir: function(){} };
  }
  
  /*$('#playlist .section_header').bind('click', function(e) {
    $(this).toggleClass('expanded_header');
    $(this).next().slideToggle('fast');
  });*/

  $('#playlist .section_header .options').bind('click', function(e) {
    $('#playlist-settings').toggle()
      .position({
        my: 'left top',
        at: 'left top',
        of: e,
        offset: '10 10'
      });
      return false;
  });
  
  $('#playlist-settings ul li').bind('click', function(e) {
    var func = $(e.currentTarget).attr('data-func');
    mm[func]();
  });

  $('body').disableSelection();

  $.address.change(mm.pageHistory);
  
  $(window).resize(mm.resize);

  $.getJSON('/dirs', function(data) {
    var recurse = function(d, pathStr) {
      var $str = $('<ul/>');
      for (var i in d) {
        var p2 = pathStr+'/'+i;
        var $li = $("<li/>");
        var $a = $('<a href="'+ p2 +'">'+ i +'</a>');
        $a.attr('href', p2);

        $li.append($a);
        $str.append($li);
        $li.append(recurse(d[i], p2));
      }
      return $str;
    }

    var list = recurse(data, '#');
    $('#folders .list').html( list );
    $('#folders .list').jstree( {'plugins' : ['html_data','ui','themeroller'] } );
    $('#folders .list').bind('select_node.jstree', function(e,d) {
      console.log($(this));
      window.location.hash = d.rslt.obj.find("a").get(0).hash;
    });
  });

  
  
  mm.player.init();
  mm.settings.init();
  mm.playlist.init();
  
  if ( window.innerWidth < 1010 ) $('#playlist').addClass('smallDisplay');

});
