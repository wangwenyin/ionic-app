/// <reference path="../../../node_modules/ahoops-web/js/html2canvas.d.ts" />
/// <reference path="../../../node_modules/panzoom/index.d.ts" />
import { Component, ViewChild, Optional, InjectionToken, Inject, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, ViewController, PopoverController } from 'ionic-angular';
import { ModelBroweOption, ModelBroweComponent, ModelReaderType} from '../../shared/common/model-browe/model-browe.component';
// import { PdfViererOption, PdfBroweComponent} from '../../shared/common/pdf-browe/pdf-browe.component';
import { GetFilePreviewInfoOutput } from '../../shared/service-proxies/service-proxies';
import { AddDesignViewPage } from '../add-design-view/add-design-view';
import { AddDesignTaskPage } from '../add-design-task/add-design-task';
import { FileService } from '../../shared/file.service';
import { AppSessionService } from '../../shared/app-session.service';
import { ThsToastController, ThsAlertController, ThsLoadingController } from '../../shared/alert.service';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { Platform } from 'ionic-angular';
import { Buffer } from 'buffer'
declare var panzoom:any;

/**
 * Generated class for the FilePreviewPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-file-preview',
  templateUrl: 'file-preview.html',
})
export class FilePreviewPage {
  // optionPdf: PdfViererOption;
  optionModel: ModelBroweOption;
  // @ViewChild(PdfBroweComponent)
  // private pdfBrowe: PdfBroweComponent;

  @ViewChild(ModelBroweComponent)
  private modelBrowe: ModelBroweComponent;

  fileInfo: GetFilePreviewInfoOutput;
  private baseUrl: string;
  _showModelOrPdf: boolean;

  markPageIndex: string;
  markContent: string;

  distance = 0;
  private initalDistance;
  private scale = 0;
  private zoom = 100;
  private upZoom = 0;
  isPinching: boolean;
  isHaveShowTab = false;

  imageUrl: string;
  imagePath: string;
  _strokeColor: string;
  _strokeWidth: number;
  _nowDrawType: string;
  _textFontSize: number;
  _textColor: string;
  _pngZoom: number;
  _pngZoomTmp: number;
  _maxZoom = 10;
  _viewBoxX = 0;
  _pngWidth = 0;
  _scaleCenterX = 0;
  _scaleCenterY = 0;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public modalCtrl: ModalController,
              private fileService: FileService,
              private toastController: ThsToastController,
              private  thsAlertController: ThsAlertController,
              private loadCtrl: ThsLoadingController,
              public popoverCtrl: PopoverController,
              public  appSessionService: AppSessionService,
              private screenOrientation: ScreenOrientation,
              public plt: Platform) {
    this.fileInfo = this.navParams.get('fileInfo');
    this.markPageIndex = this.navParams.get('markPageIndex');
    this.markContent = this.navParams.get('markContent');
    this.isHaveShowTab = this.navParams.get('isHaveShowTab');
    this.baseUrl = this.appSessionService.baseUrl;

    this.imageUrl = '';//'assets/default-project.png';
    this.imagePath = '';
    this._strokeColor = 'red';
    this._strokeWidth = 2;
    this._textFontSize = 1.2;
    this._textColor = 'red';
    this._nowDrawType = '';
    this._pngZoom = 1;
    this._pngZoomTmp = 0;
    let thisBak = this;
    this.screenOrientation.onChange().subscribe(() => {
      console.log('screenOrientation.onChange');
      console.log('screenOrientation.onChange width:' + window.screen.width);
      console.log('screenOrientation.onChange height:' + window.screen.height);

      // thisBak.toastController.showCenter('screenOrientation.onChange width:'+$(window).width() +'  ; height: '+ $(window).height(),'10000');
      // thisBak.toastController.showCenter('type:'+this.screenOrientation.type)
      if (thisBak.screenOrientation.type === 'landscape-primary') {//横屏

        if (thisBak.optionModel) {
          // if(thisBak.plt.is('ios')){
          //   $('#content').width($(window).height());
          //   $('#content').height($(window).width() - 50);
          // }else{
          //   $('#content').width($(window).width());
          //   $('#content').height($(window).height() - 50);
          // }
          if (thisBak.plt.is('ios')) {
            $('#content').width($(window).width());
            $('#content').height($(window).height() - 50);
          } else {
            $('#content').width($(window).height());
            $('#content').height($(window).width() - 50);
          }
          thisBak.modelBrowe.changCanvas();
        }  // else if (thisBak.optionPdf) {
          // thisBak.scale = Math.round(this.pdfBrowe.getZoom()*100);
          // thisBak.zoom+=50;
          // thisBak.pdfBrowe.setZoom(thisBak.scale*((thisBak.zoom+thisBak.upZoom)/100));
        // }
      } else { //竖屏
        if (thisBak.optionModel) {
          if (thisBak.plt.is('ios')) {
            $('#content').width($(window).width());
            $('#content').height($(window).height() - 50);
          } else {
            $('#content').width($(window).height());
            $('#content').height($(window).width() - 50);
          }
          thisBak.modelBrowe.changCanvas();
        }  // else if (thisBak.optionPdf) {
          // thisBak.scale = Math.round(this.pdfBrowe.getZoom()*100);
          // thisBak.pdfBrowe.setZoom(thisBak.scale*((thisBak.zoom+thisBak.upZoom)/100));
         // }
      }

    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad FilePreviewPage');
    if (this.fileInfo.fileType === 'pdf' || this.fileInfo.fileType === 'excel' || this.fileInfo.fileType === 'doc'
      || this.fileInfo.fileType === 'mpp' || this.fileInfo.fileType === 'ppt' || this.fileInfo.fileType === 'cad') {
      this._showModelOrPdf = false;
      let thisBak = this;
      if (this.fileInfo.pathList && this.fileInfo.pathList.length > 0) {
        // this.imagePath = this.fileInfo.pathList[0];
        // this.imageUrl = encodeURI(this.baseUrl + '/Lenovo/DownloadFileEx?path=' + this.imagePath.replace(/\\/g, '/'));
        console.log('FilePreviewPage imageUrl: ' + this.imageUrl);
      }
    } else {
      let option: ModelBroweOption = {
        serverUrl: this.baseUrl.replace('22742','11182') + '/service',
        name: '结构模型算量配筋模型(1)~-~20171101143303',
        readerType: ModelReaderType.ClientStream,
        width: $(window).width(),
        height: $(window).height() - 50
      };
      if (this.fileInfo.size < 1000 * 1000 * 500) {
        this.fileService.checkFile(this.appSessionService.basePath + encodeURIComponent(this.fileInfo.clientPath).replace(/\\/g, '/')).then(result => {
          if (result === true) {
            this.fileService.readAsArrayBuffer(this.appSessionService.basePath + this.fileInfo.clientPath.replace(/\\/g, '/')).then(data => {
              option.readerType = ModelReaderType.Scs;
              option.bufferData = new Uint8Array(data);
              option.resetValue = this.markContent;
              this.optionModel = option;
              this._showModelOrPdf = true;
            })
          } else {
            let url = encodeURI(this.baseUrl + '/Lenovo/DownloadFileEx?path=' + encodeURIComponent(this.fileInfo.clientPath));
            option.serverUrl = url;
            option.readerType = ModelReaderType.Scs;
            option.resetValue = this.markContent;
            this.optionModel = option;
            this._showModelOrPdf = true;
          }
        })
      } else {
        let index = this.fileInfo.clientPath.lastIndexOf('.');
        option.name = this.fileInfo.clientPath.substring(0, index);
        option.readerType = ModelReaderType.ServerStream;
        option.resetValue = this.markContent;
        this.optionModel = option;
        this._showModelOrPdf = true;
      }
    }

  }

  ionViewDidEnter() {
    if (this._showModelOrPdf === false) {
      this.restoreAnnotation(this.fileInfo, this.markPageIndex, this.markContent);
    }
  }

  ionViewWillEnter() {
    let elements = document.querySelectorAll(".tabs .tabbar");
    if (elements != null) {
      Object.keys(elements).map((key) => {
        let tmp = elements[key].style;
        if (tmp) {
          tmp.display = 'none';
        }
      });
    }
  }

  ionViewDidLeave() {
    if (!this.isHaveShowTab) {
      let elements = document.querySelectorAll(".tabs .tabbar");
      if (elements != null) {
        Object.keys(elements).map((key) => {
          let tmp = elements[key].style;
          if (tmp) {
            tmp.display = 'flex';
          }
        });
      }
    }
  }

  onAddView() {
    if (this._showModelOrPdf === false) {
      let matrix=$('.page-file-preview .scroll-content .preview-img').css('transform').replace('matrix(','').replace(')','').split(',');
      let pdfSvg2 = document.querySelector('.preview-img svg');
      let pdfSvg = $(pdfSvg2).clone().get(0);
      $(pdfSvg).children().attr('stroke-width',this._strokeWidth* 10);
      $(pdfSvg).children('text').css('font-size',this._textFontSize*2.5*100);
      let svg_xml = (new XMLSerializer()).serializeToString(pdfSvg);
      let tmpImg = <HTMLImageElement>document.querySelector('.preview-img img');
      let newCanvas = document.createElement('canvas');
      newCanvas.width = tmpImg.width;
      newCanvas.height = tmpImg.height;
      let ctx = newCanvas.getContext('2d');

      ctx.drawImage(tmpImg, 0, 0, tmpImg.width, tmpImg.height);
      let img = new Image();
      let imgDate = (new Buffer(svg_xml, 'utf8')).toString('base64');
      img.src = 'data:image/svg+xml;base64,' + imgDate;// window.btoa(svg_xml);
      let thisBak = this;
      img.onload = function () {
        ctx.drawImage(img, 0, 0, tmpImg.width, tmpImg.height);
        let ctxData = newCanvas.toDataURL('image/jpeg', 0.8);
        let index = ctxData.indexOf('base64');
        ctxData = ctxData.substring(index + 7);
        let start = 0;
        let end = 0;
        if (thisBak.fileInfo.fileType === 'cad') {
          start = thisBak.imagePath.lastIndexOf('@');
          end = thisBak.imagePath.lastIndexOf('_');
        } else {
          start = thisBak.imagePath.lastIndexOf('_');
          end = thisBak.imagePath.lastIndexOf('.');
        }
        let modal = thisBak.modalCtrl.create(AddDesignViewPage, {
          thumbnail: ctxData,
          source: thisBak.fileInfo.fileType,
          sourceId: thisBak.fileInfo.id.toString(),
          markPageIndex: thisBak.imagePath.substring(start + 1, end),
          markContent: svg_xml
        });
        modal.present()
      }
    } else {
      this.modelBrowe.getAnnotation().then(result => {
        let modal = this.modalCtrl.create(AddDesignViewPage, {
          thumbnail: result.Snapshot,
          source: this.fileInfo.fileType,
          sourceId: this.fileInfo.id.toString(),
          markPageIndex: '0',
          markContent: result.AnnotationInfo
        });
        modal.present()
      })
    }

  }

  onAddTask() {
    if (this._showModelOrPdf === false) {
      let pdfSvg2 = document.querySelector('.preview-img svg');
      let pdfSvg = $(pdfSvg2).clone().get(0);
      $(pdfSvg).children().attr('stroke-width',this._strokeWidth* 10);
      $(pdfSvg).children('text').css('font-size',this._textFontSize*2.5*100);
      let svg_xml = (new XMLSerializer()).serializeToString(pdfSvg);
      let tmpImg = <HTMLImageElement>document.querySelector('.preview-img img');
      let newCanvas = document.createElement('canvas');
      newCanvas.width = tmpImg.width;
      newCanvas.height = tmpImg.height;
      let ctx = newCanvas.getContext('2d');

      ctx.drawImage(tmpImg, 0, 0, tmpImg.width, tmpImg.height);
      let img = new Image();
      let imgDate = (new Buffer(svg_xml, 'utf8')).toString('base64');
      img.src = 'data:image/svg+xml;base64,' + imgDate;// window.btoa(svg_xml);
      let thisBak = this;
      img.onload = function () {
        ctx.drawImage(img, 0, 0, tmpImg.width, tmpImg.height);
        let ctxData = newCanvas.toDataURL('image/jpeg', 0.8);
        let index = ctxData.indexOf('base64');
        ctxData = ctxData.substring(index + 7);
        let start = 0;
        let end = 0;
        if (thisBak.fileInfo.fileType === 'cad') {
          start = thisBak.imagePath.lastIndexOf('@');
          end = thisBak.imagePath.lastIndexOf('_');
        } else {
          start = thisBak.imagePath.lastIndexOf('_');
          end = thisBak.imagePath.lastIndexOf('.');
        }
        let modal = thisBak.modalCtrl.create(AddDesignTaskPage, {
          thumbnail: ctxData,
          source: thisBak.fileInfo.fileType,
          sourceId: thisBak.fileInfo.id.toString(),
          markPageIndex: thisBak.imagePath.substring(start + 1, end),
          markContent: svg_xml
        });
        modal.present()
      }
    } else {
      this.modelBrowe.getAnnotation().then(result => {
        let modal = this.modalCtrl.create(AddDesignTaskPage, {
          thumbnail: result.Snapshot,
          source: this.fileInfo.fileType,
          sourceId: this.fileInfo.id.toString(),
          markPageIndex: '0',
          markContent: result.AnnotationInfo
        });
        modal.present()
      })
    }
  }

  onClear() {
    if (this._showModelOrPdf === true) {
      this.modelBrowe.deleteMarkupView();
    } else {
      $('.preview-img svg').children().remove();
    }
  }

  touchStart(evt) {
    if (this._showModelOrPdf === true) {
      return;
    }
    console.log('touchStart');
    if (evt.touches.length === 2) {
      this.isPinching = true;
      if (this.scale <= 0) {
       // this.scale = Math.round(this.pdfBrowe.getZoom() * 100);
      }
      this.upZoom = 0;
    }
  }

  touchMove(evt) {
    if (this._showModelOrPdf === true) {
      return;
    }
    if (this.isPinching) {
      if (!this.initalDistance) {
        this.initalDistance = this.getDistance(evt);
      }
      this.upZoom = Math.round(this.getScale(evt) * 100) - 100;

      if (this.upZoom + this.zoom <= 50) {
        this.upZoom = 50 - this.zoom;
      }
    //  this.pdfBrowe.setZoom(this.scale * ((this.zoom + this.upZoom) / 100));
      this.toastController.showCenter((this.zoom + this.upZoom) + '%', '10');
    }
  }

  touchEnd(evt) {
    if (this._showModelOrPdf === true) {
      return;
    }
    if (evt.touches.length != 2 || this.isPinching) {
      console.log('touchEnd');
      this.initalDistance = undefined;
      this.isPinching = false;
      this.zoom += this.upZoom;
      this.upZoom = 0;
    }
  }

  touchStartPng(evt) {
    if (this._showModelOrPdf === true) {
      return;
    }
    console.log('touchStart:' + JSON.stringify(evt.touches[0]));
    if (evt.touches.length === 2) {
      this.isPinching = true;
      this.getCenter(evt);
    }
    // this._pngZoom+=1;
    // this._scaleCenterX = evt.touches[0].pageX/this._pngZoom;
    // this._scaleCenterY = evt.touches[0].pageY/this._pngZoom;
    // let offset = $('page-file-preview .scroll-content .preview-img').offset();
    // let offsetX = offset.top/4;
    // let offsetY = offset.left/4;
    // offsetX -= this._scaleCenterX;
    // offsetY -= this._scaleCenterY;
    // // $('.preview-img').css('transform-origin', '0 0');
    // $('.preview-img').css('transform', 'translate('+offsetX +'px,'+offsetY+'px) scale(' + (this._pngZoom) + ')');
  }

  touchMovePng(evt) {
    if (this._showModelOrPdf === true) {
      return;
    }
    if (this.isPinching) {
      if (!this.initalDistance) {
        this.initalDistance = this.getDistance(evt);
      }
      this._pngZoomTmp = this.getScale(evt) - 1;
      this.getCenter(evt);
      if (this._pngZoom + this._pngZoomTmp > this._maxZoom) {
        this._pngZoomTmp = this._maxZoom - this._pngZoom;
      }
      if (this._pngZoom + this._pngZoomTmp < 1) {
        this._pngZoomTmp = 1 - this._pngZoom
      }

      let offset = $('page-file-preview .scroll-content .preview-img').offset();
      let offsetX = offset.top / 4;
      let offsetY = offset.left / 4;
      offsetX -= this._scaleCenterX / (this._pngZoom + this._pngZoomTmp);
      offsetY -= this._scaleCenterY / (this._pngZoom + this._pngZoomTmp);
      $('.preview-img').css('transform', 'translate(' + offsetX + 'px,' + offsetY + 'px) scale(' + (this._pngZoom + this._pngZoomTmp) + ')');
      this.toastController.showCenter(Math.round((this._pngZoom + this._pngZoomTmp) * 100) + '%', '10');
    }
  }

  touchEndPng(evt) {
    if (this._showModelOrPdf === true) {
      return;
    }
    if (evt.touches.length != 2 || this.isPinching) {
      console.log('touchEnd');
      this.initalDistance = undefined;
      this.isPinching = false;
      this._pngZoom += this._pngZoomTmp;
      this._pngZoomTmp = 0;
    }
  }

  private getDistance(e) {

    let touch0 = e.touches[0];
    let touch1 = e.touches[1];

    console.log('touch0.pageX: ' + touch0.pageX + 'touch0.pageY' + touch0.pageY);
    console.log('touch1.pageX: ' + touch1.pageX + 'touch1.pageY' + touch1.pageY);
    return Math.sqrt(
      (touch0.pageX - touch1.pageX) * (touch0.pageX - touch1.pageX) +
      (touch0.pageY - touch1.pageY) * (touch0.pageY - touch1.pageY)
    );
  }

  private getCenter(e) {
    let touch0 = e.touches[0];
    let touch1 = e.touches[1];
    this._scaleCenterX = touch0.pageX - (touch0.pageX - touch1.pageX) / 2;
    this._scaleCenterY = touch0.pageY - (touch0.pageY - touch1.pageY) / 2;
  };

  private getScale(e) {
    let tmp = this.getDistance(e) / this.initalDistance;
    console.log('getScale: ' + tmp);
    return tmp;
  }

  isGranted(permissionName: string): boolean {
    return this.appSessionService.isGranted(permissionName)
  }

  presentPopover(event) {
    let popover = this.popoverCtrl.create('FilePageNoPage', {
      pathList: this.fileInfo.pathList,
      imagePath: this.imagePath,
      fileType: this.fileInfo.fileType
    });
    popover.present({
      ev: event
    });
    popover.onDidDismiss(data => {
      console.log('file-preview:' + JSON.stringify(data));
      if (data) {
        if (this._showModelOrPdf === false) {
          $('.preview-img svg').children().remove();
        }
        this.imagePath = data;
        this.imageUrl = encodeURI(this.baseUrl + '/Lenovo/DownloadFileEx?path=' + encodeURIComponent(data.replace(/\\/g, '/')));
        this._pngZoom = 1;
        // $('.preview-img').css('transform-origin', this._scaleCenter);
        // $('.preview-img').css('transform', 'translateY(-50%) scale(' + this._pngZoom + ')');
      }
    })
  }

  hasSvgElement() {
    console.log(2);
    let pageElement = document.querySelector('.preview-img');
    let svgElement = pageElement.querySelector('svg');
    console.log(3);
    if (!svgElement) {
      console.log(4);
      let imgElement = pageElement.querySelector('img');
      console.log(5);
      let innerSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      console.log(6);
      innerSVG.setAttribute('class', 'annotationLayer');
      innerSVG.setAttribute('width', imgElement.width.toString());
      innerSVG.setAttribute('height', imgElement.height.toString());
      this._pngWidth = imgElement.width;
      this._viewBoxX = imgElement.naturalWidth;
      // innerSVG.setAttribute('viewBox', '0 0 ' + (imgElement.width * this._maxZoom).toString() + ' ' + (imgElement.height * this._maxZoom).toString());
      innerSVG.setAttribute('viewBox', '0 0 ' + this._viewBoxX.toString() + ' ' + imgElement.naturalHeight.toString());
      console.log(7);
      pageElement.appendChild(innerSVG);
    }
  }

  drawCloud() {
    this.stopDraw();
    this._nowDrawType = 'drawCloud';
    console.log(1);
    this.hasSvgElement();
    let pageSvg = document.querySelector('.preview-img svg');
    let thisbak = this;
    console.log(8);
    // pageSvg.addEventListener('touchstart', function (evt) {
    //   if (thisbak._nowDrawType === 'drawCloud') {
    //     console.log('drawCloud start');
    //     let e = evt.touches[0];
    //     let matrix=$('.page-file-preview .scroll-content .preview-img').css('transform').replace('matrix(','').replace(')','').split(',');
    //     let svg_rect = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    //     svg_rect.setAttribute('stroke', thisbak._strokeColor);
    //     svg_rect.setAttribute('stroke-width', (thisbak._strokeWidth * (thisbak._viewBoxX / (parseFloat(matrix[0]) * thisbak._pngWidth))).toString());
    //     // svg_rect.setAttribute('stroke-width', thisbak._strokeWidth.toString());
    //     svg_rect.setAttribute('style', 'fill:transparent;');
    //     pageSvg.appendChild(svg_rect);
    //     let startX = (e.clientX - parseFloat(matrix[4]))* (thisbak._viewBoxX / (parseFloat(matrix[0]) * thisbak._pngWidth));
    //     let startY = (e.clientY  - 44 - parseFloat(matrix[5]))* (thisbak._viewBoxX / (parseFloat(matrix[0]) * thisbak._pngWidth));
    //     let start = true;
    //     let touchendFun = function () {
    //       if (thisbak._nowDrawType === 'drawCloud') {
    //         start = false;
    //         pageSvg.removeEventListener('touchmove', touchMoveFun);
    //         pageSvg.removeEventListener('touchend', touchendFun);
    //       }
    //     };
    //     pageSvg.addEventListener('touchend', touchendFun, false);
    //     let touchMoveFun = function (evt) {
    //       if (thisbak._nowDrawType === 'drawCloud') {
    //         let e = evt.touches[0];
    //         let moveX = (e.clientX - parseFloat(matrix[4]))* (thisbak._viewBoxX / (parseFloat(matrix[0]) * thisbak._pngWidth));
    //         let moveY = (e.clientY  - 44 - parseFloat(matrix[5]))* (thisbak._viewBoxX / (parseFloat(matrix[0]) * thisbak._pngWidth));
    //         if (start === true) {
    //           let x = moveX - startX;
    //           let y = moveY - startY;

    //           let maxtix1 = [
    //             0, 0, -13, -39, 35, -42
    //             , 17, -47, 57, -21, 57, -21
    //             , 40, -21, 58, 11, 58, 11
    //             , 38, -5, 37, 37, 37, 37
    //             , 15, 36, -8, 46, -23, 50
    //             , 15, 4, -25, 23, -58, 16
    //             , -38, 23, -69, -11, -70, -12
    //             , -1, -1, -42, -6, -36, -39
    //           ];
    //           //圆属性0112
    //           let c1 = x / 200;
    //           let c2 = y / 60;
    //           let mm = "";
    //           for (let i = 0; i < 8; i++) {
    //             let nn = "c" + (maxtix1[i * 6] * c1) + "," + (maxtix1[i * 6 + 1] * c2) + " " + (maxtix1[i * 6 + 2] * c1) + "," + (maxtix1[i * 6 + 3] * c2) + " " + (maxtix1[i * 6 + 4] * c1) + "," + (maxtix1[i * 6 + 5] * c2);
    //             mm = mm + nn;
    //           }
    //           mm = mm + 'z';
    //           svg_rect.setAttributeNS(null, "d", "m" + startX.toString() + "," + startY.toString() + mm);
    //         }
    //         evt.preventDefault();
    //         evt.stopPropagation();

    //       }
    //     }
    //     pageSvg.addEventListener('touchmove', touchMoveFun, false);
    //   }
    // }, false);
  }

  drawRectangle() {
    this.stopDraw();
    this._nowDrawType = 'drawRectangle';
    let thisbak = this;
    thisbak.hasSvgElement();
    let pageSvg = document.querySelector('.preview-img svg');
    // $(pageSvg).off();
    // pageSvg.addEventListener('touchstart', function (evt) {
    //   if (thisbak._nowDrawType === 'drawRectangle') {
    //     let e = evt.touches[0];
    //     let matrix=$('.page-file-preview .scroll-content .preview-img').css('transform').replace('matrix(','').replace(')','').split(',');
    //     let svg_rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    //     svg_rect.setAttribute('stroke', thisbak._strokeColor);
    //     svg_rect.setAttribute('stroke-width', (thisbak._strokeWidth * (thisbak._viewBoxX / (parseFloat(matrix[0]) * thisbak._pngWidth))).toString());
    //     // svg_rect.setAttribute('stroke-width', thisbak._strokeWidth.toString());
    //     svg_rect.setAttribute('style', 'fill:transparent;');
    //     pageSvg.appendChild(svg_rect);
    //     let start = true;
    //     let startX = (e.clientX - parseFloat(matrix[4]))* (thisbak._viewBoxX / (parseFloat(matrix[0]) * thisbak._pngWidth));
    //     let startY = (e.clientY  - 44 - parseFloat(matrix[5]))* (thisbak._viewBoxX / (parseFloat(matrix[0]) * thisbak._pngWidth));
    //     svg_rect.setAttribute('x', startX.toString());
    //     svg_rect.setAttribute('y', startY.toString());

    //     let touchendRectangle = function (e) {
    //       if (thisbak._nowDrawType === 'drawRectangle') {
    //         console.log('pageSvg mouseup');
    //         start = false;
    //         pageSvg.removeEventListener('touchmove', touchMoveRectangle);
    //         pageSvg.removeEventListener('touchend', touchendRectangle);
    //       }
    //     };
    //     let touchMoveRectangle = function (evt) {
    //       if (thisbak._nowDrawType === 'drawRectangle') {
    //         let e = evt.touches[0];
    //         let moveX = (e.clientX - parseFloat(matrix[4]))* (thisbak._viewBoxX / (parseFloat(matrix[0]) * thisbak._pngWidth));
    //         let moveY = (e.clientY  - 44 - parseFloat(matrix[5]))* (thisbak._viewBoxX / (parseFloat(matrix[0]) * thisbak._pngWidth));
    //         if (start === true) {
    //           console.log('pageSvg mousemove X:' + moveX);
    //           console.log('pageSvg mousemove Y:' + moveY);
    //           svg_rect.setAttribute('width', (moveX - startX).toString());
    //           svg_rect.setAttribute('height', (moveY - startY).toString());
    //         }
    //         evt.preventDefault();
    //         evt.stopPropagation();
    //       }
    //     };
    //     pageSvg.addEventListener('touchend', touchendRectangle, false);
    //     pageSvg.addEventListener('touchmove', touchMoveRectangle, false);
    //   }
    // }, false);

  }

  drawLine() {
    this.stopDraw();
    this._nowDrawType = 'drawLine';
    let thisbak = this;
    thisbak.hasSvgElement();
    let pageSvg = document.querySelector('.preview-img svg');
    // $(pageSvg).off();
    // pageSvg.addEventListener('touchstart', function (evt) {
    //   if (thisbak._nowDrawType === 'drawLine') {
    //     let e = evt.touches[0];
    //     let matrix=$('.page-file-preview .scroll-content .preview-img').css('transform').replace('matrix(','').replace(')','').split(',');
    //     let svg_rect = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    //     svg_rect.setAttribute('stroke', thisbak._strokeColor);
    //     // svg_rect.setAttribute('stroke-width', (thisbak._strokeWidth * (thisbak._maxZoom / thisbak._pngZoom)).toString());
    //     // svg_rect.setAttribute('stroke-width', thisbak._strokeWidth.toString());
    //     svg_rect.setAttribute('stroke-width', (thisbak._strokeWidth * (thisbak._viewBoxX / (parseFloat(matrix[0]) * thisbak._pngWidth))).toString());
    //     svg_rect.setAttribute('style', 'fill:transparent;');
    //     pageSvg.appendChild(svg_rect);
    //     let start = true;
    //     let startX = (e.clientX - parseFloat(matrix[4]))* (thisbak._viewBoxX / (parseFloat(matrix[0]) * thisbak._pngWidth));
    //     let startY = (e.clientY  - 44 - parseFloat(matrix[5]))* (thisbak._viewBoxX / (parseFloat(matrix[0]) * thisbak._pngWidth));
    //     console.log('startX e.clientX:' + e.clientX);
    //     console.log('starty e.clientY:' + e.clientY);
    //     svg_rect.setAttribute('x1', startX.toString());
    //     svg_rect.setAttribute('y1', startY.toString());

    //     svg_rect.setAttribute('x2', startX.toString());
    //     svg_rect.setAttribute('y2', startY.toString());

    //     let touchendLine = function (e) {
    //       if (thisbak._nowDrawType === 'drawLine') {
    //         console.log('pageSvg mouseup');
    //         start = false;
    //         pageSvg.removeEventListener('touchmove', touchMoveLine);
    //         pageSvg.removeEventListener('touchend', touchendLine);
    //       }
    //     };
    //     let touchMoveLine = function (evt) {
    //       if (thisbak._nowDrawType === 'drawLine') {
    //         let e = evt.touches[0];
    //         let moveX = (e.clientX - parseFloat(matrix[4]))* (thisbak._viewBoxX / (parseFloat(matrix[0]) * thisbak._pngWidth));
    //         let moveY = (e.clientY  - 44 - parseFloat(matrix[5]))* (thisbak._viewBoxX / (parseFloat(matrix[0]) * thisbak._pngWidth));
    //         if (start === true) {
    //           console.log('pageSvg mousemove X:' + moveX);
    //           console.log('pageSvg mousemove Y:' + moveY);
    //           svg_rect.setAttribute('x2', moveX.toString());
    //           svg_rect.setAttribute('y2', moveY.toString());
    //         }
    //         evt.preventDefault();
    //         evt.stopPropagation();
    //       }
    //     };
    //     pageSvg.addEventListener('touchend', touchendLine, false);
    //     pageSvg.addEventListener('touchmove', touchMoveLine, false);
    //   }
    // }, false);
  }

  drawCircle() {
    this.stopDraw();
    this._nowDrawType = 'drawCircle';
    let thisbak = this;
    thisbak.hasSvgElement();
    let pageSvg = document.querySelector('.preview-img svg');
    // $(pageSvg).off();
    // pageSvg.addEventListener('touchstart', function (evt) {
    //   if (thisbak._nowDrawType === 'drawCircle') {
    //     let e = evt.touches[0];
    //     let matrix=$('.page-file-preview .scroll-content .preview-img').css('transform').replace('matrix(','').replace(')','').split(',');
    //     let svg_rect = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    //     svg_rect.setAttribute('stroke', thisbak._strokeColor);
    //     // svg_rect.setAttribute('stroke-width', (thisbak._strokeWidth * (thisbak._maxZoom / thisbak._pngZoom)).toString());
    //     svg_rect.setAttribute('stroke-width', (thisbak._strokeWidth * (thisbak._viewBoxX / (parseFloat(matrix[0]) * thisbak._pngWidth))).toString());
    //     // svg_rect.setAttribute('stroke-width', thisbak._strokeWidth.toString());
    //     svg_rect.setAttribute('style', 'fill:transparent;');
    //     pageSvg.appendChild(svg_rect);
    //     let start = true;
    //     let startX = (e.clientX - parseFloat(matrix[4]))* (thisbak._viewBoxX / (parseFloat(matrix[0]) * thisbak._pngWidth));
    //     let startY = (e.clientY  - 44 - parseFloat(matrix[5]))* (thisbak._viewBoxX / (parseFloat(matrix[0]) * thisbak._pngWidth));
    //     svg_rect.setAttribute('cx', startX.toString());
    //     svg_rect.setAttribute('cy', startY.toString());
    //     let touchendCircle = function (e) {
    //       if (thisbak._nowDrawType === 'drawCircle') {
    //         console.log('pageSvg mouseup');
    //         start = false;
    //         pageSvg.removeEventListener('touchmove', touchMoveCircle);
    //         pageSvg.removeEventListener('touchend', touchendCircle);
    //       }
    //     };
    //     let touchMoveCircle = function (evt) {
    //       if (thisbak._nowDrawType === 'drawCircle') {
    //         let e = evt.touches[0];
    //         let moveX = (e.clientX - parseFloat(matrix[4]))* (thisbak._viewBoxX / (parseFloat(matrix[0]) * thisbak._pngWidth));
    //         let moveY = (e.clientY  - 44 - parseFloat(matrix[5]))* (thisbak._viewBoxX / (parseFloat(matrix[0]) * thisbak._pngWidth));
    //         if (start === true) {
    //           let r = Math.sqrt(Math.pow((moveX - startX), 2) + Math.pow((moveY - startY), 2));
    //           svg_rect.setAttribute('r', r.toString());

    //         }
    //         evt.preventDefault()
    //         evt.stopPropagation();
    //       }
    //     };
    //     pageSvg.addEventListener('touchend', touchendCircle, false);
    //     pageSvg.addEventListener('touchmove', touchMoveCircle, false);

    //   }
    // }, false);
  }

  drawEllipse() {
    this.stopDraw();
    this._nowDrawType = 'drawEllipse';
    let thisbak = this;
    thisbak.hasSvgElement();
    let pageSvg = document.querySelector('.preview-img svg');
    // $(pageSvg).off();
    // pageSvg.addEventListener('touchstart', function (evt) {
    //   if (thisbak._nowDrawType === 'drawEllipse') {
    //     let e = evt.touches[0];
    //     let matrix=$('.page-file-preview .scroll-content .preview-img').css('transform').replace('matrix(','').replace(')','').split(',');
    //     let svg_rect = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    //     svg_rect.setAttribute('stroke', thisbak._strokeColor);
    //     // svg_rect.setAttribute('stroke-width', (thisbak._strokeWidth * (thisbak._maxZoom / thisbak._pngZoom)).toString());
    //     svg_rect.setAttribute('stroke-width', (thisbak._strokeWidth * (thisbak._viewBoxX / (thisbak._pngZoom * thisbak._pngWidth))).toString());
    //     // svg_rect.setAttribute('stroke-width', thisbak._strokeWidth.toString());
    //     svg_rect.setAttribute('style', 'fill:transparent;');
    //     pageSvg.appendChild(svg_rect);
    //     let start = true;
    //     let startX = (e.clientX - parseFloat(matrix[4]))* (thisbak._viewBoxX / (parseFloat(matrix[0]) * thisbak._pngWidth));
    //     let startY = (e.clientY  - 44 - parseFloat(matrix[5]))* (thisbak._viewBoxX / (parseFloat(matrix[0]) * thisbak._pngWidth));
    //     startY -= 44;
    //     svg_rect.setAttribute('cx', startX.toString());
    //     svg_rect.setAttribute('cy', startY.toString());
    //     let touchendEllipse = function (e) {
    //       if (thisbak._nowDrawType === 'drawEllipse') {
    //         console.log('pageSvg mouseup');
    //         start = false;
    //         pageSvg.removeEventListener('touchmove', touchMoveEllipse);
    //         pageSvg.removeEventListener('touchend', touchendEllipse);
    //       }
    //     };
    //     let touchMoveEllipse = function (evt) {
    //       if (thisbak._nowDrawType === 'drawEllipse') {
    //         let e = evt.touches[0];
    //         let moveX = (e.clientX - parseFloat(matrix[4]))* (thisbak._viewBoxX / (parseFloat(matrix[0]) * thisbak._pngWidth));
    //         let moveY = (e.clientY  - 44 - parseFloat(matrix[5]))* (thisbak._viewBoxX / (parseFloat(matrix[0]) * thisbak._pngWidth));
    //         if (start === true) {
    //           svg_rect.setAttribute('rx', (moveX - startX).toString());
    //           svg_rect.setAttribute('ry', (moveY - startY).toString());
    //         }
    //         evt.preventDefault()
    //         evt.stopPropagation();
    //       }
    //     };
    //     pageSvg.addEventListener('touchend', touchendEllipse, false);
    //     pageSvg.addEventListener('touchmove', touchMoveEllipse, false);
    //   }
    // }, false);
  }

  drawText() {
    this.stopDraw();
    this._nowDrawType = 'drawText';
    let thisbak = this;
    thisbak.hasSvgElement();
    let pageSvg = document.querySelector('.preview-img svg');
    // $(pageSvg).off();
    // pageSvg.addEventListener('touchstart', function (evt) {
    //   if (thisbak._nowDrawType === 'drawText') {
    //     let e = evt.touches[0];
    //     let matrix=$('.page-file-preview .scroll-content .preview-img').css('transform').replace('matrix(','').replace(')','').split(',');
    //     let input = $('<input class="drawtext" type="text" size="10"/>');
    //     let x = (e.clientX - parseFloat(matrix[4]))* (thisbak._viewBoxX / (parseFloat(matrix[0]) * thisbak._pngWidth));
    //     let y = (e.clientY  - 44 - parseFloat(matrix[5]))* (thisbak._viewBoxX / (parseFloat(matrix[0]) * thisbak._pngWidth));
    //     input.css('left', e.pageX.toString() + 'px');
    //     input.css('top', e.pageY.toString() + 'px');
    //     input.css('position', 'absolute');
    //     input.css('font-size', thisbak._textFontSize.toString() + 'rem');
    //     input.css('z-index', '10000');
    //     input.css('color', thisbak._textColor);
    //     input.blur(function () {
    //       let text = $(this).val();
    //       let svg_rect = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    //       let sx = x;
    //       // let sy = y + thisbak._textFontSize*(thisbak._viewBoxX/ (thisbak._pngZoom*thisbak._pngWidth));
    //       let sy = y + thisbak._textFontSize;
    //       svg_rect.setAttribute('x', sx.toString());
    //       svg_rect.setAttribute('y', sy.toString());
    //       svg_rect.setAttribute('stroke', thisbak._textColor);
    //       svg_rect.setAttribute('fill', thisbak._textColor);
    //       svg_rect.setAttribute('style', 'font-size:' + (thisbak._textFontSize*2.5 *(thisbak._viewBoxX / (parseFloat(matrix[0]) * thisbak._pngWidth))).toString() + 'rem');
    //       // svg_rect.setAttribute('style', 'font-size:' + (thisbak._textFontSize*(thisbak._viewBoxX/ (thisbak._pngZoom*thisbak._pngWidth))).toString() + 'px');
    //       svg_rect.textContent = <string>text;
    //       $(this).remove();
    //       pageSvg.appendChild(svg_rect);

    //     });
    //     $(document.body).append(input);
    //     setTimeout(() => {
    //       input.focus();
    //     }, 50);
    //   }

    // }, false);
  }

  stopDraw() {
    $('.preview-img svg').off();
    this._nowDrawType = '';
  }

  getAnnotation(svg_xml: string): Promise<string> {
    return new Promise((resolve, reject) => {
      let img = new Image();
      let imgDate = (new Buffer(svg_xml, 'utf8')).toString('base64');
      img.src = 'data:image/svg+xml;base64,' + imgDate;// window.btoa(svg_xml);
      let canvas = document.createElement('canvas');
      let ctx = canvas.getContext('2d');
      let sourceImg = <HTMLImageElement>document.querySelector('.preview-img img');
      ctx.drawImage(sourceImg, 0, 0);
      img.onload = function () {
        ctx.drawImage(img, 0, 0);
        let ctxData = canvas.toDataURL('image/jpeg', 0.8);
        let index = ctxData.indexOf('base64');
        ctxData = ctxData.substring(index + 7);
        resolve(ctxData);
      };
    });
  }

  restoreAnnotation(file: GetFilePreviewInfoOutput, markPageIndex: string, markContent: string) {
    try {
      this.loadCtrl.presentLoadingString("正在加载......");
      let pathTmp = '';
      if (markPageIndex && markPageIndex.length > 0) {
        if (file.fileType === 'cad') {
          markPageIndex = '@' + markPageIndex;
        } else {
          markPageIndex = '_' + markPageIndex + '.';
        }
        for (let path of file.pathList) {
          if (path.lastIndexOf(markPageIndex) > 0) {
            pathTmp = path;
            break;
          }
        }
      }
      if (pathTmp.length <= 0) {
        pathTmp = this.fileInfo.pathList[0];
      }
      this.imagePath = pathTmp;
      this.imageUrl = encodeURI(this.baseUrl + '/Lenovo/DownloadFileEx?path=' + encodeURIComponent(this.imagePath.replace(/\\/g, '/')));
      // markContent = '<svg xmlns="http://www.w3.org/2000/svg" class="annotationLayer" width="360" height="240" viewBox="0 0 3600 2400"><path stroke="red" stroke-width="20" style="fill:transparent;" d="m1470,1400c0,0 -31.85,-156 85.75,-168c41.650000000000006,-188 139.65,-84 139.65,-84c98,-84 142.10000000000002,44 142.10000000000002,44c93.10000000000001,-20 90.65,148 90.65,148c36.75,144 -19.6,184 -56.35,200c36.75,16 -61.25000000000001,92 -142.10000000000002,64c-93.10000000000001,92 -169.05,-44 -171.5,-48c-2.45,-4 -102.9,-24 -88.2,-156z"/><circle stroke="red" stroke-width="20" style="fill:transparent;" cx="630" cy="596" r="243.26117651610582"/></svg>';
      let thisBak = this;
      let pageElement = document.querySelector('.preview-img');
      let imgElement = pageElement.querySelector('img');
      imgElement.onload = function () {
        thisBak.loadCtrl.closeLoading();
        panzoom(pageElement, {
          autocenter: true,
          defaultZoomSpeed: 0.035,
          zoomDoubleClickSpeed: 2.0,
          minZoom:1,
          maxZoom:imgElement.naturalWidth/imgElement.width
        });
        thisBak._pngWidth = imgElement.width;
        if(thisBak.imagePath.lastIndexOf(markPageIndex)>0) {
          if (markContent && markContent.length > 0) {
            let svgElement = pageElement.querySelector('svg');
            if (svgElement) {
              pageElement.removeChild(svgElement);
            }
            let innerSVG = $(markContent).get(0);
            thisBak._viewBoxX = parseInt(innerSVG.getAttribute("viewBox").split(' ')[2]);
            innerSVG.setAttribute('class', 'annotationLayer');
            innerSVG.setAttribute('width', thisBak._pngWidth.toString());
            innerSVG.setAttribute('height', imgElement.height.toString());
            pageElement.appendChild(innerSVG);
          }
        }
      }
    }catch(e){
      this.loadCtrl.closeLoading();
      this.thsAlertController.basicAlert('错误', e.message, '关闭');
    }
  }
  swipeEvent(event) {
    if(!this.fileInfo.pathList || this.fileInfo.pathList.length <= 1 || this.fileInfo.fileType === 'cad'){
      return;
    }
    this.loadCtrl.presentLoadingString("正在加载......");
    let i=0;
    for(;i<this.fileInfo.pathList.length;i++) {
      if (this.imagePath === this.fileInfo.pathList[i]) {
        break;
      }
    }
    if(event.direction===2){//left
      if(i===0){
        i = this.fileInfo.pathList.length -1 ;
      }else{
        i--;
      }
    }else if(event.direction===4){//right
      if(i=== this.fileInfo.pathList.length -1){
        i = 0;
      }else{
        i++;
      }
    }
    this.imagePath = this.fileInfo.pathList[i];
    this.imageUrl = encodeURI(this.baseUrl + '/Lenovo/DownloadFileEx?path=' + encodeURIComponent(this.imagePath.replace(/\\/g, '/')));
  }
}

