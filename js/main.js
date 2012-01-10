var kitties = {};
var ti_json = [];


function parse_datasheet() {
  var data = $('#datasheet').val().split('\n');
  var kitty = null;
  kitties = {};

  for (var i=0; i<data.length; i++) {
    var line = data[i];
    if ($.trim(line) == '')
      continue;
    if (line[0] != ' ') {
      // name line
      kitties[line] = kitty = {};
    } else {
      // data line
      line = $.trim(line);
      type = line[0];
      value = line.substring(2);
      switch (line[0]) {
        case 't':
          var tags = kitty['tags'];
          if (!$.isArray(tags))
            kitty['tags'] = tags = [];
          tags.push(value);
          break;
        case 'p':
        case 'f':
          var links = kitty['links'];
          if (!$.isArray(links))
            kitty['links'] = tags = [];
          tags.push({type: line[0], value: value});
          break;
      }
    }
  }
}


/**
 * Generates the JSON for jquery-tokeninput
 *
 * @param names: currently useless due to tokeninput
 */
function generate_ti_json(names) {
  var id = 1;
  var items = [];

  $.each(kitties, function(name, data){
    // if names is given, then only generate for those kitty names
    if (names && $.inArray(name, names) == -1)
      return true;
    items.push(name);
    $.merge(items, data['tags']);
  });

  ti_json = [];
  var last_item = null;
  items.sort()
  for (var i=0; i<items.length; i++) {
    var item  = items[i];
    if (item != last_item) {
      last_item = item;
      ti_json.push({
        'id': id++,
        'name': item
      });
    }
  }
}


function do_filter() {
  var tags = $('#filter').tokenInput('get');
  tags = $.map(tags, function(tag) {return tag.name});

  var match_kitty_names = [];
  $.each(kitties, function(name, data){
    var count = 0;
    // need to match all tags in name or tags
    if (false !== $.each(tags, function(idx, tag){
      if (tag != name && $.inArray(tag, data['tags']) == -1)
        return false;
      count++;
    }))
    if (count == tags.length)
      match_kitty_names.push(name);
  });

/*
  // resetting the list
  // FIXME tokeninput does not seem to support resetting
  // FIXME ids are different
  if (match_kitty_names.length > 0) {
    generate_ti_json(match_kitty_names);
    $('#filter').tokenInput(ti_json);
  } else {
    $('#filter').tokenInput([]);
  }
*/

  generate_results(match_kitty_names);
}


function generate_results(names) {
  var $results = $('#results').empty();
  $.each(names, function(idx, name){
    var $kitty = $('<div/>').addClass('kitty');
    
    var $tags = $('<div/>').addClass('tags');
    tags = kitties[name]['tags'];
    $.each(tags, function(idx, tag){
      $('<span/>')
        .addClass('tag')
        .text(tag)
        .appendTo($tags);
    });
    $('<div/>')
      .addClass('name')
      .text(name)
      .appendTo($kitty);
    $tags.appendTo($kitty);

    var $links = $('<div/>').addClass('links');
    links = kitties[name]['links'] || [];
    $.each(links, function(idx, link){
      var type = link['type'];
      var value = link['value'];
      switch (type) {
        case 'p':
          var $a = $('<a/>')
            .addClass('petfinder')
            .text('Petfinder')
            .attr('href', value)
            ;
          $links.append($a)
          break;
        case 'f':
          var $a = $('<a/>')
            .addClass('flickr')
            .html('Flick<span style="color:#ff0084">r</a>')
            .attr('href', value)
            ;
          $links.append($a)
          break;
      }
      });
    $links.appendTo($kitty);

    $kitty.appendTo($results);
  });

  var count = names.length;
  $header = $('#results-header');
  if (count == 0)
    $header.text('Kittens are all gone');
  else if (count == 1)
    $header.text('This must be one you are looking for!');
  else
    $header.text(count.toString() + ' kittens are staring at you...');
}


function reset_data(){
  parse_datasheet();
  generate_ti_json();
  $('#controls')
    .empty()
    .append($('<input id="filter" style="outline: medium none;" autocomplete="off" type="text">'))
    ;
  $('#filter').tokenInput(ti_json, {
    hintText: 'Meow in a search term',
    animateDropdown: false,
    searchingText: 'Meowing for results...',
    preventDuplicates: true,
    onAdd: do_filter,
    onDelete: do_filter
  });
  do_filter();
}


$(function(){
  var $ds_ctl = $('#ds-control')
    .css('cursor', 'pointer')
    .click(function(){
      var $this = $(this);
      var $ds_area = $('#ds-area');
      if ($this.text() == '+') {
        $this.text('-');
        $ds_area.slideDown();
      } else {
        $this.text('+');
        $ds_area.slideUp();
      }
    })
    ;
  var $ds_area = $('#ds-area').slideUp();

});
$(reset_data);
