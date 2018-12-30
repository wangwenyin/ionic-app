import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import {
  UserRegisterServiceServiceProxy
} from '../../shared/service-proxies/service-proxies';
import { ThsAlertController,ThsLoadingController, ThsToastController } from '../../shared/alert.service';
import { RegisterModel } from './register.model';
/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-register',
  templateUrl: 'register.html',
})
export class RegisterPage {
  model: RegisterModel=new RegisterModel();
  phoneNumber:string;
  validateCode:number;
  canClick:boolean=false;
  isEqual_passwork:boolean=true;
  timerHandler:any;
  saving=false;
  constructor(public navCtrl: NavController,
                private loadCtrl:ThsLoadingController,
                private  thsAlertController:ThsAlertController,
                private thsToastController:ThsToastController,
                private _userRegisterService: UserRegisterServiceServiceProxy,) {
  }
  onRegister(){
    this.navCtrl.push('RegisterPage');
  }
  onBackPage(){
    // this.navCtrl.push('LoginPage');
    this.navCtrl.pop();
  }

  //获取验证码
  getValidateCode(){
    this.canClick=true;
    /*
    this.timerHandler=setTimeout(function(){
      this.canClick=false;
    },59000);*/
    let pattern=new RegExp(/^1[34578]\d{9}$/);
    if(!pattern.test(this.model.phoneNumber)){
      this.thsToastController.show("输入有误，请检查您的手机号码！");
      this.canClick=false;
      //clearTimeout(this.timerHandler);
      return 
    }
    //abp.notify.info("正在发送，请稍等...");
    //this.thsToastController.show("正在发送，请稍等...");
    this._userRegisterService.sendSmsCode(this.model.phoneNumber).subscribe(result=>{
      this.canClick=false;
      let msg=result.strMsg;
      if(result.status===true){
        //this.notify.success(msg);
        this.thsToastController.show(msg);
      }else if(result.status===false){
        this.thsAlertController.basicAlert("提示","抱歉，短信平台异常，请稍后再试！","关闭");
        //this.canClick=false;
        //clearTimeout(this.timerHandler);
      }else{
        this.thsAlertController.basicAlert("错误","接口服务异常！","关闭");
        //this.canClick=false;
        //clearTimeout(this.timerHandler);
      }
    });
  }

  save(model:RegisterModel):void {
    let pattern=new RegExp(/^1[34578]\d{9}$/);
    if(!pattern.test(this.model.phoneNumber)){
      //this.showAlert("错误","输入有误，请检查您的手机号码！");
      this.thsToastController.show("输入有误，请检查您的手机号码！");
      return 
    }
    /*
    let patternValidateCode=new RegExp(/^\d{4,6}$/);
    if(!patternValidateCode.test(this.model.validateCode.toString())){
      this.presentToast("请输入正确的验证码！");
      return 
    }
    */
   if(this.model.validateCode===undefined){
    this.thsToastController.show("请输入验证码！");
    return 
   }
    if(this.model.password===undefined||this.model.password===''){
      this.thsToastController.show("请输入密码！");
      return;
    }else if(this.model.password.length<4){
      this.thsToastController.show("密码长度不能低于4位!");
      return;
    }else if(this.model.passwordRepeat!==this.model.password){
      this.thsToastController.show("密码不一致，请检查您的输入!");
      return;
    }
    if(this.model.company===undefined||this.model.company===''){
      this.thsToastController.show("请检查公司名称的输入！");
      return;
    }
    if(model.name===undefined||model.name===''){
      this.thsToastController.show("请检查姓名的输入！");
      return;
    }
    //let patternEmail=new RegExp(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{1,})+$/);
    let patternEmail=new RegExp(/^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/);
    if(!patternEmail.test(this.model.emailAddress)){
      this.thsToastController.show("输入有误，请检查您的邮箱地址！");
      return;
    }
    this.saving=true;
    this._userRegisterService.userRegister(this.model)
    //.finally(()=>{this.saving=false;})
    .subscribe((result)=>{
      let msg=result.msg;
      this.thsToastController.show(msg);
      if(result.code===1){
        this.navCtrl.pop();
      }
      /*
      if(result.code===1){
        this.presentToast(msg);
        this.navCtrl.pop();
        return;
      }else if(result.code===2){
        this.presentToast(msg);
      }else{
        this.showAlert("错误",msg);
      }
      */
    });
  }
  
  validateEqual(){
    if(this.model.password===undefined||this.model.password===''){
      this.isEqual_passwork=true;
    }else if(this.model.passwordRepeat!==this.model.password){
      this.isEqual_passwork=false;
    }else if(this.model.passwordRepeat===this.model.password){
      this.isEqual_passwork=true;
    }
  }
  
}

