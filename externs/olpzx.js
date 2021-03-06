/**
 * @type {Object}
 */
var olpzx;


/**
 * @type {Object}
 */
olpzx.control;


/**
 * @typedef {{
 *     className: (string|undefined),
 *     duration: (number|undefined),
 *     imgPath: (string|undefined),
 *     maxExtent: (ol.Extent|undefined),
 *     maxZoom: (number|undefined),
 *     minZoom: (number|undefined),
 *     pixelDelta: (number|undefined),
 *     slider: (boolean|undefined),
 *     target: (Element|undefined),
 *     zoomDelta: (number|undefined)
 * }}
 * @api
 */
olpzx.control.PanZoomOptions;


/**
 * Name of the CSS class. Default is `ol-panzoom`.
 * @type {string|undefined}
 * @api
 */
olpzx.control.PanZoomOptions.prototype.className;


/**
 * Animation duration in milliseconds. Default is `100`.
 * @type {number|undefined}
 * @api
 */
olpzx.control.PanZoomOptions.prototype.duration;


/**
 * The directory that holds the images for the components.
 * @type {string|undefined}
 * @api
 */
olpzx.control.PanZoomOptions.prototype.imgPath;


/**
 * Extent to zoom to.  If set, adds the zoom to max extent button.
 * @type {ol.Extent|undefined}
 * @api
 */
olpzx.control.PanZoomOptions.prototype.maxExtent;


/**
 * Maximum zoom level of the slider. Must fit the view maximum zoom level.
 * Only required if a slider is used. Default is `19`.
 * @type {number|undefined}
 * @api
 */
olpzx.control.PanZoomOptions.prototype.maxZoom;


/**
 * Minimum zoom level of the slider. Must fit the view mininum zoom level.
 * Only required if a slider is used. Default is `0`.
 * @type {number|undefined}
 * @api
 */
olpzx.control.PanZoomOptions.prototype.minZoom;


/**
 * Pixel delta. Default is `125`.
 * @type {number|undefined}
 * @api
 */
olpzx.control.PanZoomOptions.prototype.pixelDelta;


/**
 * Whether to include a slider or not, in which case a zoom to max extent
 * button is added instead. Default is `false`.
 * @type {number|undefined}
 * @api
 */
olpzx.control.PanZoomOptions.prototype.slider;


/**
 * Target.
 * @type {Element|undefined}
 * @api
 */
olpzx.control.PanZoomOptions.prototype.target;


/**
 * Zoom delta. Default is `1`.
 * @type {number|undefined}
 * @api
 */
olpzx.control.PanZoomOptions.prototype.zomDelta;
