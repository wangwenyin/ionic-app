import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, PopoverController } from 'ionic-angular';
import { CameraOptions, Camera } from '@ionic-native/camera';
import { QualityAppentFileInfo, EmployeeServiceProxy, FileServiceProxy, QualityServiceProxy, Employee, QualityDayCheck } from '../../shared/service-proxies-hdApp/service-proxies-hdApp';
import { HttpResponse, HttpRequest, HttpClient } from '@angular/common/http';
import { filter } from 'rxjs/operators';
import { AppSessionService } from '../../shared/app-session.service';
import { ThsLoadingController, ThsAlertController } from '../../shared/alert.service';
import { ImagePicker } from '@ionic-native/image-picker';
import { File } from '@ionic-native/file'
import * as moment from 'moment';
import { UserSelectPage } from '../supervisor-quality-check/add-quality/add-quality';

/**
 * Generated class for the AddQualityPatrolPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-add-quality-patrol',
  templateUrl: 'add-quality-patrol.html',
})
export class AddQualityPatrolPage {

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
  questionGradeList = [];
  questionTypeList = [];
  input = new QualityDayCheck();
  nowUser: Employee;
  checkTable: string;
  type: string;
  hasModel = false;

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
    // this.getDate();
  }

  getShowName(user) {
    if (user) {
      if (user.name && user.name.length > 0) {
        return user.name;
      }
    }
  }

  getDate() {
    // this.input.isPass = true;
  }
  /**
   *获取初始数据
   * @memberof AddQualityPage
   */
  getInitData() {
    this.qualityServiceProxy.getCheckTable({ 'isDeleted.equals': false, sort: ['orderNum,asc'] }).subscribe(data => {
      this.checkTableList = data.body;
    });
    // 获取问题分级
    this.qualityServiceProxy.findTypeByTypeCode('PBCF').pipe().subscribe((res) => {
      const children = [];
      for (let i = 0; i < res.body.length; i++) {
        children.push({ name: res.body[i].itemText, id: res.body[i].id });
      }
      this.questionGradeList = children;
    });
    // 获取问题分类
    this.qualityServiceProxy.findTypeByTypeCode('WTFL').pipe().subscribe((res) => {
      const children = [];
      for (let i = 0; i < res.body.length; i++) {
        children.push({ name: res.body[i].itemText, id: res.body[i].id });
      }
      this.questionTypeList = children;
    });
    // this.qualityServiceProxy.findTypeByTypeCode('LPFL').pipe().subscribe((res) => {
    //   const children = [];
    //   for (let i = 0; i < res.body.length; i++) {
    //     children.push({ name: res.body[i].itemText, id: res.body[i].id });
    //   }
    //   this.stagesList = children;
    // });
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
    if (this.changeTable && this.type && this.input.subentryId && this.input.checkValue && this.input.constructionUnit
      && this.userItem && this.input.detail && this.input.questionGrade && this.input.questionType) {
      this.input.recheckSupervisorId = this.userItem.empId;
      this.input.projectId = this.appSessionService.projectId;
      // if (this.desc) {
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
    this.input.state = '2';
    this.qualityServiceProxy.createQualityDayChecks(this.input).subscribe(data => {
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
      this.thsAlertController.basicAlert('提示', '保存成功', '关闭');
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
      console.log(data.body);
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

  onKey(event, num) {
    event.target.value = event.target.value.substr(0, num);
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
