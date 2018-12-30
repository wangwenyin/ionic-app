import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, PopoverController } from 'ionic-angular';
import { AppSessionService } from '../../shared/app-session.service';
import { ProcessServiceProxy, ScheduleBuildingWeekendManage } from '../../shared/service-proxies-hdApp/service-proxies-hdApp';
import { ThsAlertController } from '../../shared/alert.service';

/**
 * Generated class for the ProcessManagePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-process-manage',
  templateUrl: 'process-manage.html',
})
export class ProcessManagePage {

  needList = [];
  dealList = [];
  projectName: string;
  needParms = {};
  dealParms = {};
  tabs = 'needDeal';
  searchValue: string;
  size = 10;
  needPage = 0;
  dealPage = 0;
  constructor(public navCtrl: NavController, public navParams: NavParams,
    private processServiceProxy: ProcessServiceProxy,
    private thsAlertController: ThsAlertController,
    private popoverCtrl: PopoverController,
    private appSessionService: AppSessionService) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ProcessManagePage');
    this.projectName = this.appSessionService.projectName;
    this.needParms['projectId.equals'] = this.appSessionService.projectId;
    this.needParms['dutyUser.equals'] = this.appSessionService.logUser;
    this.needParms['actualFinishDate.specified'] = false;
    this.dealParms['projectId.equals'] = this.appSessionService.projectId;
    this.dealParms['dutyUser.equals'] = this.appSessionService.logUser;
    this.dealParms['actualFinishDate.specified'] = true;
    this.dealParms['page'] = this.dealPage;
    this.dealParms['size'] = this.size;
    this.processServiceProxy.getWeeklyPlan(this.dealParms).subscribe(data => {
      this.dealList = data.body;
    })
    // this.getDate();
  }

  ionViewWillEnter() {
    this.needParms['page'] = 0;
    this.needParms['size'] = 10;
    this.processServiceProxy.getWeeklyPlan(this.needParms).subscribe(data => {
      this.needList = data.body;
    });
  }

  getDate(isRst) {
    if (this.tabs === 'needDeal') {
      this.needParms['page'] = this.needPage;
      this.processServiceProxy.getWeeklyPlan(this.needParms).subscribe(data => {
        if (isRst) {
          this.needList = data.body;
        } else {
          data.body.forEach(item => {
            this.needList.push(item);
          })
        }
      })
    } else {
      this.dealParms['page'] = this.dealPage;
      this.processServiceProxy.getWeeklyPlan(this.dealParms).subscribe(data => {
        if (isRst) {
          this.dealList = data.body;
        } else {
          data.body.forEach(item => {
            this.dealList.push(item);
          })
        }
      })
    }
  }

  /**
   *打开任务详情
   *
   * @param {ScheduleBuildingWeekendManage} task
   * @memberof ProcessManagePage
   */
  onOpenTask(task: ScheduleBuildingWeekendManage) {
    if (task.isClosed) {
      this.thsAlertController.basicAlert('提示', '计划已关闭，不可进行填报', '关闭');
    } else {
      this.navCtrl.push('ProcessReportPage', { taskId: task.id });
    }
  }

  onSearch(event) {
    let popover = this.popoverCtrl.create("SeachPopPage", {
      searchValue: this.searchValue,
      // startDate: this.startDate ? this.startDate.format('YYYY-MM-DD') : "",
      // endDate: this.endDate ? this.endDate.format('YYYY-MM-DD') : ""
    });
    popover.present({
      ev: event
    });
    popover.onDidDismiss(data => {
      if (data) {
        this.searchValue = data.searchValue;
        this.dealParms['name.contains'] = this.searchValue;
        this.needParms['name.contains'] = this.searchValue;
        this.getDate(true);
        // console.log(this.searchValue);
        // this.page = 0;
        // this.refreshData(true);
      }
    })
  }

  // onRefresh(eveent,isUp) {
  //   if (isUp) {

  //   } else {

  //   }
  // }
  /**
   *刷新或加载
   * @param {*} infiniteScroll
   * @param {boolean} upOrDown
   * @memberof ProcessManagePage
   */
  onRefresh(infiniteScroll, upOrDown: boolean) {
    setTimeout(() => {
      if (upOrDown) {
        // this.upOrDown = true;
        if (this.tabs === 'needDeal') {
            this.needPage = 0;
        } else {
          this.dealPage = 0;
          // this.refreshData(true);
        }
        this.getDate(true);
      } else {
        if (this.tabs === 'needDeal') {
           this.needPage ++;
        } else {
          this.dealPage ++;
          // this.refreshData(true);
        }
        this.getDate(false);
        // this.upOrDown = false;
        // this.refreshData();
      }
      infiniteScroll.complete();
    }, 500);

  }

  /**
   * 进入形象进度页面
   */
  goProcessSnap() {
    this.navCtrl.push('ProcessSnapPage');
  }

  onBackPage() {
    this.navCtrl.pop();
  }
}
