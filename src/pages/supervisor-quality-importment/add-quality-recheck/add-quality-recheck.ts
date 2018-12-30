import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { QualityServiceProxy, QualityHighQuestionRecheck, QualityHighQuestionInfo, FileServiceProxy, QualityAppentFileInfo } from '../../../shared/service-proxies-hdApp/service-proxies-hdApp';
import { AppSessionService } from '../../../shared/app-session.service';
import { ThsLoadingController, ThsAlertController } from '../../../shared/alert.service';
import { HttpRequest, HttpClient, HttpResponse } from '@angular/common/http';
import * as moment from 'moment';
import { File } from '@ionic-native/file'
import { filter } from 'rxjs/operators';
import { CameraOptions, Camera } from '@ionic-native/camera';
import { ImagePicker } from '@ionic-native/image-picker';

/**
 * Generated class for the AddQualityRecheckPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-add-quality-recheck',
  templateUrl: 'add-quality-recheck.html',
})
export class AddQualityRecheckPage {

  id: string;

  isFinish = false;

  question= new QualityHighQuestionInfo();

  record = new QualityHighQuestionRecheck();

  newIamgeFile = [];

  projectName: string;

  imageUploadPrefix: string;

  constructor(public navCtrl: NavController,
     public navParams: NavParams,
     private qualityServiceProxy: QualityServiceProxy,
     private appSessionService: AppSessionService,
     private loadCtrl: ThsLoadingController,
     private thsAlertController: ThsAlertController,
     private fileService: FileServiceProxy,
     private http: HttpClient,
     private file: File,
     private camera: Camera,
     private imagePicker: ImagePicker,
    //  private androidPermissions: AndroidPermissions,
     ) {
    this.id = this.navParams.get('id');
    this.projectName = this.appSessionService.projectName;
    this.imageUploadPrefix = this.fileService.fileUrls + '/ng/upload';
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AddQualityRecheckPage');
    this.getData();
  }

  getData() {
    if (this.id) {
      this.qualityServiceProxy.findQualityHighQuestionById(this.id).subscribe(data => {
        this.question = data.body;
      });
    }
  }

  save(imageList) {
    if (this.isFinish) {
      this.record.finishRate = 100;
    }
    this.record.questionId = this.id;
    this.record.projectId = this.appSessionService.projectId;
    this.record.isDeleted = '0';
    if (this.record.creationTime) {
      this.record.creationTime = new Date(this.record.creationTime);
    }
    this.qualityServiceProxy.createQualityHighQuestionRecheck(this.record).subscribe(data => {
      console.log(data.body);
      if (imageList) {
        for (let i = 0; i < imageList.length; i++) {
          const imageRecord = new QualityAppentFileInfo();
          imageRecord.recordId = data.body.id;
          imageRecord.path = imageList[i].path;
          imageRecord.minPath = imageList[i].thumbnailPath;
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
    },error2 => {
        this.loadCtrl.closeLoading();
        this.thsAlertController.basicAlert('错误', error2.message, '关闭');
    });
  }

  onKey(event,size) {
    event.target.value = event.target.value.substr(0, size);
  }
  /**
   *保存
   * @memberof AddQualityRecheckPage
   */
  onSaveRecord() {
    if (this.record.monthlyNode && this.record.progressDetail && this.record.creationTime ) {
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
            this.save(imageList);
          }, error2 => {
            this.loadCtrl.closeLoading();
            let err = JSON.parse(error2.response).error;
            this.thsAlertController.basicAlert(err.message, err.details, '关闭');
          });
      } else {
        this.save(null);
      }
    } else {
      this.thsAlertController.basicAlert('提示', '请输入所有必填信息', '确定');
    }
   
    // } else {
    //   this.thsAlertController.basicAlert('提示', '任务进展情况不能为空', '关闭');
    // }
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
  }
}
