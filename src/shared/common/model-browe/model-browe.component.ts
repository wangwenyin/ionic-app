/// <reference path="../../../../node_modules/ahoops-web/js/hoops_web_viewer.d.ts" />
/// <reference path="../../../../node_modules/ahoops-web/js/web_viewer_ui.d.ts" />
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Http } from '@angular/http';
import * as $ from 'jquery';

@Component({
    selector: 'app-model-browe',
    templateUrl: 'model-browe.component.html',
    // styleUrls: ['./model-browe.component.less', './jquery-ui.min.css', './Common.css', './Desktop.css', './jquery.minicolors.css', './Mobile.css', './NoteText.css', './PropertyWindow.css', './Ribbon.css', './Toolbar.css', './TreeControl.css', './ViewerSettings.css'],
    // styleUrls: ['model-browe.component.scss']
})
export class ModelBroweComponent implements  OnInit {

    @Input()
    set modelBroweOption(value: ModelBroweOption){
      if (value === null || value === undefined) {
        return;
      }
      $('#content').width(value.width);
      $('#content').height(value.height);

      if (value.readerType === ModelReaderType.Scs) {
        this.scsStream(value);
      }
      this.optionConfig = value;
    }
    @Output() modelEvent: EventEmitter<ModelBroweEvent> = new EventEmitter<ModelBroweEvent>();

    optionConfig:ModelBroweOption;
    viewer: Communicator.WebViewer;
    ui: Communicator.Ui.Desktop.DesktopUi;
    walk: Communicator.Ui.Desktop.WalkMap;
    treeShow: boolean;
    propertyShow: boolean;
    cutStatus:boolean = true;

    _viewerElement: any;
    _poppedOutWindow: any;
    _cuttingSection: Communicator.CuttingSection;
    selectNode: number;
    snapStream: string = "";
    titleValue: string = "";
    walkKeyHandle: any;

  allComp = [];
  markupRegisted = [];
  markupRegNow: string = "";
  _markupArray = [];
  _markupHandleList = [];
  percent: number = 0;
  recordCount: number = 0;

    constructor(private http: Http
                // private fileService: LemovoFileService,
                // private eventBus: ComponentEventBusService
            ) {
        this.selectNode = 0;
        //document.getElementById("snapshot-button").onclick = function () {
        //    this.getSnapShotStream();
        //}
    }


