import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ModelBroweOption, ModelReaderType} from '../../shared/common/model-browe/model-browe.component';
// import { PdfViererOption, PdfBroweComponent} from '../../shared/common/pdf-browe/pdf-browe.component';
import { FileService } from '../../shared/file.service';
import { ThsToastController } from '../../shared/alert.service';
/**
 * Generated class for the LocalFilePreviewPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-local-file-preview',
  templateUrl: 'local-file-preview.html',
})
export class LocalFilePreviewPage {

  // optionPdf: PdfViererOption;
  optionModel: ModelBroweOption;
  // @ViewChild(PdfBroweComponent)
  // private pdfBrowe: PdfBroweComponent;

  _showModelOrPdf: boolean;

  private initalDistance;
  private scale = 0;
  private zoom = 100;
  private upZoom = 0;
  isPinching: boolean;

  fileType: string;
  filePath: string;
  name: string;
  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private fileService: FileService,
              private toastController: ThsToastController) {

    // this._showModelOrPdf = false;
    this.fileType = this.navParams.get('fileType');
    this.filePath = this.navParams.get('filePath');
    this.name = this.navParams.get('name');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LocalFilePreviewPage');
    if (this.fileType === 'pdf') {
      this._showModelOrPdf = false;
      this.fileService.readAsArrayBuffer(this.filePath).then(data => {
        // this.optionPdf = {
        //   pdfSrc: data
        // };
      })
    } else {
      let option: ModelBroweOption = {
        serverUrl: 'http://47.100.224.36:8808/service',
        name: '结构模型算量配筋模型(1)~-~20171101143303',
        readerType: ModelReaderType.ClientStream,
        width: $(window).width(),
        height: $(window).height() - 100
      };
      this._showModelOrPdf = true;
      this.fileService.readAsArrayBuffer(this.filePath).then(data => {
        option.readerType = ModelReaderType.Scs;
        option.bufferData = new Uint8Array(data);
        this.optionModel = option;
      })
    }
  }
  ionViewWillLeave(){
    // if(this.optionPdf){
    //   this.pdfBrowe.setZoom(0);
    //   // this.pdfBrowe.onDestroy();
    // }
    // let thisBak = this;
    // setTimeout(function () {
    //   thisBak.navCtrl.pop();
    // },500);
  }
  touchStart(evt) {
    if(this._showModelOrPdf === true){
      return;
    }
    console.log('touchStart');
    if (evt.touches.length === 2) {
      this.isPinching = true;
      if(this.scale <= 0 ){
        // this.scale = Math.round(this.pdfBrowe.getZoom()*100);
      }
      this.upZoom = 0;
    }
  }

  touchMove(evt) {
    if(this._showModelOrPdf === true){
      return;
    }
    if (this.isPinching) {
      if (!this.initalDistance) {
        this.initalDistance = this.getDistance(evt);
      }
      this.upZoom = Math.round(this.getScale(evt) * 100) - 100;

      if(this.upZoom + this.zoom <= 50){
        this.upZoom = 50 - this.zoom;
      }
      // this.pdfBrowe.setZoom(this.scale*((this.zoom+this.upZoom)/100));
      this.toastController.showCenter((this.zoom+this.upZoom) + '%', '10');
    }
  }

  touchEnd(evt) {
    if(this._showModelOrPdf === true){
      return;
    }
    if (evt.touches.length != 2 || this.isPinching) {
      console.log('touchEnd');
      this.initalDistance = undefined;
      this.isPinching = false;
      this.zoom += this.upZoom ;
      this.upZoom = 0;
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

  private getScale(e) {
    let tmp = this.getDistance(e) / this.initalDistance;
    console.log('getScale: ' + tmp);
    return tmp;
  }

}
