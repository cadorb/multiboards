$(function(){


/* Parse obfuscaded emails and make them usable */
$('.email-link').each(function(i, elem){
  var $obfuscatedEmail = $(this);
  var address = $obfuscatedEmail.attr('title').replace('__AT__', '@');
  var text = $obfuscatedEmail.text().replace('__AT__', '@');
  var $plainTextEmail = $('<a href="mailto:' + address + '">'+ text +'</a>');
  $obfuscatedEmail.replaceWith($plainTextEmail);
});


var boards_colors = {};

var options = {
    date: false,
    content: false,
    snippet: false,
    media: false,
    showerror: false,
    span: 3,
    linktarget: '_blank',
    header_color: 'FFF',
    setted_colors: false
};

function shuffle(o){ //v1.0
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}

function loadDatas()
{
 
  /* Main boards list generator */
  $.getJSON("/json/sources?short_url=" + $('#row-boards').attr('data-short-url'), function(data) {

    /* Get board name */
    if (data[99] != 'multiboards' ){
      $('#subtitle').html(data[99]);
    }

    $('#row-boards').html('');
    $.each(data, function(i,item){

      // stop after 16 boards
      if(i>15){
        return false;
      }

      options.url = item[1];
      options.title_length = 40;
      options.limit= 10;
      options.header_bgcolor = item[3];
      options.odd = item[4];
      options.even = item[5];
      options.content = false;
      options.boards_nfo = true;
      options.end =  false;
      options.ucfirst = true;
      if(item[2].length){
        $('<div class=" thumbnail" id="board-'+i+'"></div>').appendTo('#row-boards');
        $('#board-'+i+'').rssfeed(item[2], options, function(){
          /*  title helper  */
          $("#row-boards a").hover(
            function () {
              $(this).parents('.rssFeed').children('.boards-nfo').html($(this).attr('original-title'));
            },
            function () {
              $(this).parents('.rssFeed').children('.boards-nfo').html('');
            }
          );
        });
      }
    });
  });

  /* Bottom news list generator */
  $.getJSON("/json/news", function(data) {
    $('#row-bottom-news').html('');
    $.each(data, function(i,item){
      options.title_length = 100;
      options.limit= 5;
      options.header_bgcolor = 'BBB';
      options.header_color = '212121';
      options.odd = 'FFF';
      options.even = 'FFF';
      options.content = false;
      options.boards_nfo = false;
      options.end =  false;
      options.url  = item[2];
      $('<div id="'+slugify(item[0])+'"></div>').appendTo('#row-bottom-news');
      $('#'+slugify(item[0])+'').rssfeed(item[1], options);
    });
  });

  /* DTC news & VDM */
  $('#vdm-bottom-news').html('');
  options.title_length = 100;
  options.limit= 5;
  options.header_color = '212121';
  options.header_bgcolor = 'BBB';
  options.odd = 'FFF';
  options.even = 'FFF';
  options.content = true;
  options.boards_nfo = false;
  options.end =  false;
  options.url = 'http://www.secouchermoinsbete.fr/';
  $('<div id="vdm"></div>').appendTo('#vdm-bottom-news');
  $('#vdm').rssfeed("http://www.secouchermoinsbete.fr/feeds.atom", options);


  /* Scan some imgur funs */
  // $.getJSON("/json/imgur", function(data) {
  //   var imgs = '';
  //   $('#imgur-thumbs').html('');
  //   $.each(data, function(i, items){
  //     for (var i = 0; i < 17; i++) {
  //       try {
  //         var tr = items[i]['hash'];
  //       imgs=imgs+'<span><a href="http://i.imgur.com/'+items[i]['hash']+items[i]['ext']+'" rel="superbox[gallery][my_gallery]" original-title="'+items[i]['title']+'"><img src="http://i.imgur.com/'+items[i]['hash']+items[i]['ext']+'" width="60" height="60" original-title="'+items[i]['title']+'"></a></span>';
  //       }
  //       catch(err)
  //       {}
  //     }
  //   });
  //   $(imgs).appendTo('#imgur-thumbs');
  // })
  // .success(function() {
  //   /* superbox */
  //   $.superbox();

  //   /*  tooltips for sharing button */
  //   $('#imgur-thumbs a').tipsy({fade: true, gravity: 'n'});

  // });

  /* change bottom line */
  changeBottomLine();

  /* Get online users */
  var path = window.location.pathname ;
  if (path.indexOf('/b/') !== -1){
    var board_id = path.replace('/b/', '')
    var board_name = $('#subtitle').html();
    $.post("/online", {id : board_id, name : board_name }, function(data) {
        $("#online-users .counter").html(data);
    });
  } else {
    // we are on the main board or any other page
    $.post("/online", function(data) {
        $("#online-users .counter").html(data);
    });
  }

  // populate active boards list
  $.get("/boards/best", function(data) {
    //console.log(data)
      $.each(data['boards'], function(i, elem){
          $("<li><a href='/b/" + elem + "' >" + elem + "</a></li>").appendTo('.dropdown-menu');
      });
      //$("#online-users .counter").html(data);
  });

  /* refresh every 10 mins */
  setTimeout(loadDatas, 60*10*1000);
}

/* Load datas then refresh every 10 mins */
if($('#row-boards').length){

  /* load imgur, boards, bottom lines */
  loadDatas();

  /* Populate radio dropdown */
  $.getJSON("/json/radios", function(data) {
    $.each(data, function(i,item){
      $('<li><a href="'+item.url+'">'+item.name+'</a></li>').appendTo("#radios");
    });
  });


  /* Click a radio link */
  $('.dropdown-menu li a').bind("click", function(e){
    e.preventDefault();
    var $this = $(this);
  });

}

function url_domain(data) {
    var a = document.createElement('a');
    a.href = data;
    return a.hostname;
}


/* Build custom boards */
if($('#build').length){

  /* Get random awesome name suggestion for custom board  */
  $.ajax({
      url: "/randomname"
    }).done(function(data) {
      $("#board-name").val(data);
    });




  function set_colors(id, url) {
    /* get colors */


    var domain = url_domain(url);
    console.log('set color')
    $.post('/favicon', {url: url}).done(function(data){

        // TODO: find if we can load external images from
        // here instead of from the server
        var image = new Image;
        image.src = data;
        image.onload = function() {
            var colorThief = new ColorThief();
            var bc = colorThief.getPalette(image);

            function componentToHex(c) {
                var hex = c.toString(16);
                return hex.length == 1 ? "0" + hex : hex;
            }

            function rgbToHex(array) {
                return componentToHex(array[0]) + componentToHex(array[1]) + componentToHex(array[2]);
            }

            function increase_brightness(hex, percent){
                // strip the leading # if it's there
                hex = hex.replace(/^\s*#|\s*$/g, '');

                // convert 3 char codes --> 6, e.g. `E0F` --> `EE00FF`
                if(hex.length == 3){
                    hex = hex.replace(/(.)/g, '$1$1');
                }

                var r = parseInt(hex.substr(0, 2), 16),
                    g = parseInt(hex.substr(2, 2), 16),
                    b = parseInt(hex.substr(4, 2), 16);

                return '' +
                   ((0|(1<<8) + r + (256 - r) * percent / 100).toString(16)).substr(1) +
                   ((0|(1<<8) + g + (256 - g) * percent / 100).toString(16)).substr(1) +
                   ((0|(1<<8) + b + (256 - b) * percent / 100).toString(16)).substr(1);
            }

            /* Define board colors */
            options.header_bgcolor = rgbToHex(bc[0]);
            options.odd = increase_brightness(rgbToHex(bc[1]), 90);
            options.even = increase_brightness(rgbToHex(bc[2]), 90);
            options.setted_colors = true;

            boards_colors[domain] = [options.header_bgcolor, options.odd, options.even];

            refresh_board(id, url);

            //return data
        }
    }).fail(function(data){
        console.log('Fail to set color');
    });
  }

  function refresh_board(id, url) {

    var domain = url_domain(url);

    var current = $("#" + id);

    if(!options.setted_colors){
      options.header_bgcolor = "aaa";
      options.odd = "fff";
      options.even = "eee";
    }

    // Custom options
    options.title_length = 40;
    options.limit= 10;
    options.content = false;
    options.boards_nfo = true;
    options.end =  false;
    options.ucfirst = true;

    /* build board */
    current.html('<p class="bold center">Loading data...</p>');
    current.attr('data-url', url);
    current.attr('data-name', domain);

    current.rssfeed(url, options, function(e){
      if(options.setted_colors === false){
        set_colors(id, url);
      }else{
        save_board();
        options.setted_colors = false;
      }
    });

  }

  /* make list sortable */
  $( "#sortable" ).sortable();
  $( "#sortable" ).disableSelection();

  /* submit flux */
  function submit_flux(e) {

    var url = $('#board-url').val();
    var filled = false;
    var code = e.keyCode || e.which;
    // on Enter
    if(code == 13 || e.type == 'paste' || e.type == 'click'){
      // check empty slot, then add new feed
      $("#sortable").find($(".board-container")).each(function(){
        var current = $(this);
        if( ( current.find($(".board-wrapper")).attr('data-url') === undefined && filled === false )|| current.find($(".board-wrapper")).attr('data-url') == url ) {

          var message = current.find('.slot-message');
          /* build board */
          refresh_board(current.find(".board-wrapper").attr('id'), url);
          /* set slot as taken */
          filled = true;
          current.find('.clear-board-link').removeClass('hidden').one('click', function(){
            $(this).addClass('hidden');
            current.find(".board-wrapper").removeData('url');
            current.find('.board-wrapper').html('').append(message);
            save_board();
          });
        }
      });
    }

  }

  /* Return Hex color background */
  function getBgColorHex(elem){
    var color = elem.css('background-color')
    var hex;
    if(color.indexOf('#')>-1){
        //for IE
        hex = color;
    } else {
        var rgb = color.match(/\d+/g);
        hex = '#'+ ('0' + parseInt(rgb[0], 10).toString(16)).slice(-2) + ('0' + parseInt(rgb[1], 10).toString(16)).slice(-2) + ('0' + parseInt(rgb[2], 10).toString(16)).slice(-2);
    }
    return hex;
  }

  function save_board(){

    /* get array */
    var boards = [];
    $(".board-container").each(function(){
      var b = $(this);
      var burl = b.find($(".board-wrapper")).attr('data-url');

      // if board exist push datas to array
      if(burl){
        boards.push(  'index:' + b.index() + ";" +
                      'url:' + b.find($(".board-wrapper")).attr('data-url') + ";" +
                      'header:' + getBgColorHex(b.find($(".rssHeader"))).slice(1) + ";" +
                      'odd:' + getBgColorHex($(b.find($(".rssRow"))[0])).slice(1) + ";" +
                      'even:' + getBgColorHex($(b.find($(".rssRow"))[1])).slice(1)
                   );
      }

    });

    /* Save current position */
    $.post( "/build/save", { 'name': $('#board-name').val(), 'urls': JSON.stringify(boards), 'uuid' : $("#board-url").attr('data-uuid') } )
      .done(function( data ) {
        var curl = $("#custom-url");
        curl.attr('data-url', data.replace(/https?:\/\/multiboards.net/g, ''));
        curl.html('Allez à votre MultiBoards ' + data);
        curl.show();
    });
  }

  /* Save board config */
  $( "#board-url" ).bind("keypress", function(e) {
    submit_flux(e);
    //save_board();
  });

  $( "#submit-flux" ).bind("click", function(e) {
    submit_flux(e);
    //save_board();
  });

  $("#sortable").on("sortupdate", function( event, ui ) {
    save_board();
  });

  /* Button Custom board */
  $("#custom-url").click( function(e) {
    window.open($(this).attr('data-url'), '_blank');
  });


} /* end build */


function slugify(Text)
{
    return Text
        .toLowerCase()
        .replace(/ /g,'-')
        .replace(/[^\w-]+/g,'')
        ;
}

function changeBottomLine(){
  $.get("/json/bottomline", function(data) {
    $("#bottom-line").html(data);
  });
}


$('.popup').click(function(event) {
    var width  = 630,
        height = 450,
        left   = ($(window).width()  - width)  / 2,
        top    = ($(window).height() - height) / 2,
        url    = this.href,
        opts   = 'status=1' +
                 ',width='  + width  +
                 ',height=' + height +
                 ',top='    + top    +
                 ',left='   + left;

    window.open(url, 'Share media', opts);

    return false;
});


}); /* End of "document ready" jquery callback */