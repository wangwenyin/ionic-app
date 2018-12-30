import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, Item } from 'ionic-angular';
import { AppSessionService } from '../../../shared/app-session.service';
import { SafeServiceProxy, EmployeeServiceProxy, FileServiceProxy } from '../../../shared/service-proxies-hdApp/service-proxies-hdApp';
import { AppPermissions } from '../../../shared/app.permissions';

// this.aclServe.canAbility(this.appPermissions.SAFE_SHOW_DAY_CKECKS_OUTSIDE)判断当前用户是否是施工单位用户
// this.aclServe.canAbility(this.appPermissions.SHOE_SAFE_KPI_CHECK)判断当前用户是否是管监单位用户
// this.aclServe.canAbility(this.appPermissions.SAFE_SHOW_DAY_CKECKS)判断当前用户是否是工程部用户
// this.aclServe.canAbility(this.appPermissions.SAFE_SEND_PERSON)判断当前用户是否是问题分发人

// 问题
// 1. 新增安全巡检页的是否合格应该是readonly且为true（新增整改）；保存按钮不明显，且需点击确定后跳转至列表页
// 2. 列表页是每个tab下都要‘新增按钮’？
// 3. 分发人是？属于施工方？能看到所有问题？
@IonicPage()
@Component({
  selector: 'page-security-manage-dality',
  templateUrl: 'security-manage-dality.html',
})
export class SecurityManageDalityPage {

  // 设置默认选中页面
  public securityManage: string = 'my';
  public tabs: string = 'deal';

  projectName: string;

  dealList = [];
  checkList = [];
  closeList = [];

  allDealList = [];
  allCheckList = [];
  allCloseList = [];

  infiniteScrollEnabled = true;
  dealCount: number;
  checkCount: number;
  closeCount: number;
  allDealCount: number;
  allCheckCount: number;
  allCloseCount: number;
  imgUrl: string;

  dealParams = { page: 0, size: 8, sort: 'creationTime,desc' };
  checkParams = { page: 0, size: 8, sort: 'creationTime,desc' };
  closeParams = { page: 0, size: 8, sort: 'creationTime,desc' };
  allDealParams = { page: 1, size: 8 };
  allCheckParams = { page: 1, size: 8 };
  allCloseParams = { page: 1, size: 8 };

  // 施工方查看问题权限(施工方只能看到所有问题中的部分)
  canViewByBuilding = false;
  // 工程部查看问题权限(工程部能看到所有问题中的全部)
  canViewByEngineer = false;
  canSend = false;
  nowProjectEmp: any;

