import { Component, Output, EventEmitter } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';
import { GetTenantUsersOutput } from '../../shared/service-proxies/service-proxies';
import { ThsAlertController, ThsLoadingController } from '../../shared/alert.service';
import { EmployeeServiceProxy } from '../../shared/service-proxies-hdApp/service-proxies-hdApp';
/**
 * Generated class for the UserSelectComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'user-select',
  templateUrl: 'user-select.html'
})
export class UserSelectComponent {

  text: string;
  userItems: GetTenantUsersOutput[];

  compareId: number;
  upOrDown: boolean;
  maxResultCount: number;
  searchValue: string;
  unitId: string;
  departmentId: string;
  params = {};

  @Output() userSelectEvent: EventEmitter<GetTenantUsersOutput[]> = new EventEmitter<GetTenantUsersOutput[]>();

  constructor(public viewCtrl: ViewController,
    public employeeServiceProxy: EmployeeServiceProxy,
    private navParams: NavParams,
    private thsAlertController: ThsAlertController,
    private loadCtrl: ThsLoadingController) {
    console.log('Hello UserSelectComponent Component');
    let data = this.navParams.data;
    if (data) {
      if (data.departmentId) {
        this.params['departmentId.equals'] = data.departmentId;
      } else if (data.unitId) {
        this.params['unit.equals'] = data.unitId;
      }
    }
    this.text = 'Hello World';
    this.userItems = [];

    this.compareId = 0;
    this.upOrDown = false;
    this.maxResultCount = 20;
    this.searchValue = '';

    this.refreshData(true);
  }
  getItems(value: any) {
    if (value) {
      this.searchValue = value.target.value;
      if (this.searchValue) {
        this.params['name.contains'] = value.target.value;
      } else {
        delete this.params['name.contains'];
      }
      this.refreshData(true);
    }
    // this.userServiceProxy.getUserNames(searchValue).subscribe(result => {
    //   this.userItems = result.items;
    // });
  }
  onClose(value: boolean) {
    let tmpUser: GetTenantUsersOutput[] = [];
    if (value) {
      for (let user of this.userItems) {
        if (user['checked']) {
          tmpUser.push(user)
        }
      }
    }
    this.userSelectEvent.next(tmpUser)
  }
  onRefresh(infiniteScroll, upOrDown: boolean) {
    setTimeout(() => {
      if (upOrDown) {
        this.upOrDown = true;
        if (this.userItems.length > 0) {
          this.compareId = this.userItems[0].id;
        }
      } else {
        this.upOrDown = false;
        if (this.userItems.length > 0) {
          this.compareId = this.userItems[this.userItems.length - 1].id;
        }
      }
      this.refreshData();
      infiniteScroll.complete();
    }, 500);
  }
  refreshData(reset = false) {
    try {
      this.loadCtrl.presentLoadingString("正在加载......");
      if (reset) {
        this.userItems.splice(0);
        this.compareId = 0;
      }
      this.employeeServiceProxy.getEmployeeInProject(this.params).subscribe(data => {
        const result = data.body;
        if (this.upOrDown) {
          for (let item of result.items) {
            this.userItems.unshift(item);
          }
        } else {
          for (let item of result.items) {
            this.userItems.push(item);
          }
        }
        this.loadCtrl.closeLoading();
      }, error2 => {
        this.loadCtrl.closeLoading();
        this.thsAlertController.basicAlert('错误', error2.message, '关闭');
      })
      // this.hrmsServiceProxy.getTenantUsersApp(this.searchValue, this.compareId, this.upOrDown, this.maxResultCount).subscribe(result => {
      //   if (this.upOrDown) {
      //     for (let item of result.items) {
      //       this.userItems.unshift(item);
      //     }
      //   } else {
      //     for (let item of result.items) {
      //       this.userItems.push(item);
      //     }
      //   }
      //   this.loadCtrl.closeLoading();
      // }, error2 => {
      //   this.loadCtrl.closeLoading();
      //   this.thsAlertController.basicAlert('错误', error2.message, '关闭');
      // })
    } catch (e) {
      this.loadCtrl.closeLoading();
      this.thsAlertController.basicAlert('错误', e.message, '关闭');
    }
  }
  getShowName(user: any) {
    if (user.name && user.name.length > 0) {
      return user.name;
    }
    // if (user.userName && user.userName.length > 0) {
    //   return user.userName;
    // }
    // if (user.emailAddress && user.emailAddress.length > 0) {
    //   return user.emailAddress;
    // }
    // if (user.phoneNumber && user.phoneNumber.length > 0) {
    //   return user.phoneNumber;
    // }
  }
}
