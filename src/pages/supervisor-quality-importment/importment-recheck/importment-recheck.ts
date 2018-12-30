import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { QualityServiceProxy, FileServiceProxy, QualityHighQuestionRecheck, QualityHighQuestionInfo } from '../../../shared/service-proxies-hdApp/service-proxies-hdApp';

/**
 * Generated class for the ImportmentRecheckPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-importment-recheck',
  templateUrl: 'importment-recheck.html',
})
export class ImportmentRecheckPage {

  records = new QualityHighQuestionRecheck();

  id: string;

  newIamgeFile = [];

  imgUrl: string;

  question = new QualityHighQuestionInfo();

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private qualityServiceProxy: QualityServiceProxy,
    private fileServiceProxy: FileServiceProxy,
  ) {
    this.id = this.navParams.get('id');
    this.imgUrl = this.fileServiceProxy.fileUrls + '/file/downloadByPath?path=';
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ImportmentRecheckPage');
  }
  ionViewDidEnter() {
    this.getData();
  }

  addCheck() {
    this.navCtrl.push('AddQualityRecheckPage', { id: this.id });
  }

  getData() {
    if (this.id) {
      this.qualityServiceProxy.getQualityHighQuestionRecheckById(this.id).subscribe(data => {
        if (data.body.questionId) {
          this.qualityServiceProxy.findQualityHighQuestionById(data.body.questionId).subscribe(res => {
            this.question = res.body;
          });
        }
        if (data.body.minPathList) {
          for (let i = 0; i < data.body.minPathList.length; i++) {
            data.body.minPathList[i] = this.imgUrl + data.body.minPathList[i];
            // console.log(data.body.minPathList[i]);
          }
        }

        this.records = data.body;
      })
    }

  }

  onPrvIamge(value: any) {
    // this.isHaveShowTab = false;
    // if(this.isOpenView !== true){
    //   return;
    // }
    this.navCtrl.push('ImagePreviewPage', { 'imgSrc': value });
    //this.photoViewer.show(value, '', {share: false});
  }

}
