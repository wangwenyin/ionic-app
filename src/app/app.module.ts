import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { AboutPage } from '../pages/about/about';
import { ContactPage } from '../pages/contact/contact';
import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { ServiceProxyModule } from '../shared/service-proxies/service-proxy.module';
import { Http, HttpModule, XHRBackend, RequestOptions } from '@angular/http';
import { CustomerHttp } from '../shared/customer-http';
import { AppSessionService } from '../shared/app-session.service';
import { FileService } from '../shared/file.service';
import { ThsAlertController, ThsLoadingController, ThsToastController } from '../shared/alert.service';

import { PdfViewerModule } from 'ng2-pdf-viewer';


import { File } from '@ionic-native/file';
import { FileTransfer } from '@ionic-native/file-transfer';
import { FileOpener } from '@ionic-native/file-opener';
import { Toast } from "@ionic-native/toast";
import { Camera } from '@ionic-native/camera';
import { ImagePicker } from '@ionic-native/image-picker';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { PhotoViewer } from '@ionic-native/photo-viewer';
import { SignaturePadModule } from 'angular2-signaturepad';
import { IonicStorageModule } from '@ionic/storage';
import { ServiceProxiesHdProvider } from '../providers/service-proxies-hd/service-proxies-hd';
import { ServiceProxyHdAppModule } from '../shared/service-proxies-hdApp/service-proxy-hdApp.module';
import {
  API_BASE_URL, API_BASE_URL_HDAPP, API_BASE_FILE_URL, API_BASE_PROCESS_URL, API_BASE_QUALITY_URL, API_BASE_SECURITY_URL
} from '../shared/service-proxies-hdApp/service-proxies-hdApp';
// import { MenuOptionPage } from '../pages/menu-option/menu-option';
import { AppPermissions } from '../shared/app.permissions';
import { AddQualityPageModule } from '../pages/supervisor-quality-check/add-quality/add-quality.module';

export function interceptorFactory(xhrBackend: XHRBackend, requestOptions: RequestOptions) {
  let service = new CustomerHttp(xhrBackend, requestOptions);
  return service;
}

@NgModule({
  declarations: [
    MyApp,
    AboutPage,
    ContactPage,
    HomePage,
    TabsPage,
    // MenuOptionPage,
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp, {
      backButtonText: '',
      iconMode: 'ios',
      mode: 'ios',
    }),
    IonicStorageModule.forRoot(),
    ServiceProxyModule,
    HttpModule,
    PdfViewerModule,
    SignaturePadModule,
    AddQualityPageModule,
    ServiceProxyHdAppModule,
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    AboutPage,
    ContactPage,
    HomePage,
    TabsPage,
    // MenuOptionPage,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    File,
    FileTransfer,
    FileOpener,
    Camera,
    ImagePicker,
    ScreenOrientation,
    PhotoViewer,
    Toast,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    { provide: API_BASE_URL, useFactory: () => { return 'http://219.134.186.172:9084' } },
    { provide: API_BASE_URL_HDAPP, useFactory: () => { return 'http://219.134.186.172:9084/szcsgdjt14hx-test/api' } },
    { provide: API_BASE_PROCESS_URL, useFactory: () => { return 'http://219.134.186.172:9084/szcsgdjt14hx-processmanage/api' } },
    { provide: API_BASE_QUALITY_URL, useFactory: () => { return 'http://219.134.186.172:9084/szcsgdjt14hx-quality/api' } },
    { provide: API_BASE_SECURITY_URL, useFactory: () => { return 'http://219.134.186.172:9084/szcsgdjt14hx-security/api' } },
    { provide: API_BASE_FILE_URL, useFactory: () => { return 'http://219.134.186.172:9999/resourceHandle' } },
    // {provide: API_BASE_URL, useFactory: ()=> {return 'http://192.168.0.56:9084'} },
    // {provide: API_BASE_URL_HDAPP, useFactory: ()=> {return 'http://192.168.0.56:9084/szcsgdjt14hx_zy/api'} },
    // {provide: API_BASE_FILE_URL, useFactory: ()=> {return 'http://192.168.0.56:9999/resourceHandle'} },
    CustomerHttp,
    {
      provide: Http,
      useFactory: interceptorFactory,
      deps: [XHRBackend, RequestOptions]
    },
    AppSessionService,
    FileService,
    ThsAlertController,
    ThsLoadingController,
    ThsToastController,
    ServiceProxiesHdProvider,
    AppPermissions,
  ]
})
export class AppModule { }
