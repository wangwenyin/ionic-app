(function(){

AutodeskNamespace('Autodesk.Viewing.Extensions.GamepadModule');

/***
* GamepadModule is a tool (not an extension) that reacts to input from
* a gamepad controller plugged into the hosting machine.
 *
* @param viewerapi
* @constructor
*/
Autodesk.Viewing.Extensions.GamepadModule = function ( viewerapi ) {

    var avp = Autodesk.Viewing.Private;

    var _navapi = viewerapi.navigation;
    var _container = viewerapi.container;
    var _camera = _navapi.getCamera();

    var _modelScaleFactor = 1.0;

    var _explodeSpeed = 0;

    var _THRESHOLD = 0.1;
    var _SPEED_ADJUST = 5.5,
        _INITIAL_SPEED_SCALAR = 6,
        _speed_scalar = _INITIAL_SPEED_SCALAR;


    var _btnPressMap = {};
    var _gamepad;
    var _hudMessageStartShowTime;
    var _hudMessageShowTime;
    var _viewerState;
    var _savepoints;
    var _nextsavepoint;

    //Nav mode toggle
    var _lockInPlane;

    var _clock = new THREE.Clock(true);

    var VIEWER_STATE_FILTER = {
        seedURN: false,
        objectSet: true,
        viewport: true,
        renderOptions: {
            environment: false,
            ambientOcclusion: false,
            toneMap: {
                exposure: false
            },
            appearance: false
        }
    };
    var _actualMoveSpeed;
    var _movementSpeed = 2.0;
    var _INITIAL_FOV = 75;
    var _ZOOM_SCALAR = -45;//smaller => closer zoom
    var _altitudeLockCoord;
    var _currentTool;

    /*Face Buttons*/
    var _BUTTONS = {
        SOUTH_BTN : 0,
        EAST_BTN : 1,
        WEST_BTN : 2,
        NORTH_BTN : 3,

        /*Shoulder and trigger buttons*/
        LEFT_SHOULDER : 4,
        RIGHT_SHOULDER : 5,
        LEFT_TRIGGER : 6,//ANALOG
        RIGHT_TRIGGER : 7,//ANALOG

        /*directional pad (DPad)*/
        SOUTH_DPAD : 13,
        EAST_DPAD : 15,
        WEST_DPAD : 14,
        NORTH_DPAD : 12,

        /*Joystick buttons (press joystick in)*/
        LEFT_STICK_BUTTON: 10,
        RIGHT_STICK_BUTTON: 11

    };

    var _STICKS = {
        //Axis//
        /*Left and right joysticks*/
        LEFT_STICK_X : 0,//ANALOG
        LEFT_STICK_Y : 1,//ANALOG
        RIGHT_STICK_X : 2,//ANALOG
        RIGHT_STICK_Y : 3//ANALOG
    };

    var _BLANK_FUNC = function() {};
    var _BUTTON_MAPPING = {};
    for (var k in _BUTTONS) {
        if(_BUTTONS.hasOwnProperty(k))
            _BUTTON_MAPPING[_BUTTONS[k]] = _BLANK_FUNC;
    }

    var init = function() {

    };

    this.activate = function (toolName) {
        // Calculate a movement scale factor based on the model bounds.
        var boundsSize = viewerapi.model.getBoundingBox().size();
        _modelScaleFactor = Math.max(Math.min(Math.min(boundsSize.x, boundsSize.y), boundsSize.z) / 10.0, 0.0001);
        _gamepad = navigator.getGamepads()[0];
        _viewerState = new Autodesk.Viewing.Private.ViewerState(viewerapi);
        _savepoints = [];
        _nextsavepoint = 0;
        _currentTool = toolName;
        setMapping(toolName);
    };

    this.deactivate = function(){
        //console.log("DEACTIVATE");
        _currentTool = null;
        _viewerState = null;
    };

    this.update = function (delta, camera) {

        if(camera)
            _camera = camera;
        delta = _clock.getDelta();

        //poll for gamepad connection
        _gamepad = navigator.getGamepads()[0];

        if (_hudMessageStartShowTime > -1) {
            var curTime = new Date().getTime();
            if (curTime - _hudMessageStartShowTime > _hudMessageShowTime) { // seconds
                hideHUD();
            }
        }

        if(_gamepad) {
            _actualMoveSpeed = delta * _movementSpeed * _modelScaleFactor * _speed_scalar;// (_gamepad.buttons[_BUTTONS.RIGHT_TRIGGER].value > _THRESHOLD ? _SPEED_ADJUST * _gamepad.buttons[_BUTTONS.RIGHT_TRIGGER].value + _MAX_SPEED_SCALAR : _MAX_SPEED_SCALAR);
            // From the Collaboration extension:
            //the "go home" call may change the camera back to ortho... and we can't do ortho while walking...
            //HACK: Really, the home view should be set once when launch the extension, then set it back.
            if (!_camera.isPerspective) {
                //console.log("Lost perspective mode: resetting view.");
                _navapi.toPerspective();
            }
            if (_gamepad) {//TODO test for connection (change of state?)
                if (inputDetected()) {//need to update camera scene
                   // console.log("needs update");
                    _camera.dirty = true;
                    if (_lockInPlane) {
                        _altitudeLockCoord = _camera.position.z;
                    }

                    var direction = _camera.target.clone().sub(_camera.position);
                    var distance = direction.length();
                    direction.multiplyScalar(1.0 / distance);
                    var right = direction.clone().cross(_camera.up).normalize();
                    if (Math.abs(_gamepad.axes[_STICKS.LEFT_STICK_Y]) > _THRESHOLD) {
                        var forwardMove = direction.clone().multiplyScalar(-_gamepad.axes[_STICKS.LEFT_STICK_Y] * _actualMoveSpeed);
                        _camera.position.add(forwardMove);
                        _camera.target.add(forwardMove);
                    }

                    if (Math.abs(_gamepad.axes[_STICKS.LEFT_STICK_X]) > _THRESHOLD) {
                        var strafeMove = right.clone().multiplyScalar(_gamepad.axes[_STICKS.LEFT_STICK_X] * _actualMoveSpeed);
                        _camera.position.add(strafeMove);
                        _camera.target.add(strafeMove);
                    }

                    var lookUpDown = new THREE.Quaternion();
                    var ndir = direction;
                    if (Math.abs(_gamepad.axes[_STICKS.RIGHT_STICK_Y]) > _THRESHOLD) {

                        var tempCam = _camera.clone();//modify this camera to see if it will be in viable range
                        var tempDir = direction.clone();

                        lookUpDown.setFromAxisAngle(right, -_gamepad.axes[_STICKS.RIGHT_STICK_Y] * _actualMoveSpeed / 2);//lookscale

                        tempDir.applyQuaternion(lookUpDown);
                        tempCam.up.applyQuaternion(lookUpDown);
                        var vertical = tempCam.worldup.clone();
                        var vertAngle = tempDir.angleTo(vertical);
                        var vertLimit = THREE.Math.degToRad(5);

                        // If new angle is within limits then update values; otherwise ignore
                        if ( vertAngle >= vertLimit && vertAngle <= (Math.PI - vertLimit) ) {
                            ndir = direction.clone().applyQuaternion(lookUpDown);
                            _camera.up.applyQuaternion(lookUpDown);
                        }
                    }

                    var lookLeftRight = new THREE.Quaternion();
                    if (Math.abs(_gamepad.axes[_STICKS.RIGHT_STICK_X]) > _THRESHOLD) {
                        lookLeftRight.setFromAxisAngle(_camera.worldup, -_gamepad.axes[_STICKS.RIGHT_STICK_X] * _actualMoveSpeed / 2);//lookscale
                        ndir.applyQuaternion(lookLeftRight);
                        _camera.up.applyQuaternion(lookLeftRight);
                    }

                    /*HANDLE ALL BUTTON INPUTS*/
                    handleGamepadFaceButtons();
                    /**************************/

                    if (_lockInPlane)
                        _camera.position.z = _altitudeLockCoord;

                    ndir.multiplyScalar(distance);
                    _camera.target.copy(_camera.position).add(ndir);
                }
            }
        }
        return _camera;
    };


    // Show a HUD for a specific amount of time (showDelay > 0) or until closed.
    var showHUD = function(messageSpecs, showDelay, closeCB, buttonCB, checkboxCB)
    {
        Autodesk.Viewing.Private.HudMessage.displayMessage(_container, messageSpecs, closeCB, buttonCB, checkboxCB);

        if (showDelay > 0) {
            _hudMessageStartShowTime = new Date().getTime();
            _hudMessageShowTime = showDelay;
        }
        else {
            _hudMessageStartShowTime = -1;
            _hudMessageShowTime = 0;
        }
    };

    var hideHUD = function()
    {
        Autodesk.Viewing.Private.HudMessage.dismiss();  // in case it's still visible
        _hudMessageStartShowTime = -1;
    };

    var showDPadHud = function(direction)
    {
        hideHUD();
        var message;
        switch(direction) {
            case "up":
                message = _lockInPlane ? "Vertical Lock Mode" : "Fly mode"; break;
            case "left":
                break;
            case "right":
                break;
            case "down":
                break;
        }

        var messageSpecs = {
            "msgTitleKey"   : "View Orientation Drag Mode Toggled",
            "messageKey"    : "View Orientation Drag Mode Toggled",
            "messageDefaultValue"  : message

        };
        showHUD(messageSpecs, 2000);//show hud for 2secs

    };

    //checks for any button doing anything important
    function inputDetected(){
        //check to see if we pressed a button last frame
        //loop through mapping to only check buttons we care about
        for (var btn in _BUTTON_MAPPING) {
            if (_BUTTON_MAPPING.hasOwnProperty(btn)) {
                if(_gamepad.buttons[btn].pressed){
                    if(_gamepad.buttons[btn].value != 0.5) {
                        _btnPressMap[btn] = true;//its pressed!
                        return true;
                    }
                }
            }
        }
        for (var btn in _btnPressMap) {
            if (_btnPressMap.hasOwnProperty(btn)) {
                if(_btnPressMap[btn]){
                    //_btnPressMap[btn] = false;//
                    return true;
                }
            }
        }
        //now check movement
        return !(Math.abs(_gamepad.axes[_STICKS.LEFT_STICK_X]) < _THRESHOLD &&
                Math.abs(_gamepad.axes[_STICKS.LEFT_STICK_Y]) < _THRESHOLD &&
                Math.abs(_gamepad.axes[_STICKS.RIGHT_STICK_X]) < _THRESHOLD &&
                Math.abs(_gamepad.axes[_STICKS.RIGHT_STICK_Y]) < _THRESHOLD);

    }

    /*
    will check face buttons (including Directional Pad) for input
     */
    function handleGamepadFaceButtons(){
        for(var btn in _BUTTONS){
            if(_BUTTONS.hasOwnProperty(btn)){
                handleGamepadButton(_BUTTONS[btn]);
            }
        }
    }

    function handleGamepadButton(buttonIdx) {
        //buttons in first IF are testing for being held (good for analog inputs and held down buttons)
        //ELSE IF will activate upon RELEASE of a button
        if (_gamepad.buttons[buttonIdx].value > _THRESHOLD) {
            _btnPressMap[buttonIdx] = true;//set was_pressed
            switch (buttonIdx) {
                case _BUTTONS.LEFT_SHOULDER:
                    _BUTTON_MAPPING[buttonIdx](); break;
                case _BUTTONS.RIGHT_SHOULDER:
                    _BUTTON_MAPPING[buttonIdx](); break;
                case _BUTTONS.LEFT_TRIGGER:
                    _BUTTON_MAPPING[buttonIdx](_gamepad.buttons[_BUTTONS.LEFT_TRIGGER].value); break;
                case _BUTTONS.RIGHT_TRIGGER:
                    _BUTTON_MAPPING[buttonIdx](_gamepad.buttons[_BUTTONS.RIGHT_TRIGGER].value); break;
            }
        }
        //ON RELEASE
        else if (_btnPressMap[buttonIdx]) {
            _btnPressMap[buttonIdx] = false;
            switch (buttonIdx) {
                case _BUTTONS.SOUTH_BTN:
                    _BUTTON_MAPPING[buttonIdx](); break;
                case _BUTTONS.EAST_BTN:
                    _BUTTON_MAPPING[buttonIdx](); break;
                case _BUTTONS.WEST_BTN:
                    _BUTTON_MAPPING[buttonIdx](); break;
                case _BUTTONS.NORTH_BTN:
                    _BUTTON_MAPPING[buttonIdx](); break;
                case _BUTTONS.NORTH_DPAD:
                    _BUTTON_MAPPING[buttonIdx](); break;
                case _BUTTONS.SOUTH_DPAD:
                    _BUTTON_MAPPING[buttonIdx](); break;
                case _BUTTONS.WEST_DPAD:
                    _BUTTON_MAPPING[buttonIdx](); break;
                case _BUTTONS.EAST_DPAD:
                    _BUTTON_MAPPING[buttonIdx](); break;
                case _BUTTONS.RIGHT_STICK_BUTTON:
                    _BUTTON_MAPPING[buttonIdx](); break;
                case _BUTTONS.LEFT_STICK_BUTTON:
                    _BUTTON_MAPPING[buttonIdx](); break;
                case _BUTTONS.LEFT_TRIGGER:
                    _BUTTON_MAPPING[buttonIdx](_gamepad.buttons[_BUTTONS.LEFT_TRIGGER].value); break;
                case _BUTTONS.RIGHT_TRIGGER:
                    _BUTTON_MAPPING[buttonIdx](_gamepad.buttons[_BUTTONS.RIGHT_TRIGGER].value); break;
            }
        }
    }

    var setMapping = function(mapping){
        switch(mapping) {
            case "headtracker":
                _BUTTON_MAPPING[_BUTTONS.SOUTH_BTN] = selectObject;
                _BUTTON_MAPPING[_BUTTONS.SOUTH_DPAD] = goHome;
                _BUTTON_MAPPING[_BUTTONS.NORTH_DPAD] = toggleNavMode;
                _BUTTON_MAPPING[_BUTTONS.WEST_BTN] = hideObject;
                _BUTTON_MAPPING[_BUTTONS.LEFT_SHOULDER] = decAltitude;
                _BUTTON_MAPPING[_BUTTONS.RIGHT_SHOULDER] = incAltitude;
                _BUTTON_MAPPING[_BUTTONS.LEFT_TRIGGER] = explode;
                _BUTTON_MAPPING[_BUTTONS.RIGHT_TRIGGER] = fineSpeedAdjust;
                _BUTTON_MAPPING[_BUTTONS.RIGHT_STICK_BUTTON] = deselectAll;
                _BUTTON_MAPPING[_BUTTONS.LEFT_STICK_BUTTON] = unhideAll;
                break;
            default:
                _BUTTON_MAPPING[_BUTTONS.SOUTH_BTN] = selectObject;
                _BUTTON_MAPPING[_BUTTONS.EAST_BTN] = createSavePoint;
                _BUTTON_MAPPING[_BUTTONS.WEST_BTN] = hideObject;
                _BUTTON_MAPPING[_BUTTONS.NORTH_BTN] = showPropertyPanel;
                _BUTTON_MAPPING[_BUTTONS.SOUTH_DPAD] = goHome;
                _BUTTON_MAPPING[_BUTTONS.WEST_DPAD] = previousSavePoint;
                _BUTTON_MAPPING[_BUTTONS.EAST_DPAD] = nextSavePoint;
                _BUTTON_MAPPING[_BUTTONS.NORTH_DPAD] = toggleNavMode;
                _BUTTON_MAPPING[_BUTTONS.LEFT_SHOULDER] = decAltitude;
                _BUTTON_MAPPING[_BUTTONS.RIGHT_SHOULDER] = incAltitude;
                _BUTTON_MAPPING[_BUTTONS.LEFT_TRIGGER] = triggerZoom;
                _BUTTON_MAPPING[_BUTTONS.RIGHT_TRIGGER] = fineSpeedAdjust;
                _BUTTON_MAPPING[_BUTTONS.RIGHT_STICK_BUTTON] = deselectAll;
                _BUTTON_MAPPING[_BUTTONS.LEFT_STICK_BUTTON] = unhideAll;
                break;
        }
    };

    //things buttons can do below
    var goHome = function(){
        viewerapi.navigation.setRequestHomeView(true);
        viewerapi.showAll();
        viewerapi.impl.selector.clearSelection();
        viewerapi.explode(0);
    };

    //Shoulder buttons and triggers
    var decAltitude = function() {
        if (_lockInPlane)
            _altitudeLockCoord += (-_gamepad.buttons[_BUTTONS.LEFT_SHOULDER].pressed) * _actualMoveSpeed;
        else
            _camera.translateY(-_gamepad.buttons[_BUTTONS.LEFT_SHOULDER].pressed * _actualMoveSpeed);
    };

    var incAltitude = function() {
        if (_lockInPlane)
            _altitudeLockCoord += (_gamepad.buttons[_BUTTONS.RIGHT_SHOULDER].pressed) * _actualMoveSpeed;
        else
            _camera.translateY(_gamepad.buttons[_BUTTONS.RIGHT_SHOULDER].pressed * _actualMoveSpeed);
    };

    var explode = function(analog_value){
        if (analog_value > _THRESHOLD) {
            if (analog_value == 0.5) {//not set yet
                viewerapi.explode(0);
                return;
            }
            _explodeSpeed = analog_value;
            var ns = _explodeSpeed;
            if (ns > 1) ns = 1;
            if (ns < 0) ns = 0;
            viewerapi.explode(ns);
        }
        else
            viewerapi.explode(0);
    };


    //Triggers are analog, so pass in value of trigger
    var triggerZoom = function(analog_value){
        if (analog_value > _THRESHOLD) {
            if(analog_value == 0.5) {
                _camera.fov = _INITIAL_FOV;
                _btnPressMap[_BUTTONS.LEFT_TRIGGER] = false;
                return;
            }
            //linear interp: y = -40x + 75
            ///75 is original fov angle. smaller slope = greater max zoom.
            // equation will interpolate between based on trigger pressure (analog)
            _camera.fov = _ZOOM_SCALAR * analog_value + _INITIAL_FOV;
        }
        else {
            _camera.fov = _INITIAL_FOV;//originally 75
        }
    };

    var fineSpeedAdjust = function(analog_value){
        if(analog_value > _THRESHOLD){
            if(analog_value == 0.5) {//ignore
                //TODO set speed correctly before input received AND have whole speedadjust down here!!
                _btnPressMap[_BUTTONS.RIGHT_TRIGGER] = false;
                return;
            }
            _speed_scalar = -(_SPEED_ADJUST * analog_value) + _INITIAL_SPEED_SCALAR;
        }
        else{
            _speed_scalar = _INITIAL_SPEED_SCALAR;
        }

    };

    var createSavePoint = function(){
        var state = _viewerState.getState(VIEWER_STATE_FILTER);
        _savepoints.push(state);
        avp.logger.log("Savepoint created.");
    };

    var previousSavePoint = function(){
        if (_savepoints.length) {
            _nextsavepoint--;
            if (_nextsavepoint < 0)
                _nextsavepoint = _savepoints.length - 1;
            _viewerState.restoreState(_savepoints[_nextsavepoint]);
        }
    };

    var nextSavePoint = function(){
        if (_savepoints.length) {
            _nextsavepoint++;
            if (_nextsavepoint >= _savepoints.length)
                _nextsavepoint = 0;
            _viewerState.restoreState(_savepoints[_nextsavepoint]);
        }
    };

    var selectObject = function(){
        var res = viewerapi.impl.hitTestViewport(new THREE.Vector3(0, 0, 0));
        if(_currentTool == "headtracker"){
            //vr tool forgets to do this, necessary for center selection
            _camera.updateMatrixWorld();
        }
        if (res) {
            viewerapi.impl.selector.toggleSelection(res.dbId, res.model);
            //viewerapi.fitToView(res.dbId);
        } else {
            viewerapi.impl.selector.clearSelection();
        }
    };

    var deselectAll = function() {
        viewerapi.impl.selector.clearSelection();
    };

    var unhideAll = function() {
        viewerapi.showAll();
        viewerapi.impl.selector.clearSelection();
        viewerapi.explode(0);
    };

    var hideObject = function(){
        var res = viewerapi.impl.hitTestViewport(new THREE.Vector3(0, 0, 0), false);
        if (res) {
            if (res.dbId in viewerapi.getHiddenNodes())
                viewerapi.show(res.dbId);
            else
                viewerapi.hide(res.dbId);
        }
    };

    var showPropertyPanel = function(){
        viewerapi.getPropertyPanel(true).setVisible(!viewerapi.getPropertyPanel(true).isVisible());
    };

    var toggleNavMode = function(){
        _lockInPlane = !_lockInPlane;
        if(_lockInPlane)
            _altitudeLockCoord = _camera.position.z;
        showDPadHud("up");
    };

    init();
};

})(); // closure


