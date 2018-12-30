import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, PopoverController } from 'ionic-angular';
import { AppSessionService } from '../../shared/app-session.service';
import { QualityServiceProxy, FileServiceProxy, EmployeeServiceProxy } from '../../shared/service-proxies-hdApp/service-proxies-hdApp';
import { AppPermissions } from '../../shared/app.permissions';

/**
 * Generated class for the QualityPatrolManagePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-quality-patrol-manage',
  templateUrl: 'quality-patrol-manage.html',
})
export class QualityPatrolManagePage {
  // 设置默认选中页面
  public qualityPatrol: string = 'my';

  public tabs: string = 'deal';

  // 是否含有工程部查看问题权限
  canAbilityViewByEngineer = false;
  // 是否含有施工方查看问题权限
  canAbilityViewByBuilding = false;
  // 工程部分发人权限
  canAbilityEngineer = false;
  // 施工方分发人权限
  canAbilityBuilding = false;

  checkIdList = [];

  needCount: number;

  myDealCount: number;

  myCheckCount: number;

  myCloseCount: number;

  allDealCount: number;

  allCheckCount: number;

  allCloseCount: number;

  size = 8;

  // allParams = { page: 0, size: 8, sort: 'creationTime,desc' };

  myDealParams = { page: 0, size: 8, sort: 'creationTime,desc' };

  myCheckParams = { page: 0, size: 8, sort: 'creationTime,desc' };

  myCloseParams = { page: 0, size: 8, sort: 'creationTime,desc' };

  allDealParams = { page: 0, size: 8, sort: 'creationTime,desc' };

  allCheckParams = { page: 0, size: 8, sort: 'creationTime,desc' };

  allCloseParams = { page: 0, size: 8, sort: 'creationTime,desc' };


  projectName: string;

  needList = [];

  dealList = [];

  checkList = [];

  closeList = [];

  allDealList = [];

  allCheckList = [];

  allCloseList = [];

  questionList = [];

  all = [];

  allNeedList = [];

  dealCount: number;

  checkCount: number;

  imgUrl: string;

  infiniteScrollEnabled = true;

  nowProjectEmp: any;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private appSessionService: AppSessionService,
    private qualityServiceProxy: QualityServiceProxy,
    private popoverCtrl: PopoverController,
    private fileServiceProxy: FileServiceProxy,
    private appPermissions: AppPermissions,
    private employeeServiceProxy: EmployeeServiceProxy,
  ) {
    this.projectName = this.appSessionService.projectName;
    this.imgUrl = this.fileServiceProxy.fileUrls + '/file/downloadByPath?path=';
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad QualityManagePage');
    this.hasPromiss();
    // this.initData();
  }

  ionViewDidEnter() {
    if (!this.canAbilityViewByEngineer && this.canAbilityViewByBuilding) {
      this.getProjectEmp();
    } else {
      this.initParams();
      this.getQualityData();
    }
  }

  hasPromiss() {
    // 是否含有工程部查看问题权限
    this.canAbilityViewByEngineer = this.appSessionService.hasGranted(this.appPermissions.GET_QUALITY_DAY_CHECKS);
    // 是否含有施工方查看问题权限
    this.canAbilityViewByBuilding = this.appSessionService.hasGranted(this.appPermissions.GET_QUALITY_BUILDING_CHECKS);
    // 工程部分发人权限
    this.canAbilityEngineer = this.appSessionService.hasGranted(this.appPermissions.DAY_CHECK_ASSIGNER);
    // 施工方分发人权限
    this.canAbilityBuilding = this.appSessionService.hasGranted(this.appPermissions.BUILDING_QUESTION_ASSIGNER);
  }

  getProjectEmp() {
    this.employeeServiceProxy.getEmployeeInProject({
      'empId.equals': this.appSessionService.entityId,
      'projectId.equals': this.appSessionService.projectId,
      'isDeleted.equals': '0'
    }).subscribe(data => {
      if (data.body.length > 0) {
        this.nowProjectEmp = data.body[0];
        this.initParams();
        this.getQualityData();
      }
    });
  }

  goBack() {
    this.navCtrl.push('MenuOptionPage');
  }

  //离开页面的时候，设置显示下面的tabbar
  // ionViewWillLeave() {
  //   var tabs = document.getElementsByClassName('tabbar').item(0);
  //   tabs['style'].display = 'flex';
  // }

  onSearch(event) {
    let popover = this.popoverCtrl.create("SeachPopPage", {
      // searchValue: this.searchValue,
    });
    popover.present({
      ev: event
    });
    popover.onDidDismiss(data => {
      if (data) {
        // this.searchValue = data.searchValue;
        // this.page = 0;
        // this.refreshData(true);
      }
    })
  }

  addQuality() {
    this.navCtrl.push('AddQualityPatrolPage');
  }

  // onShowDetail(item) {
  //   this.navCtrl.push('QualityPatrolDetailPage', { id: item.id });
  // }

  onShowDetail(item) {
    if (item.questionId === '1') {
      this.navCtrl.push('EngineerQualityDetailPage', { id: item.id });
    } else if (item.questionId === '2') {
      this.navCtrl.push('SupervisorCheckDetailPage', { id: item.id });
    } else if (item.questionId === '3') {
      this.navCtrl.push('SupervisorDailyDetailPage', { id: item.id });
    } else if (item.questionId === '4') {
      this.navCtrl.push('SupervisorImportmentDetailPage', { id: item.id });
    }
  }

  goModel() {
    this.navCtrl.push('QualityModelPage', { page: 'DailyQualityManagePage' });
  }

  loadDate(infiniteScroll, isRest) {
    return new Promise((resolve) => {
      if (this.qualityPatrol === 'my') {
        if (this.tabs === 'deal') {
          if (isRest) {
            this.myDealParams.page = 0;
            this.dealList = [];
          } else {
            this.myDealParams.page += 1;
          }
          this.qualityServiceProxy.getQualityAllQuestion(this.myDealParams).subscribe(data => {
            this.dealCount = parseInt(data.headers.get('X-Total-Count'));
            data.body.forEach(item => {
              if (!item['firstImagePath']) {
                item['firstImagePath'] = 'assets/images/one.jpg';
              } else {
                item['firstImagePath'] = this.imgUrl + item['firstImagePath'];
              }
              this.dealList.push(item);
            });
            if (this.dealCount === this.dealList.length) {
              this.infiniteScrollEnabled = false;
            }
          });

        } else if (this.tabs === 'recheck') {
          if (isRest) {
            this.myCheckParams.page = 0;
            this.checkList = [];
          } else {
            this.myCheckParams.page += 1;
          }
          this.qualityServiceProxy.getQualityAllQuestion(this.myCheckParams).subscribe(data => {
            this.dealCount = parseInt(data.headers.get('X-Total-Count'));
            data.body.forEach(item => {
              if (!item['firstImagePath']) {
                item['firstImagePath'] = 'assets/images/one.jpg';
              } else {
                item['firstImagePath'] = this.imgUrl + item['firstImagePath'];
              }
              this.checkList.push(item);
            });
            if (this.checkCount === this.checkList.length) {
              this.infiniteScrollEnabled = false;
            }
          });
        } else if (this.tabs === 'close') {
          if (isRest) {
            this.myCloseParams.page = 0;
            this.closeList = [];
          } else {
            this.myCloseParams.page += 1;
          }
          this.qualityServiceProxy.getQualityAllQuestion(this.myCloseParams).subscribe(data => {
            this.myCloseCount = parseInt(data.headers.get('X-Total-Count'));
            data.body.forEach(item => {
              if (!item['firstImagePath']) {
                item['firstImagePath'] = 'assets/images/one.jpg';
              } else {
                item['firstImagePath'] = this.imgUrl + item['firstImagePath'];
              }
              this.closeList.push(item);
            });
            if (this.myCloseCount === this.closeList.length) {
              this.infiniteScrollEnabled = false;
            }
          });
        }
      } else if (this.qualityPatrol === 'all') {
        if (this.tabs === 'deal') {
          if (isRest) {
            this.allDealParams.page = 0;
            this.allDealList = [];
          } else {
            this.allDealParams.page += 1;
          }
          this.qualityServiceProxy.getQualityAllQuestion(this.allDealParams).subscribe(data => {
            this.dealCount = parseInt(data.headers.get('X-Total-Count'));
            data.body.forEach(item => {
              if (!item['firstImagePath']) {
                item['firstImagePath'] = 'assets/images/one.jpg';
              } else {
                item['firstImagePath'] = this.imgUrl + item['firstImagePath'];
              }
              this.allDealList.push(item);
            });
            if (this.allDealCount === this.allDealList.length) {
              this.infiniteScrollEnabled = false;
            }
          });

        } else if (this.tabs === 'recheck') {
          if (isRest) {
            this.allCheckParams.page = 0;
            this.allCheckList = [];
          } else {
            this.allCheckParams.page += 1;
          }
          this.qualityServiceProxy.getQualityAllQuestion(this.allCheckParams).subscribe(data => {
            this.allCheckCount = parseInt(data.headers.get('X-Total-Count'));
            data.body.forEach(item => {
              if (!item['firstImagePath']) {
                item['firstImagePath'] = 'assets/images/one.jpg';
              } else {
                item['firstImagePath'] = this.imgUrl + item['firstImagePath'];
              }
              this.allCheckList.push(item);
            });
            if (this.allCheckCount === this.allCheckList.length) {
              this.infiniteScrollEnabled = false;
            }
          });
        } else if (this.tabs === 'close') {
          if (isRest) {
            this.allCloseParams.page = 0;
            this.allCloseList = [];
          } else {
            this.allCloseParams.page += 1;
          }
          this.qualityServiceProxy.getQualityAllQuestion(this.allCloseParams).subscribe(data => {
            this.allCloseCount = parseInt(data.headers.get('X-Total-Count'));
            data.body.forEach(item => {
              if (!item['firstImagePath']) {
                item['firstImagePath'] = 'assets/images/one.jpg';
              } else {
                item['firstImagePath'] = this.imgUrl + item['firstImagePath'];
              }
              this.allCloseList.push(item);
            });
            if (this.allCloseCount === this.allCloseList.length) {
              this.infiniteScrollEnabled = false;
            }
          });
        }
      }
      infiniteScroll.complete();
      resolve();
    })
  }

  getQualityData() {
    this.qualityServiceProxy.getQualityAllQuestion(this.myDealParams).subscribe(data => {
      console.log(this.myDealParams);
      console.log(data.body);
      data.body.forEach(item => {
        if (!item['firstImagePath']) {
          item['firstImagePath'] = 'assets/images/one.jpg';
        } else {
          item['firstImagePath'] = this.imgUrl + item['firstImagePath'];
        }
      });
      this.dealList = data.body;
      this.dealCount = parseInt(data.headers.get('X-Total-Count'));
    });
    this.qualityServiceProxy.getQualityAllQuestion(this.myCheckParams).subscribe(data => {
      data.body.forEach(item => {
        if (!item['firstImagePath']) {
          item['firstImagePath'] = 'assets/images/one.jpg';
        } else {
          item['firstImagePath'] = this.imgUrl + item['firstImagePath'];
        }
      });
      this.checkList = data.body;
      this.checkCount = parseInt(data.headers.get('X-Total-Count'));
    });
    this.qualityServiceProxy.getQualityAllQuestion(this.myCloseParams).subscribe(data => {
      data.body.forEach(item => {
        if (!item['firstImagePath']) {
          item['firstImagePath'] = 'assets/images/one.jpg';
        } else {
          item['firstImagePath'] = this.imgUrl + item['firstImagePath'];
        }
      });
      this.closeList = data.body;
      this.myCloseCount = parseInt(data.headers.get('X-Total-Count'));
    });
    this.qualityServiceProxy.getQualityAllQuestion(this.allDealParams).subscribe(data => {
      data.body.forEach(item => {
        if (!item['firstImagePath']) {
          item['firstImagePath'] = 'assets/images/one.jpg';
        } else {
          item['firstImagePath'] = this.imgUrl + item['firstImagePath'];
        }
      });
      this.allDealList = data.body;
      this.allDealCount = parseInt(data.headers.get('X-Total-Count'));
    });
    this.qualityServiceProxy.getQualityAllQuestion(this.allCheckParams).subscribe(data => {
      data.body.forEach(item => {
        if (!item['firstImagePath']) {
          item['firstImagePath'] = 'assets/images/one.jpg';
        } else {
          item['firstImagePath'] = this.imgUrl + item['firstImagePath'];
        }
      });
      this.allCheckList = data.body;
      this.allCheckCount = parseInt(data.headers.get('X-Total-Count'));
    });
    this.qualityServiceProxy.getQualityAllQuestion(this.allCloseParams).subscribe(data => {
      data.body.forEach(item => {
        if (!item['firstImagePath']) {
          item['firstImagePath'] = 'assets/images/one.jpg';
        } else {
          item['firstImagePath'] = this.imgUrl + item['firstImagePath'];
        }
      });
      this.allCloseList = data.body;
      this.allCloseCount = parseInt(data.headers.get('X-Total-Count'));
    });
  }



  /**
   *下拉刷新
   * @param {*} event
   * @memberof QualityManagePage
   */
  doRefresh(refresher) {
    this.infiniteScrollEnabled = true;
    this.loadDate(refresher, true);
    // console.log(event);
    // if (this.tabs === 'need') {

    // } else if (this.tabs === 'recheck') {

    // } else if (this.tabs === 'close') {

    // } else if (this.tabs === 'ok') {
    //    if(this.okCount === this.okList.length) {
    //     this.infiniteScrollEnabled = false;
    //    }
    // } else if (this.tabs === 'all') {
    //   if(this.allCount === this.all.length) {
    //     this.infiniteScrollEnabled = false;
    //    }
    // }
    // refresher.complete();
  }

  segmentChanged(event) {
    this.infiniteScrollEnabled = true;
    if (this.qualityPatrol === 'my') {
      if (this.tabs === 'need') {

      } else if (this.tabs === 'recheck') {
        console.log(this.checkList);
        if (this.checkCount === this.checkList.length) {
          this.infiniteScrollEnabled = false;
        }
      } else if (this.tabs === 'close') {
        console.log(this.closeList);
        if (this.myCloseCount === this.closeList.length) {
          this.infiniteScrollEnabled = false;
        }
      } else if (this.tabs === 'deal') {
        console.log(this.dealList);
        if (this.dealCount === this.dealList.length) {
          this.infiniteScrollEnabled = false;
        }
      }
    } else if (this.qualityPatrol === 'all') {
      if (this.tabs === 'need') {

      } else if (this.tabs === 'recheck') {
        console.log(this.allCheckList);
        if (this.allCheckCount === this.allCheckList.length) {
          this.infiniteScrollEnabled = false;
        }
      } else if (this.tabs === 'close') {
        console.log(this.allCloseList);
        if (this.allCloseCount === this.allCloseList.length) {
          this.infiniteScrollEnabled = false;
        }
      } else if (this.tabs === 'deal') {
        console.log(this.allDealList);
        if (this.allDealCount === this.allDealList.length) {
          this.infiniteScrollEnabled = false;
        }
      }
    }

  }

  initParams() {
    if (this.appSessionService.projectId) {
      this.myDealParams['projectId.equals'] = this.appSessionService.projectId;
      this.myCheckParams['projectId.equals'] = this.appSessionService.projectId;
      this.myCloseParams['projectId.equals'] = this.appSessionService.projectId;
      this.allDealParams['projectId.equals'] = this.appSessionService.projectId;
      this.allCheckParams['projectId.equals'] = this.appSessionService.projectId;
      this.allCloseParams['projectId.equals'] = this.appSessionService.projectId;
    }
    if (this.appSessionService.entityId) {
      this.myDealParams['creatorUserId.equals'] = this.appSessionService.entityId;
      this.myCheckParams['creatorUserId.equals'] = this.appSessionService.entityId;
      this.myCloseParams['creatorUserId.equals'] = this.appSessionService.entityId;
    }
    this.myDealParams['isPass.equals'] = false;
    this.myCheckParams['isPass.equals'] = false;
    this.myCloseParams['isPass.equals'] = false;
    this.allDealParams['isPass.equals'] = false;
    this.allCheckParams['isPass.equals'] = false;
    this.allCloseParams['isPass.equals'] = false;
    if (this.canAbilityViewByEngineer && this.canAbilityViewByBuilding) {
      this.myDealParams['state.in'] = ['1', '2', '3', '4', '5'];
      this.myCheckParams['state.in'] = ['6', '7'];
      this.myCloseParams['state.in'] = ['8'];
      this.allDealParams['state.in'] = ['1', '2', '3', '4', '5'];
      this.allCheckParams['state.in'] = ['6', '7'];
      this.allCloseParams['state.in'] = ['8'];
    }
    if (this.canAbilityViewByEngineer && !this.canAbilityViewByBuilding) {
      this.myDealParams['state.in'] = ['1', '2', '3', '4', '5'];
      this.myCheckParams['state.in'] = ['6', '7'];
      this.myCloseParams['state.in'] = ['8'];
      this.allDealParams['state.in'] = ['1', '2', '3', '4', '5'];
      this.allCheckParams['state.in'] = ['6', '7'];
      this.allCloseParams['state.in'] = ['8'];
      // this.myDealParams['state.in'] = ['1', '2', '3', '4', '5', '6', '7', '8'];
      if (!this.canAbilityEngineer) {
        this.myDealParams['creatorUserId.equals'] = this.appSessionService.entityId;
        this.myCheckParams['creatorUserId.equals'] = this.appSessionService.entityId;
        this.myCloseParams['creatorUserId.equals'] = this.appSessionService.entityId;
        this.allDealParams['recheckEngineerId.equals'] = this.appSessionService.entityId;
        this.allDealParams['creatorUserId.equals'] = this.appSessionService.entityId;
        this.allCheckParams['recheckEngineerId.equals'] = this.appSessionService.entityId;
        this.allCheckParams['creatorUserId.equals'] = this.appSessionService.entityId;
        this.allCloseParams['recheckEngineerId.equals'] = this.appSessionService.entityId;
        this.allCloseParams['creatorUserId.equals'] = this.appSessionService.entityId;

      }
    }
    if (!this.canAbilityViewByEngineer && this.canAbilityViewByBuilding) {
      this.myDealParams['sendOrganization.equals'] = this.nowProjectEmp.unitId;
      this.myDealParams['state.in'] = ['3', '4'];
      this.myCheckParams['sendOrganization.equals'] = this.nowProjectEmp.unitId;
      this.myCheckParams['state.in'] = ['5'];
      this.myCloseParams['sendOrganization.equals'] = this.nowProjectEmp.unitId;
      this.myCloseParams['state.in'] = ['8'];
      this.allDealParams['sendOrganization.equals'] = this.nowProjectEmp.unitId;
      this.allDealParams['state.in'] = ['3', '4'];
      this.allCheckParams['sendOrganization.equals'] = this.nowProjectEmp.unitId;
      this.allCheckParams['state.in'] = ['5'];
      this.allCloseParams['sendOrganization.equals'] = this.nowProjectEmp.unitId;
      this.allCloseParams['state.in'] = ['8'];
      if (!this.canAbilityBuilding) {
        this.myDealParams['buildingModifier.equals'] = this.appSessionService.entityId;
        this.myCheckParams['buildingModifier.equals'] = this.appSessionService.entityId;
        this.myCloseParams['buildingModifier.equals'] = this.appSessionService.entityId;
        this.allDealParams['buildingModifier.equals'] = this.appSessionService.entityId;
        this.allCheckParams['buildingModifier.equals'] = this.appSessionService.entityId;
        this.allCloseParams['buildingModifier.equals'] = this.appSessionService.entityId;
      }
      // if (this.canAbilityViewByEngineer && this.canAbilityViewByBuilding) {
      //   param['state.in'] = ['1', '2', '3', '4', '5', '6', '7', '8'];
      // }
    }
    this.myDealParams['questionType.in'] = ['1', '2', '3', '4'];
    this.myCheckParams['questionType.in'] = ['1', '2', '3', '4'];
    this.myCloseParams['questionType.in'] = ['1', '2', '3', '4'];
    this.allDealParams['questionType.in'] = ['1', '2', '3', '4'];
    this.allCheckParams['questionType.in'] = ['1', '2', '3', '4'];
    this.allCloseParams['questionType.in'] = ['1', '2', '3', '4'];
  }

}
