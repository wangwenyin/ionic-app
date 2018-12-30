import { Component, ViewChild, Input, Output, HostListener, EventEmitter } from '@angular/core';
import { Buffer } from 'buffer';
declare const Autodesk: any;
declare const THREE: any;
/**
 * Generated class for the ForgeModelComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'forge-model',
  templateUrl: 'forge-model.html',
})
export class ForgeModelComponent {
  static markupSvgTemp = '';

  modelOption: ForgeModelBroweOption;

  @Input()
  set forgeModelBroweOption(value: ForgeModelBroweOption) {
    this.threeModelArray = [];
    if (value && value.modelUrl) {
      // this.path = value.serverUrl;
      // this.path2d = value.f2dURl[0]; // 默认现价在第一个二位图纸
      // this.arrModelPath.push(value.serverUrl);
      // this.arrModelPath.push(value.f2dURl[0]);
      // this.viewBoxAttr = value.viewBoxAttr;
      this.modelOption = value;

      this.launchViewer();
    }
  }

  // @Output() forgeModelEvent: EventEmitter<ForgeModelBroweEvent> = new EventEmitter<ForgeModelBroweEvent>();

  @Output()
  forgeModelEvent: EventEmitter<ForgeEvent> = new EventEmitter<ForgeEvent>();

  @ViewChild('viewerContainer') viewerContainer: any;
  @ViewChild('view2D') view2D: any;

  public viewer: any;
  public viewer2D: any;
  // private path = '';
  _blockEventMain = false;
  _blockEventSecondary = false;
  // viewBoxAttr: any;

  // 移动窗口相关
  @ViewChild('view') view: any;
  private startX: any;
  private startY: any;
  private moveSwitch = false;
  private currentLeft: any;
  private currentTop: any;

  selectNodeGuid = []; // 选中构件的GUID

  subToolbar: any; // 工具条

  onToolbarCreatedBinded: any; // 工具条创建标识

  markUpManager: any; // 标记

  _treeData: any;

  annotation: any;// 3d标注


  // path2d = '';

  currentModelPath = '';
  current2DPath = '';

  // 存放三维模型model对象
  threeModelArray: Array<any>;

  currentModelName = '';

    // 是否触发Camera事件
    triggerCameraEvent = true;

  // 扩展配置
  config = {
    extensions: [
      'Autodesk.Viewing.ZoomWindow',
      'Autodesk.Viewing.MarkupsGui',
      'Autodesk.Viewing.MarkupsCore',
      'Autodesk.Measure',
      'Autodesk.BimWalk',
      'Autodesk.ADN.Viewing.Extension.Annotation'
      // 'Autodesk.FirstPerson'
    ],
    disabledExtensions: {
      measure: false,
      section: false,
    }
  };

  constructor() { }

  launchViewer() {
    if (this.viewer) {
      return;
    }
    const options = {
      env: 'Local',
      offline: 'true',
      useADP: false,
      language: 'zh-Hans'  // 设置语言
    };
    this.viewer = new Autodesk.Viewing.Private.GuiViewer3D(this.viewerContainer.nativeElement, this.config);

    // 加载2D模型
    this.viewer2D = new Autodesk.Viewing.Private.GuiViewer3D(this.view2D.nativeElement, this.config);
    // 模型初始化
    Autodesk.Viewing.Initializer(options, () => {
      this.viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, (event) => this.selectionChanged());
      this.viewer2D.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, (event) => this.selectionChanged2D());
      // 加载三维模型
      this.viewer.addEventListener(Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT, (event) => {
        if (this.triggerCameraEvent === true) {
          this.selectionChanged();
        }
      });
      if (this.modelOption.modelUrl instanceof Array) {
        // this.modelOption.modelUrl.forEach(data => {
        //   if (data.threeUrl && data.threeUrl.length > 0) {
        //     this.viewer.load(data.threeUrl, null, null, null, {
        //       placementTransform: THREE.Matrix4
        //     });
        //     this.currentModelPath = data.threeUrl;
        //   }
        // });
        const threeUrlArray = this.modelOption.modelUrl.map(data => data.threeUrl);
        const _self = this;
        this.processArray(this.viewer, threeUrlArray, this.promiseEachModel, this.globalDocumentLoad)
          .then(function (result) {
            _self.threeModelArray = result;
            _self.addEventListener();
            _self.loadExtensionMarkupsCore();
            const event: ForgeEvent = {
              type: ForgeEventType.ModelLoadOver,
            };
            _self.forgeModelEvent.next(event);
          }, function (reason) {
          });
      } else if (this.modelOption.modelUrl && this.modelOption.modelUrl.threeUrl && this.modelOption.modelUrl.threeUrl.length > 0) {
        this.viewer.start();
        this.currentModelPath = this.modelOption.modelUrl.threeUrl;
         this.currentModelName = this.modelOption.modelUrl.modelName;
        this.viewer.load(this.currentModelPath, null, _ => {
          this.viewer.addEventListener(
            Autodesk.Viewing.GEOMETRY_LOADED_EVENT, (evt) => {
              evt.model['modelName'] = this.currentModelName;
              this.threeModelArray.push(evt.model);
              this.addEventListener();
              this.loadExtensionMarkupsCore();
              const event: ForgeEvent = {
                type: ForgeEventType.ModelLoadOver,
              };
              this.forgeModelEvent.next(event);
            });
        }, _ => { });
      }
      // 创建三维模型视窗工具
      this.viewer.createViewCube();

      // // 注册批注画完得回调 yuan
      // this.viewer.loadExtension('Autodesk.Viewing.MarkupsCore').then(markupCore => {
      //   markupCore.registerCreationEndEvent(() => {
      //     this.snapshotButtonCallback(this.viewer, markupCore).then(data => {
      //       const event: ForgeEvent = {
      //         type: ForgeEventType.MarkupCreationEnd,
      //         data: data
      //       };
      //       this.forgeModelEvent.next(event);
      //     });
      //   });
      // });
      // 增加自定义菜单功能
      this.viewer.registerContextMenuCallback('MyChangingColorMenuItems', (menu, status) => {
        if (status.hasSelected) {
          if (this.modelOption.menuProperty && this.modelOption.menuProperty.AddQualityQuestionMenu) {
            menu.push({
              title: '添加质量问题',
              target: () => {
                this.addQuestion(this.viewer, ForgeEventType.AddQualityQuestion, this.forgeModelEvent);
              }
            });
          }
          if (this.modelOption.menuProperty && this.modelOption.menuProperty.AddDailyQualityJianChaMenu) {
            menu.push({
              title: '日常质量检查',
              target: () => {
                this.addQuestion(this.viewer, ForgeEventType.DailyQualityJianCha, this.forgeModelEvent);
              }
            });
          }
          if (this.modelOption.menuProperty && this.modelOption.menuProperty.AddImportQualityQuestionMenu) {
            menu.push({
              title: '重大质量问题',
              target: () => {
                this.addQuestion(this.viewer, ForgeEventType.ImportQualityQuestion, this.forgeModelEvent);
              }
            });
          }
          if (this.modelOption.menuProperty && this.modelOption.menuProperty.AddDailyQualityXunChaMenu) {
            menu.push({
              title: '日常质量巡查',
              target: () => {
                this.addQuestion(this.viewer, ForgeEventType.DailyQualityXunCha, this.forgeModelEvent);
              }
            });
          }

          if (this.modelOption.menuProperty && this.modelOption.menuProperty.AddSafeQuestionMenu) {
            menu.push({
              title: '添加安全问题',
              target: () => {
                this.addQuestion(this.viewer, ForgeEventType.AddSafeQuestion, this.forgeModelEvent);
              }
            });
         }
         
         if (this.modelOption.menuProperty && this.modelOption.menuProperty.AddDailySafeQuestionJianChaMenu) {
          menu.push({
            title: '日常安全文明检查',
            target: () => {
              this.addQuestion(this.viewer, ForgeEventType.DailySafeQuestionJianCha, this.forgeModelEvent);
            }
          });
       }
         if (this.modelOption.menuProperty && this.modelOption.menuProperty.ShowFileMenu) {
          menu.push({
            title: '附件',
            target: () => {
              this.appendFileContextMenu(this.viewer, this.forgeModelEvent);
            }
          });
         }
         if (this.modelOption.menuProperty && this.modelOption.menuProperty.ShowQrcodeMenu) {
          menu.push({
            title: '二维码',
            target: () => {
              this.qrCodeContextMenu(this.viewer, this.forgeModelEvent);
            }
          });
        }
        } else {
          if (this.modelOption.menuProperty && this.modelOption.menuProperty.ShowQualityQuestionMenu) {
          menu.push({
            title: '显示质量问题',
            target: () => {
              this.forgeModelEvent.next({
                type: ForgeEventType.ShowQualityQuestion,
              });
            }
          });
        }
        if (this.modelOption.menuProperty && this.modelOption.menuProperty.ShowSafeQuestionMenu) {
          menu.push({
            title: '显示安全问题',
            target: () => {
              this.forgeModelEvent.next({
                type: ForgeEventType.ShowSafeQuestion,
              });
            }
          });
        }
        }
      });

      this.load2D();
      // 设置反转鼠标缩放方向
      const defaultValues = {
        'reverseMouseZoomDir': true    // 反转鼠标缩放方向
      };
      this.loadPrefs(this.viewer, defaultValues);

       // 加载3d标注扩展
       this.viewer.loadExtension('Autodesk.ADN.Viewing.Extension.Annotation').then(annotation => {
        this.annotation = annotation;
      });

    });

    // 加载自定义按钮
    this.loadButtom();

    if (this.modelOption.viewBoxAttr) {
      this.setViewBoxAttr();
    }
  }

  /**
   * 添加事件监听
   *
   * @memberof ForgeModelBrowComponent
   */
  addEventListener() {
    // fitToView应用操作时触发，支持多模型上下文。
    this.viewer.addEventListener(Autodesk.Viewing.AGGREGATE_FIT_TO_VIEW_EVENT,
      data => {
        const event: ForgeEvent = {
          type: ForgeEventType.AGGREGATE_FIT_TO_VIEW_EVENT,
          data: data
        };
        this.forgeModelEvent.next(event);
      });
    // 相机更换时触发
    this.viewer.addEventListener(Autodesk.Viewing.CAMERA_CHANGE_EVENT,
      camera => {
        if (this.triggerCameraEvent === true) {
          const event: ForgeEvent = {
            type: ForgeEventType.CAMERA_CHANGE_EVENT,
            data: this.viewer.getCamera()
          };
          this.forgeModelEvent.next(event);
        }
      });
    this.viewer.container.addEventListener('mousemove', e => {
      this.triggerCameraEvent = true;
    });
    // this.viewer.addEventListener(Autodesk.Viewing.HIDE_EVENT,
    //   data => {
    //     console.log('HIDE_EVENT: ' + JSON.stringify(data));
    //   });
    // this.viewer.addEventListener(Autodesk.Viewing.SHOW_EVENT,
    //   data => {
    //     console.log('SHOW_EVENT: ' + JSON.stringify(data));
    //   });
  }
  loadExtensionMarkupsCore() {
      // 注册批注画完得回调 yuan
      this.viewer.loadExtension('Autodesk.Viewing.MarkupsCore').then(markupCore => {
        markupCore.registerCreationEndEvent(() => {
          this.snapshotButtonCallback(this.viewer, markupCore).then(data => {
            const event: ForgeEvent = {
              type: ForgeEventType.MarkupCreationEnd,
              data: data
            };
            this.forgeModelEvent.next(event);
          });
        });
      });
  }
  /**
   * 异步处理模型的加载
   *
   * @param {*} url
   * @param {*} viewer
   * @param {*} globalDocumentLoad
   * @returns
   * @memberof ForgeModelBrowComponent
   */
  promiseEachModel(url, viewer: any, globalDocumentLoad: any) {
    return new Promise((resolve, reject) => {
      function _onLoadModelSuccess(model) {
        viewer.addEventListener(
          Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
          _onGeometryLoaded
        );
      }
      function _onLoadModelError(viewerErrorCode) {
        reject(' Loading Failed!' + viewerErrorCode);
      }

      function _onGeometryLoaded(evt) {
        viewer.removeEventListener(
          Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
          _onGeometryLoaded
        );
        resolve('  Geometry Loaded!');
      }
      globalDocumentLoad(
        viewer,
        url,
        _onLoadModelSuccess,
        _onLoadModelError
      );
    });
  }
  /**
   * 处理多个模型的加载
   *
   * @param {*} viewer
   * @param {*} array
   * @param {*} fn
   * @param {*} fn2
   * @returns
   * @memberof ForgeModelBrowComponent
   */
  processArray(viewer, array, fn, fn2) {
    const results = [];
    return array.reduce(function (p, item) {
      return p.then(function () {
        return fn(item, viewer, fn2).then(function (data) {
          results.push(data);
          return results;
        });
      });
    }, Promise.resolve());
  }
  /**
   *  模型加载
   *
   * @param {*} viewer
   * @param {*} svfUrl
   * @param {*} _onLoadModelSuccess
   * @param {*} _onLoadModelError
   * @memberof ForgeModelBrowComponent
   */
  globalDocumentLoad(viewer, svfUrl, _onLoadModelSuccess, _onLoadModelError) {
    const loadOptions = {
    };
    if (!viewer.model) {
      viewer.start(
        svfUrl,
        loadOptions,
        _onLoadModelSuccess,
        _onLoadModelError
      );
    } else {
      loadOptions['globalOffset'] = viewer.model.getData().globalOffset;
      viewer.loadModel(
        svfUrl,
        loadOptions,
        _onLoadModelSuccess,
        _onLoadModelError
      );
    }
  }
  /**
   * 加载二维图纸
   *
   * @returns
   * @memberof ForgeModelBrowComponent
   */
  load2D() {
    if (this.modelOption.modelUrl instanceof Array) {
      this.modelOption.modelUrl.some(data => {
        if (data.dwgUrl && data.dwgUrl.length > 0) {
          if (data.dwgUrl instanceof Array) {
            return data.dwgUrl.some(data2 => {
              if (data2 && data2.length > 0) {
                this.current2DPath = data2;
                return true;
              }
              return false;
            });
          } else {
            this.current2DPath = data.dwgUrl;
            return true;
          }
        }
      });
    } else if (this.modelOption.modelUrl) {
      if (this.modelOption.modelUrl.dwgUrl && this.modelOption.modelUrl.dwgUrl.length > 0) {
        if (this.modelOption.modelUrl.dwgUrl instanceof Array) {
          return this.modelOption.modelUrl.dwgUrl.some(data2 => {
            if (data2 && data2.length > 0) {
              this.current2DPath = data2;
              return true;
            }
            return false;
          });
        } else {
          this.current2DPath = this.modelOption.modelUrl.dwgUrl;
        }
      }
    }
    if (this.current2DPath && this.current2DPath.length > 0) {
      this.viewer2D.start();
      this.viewer2D.load(this.current2DPath);
    } else {
      document.getElementById('min-viewer').style.display = 'none';
    }
  }
  /**
   * 设置模型浏览窗口的位置
   */
  setViewBoxAttr() {
    const viewbox = document.getElementById('viewer3D');
    viewbox.style.height = this.modelOption.viewBoxAttr.height;
    viewbox.style.width = this.modelOption.viewBoxAttr.width;
    viewbox.style.left = this.modelOption.viewBoxAttr.left;
    viewbox.style.top = this.modelOption.viewBoxAttr.top;
  }

  loadButtom() {
    if (this.viewer.toolbar) {
      // Toolbar is already available, create the UI
      this.createUI();
    } else {
      // Toolbar hasn't been created yet, wait until we get notification of its creation
      this.onToolbarCreatedBinded = this.onToolbarCreated.bind(this);
      this.viewer.addEventListener(Autodesk.Viewing.TOOLBAR_CREATED_EVENT, this.onToolbarCreatedBinded);
    }
    return true;
  }

  onToolbarCreated = () => {
    this.viewer.removeEventListener(Autodesk.TOOLBAR_CREATED_EVENT, this.onToolbarCreatedBinded);
    this.onToolbarCreatedBinded = null;
    this.createUI();
  }

  createUI() {
    const viewer = this.viewer.getToolbar(true);
    const navTools = viewer.getControl(Autodesk.Viewing.TOOLBAR.SETTINGSTOOLSID);
    navTools.removeControl('toolbar-fullscreenTool');
    navTools.removeControl('toolbar-settingsTool');
    const button3 = new Autodesk.Viewing.UI.Button('question-add');
    button3.onClick = () => {
      this.getAllSelectPartOutput(true).then((info) => {
        const event: ForgeEvent = {
          type: ForgeEventType.AddQuestion,
          data: info
        };
        this.forgeModelEvent.next(event);
      })  
    };
    button3.setToolTip('新增');
    button3.icon.style = '  font-family:"iconfont" !important;font-size:24px;font-style:normal;'
      + '-webkit-font-smoothing: antialiased;-moz-osx-font-smoothing: grayscale;';
    button3.setIcon('icon-jiahao');
    if(this.modelOption.addMenuFlag) navTools.addControl(button3,3);
    // const buttonView = new Autodesk.Viewing.UI.Button('showView');
    // buttonView.onClick = () => {
    //   this.showView();
    // };
    // buttonView.setToolTip('模型显示');
    // buttonView.icon.style = '  font-family:"iconfont" !important;font-size:24px;font-style:normal;'
    //   + '-webkit-font-smoothing: antialiased;-moz-osx-font-smoothing: grayscale;';
    // buttonView.setIcon('icon-new-page');
    // 自订义工具组
    // this.subToolbar = new Autodesk.Viewing.UI.ControlGroup( 'my-custom-view-toolbar' );
    // viewer.toolbar.addControl(this.subToolbar);
    // navTools.addControl(button3, 3);
    // navTools.addControl(buttonView, 4);

    // this.addSnapshotButton(this.viewer, navTools, 5, this.snapshotButtonCallback);
  }
  /**
    * 增加快照按钮
    *
    * @param {*} viewer
    * @param {*} navTools
    * @param {number} index
    * @param {ImagePreviewService} imagePreviewService
    * @param {(viewer: any, imagePreviewService: ImagePreviewService) => void} [snapshotButtonCallback]
    * @memberof ForgeModelBrowComponent
    */
  addSnapshotButton(viewer: any, navTools: any, index: number,
    snapshotButtonCallback?: (viewer: any) => Promise<MarkupInfo>) {
    const bt = new Autodesk.Viewing.UI.Button('snapshot');
    bt.onClick = () => {
      snapshotButtonCallback(viewer).then(data => {
      });
    };
    bt.setToolTip('快照');
    bt.icon.style = 'font-family:"iconfont" !important;font-size:24px;font-style:normal'
      + '-webkit-font-smoothing: antialiased;-moz-osx-font-smoothing: grayscale;';
    bt.setIcon('icon-new-page');
    navTools.addControl(bt, index);
  }
  /**
   * 快照回调
   *
   * @param {*} viewer
   * @param {*} [markupCore]
   * @returns {Promise<MarkupInfo>}
   * @memberof ForgeModelBrowComponent
   */
  snapshotButtonCallback(viewer: any, markupCore?: any): Promise<MarkupInfo> {
    return new Promise((resolve, reject) => {
      viewer.getScreenShot(viewer.container.clientWidth, viewer.container.clientHeight, function (blobURL) {
        if (markupCore) {
          const screenshot = new Image();
          screenshot.src = blobURL;
          screenshot.onload = function () {
            const canvasTmp = document.createElement('canvas');
            canvasTmp.width = viewer.container.clientWidth;
            canvasTmp.height = viewer.container.clientHeight;
            const ctx = canvasTmp.getContext('2d');
            ctx.clearRect(0, 0, canvasTmp.width, canvasTmp.height);
            ctx.drawImage(screenshot, 0, 0, canvasTmp.width, canvasTmp.height);
            // markupCore.renderToCanvas(ctx);
            const markupSvg = markupCore.generateData();
            let content;
            if (ForgeModelComponent.markupSvgTemp && ForgeModelComponent.markupSvgTemp.length > 0) {
              content = markupSvg.replace(ForgeModelComponent.markupSvgTemp, '');
            } else {
              content = markupSvg;
            }
            const imgDate = (new Buffer(content, 'utf8')).toString('base64');
            const start = markupSvg.indexOf('>') + 1;
            const end = markupSvg.indexOf('</svg>');
            ForgeModelComponent.markupSvgTemp = markupSvg.substring(start, end);
            const svgImg = new Image();
            svgImg.src = 'data:image/svg+xml;base64,' + imgDate;
            svgImg.onload = function () {
              ctx.drawImage(svgImg, 0, 0, canvasTmp.width, canvasTmp.height);
              const ctxData = canvasTmp.toDataURL('image/png', 1);
              const markupInfo: MarkupInfo = {
                snapshot: ctxData,
                content: content
              };
              resolve(markupInfo);
            };
          };
        } else {
          // imagePreviewService.showImage(blobURL);
          const markupInfo: MarkupInfo = {
            snapshot: blobURL,
            content: ''
          };
          resolve(markupInfo);
        }
      });
    });
  }
  /**
   * 附件菜单事件处理
   *
   * @param {*} viewer
   * @param {EventEmitter<ForgeEvent>} forgeModelEvent
   * @memberof ForgeModelBrowComponent
   */
  appendFileContextMenu(viewer: any, forgeModelEvent: EventEmitter<ForgeEvent>) {
    const selSet = this.viewer.getSelection() as Array<number>;
    const selectParts = selSet.map(dbid => {
      return this.getPartProperties(dbid).then(data => {
        return {
          partId: dbid,
          rvtPartId: data.externalId
        };
      });
    });
    Promise.all(selectParts).then(result => {
      forgeModelEvent.next({
        type: ForgeEventType.Attachment,
        data: result
      });
    });
  }
  /**
   * 二维码菜单事件处理
   *
   * @param {*} viewer
   * @param {EventEmitter<ForgeEvent>} forgeModelEvent
   * @memberof ForgeModelBrowComponent
   */
  qrCodeContextMenu(viewer: any, forgeModelEvent: EventEmitter<ForgeEvent>) {
    const selSet = viewer.getSelection() as Array<number>;
    const selectParts = selSet.map(dbid => {
      return this.getPartProperties(dbid).then(data => {
        return {
          partId: dbid,
          rvtPartId: data.externalId
        };
      });
    });
    Promise.all(selectParts).then(result => {
      forgeModelEvent.next({
        type: ForgeEventType.QRCode,
        data: result
      });
    });
  }
  /**
   * 新增质量，安全问题
   *
   * @param {*} viewer
   * @param {EventEmitter<ForgeEvent>} forgeModelEvent
   * @memberof ForgeModelBrowComponent
   */
  addQuestion(viewer: any, questionType: ForgeEventType, forgeModelEvent: EventEmitter<ForgeEvent>) {
    // const selSet = viewer.getSelection() as Array<number>;
    // const dbid = selSet[0];
    // this.getPartProperties(dbid).then(data => {
    //   forgeModelEvent.next({
    //     type: questionType,
    //     data: {
    //       partId: dbid,
    //       rvtPartId: data.externalId
    //     }
    //   });
    // });
    this.getAllSelectPart(viewer, this.threeModelArray, this.getPartProperties).then(data => {
      forgeModelEvent.next({
        type: questionType,
        data: data
      });
    });
  }
  /**
   * 获取构件属性
   *
   * @param {*} viewer
   * @param {number} dbid
   * @returns {Promise<any>}
   * @memberof ForgeModelBrowComponent
   */
  getPartProperties(dbid: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this.viewer.getProperties(dbid, function (data) {
        resolve(data);
      });
    });
  }
  modelViewerChanged() {
    // 先卸载模型
    this.UnLoadModel();



    const tempPath = this.current2DPath;
    this.current2DPath = this.currentModelPath;
    this.currentModelPath = tempPath;

    // 加载二三维模型
    // const str2DPath = this.arrModelPath[0];
    this.viewer2D.start();
    this.viewer2D.load(this.current2DPath);

    // const str3DPath = this.arrModelPath[1];
    this.viewer.start();
    this.viewer.load(this.currentModelPath);

    // 加载扩展
    this.viewer.loadExtension('Autodesk.Viewing.MarkupsGui');
    this.viewer.loadExtension('Autodesk.Viewing.MarkupsCore');
    this.viewer.loadExtension('Autodesk.BimWalk');

    this.viewer2D.loadExtension('Autodesk.Viewing.MarkupsGui');
    this.viewer2D.loadExtension('Autodesk.Viewing.MarkupsCore');
    this.viewer2D.loadExtension('Autodesk.BimWalk');

    // 交换二三维模型路径
    // this.arrModelPath = [];
    // this.arrModelPath.push(str3DPath, str2DPath);
  }

  /**
   * 模型刷新
   * @param width 模型宽度
   * @param height 模型高度
   */
  modelRefresh(width: number, height: number) {
    this.viewer.impl.resize(width, height);
    this.viewer.impl.invalidate(true, true, true);
  }
  /**
   *
   * 模型选中事件
   * @returns
   * @memberof ForgeModelBrowComponent
   */
  selectionChanged() {
    if (this._blockEventSecondary) {
      return;
    }
    this._blockEventMain = true;
    const arrSel = this.viewer.getSelection();
    if (arrSel.length !== 0) {
      //this.viewer2D.select(arrSel);
      //this.viewer2D.fitToView(arrSel);

      // 3D 模型的选中构件事件
      const event: ForgeEvent = {
        type: ForgeEventType.Select3DPart,
        data: arrSel
      };
      this.forgeModelEvent.next(event);
    }
    this._blockEventMain = false;
  }
  /**
   * 图纸选中事件
   *
   * @returns
   * @memberof ForgeModelBrowComponent
   */
  selectionChanged2D() {
    if (this._blockEventMain) {
      return;
    }
    this._blockEventSecondary = true;
    const arrSel = this.viewer2D.getSelection();
    if (arrSel.length !== 0) {
      this.viewer.select(arrSel);
      this.viewer.fitToView(arrSel);

      // 2D 图纸的选中构件事件
      const event: ForgeEvent = {
        type: ForgeEventType.Select3DPart,
        data: arrSel
      };
      this.forgeModelEvent.next(event);

    }
    this._blockEventSecondary = false;
  }

  /**
   * 设置鼠标缩放反转
   * @param viewer 3D，2D视图
   * @param defaults 配置
   */
  loadPrefs(viewer, defaults) {
    for (const name in defaults) {
      if (defaults.hasOwnProperty(name)) {
        viewer.prefs.set(name, defaults[name]);
      }
    }
  }
  // 卸载模型
  UnLoadModel(): void {
    this.viewer.tearDown();
    this.viewer.setUp();
    this.viewer2D.tearDown();
    this.viewer2D.setUp();
  }
  // 获得构件属性
  GetProptiers(): void {
    const sel = this.viewer.getSelection();
    // 考察选择集中第一个对象的属性信息
    this.viewer.getProperties(sel[0], function (objProp) {
      if (objProp) {
        // 遍历每个属性
        // tslint:disable-next-line:forin
        for (const index in objProp.properties) {
          const Prop = objProp.properties[index];
        }
      }
    });
  }
  // 设置颜色
  SetColor(): void {
    const sel = this.viewer.getSelection();
    const color = new THREE.Vector4(255 / 255, 0, 0, 1);
    for (let i = 0; i < sel.length; i++) {
      this.viewer.setThemingColor(sel[i], color);
    }
  }
  // 还原颜色
  ReSetColor(): void {
    this.viewer.clearThemingColors();
  }
  // x剖切面
  SetXPane(): void {
    this.viewer.setCutPlanes([new THREE.Vector4(-1, 0, 0, 0)]);
  }


  /**
   * 获取所有选中构件dbid
   * @returns list[]
   */
  getAllChildIdList() {
    const targets = this.viewer.getSelection();
    const list = [];
    if (targets) {
      for (let i = 0; i < targets.length; i++) {
        this._RecursionGetChild(targets[i], list);
      }
    } else {
      return;
    }
    return list;
  }

  /**
   * 递归查询子节点
   * @param id
   * @param list
   */
  _RecursionGetChild(id, list) {
    const thisbak = this;
    const length = this._treeData.getNumChildren(id);
    if (length < 1) {
      if (list.indexOf(id) === -1) {
        list.push(id);
      }

      return;
    }
    this._treeData.enumNodeChildren(id, function (event) {
      thisbak._RecursionGetChild(event, list);
    });
  }

  /**
   *  获得当前选中构件GUID、
   *  @param dbidArry 选中的构件的dbid
   */
  public getComponentGuid(dbidArry: Array<number>): void {
    const thisbak = this;
    this.selectNodeGuid = [];
    dbidArry.forEach((dbid) => {
      this.viewer.getProperties(dbid, function (data) {
        if (data) {
          thisbak.selectNodeGuid.push(data.externalId);
        }
      });
    });
  }


  /**
   * 设置模型显示选中模型隐藏或者显示（及半透明）
   * @param selectModelArry
   * @param hideOrShowFlag true:显示 false：隐藏
   * @param setCollorFlag 是否试着颜色
   * @param color 颜色 var color = new THREE.Vector4( 255/255, 0, 0, 1 );
   *
   */
  setSelectedModelShowOrHide(selectModelArry: Array<number>, hideOrShowFlag: boolean,
    setCollorFlag?: boolean, color?: any) {
    if (hideOrShowFlag) {
      this.viewer.hide(this.viewer.model.getRootId());
      // 显示选中构件
      this.viewer.clearThemingColors();  // 模型颜色还原
      selectModelArry.forEach((data) => {
        this.viewer.show(data);
        if (setCollorFlag) {
          this.viewer.setThemingColor(data, color);
        }
      });
    } else {
      // 隐藏选中构件
      selectModelArry.forEach((data) => {
        this.viewer.hide(data);
      });
    }
  }

  /**
  * 模型还原显示
  */
  showModel(): void {
    this.viewer.show(this.viewer.model.getRootId());
    this.viewer.impl.visibilityManager.setNodeOff(this.viewer.model.getRootId(), false);
  }

  // 隐藏模型
  hidModel(): void {
    const arrMods = this.viewer.impl.modelQueue().getModels();
    this.viewer.hide(this.viewer.model.getRootId());
    this.viewer.impl.visibilityManager.setNodeOff(this.viewer.model.getRootId(), true);

  }

  /**
   * 获取当前所有标注信息和截图
   *
   * @returns {Promise<MarkupInfo>}
   * @memberof ForgeModelBrowComponent
   */
  getAllMarkInfo(): Promise<MarkupInfo> {
    const _self = this;
    return new Promise((resolve, reject) => {
      this.viewer.getScreenShot(this.viewer.container.clientWidth, this.viewer.container.clientHeight, function (blobURL) {
        const screenshot = new Image();
        screenshot.src = blobURL;
        screenshot.onload = function () {
          const canvasTmp = document.createElement('canvas');
          canvasTmp.width = _self.viewer.container.clientWidth;
          canvasTmp.height = _self.viewer.container.clientHeight;
          const ctx = canvasTmp.getContext('2d');
          ctx.clearRect(0, 0, canvasTmp.width, canvasTmp.height);
          ctx.drawImage(screenshot, 0, 0, canvasTmp.width, canvasTmp.height);
          // 获取MarkUPSCore 扩展
          const markupsCore = _self.viewer.getExtension('Autodesk.Viewing.MarkupsCore');
          // 获取标记字符串
          const markSVG = markupsCore.generateData();
          const imgDate = (new Buffer(markSVG, 'utf8')).toString('base64');
          const svgImg = new Image();
          svgImg.src = 'data:image/svg+xml;base64,' + imgDate;
          svgImg.onload = function () {
            ctx.drawImage(svgImg, 0, 0, canvasTmp.width, canvasTmp.height);
            const ctxData = canvasTmp.toDataURL('image/png', 1);
            const markupInfo: MarkupInfo = {
              snapshot: ctxData,
              content: markSVG
            };
            resolve(markupInfo);
          };
        };
      });
    });
  }

  @HostListener('document:mousemove', ['$event']) onMousemove(e) {
    // 判断该元素是否被点击了。
    if (this.moveSwitch) {
      const x = e.clientX; // 鼠标点击时的X轴上的坐标
      const y = e.clientY; // 鼠标点击时的Y轴上的坐标
      const distanceX = x - this.startX; // X轴上获得移动的实际距离
      const distanceY = y - this.startY; // Y轴上获得移动的实际距离
      // currentLeft下面的方法会有解释，需要注意最后要添加PX单位，如果给left赋值会破坏文档流，不加单位就会无效
      this.view.nativeElement.style.left = (distanceX + this.currentLeft) + 'px';
      this.view.nativeElement.style.top = (distanceY + this.currentTop) + 'px';
    }
  }
  mouseDown(e) {　　　// 鼠标按下事件
    e = e ? e : window.event; // 因为兼容问题，event可能在隐藏参数中，如果隐藏参数没有event事件，则可以使用全局的事件window.event（大家记住写法就可以了）
    this.moveSwitch = true;
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.currentLeft = this.view.nativeElement.offsetLeft; // 通过对象获取对象的坐标
    this.currentTop = this.view.nativeElement.offsetTop;
  }
  mouseUp() {
    this.moveSwitch = false;
  }
  closeView() {
    this.view.nativeElement.style = "display: none;";
  }
  showView() {
    if (this.view.nativeElement.style.display === 'block') {
      this.view.nativeElement.style.display = 'none'
    } else {
      this.view.nativeElement.style.display = 'block'
      if (!this.viewer2D) {
        this.viewer2D = new Autodesk.Viewing.Private.GuiViewer3D(this.view2D.nativeElement, this.config);
        this.viewer2D.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, (event) => this.selectionChanged2D());
        this.viewer2D.start();
        this.viewer2D.load(this.current2DPath);
      }
    }
  }
  /**
   * 显示隐藏工具栏
   *
   * @memberof ForgeModelComponent
   */
  setToolbarVisible() {
    const toolBar = document.getElementById('guiviewer3d-toolbar');
    toolBar.style.display = toolBar.style.display === 'none' ? 'block' : 'none';
    // const toolBar = this.viewer.getToolbar(true);
    // toolBar.setVisible(!toolBar.isVisible());
    // const navTools = toolBar.getControl(Autodesk.Viewing.TOOLBAR.SETTINGSTOOLSID);
    // navTools.setVisible(!navTools.isVisible());
  }
  /**
   * 切换模型
   * @param value
   */
  switchModel(value: ForgeModelBroweOption) {
    // 先卸载模型
    this.viewer.tearDown();
    this.viewer.setUp();
    // this.viewer2D.tearDown();
    // this.viewer2D.setUp();

    const tempModelUrl = value.modelUrl as ModelUrl;
    if (tempModelUrl.dwgUrl instanceof Array && tempModelUrl.dwgUrl.length > 0) {
      this.current2DPath = tempModelUrl.dwgUrl[0];
      this.viewer2D.load(this.current2DPath);
      this.viewer2D.loadExtension('Autodesk.Viewing.MarkupsGui');
      this.viewer2D.loadExtension('Autodesk.Viewing.MarkupsCore');
      this.viewer2D.loadExtension('Autodesk.BimWalk');
    } else if (tempModelUrl.dwgUrl && tempModelUrl.dwgUrl.length > 0) {
      this.current2DPath = tempModelUrl.dwgUrl as string;
      this.viewer2D.load(this.current2DPath);
      this.viewer2D.loadExtension('Autodesk.Viewing.MarkupsGui');
      this.viewer2D.loadExtension('Autodesk.Viewing.MarkupsCore');
      this.viewer2D.loadExtension('Autodesk.BimWalk');
    }

    if (tempModelUrl.threeUrl && tempModelUrl.threeUrl.length > 0) {
      this.currentModelPath = tempModelUrl.threeUrl;
      this.viewer.load(this.currentModelPath);
      this.currentModelName = tempModelUrl.modelName;
        // 加载扩展
      this.viewer.loadExtension('Autodesk.Viewing.MarkupsGui');
      this.viewer.loadExtension('Autodesk.Viewing.MarkupsCore');
      this.viewer.loadExtension('Autodesk.BimWalk');
    }
  }

   /**
   *
   * 获取选中的构件信息 yuan
   * @param {boolean} [isIncludeChild]
   * @returns
   * @memberof ForgeModelBrowComponent
   */
  getAllSelectPartOutput(isIncludeChild?: boolean) {
    return this.getAllSelectPart(this.viewer, this.threeModelArray, this.getPartProperties, isIncludeChild);
  }

  /**
   * 获取选中的构件信息 yuan
   * @param viewer
   * @param threeModelArray
   * @param isIncludeChild
   */
  private getAllSelectPart(viewer, threeModelArray: Array<any>, getPartProperties: any, isIncludeChild?: boolean):
    Promise<Array<PartInfo>> {
    const result = {};
    viewer.getAggregateSelection((model, dbid) => {
      const id = model.id;
      if (!result[id]) {
        result[id] = [];
      }
      const ids = this.getModelChildPart(dbid, model, true);
      ids.push(dbid);
      result[id] = result[id].concat(ids);
    });
    let tempSelectPart = [];

    for (const i in result) {
      if (result[i] && result[i].length > 0) {
        const model = threeModelArray.find(item => {
          return item.id === parseInt(i, 0);
        });
        const selectParts = result[i].map(dbid => {
          return new Promise((resolve, reject) => {
            model.getProperties(dbid, function (data) {
              console.log('dbid Properties:' + JSON.stringify(data));
              resolve({
                partId: dbid,
                rvtPartId: data.externalId,
                floorName: data.properties[1].displayName,
                name: data.name,
                modelName: model['modelName']
              });
            });
          });
        });
        tempSelectPart = tempSelectPart.concat(selectParts);
      }
    }

    return Promise.all(tempSelectPart);
  }

  /**
   * 获取子节点
   *
   * @private
   * @param {number} parentId
   * @param {*} model
   * @param {boolean} isAll true：获取所有子节点和孙子节点 false：只获取第一级子节点
   * @returns
   * @memberof ForgeModelBrowComponent
   */
  private getModelChildPart(parentId: number, model: any, isAll: boolean) {
    const instanceTree = model.getInstanceTree();
    let count = instanceTree.getChildCount(parentId);
    const result: Array<number> = [];
    if (count > 0) {
      instanceTree.enumNodeChildren(parentId, function (event) {
        result.push(event);
      });
    }
    if (isAll && result.length > 0) {
      let index = 0;
      while (true) {
        const tempId = result[index];
        count = instanceTree.getChildCount(tempId);
        if (count > 0) {
          instanceTree.enumNodeChildren(tempId, function (event) {
            result.push(event);
          });
        }
        if (index < (result.length - 1)) {
          index += 1;
        } else {
          break;
        }
      }
    }
    return result;
  }

  /**
   *  设置3d标注
   *
   * @param {string} modelName  模型名称
   * @param {number} dbId
   * @param {number} num  序号
   * @param {string} id   问题id主键值
   * @param {ModelColorEnum} color  颜色
   * @memberof ForgeModelBrowComponent
   */
  setMarkup3D(modelName: string, dbId: number, num: number, id: string, color: ModelColorEnum, title?: String) {
    const model = this.threeModelArray.find(item => {
      return item['modelName'] === modelName;
    });
    let textnameColor = 'textname_clo_red';
    let arrowColor = 'red_arrow';
    switch (color) {
      case ModelColorEnum.Green:
        textnameColor = 'textname_clo_green';
        arrowColor = 'green_arrow';
        break;
      case ModelColorEnum.LightGreen:
        textnameColor = 'textname_clo_lightgreen';
        arrowColor = 'lightgreen_arrow';
        break;
      case ModelColorEnum.Blue:
        textnameColor = 'textname_clo_blue';
        arrowColor = 'blue_arrow';
        break;
      case ModelColorEnum.Gray:
        textnameColor = 'textname_clo_gray';
        arrowColor = 'gray_arrow';
        break;
      case ModelColorEnum.Black:
        textnameColor = 'textname_clo_black';
        arrowColor = 'black_arrow';
        break;
      case ModelColorEnum.Yellow:
        textnameColor = 'textname_clo_yellow';
        arrowColor = 'yellow_arrow';
        break;
      case ModelColorEnum.Purple:
        textnameColor = 'textname_clo_purple';
        arrowColor = 'purple_arrow';
        break;
      case ModelColorEnum.Orange:
        textnameColor = 'textname_clo_orange';
        arrowColor = 'orange_arrow';
        break;
      default:
        textnameColor = 'textname_clo_red';
        arrowColor = 'red_arrow';
        break;
    }
    if (!title || title.length <= 0) {
      title = '问题';
    }
    let titleTemp = '';
    let index = 0;
    while (index < title.length) {
      const temp = title.substr(index, 10);
      titleTemp += temp + '&#10';
      index += 10;
    }

    this.initializeMarkup3d(model, dbId, num, id, textnameColor, arrowColor, titleTemp);
  }
  private initializeMarkup3d(model: any, dbId: number, num: number, id: string, textnameColor: String, arrowColor: String, title: String) {
    const instanceTree = model.getInstanceTree !== undefined ? model.getInstanceTree() : model.getData().instanceTree;
    this.annotation.setModel(model);
    console.log('dbId:' + dbId);
    let dbIdTemp = 0;
    instanceTree.enumNodeFragments(dbId, fragId => {
      if (!this.annotation) {
        return;
      }
      if(dbIdTemp === dbId) {
        return;
      }
      dbIdTemp  = dbId;
      console.log('num:' + num);
      this.annotation.chat(id, dbId, fragId, num, 'assets\forge-web\js\extensions\Annotation\closechat.png',
        textnameColor, arrowColor, title, data => {
          const event: ForgeEvent = {
            type: ForgeEventType.Markup3DClick,
            data: data
          };
          this.forgeModelEvent.next(event);
        });
    }, true);
  }

  /**
   *
   *
   * @param {ModelColorEnum} coloe
   * @returns
   * @memberof ForgeModelBrowComponent
   */
  getColorValue(coloe: ModelColorEnum) {
    switch (coloe) {
      case ModelColorEnum.Green:
        return new THREE.Vector4(0, 128 / 255, 0, 1);
      case ModelColorEnum.LightGreen:
        return new THREE.Vector4(0, 1, 0, 1);
      case ModelColorEnum.Blue:
        return new THREE.Vector4(0, 0, 255, 1);
      case ModelColorEnum.Gray:
        return new THREE.Vector4(211 / 255, 211 / 255, 211 / 255, 1);
      case ModelColorEnum.Black:
        return new THREE.Vector4(0, 0, 0, 1);
      case ModelColorEnum.Yellow:
        return new THREE.Vector4(1, 1, 0, 1);
      case ModelColorEnum.Purple:
        return new THREE.Vector4(128 / 255, 0, 128 / 255, 1);
      case ModelColorEnum.Orange:
        return new THREE.Vector4(1, 128 / 255, 0, 1);
      default:
        return new THREE.Vector4(1, 0, 0, 1);
    }
  }

  /**
   * 删除标注信息
   *
   * @param {Array<string>} ids  问题id 数组
   * @memberof ForgeModelBrowComponent
   */
  deleteMarkup3D(ids: Array<string>) {
    ids.forEach(id => {
      id = 'a_' + id;
      const markupDiv = document.getElementById(id).parentElement;
      markupDiv.remove();
    });
  }
  /**
   * 清除所有的3d标注信息
   *
   * @memberof ForgeModelBrowComponent
   */
  cleanMarkup3D() {
    const markupDivs = document.getElementsByClassName('ths-markup');
    while (markupDivs.length > 0) {
      const element = markupDivs[0];
      element.remove();
    }
  }

  /**
   * 根据model选中构件
   * @param partIdArry
   * @param modelName
   */
  private setSelectionEx(partIdArry: Array<Number>, model: any) {
    model.selector.setSelection(partIdArry);
  }
  /**
   * 选中构件
   *
   * @param {Array<Number>} partIdArry
   * @param {string} modelName
   * @param {boolean} triggerCameraEvent 是否激活构件选中事件
   * @memberof ForgeModelBrowComponent
   */
  selectionPart(partIdArry: Array<Number>, modelName: string, triggerCameraEvent: boolean) {
    this.triggerCameraEvent = triggerCameraEvent;
    const model = this.threeModelArray.find(item => {
      return item['modelName'] === modelName;
    });
    this.setSelectionEx(partIdArry, model);
  }

   /**
   * 清除构件选择
   *
   * @param {string} modelName
   * @param {boolean} triggerCameraEvent 是否激活清除选中事件
   * @memberof ForgeModelBrowComponent
   */
  cleanSelectionPart(modelName: string, triggerCameraEvent: boolean) {
    this.threeModelArray.forEach(item => {
      this.cleanModelSelectionEx(item);
    });
  }
   /**
   *
   * @param model 清空模型选择
   */
  private cleanModelSelectionEx(model: any) {
    model.selector.clearSelection();
  }

  restoreState(state: any, triggerCameraEvent: boolean, fitopt: boolean) {
    this.triggerCameraEvent = triggerCameraEvent;
    this.viewer.applyCamera(state);
  }
}