(function() {

//
// First Person
//

'use strict';

AutodeskNamespace('Autodesk.Viewing.Extensions.FirstPerson');

    /**
     * First Person navigation tool, similar to those found in videogames.
     *
     * It will also replace the default walk tool button when {@link Autodesk.Viewing.GuiViewer3D} is present.
     * @constructor
     * @extends {Autodesk.Viewing.Extension}
     * @param {Autodesk.Viewing.Viewer3D} viewer - Viewer instance.
     * @param {object} options - Not used.
     * @category Extensions
     */
Autodesk.Viewing.Extensions.FirstPerson.FirstPersonExtension = function(viewer, options) {
    Autodesk.Viewing.Extension.call(this, viewer, options);
    this.name = "firstperson";
};

Autodesk.Viewing.Extensions.FirstPerson.FirstPersonExtension.prototype = Object.create(Autodesk.Viewing.Extension.prototype);
Autodesk.Viewing.Extensions.FirstPerson.FirstPersonExtension.prototype.constructor = Autodesk.Viewing.Extensions.FirstPerson.FirstPersonExtension;

var proto = Autodesk.Viewing.Extensions.FirstPerson.FirstPersonExtension.prototype;

proto.load = function() {
    var self = this;
    var viewer = this.viewer;
    var avu = Autodesk.Viewing.UI;

    // Register tool
    this.tool = new Autodesk.Viewing.Extensions.FirstPerson.FirstPersonTool(viewer);
    viewer.toolController.registerTool(this.tool);

    // Add the ui to the viewer.
    this.createUI();
    // Register listeners
    this.onToolChanged = function (e) {
        if (e.toolName.indexOf('firstperson') === -1) {
            return;
        }
        if (self.firstPersonToolButton) {
            var state = e.active ? avu.Button.State.ACTIVE : avu.Button.State.INACTIVE;
            self.firstPersonToolButton.setState(state);
        }
    };

    viewer.addEventListener(Autodesk.Viewing.TOOL_CHANGE_EVENT, this.onToolChanged);

    return true;
};

proto.createUI = function()
{
    var viewer = this.viewer;
    if (!viewer.getToolbar) return; // Adds support for Viewer3D instance

    var self   = this;
    var avu = Autodesk.Viewing.UI;
    var toolbar = viewer.getToolbar(true);
    var navTools = toolbar.getControl(Autodesk.Viewing.TOOLBAR.NAVTOOLSID);

    // Create a button for the tool.
    this.firstPersonToolButton = new avu.Button('toolbar-firstPersonTool');
    this.firstPersonToolButton.setToolTip('First person');
    this.firstPersonToolButton.onClick = function(e) {
        if(self.activeStatus) {
            self.deactivate();
        }
        else {
            self.activate();
        }
    };
    this.firstPersonToolButton.setIcon("adsk-icon-first-person");

    var cameraSubmenuTool = navTools.getControl('toolbar-cameraSubmenuTool');
    if (cameraSubmenuTool) {
        navTools.addControl(this.firstPersonToolButton, {index: navTools.indexOf(cameraSubmenuTool.getId())});
    } else {
        navTools.addControl(this.firstPersonToolButton);
    }
};

proto.unload = function() {
    var viewer = this.viewer;

    // Remove listeners
    viewer.removeEventListener(Autodesk.Viewing.TOOL_CHANGE_EVENT, this.onToolChanged);
    this.onToolChanged = undefined;

    // Remove hotkey
    viewer.getHotkeyManager().popHotkeys(this.HOTKEYS_ID);

    // Remove the UI
    if (this.firstPersonToolButton) {
        var toolbar = viewer.getToolbar(false);
        if (toolbar) {
            toolbar.getControl(Autodesk.Viewing.TOOLBAR.NAVTOOLSID).removeControl(this.firstPersonToolButton.getId());
        }
        this.firstPersonToolButton = null;
    }

    //Uh, why does the viewer need to keep track of this in addition to the tool stack?
    if (viewer.getActiveNavigationTool() == this.tool.getName())
        viewer.setActiveNavigationTool();

    // Deregister tool
    viewer.toolController.deregisterTool(this.tool);
    this.tool = null;

    return true;
};

proto.activate = function () {
    if(!this.activeStatus) {
        this.viewer.setActiveNavigationTool("firstperson");
        this.activeStatus = true;
    }
    return true;
};
proto.deactivate= function() {
    if(this.activeStatus) {
        this.viewer.setActiveNavigationTool();
        this.activeStatus = false;
    }
    return true;
};

Autodesk.Viewing.theExtensionManager.registerExtension('Autodesk.FirstPerson', Autodesk.Viewing.Extensions.FirstPerson.FirstPersonExtension);


})();