    ngOnInit() {
        this.treeShow = true;
        this.propertyShow = false;
    }
    ngAfterViewInit(): void {
      if(this.optionConfig){
        if (this.optionConfig.readerType !== ModelReaderType.Scs) {
          this.openStream(this.optionConfig);
        }
      }
    }
    ngOnDestroy() {
        if (this.viewer) {
            this.viewer.shutdown();
        }
    }
    /*
     scs 模式
     */
    scsStream(option: ModelBroweOption) {
      console.log('4'+ new Date().valueOf());
        let config = {
            containerId: 'viewerContainer',
            // endpointUri: option.serverUrl,
            // buffer: option.bufferData
        };
        if(option.bufferData && option.bufferData.byteLength>0){
          config['buffer'] = option.bufferData;
        }else {
          config['endpointUri'] = option.serverUrl;
        }
        let _this = this;
      console.log('5'+ new Date().valueOf());
        _this.viewer = new Communicator.WebViewer(config);
      console.log('6'+ new Date().valueOf());
        _this.ui = new Communicator.Ui.Desktop.DesktopUi(_this.viewer, Communicator.ScreenConfiguration.Mobile);
      console.log('7'+ new Date().valueOf());
        _this.walk = new Communicator.Ui.Desktop.WalkMap(_this.viewer);
      console.log('8'+ new Date().valueOf());
      $('#modelBrowserWindow').hide();
        _this.viewer.start();
      console.log('9'+ new Date().valueOf());
        _this.viewer.setCallbacks({
            sceneReady: function () {
              console.log('10'+ new Date().valueOf());
                //--是模型就控制坐标朝向
                if (!_this.viewer.getModel().isDrawing()) {
                    _this.viewer.getModel().setViewAxes(new Communicator.Point3(0, -1, 0), new Communicator.Point3(0, 0, 1));
                }
                // $('#propertyWindow').draggable();
                // $('#modelBrowserWindow').draggable();
				 $('#modelBrowserWindow').hide();
            },
            modelStructureReady: function () {
              console.log('11'+ new Date().valueOf());
                if (!_this.viewer.getModel().isDrawing()) {
                    _this.viewer.getView().setViewOrientation(Communicator.ViewOrientation.Iso, 0);
                    ////平移
                    //var operator = _this.viewer.getOperatorManager().getOperator(Communicator.OperatorId.Pan) as Communicator.OperatorManager;
                    //operator.setMapping(1, 0);
                } else {
                    _this.DoSetColor();
                }
                if (option.resetValue){
                    _this.setMarkupView(option.resetValue);
                }
            },
            selection: function (selectionEvent) {
              console.log('12'+ new Date().valueOf());
                if (selectionEvent.getType() !== Communicator.SelectionType.None) {
                    let item = selectionEvent.getSelection();
                    _this.selectNode = item.getNodeId();
                }
                _this._onPartSelection(selectionEvent);
            },
			camera: function (cam) {
        console.log('13'+ new Date().valueOf());
                //thsMap.cameraFunc(cam);
                _this.printAllMarkup();
            }
        });

        _this.walkKeyHandle = _this.viewer.registerCustomOperator(_this.walk);
    }
    /*
     流模式
     */
    openStream(tmpOption: ModelBroweOption) {
        let option: ModelBroweOption  = {
          serverUrl: tmpOption.serverUrl,
          name: tmpOption.name,
          readerType: tmpOption.readerType,
          width: tmpOption.width,
          height: tmpOption.height,
          resetValue: tmpOption.resetValue,
        };
        let body = {
            class: option.readerType === ModelReaderType.ServerStream ? 'ssr_session': 'csr_session',
            params: {}
        };
        let _this = this;
        // let url = 'http://www.bimsvc.com:11182/service';
        $.ajax(option.serverUrl, {
            method: 'POST',
            // url: 'http://www.bimsvc.com:11182/service',
            data:  JSON.stringify(body),
            dataType: 'json',
            success: function(data) {
                if (data.result === 'ok') {
                let config = {
                    containerId: 'viewerContainer',
                    endpointUri: data.endpoints.ws,
                    // model: '结构模型算量配筋模型(1)~-~20171101143303',
                    model: option.name,
                    // rendererType: 'scr',
                    rendererType:  ModelReaderType.ServerStream ,
                    streamingMode: 1,
                    memoryLimit: 0
                };
                _this.viewer = new Communicator.WebViewer(config);
                _this.ui = new Communicator.Ui.Desktop.DesktopUi(_this.viewer, Communicator.ScreenConfiguration.Desktop);
                _this.walk = new Communicator.Ui.Desktop.WalkMap(_this.viewer);
                  $('#modelBrowserWindow').hide();
                _this.viewer.start();

                _this.viewer.setCallbacks({
                    sceneReady: function () {
                        //--是模型就控制坐标朝向
                        if (!_this.viewer.getModel().isDrawing()) {
                            _this.viewer.getModel().setViewAxes(new Communicator.Point3(0, -1, 0), new Communicator.Point3(0, 0, 1));
                        }
                        //
                        // let  Overlay = _this_.viewer.getOverlayManager();
                        // _this_.viewer.getOverlayManager().setVisibility(2, false);
                        // $('#propertyWindow').draggable();
                        // $('#modelBrowserWindow').draggable();
                        // $('#modelTreeContainer').prepend($('#specialitySelect'));
                        // $('#specialitySelect').show();
						$('#modelBrowserWindow').hide();
                    },
                    modelStructureReady: function () {
                        if (!_this.viewer.getModel().isDrawing()) {
                            _this.viewer.getView().setViewOrientation(Communicator.ViewOrientation.Iso, 0);
                        } else{

                            _this.DoSetColor();
                        }
                        if (option.resetValue){
                            _this.setMarkupView(option.resetValue);
                        }
                    },
                    selection: function (selectionEvent) {
                        if (selectionEvent.getType() !== Communicator.SelectionType.None) {
                            let item = selectionEvent.getSelection();
                            _this.selectNode = item.getNodeId();
                        }
                      _this._onPartSelection(selectionEvent);
                    },
					camera: function (cam) {
                        //thsMap.cameraFunc(cam);
                        _this.printAllMarkup();
                    }
                });

            }},
            error: function(){
                //请求出错处理
            }
        });
        _this.walkKeyHandle = _this.viewer.registerCustomOperator(_this.walk);
    }
    //manyou
    setWalk() {
        this.viewer.getOperatorManager().set(Communicator.OperatorId.Walk, 0);
        this.viewer.getOperatorManager().push(this.walkKeyHandle);

        this.viewer.getOperatorManager().set(this.walkKeyHandle, 1);
        this.viewer.focusInput(true);
    }
    unsetWalk() {
        this.viewer.getOperatorManager().set(Communicator.OperatorId.Navigate, 0);
        this.viewer.getOperatorManager().pop();
    }

