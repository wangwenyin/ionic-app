import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, PopoverController } from 'ionic-angular';
import { AppSessionService } from '../../../shared/app-session.service';
import { SafeServiceProxy, QualityServiceProxy, SafeKPICheck, FileServiceProxy, SafeProcessRecord } from '../../../shared/service-proxies-hdApp/service-proxies-hdApp';
import { ThsAlertController, ThsLoadingController } from '../../../shared/alert.service';


@IonicPage()
@Component({
  selector: 'page-security-examine-edit',
  templateUrl: 'security-examine-edit.html',
})
export class SecurityExamineEditPage {

  toppings: string;

  projectName: string;

  // ExamineList: ExamineList;
  ExamineList: any[] = [];

  checkTermList = [];

  stagesList = [];

  buildingList = [];

  checkPointList = [];

  unitList = [];

  newIamgeFile = [];

  record = new SafeKPICheck();

  imgUrl: string;

  processRecordList = [];

  id: string;

  show = false;

  newRecord = new SafeProcessRecord();

  imageList = [];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private appSessionService: AppSessionService,
    private viewCtrl: ViewController,
    private safeServiceProxy: SafeServiceProxy,
    private qualityServiceProxy: QualityServiceProxy,
    private fileServiceProxy: FileServiceProxy,
    private popoverCtrl: PopoverController,
    private thsAlertController: ThsAlertController,
    private loadCtrl: ThsLoadingController,
  ) {
    this.projectName = this.appSessionService.projectName;
    this.id = this.navParams.get('id');
    this.imgUrl = this.fileServiceProxy.fileUrls + '/file/downloadByPath?path=';
  }

  ionViewDidLoad() {
    this.getData();
    this.getProcessRecordsList();
  }

  onBackPage() {
    // this.viewCtrl.dismiss();
    this.navCtrl.push('SecurityManageExaminePage');
  }
  onCheckLink() {
    this.navCtrl.push('SecurityManageModelPage');
  }

  onSaveRecord() {
    this.viewCtrl.dismiss();
  }

  getData() {
    const params = {
      sort: ['orderNum,asc'],
      'isDeleted.equals': false,
      'branchId.specified': false,
    };
    this.safeServiceProxy.queryInBranch(params).subscribe(data => {
      this.checkTermList = data.body;
    });
    this.qualityServiceProxy.findTypeByTypeCode('LPFL').pipe().subscribe((res) => {
      const children = [];
      for (let i = 0; i < res.body.length; i++) {
        children.push({ name: res.body[i].itemText, id: res.body[i].id });
      }
      this.stagesList = children;
    });
    if (this.id) {
      this.safeServiceProxy.getQualityKpiChecksById(this.id).subscribe(data => {
        this.record = data.body;
        this.changeTerm(this.record.engineeringId);
        this.getBuilding(this.record.stages);
        this.getUnitList(this.record.building)
      })
    }
    const safeAppentFileParam = {
      'recordId.equals': this.id,
      'isDeleted.equals': '0',
    };
    this.safeServiceProxy.getSafeAppentFiles(safeAppentFileParam).subscribe(data => {
      data.body.forEach(item => {
        item.minPath = this.imgUrl + item.minPath;
      })
      this.newIamgeFile = data.body;
    });
  }

  getShowName(user) {
    if (user) {
      if (user.name && user.name.length > 0) {
        return user.name;
      }
    }
  }

  /**
  *工程类别改变
  *
  * @param {*} event
  * @memberof AddQualityPage
  */
  changeTerm(event) {
    const params = {
      'engineeringId.equals': event,
      'isDeleted.equals': false,
      sort: ['orderNum,asc'],
    };
    this.safeServiceProxy.queryInSubentry(params).subscribe(data => {
      console.log(data.body);
      this.checkPointList = data.body;
    });
  }

  /**
   *楼层改变
   * @param {*} event
   * @memberof AddQualityPage
   */
  getBuilding(event) {
    this.qualityServiceProxy.findTypeByParentIdCode(event).pipe().subscribe((res) => {
      const children = [];
      for (let i = 0; i < res.body.length; i++) {
        children.push({ name: res.body[i].itemText, id: res.body[i].id });
      }
      this.buildingList = children;
    });
  }
  /**
   *楼栋改变
   *
   * @param {*} event
   * @memberof AddQualityPage
   */
  getUnitList(event) {
    this.qualityServiceProxy.findTypeByParentIdCode(event).pipe().subscribe((res) => {
      const children = [];
      for (let i = 0; i < res.body.length; i++) {
        children.push({ name: res.body[i].itemText, id: res.body[i].id });
      }
      this.unitList = children;
    });
  }

  /**
     * 获取完工确认信息
     */
  getProcessRecordsList() {
    const param = {
      'questionId.equals': this.id,
      'projectId.equals': this.appSessionService.projectId,
      'isDeleted.equals': false,
      'sort': 'creationTime,desc',
    };
    this.safeServiceProxy.getSafeProcessRecords(param).subscribe(res => {
      this.processRecordList = res.body;
      if (res.body.length > 0) {
        this.show = true;
        this.newRecord = res.body[0];
        // this.getImageList(res.body);
      }
    });
  }

  /**
   * 获取完工确认图片信息
   */
  getImageList(list: SafeProcessRecord[]) {
    const recordIdList = [];
    list.forEach(dto => {
      recordIdList.push(dto.id);
    });
    const qualityAppentFileParam = {
      'recordId.in': recordIdList,
      'isDeleted.equals': '0',
    };
    this.safeServiceProxy.getSafeAppentFiles(qualityAppentFileParam).subscribe((fileList) => {
      this.imageList = [];
      fileList.body.forEach(fileInfo => {
        const file = {
          'id': fileInfo.id,
          'recordId': fileInfo.recordId,
          'path': this.imgUrl + encodeURIComponent(fileInfo.path),
          'url': this.imgUrl + encodeURIComponent(fileInfo.minPath),
        };
        this.imageList.push(file);
      });
    });
  }

  showInput(value,i) {
    this.navCtrl.push('SecurityCheckInputPage', {id: this.processRecordList[i].id ,
        type: 1, canUpdate: value});
  }

  saveRecord() {
    const value = new SafeProcessRecord();
    value.id = this.newRecord.id;
    value.projectId = this.newRecord.projectId;
    value.questionId = this.newRecord.questionId;
    value.supervisorDetail = this.newRecord.supervisorDetail;
    value.isOk = this.newRecord.isOk ? true : false;
    this.safeServiceProxy.createSafeProcessRecordsBySupervisor(value).subscribe(data => {
      this.thsAlertController.basicAlert('提示', '保存成功!', '关闭');
    }, error2 => {
      this.loadCtrl.closeLoading();
      this.thsAlertController.basicAlert('错误', error2.message, '关闭');
    })
  }
}
