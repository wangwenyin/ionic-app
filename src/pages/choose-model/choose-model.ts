import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { ModelServiceProxy, DocumentServiceProxy, FileServiceProxy } from '../../shared/service-proxies-hdApp/service-proxies-hdApp';
import { AppSessionService } from '../../shared/app-session.service';

/**
 * Generated class for the ChooseModelPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-choose-model',
  templateUrl: 'choose-model.html',
})
export class ChooseModelPage {

  searchValue: string;
  startDate: string;
  endDate: string;
  modelList = [];
  choose: string;
  forgeModelUrl: string;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    private modelServiceProxy: ModelServiceProxy,
    private appSessionService: AppSessionService,
  ) {
    let data = this.navParams.data;
    if (data) {
      this.choose = data.modelId;
    }

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SeachPopPage');
    this.modelServiceProxy.getManageModel(this.appSessionService.projectId).subscribe(data => {
      this.modelList = data.body;
    });
  }
  onClose() {
    const index = this.modelList.findIndex(item => item.id === this.choose);
    if (index !== -1) {
      const model = this.modelList[index];
      this.viewCtrl.dismiss({
        model: model,
      })
    }

  }
  onClean() {
    this.searchValue = '';
    this.startDate = null;
    this.endDate = null;
    this.onClose();
  }

}
