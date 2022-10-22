// Autocomplete with cities when user searching by typing city name
var split = function (val) {
  return val.split(/,\s*/);
}

var extractLast = function (term) {
  return split(term).pop();
}

var extractFirst = function (term) {
  return split(term)[0];
}

jQuery(function () {
  var $citiesField = jQuery("#cityInput");

  $citiesField.autocomplete({
      source: function (request, response) {
          jQuery.getJSON(
              "http://gd.geobytes.com/AutoCompleteCity?callback=?&filter=US&q=" + extractLast(request.term),
              function (data) {
                  response(data);
              }
          );
      },
      minLength: 3,
      select: function (event, ui) {
          var selectedObj = ui.item;
          placeName = selectedObj.value;
          if (typeof placeName == "undefined") placeName = $citiesField.val();

          if (placeName) {
              var terms = split($citiesField.val());
              // remove the current input
              terms.pop();
              // add the selected item (city only)
              terms.push(extractFirst(placeName));

              $citiesField.val(terms);
          }

          return false;
      },
      focus: function() {
          // prevent value inserted on focus
          return false;
      },
  });

  $citiesField.autocomplete("option", "delay", 100);
});