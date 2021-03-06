goog.provide('olpz.control.PanZoom');

goog.require('goog.asserts');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('olpz.control.ZoomSlider');



/**
 * @constructor
 * @param {olpzx.control.PanZoomOptions=} opt_options Options.
 * @extends {ol.control.Control}
 * @api
 */
olpz.control.PanZoom = function(opt_options) {

  var options = opt_options || {};

  /**
   * @type {?string}
   * @private
   */
  this.className_ = options.className ? options.className : 'ol-panzoom';

  /**
   * @type {?string}
   * @private
   */
  this.imgPath_ = options.imgPath ? options.imgPath : null;

  var element = this.createEl_();

  goog.base(this, {
    element: element,
    target: options.target
  });

  /**
   * @type {Array.<goog.events.Key>}
   * @private
   */
  this.listenerKeys_ = [];

  /**
   * @type {number}
   * @private
   */
  this.duration_ = options.duration !== undefined ? options.duration : 100;

  /**
   * @type {?ol.Extent}
   * @private
   */
  this.maxExtent_ = options.maxExtent ? options.maxExtent : null;

  /**
   * @type {number}
   * @private
   */
  this.maxZoom_ = options.maxZoom ? options.maxZoom : 19;

  /**
   * @type {number}
   * @private
   */
  this.minZoom_ = options.minZoom ? options.minZoom : 0;

  /**
   * @type {number}
   * @private
   */
  this.pixelDelta_ = options.pixelDelta !== undefined ?
      options.pixelDelta : 128;

  /**
   * @type {boolean}
   * @private
   */
  this.slider_ = options.slider !== undefined ? options.slider : false;

  /**
   * @type {number}
   * @private
   */
  this.zoomDelta_ = options.zoomDelta !== undefined ? options.zoomDelta : 1;

  /**
   * @type {Element}
   * @private
   */
  this.panEastEl_ = this.createButtonEl_('pan-east');

  /**
   * @type {Element}
   * @private
   */
  this.panNorthEl_ = this.createButtonEl_('pan-north');

  /**
   * @type {Element}
   * @private
   */
  this.panSouthEl_ = this.createButtonEl_('pan-south');

  /**
   * @type {Element}
   * @private
   */
  this.panWestEl_ = this.createButtonEl_('pan-west');

  /**
   * @type {Element}
   * @private
   */
  this.zoomInEl_ = this.createButtonEl_('zoom-in');

  /**
   * @type {Element}
   * @private
   */
  this.zoomOutEl_ = this.createButtonEl_('zoom-out');

  /**
   * @type {?Element}
   * @private
   */
  this.zoomMaxEl_ = (!this.slider_ && this.maxExtent_) ?
      this.createButtonEl_('zoom-max') : null;

  /**
   * @type {?olpz.control.ZoomSlider}
   * @private
   */
  this.zoomSliderCtrl_ = (this.slider_) ? new olpz.control.ZoomSlider() : null;

  element.appendChild(this.panNorthEl_);
  element.appendChild(this.panWestEl_);
  element.appendChild(this.panEastEl_);
  element.appendChild(this.panSouthEl_);
  element.appendChild(this.zoomInEl_);
  element.appendChild(this.zoomOutEl_);
  if (this.zoomMaxEl_) {
    element.appendChild(this.zoomMaxEl_);
  }

  /**
   * @type {Element}
   * @private
   */
  this.element_ = element;

};
goog.inherits(olpz.control.PanZoom, ol.control.Control);


/**
 * @param {ol.Map} map
 * @api
 */
olpz.control.PanZoom.prototype.setMap = function(map) {

  var keys = this.listenerKeys_;
  var zoomSlider = this.zoomSliderCtrl_;

  var currentMap = this.getMap();
  if (currentMap && currentMap instanceof ol.Map) {
    keys.forEach(ol.Observable.unByKey);
    keys.length = 0;
    if (this.zoomSliderCtrl_) {
      this.zoomSliderCtrl_.setTarget(null);
      window.setTimeout(function() {
        currentMap.removeControl(zoomSlider);
      }, 0);
    }
  }

  goog.base(this, 'setMap', map);

  if (map) {
    keys.push(goog.events.listen(this.panEastEl_, goog.events.EventType.CLICK,
        this.pan_.bind(this, 'east'), false, this));
    keys.push(goog.events.listen(this.panNorthEl_, goog.events.EventType.CLICK,
        this.pan_.bind(this, 'north'), false, this));
    keys.push(goog.events.listen(this.panSouthEl_, goog.events.EventType.CLICK,
        this.pan_.bind(this, 'south'), false, this));
    keys.push(goog.events.listen(this.panWestEl_, goog.events.EventType.CLICK,
        this.pan_.bind(this, 'west'), false, this));

    keys.push(goog.events.listen(this.zoomInEl_, goog.events.EventType.CLICK,
        this.zoom_.bind(this, 'in'), false, this));
    keys.push(goog.events.listen(this.zoomOutEl_, goog.events.EventType.CLICK,
        this.zoom_.bind(this, 'out'), false, this));
    if (this.maxExtent_ && !this.slider_) {
      keys.push(goog.events.listen(this.zoomMaxEl_, goog.events.EventType.CLICK,
          this.zoom_.bind(this, 'max'), false, this));
    }
    if (this.slider_) {
      zoomSlider.setTarget(this.element_);
      window.setTimeout(function() {
        map.addControl(zoomSlider);
      }, 0);
      this.adjustZoomSlider_();
    }
  }
};