export interface ForgeModelBroweOption {
  // 模型服务器地址
  modelUrl: ModelUrl | Array<ModelUrl>;
  viewBoxAttr?: ViewBoxAttr;
  menuProperty?: MenuProperty;
  // 加号按钮显示标识
  addMenuFlag?: boolean;
}

export enum ModelColorEnum {
  /**
   * 红色
   */
  Red = 1,
  /**
 * 绿色
 */
  Green,
  /**
 * 浅绿色
 */
  LightGreen,
  /**
 * 蓝色
 */
  Blue,
  /**
 * 灰色
 */
  Gray,
  /**
  * 黑色
  */
  Black,
  /**
 * 黄色
 */
  Yellow,
  /**
 * 紫色
 */
  Purple,
  /**
 * 橙色
 */
  Orange
}
/**
 * 模型地址
 *
 * @export
 * @interface ModelUrl
 */
export interface ModelUrl {

   /**
   * 模型名称
   */
  modelName: string;
  
  /**
   * 3d模型地址
   */
  threeUrl: string;
  /**
   * 模型对应的图纸
   */
  dwgUrl: Array<string> | string;
}
/**
 * 模型视图的位置属性
 */
export interface ViewBoxAttr {
  height?: string;
  width?: string;
  top?: string;
  left?: string;
  right?: string;
}