    popOut() {
        let _this=this;
        this._viewerElement = document.getElementById("viewerContainer");
        this._poppedOutWindow = window.open("", "Viewer", "width=1200,height=900");
        let closeButton = this._poppedOutWindow.document.createElement("button");
        closeButton.innerHTML = "Restore";
        closeButton.onclick = function () {
            _this.closePopout();
        };
        this._poppedOutWindow.document.body.appendChild(this._viewerElement);
        this._poppedOutWindow.document.body.appendChild(closeButton);
        let body = this._poppedOutWindow.document.body;
        body.onbeforeunload = function () {
            _this.returnViewer();
        };
        this.viewer.moveToWindow(this._poppedOutWindow);
        this.viewer.resizeCanvas();
        this._poppedOutWindow.setTimeout(function () {
            _this.viewer.redraw();
        }, 500);

    }
    closePopout() {
        if (this._poppedOutWindow) {
            this._poppedOutWindow.close();
            this._poppedOutWindow = null;
            this.returnViewer();
        }
    }
    returnViewer() {
        let _this = this;
        let container = document.getElementById("content");
        container.appendChild(this._viewerElement);
        this.viewer.moveToWindow(window);
        this.viewer.resizeCanvas();
        window.setTimeout(function () {
            _this.viewer.redraw();
        }, 500);
    }
    checkOpt() {
        // Apparently click is better chan change? Cuz IE?
        $('input[type="checkbox"]').change(function(e) {
            let checked = $(this).prop("checked"),
                container = $(this).parent(),
                siblings = container.siblings();

            container.find('input[type="checkbox"]').prop({
                indeterminate: false,
                checked: checked
            });

            function checkSiblings(el) {

                let parent = el.parent().parent(),
                    all = true;

                el.siblings().each(function() {
                    return all = ($(this).children('input[type="checkbox"]').prop("checked") === checked);
                });

                if (all && checked) {

                    parent.children('input[type="checkbox"]').prop({
                        indeterminate: false,
                        checked: checked
                    });

                    checkSiblings(parent);

                } else if (all && !checked) {

                    parent.children('input[type="checkbox"]').prop("checked", checked);
                    parent.children('input[type="checkbox"]').prop("indeterminate", (parent.find('input[type="checkbox"]:checked').length > 0));
                    checkSiblings(parent);

                } else {

                    el.parents("li").children('input[type="checkbox"]').prop({
                        indeterminate: true,
                        checked: false
                    });

                }

            }

            checkSiblings(container);
        });

    }
    onShowTree() {
        if ($('#modelBrowserWindow').is(':hidden')) {
            $('#modelBrowserWindow').show();
            this.treeShow = true;
        }else {
            $('#modelBrowserWindow').hide();
            this.treeShow = false;
        }
    }
    onShowProperty() {
        if ($('#propertyWindow').is(':hidden')) {
            $('#propertyWindow').show();
            this.propertyShow = true;
        }else {
            $('#propertyWindow').hide();
            this.propertyShow = false;
        }
    }
    onSelectChange(value: string) {
        if (value === '请选择') {}else {
            // $(".ui-modeltree-label:contains('" + value + "')").each(function () {
            //
            // });
            let _this = this;
            $('#modelTree .ui-modeltree-label').each(function () {
                let tmp = $(this);
                if (tmp.html() === value) {
                    let tmpParent = tmp.parent().parent();
                    let id: number = parseInt((tmpParent[0].id.split('_'))[1]) ;
                    _this.viewer.getModel().setNodesVisibility([id], true);
                    tmpParent.show();
                }else if (tmp.html() === '装饰' || tmp.html() === '结构' || tmp.html() === '建筑' || tmp.html() === '轴网') {
                    let tmpParent = tmp.parent().parent();
                    let id: number = parseInt(tmpParent[0].id.split('_')[1]);
                    _this.viewer.getModel().setNodesVisibility([id], false);
                    tmpParent.hide();
                }
            });
        }
    }
    onAddPlane() {
        let _this = this;
        if (this.selectNode && this.selectNode > 0) {
            _this.viewer.getModel().getNodesBounding([this.selectNode]).then(function (boundingBox) {
                let cuttingManager = _this.viewer.getCuttingManager();
                //此处在DEMO中会取出6个。然后使用任意一个CuttingSection创建的剖面效果是一样的。
                _this._cuttingSection = cuttingManager.getCuttingSection(0);
                _this._cuttingSection.clear();//清空，保持只有一个剖面。
                //先取得模型的BoundingBox
                _this.viewer.getModel().getModelBounding(true, false).then(function (bounding) {
                    let plane = new Communicator.Plane();
                    let referenceGeometry = [];
                    let min, max;
                    let axix: Communicator.Axis = Communicator.Axis.Z;
                    switch (axix) {
                        case 0: //垂直于X轴的面
                            plane.normal.set(1, 0, 0);
                            plane.d = -bounding.max.x / 2;
                            max = bounding.max.x;
                            min = bounding.min.x;
                            referenceGeometry.push(new Communicator.Point3(0, bounding.max.y, bounding.min.z));
                            referenceGeometry.push(new Communicator.Point3(0, bounding.max.y, bounding.max.z));
                            referenceGeometry.push(new Communicator.Point3(0, bounding.min.y, bounding.max.z));
                            referenceGeometry.push(new Communicator.Point3(0, bounding.min.y, bounding.min.z));
                            break;
                        case 1://垂直到Y的面
                            plane.normal.set(0, 1, 0);
                            plane.d = -bounding.max.y / 2;
                            max = bounding.max.y;
                            min = bounding.min.y;
                            referenceGeometry.push(new Communicator.Point3(bounding.min.x, 0, bounding.min.z));
                            referenceGeometry.push(new Communicator.Point3(bounding.max.x, 0, bounding.min.z));
                            referenceGeometry.push(new Communicator.Point3(bounding.max.x, 0, bounding.max.z));
                            referenceGeometry.push(new Communicator.Point3(bounding.min.x, 0, bounding.max.z));
                            break;
                        case 2://垂直于Z轴的面
                            plane = new Communicator.Plane();
                            plane.normal.set(0, 0, 1);
                            if (boundingBox !== null) {
                                plane.d = -1 * (boundingBox.max.z + boundingBox.min.z) / 2;//选择构件的Z
                            } else {
                                plane.d = -bounding.max.z / 2;
                            }
                            max = bounding.max.z;
                            min = bounding.min.z;
                            referenceGeometry.push(new Communicator.Point3(bounding.min.x, bounding.max.y, 0));
                            referenceGeometry.push(new Communicator.Point3(bounding.max.x, bounding.max.y, 0));
                            referenceGeometry.push(new Communicator.Point3(bounding.max.x, bounding.min.y, 0));
                            referenceGeometry.push(new Communicator.Point3(bounding.min.x, bounding.min.y, 0));
                            break;
                    }

                    _this._cuttingSection.addPlane(plane, referenceGeometry);//创建剖面

                    if (!_this._cuttingSection.isActive()) {
                        _this._cuttingSection.activate();
                    }
                });
            });
        }
    }
    onCancelAnnotation() {
        $('.annotation-title').hide();
    }
    _onPartSelection = function (event) {
        let _this = this;
        //if (!this._modelStructureReady || this._volumeSelectionActive)
        //    return;
        //this._update();
        $("#propertyWindow").html("属性");
        let id = event.getSelection().getNodeId();
        if (id == null) {
            return;
        }
        let nodename = this.viewer.getModel().getNodeName(id);
        let nodetype = this.viewer.getModel().getNodeType(id);
        console.log(nodename + "---" + nodetype);
        if (nodetype == 3 && this.cutStatus)
        {
            let selectid = this.viewer.getModel().getNodeParent(id);
            let selmng = this.viewer.getSelectionManager();
            let selCounts = this.viewer.getSelectionManager().size();
            if (selCounts>1) {

            }
            else {
                selmng.clear();
                selmng.add(new Communicator.Selection.SelectionItem(selectid));
            }
        }
        let propertyTable = document.createElement("table");
        propertyTable.id = "propertyTable";
        //按构件中心旋转
        this.viewer.getModel().getNodeRealBounding(id).then(function (box) {
            let p3: Communicator.Point3 = new Communicator.Point3((box.max.x + box.min.x) / 2, (box.max.y + box.min.y) / 2, (box.max.z + box.min.z) / 2);
            let orbitOp = _this.viewer.getOperatorManager().getOperator(Communicator.OperatorId.Orbit); // access orbit operator
            orbitOp.setOrbitFallbackMode(Communicator.OrbitFallbackMode.OrbitTarget); // set a mode
            orbitOp.setOrbitTarget(p3); // set orbit center coordinate
        });
        let props_promise = this.viewer.getModel().getNodeProperties(id);
        if (props_promise) {
            props_promise.then(function (props) {
                if (props && Object.keys(props).length) {
                    //propertyTable.appendChild(_this._createRow("Property", "Value", "headerRow"));
                    propertyTable.appendChild(_this._createRow("构件名", nodename));
                    for (let key in props) {
                        propertyTable.appendChild(_this._createRow(key, props[key]));
                    }
                    //_this._update("");
                    $("#propertyWindow").append(propertyTable);
                    //$("#propertyWindow").html("属性");
                }
            });
        }
    };
    _createRow = function (key, property, classStr) {
        if (classStr === void 0) { classStr = ""; }
        let tableRow = document.createElement("tr");
        tableRow.id = "propertyTableRow_" + key + "_" + property;
        if (classStr.length > 0) {
            tableRow.classList.add(classStr);
        }
        let keyDiv = document.createElement("td");
        keyDiv.id = "propertyDiv_" + key;
        if (key.indexOf("_Revit") >= 0) {
            key = key.replace("_Revit", "");
        }
        keyDiv.innerHTML = key;
        let propertyDiv = document.createElement("td");
        propertyDiv.id = "propertyDiv_" + property;
        propertyDiv.innerHTML = property;
        tableRow.appendChild(keyDiv);
        tableRow.appendChild(propertyDiv);
        return tableRow;
    };
    onAddAnnotation(titleValue: string) {
        this.getAnnotation().then(annotation => {
            annotation.title = titleValue;
            let event: ModelBroweEvent = {
                data: annotation
            };
            this.modelEvent.next(event);
            this.titleValue = "";
            $('.annotation-title').hide();
        })
    }
    showAnnotation(): void {
        //$('.annotation-title').show();
    }
    getAnnotation():Promise<PdfViewerAnnotation> {
        let $screen = $("#content");
        let windowWidth = $screen.width();
        let windowHeight = $screen.height();
        let canvasSize = this.viewer.getView().getCanvasSize();
        let percentageOfWindow = .7;
        let windowAspect = canvasSize.x / canvasSize.y;
        let renderHeight = 480;
        let renderWidth = windowAspect * renderHeight;
        if (percentageOfWindow > 0) {
            // let renderHeight = windowHeight * percentageOfWindow;
            // let renderWidth = windowWidth * percentageOfWindow;
        }
        let dialogWidth = renderWidth + 40;
        let config = new Communicator.SnapshotConfig(canvasSize.x, canvasSize.y);
        let _this1 = this;
        return new Promise((resolve, reject) => {
            _this1.viewer.takeSnapshot(config).then(function (image) {
                _this1.snapStream = image.src;
                let antStr = _this1.getMarkupView();
                let index = image.src.indexOf('base64');
                let ctxData = image.src.substring(index + 7);
                let annotation: PdfViewerAnnotation = {
                    title: _this1.titleValue,
                    AnnotationInfo: antStr,
                    Snapshot: ctxData
                };
                resolve(annotation);

            });
        });
    }
    getSnapShotStream(): void {
        let $screen = $("#content");
        let windowWidth = $screen.width();
        let windowHeight = $screen.height();
        let canvasSize = this.viewer.getView().getCanvasSize();
        let percentageOfWindow = .7;
        let windowAspect = canvasSize.x / canvasSize.y;
        let renderHeight = 480;
        let renderWidth = windowAspect * renderHeight;
        if (percentageOfWindow > 0) {
            // let renderHeight = windowHeight * percentageOfWindow;
            // let renderWidth = windowWidth * percentageOfWindow;
        }
        let dialogWidth = renderWidth + 40;
        let config = new Communicator.SnapshotConfig(canvasSize.x, canvasSize.y);
        let _this = this;
        this.viewer.takeSnapshot(config)
            .then(function (image) {
                let xpos = (windowWidth - renderWidth) / 2;
                let $dialog = $("#snapshot-dialog");
                $("#snapshot-dialog-image").attr("src", image.src).attr("width", dialogWidth).attr("height", renderHeight + 40);
                $dialog.css({
                    top: "45px",
                    left: xpos.toString() + "px"
                });
                _this.snapStream = image.src;
                $dialog.show();
            });
    }
	  //注册注释
    printAllMarkup() {
        let _this = this;
        if (!_this.viewer.getModel().isDrawing()) return;
        let markupOpr = _this.viewer.getMarkupManager();
        let allkeys = markupOpr.getMarkupViewKeys();
        for (let i = 0; i < allkeys.length; i++) {
            //if (this.markupRegNow != allkeys[i] && this.markupRegNow!="") continue;
            if (this.markupRegisted.indexOf(allkeys[i]) >= 0)
                continue;//不重复注册
            let markupitems = markupOpr.getMarkupView(allkeys[i]).getMarkup();
            console.log(markupitems);
            for (let j = 0; j < markupitems.length; j++) {
                let regHandle = markupOpr.registerMarkup(markupitems[j]);
                if (_this._markupHandleList.indexOf(regHandle) >= 0)
                    continue;//不重复注册
                _this._markupHandleList.push(regHandle);
            }
            this.markupRegisted.push(allkeys[i]);
        }

    }
    getMarkupView(): string {
		      let view: any;
        if (this.viewer.getModel().isDrawing()) {
            let viewIdItems: any = this.viewer.getMarkupManager().getMarkupViewKeys();
            if (viewIdItems.length == 0) return;
            if (viewIdItems.length > 1) {
                for (let i = 0; i < viewIdItems.length-1; i++) {
                    //if (view._uniqueId == viewIdItems[i]) continue;
                    let markArray = this.viewer.getMarkupManager().getMarkupView(viewIdItems[i]).getMarkup();
                    for (let j = 0; j < markArray.length; j++) {
                        this._markupArray.push(markArray[j]);
                    }
                }
                view = this.viewer.getMarkupManager().getMarkupView(viewIdItems[viewIdItems.length - 1])
            }
            else
                view = this.viewer.getMarkupManager().getMarkupView(viewIdItems[0]);
            for (let x = 0; x < this._markupArray.length; x++) {
                view._markupItems.push(this._markupArray[x]);
            }
            let strMarkUp = view.forJson();
            strMarkUp = {
                views: [strMarkUp]
            };
            this._markupArray.splice(0);
            return JSON.stringify(strMarkUp);
        }

        view = this.viewer.getMarkupManager().getActiveMarkupView();
        if (view == null)
            return;

        let strMarkUp = view.forJson();
        strMarkUp = {
            views: [strMarkUp]
        };
        return JSON.stringify(strMarkUp);

        //var markups = this.viewer.getMarkupManager().exportMarkup();
        //var str = JSON.stringify(markups);
        //return str;

    }
    deleteMarkupView(): void {
		if (this.viewer.getModel().isDrawing()) {
            while (this._markupHandleList.length > 0) {
                let handle = this._markupHandleList.pop();
                this.viewer.getMarkupManager().unregisterMarkup(handle);
            }
            let view: any = this.viewer.getMarkupManager().getMarkupViewKeys();
            for (let i = 0; i < view.length; i++) {
                this.viewer.getMarkupManager().deleteMarkupView(view[i]);
               //let markview= this.viewer.getMarkupManager().getMarkupView(view[i]).getMarkup();
            }

            this.markupRegisted.splice(0);

            //this.markupRegNow = "";

            return;
        }
        let view: any = this.viewer.getMarkupManager().getActiveMarkupView();
        if (view == null)
            return;
        let strMarkUp = view.forJson();
        this.viewer.getMarkupManager().deleteMarkupView(strMarkUp.uniqueId);
    }

