import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, PopoverController } from 'ionic-angular';
import { ForgeModelBroweOption, ForgeModelComponent, ModelUrl, ForgeEventType, ModelColorEnum, MenuProperty } from '../../shared/common/forge-model/forge-model';
import { ModelServiceProxy, DocumentServiceProxy, FileServiceProxy, EmployeeServiceProxy, Employee } from '../../shared/service-proxies-hdApp/service-proxies-hdApp';
import { AppSessionService } from '../../shared/app-session.service';
import { ThsAlertController } from '../../shared/alert.service';
import { AppPermissions } from '../../shared/app.permissions';

/**
 * Generated class for the QualityModelPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-quality-model',
  templateUrl: 'quality-model.html',
})
export class QualityModelPage {

  @ViewChild(ForgeModelComponent)
  forgeModel: ForgeModelComponent;

  forgeModelBroweOption: ForgeModelBroweOption;

  backPage: string;

  modelId: string;

  forgeModelUrl: string;

  questionDataSource = []; // 模型问题数据源

  currentModelName = '';

  nowProjectEmp: Employee;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private popoverCtrl: PopoverController,
    private modelServiceProxy: ModelServiceProxy,
    private appSessionService: AppSessionService,
    private documentServiceProxy: DocumentServiceProxy,
    private fileServiceProxy: FileServiceProxy,
    private thsAlertController: ThsAlertController,
    private appPermissions: AppPermissions,
    private employeeServiceProxy: EmployeeServiceProxy,
  ) {
    this.backPage = this.navParams.get('page');
    this.forgeModelUrl = this.fileServiceProxy.fileUrls + '/file/downloadByPath';
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad QualityModelPage');
    this.getModel();
  }

  getModel() {
    this.modelServiceProxy.getManageModel(this.appSessionService.projectId).subscribe(data => {
      if (data.body.length > 0) {
        this.modelId = data.body[0].fileId;
        this.changeModel(data.body[0]);
      }
    });

    this.initParams();
  }

  /**
   * 获取不同类型的问题
   */
  initParams() {
    const param = {
      'projectId.equals': this.appSessionService.projectId,
      'state.in': ['1', '2', '3', '4', '5', '6', '7', '8'],
    };
    if (this.backPage === 'QualityManagePage') {// 管监考核
      param['questionType.in'] = ['2'];
    } else if (this.backPage === 'DailyQualityManagePage') {//管监日常
      param['questionType.in'] = ['3'];
    } else if (this.backPage === 'ImportantQualityPage') {// 重大质量问题
      param['questionType.in'] = ['4'];
    } else if (this.backPage === 'QualityPatrolManagePage') { // 工程部或者施工单位
      param['questionType.in'] = ['1', '2', '3', '4'];
      // 是否含有工程部查看问题权限
      const canAbilityViewByEngineer = this.appSessionService.hasGranted(this.appPermissions.GET_QUALITY_DAY_CHECKS);
      // 工程部分发人权限
      const canAbilityEngineer = this.appSessionService.hasGranted(this.appPermissions.DAY_CHECK_ASSIGNER);
      // 是否含有施工方查看问题权限
      const canAbilityViewByBuilding = this.appSessionService.hasGranted(this.appPermissions.GET_QUALITY_BUILDING_CHECKS);
      // 施工方分发人权限
      const canAbilityBuilding = this.appSessionService.hasGranted(this.appPermissions.BUILDING_QUESTION_ASSIGNER);
      if (canAbilityViewByEngineer) {
        if (!canAbilityEngineer) {
          param['recheckEngineerId.equals'] = this.appSessionService.entityId;
          param['creatorUserId.equals'] = this.appSessionService.entityId;
        }
        this.getQuestion(param);
      }
      if (canAbilityBuilding) {
        this.employeeServiceProxy.getEmployeeInProject({
          'empId.equals': this.appSessionService.entityId,
          'projectId.equals': this.appSessionService.projectId,
          'isDeleted.equals': '0'
        }).subscribe(data => {
          if (data.body.length > 0) {
            this.nowProjectEmp = data.body[0];
            param['sendOrganization.equals'] = this.nowProjectEmp.unitId;
            if (!canAbilityViewByBuilding) {
              param['buildingModifier.equals'] = this.appSessionService.entityId;
            }
            this.getQuestion(param);
          }
        });

      }
    }
  }
  /**
   *获取质量问题
   *
   * @param {*} param
   * @memberof QualityModelPage
   */
  getQuestion(param) {
    this.modelServiceProxy.getQuestionByQuestionType(param).subscribe((res) => {
      this.questionDataSource = res.body;
    });
  }
  /**
   *更换模型
   * @param {*} model
   * @param {boolean} [isSwitch]
   * @memberof QualityModelPage
   */
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
        this.currentModelName = this.currentModelName.substring(0, index);
        const tmp: ModelUrl = {
          threeUrl: this.forgeModelUrl + '/' + res.body[0].path,
          dwgUrl: array,
          modelName: this.currentModelName
        };
        const menu: MenuProperty = {
          AddQualityQuestionMenu: true,
          ShowQualityQuestionMenu: true,
          AddSafeQuestionMenu: false,
          ShowSafeQuestionMenu: false,
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

  onBackPage() {
    this.navCtrl.push('MenuOptionPage');
  }

  addQuantity() {
    if (this.backPage === 'QualityManagePage') {// 管监考核
      this.navCtrl.push('AddQualityPage');
    } else if (this.backPage === 'DailyQualityManagePage') {//管监日常
      this.navCtrl.push('DailyQualityPage');
    } else if (this.backPage === 'ImportantQualityPage') {// 重大质量问题
      this.navCtrl.push('AddImportmentQualityPage');
    } else if (this.backPage === 'QualityPatrolManagePage') { // 工程部或者施工单位
      this.navCtrl.push('AddQualityPatrolPage');
    }
  }

  onModelBrowEvent(event: any) {
    const type = event.type;
    const data = event.data;
    if (type === ForgeEventType.AddQuestion) { // 添加问题
      // if (data && data.length > 0) {
      if (this.backPage === 'QualityManagePage') {
        this.navCtrl.push('AddQualityPage', { data: data });
      } else if (this.backPage === 'DailyQualityManagePage') {
        this.navCtrl.push('DailyQualityPage', { data: data });
      } else if (this.backPage === 'ImportantQualityPage') {
        this.navCtrl.push('AddImportmentQualityPage', { data: data });
      } else if (this.backPage === 'QualityPatrolManagePage') {
        this.navCtrl.push('AddQualityPatrolPage', { data: data })
      }
      // } else {
      //   this.thsAlertController.basicAlert('提示', '请先选择构件', '确定');
      // }
    } else if (ForgeEventType.Markup3DClick === type) { // 3d标注点击 
      if (this.backPage === 'QualityManagePage') {
        this.navCtrl.push('QualityCheckDetailPage', { id: data });
      } else if (this.backPage === 'DailyQualityManagePage') {
        this.navCtrl.push('DailyQualityDetailPage', { id: data });
      } else if (this.backPage === 'ImportantQualityPage') {
        this.navCtrl.push('ImportmentQulityDetailPage', { id: data });
      } else if (this.backPage === 'QualityPatrolManagePage') {
        const index = this.questionDataSource.findIndex(item => item.id === data);
        if (index !== -1) {
          const kind = this.questionDataSource[index];
          if (kind.questionId === '1') {
            this.navCtrl.push('EngineerQualityDetailPage', { id: data });
          } else if (kind.questionId === '2') {
            this.navCtrl.push('SupervisorCheckDetailPage', { id: data });
          } else if (kind.questionId === '3') {
            this.navCtrl.push('SupervisorDailyDetailPage', { id: data });
          } else if (kind.questionId === '4') {
            this.navCtrl.push('SupervisorImportmentDetailPage', { id: data });
          }
        }
      }
    } else if (ForgeEventType.Select3DPart === type) { // 3d模型选中

    } else if (ForgeEventType.ModelLoadOver === type) { // 模型加载完
      this.setMarkUp3D();
    } else if (ForgeEventType.AddQualityQuestion === type) {// 添加质量问题
      if (this.backPage === 'QualityManagePage') {
        this.navCtrl.push('AddQualityPage', { data: data });
      } else if (this.backPage === 'DailyQualityManagePage') {
        this.navCtrl.push('DailyQualityPage', { data: data });
      } else if (this.backPage === 'ImportantQualityPage') {
        this.navCtrl.push('AddImportmentQualityPage', { data: data });
      } else if (this.backPage === 'QualityPatrolManagePage') {
        this.navCtrl.push('AddQualityPatrolPage', { data: data })
      }
    } else if (ForgeEventType.ShowQualityQuestion === type) { // 显示质量问题
      this.forgeModel.cleanMarkup3D();
      this.setMarkUp3D();
    }
  }
  /**
 * 设置3d 标注信息
 */
  setMarkUp3D() {
    let number = 1;
    if (this.questionDataSource) {
      this.questionDataSource.forEach((data) => {
        if (data.modelName && data.partId && this.currentModelName === data.modelName) {
          let modelColor = ModelColorEnum.Green;
          if (['1', '2', '3', '4', '5'].indexOf(data.state) !== -1) {
            modelColor = ModelColorEnum.Red;
          } else if (['6', '7'].indexOf(data.state) !== -1) {
            modelColor = ModelColorEnum.Yellow;
          } else if (data.state === '8') {
            modelColor = ModelColorEnum.Green;
          }
          this.forgeModel.setMarkup3D(data.modelName, Number(data.partId), number, data.id, modelColor);
          number += 1;
        }
      });
    }
  }
}