/**
 * 用于回调
 *
 * @export
 * @interface DwgPdfBroweEvent
 */
export interface ForgeModelBroweEvent {
  type: string;
  data: any;
}
/**
 * 事件枚举类型
 *
 * @export
 * @enum {number}
 */
export enum ForgeEventType {
  /**
   * 3D构件选中
   */
  Select3DPart = 0,
  /**
   * 二维图纸构件选中
   */
  Select2DPart,
  /**
   * 二维码
   */
  QRCode,
  /**
   * 附件
   */
  Attachment,
  /**
   * 添加自定义属性
   */
  AddCustomProperty,
  /**
   * 单个标注画完
   */
  MarkupCreationEnd,
  /**
   * 结束标注操作
   */
  MarkupOut,
  /**
   * 添加质量问题
   */
  AddQualityQuestion,
  /**
   * 显示质量问题
   */
  ShowQualityQuestion,
  /**
   * 添加安全问题
   */
  AddSafeQuestion,
  /**
   * 显示安全问题
   */
  ShowSafeQuestion,
  /**
   * 模型加载完成事件
   */
  ModelLoadOver,

  /**
   * 添加问题
   */
  AddQuestion,
   /**
   * 3d 标注点击事件
   */
  Markup3DClick,

  /**
   * 日常质量检查
   */
  DailyQualityJianCha,

