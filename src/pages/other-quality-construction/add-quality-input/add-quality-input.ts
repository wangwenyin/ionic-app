import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ThsAlertController } from '../../../shared/alert.service';
import { QualityServiceProxy, QualityProcessRecord } from '../../../shared/service-proxies-hdApp/service-proxies-hdApp';
import { AppSessionService } from '../../../shared/app-session.service';

/**
 * Generated class for the AddQualityInputPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-add-quality-input',
  templateUrl: 'add-quality-input.html',
})
export class AddQualityInputPage {

  detail: string;

  projectId: string;

  questionId: string;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private thsAlertController: ThsAlertController,
    private qualityServiceProxy: QualityServiceProxy,
    private appSessionService: AppSessionService,
    ) {
      this.projectId = this.appSessionService.projectId;
      this.questionId = this.navParams.get('id');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AddQualityInputPage');
  }

  onKey(event, num) {
    event.target.value = event.target.value.substr(0, num);
  }

  onSaveRecord() {
    if (this.detail) {
      const qualityProcessRecord = new QualityProcessRecord();
      qualityProcessRecord.detail = this.detail;
      qualityProcessRecord.projectId = this.projectId;
      qualityProcessRecord.questionId = this.questionId;
      this.qualityServiceProxy.createQualityProcessRecords(qualityProcessRecord).subscribe(res => {
        // console.log(res);
        this.thsAlertController.basicAlert('提示','保存成功','确定');
        this.navCtrl.pop();
      });
    } else {
      this.thsAlertController.basicAlert('提示', '处理情况不能为空!', '确定');
    }
  }

  
}
