import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, PopoverController, ViewController } from 'ionic-angular';
import { AppSessionService } from '../../../shared/app-session.service';
import * as moment from 'moment';
import { ModelUrl, ForgeModelBroweOption, ForgeModelComponent, ForgeEventType, ModelColorEnum, MenuProperty } from '../../../shared/common/forge-model/forge-model';
import { DocumentServiceProxy, FileServiceProxy, ModelServiceProxy } from '../../../shared/service-proxies-hdApp/service-proxies-hdApp';
import { ThsAlertController } from '../../../shared/alert.service';
import { flatten } from '../../../../node_modules/@angular/compiler';


@IonicPage()
@Component({
  selector: 'page-security-manage-model',
  templateUrl: 'security-manage-model.html',
})
export class SecurityManageModelPage {

  @ViewChild(ForgeModelComponent)
  forgeModel: ForgeModelComponent;

  forgeModelBroweOption: ForgeModelBroweOption;

  backPage: string;

  forgeModelUrl: string;

  projectName: string;
  searchValue: string;
  modelId: string;

  questionDataSource: any; // 模型问题数据源

  currentModelName = '';

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private appSessionService: AppSessionService,
    public popoverCtrl: PopoverController,
    private viewCtrl: ViewController,
    private documentServiceProxy: DocumentServiceProxy,
    private fileServiceProxy: FileServiceProxy,
    private modelServiceProxy: ModelServiceProxy,
    private thsAlertController: ThsAlertController,
  ) {
    this.projectName = this.appSessionService.projectName;
    this.forgeModelUrl = this.fileServiceProxy.fileUrls + '/file/downloadByPath';
    this.backPage = this.navParams.get('page');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SecurityManageTypePage');
    this.getModel();
  }

  onBackPage() {
    // this.navCtrl.push('MenuOptionPage');
    this.viewCtrl.dismiss();
  }

  getModel() {
    this.modelServiceProxy.getManageModel(this.appSessionService.projectId).subscribe(data => {
      if (data.body.length > 0) {
        this.modelId = data.body[0].fileId;
        this.changeModel(data.body[0]);
      }
    });
    this.getQuestion();
  }

  getQuestion() {
    const param = {
      'projectId.equals': this.appSessionService.projectId,
    };
    if (this.backPage === 'SecurityManageExaminePage') {// 检查  管监
      param['questionType.in'] = [ '1'];
    } else if (this.backPage === 'SecurityManageDalityPage') {// 巡查 工程部
      param['questionType.in'] = [ '2','1'];
    }
    this.modelServiceProxy.getSecurityQuestionType(param).subscribe((res) => {
      this.questionDataSource = res.body;
    })
  }

  changeModel(model, isSwitch?: boolean) {
    this.documentServiceProxy.getFileDownLoadPath(model.fileId, model.rev, model.type).subscribe(res => {
      if (res.body.length > 0) {
        const array = [];
        // for (let i = 1; i < res.body.length; i++) {
        //   array.push(this.forgeModelUrl + '/' + res.body[i].path);
        // }
        // const tmp = {
        //   serverUrl: this.forgeModelUrl + '/' + res.body[0].path,
        //   modelHeight: '90%',
        //   f2dURl: ''
        // };
        this.currentModelName = model.name;
        const index = this.currentModelName.lastIndexOf('.');
        this.currentModelName = this.currentModelName.substring(0,index);
        const tmp: ModelUrl = {
          threeUrl: this.forgeModelUrl + '/' + res.body[0].path,
          dwgUrl: array,
          modelName: this.currentModelName
        };
     
        const menu: MenuProperty = {
          AddQualityQuestionMenu: false,
          ShowQualityQuestionMenu: false,
          AddSafeQuestionMenu: true,
          ShowSafeQuestionMenu: true,
          ShowFileMenu: false,
          ShowQrcodeMenu: false,
          AddImportQualityQuestionMenu: false,
          AddDailyQualityJianChaMenu: false,
          AddDailyQualityXunChaMenu: false,
          AddDailySafeQuestionJianChaMenu: false,
         };
        const temp: ForgeModelBroweOption = {
          modelUrl: tmp,
          menuProperty: menu,
          addMenuFlag: true
        };
        this.forgeModelBroweOption = temp;
        if (isSwitch) {
          this.forgeModel.cleanMarkup3D();
          this.forgeModel.switchModel(this.forgeModelBroweOption);
        }
      }
    });
  }

  goList() {
    if (this.backPage) {
      this.navCtrl.push(this.backPage);
    } else {
      this.navCtrl.pop();
    }
  }

  selectModel(event) {
    let popover = this.popoverCtrl.create("ChooseModelPage", {
      modelId: this.modelId,
      // startDate: this.startDate ? this.startDate.format('YYYY-MM-DD') : "",
      // endDate: this.endDate ? this.endDate.format('YYYY-MM-DD') : ""
    });
    popover.present({
      ev: event
    });
    popover.onDidDismiss(data => {
      if (data) {
        if (data.model) {
          const model = data.model;
          this.modelId = data.model.fileId;
          this.changeModel(model, true);
        }
      }
    })
  }
  addSecurity() {
    if (this.backPage === 'SecurityManageExaminePage') {// 检查  管监
      this.navCtrl.push('SecurityExamineAddPage');
    } else if (this.backPage === 'SecurityManageDalityPage') {// 巡查 工程部
      this.navCtrl.push('SecurityDalityAddPage');
    }
  }
  onModelBrowEvent(event) {
    const type = event.type;
    const data = event.data;
    if (type === ForgeEventType.AddQuestion) { // 附件
      // if (data && data.length > 0) {
      if (this.backPage === 'SecurityManageExaminePage') {
        this.navCtrl.push('SecurityExamineAddPage', { data: data });
      } else if (this.backPage === 'SecurityManageDalityPage') {
        this.navCtrl.push('SecurityDalityAddPage', { data: data });
      }
      // } else {
      //   this.thsAlertController.basicAlert('提示', '请先选择构件', '确定');
      // }
    }else if (ForgeEventType.Markup3DClick === type) { // 3d标注点击 
      if (this.backPage === 'SecurityManageExaminePage') {// 检查  管监
        this.navCtrl.push('SecurityExamineEditPage', {id: data});
      } else if (this.backPage === 'SecurityManageDalityPage', {id: data}) {// 巡查 工程部
        this.navCtrl.push('SecurityDalityEditPage', {id: data});
      }
    } else if (ForgeEventType.Select3DPart === type) { // 3d模型选中
     
    } else if (ForgeEventType.ModelLoadOver === type) { // 模型加载完
      this.setMarkUp3D();
    } else if (ForgeEventType.AddSafeQuestion === type){// 添加安全问题
      if (this.backPage === 'SecurityManageExaminePage') {
        this.navCtrl.push('SecurityExamineAddPage', { data: data });
      } else if (this.backPage === 'SecurityManageDalityPage') {
        this.navCtrl.push('SecurityDalityAddPage', { data: data });
      }
    } else if (ForgeEventType.ShowSafeQuestion === type) {
          this.forgeModel.cleanMarkup3D();
          this.setMarkUp3D();
    }
  }

   /**
   * 设置3d 标注信息
   */
  setMarkUp3D() {
    let number = 1;
    if(this.questionDataSource) {
      this.questionDataSource.forEach((data) => {
        if (data.modelName && data.partId && this.currentModelName === data.modelName){
          this.forgeModel.setMarkup3D(data.modelName, Number(data.partId), number, data.id, ModelColorEnum.Green);
          number += 1;
        }
      });
    }
  }
}
