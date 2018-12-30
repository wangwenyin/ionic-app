import { Component } from '@angular/core';
import { IonicPage, NavController, AlertController, NavParams, Tabs } from 'ionic-angular';
import { AppSessionService } from '../../shared/app-session.service';
import { ThsAlertController } from '../../shared/alert.service';
import { AppPermissions } from '../../shared/app.permissions';

/**
 * Generated class for the MenuOptionPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-menu-option',
  templateUrl: 'menu-option.html',
})
export class MenuOptionPage {

  projectName: string;
  // 质量检查
  qualityKPICheck = false;
  // 管监质量日常检查
  qualityNotKPICheck = false;
  // 重大质量问题
  qualityImportmentCheck = false;
  // 管监安全检查
  securityKPICheck = false;
  // 质量巡检
  qualityPatrol = false;
  // 安全巡检
  securityPatrol = false;

  constructor(public navCtrl: NavController, public alertCtrl: AlertController, public navParams: NavParams,
    private appSessionService: AppSessionService,
    private thsAlertController: ThsAlertController,
    private appPermissions: AppPermissions,
    ) {
      this.projectName = this.appSessionService.projectName;
      this.qualityKPICheck = this.appSessionService.hasGranted(this.appPermissions.GET_QUALITY_KPI_CHECKS);
      this.qualityNotKPICheck = this.appSessionService.hasGranted(this.appPermissions.GET_QUALITY_NO_KPI_CHECK);
      this.qualityImportmentCheck = this.appSessionService.hasGranted(this.appPermissions.GET_HIGH_QUESTION);
      this.securityKPICheck = this.appSessionService.hasGranted(this.appPermissions.SHOE_SAFE_KPI_CHECK);
      if(this.appSessionService.hasGranted(this.appPermissions.GET_QUALITY_DAY_CHECKS) || this.appSessionService.hasGranted(this.appPermissions.GET_QUALITY_BUILDING_CHECKS)) {
        this.qualityPatrol = true;
      } 
      if(this.appSessionService.hasGranted(this.appPermissions.SAFE_SHOW_DAY_CKECKS_OUTSIDE) || this.appSessionService.hasGranted(this.appPermissions.SAFE_SHOW_DAY_CKECKS)) {
        this.securityPatrol = true;
      }
    }

  ionViewDidLoad() {
    console.log(this.appSessionService);
    const appSession = {
      projectId: this.appSessionService.projectId,
      entityId: this.appSessionService.entityId,
    }
    sessionStorage.setItem('appSession', JSON.stringify(appSession))
  }

  goTodos() {
    this.thsAlertController.basicAlert('提示','此功能正在开发中','确定');
    // this.navCtrl.push('NeedTodoPage')
  }

  onOpenExamine() {
    // this.navCtrl.push('QualityManagePage');
    this.navCtrl.push('QualityModelPage',{ page: 'QualityManagePage'});
  }

  onOpenImport() {
    this.navCtrl.push('QualityModelPage',{ page: 'ImportantQualityPage'});
    // this.navCtrl.push('ImportantQualityPage');
  }

  onOpendaily() {
    this.navCtrl.push('QualityModelPage',{ page: 'DailyQualityManagePage'})
    // this.navCtrl.push('DailyQualityManagePage');
  }

  onOpenSafeExamine() {
    this.navCtrl.push('SecurityManageModelPage', {page: 'SecurityManageExaminePage'});
  }
  onOpenSafeDaily() {
    this.navCtrl.push('SecurityManageModelPage', {page: 'SecurityManageDalityPage'});
  }

  onOpenDocument() {
    this.navCtrl.push('FileManagePage');
  }

  onOpenProcess() {
    this.navCtrl.push('ProcessManagePage');
  }

  openModel() {
    this.navCtrl.push('ThreeModelPage');
  }

  openPictuce() {
    // this.navCtrl.push('ProcessSnapPage');
    this.thsAlertController.basicAlert('提示','此功能正在开发中','确定');
  }

  onOpenDailyPatrol() {
    this.navCtrl.push('QualityModelPage', {page: 'QualityPatrolManagePage'});
  }

  goNotice() {
    // this.navCtrl.push('NoticePage');
    this.thsAlertController.basicAlert('提示','此功能正在开发中','确定');
  }
  
  goBack() {
    this.navCtrl.push('TenantManagePage');
  }

  otherQuality() {
    this.navCtrl.push('OtherQualityEngineerPage');
  }
  otherSafe() {
    this.navCtrl.push('OtherSecurityEngineerPage');
  }

  goMyCenter() {
    this.navCtrl.push('PersonalPage');
  }

  otherConstructionQuality() {
    this.navCtrl.push('OtherQualityConstructionPage');
  }
}
