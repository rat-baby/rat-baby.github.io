;(function($, window, undefined) {
  //constructor
  $.MagnifyZoom = function(options, pluginElement){
    this.$imageContainer = $(pluginElement);

    this._init(options);
  };

  //default property
  $.MagnifyZoom.defaults = {
    width: 300,
    height: 300,
    cornerRounding: '50%'
  };


  //methods using prototype
  $.MagnifyZoom.prototype = {
    //methodName: function defition
    _init: function(options) {
      this.options = $.extend(true, $.MagnifyZoom.defaults, options);
      this.nativeWidth = document.querySelector('.small').naturalWidth;
      this.nativeHeight = document.querySelector('.small').naturalHeight;
      this.$glass = $('.large');
      this.$smallImage = this.$imageContainer.children('.small');

      this._getLocation();
    },

    _getLocation: function() {
      self = this;

      this.$imageContainer.on('mousemove', function(e) {
        $target = $(this);
        magnifyOffset = $target.offset();
        self.mouseX = e.pageX - magnifyOffset.left;
        self.mouseY = e.pageY - magnifyOffset.top;
        
        self._zoom($target);
      });

    },

    _zoom: function($target) {

      if (this.mouseX <= 0 || this.mouseX >= $target.width() || this.mouseY <= 0 || this.mouseY >= $target.height()) {

        this.$glass.fadeOut(1);

      } else {
        this.$glass.fadeIn(1);
      }

      if ($target.is(':visible')) {
        let glassWidth = this.options.width;
        let glassHeight = this.options.height;

        let rx = Math.round((this.mouseX / this.$smallImage.width()) * this.nativeWidth - (glassWidth / 2)) * -1;
        let ry = Math.round((this.mouseY / this.$smallImage.height()) * this.nativeHeight - (glassHeight / 2)) * -1;

        let posX = this.mouseX - (glassWidth / 2);
        let posY = this.mouseY - (glassHeight / 2);

        this.$glass.css({
          width: `${glassWidth}px`,
          height: `${glassHeight}px`,
          borderRadius: this.options.cornerRounding,
          left: `${posX}px`,
          top: `${posY}px`,
          backgroundPosition: `${rx}px ${ry}px`
        });
      }

    }

  };

  //contentRotator plugin method
  $.fn.magnifyZoom = function(options) {
    if (typeof options === 'string') {
            
      // not as common, leave off code for now...
      
     } else {  // options !== 'string', usually meaning it is an object
      
      this.each(function() {
          
        let instance = $.data(this, 'magnifyZoom');
          
        if (instance) {
          instance._init();
        }
        else {
          
          instance = $.data(this, 'magnifyZoom', new $.MagnifyZoom(options, this));  
           
        }
      });
           
      
      
    }

    return this;
  }

})(jQuery, window);