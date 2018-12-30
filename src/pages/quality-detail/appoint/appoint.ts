import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, PopoverController } from 'ionic-angular';
import { QualityServiceProxy, EmployeeServiceProxy } from '../../../shared/service-proxies-hdApp/service-proxies-hdApp';
import { AppSessionService } from '../../../shared/app-session.service';
import { ThsAlertController } from '../../../shared/alert.service';
import { UserSelectPage } from '../../supervisor-quality-check/add-quality/add-quality';

/**
 * Generated class for the AppointPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-appoint',
  templateUrl: 'appoint.html',
})
export class AppointPage {

  unitList = [];

  type: number;

  data: any;

  id: string;

  userItem: any;

  overDate: Date;

  sendUnit: string;

  nowUser: any;


  constructor(public navCtrl: NavController, public navParams: NavParams,
    private qualityServiceProxy: QualityServiceProxy,
    private appSessionService: AppSessionService,
    private popoverController: PopoverController,
    private thsAlertController: ThsAlertController,
    private employeeServiceProxy: EmployeeServiceProxy,
  ) {
    this.id = this.navParams.get('id');
    this.type = this.navParams.get('type');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AppointPage');
    this.getUser();
    this.getUnits();
    this.getData();
  }

  getUnits() {
    this.qualityServiceProxy.getUnits({
      'projectId.equals': this.appSessionService.projectId,
      'isDeleted.equals': '0'
    }).subscribe(res => {
      const children = [];
      res.body.forEach((e) => {
        children.push({
          id: e['id'],
          name: e['name']
        });
      });
      this.unitList = children;
    });
  }

  getUser() {
    this.employeeServiceProxy.getEmployeeInProject({
      'projectId.equals': this.appSessionService.projectId,
      'isDeleted.equals': '0',
      'empId.equals': this.appSessionService.entityId,
    }).subscribe(data => {
      if (data.body.length > 0) {
        this.nowUser = data.body[0];
      }
    });
  }


  onAddUser() {
    let popover = this.popoverController.create(UserSelectPage, {
      departmentId: this.nowUser.departmentId
    });
    popover.present({});
    popover.onDidDismiss(result => {
      if (result) {
        this.userItem = result;
      }
    });
  }

  getData() {
    if (this.type === 1) {  // 工程部问题

      this.qualityServiceProxy.getQualityDayChecksById(this.id).subscribe(res => {
        this.data = res.body;
      });

    } else if (this.type === 2) {  // 管监检查

      this.qualityServiceProxy.getQualityById(this.id).subscribe(res => {
        this.data = res.body;
      });

    } else if (this.type === 3) {  // 重大

      this.qualityServiceProxy.findQualityHighQuestionById(this.id).subscribe(res => {
        this.data = res.body;
        console.log(res.body);
      });

    } else if (this.type === 4) {  // 管监日常

      this.qualityServiceProxy.getQualityNoKPICheckById(this.id).subscribe(res => {
        this.data = res.body;
      });

    }
  }
  getShowName(user: any) {
    if (user) {
      if (user.name && user.name.length > 0) {
        return user.name;
      }
    }
  }

  onSaveRecord() {
    if (this.sendUnit && this.userItem && this.overDate) {
      if (this.type === 1) {  // 工程部问题
        this.data.sendOrganization = this.sendUnit;
        this.data.overTime = new Date(this.overDate);
        this.data.recheckEngineerId = this.userItem.empId;
        this.data.state = '3';
        this.qualityServiceProxy.updateQualityDayChecks(this.data).subscribe(res => {
          console.log(res.body);
          this.thsAlertController.basicAlert('提示', '保存成功', '确定');
          this.navCtrl.pop();
        });

      } else if (this.type === 2) {  // 管监检查
        this.data.sendOrganization = this.sendUnit;
        this.data.overTime = new Date(this.overDate);
        this.data.recheckEngineerId = this.userItem.empId;
        this.data.state = '3';
        this.qualityServiceProxy.updateQualityKpiChecks(this.data).subscribe(res => {
          this.thsAlertController.basicAlert('提示', '保存成功', '确定');
          this.navCtrl.pop();
        });

      } else if (this.type === 3) {  // 重大
        this.data.constructionUnit = this.sendUnit;
        this.data.overTime = new Date(this.overDate);
        this.data.recheckEngineer = this.userItem.empId;
        this.data.state = '3';
        this.qualityServiceProxy.updateQualityHighQuestion(this.data).subscribe(res => {
          console.log(res.body);
          this.thsAlertController.basicAlert('提示', '保存成功', '确定');
          this.navCtrl.pop();
        });

      } else if (this.type === 4) {  // 管监日常
        this.data.sendOrganization = this.sendUnit;
        this.data.overTime = new Date(this.overDate);
        this.data.recheckEngineerId = this.userItem.empId;
        this.data.state = '3';
        this.qualityServiceProxy.updateQualityNoKPICheck(this.data).subscribe(res => {
          console.log(res.body);
          this.thsAlertController.basicAlert('提示', '保存成功', '确定');
          this.navCtrl.pop();
        });

      }
    } else {
      this.thsAlertController.basicAlert('提示', '请输入所有必填信息', '确定');
    }

    // this.qualityServiceProxy.
  }

}
