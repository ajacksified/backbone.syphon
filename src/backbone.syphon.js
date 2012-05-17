Backbone.Syphon = (function(Backbone, $, _){
  var Syphon = {};

  // Ignore Element Types
  // --------------------

  // Tell Syphon to ignore all elements of these types
  var defaultOptions = {
    ignore: ["[type=button]", "[type=submit]", "[type=reset]", "button"],
    attribute: 'id'
  }

  // Syphon
  // ------

  // Get a JSON object that represents
  // all of the form inputs, in this view
  Syphon.serialize = function(view, options){
    var data = {};
    var options = $.extend(defaultOptions, options);

    var elements = getInputElements(view, options.ignore);

    _.each(elements, function(el){
      $el = $(el);
      var type = getElementType($el); 
      var inputReader = Syphon.InputReaders.get(type);
      var value = inputReader($el);

      data[$el.attr(options.attribute)] = value;
    });

    return data;
  };

  // Input Readers
  // -------------

  Syphon.InputReaders = {
    readers: {},

    // Retrieve the correct input reader based
    // on the type of the element that is passed
    // in as the `$el` parameter. If no reader is
    // found for the specific input type, returns
    // a default input reader.
    get: function(type){
      var reader = this.readers[type.toLowerCase()];

      if (!reader){
        reader = this.readers["default"];
      }

      return reader;
    },

    // Register a new input reader, based on
    // an input element type. For example: "text", 
    // or "textarea". Note that the type can either
    // be a `type` attribute (`type="text"`) or the
    // elmement `tagName` (`<textarea>`).
    register: function(type, reader){
      this.readers[type.toLowerCase()] = reader;
    },

    // Registers the default input reader that will
    // be returned when no input reader is found for
    // the specific type requested.
    registerDefault: function(reader){
      this.readers["default"] = reader;
    },

    // Remove the Input Reader associated with this
    // input type.
    unregister: function(type){
      delete this.readers[type];
    }
  };

  // Built-in Input Readers
  // ---------------------
  
  // The default reader
  Syphon.InputReaders.registerDefault(function($el){
    return $el.val();
  });
  
  // Checkbox reader, returning a boolean value for
  // whether or not the checkbox is checked.
  Syphon.InputReaders.register("checkbox", function($el){
    var checked = $el.prop("checked");
    return checked;
  });

  // Helpers
  // -------

  // Retrieve all of the form inputs
  // from the view
  var getInputElements = function(view, ignore){
    var ignore = ignore.join(", ").replace(/"/,'\'');
    return view.$("form input, form select, form textarea").filter(":not(" + ignore + ")");
  };

  // Determine what type of element this is. It
  // will either return the `type` attribute of
  // an `<input>` element, or the `tagName` of
  // the element when the element is not an `<input>`.
  var getElementType = function(el){
    var typeAttr;
    var $el = $(el);
    var tagName = $el[0].tagName;
    var type = tagName;

    if (tagName.toLowerCase() === "input"){
      typeAttr = $el.attr("type");
      if (typeAttr){
        type = typeAttr;
      } else {
        type = "text";
      }
    }

    // Always return the type as lowercase
    // so it can be matched to lowercase
    // type registrations.
    return type.toLowerCase();
  };

  return Syphon;
})(Backbone, jQuery, _);
