import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, PopoverController } from 'ionic-angular';
import { QualityServiceProxy, QualityHighQuestionInfo, FileServiceProxy, QualityProcessRecord } from '../../../shared/service-proxies-hdApp/service-proxies-hdApp';
import { AppSessionService } from '../../../shared/app-session.service';
import { ThsAlertController, ThsLoadingController } from '../../../shared/alert.service';

/**
 * Generated class for the ImportmentQulityDetailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-importment-qulity-detail',
  templateUrl: 'importment-qulity-detail.html',
})
export class ImportmentQulityDetailPage {

  record = new QualityHighQuestionInfo();

  id: string;

  newIamgeFile = [];

  imgUrl: string;

  imageList = [];

  show = false;

  processRecordList = [];

  newRecord: QualityProcessRecord;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private qualityServiceProxy: QualityServiceProxy,
    private fileServiceProxy: FileServiceProxy,
    private appSessionService: AppSessionService,
    private popoverCtrl: PopoverController,
    private thsAlertController: ThsAlertController,
    private loadCtrl: ThsLoadingController,
  ) {
    this.id = this.navParams.get('id');
    this.imgUrl = this.fileServiceProxy.fileUrls + '/file/downloadByPath?path=';
  }

  ionViewDidLoad() {
    this.getData();
    this.getProcessRecordsList();
    console.log('ionViewDidLoad ImportantQualityPage');
    // var tabs = document.getElementsByClassName('tabbar').item(0);
    // tabs['style'].display = 'none';
  }

  //离开页面的时候，设置显示下面的tabbar
  // ionViewWillLeave() {
  //   var tabs = document.getElementsByClassName('tabbar').item(0);
  //   tabs['style'].display = 'flex';
  // }

  getShowName(user: any) {
  }

  checkInfo() {
    // this.navCtrl.push('ImportmentRecheckPage', {id: this.id}); 
    this.navCtrl.push('RecheckListPage', { id: this.id });
  }

  getData() {
    if (this.id) {
      this.qualityServiceProxy.findQualityHighQuestionById(this.id).subscribe(data => {
        this.record = data.body;
        const deal = ['1', '2', '3', '4', '5'];
        const check = ['6', '7'];
        if (deal.indexOf(this.record.state) !== -1) {
          this.record['stateName'] = '待整改'
        } else if (check.indexOf(this.record.state) !== -1) {
          this.record['stateName'] = '待复检'
        } else if (this.record.state === '8') {
          this.record['stateName'] = '已关闭'
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
        // console.log(this.newIamgeFile);
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

  showInput(value, i) {
    if (this.record.state === '8') {
      value = false;
    }
    this.navCtrl.push('QualityCheckInputPage', {
      id: this.processRecordList[i].id,
      type: 1, canUpdate: value
    });
  }

}