  /**
   * 重大质量问题
   */
  ImportQualityQuestion,

  /**
   * 日常质量巡查
   */
  DailyQualityXunCha,

  /**
   * 日常安全文明检查
   */
  DailySafeQuestionJianCha,

  AGGREGATE_FIT_TO_VIEW_EVENT,
  CAMERA_CHANGE_EVENT

}
/**
 * 事件数据类型
 *
 * @export
 * @interface ForgeEvent
 */
export interface ForgeEvent {
  /**
   * Forge组件事件
   */
  type: ForgeEventType;
  /**
   * 数据
   */
  data?: PartInfo | Array<PartInfo> | MarkupInfo | Number | Array<Number>;
}
/**
 * 构件信息
 *
 * @export
 * @interface PartInfo
 */
export interface PartInfo {
  /**
   * 构件nid
   */
  partId: number;
  /**
   * 构件GUID
   */
  rvtPartId: string;
}
/**
 * 批注信息
 *
 * @export
 * @interface MarkupInfo
 */
export interface MarkupInfo {
  /**
   * 标注svg信息
   */
  content: string;
  /**
   * 标注快照
   */
  snapshot: string;
}

/**
 * 定义模型菜单的显示
 */
export interface MenuProperty {
  /**
   * 添加质量问题菜单（质量检查）
   */
  AddQualityQuestionMenu?: boolean;

