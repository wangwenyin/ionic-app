import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController } from 'ionic-angular';
import { SignaturePad, PointGroup} from 'angular2-signaturepad/signature-pad';
import { AppSessionService } from '../../shared/app-session.service';
import {
  HrmsServiceProxy,
  CreateUserSignatureInput
} from '../../shared/service-proxies/service-proxies';
import { ThsAlertController,ThsLoadingController } from '../../shared/alert.service';
/**
 * Generated class for the MeSignaturePadPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-me-signature-pad',
  templateUrl: 'me-signature-pad.html',
})
export class MeSignaturePadPage {

  @ViewChild(SignaturePad) signaturePad: SignaturePad;
  minWidth = 2;
  signatureIcon: string;
  isShowIcon: boolean;
  signaturePadOptions: Object = { // passed through to szimek/signature_pad constructor
    'minWidth': this.minWidth,
    'canvasWidth': 360,
    'canvasHeight': 240,
    'penColor':'red'
  };

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public  hrmsServiceProxy:HrmsServiceProxy,
              public  appSessionService: AppSessionService,
              public menuCtrl: MenuController,
              private  thsAlertController:ThsAlertController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MeSignaturePadPage');
    this.hrmsServiceProxy.getUserSignature().subscribe(result => {
      if(result && result.length>0){
        this.signatureIcon = result;
        this.isShowIcon= true;
      }
    },error2 => {
      this.thsAlertController.basicAlert('错误', error2.message, '关闭');
    })
  }
  ngAfterViewInit() {
    // this.signaturePad is now available
    this.signaturePad.set('minWidth', this.minWidth); // set szimek/signature_pad options at runtime
    this.signaturePad.clear(); // invoke functions from szimek/signature_pad API
  }
  ionViewWillEnter(){
    this.menuCtrl.enable(false, 'authenticated');
  }
  ionViewDidLeave(){
    this.menuCtrl.enable(true, 'authenticated');
  }
  drawComplete() {
    // will be notified of szimek/signature_pad's onEnd event
    // console.log(this.signaturePad.toDataURL());
    console.log('Complete drawing');
  }

  drawStart() {
    // will be notified of szimek/signature_pad's onBegin event
    console.log('begin drawing');
  }
  onUp (){
    if(this.signaturePad && !this.signaturePad.isEmpty()){
      let tmpSignature: Array<PointGroup> = this.signaturePad.toData();
      tmpSignature.pop();
      this.signaturePad.fromData(tmpSignature)
    }
  }
  onDeleteNowSignature() {
    if(this.isShowIcon === true) {
      this.isShowIcon =false;
    }else{
      this.signaturePad.clear();
    }
  }
  onAdd(){
    if(!this.signaturePad || this.signaturePad.isEmpty()){
      this.thsAlertController.basicAlert('提示','未发现签名', '关闭');
      return
    }
    let iconValue = this.signaturePad.toDataURL().substr(22);
    // let input:CreateUserSignatureInput = new CreateUserSignatureInput({
    //   userId: this.appSessionService.entityId,
    //   signatureIcon: iconValue
    // });
    // this.hrmsServiceProxy.createOrUpdateUserSignature(input).subscribe( _=>{
    //   this.signatureIcon = iconValue;
    //   this.thsAlertController.basicAlert('提示','保存成功', '关闭');
    // },error2 => {
    //   this.thsAlertController.basicAlert('错误', error2.message, '关闭');
    // })
  }
}
