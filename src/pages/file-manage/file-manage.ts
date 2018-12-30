import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, PopoverController } from 'ionic-angular';
import { PhotoViewer } from '@ionic-native/photo-viewer';
import {
  ResourceServiceProxy,
  DirAndFileOutput
} from '../../shared/service-proxies/service-proxies';
import { FileService } from '../../shared/file.service';
import { ThsAlertController, ThsLoadingController } from '../../shared/alert.service';
import { AppSessionService } from '../../shared/app-session.service';
import * as moment from 'moment';
import { DocumentServiceProxy, DirAndFile, FileServiceProxy } from '../../shared/service-proxies-hdApp/service-proxies-hdApp';
import { ModelUrl, ForgeModelBroweOption } from '../../shared/common/forge-model/forge-model';
/**
 * Generated class for the FileManagePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-file-manage',
  templateUrl: 'file-manage.html',
})
export class FileManagePage {
  // private dirItems: DirAndFileOutput[];
  // private fileItems: DirAndFileOutput[];
  private dirAndFiles: DirAndFile[];
  private parentDir: Array<{ id, name }>;
  private baseUrl: string;

  leftBTWidth: number;
  paddLeft: number;
  fontSize: number;


  startDate: moment.Moment;
  endDate: moment.Moment;
  dirCompareId: number;
  fileCompareId: number;
  upOrDown: boolean;
  maxResultCount: number;
  searchValue: string;
  projectId: string;
  page: number;
  size: number;
  fileUrl: string;
  projectName: string;

  isSearch: false;
  infiniteScrollEnabled = true;
  forgeModelUrl = '';

  isOpenFile = true;
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private loadCtrl: ThsLoadingController,
    private thsAlertController: ThsAlertController,
    public appSessionService: AppSessionService,
    public popoverCtrl: PopoverController,
    private photoViewer: PhotoViewer,
    private documentServiceProxy: DocumentServiceProxy,
    private fileServiceProxy: FileServiceProxy,
    private fileService: FileService) {


    this.leftBTWidth = 30;
    this.paddLeft = 90;
    this.fontSize = 17;

    this.dirAndFiles = [];
    // this.fileItems = [];
    this.parentDir = [];
    // this.parentDir.push({
    //   id: null,
    //   name: ''
    // });
    this.dirCompareId = 0;
    this.fileCompareId = 0;
    this.upOrDown = false;
    this.maxResultCount = 20;
    this.searchValue = '';
    this.page = 0;
    this.size = 10;
    this.projectName = this.appSessionService.projectName;
    this.baseUrl = this.appSessionService.baseUrl;
    this.projectId = this.appSessionService.projectId;
    this.fileUrl = this.fileServiceProxy.fileUrls + '/file/downloadByPath?path=';
    this.forgeModelUrl = this.fileServiceProxy.fileUrls + '/file/downloadByPath';
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad FileManagePage');
    // if (this.appSessionService.accountId === null || this.appSessionService.accountId === undefined) {
    //   this.navCtrl.push('LoginPage');
    // }
    this.documentServiceProxy.getRoot(this.projectId, '').subscribe(data => {
      this.parentDir.push({
        id: data.body.id,
        name: data.body.name
      });
      this.refreshData(true);
      // this.documentServiceProxy.findResource(0, 10, 'sort=name,asc', data.body.id, this.projectId, '0', '', '', '').subscribe(resp => {
      //   this.fileItems = resp.body;
      // });
    });
    // this.resourceServiceProxy.getTenantRootDir('').subscribe(result => {
    //   this.parentDir.push({
    //     id: result.id,
    //     name: result.name
    //   });
    //   this.refreshData(true);
    // });
  }
  ionViewDidEnter() {
    this.isOpenFile = true;
  }
  onBack() {
    // this.navCtrl.push('MenuPage');
    this.navCtrl.pop();
  }

  refreshData(reset = false) {
    try {
      this.loadCtrl.presentLoadingString("正在加载......");
      if (reset) {
        this.page = 0;
        this.dirAndFiles.splice(0);
        this.fileCompareId = 0;
        this.dirCompareId = 0;
        this.infiniteScrollEnabled = true;
        this.upOrDown = false;
      }
      let dir = this.parentDir[this.parentDir.length - 1];
      if (this.searchValue !== undefined && this.searchValue !== null && this.searchValue !== '') {
        // page: number, size: number, sort: any, projectId: string, parentId: string, isDeleted: string, name: string, typeList: string, majorList: string, fileList: string
        this.documentServiceProxy.findResourceByName(this.page, this.size, 'sort=orderNum,asc&sort=name,asc', this.projectId, dir.id, '0', this.searchValue, '', '', '').subscribe(resp => {
          resp.body.forEach(item => {
            this.dirAndFiles.push(item);
            if (item.type !== 'folder')
              this.isExistLocalFile(item);
          });
          // 是否全部加载
          if ((this.page + 1) * this.size >= parseInt(resp.headers.get('X-Total-Count'))) {
            this.infiniteScrollEnabled = false;
          }
          this.loadCtrl.closeLoading();
        }, error2 => {
          this.loadCtrl.closeLoading();
          this.thsAlertController.basicAlert('错误', error2.message, '关闭');
        });
      } else {
        this.documentServiceProxy.findResource(this.page, this.size, 'sort=orderNum,asc&sort=name,asc', dir.id, this.projectId, '0', '', '', '').subscribe(resp => {
          resp.body.forEach(item => {
            this.dirAndFiles.push(item);
            item['isDownload'] = false;
            if (item.type !== 'folder')
              this.isExistLocalFile(item);
          });
          // 是否全部加载
          if ((this.page + 1) * this.size >= parseInt(resp.headers.get('X-Total-Count'))) {
            this.infiniteScrollEnabled = false;
          }
          this.loadCtrl.closeLoading();
        }, error2 => {
          this.loadCtrl.closeLoading();
          this.thsAlertController.basicAlert('错误', error2.message, '关闭');
        });
      }


      // this.resourceServiceProxy.getDirAndFileExApp(dir.id, this.startDate, this.endDate,
      //   this.dirCompareId, this.fileCompareId,
      //   this.upOrDown, this.maxResultCount, this.searchValue).subscribe(result => {

      //     if (this.upOrDown) {
      //       for (let item of result.items) {
      //         if (item.dataType < 10) {
      //           this.dirItems.unshift(item);
      //         } else {
      //           this.isExistLocalFile(item);
      //           this.fileItems.unshift(item);
      //         }
      //       }
      //     } else {
      //       for (let item of result.items) {
      //         if (item.dataType < 10) {
      //           this.dirItems.push(item);
      //         } else {
      //           this.isExistLocalFile(item);
      //           this.fileItems.push(item);
      //         }
      //       }
      //       if (result.items.length < this.maxResultCount) {
      //         this.infiniteScrollEnabled = false;
      //       }
      //     }
      //     this.loadCtrl.closeLoading();
      //   }, error2 => {
      //     this.loadCtrl.closeLoading();
      //     this.thsAlertController.basicAlert('错误', error2.message, '关闭');
      //   })
    } catch (e) {
      this.loadCtrl.closeLoading();
      this.thsAlertController.basicAlert('错误', e.message, '关闭');
    }
  }

  onRefresh(infiniteScroll, upOrDown: boolean) {
    setTimeout(() => {
      if (upOrDown) {
        this.upOrDown = true;
        this.refreshData(true);
      } else {
        this.upOrDown = false;
        this.page++;
        this.refreshData();
      }
      infiniteScroll.complete();
    }, 500);

  }

  onDocClick(obj: DirAndFile, event) {
    console.log(obj);
    if (obj.type && obj.type !== 'folder') {//doc
      if (this.isOpenFile !== true) {
        return;
      }
      // if (!this.isGranted('Pages.Tenant.Resource_Preview')) {
      //   return;
      // }
      this.isOpenFile = false;
      if (obj.type === 'image') {
        this.onLocalFileOpen(obj, event);
        // let url = encodeURI(this.baseUrl + '/Lenovo/DownloadFileEx?path=' + encodeURIComponent(obj.path));
        // this.navCtrl.push('ImagePreviewPage', { 'imgSrc': url });
        //this.photoViewer.show(url, obj.name, {share: false});
        this.isOpenFile = true;
      } else if (obj.type === 'dwg' || obj.type === 'pdf'
        || obj.type === 'excel' || obj.type === 'word'
        || obj.type === 'mpp' || obj.type === 'ppt') {
        if (obj['isDownload']) {
          this.onLocalFileOpen(obj, event);
          this.isOpenFile = true;
        }
        // this.resourceServiceProxy.getFilePreviewInfo(obj.id, 'png').subscribe(result => {
        //   console.log('getFilePreviewInfo: ' + JSON.stringify(result));
        //   if (result.convertStatu > 0) {
        //     this.navCtrl.push('FilePreviewPage', { 'fileInfo': result });
        //   } else {
        //     this.isOpenFile = true;
        //     this.thsAlertController.basicAlert('提示', '文件转换中，请稍候.您也可以下载到本地直接查看!', '关闭');
        //   }
        // }, error2 => {
        //   this.isOpenFile = true;
        // });
      } else if (obj.type === 'rvt') {
        this.openModel(obj);
        this.isOpenFile = true;
      } else {
        this.isOpenFile = true;
        this.thsAlertController.basicAlert('提示', '不支持的文件格式', '关闭');
      }
    } else {
      this.parentDir.push({
        id: obj.id,
        name: obj.name
      });
      this.refreshData(true);
    }
  }
  onLocalFileOpen(obj: DirAndFile, event) {
    if (obj.type !== 'folder') {
      if (obj['isDownload']) {
        if (obj.type === 'cad' || obj.type === 'dwg') {
          event.stopPropagation();
          let path = this.appSessionService.basePath + obj.path.replace('.scs', '.dwg');
          path = path.replace('file://', '');
          path = path.replace('//', '/');
          let a = document.createElement('a');
          a.href = "myapp://com.lee/back/" + path;
          //a.target = '_blank';
          a.id = 'exppub';
          document.body.appendChild(a);
          let alink = document.getElementById('exppub');
          alink.click();
          alink.parentNode.removeChild(a);
        } else if (obj.type === 'pdf' || obj.type === 'excel' || obj.type === 'word'
          || obj.type === 'mpp' || obj.type === 'ppt') {
          event.stopPropagation();
          let path = this.appSessionService.basePath + obj.path.replace(/\\/g, '/').replace('.png', '.pdf');
          if (obj.type !== 'pdf') {
            path = this.getPathNotWithFileSuffix(path) + '.pdf';
          }
          // let path = this.fileUrl + obj.path; //.replace(/\\/g, '/').replace('.png', '.pdf');
          let a = document.createElement('a');
          a.href = "myapp://com.thsware/bim/pdf/" + path;
          //a.target = '_blank';
          a.id = 'exppub';
          document.body.appendChild(a);
          let alink = document.getElementById('exppub');
          alink.click();
          alink.parentNode.removeChild(a);
        }
      } else if (obj.type === 'image') {
        event.stopPropagation();
        // let url = this.appSessionService.basePath + obj.path.replace(/\\/g, '/');
        let url = this.fileUrl + encodeURIComponent(obj.path);
        this.navCtrl.push('ImagePreviewPage', { 'imgSrc': url });
        this.photoViewer.show(url, obj.name, { share: false });
        this.isOpenFile = true;
      }
    }
    // if (obj['isDownload'] === true) {
    //   if (obj.type === 'cad') {
    //     event.stopPropagation();
    //     let path = this.appSessionService.basePath + obj.path.replace('.scs', '.dwg');
    //     path = path.replace('file://', '');
    //     path = path.replace('//', '/');
    //     let a = document.createElement('a');
    //     a.href = "myapp://com.lee/back/" + path;
    //     //a.target = '_blank';
    //     a.id = 'exppub';
    //     document.body.appendChild(a);
    //     let alink = document.getElementById('exppub');
    //     alink.click();
    //     alink.parentNode.removeChild(a);
    //   } else if (obj.type === 'pdf' || obj.type === 'excel' || obj.type === 'doc'
    //     || obj.type === 'mpp' || obj.type === 'ppt') {
    //     event.stopPropagation();
    //     let path = this.appSessionService.basePath + obj.path.replace(/\\/g, '/').replace('.png', '.pdf');
    //     let a = document.createElement('a');
    //     a.href = "myapp://com.thsware/bim/pdf/" + path;
    //     //a.target = '_blank';
    //     a.id = 'exppub';
    //     document.body.appendChild(a);
    //     let alink = document.getElementById('exppub');
    //     alink.click();
    //     alink.parentNode.removeChild(a);
    //   } else if (obj.type === 'image') {
    //     event.stopPropagation();
    //     let url = this.appSessionService.basePath + obj.path.replace(/\\/g, '/');
    //     this.navCtrl.push('ImagePreviewPage', { 'imgSrc': url });
    //     //this.photoViewer.show(url, obj.name, {share: false});
    //     this.isOpenFile = true;
    //   }
    // }
  }
  /**
   *返回上级目录
   *
   * @memberof FileManagePage
   */
  onOpenParentDir() {
    if (this.parentDir.length > 1) {
      this.parentDir.pop();
    }
    this.refreshData(true);
  }

  /**
    * 显示文件图标
    * @param type
    */
  getIcon(type: String) {
    let fileType;
    if (type === undefined || type == null || type === 'folder') {
      return 'assets/file/folder.png';
    } else {
      fileType = type;
    }

    fileType = fileType.toLowerCase();
    switch (fileType) {
      case 'video':
        return 'assets/file/icon_list_videofile.png';
      case 'image':
        return 'assets/file/image.png';
      case 'audio':
        return 'assets/file/icon_list_videofile.png';
      case 'excel':
        return 'assets/file/excel.png';
      case 'word':
        return 'assets/file/word.png';
      case 'pdf':
        return 'assets/file/pdf.png';
      case 'ppt':
        return 'assets/file/ppt.png';
      case 'txt':
        return 'assets/file/txt.png';
      case 'mpp':
        return 'assets/file/mpp.png';
      case 'rvt':
        return 'assets/file/rvt.png';
      case 'cad':
        return 'assets/file/cad.png';
      case 'iso':
        return 'assets/file/iso.png';
      case 'zip':
        return 'assets/file/zip.png';
      case 'apk':
        return 'assets/file/apk.png';
      case 'java':
        return 'assets/file/java.png';
      case 'ifc':
        return 'assets/file/ifc.png';
      case 'dwg':
        return 'assets/file/dwg.png';
      case 'iso':
        return 'assets/file/iso.png';
      case 'zip':
        return 'assets/file/zip.png';
      case 'apk':
        return 'assets/file/apk.png';
      case 'java':
        return 'assets/file/java.png';
      case 'folder':
        return 'assets/file/folder.png';
      case 'xls':
        return 'assets/file/excel.png';
      case 'xlsx':
        return 'assets/file/excel.png';
      default:
        return 'assets/file/other.png';
    }
  }

  SetLeftStr(leftStr: string, title: string) {
    let m = window.screen.width;
    let fontSum = (m / 2 - this.leftBTWidth) / this.fontSize;
    let leftStrLen_1 = fontSum - title.length / 2;
    let leftStrLen_2 = (this.paddLeft - this.leftBTWidth) / 17;
    let leftLen = leftStrLen_1 > leftStrLen_2 ? leftStrLen_1 : leftStrLen_2;
    if (leftStr.length <= leftLen) {
      return leftStr;
    } else {
      return leftStr.substring(0, leftLen - 2) + "..."
    }
  }

  SetLeftStrEx() {
    let leftStr = '';
    let title = this.parentDir[this.parentDir.length - 1].name;
    if (this.parentDir.length >= 2) {
      leftStr = this.parentDir[this.parentDir.length - 2].name;
    }
    let m = window.screen.width;
    let fontSum = (m / 2 - this.leftBTWidth) / this.fontSize * 2;
    let titleLen = 0;
    if (title != null && title.length > 0) {
      for (let i = 0; i < title.length; i++) {
        if (title.charCodeAt(i) > 255) {//如果是汉子双字节
          titleLen += 2;
        } else {
          titleLen++;
        }
      }
    }
    let leftStrLen_1 = fontSum - titleLen / 2;
    let leftStrLen_2 = (this.paddLeft - this.leftBTWidth) / 17 * 2;
    let leftLen = (leftStrLen_1 > leftStrLen_2 ? leftStrLen_1 : leftStrLen_2);

    if (leftStr != null && leftStr.length > 0) {
      let i = 0;
      while (i < leftStr.length) {
        let code = leftStr.charCodeAt(i);
        if (code > 255) {
          leftLen -= 2;
        } else {
          leftLen--;
        }
        if (leftLen >= 0) {
          i++
        } else {
          break;
        }
      }
      if (i >= leftStr.length) {
        return leftStr;
      } else {
        return leftStr.substring(0, i - 1) + '...';
      }
    } else {
      return '';
    }
  }

  isExistLocalFile(value: DirAndFile) {
    let localPath = this.appSessionService.basePath + encodeURIComponent(value.path.replace(/\\/g, '/'));
    if (value.type === 'cad') {
      localPath = localPath.replace('.scs', '.dwg');
    }
    if (value.type === 'pdf' || value.type === 'excel' || value.type === 'word'
      || value.type === 'mpp' || value.type === 'ppt') {
      localPath = this.getPathNotWithFileSuffix(localPath) + '.pdf';
    }
    this.fileService.checkFile(localPath).then(result => {
      if (result === true) {
        value['isDownload'] = true;
      }
    })
  }

  onDownloadFile(event, value: DirAndFile) {
    event.stopPropagation();
    if (value['isDownload'] !== true) {
      this.loadCtrl.presentLoadingString("正在下载文件......");
      if (value.type === 'cad') {
        let url = this.fileUrl + encodeURIComponent(value.path.replace('scs', 'dwg'));
        let localPath = this.appSessionService.basePath + encodeURIComponent(value.path.replace(/\\/g, '/')).replace('scs', 'dwg');
        this.fileService.downloadFile(url, localPath).then(data => {
          this.loadCtrl.closeLoading();
          if (data === true) {
            value['isDownload'] = true;
          }
        }).catch(e => {
          this.loadCtrl.closeLoading();
          this.thsAlertController.basicAlert('错误', '下载文件错误:' + e.message, '关闭');
        })
      } else if (value.type === 'image' || value.type === 'pdf' || value.type === 'dwg') {
        let url = this.fileUrl + encodeURIComponent(value.path);
        let localPath = this.appSessionService.basePath + encodeURIComponent(value.path.replace(/\\/g, '/'));
        this.fileService.downloadFile(url, localPath).then(data => {
          this.loadCtrl.closeLoading();
          if (data === true) {
            value['isDownload'] = true;
          }
        }).catch(e => {
          this.loadCtrl.closeLoading();
          this.thsAlertController.basicAlert('错误', '下载文件错误:' + e.message, '关闭');
        })
      } else if (value.type === 'excel' || value.type === 'word' || value.type === 'mpp'
        || value.type === 'ppt') {
        this.documentServiceProxy.getFileDownLoadPath(value.id, value.rev, value.type).subscribe(date => {
          if (date.body.length > 0) {
            let url = this.fileUrl + encodeURIComponent(date.body[0].path);
            let localPath = this.appSessionService.basePath + encodeURIComponent(this.getPathNotWithFileSuffix(value.path) + '.pdf');
            this.fileService.downloadFile(url, localPath).then(data => {
              this.loadCtrl.closeLoading();
              if (data === true) {
                value['isDownload'] = true;
              }
            }).catch(e => {
              this.loadCtrl.closeLoading();
              this.thsAlertController.basicAlert('错误', '下载文件错误:' + e.message, '关闭');
            })
          } else {
            this.loadCtrl.closeLoading();
            this.thsAlertController.basicAlert('提示', '文件未转换成功', '关闭');
          }
        });
        // this.resourceServiceProxy.getFilePreviewInfo(value.id, '').subscribe(result => {
        //   if (result.convertStatu > 0) {
        //     let url = this.baseUrl + '/Lenovo/DownloadFileEx?path=' + encodeURIComponent(result.clientPath);
        //     let localPath = this.appSessionService.basePath + encodeURIComponent(result.clientPath.replace(/\\/g, '/'));
        //     this.fileService.downloadFile(url, localPath).then(data => {
        //       this.loadCtrl.closeLoading();
        //       if (data === true) {
        //         value['isDownload'] = true;
        //       }
        //     }).catch(e => {
        //       this.loadCtrl.closeLoading();
        //       this.thsAlertController.basicAlert('错误', '下载文件错误:' + e.message, '关闭');
        //     })
        //   } else {
        //     this.loadCtrl.closeLoading();
        //     this.thsAlertController.basicAlert('提示', '文件正在转换......', '关闭');
        //   }
        // }, error2 => {
        //   this.loadCtrl.closeLoading();
        //   this.thsAlertController.basicAlert('提示', '下载文件错误:' + error2.message, '关闭');
        // });
      }
    }
  }
  /**
   *显示文件大小
   *
   * @param {string} type
   * @param {number} size
   * @returns {string}
   * @memberof FileManagePage
   */
  getFileSize(type: string, size: number): string {
    if (type !== undefined && type !== null && type !== 'folder') {
      let filesize = Math.round(size / 1024);
      if (filesize > 1024) {
        filesize = Math.round(filesize / 1024 * 100) / 100;
        return filesize.toString() + " MB";
      }
      else
        return filesize.toString() + " KB";
    }
  }

  isGranted(permissionName: string): boolean {
    return this.appSessionService.isGranted(permissionName)
  }
  /**
   *获取上级目录
   *
   * @returns
   * @memberof FileManagePage
   */
  getNowDirName() {
    if (this.parentDir.length > 1) {
      return this.parentDir[this.parentDir.length - 1].name;
    }
    return '文档';
  }
  /**
   *获取去除后缀名文件路径
   *
   * @param {string} path
   * @memberof FileManagePage
   */
  getPathNotWithFileSuffix(path: string) {
    let file = null;
    if (path !== undefined && path !== null) {
      let fileName = path.lastIndexOf(".");
      file = path.substring(0, fileName);
    }
    return file;
  }
  /**
   *文档搜索
   *
   * @param {*} event
   * @memberof FileManagePage
   */
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
        // if (data.startDate && data.startDate.length > 0) {
        //   this.startDate = moment(data.startDate);
        // } else {
        //   this.startDate = undefined;
        // }
        // if (data.endDate && data.endDate.length > 0) {
        //   this.endDate = moment(moment(data.endDate).format('YYYY-MM-DD')).add(23, 'h').add(59, 'm').add(59, 's');
        // } else {
        //   this.endDate = undefined;
        // }
        this.searchValue = data.searchValue;
        this.page = 0;
        this.refreshData(true);
      }
    })
  }
  /**
   *模型预览
   *
   * @param {DirAndFile} obj
   * @memberof FileManagePage
   */
  openModel(obj: DirAndFile) {
    if (obj !== null && obj !== undefined) {
      this.documentServiceProxy.getFileDownLoadPath(obj.id, obj.rev, obj.type).subscribe(res => {
        const array = [];
        for (let i = 1; i < res.body.length; i++) {
          array.push(this.forgeModelUrl + '/' + res.body[i].path);
        }
        const tmp: ModelUrl = {
          threeUrl:  this.forgeModelUrl + '/' + res.body[0].path,
          dwgUrl: array,
          modelName: obj.name
        };
        const temp: ForgeModelBroweOption = {
          modelUrl: tmp
        };
        this.navCtrl.push('ThreeModelPage', {
          model: temp
        });
      });
    }
  }
}