  /**
   * 添加重大质量问题
   */
  AddImportQualityQuestionMenu?: boolean;

  /**
   * 日常质量检查
   */
  AddDailyQualityJianChaMenu?: boolean;

  /**
   * 日常质量巡查
   */
  AddDailyQualityXunChaMenu?: boolean;

  /**
   * 显示质量问题菜单（日常质量巡查）
   */
  ShowQualityQuestionMenu?: boolean;
  /**
   * 添加安全问题菜单（日常安全文明巡查）
   */
  AddSafeQuestionMenu?: boolean;

  /**
   * 日常安全文明检查
   */
  AddDailySafeQuestionJianChaMenu?: boolean;
  /**
   * 安全问题菜单（日常安全文明巡查）
   */
  ShowSafeQuestionMenu?: boolean;

  /**
   * 显示附件按钮
   */
  ShowFileMenu?: boolean;

  /**
   * 显示二维码
   */
  ShowQrcodeMenu?: boolean;

}


// export class ForgeModelComponent {
//   @Input()
//   set forgeModelBroweOption(value: ForgeModelBroweOption) {
//     if (value) {
//       this.path = value.serverUrl;
//       this.path2d = value.f2dURl;
//       this.arrModelPath.push(value.serverUrl);
//       this.arrModelPath.push(value.f2dURl);
//       this.launchViewer();
//     }
//   }

