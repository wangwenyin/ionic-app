import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, PopoverController } from 'ionic-angular';
import { ForgeModelComponent, ForgeModelBroweOption, ModelUrl, ForgeEventType, ModelColorEnum, MenuProperty } from '../../shared/common/forge-model/forge-model';
import { DocumentServiceProxy, FileServiceProxy, ModelServiceProxy } from '../../shared/service-proxies-hdApp/service-proxies-hdApp';
import { AppSessionService } from '../../shared/app-session.service';
import { AddQualityPatrolPage } from '../add-quality-patrol/add-quality-patrol';
/**
 * Generated class for the ThreeModelPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-three-model',
  templateUrl: 'three-model.html',
})
export class ThreeModelPage {

  @ViewChild(ForgeModelComponent)
  forgeModel: ForgeModelComponent;

  forgeModelBroweOption: ForgeModelBroweOption;

  data: any;

  forgeModelUrl: string;

  modelId: string;

  qualityQuestionDataSource: any ;// 质量问题数据源

  safeQuestionDataSource: any; // 安全问题数据源

  currentModelName =  ''; // 当前模型名称

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private popoverCtrl: PopoverController,
    private documentServiceProxy: DocumentServiceProxy,
    private fileServiceProxy: FileServiceProxy,
    private modelServiceProxy: ModelServiceProxy,
    private appSessionService: AppSessionService, ) {
    this.data = navParams.get('model');
    this.forgeModelUrl = this.fileServiceProxy.fileUrls + '/file/downloadByPath';
    // console.log(this.data);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ThreeModelPage');
    if (this.data !== null && this.data !== undefined) {
      console.log('forgeModelBroweOption 1');
      this.forgeModelBroweOption = this.data;
    } else {
      this.getModel();
    }
    console.log(this.forgeModelBroweOption);

    this.getFafeQuestion();
    this.getQualityQuestion();
  }

  /**
   * 查询质量问题
   */
  getQualityQuestion() {
    const param = {
      'projectId.equals': this.appSessionService.projectId,
      'state.in': ['1','2','3', '4', '5','6','7','8'],
      'questionType.in': ['1','2','3', '4'],
    };
    this.modelServiceProxy.getQuestionByQuestionType(param).subscribe((res) => {
      this.qualityQuestionDataSource = res.body;
   });
  }

  /**
   * 查询安全问题
   */
  getFafeQuestion() {
    const param = {
      'projectId.equals': this.appSessionService.projectId,
      'questionType.in': [ '2','1']
    };
    this.modelServiceProxy.getSecurityQuestionType(param).subscribe((res) => {
      this.safeQuestionDataSource = res.body;
    })
  }
  getModel() {
    this.modelServiceProxy.getManageModel(this.appSessionService.projectId).subscribe(data => {
      if (data.body.length > 0) {
        this.modelId = data.body[0].fileId;
        this.changeModel(data.body[0]);
      } else {
        const tmp: ModelUrl = {
          threeUrl: 'assets/SVFModel/斯维尔清溪基地/3d.svf',
          dwgUrl: 'assets/SVFModel/斯维尔清溪基地/f2d_楼层平面__F3（8.30）/primaryGraphics.f2d',
          modelName: '斯维尔清溪基地'
        };
        const temp: ForgeModelBroweOption = {
          modelUrl: tmp
        };
      }
    });
  }

  onHideToolbar() {
    this.forgeModel.setToolbarVisible();
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
        if(data.model) {
          const model = data.model;
          this.modelId = data.model.fileId;
          this.changeModel(model, true);
        }
      }
    })
  }

  changeModel(model , isSwitch?: boolean) {
    this.documentServiceProxy.getFileDownLoadPath(model.fileId, model.rev, model.type).subscribe(res => {
      const array = [];
      // for (let i = 1; i < res.body.length; i++) {
      //   array.push(this.forgeModelUrl + '/' + res.body[i].path);
      // }
      // const tmp = {
      //   serverUrl: this.forgeModelUrl + '/' + res.body[0].path,
      //   modelHeight: '90%',
      //   f2dURl: ''
      // };
      if (res.body.length > 0) {
        this.currentModelName = model.name;
        const index = this.currentModelName.lastIndexOf('.');
        this.currentModelName = this.currentModelName.substring(0,index);
        const tmp: ModelUrl = {
          threeUrl:  this.forgeModelUrl + '/' + res.body[0].path,
          dwgUrl: array,
          modelName:this.currentModelName
        };
        const menu: MenuProperty = {
          AddQualityQuestionMenu: true,
          ShowQualityQuestionMenu: true,
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
          menuProperty: menu
        };
        console.log('temp: ' + JSON.stringify(temp));
        console.log('forgeModelBroweOption 2');
        // this.navCtrl.push('ThreeModelPage', {
        //   model: temp
        // });
        this.forgeModelBroweOption = temp;
        if (isSwitch) {
          this.forgeModel.switchModel(this.forgeModelBroweOption);
        }
      }
    });
  }

  onBack() {
    this.navCtrl.pop();
  }


  /**
   * 
   * 模型回调事件
   * @param event
   */
  onModelBrowEvent(event: any){
    const type = event.type;
    const data = event.data;
    if (ForgeEventType.Markup3DClick === type) { // 3d标注点击
       
    } else if (ForgeEventType.AddQualityQuestion === type){ // 添加质量问题
       this.navCtrl.push(AddQualityPatrolPage,{data: data}); //日常质量巡查
    } else if (ForgeEventType.AddSafeQuestion === type) { // 添加安全问题
       this.navCtrl.push('SecurityDalityAddPage',{data: data}); //日常安全巡查
    } else if(ForgeEventType.ShowQualityQuestion === type) { // 显示质量问题
        this.forgeModel.cleanMarkup3D();
        this.setMarkUp3D(true);
    }else if (ForgeEventType.ShowSafeQuestion === type) { // 显示安全
      this.forgeModel.cleanMarkup3D();
      this.setMarkUp3D(false);
    }
  }

  /**
   * 
   * @param flag 3d标注还原 true 质量  false 安全
   */
  setMarkUp3D(flag: boolean) {
    let number = 1;
    let dataSource: any;
    if (flag) dataSource = this.qualityQuestionDataSource;
     else dataSource = this.safeQuestionDataSource; 
    if(dataSource) {
      dataSource.forEach((data) => {
        if (data.modelName && data.partId && this.currentModelName === data.modelName){
          this.forgeModel.setMarkup3D(data.modelName, Number(data.partId), number, data.id, ModelColorEnum.Green);
          number += 1;
        }
      });
    }
  }
}
