import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, PopoverController } from 'ionic-angular';
import { AppSessionService } from '../../../shared/app-session.service';
import { SafeServiceProxy, QualityServiceProxy, SafeKPICheck, FileServiceProxy, SafeAppentFile } from '../../../shared/service-proxies-hdApp/service-proxies-hdApp';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { HttpClient, HttpRequest, HttpResponse } from '@angular/common/http';
import { ImagePicker } from '@ionic-native/image-picker';
import { File } from '@ionic-native/file';
import * as moment from 'moment';
import { ThsAlertController, ThsLoadingController } from '../../../shared/alert.service';
import { filter } from 'rxjs/operators';
import { UserSelectPage } from '../../supervisor-quality-check/add-quality/add-quality';

@IonicPage()
@Component({
  selector: 'page-security-examine-add',
  templateUrl: 'security-examine-add.html',
})
export class SecurityExamineAddPage {

  // 设置默认选中页面
  public tabs: string = 'need';

  toppings: string;

  projectName: string;
  imageUploadPrefix: string;
  // ExamineList: ExamineList;
  ExamineList: any[] = [];

  userItem: any;
  newIamgeFile = [];
  checkTermList = [];
  checkPointList = [];
  stagesList = [];
  buildingList = [];
  unitList = [];
  record = new SafeKPICheck();

  isShow = true;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private appSessionService: AppSessionService,
    private viewCtrl: ViewController,
    private safeServiceProxy: SafeServiceProxy,
    private qualityServiceProxy: QualityServiceProxy,
    private popoverController: PopoverController,
    private camera: Camera,
    private file: File,
    private http: HttpClient,
    private imagePicker: ImagePicker,
    private thsAlertController: ThsAlertController,
    private loadCtrl: ThsLoadingController,
    private fileService: FileServiceProxy,
  ) {
    this.projectName = this.appSessionService.projectName;
    this.imageUploadPrefix = this.fileService.fileUrls + '/ng/upload';
  }

  ionViewDidLoad() {
    this.getData();
    console.log('ionViewDidLoad SecurityExamineAddPage');
  }

  onBackPage() {
    this.navCtrl.push('SecurityManageExaminePage');
  }
  onCheckLink() {
    this.navCtrl.push('SecurityManageModelPage');
  }

  onSaveRecord() {
    // this.viewCtrl.dismiss();
    if (this.userItem) {
      this.record.recheckSupervisorId = this.userItem.empId;
    }
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
    console.log(this.record);
  }

  saveRecord(imgList) {
    this.record.projectId = this.appSessionService.projectId;
    this.record.state = '1';
    this.record.questionType = '1';
    this.safeServiceProxy.createKPISecurity(this.record).subscribe(data => {
      // console.log(data.body);
      if (imgList) {
        for (let i = 0; i < imgList.length; i++) {
          const imageRecord = new SafeAppentFile();
          imageRecord.recordId = data.body.id;
          imageRecord.path = imgList[i].path;
          imageRecord.minPath = imgList[i].thumbnailPath;
          this.safeServiceProxy.createSafeAppentFiles(imageRecord).subscribe(resp => {

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
    }, error2 => {
      this.loadCtrl.closeLoading();
      let err = JSON.parse(error2.response).error;
      this.thsAlertController.basicAlert(err.message, err.details, '关闭');
    });
  }

  change(e) {
    this.isShow = e;
  }

  getData() {
    const params = {
      sort: ['orderNum,asc'],
      'isDeleted.equals': false,
      'branchId.specified': false,
    };
    this.safeServiceProxy.queryInBranch(params).subscribe(data => {
      this.checkTermList = data.body;
      console.log(this.checkTermList);
    });
    this.qualityServiceProxy.findTypeByTypeCode('LPFL').pipe().subscribe((res) => {
      const children = [];
      for (let i = 0; i < res.body.length; i++) {
        children.push({ name: res.body[i].itemText, id: res.body[i].id });
      }
      this.stagesList = children;
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
    this.safeServiceProxy.queryInSubentry(params).subscribe(data => {
      console.log(data.body);
      this.checkPointList = data.body;
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

  getTitle(event) {

  }

  onKey(event, length) {
    event.target.value = event.target.value.substr(0, length);
  }

  /**
   *选择用户
   *
   * @memberof AddQualityPage
   */
  onAddUser() {
    let popover = this.popoverController.create(UserSelectPage, {
      // departmentId: this.nowUser.departmentId
    });
    popover.present({});
    popover.onDidDismiss(result => {
      if (result) {
        this.userItem = result;
      }
    });
  }
  /**
   *显示人员姓名
   * @param {*} user
   * @returns
   * @memberof SecurityExamineAddPage
   */
  getShowName(user) {
    if (user) {
      if (user.name && user.name.length > 0) {
        return user.name;
      }
    }
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
    if (value)
      this.navCtrl.push('ImagePreviewPage', { 'imgSrc': value });
    //this.photoViewer.show(value, '', {share: false});
  }
}