//   @ViewChild('viewerContainer') viewerContainer: any;
//   @ViewChild('view2D') view2D: any;

//   @Output()
//   forgeModelEvent: EventEmitter<ForgeEvent> = new EventEmitter<ForgeEvent>();

//   public viewer: any;
//   public viewer2D: any;
//   private path = '';
//   _blockEventMain = false;
//   _blockEventSecondary = false;

//   //移动窗口相关
//   @ViewChild('view') 
//   view: any;


//   selectNodeGuid = []; // 选中构件的GUID

//   subToolbar: any; // 工具条

//   onToolbarCreatedBinded: any; // 工具条创建标识

//   markUpManager: any; // 标记

//   _treeData: any;

//   viewChangeFlag = '3D'; // 模型切换标识


//   path2d = '';

//   // 扩展配置
//   config = {
//   extensions: [
//     'Autodesk.Viewing.ZoomWindow',
//     'Autodesk.Viewing.MarkupsGui',
//     'Autodesk.Viewing.MarkupsCore',
//     'Autodesk.BimWalk'

//   ],
//   disabledExtensions: {
//     measure: false,
//     section: false,
//   },

//   };

//   constructor() { }

//   // 保存二三维模型路径(二三维切换使用)
//   // arrModelPath =  ['assets/SVFModel/斯维尔清溪基地/3d.svf', 'assets/SVFModel/斯维尔清溪基地/f2d_楼层平面__F3（8.30）/primaryGraphics.f2d'];
//   arrModelPath = []

//   launchViewer() {
//     if (this.viewer) {
//       return;
//     }
//     const options = {
//       env: 'Local',
//       offline: 'true',
//       useADP: false,
//       path: this.path
//     };
//     // 设置语言
//     Autodesk.Viewing.Initializer({ language: 'zh-Hans' });
//     // memory: {
//     //   limit: 32 * 1024    //32 GB
//     // }
//     // 加载3D模型
//     // this.viewer = new Autodesk.Viewing.Viewer3D(this.viewerContainer.nativeElement, config);
//     this.viewer = new Autodesk.Viewing.Private.GuiViewer3D(this.viewerContainer.nativeElement, this.config);


//     // 模型初始化
//     Autodesk.Viewing.Initializer(options, () => {
//       this.viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, (event) => this.selectionChanged());
//       // this.viewer.addEventListener( Autodesk.Viewing.GEOMETRY_LOADED_EVENT, (event) => this.onGeometryLoaded(event));
//       // this.viewer.addEventListener(Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT, (event) => this.moreModelSelect(event));

//       // 加载三维模型
//       const thisbak = this;
//       this.viewer.start();
//       this.viewer.load(this.path);
//       // 创建三维模型视窗工具
//       this.viewer.createViewCube();

//       // 注册批注画完得回调 yuan
//       this.viewer.loadExtension('Autodesk.Viewing.MarkupsCore').then(markupCore => {
//         markupCore.registerCreationEndEvent(() => {
//           console.log('markUpManager event :' + markupCore.generateData());
//           this.snapshotButtonCallback(this.viewer, markupCore);
//         });
//       });
//       // 设置反转鼠标缩放方向
//       const defaultValues = {
//         'reverseMouseZoomDir': true    // 反转鼠标缩放方向
//       };
//       this.loadPrefs(this.viewer, defaultValues);
//     });

//     // 加载自定义按钮
//     this.loadButtom();
//   }

//   loadButtom() {
//     if (this.viewer.toolbar) {
//       // Toolbar is already available, create the UI
//       this.createUI();
//     } else {
//       // Toolbar hasn't been created yet, wait until we get notification of its creation
//       this.onToolbarCreatedBinded = this.onToolbarCreated.bind(this);
//       this.viewer.addEventListener(Autodesk.Viewing.TOOLBAR_CREATED_EVENT, this.onToolbarCreatedBinded);
//     }
//     return true;
//   }

//   onToolbarCreated = () => {
//     this.viewer.removeEventListener(Autodesk.TOOLBAR_CREATED_EVENT, this.onToolbarCreatedBinded);
//     this.onToolbarCreatedBinded = null;
//     this.createUI();
//   }

//   createUI() {
//     const viewer = this.viewer.getToolbar(true);
//     const navTools = viewer.getControl(Autodesk.Viewing.TOOLBAR.SETTINGSTOOLSID);
//     navTools.removeControl('toolbar-fullscreenTool');


//     const button3 = new Autodesk.Viewing.UI.Button('View-Change');
//     button3.onClick = () => {
//       this.modelViewerChanged();
//     };
//     button3.setToolTip('模型切换');
//     button3.icon.style = '  font-family:"iconfont" !important;font-size:24px;font-style:normal;-webkit-font-smoothing: antialiased;-moz-osx-font-smoothing: grayscale;';
//     button3.setIcon("icon-qiehuandianpu");
//     const buttonView = new Autodesk.Viewing.UI.Button('showView');
//     buttonView.onClick = () => {
//       this.showView();
//     };
//     buttonView.setToolTip('模型显示');
//     buttonView.icon.style = '  font-family:"iconfont" !important;font-size:24px;font-style:normal;-webkit-font-smoothing: antialiased;-moz-osx-font-smoothing: grayscale;';
//     buttonView.setIcon("icon-new-page");
//     // 自订义工具组
//     // this.subToolbar = new Autodesk.Viewing.UI.ControlGroup( 'my-custom-view-toolbar' );
//     // viewer.toolbar.addControl(this.subToolbar);
//     navTools.addControl(button3, 3);
//     navTools.addControl(buttonView, 4);

