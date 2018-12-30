import { Injectable } from '@angular/core';
import { File } from '@ionic-native/file';
import { FileTransfer, FileUploadOptions, FileTransferObject,FileUploadResult } from '@ionic-native/file-transfer';
import { FileOpener } from '@ionic-native/file-opener';

@Injectable()
export  class FileService{
  fileTransfer: FileTransferObject;
  constructor(private transfer: FileTransfer,
              private file: File,
              private fileOpener: FileOpener){
    this.fileTransfer= this.transfer.create();
  }

  async uploadFile(fileUrl:string,url:string,paramsInfo:any){
    try{
      let fileInfo=this.getFileInfoByFullPath(fileUrl);
      if(this.file.checkFile(fileInfo.Path,fileInfo.Name+"."+fileInfo.ExtName)){
        let options: FileUploadOptions = {
          fileKey: 'file',
          fileName:fileInfo.Name+"."+fileInfo.ExtName,
          mimeType:"application/octet-stream",
          params:paramsInfo
        };
        let result:FileUploadResult= await this.fileTransfer.upload(fileUrl,url,options);
        return result.responseCode==200;
      }
    }catch (e){
      console.log(JSON.stringify(e));
      throw e;
    }
  }
  async downloadFile(url:string,fileUrl:string) {
    try {
      if(await this.checkFile(fileUrl)==false){
        // url = encodeURI(url);
        // window.open(url);
        return  this.fileTransfer.download(url, fileUrl,true,{"Content-disposition": "attachment"}).then(data=>{
          return true;
        }).catch(e=>{
          console.log("e:"+JSON.stringify(e));
          return false;
        })
      }
    } catch (e) {
      console.log("e:"+JSON.stringify(e));
    }
    return false;
  }
  readAsArrayBuffer(path: string){
    let fileInfo=this.getFileInfoByFullPath(path);
    return this.file.readAsArrayBuffer(fileInfo.Path,fileInfo.Name+ '.' +fileInfo.ExtName);
  }
  getFileInfoByFullPath(fileUrl:string):FileInfo{
    let index=fileUrl.lastIndexOf('/');
    let extIndex=fileUrl.lastIndexOf('.');
    let fileInfo:FileInfo=<FileInfo>{};

    if(index>0){
      fileInfo.Path=fileUrl.substring(0,index);
    }else {
      index = -1;
    }
    if(extIndex>0){
      fileInfo.Name=fileUrl.substring(index+1,extIndex);
      fileInfo.ExtName=fileUrl.substring(extIndex+1);
    }
    return fileInfo;
  }
  async openFile(fileUrl){
    let fileInfo=this.getFileInfoByFullPath(fileUrl);
    let fileType:string=this.getFileType(fileInfo.ExtName);
    return await this.fileOpener.open(fileUrl, 'application/'+fileType)
  }
  getFileType(extName:string):string{
    extName=extName.toLowerCase();
    switch(extName){
      case 'avi':
      case 'mp4':
      case 'mov':
        extName='video';
        break;
      case 'jpeg':
      case 'jpg':
      case 'png':
      case 'bmp':
        extName='image';
        break;
      case  'mp3':
      case  '3gpp':
      case  'wav':
        extName='audio';
        break;
      case 'xls':
      case 'xlsx':
        extName='excel';
        break;
      case 'doc':
      case 'docx':
        extName='doc';
        break;
      case 'pdf':
        extName='pdf';
        break;
      case 'ppt':
        extName='ppt';
        break;
      case 'txt':
        extName='txt';
        break;
      case 'mpp':
        extName='mpp';
        break;
      case 'visio':
        extName='visio';
        break;
      case 'rvt':
      case 'scs':
        extName='revit';
        break;
      case 'dwg':
        extName='cad';
        break;
      default:
        extName='default';
        break;
    }
    return extName;
  }
  async createDir(path: string,dirName:string){
    try{
      await this.file.checkDir(path,dirName).then(_=>{

      }).catch(e=>{
        return this.file.createDir(path,dirName,false);
      });
      return true;
    }catch (e){
    }
    return false;
  }
  async moveFile(path: string,  newPath: string){
    try{
      let fileInfo = this.getFileInfoByFullPath(path);
      let newFileInfo = this.getFileInfoByFullPath(newPath);
      return await this.file.moveFile(fileInfo.Path,fileInfo.Name+'.'+fileInfo.ExtName,newFileInfo.Path,newFileInfo.Name+'.'+newFileInfo.ExtName).then(_=>{
        return true;
      }).catch(e=>{
        return false;
      });
    }catch (e){
    }
    return false;
  }
  async checkFile(path:string){
    try{
      let fileInfo = this.getFileInfoByFullPath(path);
      await this.file.checkFile(fileInfo.Path+"/",fileInfo.Name+"."+fileInfo.ExtName);
      return true;
    }catch(e){
      console.log("checkFile e:"+JSON.stringify(e));
    }
    return false;
  }
  readAsBinaryString(path:string){
    let fileInfo = this.getFileInfoByFullPath(path);
    return this.file.readAsBinaryString(fileInfo.Path,fileInfo.Name+"."+fileInfo.ExtName);
  }
}
export interface FileInfo{
  Path:string;
  Name:string;
  ExtName:string;
}
