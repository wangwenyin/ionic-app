/**
 * Created by yuanmh on 2017/8/19.
 */
import { Injectable } from '@angular/core';
import {Loading, LoadingController, LoadingOptions,AlertController  } from 'ionic-angular'
import {Toast} from "@ionic-native/toast";
import {isUndefined} from "util";
@Injectable()
export  class ThsLoadingController{
  opts:LoadingOptions=<LoadingOptions>{};
  loadInstance:Loading;
  constructor(private loadingCtrl:LoadingController){
    // this.opts.content='';
    this.opts.dismissOnPageChange=true;
    this.opts.enableBackdropDismiss=true;
    this.opts.duration=1000*100;
  }
   presentLoading() {
    this.loadInstance = this.loadingCtrl.create(this.opts);
    this.loadInstance.present();
  }
  presentLoadingString(info:string) {
    let opt=<LoadingOptions>{
      dismissOnPageChange:true,
      enableBackdropDismiss:true,
      duration:1000*100,
      content:info
    };
    this.loadInstance = this.loadingCtrl.create(opt);
    this.loadInstance.present();
  }
   closeLoading() {
   if(this.loadInstance){
     this.loadInstance.dismiss();
     this.loadInstance=null;
   }
  }
}

@Injectable()
export  class ThsAlertController{
  constructor(private alertCtrl:AlertController){

  }
  basicAlert(title:string,subTitle:string,button:string) {
    let alert = this.alertCtrl.create({
      title: title,
      subTitle: subTitle,
      buttons: [button]
    });
    alert.present();
  }
}
@Injectable()
export  class ThsToastController{
  constructor(private toast: Toast){

  }
  show(message:string,position?:string,duration?:string){
    if(duration==null||isUndefined(duration)){
      duration='1500';
    }
    if(position==null||isUndefined(position)){
      position='center';
    }
    this.toast.show(message, duration, position).subscribe(
      toast => {
        // console.log(toast);
      }
    );
  }
  showTop(message:string,duration?:string){
    this.show(message,'top',duration);
  }
  showBottom(message:string,duration?:string){
    this.show(message,'bottom',duration);
  }
  showCenter(message:string,duration?:string){
    this.show(message,'center',duration);
  }
}