/**
 * @return {Element}
 * @private
 */
olpz.control.PanZoom.prototype.createEl_ = function() {
  var path = this.imgPath_;
  var className = this.className_;
  var cssClasses = [
    className,
    'ol-unselectable'
  ];

  if (!path) {
    cssClasses.push('ol-control');
  }

  var element = document.createElement('div');
  element.className = cssClasses.join(' ');

  if (path) {
    element.style.left = '4px';
    element.style.position = 'absolute';
    element.style.top = '4px';
  }

  return element;
};


/**
 * @param {string} action
 * @return {Element}
 * @private
 */
olpz.control.PanZoom.prototype.createButtonEl_ = function(action) {
  var divEl = document.createElement('div');
  var path = this.imgPath_;
  var maxExtent = this.maxExtent_;
  var slider = this.slider_;

  if (path) {
    divEl.style.width = '18px';
    divEl.style.height = '18px';
    divEl.style.position = 'absolute';
    divEl.style.cursor = 'pointer';

    var imgEl = document.createElement('img');
    imgEl.style.width = '18px';
    imgEl.style.height = '18px';
    imgEl.style['vertical-align'] = 'top';

    switch (action) {
      case 'pan-east':
        imgEl.id = 'OpenLayers_Control_PanZoom_panright_innerImage';
        imgEl.src = [path, 'east-mini.png'].join('/');
        imgEl.alt = "Pan East";
        divEl.id = 'OpenLayers_Control_PanZoom_panright';
        divEl.style.top = '22px';
        divEl.style.left = '22px';
        break;
      case 'pan-north':
        imgEl.id = 'OpenLayers_Control_PanZoom_panup_innerImage';
        imgEl.src = [path, 'north-mini.png'].join('/');
        imgEl.alt = "Pan North";
        divEl.id = 'OpenLayers_Control_PanZoom_panup';
        divEl.style.top = '4px';
        divEl.style.left = '13px';
        break;
      case 'pan-south':
        imgEl.id = 'OpenLayers_Control_PanZoom_pandown_innerImage';
        imgEl.src = [path, 'south-mini.png'].join('/');
        imgEl.alt = "Pan South";
        divEl.id = 'OpenLayers_Control_PanZoom_pandown';
        divEl.style.top = '40px';
        divEl.style.left = '13px';
        break;
      case 'pan-west':
        imgEl.id = 'OpenLayers_Control_PanZoom_panleft_innerImage';
        imgEl.src = [path, 'west-mini.png'].join('/');
        imgEl.alt = "Pan West";
        divEl.id = 'OpenLayers_Control_PanZoom_panleft';
        divEl.style.top = '22px';
        divEl.style.left = '4px';
        break;
      case 'zoom-in':
        imgEl.id = 'OpenLayers_Control_PanZoom_zoomin_innerImage';
        imgEl.src = [path, 'zoom-plus-mini.png'].join('/');
        imgEl.alt = "Zoom In";
        divEl.id = 'OpenLayers_Control_PanZoom_zoomin';
        divEl.style.top = '63px';
        divEl.style.left = '13px';
        break;
      case 'zoom-out':
        imgEl.id = 'OpenLayers_Control_PanZoom_zoomout_innerImage';
        imgEl.src = [path, 'zoom-minus-mini.png'].join('/');
        imgEl.alt = "Zoom Out";
        divEl.id = 'OpenLayers_Control_PanZoom_zoomout';
        if (slider) {
          divEl.style.top = [this.getSliderSize_() + 81, 'px'].join('');
        } else if (maxExtent) {
          divEl.style.top = '99px';
        } else {
          divEl.style.top = '81px';
        }
        divEl.style.left = '13px';
        break;
      case 'zoom-max':
        imgEl.id = 'OpenLayers_Control_PanZoom_zoomworld_innerImage';
        imgEl.src = [path, 'zoom-world-mini.png'].join('/');
        imgEl.alt = "Zoom Max";
        divEl.id = 'OpenLayers_Control_PanZoom_zoomworld';
        divEl.style.top = '81px';
        divEl.style.left = '13px';
        break;
    }
    divEl.appendChild(imgEl);
  }

  return divEl;
};


