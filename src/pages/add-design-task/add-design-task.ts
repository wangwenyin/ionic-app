import { Component } from '@angular/core';
import { IonicPage, NavController, ViewController, PopoverController,NavParams } from 'ionic-angular';
import { TaskViewServiceProxy, TaskUnitServiceProxy, CreateTaskUnitInput, CreateTaskViewInput, GetTenantUsersOutput } from '../../shared/service-proxies/service-proxies'
import * as moment from 'moment';
import { ThsAlertController,ThsLoadingController } from '../../shared/alert.service';
/**
 * Generated class for the AddDesignTaskPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-add-design-task',
  templateUrl: 'add-design-task.html',
})
export class AddDesignTaskPage {

  input: CreateTaskUnitInput;

  thumbnail: string;
  source: string;
  sourceId: string;
  markPageIndex: string;
  markContent: string;

  userItem: GetTenantUsersOutput;

  isSave = false;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private viewCtrl: ViewController,
              private  thsAlertController:ThsAlertController,
              private loadCtrl: ThsLoadingController,
              public taskViewServiceProxy: TaskViewServiceProxy,
              public taskUnitServiceProxy: TaskUnitServiceProxy,
              public popoverController: PopoverController,) {
    this.input = new CreateTaskUnitInput();
    this.input.isSendEmail = true;
    this.thumbnail=this.navParams.get('thumbnail');
    this.source=this.navParams.get('source');
    this.sourceId=this.navParams.get('sourceId');
    this.markPageIndex=this.navParams.get('markPageIndex');
    this.markContent=this.navParams.get('markContent');
    this.userItem = new GetTenantUsersOutput();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AddDesignTaskPage');
  }
  onAddTask(){
    try {
      if(this.isSave){
        return;
      }
      if(!this.input.title || this.input.title.length<=0){
        this.thsAlertController.basicAlert('提示', '输入标题', '关闭');
        return;
      }
      this.isSave = true;
      this.loadCtrl.presentLoadingString("正在添加......");
      if(this.input.description && this.input.description.length>0) {
        this.input.description = this.input.description.substr(0,200)
      }
      let input = new CreateTaskViewInput({
        name: this.input.title.substr(0,50),
        thumbnail: this.thumbnail,
        source: this.source,
        sourceId: this.sourceId,
        description: this.input.description,
        shareUsersList: [],
        markPageIndex: this.markPageIndex,
        markContent: this.markContent

      });
      this.taskViewServiceProxy.createTaskView(input).subscribe(data => {
        this.input.viewList = [data.id];
        this.input.expirationTime = moment(this.input.expirationTime).hour(8);
        if (this.userItem) {
          this.input.dutyer = this.userItem.id;
        }
        this.taskUnitServiceProxy.createTaskUnit(this.input).subscribe(data2 => {
          this.viewCtrl.dismiss(data2);
          this.loadCtrl.closeLoading();
        }, error2 => {
          this.isSave = false;
          this.loadCtrl.closeLoading();
          this.thsAlertController.basicAlert('错误', error2.message, '关闭');
        })
      },error2 => {
        this.loadCtrl.closeLoading();
        this.isSave = false;
        this.thsAlertController.basicAlert('错误', error2.message, '关闭');
      })
    }catch (e) {
      this.loadCtrl.closeLoading();
      this.isSave = false;
      this.thsAlertController.basicAlert('错误', e.message, '关闭');
    }
  }
  onAddUser(){
    let popover = this.popoverController.create(TaskAddUserPage);
    popover.present({});
    popover.onDidDismiss(result=>{
      if(result){
        this.userItem = result;
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
  template:'<sign-user-select (userSelectEvent)="onClose($event)"></sign-user-select>'
})
export class TaskAddUserPage{
  constructor(public viewCtrl: ViewController) {}
  onClose(data: GetTenantUsersOutput) {
    this.viewCtrl.dismiss(data);
  }
}
