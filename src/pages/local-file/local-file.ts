import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { File } from '@ionic-native/file';
import { FileService } from '../../shared/file.service';
import { ThsAlertController,ThsToastController } from '../../shared/alert.service';
import { PhotoViewer } from '@ionic-native/photo-viewer';
/**
 * Generated class for the LocalFilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-local-file',
  templateUrl: 'local-file.html',
})
export class LocalFilePage {
  _basePaths: Array<string>;

  _dirItems: Array<any>;
  _fileItems: Array<any>;


  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private file: File,
              public plt: Platform,
              private fileService: FileService,
              private toastController: ThsToastController,
              private photoViewer: PhotoViewer,
              private  thsAlertController: ThsAlertController
              ) {
    this._basePaths = [];
    this._dirItems = [];
    this._fileItems = [];
  }

  ionViewDidLoad() {
    alert(1);
    console.log('ionViewDidLoad LocalFilePage');
    if (this.plt.is('android')) {
      this._basePaths.push(this.file.externalRootDirectory);
    } else if (this.plt.is('ios')) {
      this._basePaths.push(this.file.documentsDirectory);
    }
    this.listDirAndFile(this._basePaths, 'hdbim');
  }

  listDirAndFile(paths, dir) {
    try {
      let path = '';
      for (let item of paths) {
        path += item + '/';
      }
      this._dirItems.splice(0);
      this._fileItems.splice(0);
      this.file.listDir(path, dir).then(result => {
        this._basePaths.push(dir);
        console.log('result: ' + JSON.stringify(result));
        for (let item of result) {
          if (item.isDirectory === true) {
            this._dirItems.push(item)
          } else if (item.isFile === true) {
            this._fileItems.push(this.convertFileItem(item))
          }
        }
      }).catch(error => {
        console.log('error: ' + JSON.stringify(error));
      })
    } catch (e) {
      console.log('e: ' + JSON.stringify(e));
    }
  }

  openDir(item) {
    this.listDirAndFile(this._basePaths, item.name)
  }

  openFile(item) {
    if(item['fileType']  === 'cad'){
      let path = this._basePaths[0] + item.fullPath;
    path = path.replace('file://','');
    path = path.replace('//','/');
      let a = document.createElement('a');
      a.href = "myapp://com.lee/back/" + path;
      //a.target = '_blank';
      a.id = 'exppub';
      document.body.appendChild(a);
      let alink = document.getElementById('exppub');
      alink.click();
      alink.parentNode.removeChild(a);
      // this.thsAlertController.basicAlert('提示', '不支持的文件格式', '关闭');
      return;
    } else if(item['fileType']  === 'image'){
      let path = this._basePaths[0] + item.fullPath;
      let index = path.lastIndexOf('/');
      let url =path.substring(0,index);
      let name = path.substring(index+1);
      this.file.readAsDataURL(url,name).then(data =>{
        this.navCtrl.push('ImagePreviewPage',{'imgSrc':data});
      })
    }else if(item['fileType']  === 'pdf'){
      let path = this._basePaths[0] + item.fullPath;
      let a = document.createElement('a');
      a.href = "myapp://com.thsware/bim/pdf/" + path;
      a.id = 'exppub';
      document.body.appendChild(a);
      let alink = document.getElementById('exppub');
      alink.click();
      alink.parentNode.removeChild(a);
      return;
    }
    else{
      this.navCtrl.push('LocalFilePreviewPage', {
        'fileType':item['fileType'],
        'filePath': this._basePaths[0] + item.fullPath,
        'name':item.name
      });
    }
  }
  deleteFile(item,i){
    if(item.isFile === true) {
      let index = item.fullPath.lastIndexOf('/');
      this.file.removeFile(this._basePaths[0] + item.fullPath.substring(0, index), item.fullPath.substring(index + 1)).then(data => {
        if (data.success === true) {
          this.toastController.showTop(item.name + '  删除成功！');
          this._fileItems.splice(i, 1);
        }
      }).catch(error => {
        this.thsAlertController.basicAlert('错误', JSON.stringify(item), '关闭');
      })
    }else  if(item.isDirectory === true){
      let fullPath =  item.fullPath;

      let index = fullPath.lastIndexOf('/');
      if(index === fullPath.length -1){
        fullPath = fullPath.substring(0,index);
        index = fullPath.lastIndexOf('/');
      }
      this.file.removeRecursively(this._basePaths[0], fullPath.substring(1)).then(data => {
        if (data.success === true) {
          this.toastController.showTop(item.name + '删除成功！');
          this._dirItems.splice(i, 1);
        }
      }).catch(error => {
         this.thsAlertController.basicAlert('错误', JSON.stringify(error), '关闭');
      })
    }
  }
  convertFileItem(item) {
    let fileInfo = this.fileService.getFileInfoByFullPath(item.name);
    let fileType = this.fileService.getFileType(fileInfo.ExtName);
    item['fileType'] = fileType;
    let index = fileInfo.Name.lastIndexOf('_');
    if (index > 0) {
      item.name = fileInfo.Name.substring(0, index);//+ '.'+ fileInfo.ExtName;
    }
    return item;
  }

  onOpenParentDir() {
    if (this._basePaths.length > 2) {
      this._basePaths.pop();
      let dirName = this._basePaths.pop();
      this.listDirAndFile(this._basePaths, dirName)
    }
  }

  getNowDirName() {
    if (this._basePaths.length > 2) {
      return this._basePaths[this._basePaths.length - 1];
    }
    return '文档';
  }

  getIcon(typeName: string): string {
    if (typeName === undefined || typeName == null || typeName.length <= 0) {
      typeName = '';
    }
    typeName = typeName.toLowerCase();
    switch (typeName) {
      case 'video':
        return 'assets/file/icon_list_videofile.png';
      case 'image':
        return 'assets/file/icon_list_image.png';
      case  'audio':
        return 'assets/file/icon_list_audiofile.png';
      case 'excel':
        return 'assets/file/excel.png';
      case 'doc':
        return 'assets/file/word.png';
      case 'pdf':
        return 'assets/file/pdf.png';
      case 'ppt':
        return 'assets/file/ppt.png';
      case 'txt':
        return 'assets/file/txt.png';
      case 'mpp':
        return 'assets/file/mpp.png';
      case 'visio':
        return 'assets/file/ppt.png';
      case 'revit':
        return 'assets/file/rvt.png';
      case 'cad':
        return 'assets/file/cad.png';
      default:
        return 'assets/file/folder.png';
    }
  }
}