//     // this.addSnapshotButton(this.viewer, navTools, 5, this.snapshotButtonCallback);
//   }
//   /**
//    * 增加快照按钮
//    *
//    * @param {*} viewer
//    * @param {*} navTools
//    * @param {number} index
//    * @param {ImagePreviewService} imagePreviewService
//    * @param {(viewer: any, imagePreviewService: ImagePreviewService) => void} [snapshotButtonCallback]
//    * @memberof ForgeModelBrowComponent
//    */
//   addSnapshotButton(viewer: any, navTools: any, index: number,
//     snapshotButtonCallback?: (viewer: any) => void) {
//     const bt = new Autodesk.Viewing.UI.Button('snapshot');
//     bt.onClick = () => {
//       snapshotButtonCallback(viewer);
//     };
//     bt.setToolTip('快照');
//     bt.icon.style = 'font-family:"iconfont" !important;font-size:24px;font-style:normal'
//       + '-webkit-font-smoothing: antialiased;-moz-osx-font-smoothing: grayscale;';
//     bt.setIcon('icon-new-page');
//     navTools.addControl(bt, index);
//   }
//   /**
//    * 按钮快照回调显示
//    * @param viewer
//    * @param imagePreviewService
//    */
//   snapshotButtonCallback(viewer: any, markupCore?: any) {
//     viewer.getScreenShot(viewer.container.clientWidth, viewer.container.clientHeight, function (blobURL) {
//       if (markupCore) {
//         const screenshot = new Image();
//         screenshot.src = blobURL;
//         screenshot.onload = function () {
//           const canvasTmp = document.createElement('canvas');
//           canvasTmp.width = viewer.container.clientWidth;
//           canvasTmp.height = viewer.container.clientHeight;

//           const ctx = canvasTmp.getContext('2d');
//           ctx.clearRect(0, 0, canvasTmp.width, canvasTmp.height);
//           ctx.drawImage(screenshot, 0, 0, canvasTmp.width, canvasTmp.height);
//           markupCore.renderToCanvas(ctx);
//           const ctxData = canvasTmp.toDataURL('image/png', 1);
//         };
//       } else {
//       }
//     });
//   }
//   /**
//    * 附件菜单事件处理
//    *
//    * @param {*} viewer
//    * @param {EventEmitter<ForgeEvent>} forgeModelEvent
//    * @memberof ForgeModelBrowComponent
//    */
//   appendFileContextMenu(viewer: any, forgeModelEvent: EventEmitter<ForgeEvent>) {
//     const selSet = this.viewer.getSelection() as Array<number>;
//     const selectParts = selSet.map(dbid => {
//       return this.getPartProperties(viewer, dbid).then(data => {
//         return {
//           partId: dbid,
//           rvtPartId: data.externalId
//         };
//       });
//     });
//     Promise.all(selectParts).then( result => {
//       console.log('ForgeEventType.AppendFile:' + JSON.stringify(result));
//       forgeModelEvent.next({
//         type: ForgeEventType.AppendFile,
//         data: result
//       });
//     });
//   }
//   /**
//    * 二维码菜单事件处理
//    *
//    * @param {*} viewer
//    * @param {EventEmitter<ForgeEvent>} forgeModelEvent
//    * @memberof ForgeModelBrowComponent
//    */
//   qrCodeContextMenu(viewer: any, forgeModelEvent: EventEmitter<ForgeEvent>) {
//     const selSet = this.viewer.getSelection() as Array<number>;
//     const selectParts = selSet.map(dbid => {
//       return this.getPartProperties(viewer, dbid).then(data => {
//         return {
//           partId: dbid,
//           rvtPartId: data.externalId
//         };
//       });
//     });
//     Promise.all(selectParts).then( result => {
//       console.log('ForgeEventType.QRCode:' + JSON.stringify(result));
//       forgeModelEvent.next({
//         type: ForgeEventType.QRCode,
//         data: result
//       });
//     });
//   }
//   /**
//    * 获取构件属性
//    *
//    * @param {*} viewer
//    * @param {number} dbid
//    * @returns {Promise<any>}
//    * @memberof ForgeModelBrowComponent
//    */
//   getPartProperties(viewer: any, dbid: number): Promise<any> {
//     return new Promise((resolve, reject) => {
//       viewer.getProperties(dbid, function (data) {
//         resolve(data);
//       });
//     });
//   }
//   /**
//    * 显示隐藏工具栏
//    *
//    * @memberof ForgeModelComponent
//    */
//   setToolbarVisible() {
//     const toolBar  = document.getElementById('guiviewer3d-toolbar');
//     toolBar.style.display = toolBar.style.display === 'none' ? 'block': 'none';
//     // const toolBar = this.viewer.getToolbar(true);
//     // toolBar.setVisible(!toolBar.isVisible());
//     // const navTools = toolBar.getControl(Autodesk.Viewing.TOOLBAR.SETTINGSTOOLSID);
//     // navTools.setVisible(!navTools.isVisible());
//   }

//   modelViewerChanged() {
//     // 先卸载模型
//     this.UnLoadModel();

//     // 加载扩展
//     this.viewer.loadExtension('Autodesk.Viewing.MarkupsGui');
//     this.viewer.loadExtension('Autodesk.Viewing.MarkupsCore');
//     this.viewer.loadExtension('Autodesk.BimWalk');

//     this.viewer2D.loadExtension('Autodesk.Viewing.MarkupsGui');
//     this.viewer2D.loadExtension('Autodesk.Viewing.MarkupsCore');
//     this.viewer2D.loadExtension('Autodesk.BimWalk');

//     // 加载二三维模型
//     let str2DPath = this.arrModelPath[0];
//     this.viewer2D.start();
//     this.viewer2D.load(str2DPath);

//     let str3DPath = this.arrModelPath[1];
//     this.viewer.start();
//     this.viewer.load(str3DPath);

//     // 交换二三维模型路径
//     this.arrModelPath = [];
//     this.arrModelPath.push(str3DPath, str2DPath);
//   }

//   /**
//    * 3D to 2D 联动
//    */
//   selectionChanged() {
//     if (this._blockEventSecondary) {
//       return;
//     }
//     this._blockEventMain = true;
//     const arrSel = this.viewer.getSelection();
//     if (arrSel.length != 0) {
//       // this.viewer2D.select(arrSel);
//       // this.viewer2D.fitToView(arrSel);
//     }
//     this._blockEventMain = false;
//   }

//   moreModelSelect(event: any) {
//     if (this._blockEventSecondary) {
//       return;
//     }
//     this._blockEventMain = true;
//     const arrSel = this.viewer.getAggregateSelection();
//     if (arrSel.length != 0) {
//       // this.viewer2D.select(arrSel);
//       // this.viewer2D.fitToView(arrSel);
//     }
//     this._blockEventMain = false;
//   }
//   /**
//    * 2D to 3D 联动
//    */
//   selectionChanged2D() {
//     if (this._blockEventMain) {
//       return;
//     }
//     this._blockEventSecondary = true;
//     const arrSel = this.viewer2D.getSelection();
//     if (arrSel.length != 0) {
//       this.viewer.select(arrSel);
//       this.viewer.fitToView(arrSel);
//       const cam = this.viewer.getCamera();
//     }
//     this._blockEventSecondary = false;
//   }

//   /**
//    * 设置鼠标缩放反转
//    * @param viewer 3D，2D视图
//    * @param defaults 配置
//    */
//   loadPrefs(viewer, defaults) {
//     for (const name in defaults) {
//       if (defaults.hasOwnProperty(name)) {
//         viewer.prefs.set(name, defaults[name]);
//       }
//     }
//   }

//   private loadDocument() {
//     this.viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, function (event) {
//       if (this._blockEventSecondary) { return; }
//       this._blockEventMain = true;
//       this.viewer2D.select(this.viewer.getSelection());
//       this._blockEventMain = false;
//     });
//     this.viewer2D.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, function (event) {
//       if (this._blockEventMain) { return; }
//       this._blockEventSecondary = true;
//       const arrSel = this.viewer2D.getSelection();
//       this.viewer.select(arrSel);
//       this.viewer.fitToView(arrSel);
//       const cam = this.viewer.getCamera();
//       this._blockEventSecondary = false;
//     });
//     // 加载三维模型
//     this.viewer.initialize();
//     this.viewer.tearDown();
//     this.viewer.setUp();
//     this.viewer.load(this.path);
//     // 创建视图方位工具
//     this.viewer.createViewCube();
//     this.viewer.displayViewCube(true);
//     // 加载二维模型
//     this.viewer2D.initialize();
//     this.viewer2D.tearDown();
//     this.viewer2D.setUp();
//     this.viewer2D.load('assets/forge-web/SVFModel/m3/f2d_楼层平面__01_-_Entry_Level_-_Furniture_Layout/primaryGraphics.f2d');
//   }
//   // 卸载模型
//   UnLoadModel(): void {
//     this.viewer.tearDown();
//     this.viewer.setUp();
//     this.viewer2D.tearDown();
//     this.viewer2D.setUp();
//   }
//   LoadDefault(): void {
//     this.UnLoadModel();
//     this.viewer.load(this.path);
//   }
//   // 获得构件属性
//   GetProptiers(): void {
//     const sel = this.viewer.getSelection();
//     // 考察选择集中第一个对象的属性信息
//     this.viewer.getProperties(sel[0], function (objProp) {
//       if (objProp) {
//         console.log(objProp);
//         // 遍历每个属性
//         // tslint:disable-next-line:forin
//         for (const index in objProp.properties) {
//           const Prop = objProp.properties[index];
//           console.log('name: ' + Prop.displayName + '    value:    ' + Prop.displayValue);
//         }
//       }
//     });
//   }
//   // 切换模型
//   switchModel(path: string): void {
//     this.path = path;
//     this.loadDocument();
//   }
//   // 设置颜色
//   SetColor(): void {
//     const sel = this.viewer.getSelection();
//     const color = new THREE.Vector4(255 / 255, 0, 0, 1);
//     for (let i = 0; i < sel.length; i++) {
//       this.viewer.setThemingColor(sel[i], color);
//     }
//   }
//   // 还原颜色
//   ReSetColor(): void {
//     this.viewer.clearThemingColors();
//   }
//   // x剖切面
//   SetXPane(): void {
//     this.viewer.setCutPlanes([new THREE.Vector4(-1, 0, 0, 0)]);
//   }


