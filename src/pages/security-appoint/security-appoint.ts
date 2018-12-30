import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, PopoverController } from 'ionic-angular';
import { SafeServiceProxy, QualityServiceProxy, EmployeeServiceProxy } from '../../shared/service-proxies-hdApp/service-proxies-hdApp';
import { AppSessionService } from '../../shared/app-session.service';
import { ThsAlertController } from '../../shared/alert.service';
import { UserSelectPage } from '../supervisor-quality-check/add-quality/add-quality';
import * as moment from 'moment';

@IonicPage()
@Component({
  selector: 'page-security-appoint',
  templateUrl: 'security-appoint.html',
})
export class SecurityAppointPage {

  unitList = [];

  type: number;

  data: any;

  id: string;

  isEngineer: boolean;

  userItem: any;

  overDate: Date;

  sendUnit: string;

  nowUser: any;
  appSession = {
    projectId: '',
    entityId: ''
  };

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private qualityServiceProxy: QualityServiceProxy,
    private safeServiceProxy: SafeServiceProxy,
    private appSessionService: AppSessionService,
    private popoverController: PopoverController,
    private thsAlertController:ThsAlertController,
    private employeeServiceProxy: EmployeeServiceProxy,
    ) {
      this.id = this.navParams.get('id');
      this.type = this.navParams.get('type');
      this.isEngineer = this.navParams.get('isEngineer');
      this.appSession = JSON.parse(sessionStorage.getItem('appSession'))
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AppointPage');
    this.getUser();
    this.getUnits();
    this.getData();
  }

  getUnits() {
    this.qualityServiceProxy.getUnits({'projectId.equals': this.appSessionService.projectId || this.appSession.projectId,
     'isDeleted.equals': '0'}).subscribe(res => {
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
      'projectId.equals': this.appSessionService.projectId || this.appSession.projectId,
      'isDeleted.equals': '0',
      'empId.equals': this.appSessionService.entityId || this.appSession.entityId,
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
    this.safeServiceProxy.findDailySafeById(this.id).subscribe(res => {
      let data = res.body;
      if (this.isEngineer) {
        data.sendOrganization = this.sendUnit
        data.recheckEngineerId = this.userItem.empId
        data.engineerOverTime = moment(this.overDate).toJSON();
      } else {
        data.sendOrganization = this.sendUnit
        data.recheckEngineerName = this.userItem.empId
      }
      console.log(data)
      this.safeServiceProxy.updateDailySafe(data).subscribe(res => {
        this.thsAlertController.basicAlert('修改成功','','确认');
      })
    });
  }
}
