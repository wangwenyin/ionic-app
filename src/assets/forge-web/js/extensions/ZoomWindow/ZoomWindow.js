Autodesk.Extensions.ZoomWindow =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ({

/***/ 0:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();

	var _ZoomWindowTool = __webpack_require__(29);var _ZoomWindowTool2 = _interopRequireDefault(_ZoomWindowTool);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self, call) {if (!self) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call && (typeof call === "object" || typeof call === "function") ? call : self;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;}

	var av = Autodesk.Viewing,avp = av.Private;
	var namespace = AutodeskNamespace('Autodesk.Viewing.Extensions.ZoomWindow');var

	ZoomWindow = function (_av$Extension) {_inherits(ZoomWindow, _av$Extension);

	    function ZoomWindow(viewer, options) {_classCallCheck(this, ZoomWindow);var _this = _possibleConstructorReturn(this, (ZoomWindow.__proto__ || Object.getPrototypeOf(ZoomWindow)).call(this,
	        viewer, options));

	        Autodesk.Viewing.Extension.call(_this, viewer, options);
	        _this.createUIBound = function () {
	            viewer.removeEventListener(av.TOOLBAR_CREATED_EVENT, this.createUIBound);
	            this.createUI(this.viewer.getToolbar(false));
	        }.bind(_this);
	        _this.name = 'zoomwindow';
	        _this.modes = ['zoomwindow', 'dolly'];return _this;
	    }_createClass(ZoomWindow, [{ key: 'load', value: function load()

	        {
	            var viewer = this.viewer;

	            // Init & Register tool
	            this.tool = new _ZoomWindowTool2.default(viewer);
	            viewer.toolController.registerTool(this.tool);

	            // Add the ui to the viewer.
	            this.createUI(viewer.getToolbar(false));
	            return true;
	        } }, { key: 'createUI', value: function createUI(

	        toolbar) {
	            var navTools;
	            if (!toolbar || !(navTools = toolbar.getControl(Autodesk.Viewing.TOOLBAR.NAVTOOLSID)) || !navTools.dollybutton) {
	                // tool bars aren't built yet, wait until they are
	                this.viewer.addEventListener(av.TOOLBAR_CREATED_EVENT, this.createUIBound);
	                return;
	            }

	            var self = this;
	            // remove default zoom tool
	            navTools.removeControl(navTools.dollybutton.getId());
	            this.defaultDollyButton = navTools.dollybutton;

	            // add combo button for zoom tool
	            this.zoomWindowToolButton = new Autodesk.Viewing.UI.ComboButton('toolbar-zoomTools');
	            this.zoomWindowToolButton.setIcon('zoomwindowtoolicon-zoom-window');
	            this.zoomWindowToolButton.setToolTip('Zoom window');
	            this.createZoomSubmenu(this.zoomWindowToolButton);
	            navTools.addControl(this.zoomWindowToolButton);

	            // Escape hotkey to exit tool.
	            //
	            var hotkeys = [{
	                keycodes: [Autodesk.Viewing.KeyCode.ESCAPE],
	                onRelease: function onRelease() {
	                    if (self.zoomWindowToolButton.getState() === Autodesk.Viewing.UI.Button.State.ACTIVE) {
	                        self.viewer.setActiveNavigationTool();
	                        self.zoomWindowToolButton.setState(Autodesk.Viewing.UI.Button.State.INACTIVE);
	                    }
	                } }];

	            this.viewer.getHotkeyManager().pushHotkeys(this.escapeHotkeyId, hotkeys);
	        } }, { key: 'destroyUI', value: function destroyUI()

	        {
	            var viewer = this.viewer;
	            var toolbar = viewer.getToolbar(false);
	            if (toolbar) {
	                var navTools = toolbar.getControl(Autodesk.Viewing.TOOLBAR.NAVTOOLSID);
	                if (navTools) {
	                    if (this.zoomWindowToolButton) {
	                        this.zoomWindowToolButton.subMenu.removeEventListener(
	                        Autodesk.Viewing.UI.RadioButtonGroup.Event.ACTIVE_BUTTON_CHANGED,
	                        this.zoomWindowToolButton.subMenuActiveButtonChangedHandler(navTools));
	                        navTools.removeControl(this.zoomWindowToolButton.getId());
	                    }
	                    this.zoomWindowToolButton = null;
	                    // set back dolly button
	                    if (navTools.panbutton && this.defaultDollyButton) {
	                        navTools.addControl(this.defaultDollyButton);
	                    } else
	                    {
	                        this.defaultDollyButton = null;
	                    }
	                }
	            }
	            viewer.getHotkeyManager().popHotkeys(this.escapeHotkeyId);
	        } }, { key: 'createZoomSubmenu', value: function createZoomSubmenu(


	        parentButton) {

	            var createNavToggler = function createNavToggler(self, button, name) {
	                return function () {
	                    var state = button.getState();
	                    if (state === Autodesk.Viewing.UI.Button.State.INACTIVE) {
	                        self.activate(name);
	                        button.setState(Autodesk.Viewing.UI.Button.State.ACTIVE);
	                    } else if (state === Autodesk.Viewing.UI.Button.State.ACTIVE) {
	                        self.deactivate();
	                        button.setState(Autodesk.Viewing.UI.Button.State.INACTIVE);
	                    }
	                };
	            };

	            var viewer = this.viewer;
	            var toolbar = viewer.getToolbar(true);
	            var navTools = toolbar.getControl(Autodesk.Viewing.TOOLBAR.NAVTOOLSID);

	            // zoom window
	            var zoomWindowToolBut = new Autodesk.Viewing.UI.Button('toolbar-zoomWindowTool');
	            zoomWindowToolBut.setToolTip(Autodesk.Viewing.i18n.translate("Zoom window"));
	            zoomWindowToolBut.setIcon('zoomwindowtoolicon-zoom-window');
	            zoomWindowToolBut.onClick = createNavToggler(this, zoomWindowToolBut, 'zoomwindow');
	            parentButton.addControl(zoomWindowToolBut);
	            // zoom
	            var dollyBut = new Autodesk.Viewing.UI.Button('toolbar-zoomTool');
	            dollyBut.setToolTip('Zoom');
	            dollyBut.setIcon('adsk-icon-zoom');
	            dollyBut.onClick = createNavToggler(this, dollyBut, 'dolly');
	            parentButton.addControl(dollyBut);
	        } }, { key: 'unload', value: function unload()

	        {
	            var viewer = this.viewer;
	            if (viewer.getActiveNavigationTool() === "dolly" ||
	            viewer.getActiveNavigationTool() === "zoomwindow") {
	                viewer.setActiveNavigationTool();
	            }
	            // Remove the UI
	            this.destroyUI();
	            // Deregister tool
	            viewer.toolController.deregisterTool(this.tool);
	            this.tool = null;

	            return true;
	        } }, { key: 'activate', value: function activate(

	        mode) {
	            if (this.activeStatus && this.mode === mode) {
	                return;
	            }
	            switch (mode) {
	                default:
	                case 'zoomwindow':
	                    this.viewer.setActiveNavigationTool('zoomwindow');
	                    this.mode = 'zoomwindow';
	                    break;
	                case 'dolly':
	                    this.viewer.setActiveNavigationTool('dolly');
	                    this.mode = 'dolly';
	                    break;}

	            this.activeStatus = true;
	            return true;
	        } }, { key: 'deactivate', value: function deactivate()

	        {
	            if (this.activeStatus) {
	                this.viewer.setActiveNavigationTool();
	                this.activeStatus = false;
	            }
	            return true;
	        } }]);return ZoomWindow;}(av.Extension);exports.default = ZoomWindow;



	namespace.ZoomWindow = ZoomWindow;
	Autodesk.Viewing.theExtensionManager.registerExtension('Autodesk.Viewing.ZoomWindow', ZoomWindow);

/***/ }),

