/**
 * Created by yuanmh on 2018/1/15.
 */
import { Injectable, } from '@angular/core';
import { Platform } from 'ionic-angular';
import { File } from '@ionic-native/file';
import { ThsAlertController } from './alert.service';
import { Permission } from './service-proxies-hdApp/service-proxies-hdApp';

@Injectable()
export class AppSessionService {

  // private static _user: UserLoginInfoDto;
  // private static _tenant: TenantLoginInfoDto;
  // private static _application: ApplicationInfoDto;
  // private static _lenovoInfo: LenovoInfoDto;
  private static _basePath: string;
  // 登录用户姓名
  private static _logUser: string;
  // 登录用户id
  private static _entityId: string;
  // 账号id 
  private static _accountId: string;
  // 所选项目名称
  private static _projectName: string;
  // 所选项目id
  private static _projectId: string;
  // 登录用户名
  private static _userName: string;
  // 用户头像
  
  private static _userHeadImage: string;
  private static _grantedPermissions: Permission[];
  private _baseUrl: string;
  constructor(
              // private _sessionService: SessionServiceProxy,
              // private _hrmsServiceProxy:HrmsServiceProxy,
              public plt: Platform,
              private file: File,) {
    this._baseUrl = "http://47.100.224.36:8808";

  }

  // get application(): ApplicationInfoDto {
  //   return AppSessionService._application;
  // }

  // get lenovoInfo(): LenovoInfoDto {
  //   return AppSessionService._lenovoInfo;
  // }
  
  get entityId(): string {
    return AppSessionService._entityId;
  }
  set entityId(value: string) {
    AppSessionService._entityId = value;
  }
  get projectName(): string {
    return AppSessionService._projectName;
  }
  set projectName(value: string) {
    AppSessionService._projectName = value;
  }

  get projectId(): string {
    return AppSessionService._projectId;
  }
  set projectId(value: string) {
    AppSessionService._projectId = value;
  }

  get userHeadImage(): string {
    return AppSessionService._userHeadImage;
  }
  set userHeadImage(value: string) {
    AppSessionService._userHeadImage = value;
  }

  get accountId(): string {
    return AppSessionService._accountId;
  }
  set accountId(value: string) {
    AppSessionService._accountId = value;
  }

  get grantedPermissions(): Permission[] {
    return AppSessionService._grantedPermissions;
  }
  set grantedPermissions(value: Permission[]) {
    AppSessionService._grantedPermissions = value;
  }

  get userName(): string {
    return AppSessionService._userName;
  }

  set userName(value: string) {
    AppSessionService._userName = value;
  }

  get basePath(): string {
    return AppSessionService._basePath;
  }

  get baseUrl(): string {
    return this._baseUrl;
  }
  get logUser(): string {
    return AppSessionService._logUser;
  }

  set logUser(value: string) {
    AppSessionService._logUser = value;
  }

  getShownLoginName(): string {
    const userName = AppSessionService.name;
    return userName;
  }
  isGranted(permissionCode: string): boolean{
    if(AppSessionService._grantedPermissions && AppSessionService._grantedPermissions.length>0){
      return AppSessionService._grantedPermissions.findIndex(item => item.code === permissionCode) >= 0;
    }
    return false;
  }
  hasGranted(permissionId: string): boolean{
    if(AppSessionService._grantedPermissions && AppSessionService._grantedPermissions.length>0){
      return AppSessionService._grantedPermissions.findIndex(item => item.id === permissionId) >= 0;
    }
    return false;
  }
  init(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      // this._sessionService.getCurrentLoginInformations().toPromise().then((result: GetCurrentLoginInformationsOutput) => {
        // AppSessionService._application = result.application;
        // AppSessionService._user = result.user;
        // AppSessionService._tenant = result.tenant;
        // AppSessionService._lenovoInfo = result.lenovoInfo;
        if (this.plt.is('android')) {
          AppSessionService._basePath = this.file.externalRootDirectory;
        } else if (this.plt.is('ios')) {
          AppSessionService._basePath = this.file.documentsDirectory;
        }
        AppSessionService._basePath += '/hdbim/';
        resolve(true);
        // this._hrmsServiceProxy.getUserPermissionsForEdit().subscribe(result => {
        //   AppSessionService._grantedPermissionNames = result.grantedPermissionNames;
        //   resolve(true);
        // },error2 => {
        //   reject(error2);
        // });
      // }, (err) => {
      //   reject(err);
      // });
    });
  }

  // private isCurrentTenant(tenantId?: number) {
  //   if (!tenantId && this.tenant) {
  //     return false;
  //   } else if (tenantId && (!this.tenant || this.tenant.id !== tenantId)) {
  //     return false;
  //   }
  //
  //   return true;
  // }

  encode(input: string) {
    let _keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let output = '';
    let chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    let i = 0;
    input = this._utf8_encode(input);
    while (i < input.length) {
      chr1 = input.charCodeAt(i++);
      chr2 = input.charCodeAt(i++);
      chr3 = input.charCodeAt(i++);
      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;
      if (isNaN(chr2)) {
        enc3 = enc4 = 64;
      } else if (isNaN(chr3)) {
        enc4 = 64;
      }
      output = output +
        _keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
        _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
    }
    return output;
  }
  _utf8_encode = function (string) {
    string = string.replace(/\r\n/g, '\n');
    let utftext = '';
    for (let n = 0; n < string.length; n++) {
      let c = string.charCodeAt(n);
      if (c < 128) {
        utftext += String.fromCharCode(c);
      } else if ((c > 127) && (c < 2048)) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      } else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }

    }
    return utftext;
  }
}