    deleteMarkup(): void {
        let view: any = this.viewer.getMarkupManager().getActiveMarkupView();
        if (view == null)
            return;
        let strMarkUp = view.forJson();

        let markLength = strMarkUp.markup.length;
        if (markLength > 0) {
            let markup = this.viewer.getMarkupManager().getSelectedMarkup();
            if (markup == null) return;
            let index = this.arrayIndexOf(strMarkUp.markup, markup);
            if (index > -1) {
                strMarkUp.markup.splice(index, 1);
            }
            else return;
            this.viewer.getMarkupManager().deleteMarkupView(strMarkUp.uniqueId);
            strMarkUp = {
                views: [strMarkUp]
            };
            this.setMarkupView(JSON.stringify(strMarkUp));
        }
    }
    changCanvas(): void {
        let _this = this;
        setTimeout(function () {
            _this.viewer.resizeCanvas();
        }, 300);
    }
    cuttingStatus(): void {
        this.cutStatus = !this.cutStatus;
    }
    arrayIndexOf = function (array,val) {
        for (let i = 0; i < array.length; i++) {
            if (array[i].uniqueId == val._uniqueId) return i;
        }
        return -1;
    };
    setMarkupView(viewString: string): void {
		        if (viewString == undefined) return;
        if (this.viewer.getModel().isDrawing()) {
            //while (this._markupHandleList.length > 0) {
            //    let handle = this._markupHandleList.pop();
            //    this.viewer.getMarkupManager().unregisterMarkup(handle);
            //}
            this.deleteMarkupView();

            //let obj = JSON.parse(viewString);
            //this.markupRegNow = obj.views[0].uniqueId;
            //this.viewer.getMarkupManager().loadMarkupData(obj);
            //this.viewer.getMarkupManager().refreshMarkup();
            //let id = obj.views[0].uniqueId;
            //let view1 = this.viewer.getMarkupManager().getMarkupView(id);
            //let _this = this;
            //setTimeout(function () {
            //    let view1 = _this.viewer.getMarkupManager().getMarkupView(id);
            //    if (view1 != null) {
            //        let newcamera = view1.getCamera();
            //        _this.viewer.getView().setCamera(newcamera);
            //        let strmarkup = view1.getMarkup();
            //        for (let i = 0; i < strmarkup.length; i++) {
            //            let markupHandle = _this.viewer.getMarkupManager().registerMarkup(strmarkup[i]);
            //            _this._markupHandleList.push(markupHandle);
            //        }
            //    }
            //}, 100);
            //return;
        }
        let obj = JSON.parse(viewString);
        let id = obj.views[0].uniqueId;
        this.viewer.getMarkupManager().loadMarkupData(obj);
        this.viewer.getMarkupManager().refreshMarkup();
        this.viewer.getMarkupManager().activateMarkupView(id);
        let _this = this;
        setTimeout(function () {
            _this.viewer.getMarkupManager().activateMarkupView(id,400);
        }, 100);
    }
	 //dwg反白
	DoSetColor(){
        let _this = this;
        if (!_this.viewer.getModel().isDrawing()) {
            return;
        }
	    if(_this.viewer .getModel().isDrawing())
	    {
		    _this.allComp.splice(0);
            let model = _this.viewer.getModel();
            let rootId = _this.viewer.getModel().getRootNode();
		    _this.lodChildId(model,rootId);
		    //console.log(_this.allComp.length);
		    _this.recordCount = _this.allComp.length * 2;
            for (let i=_this.allComp.length-1;i>=0;i--)
		    {
                let nodeid = _this.allComp[i];
				    this.setCompColor(model,nodeid);
		    }
	    }
    }
	setCompColor(model,nodeid)
	{
        let _this = this;
        let nodes = [];
		nodes.push(nodeid);

		model.getNodeEffectiveFaceColor(nodes,0).then(function(color){
		_this.percent++;
		//console.log(_this.percent + '-' + nodes[0]);
					if(color.r==0 && color.g==0 && color.b == 0)
						model.setNodesFaceColor(nodes,new Communicator.Color(255,255,255));
		});
		model.getNodeEffectiveLineColor(nodes,0).then(function(color){
		_this.percent++;
		//console.log(_this.percent + '-' + nodes[0]);
						if(color.r==0 && color.g==0 && color.b == 0)
						model.setNodesLineColor(nodes,new Communicator.Color(255,255,255));
		});

	}
	lodChildId(model,pid){
        let nodes = model.getNodeChildren(pid);
        for (let i=0;i<nodes.length;i++)
	    {
            let k=model.getNodeType(nodes[i]);
            let s = model.getNodeVisibility(nodes[i])
			    if(s && (k==3 || k==11))
				    this.allComp.push(nodes[i]);
			    else
				    this.lodChildId(model,nodes[i]);

	    }
	}
}

export interface ModelBroweOption {
    //模型服务器地址
    serverUrl: string;
    //名称加路径
    name: string;
    //渲染类型 1 ：服务器渲染  0：客户端渲染 2.scs
    readerType: ModelReaderType;
    width: any;
    height: any;
    bufferData?: Uint8Array;
    resetValue?: string;
}
export enum ModelReaderType {
    ClientStream = 0,
    ServerStream = 1,
    Scs          = 2
}
export interface PdfViewerAnnotation {
    title: string;
    AnnotationInfo: string;
    Snapshot: string;
}

export interface ModelBroweEvent {
    data: any;
}
