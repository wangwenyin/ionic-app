//模型标注样式修改 liaozl 2018-12-03
(function(){ 'use strict';
    var CORE_EXTENSION = 'Autodesk.Viewing.MarkupsCore';
    var namespace = AutodeskNamespace('Autodesk.Markups.Gui');
    var namespaceCore = AutodeskNamespace('Autodesk.Viewing.Extensions.Markups.Core');
    var namespaceCoreUtils = AutodeskNamespace('Autodesk.Viewing.Extensions.Markups.Core.Utils');

    function MarkupsGui(viewer, options) {
        Autodesk.Viewing.Extension.call(this, viewer, options);
        this.domEvents = [];
        this.name = 'markup';
        Autodesk.Viewing.Private.injectCSS('extensions/Markups/MarkupsGui.css');
        Autodesk.Viewing.Private.injectCSS('icon/iconfont.css');
    }

    MarkupsGui.prototype = Object.create(Autodesk.Viewing.Extension.prototype);
    MarkupsGui.prototype.constructor = MarkupsGui;
    var proto = MarkupsGui.prototype;
    var av = Autodesk.Viewing;
    var avp = av.Private;
    var markSVG = null;
    var strPoint = null;

    proto.load = function () {

        var onCoreLoaded = function() {

            this.core = this.viewer.getExtension(CORE_EXTENSION);

            if (this.viewer.toolbar) {
                this.createToolbarUI();
            } else {
                this.bindedOnToolbarCreated = this.onToolbarCreated.bind(this);
                this.viewer.addEventListener(av.TOOLBAR_CREATED_EVENT, this.bindedOnToolbarCreated);
            }

            // Hook into markup core events
            this.onEditModeEnterBinded = this.onEditModeEnter.bind(this);
            this.onEditModeLeaveBinded = this.onEditModeLeave.bind(this);
            this.onEditModeChangeBinded = this.onEditModeChange.bind(this);
            this.onMarkupSelectedBinded = this.onMarkupSelected.bind(this);
            this.core.addEventListener(namespaceCore.EVENT_EDITMODE_ENTER, this.onEditModeEnterBinded);
            this.core.addEventListener(namespaceCore.EVENT_EDITMODE_LEAVE, this.onEditModeLeaveBinded);
            this.core.addEventListener(namespaceCore.EVENT_EDITMODE_CHANGED, this.onEditModeChangeBinded);
            this.core.addEventListener(namespaceCore.EVENT_MARKUP_SELECTED, this.onMarkupSelectedBinded);
        }.bind(this);

        var onCoreError = function() {
            avp.logger.warn('Error getting dependency:', CORE_EXTENSION);
        }.bind(this);
        var core = this.viewer.getExtension(CORE_EXTENSION);
        if (core) {
            onCoreLoaded();
        } else {
            avp.logger.warn('Getting missing dependency:', CORE_EXTENSION);
            this.viewer.loadExtension(CORE_EXTENSION).then(onCoreLoaded, onCoreError);
        }

        return true;
    };

    proto.unload = function() {

        this.unhookAllEvents();

        this.core.removeEventListener(namespaceCore.EVENT_EDITMODE_ENTER, this.onEditModeEnterBinded);
        this.core.removeEventListener(namespaceCore.EVENT_EDITMODE_LEAVE, this.onEditModeLeaveBinded);
        this.core.removeEventListener(namespaceCore.EVENT_EDITMODE_CHANGED, this.onEditModeChangeBinded);
        this.core.removeEventListener(namespaceCore.EVENT_MARKUP_SELECTED, this.onMarkupSelectedBinded);
        this.onEditModeEnterBinded = null;
        this.onEditModeLeaveBinded = null;
        this.onEditModeChangeBinded = null;
        this.onMarkupSelectedBinded = null;

        this.destroyToolbarUI();
        if (this.bindedOnToolbarCreated) {
            this.viewer.removeEventListener(av.TOOLBAR_CREATED_EVENT, this.bindedOnToolbarCreated);
            this.bindedOnToolbarCreated = null;
        }

        this.core = null;

        return true;
    };

    proto.onToolbarCreated = function() {
        this.viewer.removeEventListener(av.TOOLBAR_CREATED_EVENT, this.bindedOnToolbarCreated);
        this.bindedOnToolbarCreated = null;
        this.createToolbarUI();
    };

    proto.createToolbarUI = function() {

        var self = this;
        var viewer = this.viewer;
        var toolbar = viewer.getToolbar(true);

        this.markupToolButton = new Autodesk.Viewing.UI.Button("toolbar-markupTool");
        this.markupToolButton.setToolTip("Markup");
        this.markupToolButton.setIcon("adsk-icon-markup");
        this.markupToolButton.onClick = function () {
            // Since the bar will get hidden when closed, there
            // is no need to track button state (active or not)
           //   self.activate();
          self.core.enterEditMode();
        };

        var modelTools = toolbar.getControl(Autodesk.Viewing.TOOLBAR.MODELTOOLSID);
        if (modelTools) {
            modelTools.addControl(this.markupToolButton, {index:0});
        }
    };

    proto.destroyToolbarUI = function() {
        if (this.markupToolButton) {
            var toolbar = this.viewer.getToolbar(false);
            if (toolbar) {
                var modelTools = toolbar.getControl(av.TOOLBAR.MODELTOOLSID);
                if (modelTools) {
                    modelTools.removeControl(this.markupToolButton);
                }
            }
            this.markupToolButton = null;
        }
    };

    proto.onEditModeEnter = function() {
        avp.logger.log('ENTER edit mode');
        this.showToolsUi();
    };

    proto.onEditModeLeave = function() {
        avp.logger.log('LEAVE edit mode');
        this.hideToolsUi();
    };

    proto.onEditModeChange = function(event) {
        if (!this.domToolSelect || this.ignoreChangeEvent)
            return;
        var editMode = this.core.editMode;
        var optionList = this.domToolSelect.options;
        for (var i=0, len=optionList.length; i<len; i++) {
            var option = optionList[i];
            if (option.value === editMode.type) {
                this.domToolSelect.selectedIndex = i; // doesn't fire event
                break;
            }
        }
    };

    proto.onMarkupSelected = function(event) {

        var markup = event.markup;
        var editMode = this.core.editMode;
        this.setStylesUi(editMode, markup);
    };

    proto.showToolsUi = function() {
        this.createToolsUi();

        // Hide some UI
        var canNavigate = this.core.isNavigationAllowed();
        this.setControlVisibility('.lmv-markup-gui-enterNavMode', canNavigate, 'inline-block');
        this.exitNavigationMode();
        this.domContent.style.display = 'block'; // remove collapsed state

        // It's okay if we call these many times in a row, no biggie.
        this.viewer.container.appendChild(this.domRoot);
    };

    proto.hideToolsUi = function() {
        if (this.domRoot && this.domRoot.parentNode) {
            this.domRoot.parentNode.removeChild(this.domRoot);
        }
    };
    proto.createToolsUi = function() {

        if (this.domRoot)
            return;

        var optionIndex = 0;
        function createEditModeOption(locLabel, editModeType) {
            return [
                '<option value="', editModeType, '">',
                    locLabel,
                '</option>'
            ].join('');
        }
   
        var html = [
            '<div class="lmv-markup-gui-toolbar-content"  style="display:none;" >',
                '<div class="lmv-markup-gui-collapse-content"  style="display:none;">',
                    '<div class="lmv-markup-gui-editMode " style="display:none;">',
                        '<div class="lmv-markup-gui-style-options" ></div>',
                    '</div>',
                    '<div class="lmv-markup-gui-navMode" >',
                    '</div>',
                '</div>',
            '</div>',
            '<div  class="adsk-control adsk-control-group-my">',
                '<div class="adsk-control adsk-button "  >',
                    '<div   class="arrow adsk-button-icon  icon iconfont icon-jiantouarrow506 " ></div>',
                    '<div  class="adsk-control-tooltip"  data-i18n="箭头" tooltiptext="箭头">箭头</div>',
                '</div>',
                '<div class=" adsk-control adsk-button  "  >',
                    '<div   class="circle adsk-button-icon icon iconfont icon-yuanxingweixuanzhong" ></div>',
                    '<div  class="adsk-control-tooltip"  data-i18n="圆形" tooltiptext="圆形">圆形</div>',
                '</div>',
                '<div class=" adsk-control adsk-button "  >',
                    '<div   class="rectangle adsk-button-icon  iconfont icon icon-xingzhuang-juxing" ></div>',
                    '<div  class="adsk-control-tooltip"  data-i18n="矩形" tooltiptext="矩形">矩形</div>',
                '</div>',
                '<div class=" adsk-control adsk-button "  >',
                    '<div   class="cloud adsk-button-icon icon iconfont icon-cloud" ></div>',
                    '<div  class="adsk-control-tooltip"  data-i18n="云形" tooltiptext="云形">云形</div>',
                '</div>',
                '<div class=" adsk-control adsk-button "  >',
                    '<div   class="freehand adsk-button-icon icon iconfont icon-xiansuo" ></div>',
                    '<div  class="adsk-control-tooltip"  data-i18n="自由线" tooltiptext="自由线">自由线</div>',
                '</div>',
                '<div class=" adsk-control adsk-button "  >',
                    '<div   class="text adsk-button-icon icon iconfont icon-iconset0122" ></div>',
                    '<div  class="adsk-control-tooltip"  data-i18n="文本编辑" tooltiptext="文本编辑">文本编辑</div>',
                '</div>',
             '<div class=" adsk-control adsk-button "><div class="lmv-markup-gui-enterNavMode adsk-button-icon icon iconfont icon-jiesuo">',
            '</div><div  class="adsk-control-tooltip"  data-i18n="解锁绑定" tooltiptext="解锁绑定">解锁绑定</div>',
            '</div><div  class="adsk-control adsk-button ">',
            '<div class="lmv-markup-gui-SaveMark adsk-button-icon icon iconfont icon-baocun" >',
            '</div><div  class="adsk-control-tooltip" data-i18n="保存标记" tooltiptext="保存标记">保存标记</div>',
            '</div><div  class="adsk-control adsk-button ">',
            '<div class="lmv-markup-gui-ResetMark adsk-button-icon icon iconfont icon-huanyuan" >',
            '</div><div  class="adsk-control-tooltip" data-i18n="标记还原" tooltiptext="标记还原">标记还原</div>',
            '</div><div  class="adsk-control adsk-button ">',
            '<div class="lmv-markup-gui-ClearMark adsk-button-icon icon iconfont icon-Eliminate" >',
            '</div><div  class="adsk-control-tooltip" data-i18n="清除标记" tooltiptext="清除标记">清除标记</div>',
            '</div><div  class="adsk-control adsk-button  changeViewer">',
            '<div class="lmv-markup-editmode-done adsk-button-icon icon iconfont icon-icon-">',
            '</div><div class=" adsk-control-tooltip" data-i18n="退出" tooltiptext="退出">',
            '退出</div></div>',
            '</div>',

        ].join('');
        this.domRoot = document.createElement('div');
        this.domRoot.className = 'lmv-markup-gui-toolbar';
        this.domRoot.innerHTML = html;
        this.domContent = this.domRoot.querySelector('.lmv-markup-gui-collapse-content');
        this.domToolSelect = this.domRoot.querySelector('.lmv-markup-tool-select');
        this.domStylesRoot = this.domRoot.querySelector('.lmv-markup-gui-style-options');

        // General
        this.hookEvent('click', '.lmv-markup-gui-collapse-btn', this.onToggleCollapse.bind(this));
        this.hookEvent('click', '.lmv-markup-editmode-done', this.onEditModeDone.bind(this));
        this.hookEvent('click', '.lmv-markup-gui-enterNavMode', this.enterNavigationMode.bind(this));
        this.hookEvent('click', '.lmv-markup-gui-exitNavMode', this.exitNavigationMode.bind(this));
        this.hookEvent('click', '.lmv-markup-gui-undo', this.onUndoClick.bind(this));
        this.hookEvent('click', '.lmv-markup-gui-redo', this.onRedoClick.bind(this));
        this.hookEvent('click', '.lmv-markup-gui-delete', this.onDeleteClick.bind(this));
        this.hookEvent('click', '.lmv-markup-gui-cut', this.onCutClick.bind(this));
        this.hookEvent('click', '.lmv-markup-gui-copy', this.onCopyClick.bind(this));
        this.hookEvent('click', '.lmv-markup-gui-paste', this.onPasteClick.bind(this));
        this.hookEvent('click', '.lmv-markup-gui-duplicate', this.onDuplicateClick.bind(this));

        //线条类型
        this.hookEvent('click', '.arrow', this.arrow.bind(this));
        this.hookEvent('click', '.circle', this.circle.bind(this));
        this.hookEvent('click', '.rectangle', this.rectangle.bind(this));
        this.hookEvent('click', '.cloud', this.cloud.bind(this));
        this.hookEvent('click', '.freehand', this.freehand.bind(this));
        this.hookEvent('click', '.text', this.text.bind(this));
        
        // Tools
        this.hookEvent('change', '.lmv-markup-tool-select', this.onSelectEditMode.bind(this));
        this.hookEvent('change', '.lmv-markup-gui-style-select', this.onStyleChange.bind(this));

        this.hookEvent('click', '.lmv-markup-gui-SaveMark', this.onSaveMarkUp.bind(this));
        this.hookEvent('click', '.lmv-markup-gui-ResetMark', this.onResetMarkUp.bind(this));
        this.hookEvent('click', '.lmv-markup-gui-ClearMark', this.onClearMarkUp.bind(this));
        this.setStylesUi(this.core.editMode);

        //开启编辑模式
    };


  proto.onSaveMarkUp = function() {
    strPoint = JSON.stringify(this.viewer.getState());
    debugger 
    markSVG = this.core.generateData();
  };

  proto.onResetMarkUp = function() {
    this.core.hide();
    var filter = null;
    this.viewer.restoreState(JSON.parse(strPoint), filter, true);
    setTimeout(() => {
    this.core.show();
    this.core.loadMarkups(markSVG, "0");
    this.core.enterEditMode();
    }, 1);
  };

  proto.onClearMarkUp = function() {
    this.core.unloadMarkupsAllLayers();
  };

    proto.getEditModeClass = function(editModeType) {
        var className;
        switch(editModeType) {
            case namespaceCore.MARKUP_TYPE_ARROW: className='EditModeArrow'; break;
            case namespaceCore.MARKUP_TYPE_RECTANGLE: className='EditModeRectangle'; break;
            case namespaceCore.MARKUP_TYPE_CIRCLE: className='EditModeCircle'; break;
            case namespaceCore.MARKUP_TYPE_TEXT: className='EditModeText'; break;
            case namespaceCore.MARKUP_TYPE_CALLOUT: className='EditModeCallout'; break;
            case namespaceCore.MARKUP_TYPE_CLOUD: className='EditModeCloud'; break;
            case namespaceCore.MARKUP_TYPE_POLYLINE: className='EditModePolyline'; break;
            case namespaceCore.MARKUP_TYPE_POLYCLOUD: className='EditModePolycloud'; break;
            case namespaceCore.MARKUP_TYPE_FREEHAND: className='EditModeFreehand'; break;
            case namespaceCore.MARKUP_TYPE_HIGHLIGHT: className='EditModeHighlight'; break;
            case namespaceCore.MARKUP_TYPE_DIMENSION: className='EditModeDimension'; break;
        }

        if (!className)
            return null;

        var EditModeClass = namespaceCore[className];
        var editMode = new EditModeClass(this.core);
        return editMode;
    };

    proto.onToggleCollapse = function() {
        var curr = this.domContent.style.display;
        if (curr === 'none')
            this.domContent.style.display = 'block';
        else
            this.domContent.style.display = 'none';
    };

    proto.onEditModeDone = function() {
       this.core.hide();
    };

    proto.enterNavigationMode = function() {
        this.core.allowNavigation(true);
        this.setControlVisibility('.lmv-markup-gui-editMode', false);
        this.setControlVisibility('.lmv-markup-gui-navMode', true);
    };
    proto.exitNavigationMode = function() {
        this.core.allowNavigation(false);
        this.setControlVisibility('.lmv-markup-gui-editMode', true);
        this.setControlVisibility('.lmv-markup-gui-navMode', false);
    };

    proto.onUndoClick = function() {
        this.core.undo();
    };
    proto.onRedoClick = function() {
        this.core.redo();
    };
    proto.onDeleteClick = function() {
        var markup = this.core.getSelection();
        if (markup) {
            this.core.deleteMarkup(markup);
        }
    };
    proto.onCutClick = function() {
        this.core.cut();
    };
    //箭头
    proto.arrow = function() {
        this.core.enterEditMode();
        var editMode=this.getEditModeClass(namespaceCore.MARKUP_TYPE_ARROW);
        this.modeTool(editMode);
    };
    //圆形
    proto.circle = function() {
        this.core.enterEditMode();
        var editMode=this.getEditModeClass(namespaceCore.MARKUP_TYPE_CIRCLE);
        this.modeTool(editMode);
    };
    //矩形
    proto.rectangle = function() {
        this.core.enterEditMode();
        var editMode=this.getEditModeClass(namespaceCore.MARKUP_TYPE_RECTANGLE);
        this.modeTool(editMode);
    };
    //云行
    proto.cloud = function() {
        this.core.enterEditMode();
        var editMode=this.getEditModeClass(namespaceCore.MARKUP_TYPE_CLOUD);
        this.modeTool(editMode);
    };
   //自由线
   proto.freehand = function() {
     this.core.enterEditMode();
    var editMode=this.getEditModeClass(namespaceCore.MARKUP_TYPE_FREEHAND);
    this.modeTool(editMode);
};
  //编辑文本
  proto.text = function() {
    this.core.enterEditMode();
   var editMode=this.getEditModeClass(namespaceCore.MARKUP_TYPE_TEXT);
   this.modeTool(editMode);
};
  //线条公用方法
    proto.modeTool=function(editMode){
        if (!editMode) {
            avp.error('Markup editMode not found for type: ' + editModeType);
            return;
        }
        this.ignoreChangeEvent = true;
        this.core.changeEditMode(editMode);
        this.ignoreChangeEvent = false;
        this.setStylesUi(editMode);
    }
    proto.onCopyClick = function() {
        this.core.copy();
    };
    proto.onPasteClick = function() {
        this.core.paste();
    };
    proto.onDuplicateClick = function() {
        // only when there's a selection
        var markup = this.core.getSelection();

        if (markup) {
            this.core.copy();
            this.core.paste();
        }
    };

    proto.onSelectEditMode = function(event) {
        var editModeType = event.target.value;
        var editMode = this.getEditModeClass(editModeType);
        if (!editMode) {
            avp.error('Markup editMode not found for type: ' + editModeType);
            return;
        }
        this.ignoreChangeEvent = true;
        this.core.changeEditMode(editMode);
        this.ignoreChangeEvent = false;
        this.setStylesUi(editMode);
        this.domToolSelect.blur(); // remove focus from UI
    };
    // if (editMode.cancelEditModeChange) {
    //     avp.logger.warn('There was a problem selecting current editMode');
    //     return;
    // }

    proto.onStyleChange = function(event) {
        var select = event.target;
        var option = select.options[select.selectedIndex];
        var styleKey = select.getAttribute('style-key');
        var valueType = select.getAttribute('value-type');
        select.blur(); // remove focus from UI

        var markup = this.core.getSelection();
        var style = markup ? markup.getStyle() : this.core.getStyle();
        style[styleKey] = getTypedValue(option.value, valueType);
        this.core.setStyle(style);

        function getTypedValue(val, type) {
            if (type === 'number')
                return Number(val);
            if (type === 'boolean')
                return val === 'true';
            return val;
        }
    };

    proto.setStylesUi = function(editMode, markup) {
        avp.logger.log('set ui for ' + editMode.type);

        var style = markup ? markup.style : editMode.style;
        var defaults = namespaceCoreUtils.getStyleDefaultValues(style, this.core);

        this.domStylesRoot.innerHTML = ''; // flush UI
        for (var key in defaults) {
            // Quite inefiient because we are re-creating DOM constantly
            // Consider optimize if it becomes a problem
            var domElem = this.getUiForStyleKey(key, defaults[key], style[key]);
            this.domStylesRoot.appendChild(domElem);
        }
    };

    proto.getUiForStyleKey = function(key, defaults, current) {

        var selectionIndex = defaults.default;
        var options = [];
        var values = defaults.values;
        for (var i=0, len=values.length; i<len; ++i) {
            var optLine = [
                '<option value="', values[i].value,'">',
                    values[i].name,
                '</option>'
            ].join('');
            options.push(optLine);

            if (this.valueEquals(values[i].value, current)) {
                selectionIndex = i;
            }
        }

        var valueType = typeof values[0].value;

        // TODO: Build specialized controls for each style-attribute
        var domElem = document.createElement('div');
        var html = [
            '<span>',key,'</span>',
            '<select class="lmv-markup-gui-style-select" style-key="', key, '" value-type="', valueType,'">',
                options.join(''),
            '</select>'
        ].join('');
        domElem.innerHTML = html;

        // select index
        var domSelect = domElem.querySelector('select');
        domSelect.selectedIndex = selectionIndex;

        return domElem;
    };
    proto.valueEquals = function(value1, value2) {

        return value1 === value2;
    }

    proto.setControlVisibility = function(selector, isVisible, visibleValue) {
        var elem = this.domRoot.querySelector(selector);
        if (!visibleValue)
            visibleValue = 'block';
        elem.style.display = isVisible ? visibleValue : 'none';
    };

    proto.hookEvent = function(eventStr, selector, callbackFn) {
        var handler = function(event){
            if (this.matchesSelector(event.target, selector)){
                callbackFn(event);
            }
        }.bind(this);
        this.domRoot.addEventListener(eventStr, handler);
        this.domEvents.push({str: eventStr, handler: handler });
    };

    proto.unhookAllEvents = function() {
        var domRoot = this.domRoot;
        this.domEvents.forEach(function(event) {
            domRoot.removeEventListener(event.str, event.handler);
        });
        this.domEvents = [];
    };

    proto.matchesSelector = function(domElem, selector) {
        if (domElem.matches) return domElem.matches(selector); //Un-prefixed
        if (domElem.msMatchesSelector) return domElem.msMatchesSelector(selector);  //IE
        if (domElem.mozMatchesSelector) return domElem.mozMatchesSelector(selector); //Firefox (Gecko)
        if (domElem.webkitMatchesSelector) return domElem.webkitMatchesSelector(selector); // Opera, Safari, Chrome
        return false;
    };

    proto.getStyleOptions = function(editMode) {
        var style = editMode.getStyle();
        return namespace.getStyleDefaultValues(style, this.core);
    };
    proto.activate = function () {
        if(!this.activeStatus) {
            this.core.enterEditMode();
            this.activeStatus = true;
        }
        return true;
    };

    proto.deactivate = function () {
        if(this.activeStatus) {
            this.core.hide();
            this.activeStatus = false;
        }
        return true;
    };
    namespace.MarkupsGui = MarkupsGui;
    Autodesk.Viewing.theExtensionManager.registerExtension('Autodesk.Viewing.MarkupsGui', MarkupsGui);
})();
