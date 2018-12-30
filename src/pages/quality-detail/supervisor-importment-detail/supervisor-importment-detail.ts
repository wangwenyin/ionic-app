import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, PopoverController } from 'ionic-angular';
import { QualityProcessRecord, QualityServiceProxy, FileServiceProxy, QualityHighQuestionInfo } from '../../../shared/service-proxies-hdApp/service-proxies-hdApp';
import { AppSessionService } from '../../../shared/app-session.service';
import { ThsAlertController, ThsLoadingController } from '../../../shared/alert.service';
import { AppPermissions } from '../../../shared/app.permissions';

/**
 * Generated class for the SupervisorImportmentDetailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-supervisor-importment-detail',
  templateUrl: 'supervisor-importment-detail.html',
})
export class SupervisorImportmentDetailPage {

  record = new QualityHighQuestionInfo();

  id: string;

  newIamgeFile = [];

  imgUrl: string;

  imageList = [];

  show = false;
  // 是否可以分发人
  canSend = false;
  // 施工单位是否可以分发
  constructionSend = false;
  // 是否能新增整改反馈
  canAdd = false;
  //是否施工单位
  canAbilityViewByBuilding = false;

  processRecordList = [];

  newRecord: QualityProcessRecord;

  canAbilityViewByEngineer = false;

  // 工程部分发人权限
  canAbilityEngineer = false;

  canAbilityBuilding = false;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private qualityServiceProxy: QualityServiceProxy,
    private fileServiceProxy: FileServiceProxy,
    private appSessionService: AppSessionService,
    private popoverCtrl: PopoverController,
    private thsAlertController: ThsAlertController,
    private loadCtrl: ThsLoadingController,
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
    this.getData();
    // this.getProcessRecordsList();
    console.log('ionViewDidLoad ImportantQualityPage');
    // var tabs = document.getElementsByClassName('tabbar').item(0);
    // tabs['style'].display = 'none';
  }

  ionViewDidEnter() {
    this.getProcessRecordsList();
  }

  //离开页面的时候，设置显示下面的tabbar
  // ionViewWillLeave() {
  //   var tabs = document.getElementsByClassName('tabbar').item(0);
  //   tabs['style'].display = 'flex';
  // }

  getShowName(user: any) {
  }

  checkInfo() {
    this.navCtrl.push('AppointPage', { id: this.id, type: 3 });
  }

  getData() {
    if (this.id) {
      this.qualityServiceProxy.findQualityHighQuestionById(this.id).subscribe(data => {
        this.record = data.body;
        if (this.record.state === '1' || this.record.state === '2') {
          this.canSend = true;
        }
        if (this.record.state === '3' || this.record.state === '4') {
          this.canAdd = true;
        }
        if (this.record.state === '3') {
          this.constructionSend = true;
        }
      });
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
        console.log(this.newIamgeFile);
      });
    }
  }

  onPrvIamge(value: any) {
    if (value)
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
      console.log(res.body);
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
    if (value) {
      value = this.canAbilityViewByEngineer;
    }
    this.navCtrl.push('QualityCheckInputPage', {
      id: this.processRecordList[i].id,
      type: 2, canUpdate: value
    });
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

  sendEmp() {
    this.navCtrl.push('AppointConstructionPage',{id: this.id, type: '4'});
  }

  addCheck() {
    this.navCtrl.push('AddQualityInputPage', { id: this.id });
  }

}
