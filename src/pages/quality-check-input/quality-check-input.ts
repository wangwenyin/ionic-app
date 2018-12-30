import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { QualityServiceProxy, QualityProcessRecord, FileServiceProxy } from '../../shared/service-proxies-hdApp/service-proxies-hdApp';
import { ThsLoadingController, ThsAlertController } from '../../shared/alert.service';

@IonicPage()
@Component({
  selector: 'page-quality-check-input',
  templateUrl: 'quality-check-input.html',
})
export class QualityCheckInputPage {

  id: string;
  isOk = true;
  detail: string;

  record = new QualityProcessRecord();

  imageList = [];

  type: number; // 1: 管监 2：工程部

  imgUrl: string;

  canUpdate = false;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private fileServiceProxy: FileServiceProxy,
    private qualityServiceProxy: QualityServiceProxy,
    private loadCtrl: ThsLoadingController,
    private thsAlertController: ThsAlertController,
  ) {
    this.imgUrl = this.fileServiceProxy.fileUrls + '/file/downloadByPath?path=';
    let data = this.navParams.data;
    if (data) {
      this.id = data.id;
      this.type = data.type;
      this.canUpdate = data.canUpdate;
      console.log(this.type);
    }
  }

  ionViewDidLoad() {
    this.qualityServiceProxy.getQualityProcessRecordById(this.id).subscribe(data => {
      this.record = data.body;
      if (this.record.isOk === null) {
        this.record.isOk = false;
      }
      if (this.record.isPass === null) {
        this.record.isPass = false;
      }
      this.getImageList();
    });
    console.log('ionViewDidLoad QualityCheckInputPage');
  }

  ionViewDidEnter() {
    
  }
  /**
   *提交
   *
   * @memberof QualityCheckInputPage
   */
  onSubmit() {
    if (this.type === 1) {
      this.qualityServiceProxy.updateQualityProcessRecordsBySupervisor(this.record).subscribe(data => {
        this.thsAlertController.basicAlert('提示', '提交成功', '确定');
        this.navCtrl.pop();
      }, error2 => {
        this.loadCtrl.closeLoading();
        this.thsAlertController.basicAlert('错误', error2.message, '关闭');
      });
    } else if (this.type === 2) {
      this.qualityServiceProxy.updateQualityProcessRecordsByEngineer(this.record).subscribe(data => {
        this.thsAlertController.basicAlert('提示', '提交成功', '确定');
        this.navCtrl.pop();
      }, error2 => {
        this.loadCtrl.closeLoading();
        this.thsAlertController.basicAlert('错误', error2.message, '关闭');
      });
    }
    
  }
  onCanacel() {
    this.navCtrl.push('QualityCheckDetailPage', { id: this.id })
  }

  /**
   * 获取完工确认图片信息
   */
  getImageList() {
    const qualityAppentFileParam = {
      'recordId.equals': this.record.id,
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

  goBack() {
    this.navCtrl.pop();
  }

  onPrvIamge(value: any) {
    this.navCtrl.push('ImagePreviewPage', { 'imgSrc': value });
  }
}
