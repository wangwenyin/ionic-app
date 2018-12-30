import { NgModule } from '@angular/core';

import * as HdApiServiceProxies from './service-proxies-hdApp';
import {HttpClientModule} from "@angular/common/http";
@NgModule({
  imports: [HttpClientModule],
    providers: [
      HdApiServiceProxies.ProjectServiceProxy,
      HdApiServiceProxies.SafeServiceProxy,
      HdApiServiceProxies.AccountServiceProxy,
      HdApiServiceProxies.QualityServiceProxy,
      HdApiServiceProxies.EmployeeServiceProxy,
      HdApiServiceProxies.FileServiceProxy,
      HdApiServiceProxies.DocumentServiceProxy,
      HdApiServiceProxies.ProcessServiceProxy,
      HdApiServiceProxies.ModelServiceProxy,
      HdApiServiceProxies.NoticeServiceProxy,
    ]
})
export class ServiceProxyHdAppModule { }