/**
 * @param {string} direction
 * @param {goog.events.BrowserEvent} evt
 * @return {boolean}
 * @private
 */
olpz.control.PanZoom.prototype.pan_ = function(direction, evt) {
  var stopEvent = false;

  var map = this.getMap();
  goog.asserts.assert(map, 'map must be set');
  var view = map.getView();
  goog.asserts.assert(view, 'map must have view');
  var mapUnitsDelta = view.getResolution() * this.pixelDelta_;
  var deltaX = 0, deltaY = 0;
  if (direction == 'south') {
    deltaY = -mapUnitsDelta;
  } else if (direction == 'west') {
    deltaX = -mapUnitsDelta;
  } else if (direction == 'east') {
    deltaX = mapUnitsDelta;
  } else {
    deltaY = mapUnitsDelta;
  }
  var delta = [deltaX, deltaY];
  ol.coordinate.rotate(delta, view.getRotation());

  // pan
  var currentCenter = view.getCenter();
  if (currentCenter) {
    if (this.duration_ && this.duration_ > 0) {
      var center = view.constrainCenter([currentCenter[0] + delta[0], currentCenter[1] + delta[1]]);
      if (this.duration_ && this.duration_ > 0) {
        view.animate({
          center: center,
          duration: this.duration_,
          easing: ol.easing.linear
        });
      } else {
        view.setCenter(center);
      }
    }
  }

  evt.preventDefault();
  stopEvent = true;

  return !stopEvent;
};


/**
 * @param {string} direction
 * @param {goog.events.BrowserEvent} evt
 * @private
 */
olpz.control.PanZoom.prototype.zoom_ = function(direction, evt) {
  if (direction === 'in') {
    this.zoomByDelta_(this.zoomDelta_);
  } else if (direction === 'out') {
    this.zoomByDelta_(-this.zoomDelta_);
  } else if (direction === 'max') {
    var map = this.getMap();
    var view = map.getView();
    var extent = !this.maxExtent_ ?
        view.getProjection().getExtent() : this.maxExtent_;
    var size = map.getSize();
    goog.asserts.assert(size, 'size should be defined');
    view.fit(extent, size);
  }
};


/**
 * @param {number} delta Zoom delta.
 * @private
 */
olpz.control.PanZoom.prototype.zoomByDelta_ = function(delta) {
  var map = this.getMap();
  var view = map.getView();
  if (!view) {
    // the map does not have a view, so we can't act
    // upon it
    return;
  }
  var currentResolution = view.getResolution();
  if (currentResolution) {
    var newResolution = view.constrainResolution(currentResolution, delta);
    if (this.duration_ && this.duration_ > 0) {
      view.animate({
        resolution: newResolution,
        duration: this.duration_,
        easing: ol.easing.easeOut
      });
    } else {
       view.setResolution(newResolution);
    }
  }
};


/**
 * @private
 */
olpz.control.PanZoom.prototype.adjustZoomSlider_ = function() {
  var zoomSlider = this.zoomSliderCtrl_;
  var path = this.imgPath_;

  if (!zoomSlider || !path) {
    return;
  }

  var height = [this.getSliderSize_(), 'px'].join('');

  // bar
  var zoomSliderEl = zoomSlider.getElement();
  zoomSliderEl.style.background =
      ['url(', path, '/', 'zoombar.png', ')'].join('');
  zoomSliderEl.style.border = '0';
  zoomSliderEl.style['border-radius'] = '0';
  zoomSliderEl.style.height = height;
  zoomSliderEl.style.left = '13px';
  zoomSliderEl.style.padding = '0';
  zoomSliderEl.style.top = '81px';
  zoomSliderEl.style.width = '18px';

  // slider
  var sliderEl = zoomSliderEl.children[0];
  goog.asserts.assertInstanceof(sliderEl, Element);
  sliderEl.style.background = ['url(', path, '/', 'slider.png', ')'].join('');
  sliderEl.style.border = 0;
  sliderEl.style.height = '9px';
  sliderEl.style.margin = '0 -1px';
  sliderEl.style.width = '20px';
};


/**
 * @private
 * @return {number}
 */
olpz.control.PanZoom.prototype.getSliderSize_ = function() {
  return (this.maxZoom_ - this.minZoom_ + 1) * 11;
};
