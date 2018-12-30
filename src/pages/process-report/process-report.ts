import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ScheduleBuildingWeekendManage, ProcessServiceProxy, SafetyImage, FileServiceProxy } from '../../shared/service-proxies-hdApp/service-proxies-hdApp';
import { ThsLoadingController, ThsAlertController } from '../../shared/alert.service';
import * as moment from 'moment';
import { AppSessionService } from '../../shared/app-session.service';
import { ImagePicker } from '@ionic-native/image-picker';
import { File } from '@ionic-native/file'
import { CameraOptions, Camera } from '@ionic-native/camera';
import { HttpRequest, HttpClient, HttpResponse } from '@angular/common/http';
import { filter } from "rxjs/operators";
/**
 * Generated class for the ProcessReportPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-process-report',
  templateUrl: 'process-report.html',
})
export class ProcessReportPage {

  taskInfo: ScheduleBuildingWeekendManage = new ScheduleBuildingWeekendManage();
  desc: string;
  nowDate = '2';
  newIamgeFile: Array<{
    path: string,
    data: string,
    statu: number
  }> = [];  // 1 新增  2 已上传 3 上传失败
  viewItems = [];
  imageUploadPrefix: string;
  processRecords = [];
  imagePrefix: string;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private processServiceProxy: ProcessServiceProxy,
    private appSessionService: AppSessionService,
    private loadCtrl: ThsLoadingController,
    private imagePicker: ImagePicker,
    private file: File,
    private camera: Camera,
    private http: HttpClient,
    private fileService: FileServiceProxy,
    private thsAlertController: ThsAlertController, ) {
    const taskId = navParams.get('taskId');
    if (taskId !== null && taskId !== undefined) {
      this.processServiceProxy.getWeeklyPlanById(taskId).subscribe(data => {
        this.taskInfo = data.body;
        this.getHistory();
      });
    }
    this.imageUploadPrefix = this.fileService.fileUrls + '/ng/upload';
    this.imagePrefix = this.fileService.fileUrls + '/file/downloadByPath?path=';
    this.nowDate = moment().format('YYYY-MM-DD');
    console.log(this.nowDate);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ProcessReportPage');
  }

  goBack() {
    this.navCtrl.push('ProcessManagePage');
  }

  change(e) {
    if (e > 100) {
      this.taskInfo.finishRate = 100;
    } else if (e < 0) {
      this.taskInfo.finishRate = 0;
    }
  }
  /**
   *填报计划
   * @memberof ProcessReportPage
   */
  onSaveRecord() {
    if (this.desc) {
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
        const req = new HttpRequest('POST', this.imageUploadPrefix + `?type=` + fileType + `&path=scheduleWeekendProcess/`, formData, {
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
          });
      } else {
        this.saveRecord(null);
      }
      
    } else {
      this.thsAlertController.basicAlert('提示', '任务进展情况不能为空', '关闭');
    }
  }


  saveRecord(imageList) {
    this.processServiceProxy.getWeeklyPlanById(this.taskInfo.id).subscribe(data => {
      const isClose = data.body.isClosed;
      if (!isClose) {
        const param = {};
        param['weekendManageId'] = this.taskInfo.businessId;
        // param['processTime'] = moment(this.taskInfo.actualFinishDate).toJSON();
        param['finishRate'] = this.taskInfo.finishRate;
        param['creatorUserId'] = this.appSessionService.entityId;
        if (this.taskInfo.finishRate == 100){
          param['actualFinishDate'] = moment(this.taskInfo.actualFinishDate).toJSON();
        }
          

        // if (this.allowEditActualStart) {
        //     param['actualStartDate'] = moment(this.actualStartDate).toJSON();
        // }
        if (this.desc) {
          param['processDesc'] = this.desc;
        }
        // 图片信息
        if (imageList) {
            param['imageList'] = imageList;
        }
        // 附件信息
        // if ( this.weekPlanFileList) {
        //   param['fileList'] =  this.weekPlanFileList;
        // }
        this.processServiceProxy.updateWeeklyPlan(param).subscribe(data => {
          this.loadCtrl.closeLoading();
          this.thsAlertController.basicAlert('提示', '保存成功', '关闭');
          this.navCtrl.push('ProcessManagePage');
        }, error2 => {
          this.loadCtrl.closeLoading();
          let err = JSON.parse(error2.response).error;
          this.thsAlertController.basicAlert(err.message, err.details, '关闭');
        });
      } else {
        this.loadCtrl.closeLoading();
        this.thsAlertController.basicAlert('提示', '计划已关闭', '关闭');
      }
    }, error => {
      this.loadCtrl.closeLoading();
      let err = JSON.parse(error.response).error;
      this.thsAlertController.basicAlert(err.message, err.details, '关闭');
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
      this.thsAlertController.basicAlert('转换失败', err ,'确定');
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

  onKey(event, length) {
    event.target.value = event.target.value.substr(0, length);
  }

  getHistory() {
    const that = this;
    this.processServiceProxy.getRecord({'weekendManageId.equals': this.taskInfo.businessId, sort: 'creationTime,desc'}).subscribe(data => {
      data.body.map(item => {
        item.imagePathList = item.imagePathList.map(value => that.imagePrefix + encodeURIComponent(value))
      })
      this.processRecords = data.body;
    });
  }
}
