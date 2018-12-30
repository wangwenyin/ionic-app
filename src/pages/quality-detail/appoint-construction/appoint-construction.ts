import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, PopoverController } from 'ionic-angular';
import { Employee, EmployeeServiceProxy, QualityServiceProxy } from '../../../shared/service-proxies-hdApp/service-proxies-hdApp';
import { AppSessionService } from '../../../shared/app-session.service';
import { ThsAlertController } from '../../../shared/alert.service';
import { UserSelectPage } from '../../supervisor-quality-check/add-quality/add-quality';

/**
 * Generated class for the AppointConstructionPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-appoint-construction',
  templateUrl: 'appoint-construction.html',
})
export class AppointConstructionPage {

  userItem: any;

  nowUser: Employee;

  id: string;

  type: string;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private popoverController: PopoverController,
    private employeeServiceProxy: EmployeeServiceProxy,
    private appSessionService: AppSessionService,
    private qualityServiceProxy: QualityServiceProxy,
    private thsAlertController: ThsAlertController,
  ) {
    this.id = this.navParams.get('id');
    this.type = this.navParams.get('type');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AppointConstructionPage');
    this.getUser();
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
      departmentId: this.nowUser.departmentId,
      unitId: this.nowUser.unitId
    });
    popover.present({});
    popover.onDidDismiss(result => {
      if (result) {
        this.userItem = result;
      }
    });
  }

  onSaveRecord() {
    if (this.userItem) {
      const list = [];
      const dto = new AllotQuestionDTO();
      dto.id = this.id;
      dto.questionType = this.type;
      dto.buildingModifier = this.userItem.empId;
      list.push(dto);
      this.qualityServiceProxy.allotQuestionToPerson(list).subscribe();
      this.thsAlertController.basicAlert('提示', '保存成功', '确定');
      this.navCtrl.pop();
    } else {
      this.thsAlertController.basicAlert('提示', '请输入所有必填信息', '确定');
    }

  }

  getShowName(user: any) {
    if (user) {
      if (user.name && user.name.length > 0) {
        return user.name;
      }
    }
  }

}

export class AllotQuestionDTO {

  id?: string;
  /**
   * 问题类型
   */
  questionType?: string;
  /**
   * 整改人
   */
  buildingModifier?: string;
  /**
   * 楼层
   */
  floorName?: string;
  /**
   * 构建id
   */
  partId?: string;
  /**
   * 模型名称
   */
  modelName?: string;

}