(function() {

    /*
     * First Person View tool for LMV
     *
     * This tool provides a first person view with movement using the standard WASD keys
     * to forward/backward/left/right and the QE keys to move vertically.  The mouse or
     * cursor is used to orient the view.  Movement is always along or perpendicular to
     * the view direction.
     *
     * The SHIFT key may be used when moving to increase the speed.  Or the default
     * movement speed may be increased/decreased with the MINUS or EQUAL keys.  The
     * ZERO (0) will reset to the default speed values.
     *
     * @author Hans Kellner (Oct 2014)
     *
     */

    AutodeskNamespace('Autodesk.Viewing.Extensions.FirstPerson');

    Autodesk.Viewing.Extensions.FirstPerson.FirstPersonTool = function ( viewerapi ) {

        var avp = Autodesk.Viewing.Private;

        var _isMac = (navigator.userAgent.search("Mac OS") != -1);
        var _navapi = viewerapi.navigation;
        var _container = viewerapi.container;
        var _camera = _navapi.getCamera();
        var _names = ["firstperson"];

        var _modifierState = { SHIFT: 0, ALT: 0, CONTROL: 0 };  // TODO: Use the hotkeymanager for these.
        var _keys = Autodesk.Viewing.KeyCode;

        var _isActive = false;

        // true to disable mouse & keyboard navigation.  Used when a HUD is visible to simulate
        // a modal dialog.
        var _ignoreMouseAndKeyNav = false;

        // if true then mouse drag changes view orientation, otherwise just mouse move.
        // If this is set to false then auto-tracking is enabled which might be a usability
        // issue depending on where the cursor is locate when the tool is enabled.
        // Movement is based on the distance the cursor is located from the center of
        // the screen.  If the cursor is away from center when the tool is enabled then
        // in auto-tracking (non-drag) mode the camera will begin moving.  This may be
        // disconcerting to the user.
        var _mouseDraggingLookMode = true;

        var _isDragging = false;
        var _mouseButtons = 0;
        var _touchType = null;

        var _clock = new THREE.Clock(true);

        var _hudMessageStartShowTime = -1;
        var _hudMessageShowTime = 5000;     // milliseconds to show HUD

        var _modelUnitScale = 1.0; // meters
        var _modelScaleFactor = 1.0;

        // These values define how fast/slow the camera movements are made.
        // Adjust these to fine tune the movement.
        var _movementSpeedDefault = 2.0;
        var _movementSpeed = 2.0;
        var _wheelMovementSpeed = 1.0;
        var _verticalMovementSpeed = 0.5;
        var _lookSpeed = 0.0035;

        // Distance from middle of screen (non-drag) or start position (drag) that's
        // considered a neutral no-move zone when in non-drag movement mode.
        var _neutralZoneDist = 40;

        var _wheelDelta = 0;

        // Current cursor
        var _mouseXstart = 0, _mouseDX = 0, _lastX = -1e20;
        var _mouseYstart = 0, _mouseDY = 0, _lastY = -1e20;

        // Limits on mouse distance to throttle look speed
        var _mouseXMaxLimit = 400;
        var _mouseYMaxLimit = 400;

        // Relative movement
        var _deltaYaw = 0;
        var _deltaPitch = 0;

        // Key movement flags
        var _moveForward = false;
        var _moveBackward = false;
        var _moveLeft = false;
        var _moveRight = false;
        var _moveUp = false;
        var _moveDown = false;

        // Previous FOV and Perspective settings
        var _previousFov = _camera.fov;
        var _restorePreviousFov = false;

        var _wasPerspective = _camera.isPerspective;
        var _restorePreviousPerspective = false;

        // Help HUD
        var _bDontShowAgain_HelpHUD = false;

        //gamepad
        var _gamepadModule;
        //if this browser supports gamepad, instantiate GamepadModule
        if(navigator.getGamepads || !!navigator.webkitGetGamepads || !!navigator.webkitGamepads){
            _gamepadModule = new Autodesk.Viewing.Extensions.GamepadModule(viewerapi);
        }

        //ADP 
        var _trackToolUsed = false;

        // ToolInterface

        this.isActive = function()
        {
            return _isActive;
        };

        this.getNames = function()
        {
            return _names;
        };

        this.getName = function()
        {
            return _names[0];
        };

        this.activate = function(name)
        {
            _clock.start();

            // Switch to perspective
            _wasPerspective = _camera.isPerspective;
            _navapi.toPerspective();

            // Change FOV to a wide value for a better 1st person experience
            _previousFov = _camera.fov;
            _navapi.setVerticalFov(75, true);

            // Unit scale
            _modelUnitScale = viewerapi.model.getUnitScale();

            // Calculate a movement scale factor based on the model bounds.
            var boundsSize = viewerapi.model.getBoundingBox().size();
            _modelScaleFactor = Math.max(Math.min(Math.min(boundsSize.x,boundsSize.y),boundsSize.z) / 10.0, 0.0001);

            // HACK: Place focus in canvas so we get key events.
            viewerapi.canvas.focus();

            _isActive = true;

            // Display the HUD on startup but only if "don't show me again" wasn't requested
            if (viewerapi.getFirstPersonToolPopup() && !_bDontShowAgain_HelpHUD) {
                showHelpHUD();
            }

            addCrosshair();

            viewerapi.impl.pauseHighlight(true);

            if (_gamepadModule) {
                _gamepadModule.activate(this.getName());
            }
        };

        this.deactivate = function(name)
        {
            _isActive = false;

            _clock.stop();

            hideHUD();
            removeCrosshair();

            if (_restorePreviousFov) {
                _navapi.setVerticalFov(_previousFov, true);
            }

            if (_restorePreviousPerspective) {
                if (!_wasPerspective)
                    _navapi.toOrthographic();
            }

            viewerapi.impl.pauseHighlight(false);

            if(_gamepadModule)
                _gamepadModule.deactivate();

        };

        this.getCursor = function()
        {
            return "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3goOFQoQszohGAAAA9hJREFUSMedll1oHGUUhp8zuzP5291pEvNTomgVjFCCCa0NpAqJEJTUFVv8uWxQLwKCF6IUr7wJ6J30QvBCAlZssA0EkYJaAm1FwU3iakrbVNNuutlukk3dzWyT/ZnJ7ufFTtokbmvX72Y45+N73/Oe8858I+xYSikBJJFI7AmFQh9alvVWoVC47vP5ho4cOXJeRGwqWN4yOQ2oHh0dPROJRNo7OjqIRCKPRxeiP66srBxSSn0vIsX/RaCU0gDV399vNjQ0tB8/fpxAIEAsFuP06dPEYrFvgHqguEMxIqLKdUPbmnArU52dnb2maWJUGeRyOWzbpqGxgXg87gOMncDlwLe2Y5uCwcHBFp/P90k4PE349xkWolGi0SjhPy5hF+UmIEopz/1AtxRcqmJzDQ8P7750+Wq8e9+TPGLe4sSp39jz9LMsxm/izE6gOVnquoIcOHDgnddfe/VEU3PLWkUzSCQSesCzxNtvHKZu11O0137OuTMneYY1+l+px99sci5zgU+/Pv/Z5OTkWeCvigja2tqqri3/RPbiMfSWLvY+/wJ7XwxCOoyz+gPF5C0OzsFZv8NEOOxU7KL5+fkcooFUo9avYt+4htTU43noJVTmIPYvp8hnChSKCr/fr1VMkEqlCgEATUDTAIVykhSWRtj4M4/KKzZ9Z9u2ehCCbVUYhlEaurg7m09NB/GWYhe2r69vV8UEvb29DeIWL+6uIG6w6b1SGAqF0hUTZDKZ7GLKy1w0h+Z1keQuMEDOKbK+oZFIJOyKZqCUEsuy/k4mk6kr0ZH6/Z2CkrttEl1QjuJkKI3z6KGp6vTFpYoVmKaZ9Xg8lleDoq3IzOdBILuygbVgs2YVSNrgOM7o1NTURkUE7qufX15evo5A0VHcnrNRgFgFJF6gsVmntlaIxWKNIlK/s8D/VCAianZ29spmv0vfVoVuaNT6PYhWMpGIGIZhNAGtQC3bbXDfj51YlrWObHeOKu3didfX1x3btgGqgADgu5eafyXT6XT2zmDLnVDg9Xq9uq573fMeQAeqy+HtTAgguq7h0aUsgyZCJpPZcBxnE1xz3fhACqp7enoe+3ZimVg8j6ELiIACEUETWErnsCwrD2h1dXW6C+4A2a033T0VfPD+e8dePvoFb36sM/LzKomkQ1FgMW3z7neL3Gh6jtbW1rmamhrDNM0NYAVIAYWyl06ZPwoNeHh6evqJmZmZiV8vnCBw+yLRRCv7gkdpamr6aGho6KuBgQFnfHx88V7AZQlcEt01jgD+sbGx3V+OjPR07d8fDQaDl1OpVLK7u9swTXP1Qa7NfwCi46BIaoRmhAAAAABJRU5ErkJggg==), auto";
        };

        this.adjustSpeed = function( direction )
        {
            if ( direction === 0 ) { // reset to default
                _movementSpeed = _movementSpeedDefault;
            }
            else {
                _movementSpeed *= (direction > 0) ?  1.10 : 0.90;
                if ( _movementSpeed < 0.01 ) {
                    _movementSpeed = 0.01;
                }
            }
        };

        function getEventModifierState(event)
        {
            if ( !!_touchType )
                return false;

            var ctrlKey = event.ctrlKey || (_isMac && event.metaKey);
            var metaKey = event.metaKey && !_isMac;

            //console.log("Mod keys: ctrl = "+ctrlKey+" meta = "+metaKey+" alt^ctrl = "+ (event.altKey ^ ctrlKey));

            return ctrlKey || metaKey || event.shiftKey || event.altKey;
        }

        /////////////////////////////////////////////////////////////////////////
        // Tool event handler callbacks - can use "this".

        this.handleGesture = function( event )
        {
            // Convert Hammer touch-event X,Y into mouse-event X,Y.
            if (event.pointers && event.pointers.length > 0) {
                event.pageX = event.pointers[0].pageX;
                event.pageY = event.pointers[0].pageY;
            }

            switch( event.type )
            {
                case "dragstart":
                    _touchType = "drag";
                    // Single touch, fake the mouse for now...
                    return this.handleButtonDown(event, 0);

                case "dragmove":
                    return (_touchType === "drag") ? this.handleMouseMove(event) : false;

                case "dragend":
                    if( _touchType === "drag" )
                    {
                        this.handleButtonUp(event, 0);
                        _touchType = null;
                        return true;
                    }
                    return false;
            }

            return false;
        };

        this.handleSingleClick = function( event, button )
        {
            return false;
        };

        this.handleButtonDown = function( event, button )
        {
            hideHUD();

            _mouseButtons += 1 << button;

            var modifierState = getEventModifierState(event);
            if (button === 0 && !modifierState) {

                _mouseXstart = event.pageX - window.innerWidth / 2;
                _mouseYstart = event.pageY - window.innerHeight / 2;

                _lastX = event.pageX;
                _lastY = event.pageY;

                _deltaYaw = _deltaPitch = 0;
                _mouseDX = _mouseDY = 0;
                _isDragging = true;
                return true;
            }

            return true;    // Eat all these so default tools don't screw with view
        };

        this.handleMouseMove = function( event )
        {
            var dx = (_lastX < -1e10) ? 0 : event.pageX - _lastX;
            var dy = (_lastY < -1e10) ? 0 : event.pageY - _lastY;
            _lastX = event.pageX;
            _lastY = event.pageY;

            if ( (_isDragging === _mouseDraggingLookMode) && !_ignoreMouseAndKeyNav)
            {
                // Joystick Camera Orientation
                /** DISABLED
                 var xNew = event.pageX - window.innerWidth / 2;
                 var yNew = event.pageY - window.innerHeight / 2;
                 if (_mouseDraggingLookMode) {
                // If in drag mode then movement is relative to start point
                _mouseDX = xNew - _mouseXstart;
                _mouseDY = yNew - _mouseYstart;
            }
                 else {
                _mouseDX = xNew;
                _mouseDY = yNew;
            }
                 // A circular area in the middle of the screen or around the start point
                 // defines a neutral area in which no movement occurs.
                 var mouseMoveDist = Math.sqrt( _mouseDX * _mouseDX + _mouseDY * _mouseDY );
                 if ( mouseMoveDist < _neutralZoneDist ) {
                _mouseDX = _mouseDY = 0;
            }
                 DISABLED **/

                    // Discrete Camera Orientation
                _deltaYaw   += dx * _lookSpeed;
                _deltaPitch += dy * _lookSpeed;
            }

            return true;    // Eat all these so default tools don't screw with view
        };

        this.handleButtonUp = function( event, button )
        {
            _mouseButtons -= 1 << button;

            // If are dragging for a specific button then end dragging no matter
            // what the state of the modifiers.  Otherwise you won't end dragging.
            if (button === 0 && _isDragging) {
                _deltaYaw = _deltaPitch = 0;
                _mouseDX = _mouseDY = 0;
                _isDragging = false;
                return true;
            }

            return true;    // Eat all these so default tools don't screw with view
        };

        this.handleKeyDown = function( event, keyCode )
        {
            if (_ignoreMouseAndKeyNav) {
                return false;
            }

            hideHUD();

            var isModKey = false;
            var handled = false;

            switch( keyCode )
            {
                case _keys.ESCAPE:
                    break;

                case _keys.TAB: handled = false; break;

                // Eat the modifiers so defualt tools don't activate and mess with cam
                case _keys.SHIFT:   _modifierState.SHIFT = 1;   isModKey = handled = true; break;
                case _keys.CONTROL: _modifierState.CONTROL = 1; isModKey = handled = true; break;
                case _keys.ALT:     _modifierState.ALT = 1;     isModKey = handled = true; break;
                case _keys.SPACE:   _modifierState.SPACE = 1;   isModKey = handled = true; break;

                case _keys.EQUALS: this.adjustSpeed(1);  handled = true; break;
                case _keys.DASH:   this.adjustSpeed(-1); handled = true; break;
                case _keys.ZERO:   this.adjustSpeed(0);  handled = true; break; // Reset dolly speed to default

                case _keys.UP:
                case _keys.w:
                    _moveForward = true; handled = true;
                    break;

                case _keys.LEFT:
                case _keys.a:
                    _moveLeft = true; handled = true;
                    break;

                case _keys.DOWN:
                case _keys.s:
                    _moveBackward = true; handled = true;
                    break;

                case _keys.RIGHT:
                case _keys.d:
                    _moveRight = true; handled = true;
                    break;

                case _keys.q:
                    _moveUp = true; handled = true;
                    break;

                case _keys.e:
                    _moveDown = true; handled = true;
                    break;

                case _keys.g:
                    handled = true;
                    break;

                case _keys.F1:
                    handled = true;
                    break;
            }

            return handled;
        };

        this.handleKeyUp = function( event, keyCode )
        {
            if (_ignoreMouseAndKeyNav) {
                return false;
            }

            var isModKey = false;
            var handled = false;

            switch( keyCode )
            {
                case _keys.TAB:
                    handled = false;
                    break;

                // Eat the modifiers so defualt tools don't activate and mess with cam
                case _keys.SHIFT:   _modifierState.SHIFT = 0;   isModKey = handled = true; break;
                case _keys.CONTROL: _modifierState.CONTROL = 0; isModKey = handled = true; break;
                case _keys.ALT:     _modifierState.ALT = 0;     isModKey = handled = true; break;
                case _keys.SPACE:   _modifierState.SPACE = 0;   isModKey = handled = true; break;

                case _keys.UP:
                case _keys.w:
                    _moveForward = false; handled = true;
                    firstPersonToolUsed();
                    break;

                case _keys.LEFT:
                case _keys.a:
                    _moveLeft = false; handled = true;
                    firstPersonToolUsed();
                    break;

                case _keys.DOWN:
                case _keys.s:
                    _moveBackward = false; handled = true;
                    firstPersonToolUsed();
                    break;

                case _keys.RIGHT:
                case _keys.d:
                    _moveRight = false; handled = true;
                    firstPersonToolUsed();
                    break;

                case _keys.q:
                    _moveUp = false; handled = true;
                    firstPersonToolUsed();
                    break;

                case _keys.e:
                    _moveDown = false; handled = true;
                    firstPersonToolUsed();
                    break;

                case _keys.g:
                    _mouseDX = _mouseDY = 0;
                    _mouseDraggingLookMode = !_mouseDraggingLookMode;
                    showDraggingLookModeHUD(_mouseDraggingLookMode);
                    handled = true;
                    break;

                case _keys.F1:
                    showHelpHUD();
                    handled = true;
                    break;
            }

            return handled;
        };

        this.handleWheelInput = function(delta)
        {
            if (_ignoreMouseAndKeyNav) {
                return false;
            }

            if ( _navapi.getReverseZoomDirection() )
                delta *= -1;

            _wheelDelta += delta;

            return true;
        };

        this.handleSingleClick = function( event, button ) {
            return false;
        };

        this.handleDoubleClick = function( event, button ) {
            return false;
        };

        this.handleSingleTap = function( event )
        {
            return this.handleSingleClick(event, 0);
        };

        this.handleDoubleTap = function( event ) {
            return false;
        };

        this.handleBlur = function(event)
        {
            // Reset things when we lose focus...
            _moveForward = _moveBackward = false;
            _moveLeft = _moveRight = false;
            _moveUp = _moveDown = false;

            return false;
        };

        this.update = function()
        {

            if (!_isActive || !_navapi.isActionEnabled('walk'))
                return false;

            var delta = _clock.getDelta();//returns delta in unit seconds

            if (_hudMessageStartShowTime > -1) {
                var curTime = new Date().getTime();
                if (curTime - _hudMessageStartShowTime > _hudMessageShowTime) { // seconds
                    hideHUD();
                }
            }

            // From the Collaboration extension:
            //the "go home" call may change the camera back to ortho... and we can't do ortho while walking...
            //HACK: Really, the home view should be set once when launch the extension, then set it back.
            if (!_camera.isPerspective) {
                console.log("Lost perspective mode: resetting view.");
                _navapi.toPerspective();
            }

            var localCam = _camera.clone();   // Copy of camera to modify

            // Handle movement changes

            var actualMoveSpeed         = delta * _movementSpeed         * _modelScaleFactor * (_modifierState.SHIFT === 1 ? 4 : 1);
            var actualVerticalMoveSpeed = delta * _verticalMovementSpeed * _modelScaleFactor * (_modifierState.SHIFT === 1 ? 4 : 1);


            if (_wheelDelta != 0) {
                var actualWheelMoveSpeed = _wheelDelta * _wheelMovementSpeed * _modelScaleFactor * (_modifierState.SHIFT === 1 ? 4 : 1);
                localCam.translateZ( -actualWheelMoveSpeed );
                _wheelDelta = 0;
            }

            if ( _moveForward ) {
                localCam.translateZ(-actualMoveSpeed);
            }

            if ( _moveBackward ) {
                localCam.translateZ( actualMoveSpeed );
            }

            if ( _moveLeft ) {
                localCam.translateX( -actualMoveSpeed );
            }

            if ( _moveRight ) {
                localCam.translateX( actualMoveSpeed );
            }

            if ( _moveUp ) {
                localCam.translateY( actualVerticalMoveSpeed );
            }

            if ( _moveDown ) {
                localCam.translateY( -actualVerticalMoveSpeed );
            }

            var newPosition = localCam.position;
            var posChanged = (newPosition.distanceToSquared(_camera.position) !== 0);

            // Handle look changes

            var actualLookSpeed = delta * _lookSpeed;

            var newTarget = localCam.target;

            var directionFwd = _camera.target.clone().sub(_camera.position);
            //directionFwd = directionFwd.sub((directionFwd.multiply(_camera.worldup)).multiply(_camera.worldup));

            var directionRight = directionFwd.clone().cross(_camera.up).normalize();

            /** Joystick Camera Orientation
             ** This code enabled continuous movement of camera as apposed to the
             ** discrete movement mode below.  Moving the cursor outside of the
             ** center of the view orients the camera in that direction and continues
             ** moving while cursor is outside neutral center.  It works like a
             ** virtual joystick.
             **
             ** Uncomment/Comment these sections to switch the style of camera orientation.
             **/

            /** DISABLED
             var dyawAngle = 0, dpitchAngle = 0;
             if (Math.abs(_mouseDX) > _neutralZoneDist) {
            if (_mouseDX > 0) {
                _mouseDX = Math.min(_mouseDX, _mouseXMaxLimit); // Throttle look speed.
                dyawAngle = (_mouseDX - _neutralZoneDist) * actualLookSpeed;
            }
            else {
                _mouseDX = Math.max(_mouseDX, -_mouseXMaxLimit); // Throttle look speed.
                dyawAngle = (_mouseDX + _neutralZoneDist) * actualLookSpeed;
            }
        }
             if (Math.abs(_mouseDY) > _neutralZoneDist) {
            if (_mouseDY > 0) {
                _mouseDY = Math.min(_mouseDY, _mouseYMaxLimit); // Throttle look speed.
                dpitchAngle = (_mouseDY - _neutralZoneDist) * actualLookSpeed;
            }
            else {
                _mouseDY = Math.max(_mouseDY, -_mouseYMaxLimit); // Throttle look speed.
                dpitchAngle = (_mouseDY + _neutralZoneDist) * actualLookSpeed;
            }
        }
             if (dpitchAngle) {
            var pitchQ = new THREE.Quaternion();
            pitchQ.setFromAxisAngle(directionRight, -dpitchAngle);
            // Need to limit pitch to +-85 degrees so we don't create
            // camera jumping at vertical limits.
            var dirFwdTmp = directionFwd.clone();
            dirFwdTmp.applyQuaternion(pitchQ);
            var vertical = _camera.worldup.clone();
            var vertAngle = dirFwdTmp.angleTo(vertical);
            var vertLimit = THREE.Math.degToRad(5);
            // If new angle is within limits then update values; otherwise ignore
            if ( vertAngle >= vertLimit && vertAngle <= (Math.PI - vertLimit) ) {
                directionFwd.applyQuaternion(pitchQ);
                localCam.up.applyQuaternion(pitchQ);
            }
        }
             if (dyawAngle) {
            var yawQ = new THREE.Quaternion();
            yawQ.setFromAxisAngle(_camera.worldup, -dyawAngle);
            directionFwd.applyQuaternion(yawQ);
            localCam.up.applyQuaternion(yawQ);
        }
             DISABLED **/

            /** Discrete Camera Orientation
             ** Movement based on the delta changes in position or cursor.  See the
             ** the "Dynamic Move" code for an alternative.  In this mode the camera
             ** is oriented based on the delta movement of the cursor.  Movement
             ** stops as camera is oriented to new change of cursor.
             ** TODO: Add logic to smooth motion so camera position ramps towards
             ** the new location rather than discrete jumps.
             **/

            if (_deltaPitch != 0) {
                var pitchQ = new THREE.Quaternion();
                pitchQ.setFromAxisAngle(directionRight, -_deltaPitch);
                // Need to limit pitch to +-85 degrees so we don't create
                // camera jumping at vertical limits.
                var dirFwdTmp = directionFwd.clone();
                dirFwdTmp.applyQuaternion(pitchQ);

                var vertical = _camera.worldup.clone();
                var vertAngle = dirFwdTmp.angleTo(vertical);
                var vertLimit = THREE.Math.degToRad(5);

                // If new angle is within limits then update values; otherwise ignore
                if ( vertAngle >= vertLimit && vertAngle <= (Math.PI - vertLimit) ) {
                    directionFwd.applyQuaternion(pitchQ);
                    localCam.up.applyQuaternion(pitchQ);
                }

                _deltaPitch = 0.0;
            }

            if (_deltaYaw != 0) {
                var yawQ = new THREE.Quaternion();
                yawQ.setFromAxisAngle(_camera.worldup, -_deltaYaw);
                directionFwd.applyQuaternion(yawQ);
                localCam.up.applyQuaternion(yawQ);
                _deltaYaw = 0.0;
            }

            // Now calc new target location and if it changed.
            newTarget = newPosition.clone().add(directionFwd);
            //now fix newPosition for lockInPlane
            var targetChanged = (newTarget.distanceToSquared(_camera.target) !== 0);
            // If position or target changed then update camera.
            if (posChanged || targetChanged) {

                _navapi.setView(newPosition, newTarget);
                //_camera.position = newPosition.clone();
                //_camera.target = newTarget.clone();
                //_camera.dirty = true;s
                // Force the camera to stay orientated up with world up.
                _navapi.orientCameraUp();
            }

            //gamepad integration
            if(_gamepadModule){
                _camera =  _gamepadModule.update(_camera);
            }

            return _camera.dirty;


        };
        //ADP
        var firstPersonToolUsed = function () {
            if(!_trackToolUsed) {
                avp.logger.track({category: 'tool_used', name: 'FirstPerson_tool'});
                _trackToolUsed = true;
            }
        }


        /////////////////////////////////////////////////////////////////////////
        // HUD helpers

        // Show a HUD for a specific amount of time (showDelay > 0) or until closed.
        var showHUD = function(messageSpecs, showDelay, closeCB, buttonCB, checkboxCB)
        {
            // TODO: Tool should not be trying to interact with UI
            // Does not comply with headless viewer policy.
            if (!Autodesk.Viewing.Private.HudMessage) {
                return;
            }

            Autodesk.Viewing.Private.HudMessage.displayMessage(_container, messageSpecs, closeCB, buttonCB, checkboxCB);

            if (showDelay > 0) {
                _hudMessageStartShowTime = new Date().getTime();
                _hudMessageShowTime = showDelay;
            }
            else {
                _hudMessageStartShowTime = -1;
                _hudMessageShowTime = 0;
            }
        };

        var hideHUD = function()
        {
            // TODO: Tool should not be trying to interact with UI
            // Does not comply with headless viewer policy.
            if (Autodesk.Viewing.Private.HudMessage) {
                Autodesk.Viewing.Private.HudMessage.dismiss();  // in case it's still visible
            }
            _hudMessageStartShowTime = -1;
        };

        var showDraggingLookModeHUD = function(enabled)
        {
            hideHUD();

            var themessage = (enabled 
                    ? "Press the primary mouse button and drag to change the view orientation"
                    : "Move the cursor to change the view orientation");

            var messageSpecs = {
                "msgTitleKey"   : "First Person Tool",
                "messageKey"    : themessage,
                "messageDefaultValue"  : themessage
            };

            var closeCallback = function() {}; // dummy callback function so that the 'X' is shown
            showHUD(messageSpecs, 0, closeCallback);
        };


        var showHelpHUD = function()
        {
            hideHUD();

            // TODO: Sadly, the HudMessage api doesn't support html formatted messages
            var messageSpecs = {
                "msgTitleKey"           : "First Person Tool",
                "messageKey"            : "Use the WASD and QE keys to move",
                "messageDefaultValue"   : "Use the WASD and QE keys to move", // simplify key and remove peroid
                "buttonText"            : "Ok Got It"
            };

            var closeCallback = function() {}; // dummy callback function so that the 'X' is shown
            var buttonCallback = function() {
                _bDontShowAgain_HelpHUD = true;
                viewerapi.setFirstPersonToolPopup(false);
                hideHUD();
            };
            showHUD(messageSpecs, 0, closeCallback, buttonCallback);
        };

        addCrosshair = function() {
            if (avp.stringToDOM) {
                this.crosshair = avp.stringToDOM('<div id="remote-crosshair"><div class="crosshair-v"></div><div class="crosshair-h"></div></div>f');
                viewerapi.canvasWrap.appendChild(this.crosshair);
            }
        };

        removeCrosshair = function() {
            if (this.crosshair && this.crosshair.parentNode) {
                this.crosshair.parentNode.removeChild(this.crosshair);
            }
        };
    };

})();