/***/ 29:
/***/ (function(module, exports) {

	'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}

	var _CROSS_MAX_WIDTH = 20;

	/**
	                            *
	                            * @constructor
	                            */var
	ZoomWindowTool = function () {

	    function ZoomWindowTool(viewer) {_classCallCheck(this, ZoomWindowTool);
	        this._names = ["zoomwindow"];
	        this._isActive = false;
	        this._isDragging = false;
	        this._mouseStart = new THREE.Vector3(0, 0, -10);
	        this._mouseEnd = new THREE.Vector3(0, 0, -10);

	        this.materialLine = null;
	        this.lineGeom = null;
	        this.crossGeomX = null;
	        this.crossGeomY = null;

	        this.rectGroup = null;
	        this.viewer = viewer;
	        this._camera = this.viewer.navigation.getCamera();
	    }_createClass(ZoomWindowTool, [{ key: "isActive", value: function isActive()

	        {
	            return this._isActive;
	        } }, { key: "getNames", value: function getNames()

	        {
	            return this._names;
	        } }, { key: "getName", value: function getName()

	        {
	            return this._names[0];
	        } }, { key: "onResize", value: function onResize()

	        {
	            this.rectGroup = null;
	            var canvas = this.viewer.canvas;
	            var canvasWidth = canvas.clientWidth;
	            var canvasHeight = canvas.clientHeight;
	            var camera = new THREE.OrthographicCamera(0, canvasWidth, 0, canvasHeight, 1, 1000);
	            this.viewer.impl.overlayScenes["ZoomWindowRect"].camera = camera;
	        } }, { key: "activate", value: function activate(

	        name) {
	            this._isActive = true;
	            // predefine material for rect
	            if (this.materialLine === null) {
	                // for 2d file draw rectangle in black
	                var rectColor = null;
	                if (this.viewer.navigation.getIs2D()) {
	                    rectColor = new THREE.Color(0x000000);
	                } else
	                {
	                    rectColor = new THREE.Color(0xffffff);
	                }
	                this.materialLine = new THREE.LineBasicMaterial({
	                    color: rectColor,
	                    opacity: .6,
	                    linewidth: 1,
	                    depthTest: false,
	                    depthWrite: false });

	                this.materialLine.doNotCut = true;
	            }
	            // create overlay scene, with orthographic Camera
	            var canvas = this.viewer.canvas;
	            var canvasWidth = canvas.clientWidth;
	            var canvasHeight = canvas.clientHeight;
	            var camera = new THREE.OrthographicCamera(0, canvasWidth, 0, canvasHeight, 1, 1000);

	            this.viewer.impl.createOverlayScene("ZoomWindowRect", this.materialLine, this.materialLine, camera);
	            this.viewer.impl.api.addEventListener(Autodesk.Viewing.VIEWER_RESIZE_EVENT, this.onResize);

	            // ??? In zoom window tool, we let orbitDollyPanTool to handle
	            // ??? pan and dolly. And also we need get correct cursor info
	            // ??? in orbitDollyPanTool. But in 2D, orbitDollyPanTool's default
	            // ??? cursor is pan, then we have no idea whether orbitDollyPanTool
	            // ??? is handling the message.
	            // ??? So set orbit tool as active tool when zoom window tool active.
	            // ??? On deactive we need set back the correct active tool to orbitDollyPanTool
	            var tool = this.viewer.toolController.getTool("dolly");
	            tool.activate("orbit");
	        } }, { key: "deactivate", value: function deactivate(

	        name) {
	            this.rectGroup = null;
	            this.viewer.impl.removeOverlayScene("ZoomWindowRect");
	            this._isActive = false;
	            this._isDragging = false;
	            this._mouseStart.set(0, 0, -10);
	            this._mouseEnd.set(0, 0, -10);
	            this.viewer.impl.api.removeEventListener(Autodesk.Viewing.VIEWER_RESIZE_EVENT, this.onResize);

	            // ??? Refer to the comments in activate
	            var tool = this.viewer.toolController.getTool("dolly");
	            tool.deactivate("orbit");
	        } }, { key: "getCursor", value: function getCursor()

	        {
	            var tool = this.viewer.toolController.getTool("dolly");
	            var mode = tool.getTriggeredMode();
	            switch (mode) {

	                case "dolly":
	                    return "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAAgVBMVEUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///8mJiYAAADNzc2/v7+fn59paWlPT08MDAwICAj6+vqpqak7Ozv29vby8vLp6em2traAgIBkZGRZWVlAQEAaGhpISEgkS7tbAAAAFHRSTlMAOvhpZD8mkQWegMy9qY1YVE01EYiqlE0AAADZSURBVCjPbY9ZloMgEAAbEbfsmRZZXbJn7n/AAX2RQVN/VD26AXLOeZLDGo6IbfI9tHq8cdxuj1HwvgCoaiHqKoRk+M3hB9jueUW8PnfsE/bJ3vms7nCkq7NoE3s99AXxoh8vFoXCpknrn5faAuJCenT0xPkYqnxQFJaU0gdZrsKm8aHZrAIffBj40mc1jsTfIJRWegq6opTMvlfqLqYg7kr1ZB7jFgeaMC59N//8O4WZ1IiPF8b5wMHcJn8zB4g4mc77zpxgAbMSUVoGK4iV0hL4wrksz+H0Bw5+E+HrniDQAAAAAElFTkSuQmCC), auto";
	                case "pan":
	                    return "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAABHVBMVEUAAABPTk4AAAAAAAAJCQkRERE0MzQQEBAODg4QEBB4d3dbWlo9PDw/Pj4vLy8sLCwZGBgWFhYcHBwKCgoSEhIAAAAKCgoICAgKCgoQEBAODg4EBAQICAgPDw8REREMDAx2dnY0NDQvLy9QUFAaGhomJSYjIyM7OjokJCQNDA0mJiYNDQ0AAAAUFBQJCQkQEBAEBAQNDQ0PDw8VFRX///+amJkAAAD5+fnz8/PKycn9/f339vbi4eLR0dDNzMyAgIB8e3xycHH7+/vw7+/o6OjX1ta7urq4t7iwsLCnp6eioqKbmppva21OTk74+Pjl5eXc3Nzb29vLy8vDw8PDwsKrqqqdnZ2WlpaSkpKTkZKMiouEg4NkZGRISEgxLzBpgbsEAAAANHRSTlMA+fiQXgngKSYG/vX17uvBuqackpCNg3BpUkpAPBwTDvj18+vl0s/NwrOwoZZ+TDg4NBkBGrzX8QAAAP5JREFUKM99j9Vuw0AQRdeuKZyGkyZNmbnXDLHDVGb8/8/oy7paK1bO0+oc7WiGnGiaxq+QRTQAOh8f9Jv4H/Ge8PZPrCdlvkxfYluUT2WyyCq3mZ7unwlKVLcqOzA/Mf71j0TWJ/Ym6rPeca05Ni4iIevYc7yoUD2zQFhq71BdI9nvBeBabFDSPe8DswlUc1Riw3VxbH0NHBUPQ0jrbDnPYDjALQBMq9E7nkC5y7VDKTZlUg8Q0lmjvl74zlYErgvKa42GPKf3/a0kQmYCDY1SYMDosqMoiWrGwz/uAbNvc/fNon4kXRKGq+PUo2Mb96afV0iUxqGU2s4VBbKUP65NL/LKF+7ZAAAAAElFTkSuQmCC), auto";}

	            return "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNui8sowAAADWSURBVEiJ1ZVNEsIwCEYfTg/UjTPuemcvojfCRRMlNKGdKguZyaLkK4/8EERVybQJQERCUU3C63p+n/Bk9QHDRtbIX2GqKh6woRfxLdL0/M1KzYRaA+7AXDW9wN5fvrXEWud6AOABLD7QwREDgCdw7WV6ZjSAsi0Lzn4JmEcHeHbYWxQXw3FTEWmvaWY1X9Iie4CIKHE1fwfIsnSAZD/X/79FGbdISyzA9QMDG3axTTTVwx3NaNbm5B2dRHY1DWCUyd4qIs0bUB8nuz32/11Cu+KPM7sOXlrOS4sOkzb1AAAAAElFTkSuQmCC), auto";
	        } }, { key: "handleGesture",

	        /////////////////////////////////////////////////////////////////////////
	        // Tool event handler callbacks - can use "this".
	        value: function handleGesture(
	        event)
	        {
	            switch (event.type) {

	                case "dragstart":
	                    return this.handleButtonDown(event, 0);

	                case "dragmove":
	                    return this.handleMouseMove(event);

	                case "dragend":
	                    return this.handleButtonUp(event, 0);}

	            return false;
	        } }, { key: "handleSingleClick", value: function handleSingleClick(

	        event, button) {
	            return true;
	        } }, { key: "startDrag", value: function startDrag(

	        event) {
	            if (this._isDragging === false) {
	                // begin dragging
	                this._isDragging = true;
	                this._mouseStart.x = event.canvasX;
	                this._mouseStart.y = event.canvasY;
	                this._mouseEnd.x = event.canvasX;
	                this._mouseEnd.y = event.canvasY;
	                if (this.rectGroup === null) {
	                    this.lineGeom = new THREE.Geometry();
	                    // rectangle of zoom window
	                    this.lineGeom.vertices.push(
	                    this._mouseStart.clone(),
	                    this._mouseStart.clone(),
	                    this._mouseStart.clone(),
	                    this._mouseStart.clone(),
	                    this._mouseStart.clone());
	                    // cross for identify zoom window center.
	                    this.crossGeomX = new THREE.Geometry();
	                    this.crossGeomX.vertices.push(
	                    this._mouseStart.clone(),
	                    this._mouseStart.clone());
	                    this.crossGeomY = new THREE.Geometry();
	                    this.crossGeomY.vertices.push(
	                    this._mouseStart.clone(),
	                    this._mouseStart.clone());

	                    // add geom to group
	                    var line_mesh = new THREE.Line(this.lineGeom, this.materialLine, THREE.LineStrip);
	                    var line_cross_x = new THREE.Line(this.crossGeomX, this.materialLine, THREE.LineStrip);
	                    var line_cross_y = new THREE.Line(this.crossGeomY, this.materialLine, THREE.LineStrip);

	                    this.rectGroup = new THREE.Group();
	                    this.rectGroup.add(line_mesh);
	                    this.rectGroup.add(line_cross_x);
	                    this.rectGroup.add(line_cross_y);
	                } else
	                {
	                    this.lineGeom.vertices[0] = this._mouseStart.clone();
	                    this.lineGeom.vertices[1] = this._mouseStart.clone();
	                    this.lineGeom.vertices[2] = this._mouseStart.clone();
	                    this.lineGeom.vertices[3] = this._mouseStart.clone();
	                    this.lineGeom.vertices[4] = this._mouseStart.clone();

	                    this.crossGeomX.vertices[0] = this._mouseStart.clone();
	                    this.crossGeomX.vertices[1] = this._mouseStart.clone();
	                    this.crossGeomY.vertices[0] = this._mouseStart.clone();
	                    this.crossGeomY.vertices[1] = this._mouseStart.clone();


	                    this.crossGeomX.verticesNeedUpdate = true;
	                    this.crossGeomY.verticesNeedUpdate = true;
	                    this.lineGeom.verticesNeedUpdate = true;
	                }
	                this.viewer.impl.addOverlay("ZoomWindowRect", this.rectGroup);
	            }
	        } }, { key: "handleButtonDown", value: function handleButtonDown(

	        event, button) {
	            // only handle left button down
	            if (button === 0) {
	                this.startDrag(event);
	                return true;
	            }
	            return false;
	        } }, { key: "handleMouseMove", value: function handleMouseMove(

	        event) {
	            if (this.lineGeom && this._isDragging)
	            {
	                this._mouseEnd.x = event.canvasX;
	                this._mouseEnd.y = event.canvasY;
	                return true;
	            }

	            return false; // Eat all these so default tools don't screw with view
	        } }, { key: "endDrag", value: function endDrag(

	        event) {
	            if (this._isDragging === true) {
	                this.viewer.impl.removeOverlay("ZoomWindowRect", this.rectGroup);
	                this._isDragging = false;

	            }
	        } }, { key: "handleButtonUp", value: function handleButtonUp(

	        event, button) {
	            if (button === 0)
	            {
	                this.endDrag();
	                return true;
	            }
	            return false;
	        } }, { key: "handleKeyDown", value: function handleKeyDown(

	        event, keyCode) {
	            return false;
	        } }, { key: "handleKeyUp", value: function handleKeyUp(

	        event, keyCode) {
	            return false;
	        } }, { key: "handleWheelInput", value: function handleWheelInput(

	        delta) {
	            return false;
	        } }, { key: "handleSingleClick", value: function handleSingleClick(

	        event, button) {
	            return false;
	        } }, { key: "handleDoubleClick", value: function handleDoubleClick(

	        event, button) {
	            return false;
	        } }, { key: "handleSingleTap", value: function handleSingleTap(

	        even) {
	            return false;
	        } }, { key: "handleDoubleTap", value: function handleDoubleTap(

	        event) {
	            return false;
	        } }, { key: "handleBlur", value: function handleBlur(

	        event) {
	            return false;
	        } }, { key: "update", value: function update()

	        {
	            //
	            if (!this.isActive())
	            return;

	            if (this.lineGeom && this._isDragging) {
	                // draw rectangle
	                this.lineGeom.vertices[1].x = this._mouseStart.x;
	                this.lineGeom.vertices[1].y = this._mouseEnd.y;
	                this.lineGeom.vertices[2] = this._mouseEnd.clone();
	                this.lineGeom.vertices[3].x = this._mouseEnd.x;
	                this.lineGeom.vertices[3].y = this._mouseStart.y;
	                this.lineGeom.vertices[4] = this.lineGeom.vertices[0];

	                // draw cross
	                var width = Math.abs(this._mouseEnd.x - this._mouseStart.x);
	                var height = Math.abs(this._mouseEnd.y - this._mouseStart.y);
	                var length = width > height ? height : width;
	                if (length > _CROSS_MAX_WIDTH) {
	                    length = _CROSS_MAX_WIDTH;
	                }
	                var half_length = length * 0.5;

	                var cross_center = [(this._mouseEnd.x + this._mouseStart.x) * 0.5,
	                (this._mouseEnd.y + this._mouseStart.y) * 0.5];

	                this.crossGeomX.vertices[0].x = cross_center[0] - half_length;
	                this.crossGeomX.vertices[0].y = cross_center[1];
	                this.crossGeomX.vertices[1].x = cross_center[0] + half_length;
	                this.crossGeomX.vertices[1].y = cross_center[1];

	                this.crossGeomY.vertices[0].x = cross_center[0];
	                this.crossGeomY.vertices[0].y = cross_center[1] - half_length;
	                this.crossGeomY.vertices[1].x = cross_center[0];
	                this.crossGeomY.vertices[1].y = cross_center[1] + half_length;

	                this.crossGeomX.verticesNeedUpdate = true;
	                this.crossGeomY.verticesNeedUpdate = true;
	                this.lineGeom.verticesNeedUpdate = true;
	                // only redraw overlay
	                this.viewer.impl.invalidate(false, false, true);
	            } else
	            {
	                return this.zoomWindow();
	            }

	            return false;
	        } }, { key: "getPivot", value: function getPivot(

	        mouseX, mouseY, screenWidth, screenHeight, camera) {
	            // Convert mouse coordinates to clip space (-1 to 1)
	            mouseX = 2 * mouseX / screenWidth - 1;
	            mouseY = 1 - 2 * mouseY / screenHeight;

	            // Get the ray through mouseX, mouseY
	            var start = new THREE.Vector3(mouseX, mouseY, -1);
	            var dir = new THREE.Vector3(mouseX, mouseY, 1);
	            start.unproject(camera);
	            dir.unproject(camera);
	            dir.sub(start);

	            // Now project the ray onto the plane perpendicular to the view direction
	            // that contains the camera target. To do this we solve these equations:
	            // viewDir.dot(pivot) == viewDir.dot(target), because the pivot is in the plane of the target
	            // pivot = start + t * dir for some t, because pivot is on the ray through mouseX, mouseY
	            // The solution goes like this:
	            // Substitute pivot from the second equation to the first
	            // viewDir.dot(start + t * dir) == viewDir.dot(target)
	            // Distribut dot()
	            // viewDir.dot(start) + t * viewDir.dot(dir) == view.dot(target)
	            // t = (viewDir.dot(target) - viewDir.dot(start)) / view.dot(dir)
	            var eye = camera.position;
	            var target = camera.target;
	            var viewDir = target.clone().sub(eye).normalize();
	            var t = (viewDir.dot(target) - viewDir.dot(start)) / viewDir.dot(dir);
	            start.add(dir.multiplyScalar(t));
	            return start;
	        } }, { key: "queryMouseRaySceneIntersection", value: function queryMouseRaySceneIntersection(

	        centerX, centerY) {
	            if (this.viewer == null)
	            return null;

	            if (this.viewer.model == null)
	            return null;

	            if (this.viewer.model.is2d()) {
	                return null;
	            }

	            var result = this.viewer.impl.hitTest(centerX, centerY, false);
	            return result ? result.intersectPoint : null;
	        } }, { key: "zoomWindow", value: function zoomWindow()

	        {
	            var camera = this._camera;
	            var canvasWidth = this.viewer.canvas.clientWidth;
	            var canvasHeight = this.viewer.canvas.clientHeight;
	            var rectMinX = this._mouseStart.x;
	            var rectMinY = this._mouseStart.y;
	            var rectMaxX = this._mouseEnd.x;
	            var rectMaxY = this._mouseEnd.y;

	            var rectWidth = Math.abs(rectMaxX - rectMinX);
	            var rectHeight = Math.abs(rectMaxY - rectMinY);
	            if (rectWidth === 0 || rectHeight === 0) {
	                return false;
	            }

	            this._mouseEnd.copy(this._mouseStart);

	            if (this.viewer.navigation.getIs2D()) {
	                var vpVec = {
	                    x: (rectMinX + rectMaxX) * 0.5,
	                    y: (rectMinY + rectMaxY) * 0.5 };


	                // Pan to the center of the zoom window first.
	                var distance = this.viewer.navigation.getEyeVector().length();
	                var delta = this.viewer.impl.clientToViewport(vpVec.x, vpVec.y);
	                var on = this.viewer.impl.clientToViewport(canvasWidth / 2, canvasHeight / 2);
	                delta.subVectors(delta, on);
	                this.viewer.navigation.panRelative(delta.x / 2, delta.y / 2, distance);

	                // Get scale
	                var scaleX = rectWidth / canvasWidth;
	                var scaleY = rectHeight / canvasHeight;
	                var scale = scaleX > scaleY ? scaleX : scaleY;

	                // Dolly
	                distance = this.viewer.navigation.getEyeVector().length();
	                var dollyTarget = this.viewer.navigation.getWorldPoint(0.5, 0.5);
	                this.viewer.navigation.dollyFromPoint(distance * (scale - 1), dollyTarget);

	                return true;
	            }

	            // ??? Should pick with rect first but currently LMV doesn't support rectangle selection
	            // ??? So, do hit test only
	            var hit = false;
	            var pivot = null;
	            // if pick up nothing, try ray pick
	            if (!hit) {
	                var centerX = (rectMinX + rectMaxX) * 0.5;
	                var centerY = (rectMinY + rectMaxY) * 0.5;
	                pivot = this.queryMouseRaySceneIntersection(centerX, centerY);
	                // if pick up nothing, set pivot as intersection point from screen ray to project plane.
	                if (pivot === null) {
	                    pivot = this.getPivot(centerX, centerY, canvasWidth, canvasHeight, this._camera);
	                }
	            }

	            // calculate the basis vectors for the camera frame
	            var eye = camera.position;
	            var viewDir = camera.target.clone().sub(eye);
	            viewDir.normalize();

	            // calculate z camera translation for pan and zoom
	            var scaleFactor = Math.min(canvasWidth / rectWidth, canvasHeight / rectHeight);
	            var distEye2Pivot = pivot.distanceTo(eye);
	            var zoomDist = distEye2Pivot * 1 / scaleFactor;

	            // Calculate the new eye. The pivot is the new target.
	            viewDir.multiplyScalar(-zoomDist);
	            viewDir.add(pivot);

	            camera.position.set(viewDir.x, viewDir.y, viewDir.z);
	            camera.target.set(pivot.x, pivot.y, pivot.z);
	            camera.dirty = true;

	            return true;
	        } }]);return ZoomWindowTool;}();exports.default = ZoomWindowTool;

/***/ })

/******/ });