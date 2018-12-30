import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, PopoverController } from 'ionic-angular';
import { CreateTaskViewInput, TaskViewServiceProxy, GetTenantUsersOutput } from '../../shared/service-proxies/service-proxies';
import { ThsAlertController,ThsLoadingController } from '../../shared/alert.service';
/**
 * Generated class for the AddDesignViewPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-add-design-view',
  templateUrl: 'add-design-view.html',
})
export class AddDesignViewPage {

  name: string;
  thumbnail: string;
  source: string;
  sourceId: string;
  description:string;
  markPageIndex: string;
  markContent: string;
  shareUsersList: number[];
  userItemList: GetTenantUsersOutput[];
  isSave = false;

  constructor(public navCtrl: NavController,
              private viewCtrl: ViewController,
              public navParams: NavParams,
              private  thsAlertController:ThsAlertController,
              private loadCtrl: ThsLoadingController,
              public popoverController: PopoverController,
              public taskViewServiceProxy: TaskViewServiceProxy) {
    this.thumbnail=this.navParams.get('thumbnail');
    this.source=this.navParams.get('source');
    this.sourceId=this.navParams.get('sourceId');
    this.markPageIndex=this.navParams.get('markPageIndex');
    this.markContent=this.navParams.get('markContent');
    this.userItemList=[];
    this.shareUsersList= [];
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AddDesignViewPage');
  }
  onAddView(){
    try {
      if(this.isSave){
        return;
      }
      if(!this.name || this.name.length<=0){
        this.thsAlertController.basicAlert('提示', '输入名称', '关闭');
        return;
      }
      this.isSave = true;
      this.loadCtrl.presentLoadingString("正在添加......");
      for (let user of this.userItemList) {
        this.shareUsersList.push(user.id);
      }
      if(this.description && this.description.length>0) {
        this.description = this.description.substr(0,200)
      }
      let input = new CreateTaskViewInput({
        name: this.name.substr(0,50),
        thumbnail: this.thumbnail,
        source: this.source,
        sourceId: this.sourceId,
        description: this.description,
        shareUsersList: this.shareUsersList,
        markPageIndex: this.markPageIndex,
        markContent: this.markContent
      });
      this.taskViewServiceProxy.createTaskView(input).subscribe(data => {
        this.loadCtrl.closeLoading();
        this.viewCtrl.dismiss(data);
      },error2 => {
        this.isSave = false;
        this.loadCtrl.closeLoading();
        this.thsAlertController.basicAlert('错误', error2.message, '关闭');
      })
    }catch (e) {
      this.isSave = false;
      this.loadCtrl.closeLoading();
      this.thsAlertController.basicAlert('错误', e.message, '关闭');
    }
  }

  onAddUser(){
    let popover = this.popoverController.create(PopoverPage);
    popover.present({});
    popover.onDidDismiss(result=>{
      if(result){
        this.userItemList = result as GetTenantUsersOutput[];
      }
    });
  }
  onClose(){
    this.viewCtrl.dismiss();
  }
  onKey(event: any, length: number) { // without type info
    event.target.value = event.target.value.substr(0, length);
  }
  getShowName(user: GetTenantUsersOutput){
    if(user.name && user.name.length>0){
      return user.name;
    }
    if(user.userName && user.userName.length>0){
      return user.userName;
    }
    if(user.emailAddress && user.emailAddress.length>0){
      return user.emailAddress;
    }
    if(user.phoneNumber && user.phoneNumber.length>0){
      return user.phoneNumber;
    }
  }
}


@Component({
  template:'<user-select (userSelectEvent)="onClose($event)"></user-select>'
})
export class PopoverPage{
  constructor(public viewCtrl: ViewController) {}
  onClose(data: GetTenantUsersOutput[]) {
    this.viewCtrl.dismiss(data);
  }
}
