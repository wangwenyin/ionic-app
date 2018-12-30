import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, PopoverController, ViewController } from 'ionic-angular';
import { QualityKPICheck, QualityServiceProxy, FileServiceProxy, Employee, EmployeeServiceProxy, QualityAppentFileInfo } from '../../../shared/service-proxies-hdApp/service-proxies-hdApp';
import { ImagePicker } from '@ionic-native/image-picker';
import { CameraOptions, Camera } from '@ionic-native/camera';
import { File } from '@ionic-native/file'
import { HttpRequest, HttpResponse, HttpClient } from '@angular/common/http';
import { filter } from 'rxjs/operators';
import * as moment from 'moment';
import { ThsAlertController, ThsLoadingController } from '../../../shared/alert.service';
import { AppSessionService } from '../../../shared/app-session.service';

/**
 * Generated class for the AddQualityPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-add-quality',
  templateUrl: 'add-quality.html',
})
export class AddQualityPage {

  checkTableList = [];
  checkTermList = [];
  checkPointList = [];
  stagesList = [];
  buildingList = [];
  unitList = [];
  remark = '';
  userItem: Employee;
  newIamgeFile = [];
  imageUploadPrefix: string;
  projectName: string;
  input = new QualityKPICheck();
  nowUser: Employee;
  hasModel = false;
  checkTable: string;
  type: string;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private qualityServiceProxy: QualityServiceProxy,
    private popoverController: PopoverController,
    private imagePicker: ImagePicker,
    private file: File,
    private thsAlertController: ThsAlertController,
    private camera: Camera,
    private fileService: FileServiceProxy,
    private loadCtrl: ThsLoadingController,
    private http: HttpClient,
    private employeeServiceProxy: EmployeeServiceProxy,
    private appSessionService: AppSessionService,
  ) {
    this.imageUploadPrefix = this.fileService.fileUrls + '/ng/upload';
    this.projectName = this.appSessionService.projectName;
    const body = this.navParams.get('data');
    if (body) {
      this.input.partId = body.map(item => item.partId).join(',');
      this.input.modelName = body.map(item => item.modelName).join(',');
      this.hasModel = true;
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AddQualityPage');
    this.getInitData();
    this.getDate();
  }

  getShowName(user) {
    if (user) {
      if (user.name && user.name.length > 0) {
        return user.name;
      }
    }
  }

  getDate() {
    this.input.isPass = true;
  }
  /**
   *获取初始数据
   * @memberof AddQualityPage
   */
  getInitData() {
    this.qualityServiceProxy.getCheckTable({ 'isDeleted.equals': false, sort: ['orderNum,asc'] }).subscribe(data => {
      this.checkTableList = data.body;
    });
    this.qualityServiceProxy.findTypeByTypeCode('LPFL').pipe().subscribe((res) => {
      const children = [];
      for (let i = 0; i < res.body.length; i++) {
        children.push({ name: res.body[i].itemText, id: res.body[i].id });
      }
      console.log(res.body);
      this.stagesList = children;
    });
    this.employeeServiceProxy.getEmployeeInProject({
      'projectId.equals': this.appSessionService.projectId,
      'isDeleted.equals': '0',
      'empId.equals': this.appSessionService.entityId,
    }).subscribe(data => {
      if (data.body.length > 0) {
        this.nowUser = data.body[0];
      }
    });
  }
  onSaveRecord() {
    if (this.checkTable && this.type && this.input.subentryId && this.input.checkSite && this.input.constructionUnit &&
      this.input.detail && this.userItem) {
      this.input.recheckSupervisorId = this.userItem.empId;
      this.input.projectId = this.appSessionService.projectId;
      // if (this.desc) {
      this.input.state = '1';
      this.loadCtrl.presentLoadingString("正在保存....");
      let formData = new FormData();
      let fileType = '';
      if (this.newIamgeFile.length) {
        for (let i = 0; i < this.newIamgeFile.length; i++) {
          let image = this.newIamgeFile[i].data;
          if (image) {
            const blobBin = this.fileService.dataURLtoBlob(image);
            fileType = blobBin.type.split("/")[1];
            formData.append('file', blobBin);
          }
        }
        const req = new HttpRequest('POST', this.imageUploadPrefix + `?type=` + fileType + `&path=` +
          encodeURIComponent(this.projectName + '/质量安全/' + moment(new Date()).format('YYYY') +
            '/' + moment(new Date()).format('MM')), formData, {
          });
        this.http.request(req)
          .pipe(filter(e => e instanceof HttpResponse))
          .subscribe((res: any) => {
            const imageList = res.body.result.map(item => {
              return {
                path: item.filePath,
                thumbnailPath: item.thumbnailPath
              };

            });
            this.saveRecord(imageList);
          }, error2 => {
            this.loadCtrl.closeLoading();
            let err = JSON.parse(error2.response).error;
            this.thsAlertController.basicAlert(err.message, err.details, '关闭');
          });
      } else {
        this.saveRecord(null);
      }
    } else {
      this.thsAlertController.basicAlert('提示', '请输入所有必填信息', '确定');
    }





    // } else {
    //   this.thsAlertController.basicAlert('提示', '任务进展情况不能为空', '关闭');
    // }
  }

  saveRecord(imgList) {
    this.qualityServiceProxy.createQualityKpiChecks(this.input).subscribe(data => {
      if (imgList) {
        for (let i = 0; i < imgList.length; i++) {
          const imageRecord = new QualityAppentFileInfo();
          imageRecord.recordId = data.body.id;
          imageRecord.path = imgList[i].path;
          imageRecord.minPath = imgList[i].thumbnailPath;
          this.qualityServiceProxy.createQualityAppentFile(imageRecord).subscribe(resp => {

          }, error => {
            this.loadCtrl.closeLoading();
            let err = JSON.parse(error.response).error;
            this.thsAlertController.basicAlert(err.message, err.details, '关闭');
            return;
          });
        }
      }
      this.loadCtrl.closeLoading();
      this.thsAlertController.basicAlert('提示', '保存成功!', '关闭');
      this.navCtrl.pop();
    }, error2 => {
      this.loadCtrl.closeLoading();
      let err = JSON.parse(error2.response).error;
      this.thsAlertController.basicAlert(err.message, err.details, '关闭');
    });
  }

  /**
   *检查表改变
   *
   * @param {*} event
   * @memberof AddQualityPage
   */
  changeTable(event) {
    const params = {
      sort: ['orderNum,asc'],
      'isDeleted.equals': false,
      'branchId.equals': event,
    };
    this.qualityServiceProxy.queryInBranch(params).subscribe(data => {
      this.checkTermList = data.body;
    });
  }
  /**
   *工程类别改变
   *
   * @param {*} event
   * @memberof AddQualityPage
   */
  changeTerm(event) {
    const params = {
      'engineeringId.equals': event,
      'isDeleted.equals': false,
      sort: ['orderNum,asc'],
    };
    this.qualityServiceProxy.queryInSubentry(params).subscribe(data => {
      this.checkPointList = data.body;
    });
  }
  /**
   *获取检查项明细
   * @param {*} event
   * @memberof AddQualityPage
   */
  getTitle(event) {
    const params = {
      'subentryId.equals': event,
      'isDeleted.equals': false,
      sort: ['orderNum,asc'],
    };
    this.qualityServiceProxy.queryInSubentryCheckItem(params).subscribe(data => {

      data.body.forEach(element => {
        this.remark += element.name + '&nbsp\n';
      });
    });
  }

  /**
   *楼层改变
   * @param {*} event
   * @memberof AddQualityPage
   */
  getBuilding(event) {
    this.qualityServiceProxy.findTypeByParentIdCode(event).pipe().subscribe((res) => {
      const children = [];
      for (let i = 0; i < res.body.length; i++) {
        children.push({ name: res.body[i].itemText, id: res.body[i].id });
      }
      this.buildingList = children;
    });
  }
  /**
   *楼栋改变
   *
   * @param {*} event
   * @memberof AddQualityPage
   */
  getUnitList(event) {
    this.qualityServiceProxy.findTypeByParentIdCode(event).pipe().subscribe((res) => {
      const children = [];
      for (let i = 0; i < res.body.length; i++) {
        children.push({ name: res.body[i].itemText, id: res.body[i].id });
      }
      this.unitList = children;
    });
  }
  /**
   *选择用户
   *
   * @memberof AddQualityPage
   */
  onAddUser() {
    let popover = this.popoverController.create(UserSelectPage, {
      departmentId: this.nowUser.departmentId
    });
    popover.present({});
    popover.onDidDismiss(result => {
      if (result) {
        this.userItem = result;
      }
    });
  }

  onLocalImage() {
    let opt = {
      maxImagesCount: 3,
      quality: 50
    };
    this.imagePicker.getPictures(opt).then((results) => {

      for (let i = 0; i < results.length; i++) {
        // this.thsAlertController.basicAlert(results[i],'','确定');
        let path = results[i];
        let index = path.lastIndexOf('/');
        let url = path.substring(0, index);
        let name = path.substring(index + 1);
        // this.thsAlertController.basicAlert(name,url,'确定');
        this.file.readAsDataURL(url, name).then(data => {
          this.newIamgeFile.push({
            path: results[i],
            data: data,
            statu: 0
          });
          // this.thsAlertController.basicAlert(this.newIamgeFile[0].data,this.newIamgeFile[0].path,'确定');
        });


      }
    }, (err) => {
      this.thsAlertController.basicAlert('转换失败', err, '确定');
    });
  }

  onCameraImage() {
    let options: CameraOptions = {
      quality: 50,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    };
    this.camera.getPicture(options).then((imageUrl) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64:
      let path = imageUrl;
      // this.thsAlertController.basicAlert(path,'','确定');
      let index = path.lastIndexOf('/');
      let url = path.substring(0, index);
      let name = path.substring(index + 1);
      // this.thsAlertController.basicAlert(name,url,'确定');
      this.file.readAsDataURL(url, name).then(data => {
        this.newIamgeFile.push({
          path: imageUrl,
          data: data,
          statu: 0
        });
        // this.thsAlertController.basicAlert(this.newIamgeFile[0].data,this.newIamgeFile[0].path,'确定');
      })
    }, (err) => {
      // Handle error
    });
  }

  onPrvIamge(value: any) {
    // this.isHaveShowTab = false;
    // if(this.isOpenView !== true){
    //   return;
    // }
    this.navCtrl.push('ImagePreviewPage', { 'imgSrc': value });
    //this.photoViewer.show(value, '', {share: false});
  }

  showDetail() {
    if (this.remark) {
      this.thsAlertController.basicAlert('检查标准', this.remark, '确定');
    }
  }
  /**
   *输入限制
   *
   * @param {*} event
   * @param {*} length
   * @memberof AddQualityPage
   */
  onKey(event, length) {
    event.target.value = event.target.value.substr(0, length);
  }

  needDeal(value) {
    if (value && this.input.isBroken) {
      this.input.isBroken = false;
    }
  }

  needBreak(value) {
    if (value && this.input.isRectification) {
      this.input.isRectification = false;
    }
  }
}


@Component({
  template: '<sign-user-select (userSelectEvent)="onClose($event)"></sign-user-select>'
})
export class UserSelectPage {
  constructor(public viewCtrl: ViewController) { }
  onClose(data: any) {
    this.viewCtrl.dismiss(data);
  }
}