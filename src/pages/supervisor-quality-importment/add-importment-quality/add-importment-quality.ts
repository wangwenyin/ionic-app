import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, PopoverController } from 'ionic-angular';
import { QualityServiceProxy, QualityHighQuestionInfo, QualityAppentFileInfo, FileServiceProxy, EmployeeServiceProxy, Employee } from '../../../shared/service-proxies-hdApp/service-proxies-hdApp';
import { HttpRequest, HttpResponse, HttpClient } from '@angular/common/http';
import { filter } from 'rxjs/operators';
import { AppSessionService } from '../../../shared/app-session.service';
import { ThsLoadingController, ThsAlertController } from '../../../shared/alert.service';
import * as moment from 'moment';
import { CameraOptions, Camera } from '@ionic-native/camera';
import { ImagePicker } from '@ionic-native/image-picker';
import { File } from '@ionic-native/file'
import { UserSelectPage } from '../../supervisor-quality-check/add-quality/add-quality';

/**
 * Generated class for the AddImportmentQualityPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-add-importment-quality',
  templateUrl: 'add-importment-quality.html',
})
export class AddImportmentQualityPage {


  record = new QualityHighQuestionInfo();

  sixPreventionList = [];

  problemTypeList = [];

  constructionUnitTypeList = [];

  newIamgeFile = [];

  userItem;

  imageUploadPrefix: string;

  projectName: string;

  nowUser: Employee;

  hasModel = false;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private qualityServiceProxy: QualityServiceProxy,
    private appSessionService: AppSessionService,
    private loadCtrl: ThsLoadingController,
    private fileService: FileServiceProxy,
    private http: HttpClient,
    private file: File,
    private thsAlertController: ThsAlertController,
    private camera: Camera,
    private popoverController: PopoverController,
    private imagePicker: ImagePicker,
    private employeeServiceProxy: EmployeeServiceProxy,
  ) {
    this.imageUploadPrefix = this.fileService.fileUrls + '/ng/upload';
    this.projectName = this.appSessionService.projectName;
    const body = this.navParams.get('data');
    if (body) {
      this.hasModel = true;
      this.record.partId = body.map(item => item.partId).join(',');
      this.record.modelName = body.map(item => item.modelName).join(',');
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ImportantQualityPage');
    this.getUser();
    this.getInitData();
  }

  getUser() {
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

  getShowName(user: any) {
    if (user) {
      if (user.name && user.name.length > 0) {
        return user.name;
      }
    }
  }

  getInitData() {
    // 获取六防类型
    this.qualityServiceProxy.findTypeByTypeCode('LFLX').pipe().subscribe((res) => {
      const children = [];
      for (let i = 0; i < res.body.length; i++) {
        children.push({ label: res.body[i].itemText, id: res.body[i].id });
      }
      this.sixPreventionList = children;
    });
    // 获取重大问题分类
    this.qualityServiceProxy.findTypeByTypeCode('ZDWT').pipe().subscribe((res) => {
      const children = [];
      for (let i = 0; i < res.body.length; i++) {
        children.push({ label: res.body[i].itemText, id: res.body[i].id });
      }
      this.problemTypeList = children;
    });
    // 获取施工单位类别
    this.qualityServiceProxy.findTypeByTypeCode('CTUT').pipe().subscribe((res) => {
      const children = [];
      for (let i = 0; i < res.body.length; i++) {
        children.push({ label: res.body[i].itemText, id: res.body[i].id });
      }
      this.constructionUnitTypeList = children;
    });
  }

  onSaveRecord() {
    if (this.record.sixPreventionId &&  this.record.constructionUnitType &&
      this.record.successRate && this.record.constructionUnit && this.record.majorProblemsTypeId &&
      this.record.detail && this.userItem && this.record.overTime &&
      this.record.monthlyNode && this.record.superviseDetails && this.record.progressDetails
    ) {
      this.record.recheckSupervisor = this.userItem.empId;
      this.record.projectId = this.appSessionService.projectId;
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
    if (this.record.overTime) {
      this.record.overTime = new Date(this.record.overTime);
    }
    this.record.state = '1';
    this.record.isPass = '0';
    this.record.isDeleted = '0';
    this.qualityServiceProxy.createQualityHighQuestion(this.record).subscribe(data => {
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

  onKey(event, num) {
    event.target.value = event.target.value.substr(0, num);
  }

}
