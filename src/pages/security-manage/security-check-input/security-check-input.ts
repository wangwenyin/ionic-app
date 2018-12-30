import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FileServiceProxy, SafeServiceProxy, SafeProcessRecord } from '../../../shared/service-proxies-hdApp/service-proxies-hdApp';
import { ThsLoadingController, ThsAlertController } from '../../../shared/alert.service';

@IonicPage()
@Component({
  selector: 'page-security-check-input',
  templateUrl: 'security-check-input.html',
})
export class SecurityCheckInputPage {

  id: string;
  isOk = true;
  detail: string;

  record = new SafeProcessRecord();

  imageList = [];

  type: number; // 1: 管监 2：工程部

  imgUrl: string;

  canUpdate = false;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private fileServiceProxy: FileServiceProxy,
    private safeServiceProxy: SafeServiceProxy,
    private loadCtrl: ThsLoadingController,
    private thsAlertController: ThsAlertController,
  ) {
    this.imgUrl = this.fileServiceProxy.fileUrls + '/file/downloadByPath?path=';
    let data = this.navParams.data;
    if (data) {
      this.id = data.id;
      this.type = data.type;
      this.canUpdate = data.canUpdate;
    }
  }

  ionViewDidLoad() {
    this.safeServiceProxy.getSafeProcessRecordById(this.id).subscribe(data => {
      this.record = data.body;
      this.getImageList();
    });
    
  }
  /**
   *提交
   *
   * @memberof SecurityCheckInputPage
   */
  onSubmit() {
    this.safeServiceProxy.createSafeProcessRecordsByEngineer(this.record).subscribe(data => {
      this.thsAlertController.basicAlert('提示', '提交成功', '确定');
      this.navCtrl.pop();
    }, error2 => {
      this.loadCtrl.closeLoading();
      this.thsAlertController.basicAlert('错误', error2.message, '关闭');
    });
  }

  /**
   * 获取整改反馈图片信息
   */
  getImageList() {
    const securityAppentFileParam = {
      'recordId.equals': this.record.id,
      'isDeleted.equals': '0',
    };
    this.safeServiceProxy.getSafeAppentFiles(securityAppentFileParam).subscribe((fileList) => {
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
