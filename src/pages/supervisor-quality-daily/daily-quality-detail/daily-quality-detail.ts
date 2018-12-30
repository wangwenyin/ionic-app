import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, PopoverController } from 'ionic-angular';
import { QualityProcessRecord, FileServiceProxy, QualityServiceProxy, QualityNoKPICheck } from '../../../shared/service-proxies-hdApp/service-proxies-hdApp';
import { AppSessionService } from '../../../shared/app-session.service';
import { ThsAlertController, ThsLoadingController } from '../../../shared/alert.service';

/**
 * Generated class for the DailyQualityDetailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-daily-quality-detail',
  templateUrl: 'daily-quality-detail.html',
})
export class DailyQualityDetailPage {

  input = new QualityNoKPICheck();

  id: string;

  remark: string;

  imgUrl: string;

  newIamgeFile = [];

  imageList = [];

  processRecordList = [];

  show = false;

  newRecord: QualityProcessRecord;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private qualityServiceProxy: QualityServiceProxy,
    private loadCtrl: ThsLoadingController,
    private thsAlertController: ThsAlertController,
    private fileServiceProxy: FileServiceProxy,
    private appSessionService: AppSessionService,
    private popoverCtrl: PopoverController,
  ) {
    this.id = this.navParams.get('id');
    this.imgUrl = this.fileServiceProxy.fileUrls + '/file/downloadByPath?path=';
  }

  ionViewDidLoad() {
    this.getData();
    this.getImage();
    this.getProcessRecordsList();
    console.log('ionViewDidLoad QualityCheckDetailPage');
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
    if (this.input.state === '8') {
      value = false;
    }
    this.navCtrl.push('QualityCheckInputPage', {id: this.processRecordList[i].id ,
        type: 1, canUpdate: value});
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
}
