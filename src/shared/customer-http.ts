/**
 * Created by yuanmh on 2018/1/3.
 */
import { Injectable, Input } from '@angular/core';
import { Http, XHRBackend, RequestOptions, Request, RequestOptionsArgs, Response, Headers } from "@angular/http";

import { Observable } from "rxjs/Observable";

@Injectable()
export class CustomerHttp extends Http {

  static _token: string;

  @Input()
  set Token(value: string){
    CustomerHttp._token=value;
  }

  constructor(backend: XHRBackend, defaultOptions: RequestOptions) {
    super(backend, defaultOptions);
  }
  get(url: string, options?: RequestOptionsArgs): Observable<Response> {
    console.log("in");
    return super.get(url,options);
  }

  request(url: string | Request, options?: RequestOptionsArgs): Observable<Response> {
    console.log("in2");
    if(!options.headers){
      options.headers = new Headers();
    }
    if(CustomerHttp._token!=null && CustomerHttp._token!= undefined && CustomerHttp._token.length>0){
      options.headers.append('Authorization', 'Bearer ' + CustomerHttp._token);
    }
    return super.request(url, options);

  }
}
