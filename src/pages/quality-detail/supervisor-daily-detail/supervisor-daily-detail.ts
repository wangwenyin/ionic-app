import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, PopoverController } from 'ionic-angular';
import { QualityProcessRecord, QualityServiceProxy, FileServiceProxy, QualityNoKPICheck } from '../../../shared/service-proxies-hdApp/service-proxies-hdApp';
import { ThsLoadingController, ThsAlertController } from '../../../shared/alert.service';
import { AppSessionService } from '../../../shared/app-session.service';
import { AppPermissions } from '../../../shared/app.permissions';

/**
 * Generated class for the SupervisorDailyDetailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-supervisor-daily-detail',
  templateUrl: 'supervisor-daily-detail.html',
})
export class SupervisorDailyDetailPage {
  input = new QualityNoKPICheck();

  id: string;

  remark: string;

  imgUrl: string;

  newIamgeFile = [];

  imageList = [];

  processRecordList = [];

  show = false;

  canSend = false;

  canAdd = false;

  canAbilityViewByBuilding = false;

  canAbilityViewByEngineer = false;

  canAbilityEngineer = false;

  canAbilityBuilding = false;

  constructionSend = false;

  newRecord: QualityProcessRecord;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private qualityServiceProxy: QualityServiceProxy,
    private loadCtrl: ThsLoadingController,
    private thsAlertController: ThsAlertController,
    private fileServiceProxy: FileServiceProxy,
    private appSessionService: AppSessionService,
    private popoverCtrl: PopoverController,
    private appPermissions: AppPermissions,
  ) {
    this.id = this.navParams.get('id');
    this.imgUrl = this.fileServiceProxy.fileUrls + '/file/downloadByPath?path=';
    // 是否含有工程部查看问题权限
    this.canAbilityViewByEngineer = this.appSessionService.hasGranted(this.appPermissions.GET_QUALITY_DAY_CHECKS);
    // 工程部分发人权限
    this.canAbilityEngineer = this.appSessionService.hasGranted(this.appPermissions.DAY_CHECK_ASSIGNER);
    // 是否含有施工方查看问题权限
    this.canAbilityViewByBuilding = this.appSessionService.hasGranted(this.appPermissions.GET_QUALITY_BUILDING_CHECKS);
    // 施工方分发人权限
    this.canAbilityBuilding = this.appSessionService.hasGranted(this.appPermissions.BUILDING_QUESTION_ASSIGNER);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad QualityCheckDetailPage');
    this.getProcessRecordsList();
  }

  ionViewDidEnter() {
    this.getProcessRecordsList();
  }

  getShowName(user) {
    if (user) {
      if (user.name && user.name.length > 0) {
        return user.name;
      }
    }
  }

  getData() {
    this.qualityServiceProxy.getQualityNoKPICheckById(this.id).subscribe(data => {
      this.input = data.body;
      if (this.input.state === '1' || this.input.state === '2') {
        this.canSend = true;
      }
      if (this.input.state === '3' || this.input.state === '4') {
        this.canAdd = true;
      }
      if (this.input.state === '3') {
        this.constructionSend = true;
      }
    }, error2 => {
      this.loadCtrl.closeLoading();
      this.thsAlertController.basicAlert('错误', error2.message, '关闭');
    })
  }

  getImage() {
    this.newIamgeFile = [];
    const qualityAppentFileParam = {
      'recordId.equals': this.id,
      'isDeleted.equals': '0',
    };
    this.qualityServiceProxy.getQualityAppentFile(qualityAppentFileParam).subscribe(data => {
      data.body.forEach(element => {
        const file = {
          'id': element.id,
          'recordId': element.recordId,
          'path': this.imgUrl + encodeURIComponent(element.path),
          'url': this.imgUrl + encodeURIComponent(element.minPath),
        };
        this.newIamgeFile.push(file);
      });
    });
  }

  showDetail() {
    if (this.remark) {
      this.thsAlertController.basicAlert('检查标准', this.remark, '确定');
    } else {
      this.remark = '';
      const params = {
        'subentryId.equals': this.input.subentryId,
        'isDeleted.equals': false,
        sort: ['orderNum,asc'],
      };
      this.qualityServiceProxy.queryInSubentryCheckItem(params).subscribe(data => {
        data.body.forEach(element => {
          this.remark += element.name + '&nbsp\n';
        });
        this.thsAlertController.basicAlert('检查标准', this.remark, '确定');
      });
    }
  }

  onPrvIamge(value: any) {
    this.navCtrl.push('ImagePreviewPage', { 'imgSrc': value });
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
    this.qualityServiceProxy.getQualityProcessRecords(param).subscribe(res => {
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
  getImageList(list: QualityProcessRecord[]) {
    const recordIdList = [];
    list.forEach(dto => {
      recordIdList.push(dto.id);
    });
    const qualityAppentFileParam = {
      'recordId.in': recordIdList,
      'isDeleted.equals': '0',
    };
    this.qualityServiceProxy.getQualityAppentFile(qualityAppentFileParam).subscribe((fileList) => {
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
    if (true) {
      value = this.canAbilityViewByEngineer;
    }
    this.navCtrl.push('QualityCheckInputPage', {
      id: this.processRecordList[i].id,
      type: 2, canUpdate: value
    });
  }

  checkInfo() {
    this.navCtrl.push('AppointPage', { id: this.id, type: 4 });
  }

  saveRecord() {
    const value = new QualityProcessRecord();
    value.id = this.newRecord.id;
    value.projectId = this.newRecord.projectId;
    value.questionId = this.newRecord.questionId;
    value.supervisorDetail = this.newRecord.supervisorDetail;
    value.isOk = this.newRecord.isOk ? true : false;
    this.qualityServiceProxy.updateQualityProcessRecordsBySupervisor(value).subscribe(data => {
      this.thsAlertController.basicAlert('提示', '保存成功!', '关闭');
    }, error2 => {
      this.loadCtrl.closeLoading();
      this.thsAlertController.basicAlert('错误', error2.message, '关闭');
    })
  }

  addCheck() {
    this.navCtrl.push('AddQualityInputPage', { id: this.id });
  }

  sendEmp() {
    this.navCtrl.push('AppointConstructionPage',{id: this.id, type: '3'});
  }

}