  appSession = {
    projectId: '',
    entityId: ''
  };

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private appSessionService: AppSessionService,
    private safeServiceProxy: SafeServiceProxy,
    private appPermissions: AppPermissions,
    private employeeServiceProxy: EmployeeServiceProxy,
    private fileServiceProxy: FileServiceProxy,
    ) {
    this.projectName = this.appSessionService.projectName;
    this.imgUrl = this.fileServiceProxy.fileUrls + '/file/downloadByPath?path=';
    this.canViewByBuilding = this.appSessionService.hasGranted(this.appPermissions.SAFE_SHOW_DAY_CKECKS_OUTSIDE);
    this.canViewByEngineer = this.appSessionService.hasGranted(this.appPermissions.SAFE_SHOW_DAY_CKECKS);
    this.canSend = this.appSessionService.hasGranted(this.appPermissions.SAFE_SEND_PERSON);
    this.appSession = JSON.parse(sessionStorage.getItem('appSession'))
    console.log('------')
    console.log(this.canViewByBuilding)
    console.log(this.canViewByEngineer)
    console.log(this.canSend)
  }

  ionViewDidLoad() {
    if (this.canViewByBuilding && !this.canViewByEngineer) {
      this.getProjectEmp();
    } else {
      this.initParams();
      this.getData();
    }

    const names = [
      {name: 'allDealList', word: '整改的'},
      {name: 'allCheckList', word: '复检的'},
      {name: 'allCloseList', word: '关闭的'},
      {name: 'checkList', word: '复检'},
      {name: 'closeList', word: '关闭'},
    ]
    names.forEach((item, index) => {
      if (index < 3) {
        for (let i = 0; i < 5; i++) {
          this[item.name].push({ id: 1, name: `第${(i+1)}个待${item.word}问题`, date: new Date(), creater: '张' + (i+1) })
        }
      } else {
        for (let i = 0; i < 2; i++) {
          this[item.name].push({ id: 1, name: `第${(i+1)}个待${item.word}问题`, date: new Date(), creater: '张' + i })
        }
      }
    })
  }

  onBackPage() {
    this.navCtrl.push('MenuOptionPage');
  }
  /**
   * 添加新的安全问题
   */
  onAdd(){
    this.navCtrl.push('SecurityDalityAddPage', {isFromList: true});
  }

  onShowDetail(item){
    this.navCtrl.push('SecurityDalityEditPage', {id: item.id});
  }

  goModel() {
    this.navCtrl.push('SecurityManageModelPage',{page: 'SecurityManageDalityPage'});
  }

  // 获取项目人员信息
  getProjectEmp() {
    this.employeeServiceProxy.getEmployeeInProject({
      'empId.equals': this.appSessionService.entityId,
      'projectId.equals': this.appSessionService.projectId,
      'isDeleted.equals': '0'
    }).subscribe(res => {
      if (res.body.length) {
        console.log(res.body)
        this.nowProjectEmp = res.body[0];
        this.initParams();
        this.getData();
      }
    });
  }

  getData() {
    this.safeServiceProxy.getDailySafe(this.dealParams).subscribe(data => {
      this.getImgUrl(data.body)
      this.dealCount = parseInt(data.headers.get('X-Total-Count'));
      this.dealList = data.body;
      console.log(this.dealList);
    });
    this.safeServiceProxy.getDailySafe(this.checkParams).subscribe(data => {
      this.getImgUrl(data.body)
      this.checkCount = parseInt(data.headers.get('X-Total-Count'));
      this.checkList = data.body;
      console.log(this.checkList);
    });
    this.safeServiceProxy.getDailySafe(this.closeParams).subscribe(data => {
      this.getImgUrl(data.body)
      this.closeCount = parseInt(data.headers.get('X-Total-Count'));
      this.closeList = data.body;
      console.log(this.closeList);
    });
    this.safeServiceProxy.getAllSecurityQuestion(this.allDealParams).subscribe(data => {
      this.getImgUrl(data.body)
      this.allDealCount = parseInt(data.headers.get('X-Total-Count'));
      this.allDealList = data.body;
      console.log(this.allDealList);
    });
    this.safeServiceProxy.getAllSecurityQuestion(this.allCheckParams).subscribe(data => {
      this.getImgUrl(data.body)
      this.allCheckCount = parseInt(data.headers.get('X-Total-Count'));
      this.allCheckList = data.body;
      console.log(this.allCheckList);
    });
    this.safeServiceProxy.getAllSecurityQuestion(this.allCloseParams).subscribe(data => {
      this.getImgUrl(data.body)
      this.allCloseCount = parseInt(data.headers.get('X-Total-Count'));
      this.allCloseList = data.body;
      console.log(this.allCloseList);
    });
  }

  getImgUrl(dataList) {
    dataList.forEach(item => {
      if (!item['firstImagePath']) {
        item['firstImagePath'] = 'assets/images/one.jpg';
      } else {
        item['firstImagePath'] = this.imgUrl + item['firstImagePath'];
      }
    });
  }

  firstSegmentChanged() {
    this.tabs = 'deal'
    this.segmentChanged()
  }

  segmentChanged() {
    this.infiniteScrollEnabled = true;
    if (this.tabs === 'need') {

    } else if (this.tabs === 'recheck') {
      if (this.checkCount === this.checkList.length || this.allCheckCount === this.allCheckList.length) {
        this.infiniteScrollEnabled = false;
      }
    } else if (this.tabs === 'close') {
      if (this.closeCount === this.closeList.length || this.allCloseCount === this.allCloseList.length) {
        this.infiniteScrollEnabled = false;
      }
    }  else if (this.tabs === 'deal') {
      if (this.dealCount === this.dealList.length || this.allDealCount === this.allDealList.length) {
        this.infiniteScrollEnabled = false;
      }
    }
  }

  doRefresh(refresher) {
    this.infiniteScrollEnabled = true;
    this.loadData(refresher, true);
  }

  loadData(infiniteScroll, isRest) {
    return new Promise((resolve) => {
      console.log(this.tabs);
      if (this.securityManage === 'my') {
        if (this.tabs === 'deal') {
          if (isRest) {
            this.dealParams.page = 0;
            this.dealList = [];
          } else {
            this.dealParams.page += 1;
          }
          this.safeServiceProxy.getDailySafe(this.dealParams).subscribe(data => {
            this.dealCount = parseInt(data.headers.get('X-Total-Count'));
            data.body.forEach(item => {
              if (!item['minPath']) {
                item['minPath'] = 'assets/images/one.jpg';
              } else {
                item['minPath'] = this.imgUrl + item['minPath'];
              }
              this.dealList.push(item);
            });
            console.log(this.dealList);
            if (this.dealCount === this.dealList.length) {
              this.infiniteScrollEnabled = false;
            }
          });
        } else if (this.tabs === 'recheck') {
          if (isRest) {
            this.checkParams.page = 0;
            this.checkList = [];
          } else {
            this.checkParams.page += 1;
          }
          this.safeServiceProxy.getDailySafe(this.checkParams).subscribe(data => {
            this.checkCount = parseInt(data.headers.get('X-Total-Count'));
            data.body.forEach(item => {
              if (!item['minPath']) {
                item['minPath'] = 'assets/images/one.jpg';
              } else {
                item['minPath'] = this.imgUrl + item['minPath'];
              }
              this.checkList.push(item);
            });
            console.log(this.checkList)
            if (this.checkCount === this.checkList.length) {
              this.infiniteScrollEnabled = false;
            }
          });
        } else if (this.tabs === 'close') {
          if (isRest) {
            this.closeParams.page = 0;
            this.closeList = [];
          } else {
            this.closeParams.page += 1;
          }
          this.safeServiceProxy.getDailySafe(this.closeParams).subscribe(data => {
            this.closeCount = parseInt(data.headers.get('X-Total-Count'));
            data.body.forEach(item => {
              if (!item['minPath']) {
                item['minPath'] = 'assets/images/one.jpg';
              } else {
                item['minPath'] = this.imgUrl + item['minPath'];
              }
              this.closeList.push(item);
            });
            console.log(this.closeList)
            if (this.closeCount === this.closeList.length) {
              this.infiniteScrollEnabled = false;
            }
          });
        }
      } else {
        if (this.tabs === 'deal') {
          if (isRest) {
            this.allDealParams.page = 0;
            this.allDealList = [];
          } else {
            this.allDealParams.page += 1;
          }
          this.safeServiceProxy.getAllSecurityQuestion(this.allDealParams).subscribe(data => {
            this.allDealCount = parseInt(data.headers.get('X-Total-Count'));
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
          this.safeServiceProxy.getAllSecurityQuestion(this.allCheckParams).subscribe(data => {
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
          this.safeServiceProxy.getAllSecurityQuestion(this.allCloseParams).subscribe(data => {
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

  initParams() {
    const names = ['dealParams', 'checkParams', 'closeParams', 'allDealParams', 'allCheckParams', 'allCloseParams']
    for (let name of names) {
      // 非分发人在所有里能看到我创建的和与我有关的；分发人才能看到所有的
      if (this.canSend && name.includes('all')) {
        
      } else {
        this[name]['creatorUserId.equals'] = this.appSessionService.entityId || this.appSession.entityId;
      }
      this[name]['projectId.equals'] = this.appSessionService.projectId || this.appSession.projectId;
      this[name]['isDeleted.equals'] = false; 
      if (name.includes('ealParams')) {
        this[name]['state.in'] = ['1','2','3','4'];
      } else if (name.includes('heckParams')) {
        this[name]['state.in'] = ['5', '6'];
      } else if (this.canViewByBuilding && !this.canViewByEngineer && name.includes('all')) {
        this[name]['sendOrganization.equals'] = this.nowProjectEmp.unitId;
      } else if (name.includes('loseParams')) {
        this[name]['state.in'] = ['7'];
      }
    }
    // 1. 管监提交 2.工程部提交/工程部发送 3. 施工单位分配 4施工单位整改 5.工程部复检  6.管监复检  7.关闭
  }
}
