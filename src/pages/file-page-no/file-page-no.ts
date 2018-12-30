import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

/**
 * Generated class for the FilePageNoPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-file-page-no',
  templateUrl: 'file-page-no.html',
})
export class FilePageNoPage {

  pathList: Array<{ key: string, value: string }>;
  nowPath: string;
  fileType: string;

  constructor(public viewCtrl: ViewController,
              public navParams: NavParams) {
    this.nowPath = '';
    this.pathList = [];
    let data = this.navParams.data;
    if (data) {
      this.nowPath = data.imagePath;
      this.fileType = data.fileType;
      if (data.pathList instanceof Array) {
        for (let item of data.pathList) {
          this.pathList.push({
            key: this.getShowName(item),
            value: item
          })
        }
        if (this.fileType !== 'cad') {
          this.pathList.sort(this.compare)
        }
      }
    }
  }

  close(value: string) {
    console.log('close:' + value);
    this.viewCtrl.dismiss(value);
  }

  getShowName(value: string) {
    if (this.fileType === 'cad') {
      let start = value.lastIndexOf('@');
      let end = value.lastIndexOf('_');
      return value.substring(start + 1, end);
    } else {
      let start = value.lastIndexOf('_');
      let end = value.lastIndexOf('.');
      return value.substring(start + 1, end);
    }
  }

  compare(obj1, obj2) {
    let key1 = parseInt(obj1.key);
    let key2 = parseInt(obj2.key);
    if (key1 < key2){
      return -1;
    } else if (key1 > key2) {
      return 1;
    } else {
      return 0;
    }
  }
}
