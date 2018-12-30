import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { NoticeServiceProxy, SysNotification } from '../../shared/service-proxies-hdApp/service-proxies-hdApp';
import { AppSessionService } from '../../shared/app-session.service';

/**
 * Generated class for the NoticePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-notice',
  templateUrl: 'notice.html',
})
export class NoticePage {

  noticeList: SysNotification[];

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public noticeService: NoticeServiceProxy,
    private appSessionService: AppSessionService) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad NoticePage');
    const param = {
      'receiverId.equals': this.appSessionService.entityId,
      'tenantId.equals': this.appSessionService.projectId
    };
    this.noticeService.querySysNotice(param).subscribe(data => {
      this.noticeList = data.body;
    });
  }

  goDetail() {
    this.navCtrl.push('NoticeDetailPage');
  }

  goBack() {
    // this.navCtrl.push('TenantManagePage');
    this.navCtrl.push('MenuOptionPage');
  }

  /**
   * 点击未读的消息时将其状态改为已读
   * @param notice
   */
  noticeItemClick(notice: SysNotification) {
    console.log(notice);
    if (notice.isRead === false) {
      this.noticeService.readSysNotice(notice.id).subscribe((res: any) => {});
      notice.isRead = true;
    }
  }
}