//   /**
//    * 获取所有选中构件dbid
//    * @returns list[]
//    */
//   getAllChildIdList() {
//     const targets = this.viewer.getSelection();
//     const list = [];
//     if (targets) {
//       for (let i = 0; i < targets.length; i++) {
//         this._RecursionGetChild(targets[i], list);
//       }
//     } else {
//       return;
//     }
//     return list;
//   }

//   /**
//    * 递归查询子节点
//    * @param id
//    * @param list
//    */
//   _RecursionGetChild(id, list) {
//     const thisbak = this;
//     const length = this._treeData.getNumChildren(id);
//     if (length < 1) {
//       if (list.indexOf(id) === -1) {
//         list.push(id);
//       }

//       return;
//     }
//     this._treeData.enumNodeChildren(id, function (event) {
//       thisbak._RecursionGetChild(event, list);
//     });
//   }

//   /**
//    *  获得当前选中构件GUID、
//    *  @param dbidArry 选中的构件的dbid
//    */
//   public getComponentGuid(dbidArry: Array<number>): void {
//     const thisbak = this;
//     this.selectNodeGuid = [];
//     dbidArry.forEach((dbid) => {
//       this.viewer.getProperties(dbid, function (data) {
//         if (data) {
//           thisbak.selectNodeGuid.push(data.externalId);
//         }
//       });
//     });
//   }


//   /**
//    * 设置模型显示选中模型隐藏或者显示（及半透明）
//    * @param selectModelArry
//    * @param hideOrShowFlag true:显示 false：隐藏
//    * @param setCollorFlag 是否试着颜色
//    * @param color 颜色 var color = new THREE.Vector4( 255/255, 0, 0, 1 );
//    *
//    */
//   setSelectedModelShowOrHide(selectModelArry: Array<number>, hideOrShowFlag: boolean,
//     setCollorFlag?: boolean, color?: any) {
//     if (hideOrShowFlag) {
//       this.viewer.hide(this.viewer.model.getRootId());
//       // 显示选中构件
//       this.viewer.clearThemingColors();  // 模型颜色还原
//       selectModelArry.forEach((data) => {
//         this.viewer.show(data);
//         if (setCollorFlag) {
//           this.viewer.setThemingColor(data, color);
//         }
//       });
//     } else {
//       // 隐藏选中构件
//       selectModelArry.forEach((data) => {
//         this.viewer.hide(data);
//       });
//     }
//   }

//   /**
//   * 模型还原显示
//   */
//   showModel(): void {
//     this.viewer.show(this.viewer.model.getRootId());
//     this.viewer.impl.visibilityManager.setNodeOff(this.viewer.model.getRootId(), false);
//   }

//   // 隐藏模型
//   hidModel(): void {
//     const arrMods = this.viewer.impl.modelQueue().getModels();
//     this.viewer.hide(this.viewer.model.getRootId());
//     this.viewer.impl.visibilityManager.setNodeOff(this.viewer.model.getRootId(), true);

//   }
//   // 隐藏所选构件
//   //  HildSelect(): void {
//   //   const sel = this.viewer.getSelection();
//   //   for (let i = 0 ; i < sel.length; i++) {
//   //     this.viewer.hide( sel[i] );
//   //   }
//   // }
//   getMarkInfoString() {
//     const thisbak = this;
//     const options = {
//       env: 'Local',
//       offline: 'true',
//       useADP: false,
//       path: 'assets/SVFModel/m3/3d.svf'
//     };
//     this.viewer.start(this.path, options, function () {
//       const markConfig = { markupDisableHotkeys: false };
//       thisbak.markUpManager = new Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore(thisbak.viewer, markConfig);
//       // 初始化 MarkupsCore
//       thisbak.markUpManager.load();
//       // 启用 Markups 编辑模式
//       // const markupstatus = thisbak.markUpManager.enterEditMode();
//       // console.log( 'markupstatus: ' + markupstatus );
//       thisbak.markUpManager.enterEditMode();
//       const a = this.markUpManager.generateData();
//       thisbak.markUpManager.leaveEditMode();
//       return a;
//     });
//   }

//   /**
//    * 视图切换
//    */
//   setViewerChange() {
//     // 卸载模型
//     // this.UnLoadModel();
//     const options = {
//       env: 'Local',
//       offline: 'true',
//       useADP: false,
//       path: 'assets/SVFModel/m3/3d.svf'
//     };
//     // 扩展配置
//     const config = {
//       extensions: [
//         'Autodesk.Viewing.ZoomWindow',
//         'Autodesk.Viewing.MarkupsGui',
//         'Autodesk.Viewing.MarkupsCore',
//         'Autodesk.BimWalk'
//       ],
//       disabledExtensions: {
//         measure: false,
//         section: false,
//       }
//     };
//     // 加载3D模型
//     this.viewer = new Autodesk.Viewing.Private.GuiViewer3D(this.viewerContainer.nativeElement, config);
//     // 加载2D模型
//     this.viewer2D = new Autodesk.Viewing.Private.GuiViewer3D(this.view2D.nativeElement, config);
//     if (this.viewChangeFlag === '3D') { // 3D =>2D
//       this.initModel(this.viewChangeFlag, options);
//       this.viewChangeFlag = '2D';
//     } else { // 2d => 3D
//       this.initModel(this.viewChangeFlag, options);
//       this.viewChangeFlag = '3D';
//     }
//   }

//   /**
//    * 模型切换后重新初始化模型
//    * @param viewChangeFlag
//    */
//   initModel(viewChangeFlag: string, options: any) {
//     let model3DPath = '';
//     let mocel2DPath = '';
//     if (viewChangeFlag === '3D') {
//       mocel2DPath = 'assets/SVFModel/m3/3d.svf';
//       model3DPath = 'assets/SVFModel/m3/f2d_楼层平面__Site/primaryGraphics.f2d';
//     } else {
//       mocel2DPath = 'assets/SVFModel/m3/f2d_楼层平面__Site/primaryGraphics.f2d';
//       model3DPath = 'assets/SVFModel/m3/3d.svf';
//     }
//     // 模型初始化
//     Autodesk.Viewing.Initializer(options, () => {
//       this.viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, (event) => this.selectionChanged());
//       this.viewer2D.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, (event) => this.selectionChanged2D());
//       // 加载三维模型
//       const thisbak = this;
//       this.viewer.start();
//       this.viewer.load(model3DPath);
//       // 创建三维模型视窗工具
//       this.viewer.createViewCube();
//       // 加载二维模型
//       this.viewer2D.start();
//       this.viewer2D.load(mocel2DPath);
//       // 设置反转鼠标缩放方向
//       const defaultValues = {
//         'reverseMouseZoomDir': true    // 反转鼠标缩放方向
//       };
//       this.loadPrefs(this.viewer, defaultValues);
//     });

//     // 加载自定义按钮
//     this.loadButtom();
//   }

//   /**
//    *
//    * 模型加载完成后调用
//    * @param event
//    */
//   onGeometryLoaded(event: any) {

//   }

//   closeView() {

//     this.view.nativeElement.style = "display: none;";
//   }
//   showView() {
//     if(this.view.nativeElement.style.display === 'block') {
//       this.view.nativeElement.style.display = 'none'
//     } else {
//       this.view.nativeElement.style.display = 'block'
//       if(!this.viewer2D) {
//         this.viewer2D = new Autodesk.Viewing.Private.GuiViewer3D(this.view2D.nativeElement, this.config);
//         this.viewer2D.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, (event) => this.selectionChanged2D());
//         this.viewer2D.start();
//         this.viewer2D.load(this.path2d);
//       }
//     }
//   }

// }

// export interface ForgeModelBroweOption {
//   // 模型服务器地址
//   serverUrl: string;
//   f2dURl: string;
//   // 模型高度
//   modelHeight: string;
// }
// /**
//  * 事件枚举类型
//  *
//  * @export
//  * @enum {number}
//  */
// export enum ForgeEventType {
//   SelectPart = 0,
//   QRCode,
//   AppendFile,
//   CustomProperty,
//   MarkupCreationEnd,
//   MarkupOut
// }
// /**
//  * 事件数据类型
//  *
//  * @export
//  * @interface ForgeEvent
//  */
// export interface ForgeEvent {
//   type: ForgeEventType;
//   data: PartInfo | Array<PartInfo> | MarkupInfo;
// }
// /**
//  * 构件信息
//  *
//  * @export
//  * @interface PartInfo
//  */
// export interface PartInfo {
//   partId: number;
//   rvtPartId: string;
// }
// /**
//  * 批注信息
//  *
//  * @export
//  * @interface MarkupInfo
//  */
// export interface MarkupInfo {
//   content: string;
//   snapshot: string;
// }

