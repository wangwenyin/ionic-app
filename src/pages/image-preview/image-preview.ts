/// <reference path="../../../node_modules/panzoom/index.d.ts" />
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ThsToastController } from '../../shared/alert.service';
declare var panzoom:any;
/**
 * Generated class for the ImagePreviewPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-image-preview',
  templateUrl: 'image-preview.html',
})
export class ImagePreviewPage {

  imgSrc: string;
  private initalDistance;
  isPinching: boolean;
  _pngZoom: number;
  _pngZoomTmp: number;
  _maxZoom = 10;
  _scaleCenterX = 0;
  _scaleCenterY = 0;
  constructor(public navCtrl: NavController,
     public navParams: NavParams,
     private toastController: ThsToastController) {
    this.imgSrc = this.navParams.get('imgSrc');
    // this.imgSrc = 'http://connect.seedland.cc:22742/Lenovo/DownloadFileEx?path=%E5%AE%9E%E5%9C%B0%C2%B7%E4%B8%89%E4%BA%9A%E6%B5%B7%E6%A3%A0%E5%8D%8E%E8%91%97/C/J-2-601_636588992056263467@J-2-601_1.Png';
    this._pngZoom = 1;
    this._pngZoomTmp = 0;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ImagePreviewPage');

    (<HTMLImageElement>document.querySelector('page-image-preview .scroll-content .preview-img img')).onload = function () {
      let tmp = $('page-image-preview .scroll-content .preview-img')[0];
      panzoom(tmp,{
        autocenter: true,
        defaultZoomSpeed: 0.035,
        zoomDoubleClickSpeed: 2.0
      });
    };
  }

  ionViewDidEnter(){
  }
  touchStart(evt) {
    console.log('touchStart');
    if (evt.touches.length === 2) {
      this.isPinching = true;
    }
  }

  touchMove(evt) {
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
      let offset = $('page-image-preview .scroll-content .preview-img').offset();
      let offsetX = offset.top;
      let offsetY = offset.left;
      offsetX -= this._scaleCenterX*this._pngZoomTmp;
      offsetY -= this._scaleCenterY*this._pngZoomTmp;
      $('.preview-img').css('transform', 'translate(' + offsetX + 'px,' + offsetY + 'px) scale(' + (this._pngZoom + this._pngZoomTmp) + ')');
      this.toastController.showCenter(Math.round((this._pngZoom + this._pngZoomTmp) * 100) + '%', '10');

      // $('.preview-img').css('transform-origin', 'top left');
      // $('.preview-img').css('transform', 'scale(' + (this._pngZoom + this._pngZoomTmp) + ')');
      // this.toastController.showCenter(Math.round((this._pngZoom + this._pngZoomTmp)*100) + '%', '10');
    }
  }

  touchEnd(evt) {
    if (evt.touches.length != 2 || this.isPinching) {
      console.log('touchEnd');
      this.initalDistance = undefined;
      this.isPinching = false;
      this._pngZoom += this._pngZoomTmp;
      this._pngZoomTmp = 0;
    }
  }
  private getCenter(e){
    let touch0 = e.touches[0];
    let touch1 = e.touches[1];
    this._scaleCenterX =  touch0.pageX - (touch0.pageX - touch1.pageX)/2;
    this._scaleCenterY =  touch0.pageY - (touch0.pageY - touch1.pageY)/2;
  };
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
  test(){
    this._pngZoom+=0.5
    $('.preview-img').css('transform-origin', 'top left');
    $('.preview-img').css('transform', 'scale(' + (this._pngZoom) + ')');
  }

  private getScale(e) {
    let tmp = this.getDistance(e) / this.initalDistance;
    console.log('getScale: ' + tmp);
    return tmp;
  }
}
