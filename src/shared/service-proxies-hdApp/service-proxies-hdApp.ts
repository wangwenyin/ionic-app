
import { Inject, Injectable, InjectionToken, Optional } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { HttpClient, HttpResponse } from "@angular/common/http";
import { CustomerHttp } from "../customer-http";

export const API_BASE_URL = new InjectionToken('API_BASE_URL'); // UAA地址
export const API_BASE_FILE_URL = new InjectionToken('API_BASE_FILE_URL'); // 文件服务器地址
export const API_BASE_URL_HDAPP = new InjectionToken('API_BASE_URL_HDAPP'); // 主体业务地址
export const API_BASE_PROCESS_URL = new InjectionToken('API_BASE_PROCESS_URL'); // 进度后台服务地址
export const API_BASE_QUALITY_URL = new InjectionToken('API_BASE_QUALITY_URL'); // 质量后台服务地址
export const API_BASE_SECURITY_URL = new InjectionToken('API_BASE_SECURITY_URL'); // 安全后台服务地址

// 附件地址获取的service方法
@Injectable()
export class FileServiceProxy {
  private fileUrl: string;
  constructor(@Inject(API_BASE_FILE_URL) fileUrl?: string) {
    this.fileUrl = fileUrl ? fileUrl : "";
  }
  // 全局变量获取文件服务地址
  get fileUrls(): string {
    return this.fileUrl;
  }
  // base64转blob
  dataURLtoBlob(dataurl) {
    var arr = dataurl.split(',');
    var mime = arr[0].match(/:(.*?);/)[1];// 结果：   image/png
    var bstr = atob(arr[1].replace(/\s/g, ''));
    var n = bstr.length;
    var u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });//值，类型
  }

}

//项目选择的service方法
@Injectable()
export class ProjectServiceProxy {
  private http: HttpClient;
  private baseUrl: string;
  private options: {};
  protected jsonParseReviver: (key: string, value: any) => any = undefined;
  constructor(@Inject(HttpClient) http: HttpClient, @Optional() @Inject(API_BASE_URL_HDAPP) baseUrl?: string) {
    this.http = http;
    this.baseUrl = baseUrl ? baseUrl : "";
    this.options = {
      headers: { 'Authorization': 'Bearer ' + CustomerHttp._token },
      observe: 'response'
    }
  }
  /**
   *项目查询
   *
   * @param {*} param
   * @returns {Observable<HttpResponse<Project[]>>}
   * @memberof ProjectServiceProxy
   */
  queryProjects(param: any): Observable<HttpResponse<Project[]>> {
    this.options = {
      headers: { 'Authorization': 'Bearer ' + CustomerHttp._token },
      observe: 'response'
    }
    let url_ = this.baseUrl + '/projects';
    this.options["params"] = param;
    return this.http.get<any>(url_, this.options);
  }

  /**
 *获取项目人员
 *
 * @param {*} queryOption
 * @returns {Observable<HttpResponse<any>>}
 * @memberof ProjectServiceProxy
 */
  listProjects(queryOption: any): Observable<HttpResponse<any>> {
    this.options = {
      headers: { 'Authorization': 'Bearer ' + CustomerHttp._token },
      observe: 'response'
    }
    let url_ = this.baseUrl + '/project-emp-views';
    this.options["params"] = queryOption;
    return this.http.get<any>(url_, this.options);
  }

}
//安全管理的service方法
@Injectable()
export class SafeServiceProxy {
  private http: HttpClient;
  private baseUrl: string;
  private securityUrl: string;
  private mainUrl: string;
  private options: {};
  protected jsonParseReviver: (key: string, value: any) => any = undefined;
  constructor(@Inject(HttpClient) http: HttpClient, @Optional() @Inject(API_BASE_SECURITY_URL) securityUrl?: string,
  @Optional() @Inject(API_BASE_QUALITY_URL) mainUrl?: string) {
    this.http = http;
    this.securityUrl = securityUrl ? securityUrl : "";
    this.mainUrl = mainUrl ? mainUrl : "";
    this.options = {
      headers: { 'Authorization': 'Bearer ' + CustomerHttp._token },
      observe: 'response'
    }
  }


  /**
   *获取考核类安全问题
   * @param {*} params
   * @returns
   * @memberof SafeServiceProxy
   */
  getKPISecurity(params: any): Observable<HttpResponse<SafeKPICheck[]>> {
    let url_ = this.securityUrl + '/safe-kpi-checks';
    this.options = {
      headers: { 'Authorization': 'Bearer ' + CustomerHttp._token },
      observe: 'response'
    }
    this.options["params"] = params;
    return this.http.get<any>(url_, this.options);
  }

  // 建筑工程类别 (质量接口)
  queryInBranch(req?: any): Observable<HttpResponse<any>> {
    this.options["params"] = req;
    const url = this.mainUrl + '/build-bngineering-types';
    return this.http.get<any>(url, this.options);
  }

  /**
   *创建安全检查问题
   * @param {SafeKPICheck} model
   * @returns {Observable<HttpResponse<SafeKPICheck>>}
   * @memberof SafeServiceProxy
   */
  createKPISecurity(model: SafeKPICheck): Observable<HttpResponse<SafeKPICheck>> {
    let url_ = this.securityUrl + '/safe-kpi-checks';
    return this.http.post<any>(url_, model, this.options);
  }

  /**
   *获取工程项 (质量接口)
   *
   * @param {*} [req]
   * @returns {Observable<HttpResponse<any>>}
   * @memberof QualityServiceProxy
   */
  queryInSubentry(req?: any): Observable<HttpResponse<any>> {
    this.options["params"] = req;
    const url = this.mainUrl + '/build-subentry-types';
    return this.http.get<any>(url, this.options);
  }
  /**
     * 新增安全附件
     */
  createSafeAppentFiles(safeAppentFile: SafeAppentFile): Observable<HttpResponse<any>> {
    const url_ = this.securityUrl + '/safe-appent-files';
    return this.http.post<any>(url_, safeAppentFile, this.options);
  }

  /**
   * 获取安全附件
   */
  getSafeAppentFiles(param?: any): Observable<HttpResponse<SafeAppentFile[]>> {
    const url_ = this.securityUrl + '/safe-appent-files';
    this.options["params"] = param;
    return this.http.get<any>(url_, this.options);
  }
  /**
   *获取安全检查问题
   * @param {string} id
   * @returns {Observable<HttpResponse<SafeKPICheck>>}
   * @memberof SafeServiceProxy
   */
  getQualityKpiChecksById(id: string): Observable<HttpResponse<SafeKPICheck>> {
    let url_ = this.securityUrl + '/safe-kpi-checks';
    return this.http.get<any>(url_ + `/${id}`, this.options);
  }
  /**
   *日常巡查新增
   * @memberof SafeServiceProxy
   */
  createDailySafe(safeCheck: DailySafeCheck): Observable<HttpResponse<DailySafeCheck>> {
    const url = this.securityUrl + '/safe-day-checks';
    return this.http.post<any>(url, safeCheck, this.options);
  }

  /**
    * 获取安全问题整改反馈
    */
  getSafeProcessRecords(param?: any): Observable<HttpResponse<SafeProcessRecord[]>> {
    const url_ = this.securityUrl + '/safe-process-records';
    this.options["params"] = param;
    return this.http.get<any>(url_, this.options);
  }
  /**
   *通过id获取整改反馈信息
   *
   * @param {string} id
   * @returns {Observable<HttpResponse<SafeProcessRecord[]>>}
   * @memberof SafeServiceProxy
   */
  getSafeProcessRecordById(id: string): Observable<HttpResponse<SafeProcessRecord>> {
    const url_ = this.securityUrl + '/safe-process-records';
    return this.http.get<any>(url_ + '/' + id, this.options);
  }

  /**
     * 编辑安全管监整改反馈
     */
  createSafeProcessRecordsBySupervisor(safeProcessRecord: SafeProcessRecord): Observable<HttpResponse<any>> {
    const url_ = this.securityUrl + '/safe-process-records/updateBySupervisor';
    return this.http.post<any>(url_, safeProcessRecord, this.options);
  }

  /**
   * 新增安全工程整改反馈
   */
  createSafeProcessRecordsByEngineer(safeProcessRecord: SafeProcessRecord): Observable<HttpResponse<any>> {
    const url_ = this.securityUrl + '/safe-process-records/updateByEngineer';
    return this.http.post<any>(url_, safeProcessRecord, this.options);
  }
  /**
   *获取工程部安全巡检中由我创建的问题
   * @param {*} [req]
   * @returns {Observable<HttpResponse<DailySafeCheck[]>>}
   * @memberof SafeServiceProxy
   */
  getDailySafe(req?: any): Observable<HttpResponse<DailySafeCheck[]>> {
    const url_ = this.securityUrl + '/safe-day-checks';
    this.options = {
      headers: { 'Authorization': 'Bearer ' + (CustomerHttp._token || sessionStorage.getItem('token')) },
      observe: 'response'
    }
    this.options["params"] = req;
    return this.http.get<any>(url_, this.options);
  }
  /**
   *获取工程部安全巡检中所有的问题
   * @param {*} [req]
   * @returns {Observable<HttpResponse<DailySafeCheck[]>>}
   * @memberof SafeServiceProxy
   */
  getAllSecurityQuestion(req?: any): Observable<HttpResponse<DailySafeCheck[]>> {
    const url_ = this.securityUrl + '/safe-day-checks/total';
    this.options = {
      headers: { 'Authorization': 'Bearer ' + (CustomerHttp._token || sessionStorage.getItem('token')) },
      observe: 'response'
    }
    this.options["params"] = req;
    return this.http.get<any>(url_, this.options);
  }
  /**
   *通过id获取日常巡检
   *
   * @param {string} id
   * @returns {Observable<HttpResponse<DailySafeCheck>>}
   * @memberof SafeServiceProxy
   */
  findDailySafeById(id: string): Observable<HttpResponse<DailySafeCheck>> {
    const url_ = this.securityUrl + '/safe-day-checks';
    return this.http.get<any>(`${url_}/${id}`, this.options);
  }
  /**
   *通过id获取日常巡检
   *
   * @param {string} id
   * @returns {Observable<HttpResponse<DailySafeCheck>>}
   * @memberof SafeServiceProxy
   */
  updateDailySafe(dailySafeCheck: DailySafeCheck): Observable<HttpResponse<DailySafeCheck>> {
    const url_ = this.securityUrl + '/safe-day-checks';
    this.options = {
      headers: { 'Authorization': 'Bearer ' + CustomerHttp._token },
      observe: 'response'
    }
    return this.http.put<any>(url_, dailySafeCheck, this.options);
  }
}

export class SafetyImage {

  id?: string;

  imageType?: string;

  masterPath?: string;

  reducePath?: string;

  compressPath?: string;

  imageSize?: string;

  remake?: string;

  employCertificateId?: string;

  safetyCheckId?: string;

  creatorUserId?: string;

  creationTime?: Date;

  deleterUserId?: string;

  isDeleted?: string;

  deletionTime?: Date;

  projectId?: string;

  isNew?: string;
}

//质量检查的service方法
@Injectable()
export class QualityServiceProxy {
  private http: HttpClient;
  private baseUrl: string;
  private mainUrl: string;
  private options: {};
  protected jsonParseReviver: (key: string, value: any) => any = undefined;
  constructor(@Inject(HttpClient) http: HttpClient, @Optional() @Inject(API_BASE_QUALITY_URL) baseUrl?: string,
  @Optional() @Inject(API_BASE_URL_HDAPP) mainUrl?: string) {
    this.http = http;
    this.baseUrl = baseUrl ? baseUrl : "";
    this.mainUrl = mainUrl ? mainUrl : "";
    this.options = {
      headers: { 'Authorization': 'Bearer ' + CustomerHttp._token },
      observe: 'response'
    }
  }
  /**
   *获取管监质量检查问题
   * @param {*} [param]
   * @returns {Observable<HttpResponse<QualityKPICheck[]>>}
   * @memberof QualityServiceProxy
   */
  getQualityKpiChecks(param?: any): Observable<HttpResponse<QualityKPICheck[]>> {
    let url_ = this.baseUrl + '/quality-kpi-checks';
    this.options = {
      headers: { 'Authorization': 'Bearer ' + CustomerHttp._token },
      observe: 'response'
    }
    this.options["params"] = param;
    return this.http.get<any>(url_, this.options);
  }
  /**
   *获取字典 ()
   * @param {string} dictNo
   * @returns {Observable<HttpResponse<any>>}
   * @memberof QualityServiceProxy
   */
  findTypeByTypeCode(dictNo: string): Observable<HttpResponse<any>> {
    let url_ = this.mainUrl + '/system-dictionaries/findAllByDictNo';
    this.options = {
      headers: { 'Authorization': 'Bearer ' + CustomerHttp._token },
      observe: 'response'
    }
    return this.http.get<any>(`${url_}/${dictNo}`, this.options);
  }
  /**
   *获取检查表
   * @param {*} [req]
   * @returns {Observable<HttpResponse<BuildBranchType[]>>}
   * @memberof QualityServiceProxy
   */
  getCheckTable(req?: any): Observable<HttpResponse<any>> {
    this.options = {
      headers: { 'Authorization': 'Bearer ' + CustomerHttp._token },
      observe: 'response'
    }
    this.options["params"] = req;
    return this.http.get<any>(this.baseUrl + '/build-branch-types', this.options);
  }

  // 建筑工程类别
  queryInBranch(req?: any): Observable<HttpResponse<any>> {
    this.options["params"] = req;
    const url = this.baseUrl + '/build-bngineering-types';
    return this.http.get<any>(url, this.options);
  }
  /**
   *获取工程项
   *
   * @param {*} [req]
   * @returns {Observable<HttpResponse<any>>}
   * @memberof QualityServiceProxy
   */
  queryInSubentry(req?: any): Observable<HttpResponse<any>> {
    this.options["params"] = req;
    const url = this.baseUrl + '/build-subentry-types';
    return this.http.get<any>(url, this.options);
  }

  // 建筑分项检查标准
  queryInSubentryCheckItem(req?: any): Observable<HttpResponse<any>> {
    this.options["params"] = req;
    const url = this.baseUrl + '/build-subentry-check-items';
    return this.http.get<any>(url, this.options);
  }
  /**
   *获取楼层 （）
   * @param {string} parentId
   * @returns {Observable<HttpResponse<any>>}
   * @memberof QualityServiceProxy
   */
  findTypeByParentIdCode(parentId: string): Observable<HttpResponse<any>> {
    const url = this.mainUrl + '/system-dictionaries/findListByParentId';
    return this.http.get<any>(`${url}/${parentId}`, this.options);
  }
  /**
   *获取管监质量检查问题
   * @param {*} [param]
   * @returns {Observable<HttpResponse<any[]>>}
   * @memberof QualityServiceProxy
   */
  getQualityKpiChecksTotal(param?: any): Observable<HttpResponse<any[]>> {
    this.options = {
      headers: { 'Authorization': 'Bearer ' + CustomerHttp._token },
      observe: 'response'
    }
    this.options["params"] = param;
    const url = this.baseUrl + '/quality-kpi-checks/total';
    return this.http.get<any>(url, this.options);
  }
  /**
   *创建质量问题
   * @param {QualityKPICheck} qualityKPICheck
   * @returns {Observable<HttpResponse<any>>}
   * @memberof QualityServiceProxy
   */
  createQualityKpiChecks(qualityKPICheck: QualityKPICheck): Observable<HttpResponse<any>> {
    const url_ = this.baseUrl + '/quality-kpi-checks';
    return this.http.post<any>(url_, qualityKPICheck, this.options);
  }

  /**
     * 新增日常质量巡查
     */
  createQualityDayChecks(qualityDayCheck: QualityDayCheck): Observable<HttpResponse<any>> {
    const url_ = this.baseUrl + '/quality-day-checks';
    return this.http.post<any>(url_, qualityDayCheck, this.options);
  }
  /**
   *创建质量附件信息
   * @param {*} list
   * @returns {Observable<HttpResponse<any>>}
   * @memberof QualityServiceProxy
   */
  createQualityAppentFile(list: any): Observable<HttpResponse<any>> {
    const url_ = this.baseUrl + '/quality-appent-files';
    return this.http.post<any>(url_, list, this.options);
  }
  /**
   *获取质量问题附件
   * @param {*} [param]
   * @returns {Observable<HttpResponse<any>>}
   * @memberof QualityServiceProxy
   */
  getQualityAppentFile(param?: any): Observable<HttpResponse<any>> {
    const url_ = this.baseUrl + '/quality-appent-files';
    this.options["params"] = param;
    return this.http.get<any>(url_, this.options);
  }
  /**
   *通过id获取检查质量问题
   * @param {string} [id]
   * @returns {Observable<HttpResponse<any>>}
   * @memberof QualityServiceProxy
   */
  getQualityById(id?: string): Observable<HttpResponse<any>> {
    const url_ = this.baseUrl + '/quality-kpi-checks';
    return this.http.get<any>(`${url_}/${id}`, this.options);
  }

  /**
     * 新增管监非考核详情
     */
  createQualityNoKPICheck(qualityNoKPICheck: QualityNoKPICheck): Observable<HttpResponse<any>> {
    const url_ = this.baseUrl + '/quality-no-kpi-checks';
    return this.http.post<any>(url_, qualityNoKPICheck, this.options);
  }

  /**
    * 查询管监非考核详情
    */
  getQualityNoKPICheck(param?: any): Observable<HttpResponse<QualityNoKPICheck[]>> {
    const url_ = this.baseUrl + '/quality-no-kpi-checks';
    this.options = {
      headers: { 'Authorization': 'Bearer ' + CustomerHttp._token },
      observe: 'response'
    }
    this.options["params"] = param;
    return this.http.get<any>(url_, this.options);
  }
  /**
     * 新建重大质量问题
  */
  createQualityHighQuestion(qualityHighQuestionInfo: QualityHighQuestionInfo): Observable<HttpResponse<any>> {
    const url_ = this.baseUrl + '/quality-high-questions';
    return this.http.post<any>(url_, qualityHighQuestionInfo, this.options);
  }

  /**
  * 获取重大质量问题列表
  */
  getQualityHighQuestion(param?: any): Observable<HttpResponse<QualityHighQuestionInfo[]>> {
    const url_ = this.baseUrl + '/quality-high-questions';
    this.options = {
      headers: { 'Authorization': 'Bearer ' + CustomerHttp._token },
      observe: 'response'
    }
    this.options["params"] = param;
    return this.http.get<any>(url_, this.options);
  }
  /**
   *通过id获取重大问题
   * @param {string} id
   * @returns
   * @memberof QualityServiceProxy
   */
  findQualityHighQuestionById(id: string): Observable<HttpResponse<QualityHighQuestionInfo>> {
    const url_ = this.baseUrl + '/quality-high-questions';
    return this.http.get<any>(`${url_}/${id}`, this.options);
  }
  /**
   *获取复检信息列表
   *
   * @param {*} [param]
   * @returns {Observable<HttpResponse<QualityHighQuestionRecheck[]>>}
   * @memberof QualityServiceProxy
   */
  getQualityHighQuestionRecheck(param?: any): Observable<HttpResponse<QualityHighQuestionRecheck[]>> {
    const url_ = this.baseUrl + '/quality-high-question-rechecks';
    this.options["params"] = param;
    return this.http.get<any>(url_, this.options);
  }
  /**
   *通过id获取质量问题
   *
   * @param {string} id
   * @returns {Observable<HttpResponse<QualityHighQuestionRecheck>>}
   * @memberof QualityServiceProxy
   */
  getQualityHighQuestionRecheckById(id: string): Observable<HttpResponse<QualityHighQuestionRecheck>> {
    const url_ = this.baseUrl + '/quality-high-question-rechecks';
    return this.http.get<any>(url_ + '/' + id, this.options);
  }

  /**
   *新建重大质量问题复检
   *
   * @param {QualityHighQuestionRecheck} qualityHighQuestionRecheck
   * @returns {Observable<HttpResponse<any>>}
   * @memberof QualityServiceProxy
   */
  createQualityHighQuestionRecheck(qualityHighQuestionRecheck: QualityHighQuestionRecheck): Observable<HttpResponse<any>> {
    const url_ = this.baseUrl + '/quality-high-question-rechecks';
    return this.http.post<any>(url_, qualityHighQuestionRecheck, this.options);
  }
  /**
   *获取整改反馈
   * @param {*} [param]
   * @returns {Observable<HttpResponse<QualityProcessRecord[]>>}
   * @memberof QualityServiceProxy
   */
  getQualityProcessRecords(param?: any): Observable<HttpResponse<QualityProcessRecord[]>> {
    const url_ = this.baseUrl + '/quality-process-records';
    this.options["params"] = param;
    return this.http.get<any>(url_, this.options);
  }
  /**
   *通过id获取整改反馈
   * @param {string} id
   * @returns {Observable<HttpResponse<QualityProcessRecord>>}
   * @memberof QualityServiceProxy
   */
  getQualityProcessRecordById(id: string): Observable<HttpResponse<QualityProcessRecord>> {
    const url_ = this.baseUrl + '/quality-process-records';
    return this.http.get<any>(url_ + '/' + id, this.options);
  }

  /**
    * 管监新建完工确认
    */
  updateQualityProcessRecordsBySupervisor(qualityProcessRecordInfo: QualityProcessRecord) {
    const url_ = this.baseUrl + '/quality-process-records/updateBySupervisor';
    // return this.http.post<any>(url_, qualityProcessRecordInfo, { headers: { Authorization: 'Bearer ' + CustomerHttp._token, 'Content-Type': 'application/json' } });
    return this.http.post<any>(url_, qualityProcessRecordInfo, this.options);
  }

  /**
   * 工程部新建完工确认
   */
  updateQualityProcessRecordsByEngineer(qualityProcessRecordInfo: QualityProcessRecord): Observable<HttpResponse<any>> {
    const url_ = this.baseUrl + '/quality-process-records/updateByEngineer';
    return this.http.post<any>(url_, qualityProcessRecordInfo, this.options);
  }

  /**
     * 查询管监非考核详情
     */
  getQualityNoKPICheckById(id?: string): Observable<HttpResponse<QualityNoKPICheck>> {
    const url_ = this.baseUrl + '/quality-no-kpi-checks';
    return this.http.get<any>(`${url_}/${id}`, this.options);
  }

  /**
     * 查询发送到工程部的所有问题
     */
  getQualityAllQuestion(param?: any): Observable<HttpResponse<any>> {
    const url_ = this.baseUrl + '/quality-day-checks/findAllQuestionByProjectId'
    this.options = {
      headers: { 'Authorization': 'Bearer ' + CustomerHttp._token },
      observe: 'response'
    }
    this.options["params"] = param;
    return this.http.get<any>(`${url_}`, this.options);
  }

  /**
    * 查询日常质量巡查
    */
  getQualityDayChecks(param?: any): Observable<HttpResponse<QualityDayCheck[]>> {
    const url_ = this.baseUrl + '/quality-day-checks'
    this.options = {
      headers: { 'Authorization': 'Bearer ' + CustomerHttp._token },
      observe: 'response'
    }
    this.options["params"] = param;
    return this.http.get<any>(url_, this.options);
  }

  /**
   * 查询日常质量巡查
   */
  getQualityDayChecksById(id: string): Observable<HttpResponse<QualityDayCheck>> {
    const url_ = this.baseUrl + '/quality-day-checks'
    return this.http.get<any>(url_ + '/' + id, this.options);
  }

  /**
     * 施工新建整改反馈
     */
  createQualityProcessRecords(qualityProcessRecordInfo: QualityProcessRecord): Observable<HttpResponse<any>> {
    const url_ = this.baseUrl + '/quality-process-records';
    return this.http.post<any>(url_, qualityProcessRecordInfo, this.options);
  }
  /**
   *获取单位 ()
   * @param {*} [req]
   * @returns {Observable<HttpResponse<any>>}
   * @memberof QualityServiceProxy
   */
  getUnits(param?: any): Observable<HttpResponse<any>> {
    this.options["params"] = param;
    const url_ = this.mainUrl + '/hrms-units';
    return this.http.get<any>(
      url_,
      this.options,
    );
  }

  /**
     * 修改工程部日常质量巡查
     */
  updateQualityDayChecks(qualityDayCheck: QualityDayCheck): Observable<HttpResponse<QualityDayCheck>> {
    const url_ = this.baseUrl + '/quality-day-checks';
    return this.http.put<any>(url_, qualityDayCheck, this.options);
  }

  /**
     * 修改重大质量问题
     */
  updateQualityHighQuestion(qualityHighQuestionInfo: QualityHighQuestionInfo): Observable<HttpResponse<QualityHighQuestionInfo>> {
    const url_ = this.baseUrl + '/quality-high-questions';
    return this.http.put<any>(url_, qualityHighQuestionInfo, this.options);
  }

  /**
     * 修改管监考核详情
     */
  updateQualityKpiChecks(qualityKPICheck: QualityKPICheck): Observable<HttpResponse<QualityKPICheck>> {
    const url_ = this.baseUrl + '/quality-kpi-checks';
    return this.http.put<any>(url_, qualityKPICheck, this.options);
  }

  /**
    * 修改管监非考核详情
    */
  updateQualityNoKPICheck(qualityNoKPICheck: QualityNoKPICheck): Observable<HttpResponse<QualityNoKPICheck>> {
    const url_ = this.baseUrl + '/quality-no-kpi-checks';
    return this.http.put<any>(url_, qualityNoKPICheck, { observe: 'response' });
  }

  /**
    * 施工方指派整改人
    */
  allotQuestionToPerson(dataList: any): Observable<HttpResponse<any>> {
    const url_ = this.baseUrl + '/quality-day-checks/allotQuestionToPerson';
    return this.http.post<any>(
      url_,
      dataList,
      this.options
    );
  }
}

//文档管理的service方法
@Injectable()
export class DocumentServiceProxy {
  private http: HttpClient;
  private baseUrl: string;
  private options: {};
  protected jsonParseReviver: (key: string, value: any) => any = undefined;
  constructor(@Inject(HttpClient) http: HttpClient, @Optional() @Inject(API_BASE_URL_HDAPP) baseUrl?: string) {
    this.http = http;
    this.baseUrl = baseUrl ? baseUrl : "";
    this.options = {
      headers: { 'Authorization': 'Bearer ' + CustomerHttp._token },
      observe: 'response'
    }
  }

  /**
   *获取根文档
   *
   * @param {string} projectId
   * @param {string} engineeringId
   * @returns {Observable<HttpResponse<any>>}
   * @memberof DocumentServiceProxy
   */
  getRoot(projectId: string, engineeringId: string): Observable<HttpResponse<any>> {
    this.options = {
      headers: { 'Authorization': 'Bearer ' + CustomerHttp._token },
      observe: 'response'
    }
    return this.http.get<any>(`${this.baseUrl + '/resource-dirs/find-root-dirs'}?projectId=${projectId}&engineeringId=${engineeringId}`, this.options);
  }

  /**
   *获取文档
   *
   * @param {number} page
   * @param {number} size
   * @param {*} sort
   * @param {string} parentId
   * @param {string} projectId
   * @param {string} isDeleted
   * @param {string} typeList
   * @param {string} majorList
   * @param {string} fileList
   * @returns {Observable<HttpResponse<any>>}
   * @memberof DocumentServiceProxy
   */
  findResource(page: number, size: number, sort: any, parentId: string, projectId: string, isDeleted: string, typeList: string, majorList: string, fileList: string): Observable<HttpResponse<DirAndFile[]>> {
    // tslint:disable-next-line:max-line-length
    return this.http.get<any>(`${this.baseUrl + '/resource-dirs-files'}?page=${page}&size=${size}&isDeleted.in=${isDeleted}&parentId.equals=${parentId}&projectId.equals=${projectId}&${sort}&fileList.in=${fileList}&majorList.in=${majorList}&typeList.in=${typeList}`, this.options);
  }
  /**
   *通过名字搜索
   *
   * @param {number} page
   * @param {number} size
   * @param {*} sort
   * @param {string} projectId
   * @param {string} parentId
   * @param {string} isDeleted
   * @param {string} name
   * @param {string} typeList
   * @param {string} majorList
   * @param {string} fileList
   * @returns {Observable<HttpResponse<any>>}
   * @memberof DocumentServiceProxy
   */
  findResourceByName(page: number, size: number, sort: any, projectId: string, parentId: string, isDeleted: string, name: string, typeList: string, majorList: string, fileList: string): Observable<HttpResponse<DirAndFile[]>> {
    // tslint:disable-next-line:max-line-length
    return this.http.get<any>(`${this.baseUrl}/resource-dirs-files/getAllDirAndFileBySearchName?page=${page}&size=${size}&parentId.equals=${parentId}&isDeleted.in=${isDeleted}&name.contains=${name}&projectId.equals=${projectId}&${sort}&fileList.in=${fileList}&majorList.in=${majorList}&typeList.in=${typeList}`, this.options);
  }

  /**
  * 查询文件信息（id）
  * @param id
  */
  getFile(id: string): Observable<HttpResponse<ResourceFile>> {
    return this.http.get<any>(`${this.baseUrl}/resource-files/${id}`, this.options);
  }

  /**
     * 根据文件ID，类型，版本获取文件的下载路径
     * @param fileId
     * @param fileRev
     * @param fileTypeAnimationKeyframesSequenceMetadata
     */
  getFileDownLoadPath(fileId: string, fileRev: number, fileType: string): Observable<HttpResponse<any>> {
    this.options = {
      headers: { 'Authorization': 'Bearer ' + CustomerHttp._token },
      observe: 'response'
    }
    return this.http.get<any>(this.baseUrl + '/convert' + '?id=' + fileId + '&rev=' + fileRev + '&type=' + fileType, this.options);
  }
}

//获取项目人员信息
@Injectable()
export class EmployeeServiceProxy {
  private http: HttpClient;
  private baseUrl: string;
  private options: {};
  protected jsonParseReviver: (key: string, value: any) => any = undefined;
  constructor(@Inject(HttpClient) http: HttpClient, @Optional() @Inject(API_BASE_URL_HDAPP) baseUrl?: string) {
    this.http = http;
    this.baseUrl = baseUrl ? baseUrl : "";
    this.options = {
      headers: { 'Authorization': 'Bearer ' + CustomerHttp._token },
      observe: 'response'
    }
  }
  /** GET: 分页、多条件查询记录列表 */
  getEmployeeInProject(queryParams?: any): Observable<HttpResponse<any>> {
    let url_ = this.baseUrl + '/project-emp-views';
    this.options = {
      headers: { 'Authorization': 'Bearer ' + CustomerHttp._token },
      observe: 'response'
    }
    this.options["params"] = queryParams;
    return this.http.get<any>(url_, this.options);
  }
  //根据人员id获取人员信息
  getHrmsByUserId(id: string): Observable<HttpResponse<any>> {
    let url_ = this.baseUrl + '/hrms-emps';
    this.options = {
      headers: { 'Authorization': 'Bearer ' + CustomerHttp._token },
      observe: 'response'
    }
    return this.http.get<any>(`${url_}/${id}`, this.options);
  }
}

//账号信息
@Injectable()
export class AccountServiceProxy {
  private http: HttpClient;
  private baseUrl: string;
  private options: {};
  protected jsonParseReviver: (key: string, value: any) => any = undefined;
  constructor(@Inject(HttpClient) http: HttpClient, @Optional() @Inject(API_BASE_URL) baseUrl?: string) {
    this.http = http;
    this.baseUrl = baseUrl ? baseUrl : "";
    this.options = {
      headers: { 'Authorization': 'Bearer ' + CustomerHttp._token },
      observe: 'response'
    }
  }

  //登录
  login(user: any): Observable<HttpResponse<any>> {
    let url_ = this.baseUrl + '/auth/login';
    // this.options["params"]=user;
    return this.http.post<any>(url_, user);
  }
  /**
   *获取头像
   * @param {string} userId
   * @returns {Observable<HttpResponse<any>>}
   * @memberof AccountServiceProxy
   */
  getHeadImage(userId: string): Observable<HttpResponse<any>> {
    this.options = {
      headers: { 'Authorization': 'Bearer ' + CustomerHttp._token },
      observe: 'response'
    }
    let url_ = this.baseUrl + '/thsuaa/api/sys-user/avatar';
    // this.options["params"]=user;
    return this.http.get<any>(`${url_}/${userId}`, this.options);
  }

  /**
   * 获取权限点
   * @param {String} userId
   * @param {String} [tenantId]
   * @returns {Observable<HttpResponse<Permission[]>>}
   * @memberof AccountServiceProxy
   */
  getAllUserPermission(userId: String, tenantId?: String): Observable<HttpResponse<Permission[]>> {
    let queryParams = {};
    if (tenantId != null) {
      queryParams['tenantId'] = tenantId;
    }
    this.options["params"] = queryParams;
    const url_ = this.baseUrl + `/thsuaa/api/sys-users/${userId}/allPermissions`;
    return this.http.get<any>(url_, this.options);
  }

}

/**
 *进度管理服务
 *
 * @export
 * @class ProcessServiceProxy
 */
@Injectable()
export class ProcessServiceProxy {
  private http: HttpClient;
  private baseUrl: string;
  private options: {};
  protected jsonParseReviver: (key: string, value: any) => any = undefined;
  constructor(@Inject(HttpClient) http: HttpClient, @Optional() @Inject(API_BASE_PROCESS_URL) baseUrl?: string) {
    this.http = http;
    this.baseUrl = baseUrl ? baseUrl : "";
    this.options = {
      headers: { 'Authorization': 'Bearer ' + CustomerHttp._token },
      observe: 'response'
    }
  }

  getWeeklyPlan(queryParams?: any): Observable<HttpResponse<ScheduleBuildingWeekendManage[]>> {
    let url_ = this.baseUrl + '/schedule-building-weekend-manages';
    this.options = {
      headers: { 'Authorization': 'Bearer ' + CustomerHttp._token },
      observe: 'response'
    }
    this.options["params"] = queryParams;
    return this.http.get<any>(url_, this.options);
  }

  getWeeklyPlanById(id: string): Observable<HttpResponse<ScheduleBuildingWeekendManage>> {
    let url_ = this.baseUrl + '/schedule-building-weekend-manages';
    return this.http.get<any>(`${url_}/${id}`, this.options);
  }
  /**
   *获取填报记录
   * @param {*} [queryParams]
   * @returns
   * @memberof ProcessServiceProxy
   */
  getRecord(queryParams?: any) {
    let url_ = this.baseUrl + '/schedule-weekend-processes';
    this.options["params"] = queryParams;
    return this.http.get<any>(url_, this.options);
  }

  // updateWeeklyPlan(scheduleControlManage: ScheduleBuildingWeekendManage) {
  //   let url_ = this.baseUrl + '/schedule-building-weekend-manages';
  //   return this.http.put<any>(url_, scheduleControlManage, { headers: { Authorization: 'Bearer ' + CustomerHttp._token, 'Content-Type': 'application/json' } });
  // }
  /**
   *更新计划
   *
   * @param {*} scheduleControlProcess
   * @returns
   * @memberof ProcessServiceProxy
   */
  updateWeeklyPlan(scheduleControlProcess: any) {
    // this.options["params"] = scheduleControlProcess;
    return this.http.post<any>(this.baseUrl + '/schedule-weekend-processes', scheduleControlProcess, this.options);
  }
}
/**
 *模型服务
 *
 * @export
 * @class ModelServiceProxy
 */
@Injectable()
export class ModelServiceProxy {
  private http: HttpClient;
  private baseUrl: string;
  private qualityUrl: string;
  private securityUrl: string;
  private options: {};
  protected jsonParseReviver: (key: string, value: any) => any = undefined;
  constructor(@Inject(HttpClient) http: HttpClient, @Optional() @Inject(API_BASE_URL_HDAPP) baseUrl?: string,
  @Optional() @Inject(API_BASE_QUALITY_URL) qualityUrl?: string,@Optional() @Inject(API_BASE_SECURITY_URL) securityUrl?: string) {
    this.http = http;
    this.baseUrl = baseUrl ? baseUrl : "";
    this.qualityUrl = qualityUrl ? qualityUrl : "";
    this.securityUrl = securityUrl ? securityUrl : "";
    this.options = {
      headers: { 'Authorization': 'Bearer ' + CustomerHttp._token },
      observe: 'response'
    }
  }
  /**
   *获取管理模型
   * @param {*} projectId
   * @returns {Observable<HttpResponse<any[]>>}
   * @memberof ModelServiceProxy
   */
  getManageModel(projectId: any): Observable<HttpResponse<any[]>> {
    this.options = {
      headers: { 'Authorization': 'Bearer ' + CustomerHttp._token },
      observe: 'response'
    }
    let url_ = this.baseUrl + '/model-groups/findActiveFileList';
    return this.http.get<any>(`${url_}/${projectId}`, this.options);
  }

  /**
   * 
   * @param params 根据问题类型获取不同数据集
   */
  getQuestionByQuestionType(params: any): Observable<HttpResponse<any[]>> {
    this.options = {
      params: params,
      headers: { 'Authorization': 'Bearer ' + CustomerHttp._token },
      observe: 'response'
    }
    return this.http.get<any>(this.qualityUrl + '/quality-day-checks/findAllQuestionByProjectId', this.options);
  }

  /**
   * 
   * @param params 根据类型查询安全相关问题
   */
  getSecurityQuestionType(params: any): Observable<HttpResponse<any[]>> {
    this.options = {
      params: params,
      headers: { 'Authorization': 'Bearer ' + CustomerHttp._token },
      observe: 'response'
    }
    return this.http.get<any>(this.securityUrl + '/safe-day-checks/total', this.options);
  }
}



/**
 *通知服务类
 *
 * @export
 * @class NoticeServiceProxy
 */
@Injectable()
export class NoticeServiceProxy {
  private http: HttpClient;
  private baseUrl: string;
  private options: {};
  protected jsonParseReviver: (key: string, value: any) => any = undefined;
  constructor(@Inject(HttpClient) http: HttpClient, @Optional() @Inject(API_BASE_URL) baseUrl?: string) {
    this.http = http;
    this.baseUrl = baseUrl ? baseUrl : "";
  }
  /**
   *获取通知
   * @param {*} [req]
   * @returns {Observable<HttpResponse<Notice[]>>}
   * @memberof NoticeServiceProxy
   */
  queryNotice(req?: any): Observable<HttpResponse<Notice[]>> {
    this.options = {
      headers: { 'Authorization': 'Bearer ' + CustomerHttp._token },
      observe: 'response'
    }
    this.options["params"] = req;
    const url_ = this.baseUrl + '/notice-infos';
    return this.http.get<any>(url_, this.options);
  }
  /**
   *通过Id获取通知
   * @param {string} id
   * @returns {Observable<HttpResponse<Notice>>}
   * @memberof NoticeServiceProxy
   */
  findNoticeById(id: string): Observable<HttpResponse<Notice>> {
    const url_ = this.baseUrl + '/notice-infos';
    return this.http.get<any>(`${url_}/${id}`, this.options);
  }

  /**
   * 获取系统通知
   * @param {*} [req]
   * @returns {Observable<HttpResponse<Notice[]>>}
   * @memberof NoticeServiceProxy
   */
  querySysNotice(req?: any): Observable<HttpResponse<SysNotification[]>> {
    this.options = {
      headers: { 'Authorization': 'Bearer ' + CustomerHttp._token },
      observe: 'response'
    }
    this.options["params"] = req;
    let url_ = this.baseUrl + '/thsadmin/api/sys-notifications';
    return this.http.get<any>(url_, this.options);
  }

  /**
   * 将消息状态更新为已读
   * @param notice
   */
  readSysNotice(id: string): Observable<HttpResponse<SysNotification>> {
    debugger;
    this.options = {
      headers: { 'Authorization': 'Bearer ' + CustomerHttp._token },
      observe: 'response'
    }
    let url_ = this.baseUrl + '/thsadmin/api/sys-notifications/read';
    return this.http.put<any>(url_, id, this.options);
  }
}

/**
 * 系统通知
 */
export class SysNotification {
  id?: string;
  senderName?: string;
  senderId?: string;
  sendTime?: Date;
  summary?: string;
  content?: string;
  priority?: number;
  tenantId?: string;
  receiverId?: string;
  receiverName?: string;
  readTime?: Date;
  isRead?: boolean;
}


export class Project {
  accessUsers?: string;
  address?: string;
  belongArea?: string;
  belongAreaName?: string;
  belongCity?: string;
  belongCityName?: string;
  belongCompany?: string;
  belongProvinces?: string;
  belongProvincesName?: string;
  code?: string;
  contractMode?: string;
  creationTime?: Date;
  creatorUserId?: string;
  deleteTime?: Date;
  factEndDate?: Date;
  factStartDate?: Date;
  fileSize?: string;
  id?: string;
  imageUrl?: string;
  isDelete?: boolean;
  lastModification?: string;
  lastModificationTime?: Date;
  latitude?: string;
  manager?: string;
  managerTel?: string;
  name?: string;
  parentId?: string;
  planEndDate?: Date;
  planStartDate?: Date;
  projectLevel?: number;
  projectPropertyList?: string;
  remark?: string;
  section?: string;
  stringtude?: string;
  thumbnailPath?: string;
  totalInvest?: string;
  type?: string;
}

export class DirAndFile {
  checkOutStatus?: string;
  checkOutTime?: string;
  checkOutUserId?: string;
  convertCount?: string;
  convertStatus?: string;
  creationTime?: Date;
  creatorUserId?: string;
  deleterUserId?: string;
  deletionTime?: string;
  engineeringId?: string;
  id?: string;
  isAbleModify?: string;
  isDeleted?: string;
  lastModificationTime?: string;
  lastModifierUserId?: string;
  name?: string;
  orderNum?: number;
  parentId?: string;
  projectId?: string;
  rev?: number;
  signStatus?: string;
  size?: number;
  type?: string;
  path?: string;
}

export class ResourceFile {
  /**
   * 主键
   */
  id?: string;
  /**
   * 名称
   */
  name?: string;
  /**
   * 版本
   */
  rev?: number;
  /**
   * 存放位置
   */
  path?: string;
  /**
   * 文件大小
   */
  size?: number;
  /**
   * 文件类型
   */
  type?: string;
  /**
  * 文件夹id
  */
  dirId?: string;
  /**
   * 项目id
   */
  projectId?: string;
  /**
   * 工程id
   */
  engineeringId?: string;
  /**
   * 锁定/解锁人
   */
  checkOutUserId?: string;
  /**
   * 锁定/解锁状态
   */
  checkOutStatus?: string;
  /**
   * 锁定/解锁时间
   */
  checkOutTime?: Date;
  /**
   * 转换次数
   */
  convertCount?: number;
  /**
   * 转换状态
   */
  convertStatus?: string;
  /**
   * dwg视图类型
   */
  dWGViewType?: string;
  /**
   * 删除人id
   */
  deleterUserId?: string;
  /**
   * 删除时间
   */
  deletionTime?: Date;
  /**
   * 是否删除（1：删除，0：未删除）
   */
  isDeleted?: string;
  /**
   * 创建时间
   */
  creationTime?: Date;
  /**
   * 创建人id
   */
  creatorUserId?: string;
  /**
   * 最后修改时间
   */
  lastModificationTime?: Date;
  /**
   * 最后修改人
   */
  lastModifierUserId?: string;
  /**
   * 签名状态
   */
  signStatus?: string;
  /**
   * 备注
   */
  remark?: string;

  orderNum?: string;
}

export class ScheduleBuildingWeekendManage {
  id?: string;
  code?: number;
  name?: string;
  planType?: string;
  planStartDate?: Date;
  planFinishDate?: Date;
  actualStartDate?: Date;
  actualFinishDate?: Date;
  dutyUser?: string;
  dutyDepartment?: string;
  duration?: number;
  previousTaskId?: string;
  finishRate?: number;
  remark?: string;
  parentId?: string;
  creatorUserId?: string;
  creationTime?: Date;
  lastModifierUserId?: string;
  lastModificationTime?: Date;
  projectId?: string;
  versionId?: string;
  businessId?: string;
  isClosed?: boolean;
}

export class QualityKPICheck {
  /**
  * 主键
  */
  id?: string;
  /**
   * 分项id
   */
  subentryId?: string;
  /**
   * 构件id
   */
  partId?: string;
  /**
   * 检查值
   */
  checkValue?: string;
  /**
   * 是否合格
   */
  isPass?: boolean;
  /**
   * 是否整改
   */
  isRectification?: boolean;
  /**
   * 是否砸掉
   */
  isBroken?: boolean;
  /**
   * 问题描述
   */
  detail?: string;
  /**
   * 楼层
   */
  floorName?: string;
  /**
   * 要求整改时间
   */
  overTime?: Date;
  /**
   * 二维码Id
   */
  qrCodeId?: string;
  /**
   * 备注
   */
  remark?: string;
  /**
   * 状态
   */
  state?: string;
  /**
   * 删除人id
   */
  deleterUserId?: string;
  /**
   * 删除时间
   */
  deletionTime?: Date;
  /**
   * 是否删除
   */
  isDeleted?: boolean;
  /**
   * 创建时间
   */
  creationTime?: Date;
  /**
   * 创建人id
   */
  creatorUserId?: string;
  creatorUserName?: string;
  /**
   * 最后修改时间
   */
  lastModificationTime?: Date;
  /**
   * 最后修改人
   */
  lastModifierUserId?: string;
  /**
   * 项目Id
   */
  projectId?: string;
  /**
   * 工程类别
   */
  engineeringName?: string;
  /**
   * 	检查项
   */
  subentryName?: string;
  /**
   * 	检查表
   */
  branchName?: string;
  /**
   * 管监考核人
   */
  recheckSupervisorId?: string;
  /**
   * 楼栋
   */
  building?: string;
  /**
   * 单元
   */
  unit?: string;
  /**
   * 检查部位
   */
  checkSite?: string;
  /**
   * 分期
   */
  stages?: string;
  /**
   * 施工单位
   */
  constructionUnit?: string;
  unitName?: string;
  buildingName?: string;
  stagesName?: string;
  recheckEngineerId?: string;
  sendOrganization?: string;
  copyOrganization?: string;
  branchId?: string;
  engineeringId?: string;
  firstImagePath?: string;
  overTimeEngineer?: Date;
  modelName?: string;

  /**
   * 主送单位名称
   */
  sendCompanyName?: string;
  /**
   * 抄送单位名称
   */
  copyCompanyName?: string;
}

export class Employee {
  id?: string;
  empId?: string;
  name?: string;
  projectId?: string;
  mobile?: string;
  mail?: string;
  uid?: string;
  status?: number;
  isOutsiders?: string;
  unitId?: string;
  unitName?: string;
  departmentId?: string;
  departmentName?: string;
  jobId?: string;
  jobName?: string;
  majorId?: string;
  majorName?: string;
  creationTime?: Date;
  creatorUserId?: string;
  deleterUserId?: string;
  deletionTime?; Date;
  isDeleted?: string;
  lastModifierUserId?: string;
  lastModificationTime?: Date;
}

export class QualityAppentFileInfo {
  /**
   * 主键
   */
  id?: string;
  /**
   * 记录id
   */
  recordId?: string;
  /**
   * 删除人id
   */
  deleterUserId?: string;
  /**
   * 删除时间
   */
  deletionTime?: Date;
  /**
   * 是否删除（1：删除，0：未删除）
   */
  isDeleted?: string;
  /**
   * 创建时间
   */
  creationTime?: Date;
  /**
   * 创建人id
   */
  creatorUserId?: string;
  /**
   * 排序号
   */
  orderNum?: any;
  /**
   * path
   */
  path?: string;
  /**
   * 缩略图路径
   */
  minPath?: string;
  /**
   * 压缩图路径
   */
  midPath?: string;
}

export class QualityNoKPICheck {
  /**
  * 主键
  */
  id?: string;
  /**
   * 分项id
   */
  subentryId?: string;
  /**
   * 构件id
   */
  partId?: string;
  /**
   * 检查值
   */
  checkValue?: string;
  /**
   * 是否合格
   */
  isPass?: boolean;
  /**
   * 是否整改
   */
  isRectification?: boolean;
  /**
   * 是否砸掉
   */
  isBroken?: boolean;
  /**
   * 问题描述
   */
  detail?: string;
  /**
   * 楼层
   */
  floorName?: string;
  /**
   * 要求整改时间
   */
  overTime?: Date;
  /**
   * 二维码Id
   */
  qrCodeId?: string;
  /**
   * 备注
   */
  remark?: string;
  /**
   * 状态
   */
  state?: string;
  /**
   * 删除人id
   */
  deleterUserId?: string;
  /**
   * 删除时间
   */
  deletionTime?: Date;
  /**
   * 是否删除
   */
  isDeleted?: boolean;
  /**
   * 创建时间
   */
  creationTime?: Date;
  /**
   * 创建人id
   */
  creatorUserId?: string;
  creatorUserName?: string;
  /**
   * 最后修改时间
   */
  lastModificationTime?: Date;
  /**
   * 最后修改人
   */
  lastModifierUserId?: string;
  /**
   * 项目Id
   */
  projectId?: string;
  /**
   * 工程类别
   */
  engineeringName?: string;
  /**
   * 	检查项
   */
  subentryName?: string;
  /**
   * 	检查表
   */
  branchName?: string;
  /**
   * 管监考核人
   */
  recheckSupervisorId?: string;
  /**
   * 楼栋
   */
  building?: string;
  /**
   * 单元
   */
  unit?: string;
  /**
   * 检查部位
   */
  checkSite?: string;
  /**
   * 分期
   */
  stages?: string;
  /**
   * 施工单位
   */
  constructionUnit?: string;
  unitName?: string;
  buildingName?: string;
  stagesName?: string;
  recheckEngineerId?: string;
  sendOrganization?: string;
  copyOrganization?: string;
  branchId?: string;
  engineeringId?: string;
  firstImagePath?: string;
  overTimeEngineer?: Date;

  /**
   * 模型名称
   */
  modelName?: string;
  /**
   * 主送单位名称
   */
  sendCompanyName?: string;
  /**
   * 抄送单位名称
   */
  copyCompanyName?: string;
  buildingModifierName?: string;
}

export class QualityHighQuestionInfo {
  /**
   * 主键
   */
  id?: string;
  /**
   * 分项id
   */
  subentryId?: string;
  /**
   * 构件id
   */
  partId?: string;
  /**
   * 检查值
   */
  checkValue?: string;
  /**
   * 是否合格
   */
  isPass?: string;
  /**
   * 问题描述
   */
  detail?: string;
  /**
   * 备注
   */
  remark?: string;
  /**
   * 楼层
   */
  floorName?: string;
  /**
   * 删除人id
   */
  deleterUserId?: string;
  /**
   * 删除时间
   */
  deletionTime?: Date;
  /**
   * 是否删除（1：删除，0：未删除）
   */
  isDeleted?: string;
  /**
   * 创建时间
   */
  creationTime?: Date;
  /**
   * 创建人id
   */
  creatorUserId?: string;
  /**
   * 最后修改时间
   */
  lastModificationTime?: Date;
  /**
   * 最后修改人
   */
  lastModifierUserId?: string;
  /**
   * 复查间隔
   */
  recheckInterval?: number;
  /**
   * 要求整改时间
   */
  overTime?: Date;
  /**
   * 二维码Id
   */
  qRcodeId?: string;
  /**
   * 项目Id
   */
  projectId?: string;
  /**
   * 月度节点
   */
  monthlyNode?: string;
  /**
   * 六防类型id
   */
  sixPreventionId?: string;
  /**
   * 重大问题分类
   */
  majorProblemsTypeId?: string;
  /**
   * 发现时间
   */
  foundTime?: Date;
  /**
   * 建议质量达标率扣罚
   */
  successRate?: number;
  /**
   * 督促措施
   */
  superviseDetails?: string;
  /**
   * 最新复检进度描述(只查询)
   */
  newProgressDetail?: string;
  /**
   * 最新复检时间(只查询)
   */
  newCreationTime?: Date;
  /**
   * 进展情况
   */
  progressDetails?: string;
  /**
   * 复检人(管监)
   */
  recheckSupervisor?: string;
  recheckSupervisorName?: string;
  /**
   * 复检人(工程部)
   */
  recheckEngineer?: string;
  /**
   * 审核状态
   */
  auditStatus?: string;
  /**
   * 月度调整情况
   */
  monthlyNodeAdjust?: string;
  /**
   * 施工单位
   */
  constructionUnit?: string;
  /**
   * 施工单位类别名称
   */
  constructionUnitTypeName?: string;
  /**
   * 施工单位类别
   */
  constructionUnitType?: string;
  recheckEngineerName?: string;
  creatorUserName?: string;
  state?: string;
  firstImagePath?: string;
  overTimeEngineer?: Date;
  modelName?: string;
  /**
   * 主送单位名称
   */
  sendCompanyName?: string;
  /**
   * 抄送单位名称
   */
  copyCompanyName?: string;
  buildingModifierName?: string;
}

export class QualityHighQuestionRecheck {
  /**
   * 主键
   */
  id?: string;
  /**
   * 质量记录id
   */
  questionId?: string;
  /**
   * 项目Id
   */
  projectId?: string;
  /**
   * 问题描述
   */
  detail?: string;
  /**
   * 月度节点
   */
  monthlyNode?: string;
  /**
   * 进度情况
   */
  progressDetail?: string;
  /**
   * 完成率
   */
  finishRate?: number;
  /**
   * 删除人id
   */
  deleterUserId?: string;
  /**
   * 删除时间
   */
  deletionTime?: Date;
  /**
   * 是否删除（1：删除，0：未删除）
   */
  isDeleted?: string;
  /**
   * 创建时间
   */
  creationTime?: Date;
  /**
   * 创建人id
   */
  creatorUserId?: string;
  /**
   * 创建人id
   */
  creatorUserName?: string;

  minPathList?: any;
}

export class SafeKPICheck {
  id?: string;

  subentryId?: string;

  partId?: string;

  detail?: string;

  floorName?: string;

  overTime?: Date;

  qrCodeId?: string;

  remark?: string;

  deleterUserId?: string;

  deletionTime?: Date;

  isDeleted?: boolean;

  creationTime?: Date;

  creatorUserId?: string;

  lastModifierUserId?: string;

  lastModifierTime?: Date;

  projectId?: string;

  checkValue?: string;

  state?: string;

  isPass?: boolean;

  recheckSupervisorId?: string;

  building?: string;

  unit?: string;

  checkSite?: string;

  stages?: string;

  constructionUnit?: string;

  questionType?: string;

  recheckEngineerId?: string;

  sendOrganization?: string;

  copyOrganization?: string;

  firstImagePath?: string;

  creatorUserName?: string;

  recheckEngineerName?: string;
  recheckSupervisorName?: string;
  buildingName?: string;
  unitName?: string;
  stagesName?: string;
  subentryName?: string;
  engineeringId?: string;
  engineeringName?: string;
  gradeMethod?: string;
  gradeRemark?: string;
  modelName?: string;
}

export class SafeAppentFile {
  id?: string;

  recordId?: string;

  isDeleted?: boolean;

  creatorUserId?: string;

  creationTime?: Date;

  deleterUserId?: string;

  deletionTime?: Date;

  orderNum?: number;

  path?: string;

  minPath?: string;

  midPath?: string;
}

export class DailySafeCheck {
  id?: string;
  subentryId?: string;
  creatorUser?: string;
  partId?: string;
  detail?: string;
  floorName?: string;
  overTime?: Date;
  qrCodeId?: string;
  remark?: string;
  projectId?: string;
  checkValue?: string;
  state?: string;
  isPass?: boolean;
  recheckSupervisorId?: string;
  building?: string;
  unit?: string;
  checkSite?: string;
  stages?: string;
  constructionUnit?: string;
  recheckEngineerId?: string;
  sendOrganization?: string;
  subentryName?: string;
  engineeringId?: string;
  engineeringName?: string;
  deleterUserId?: string;
  deletionTime?: Date;
  isDeleted?: boolean;
  creatorUserId?: string;
  createrUserName?: string;
  creationTime?: Date;
  lastModifierUserId?: string;
  lastModificationTime?: Date;
  checked?: boolean;
  questionType?: string;
  firstImagePath?: string;
  recheckEngineerName?: string;
  engineerOverTime?: string;
}

export class Notice {
  public id?: string;
  public title?: string;
  public content?: string;
  public projectId?: string;
  public creator?: string;
  public isOk?: string;
  public isPublic?: boolean;
  public creatorUserId?: string;
  public creationTime?: Date;
  public lastModifierUserId?: string;
  public lastModificationTime?: Date;
  public isDeleted?: string;
  public deleterUserId?: string;
  public deletionTime?: Date;
  public publishTime?: Date;
  public publishUserId?: string;
}

export class QualityProcessRecord {
  /**
  * 主键
  */
  id?: string;
  /**
   * 质量记录id
   */
  questionId?: string;
  /**
   * 项目Id
   */
  projectId?: string;
  /**
   * 处理情况
   */
  detail?: string;
  /**
  * 创建时间
  */
  creationTime?: Date;
  /**
   * 创建人id
   */
  creatorUserId?: string;
  /**
   * 工程部复检人
   */
  recheckEngineer?: string;
  /**
   * 工程部复检时间
   */
  recheckEngineerTime?: Date;
  /**
   * 是否合格（工程部）
   */
  isPass?: boolean;
  /**
   * 复检意见（工程部）
   */
  engineerDetail?: string;
  /**
   * 管监复检人
   */
  recheckSupervisor?: string;
  /**
   * 管监复检时间
   */
  recheckSupervisorTime?: Date;
  /**
   * 是否合格（管监）
   */
  isOk?: boolean;
  /**
   * 复检意见（管监）
   */
  supervisorDetail?: string;
  /**
   * 是否删除
   */
  isDeleted?: boolean;
  /**
   * 删除人id
   */
  deleterUserId?: string;
  /**
   * 删除时间
   */
  deletionTime?: Date;
}

export class QualityDayCheck {
  id?: string;

  subentryId?: string;

  partId?: string;

  checkValue?: string;

  state?: string;

  isRectification?: boolean;

  isBroken?: boolean;

  detail?: string;

  floorName?: string;

  overTime?: Date;

  qrCodeId?: string;

  remark?: string;

  deleterUserId?: string;

  deletionTime?: Date;

  isDeleted?: boolean;

  creationTime?: Date;

  creatorUserId?: string;

  projectId?: string;

  creatorUserName?: string;

  lastModifierUserId?: string;

  lastModifierTime?: Date;

  recheckSupervisorId?: string;

  building?: string;

  unit?: string;

  checkSite?: string;

  stages?: string;

  constructionUnit?: string;

  recheckEngineerId?: string;

  sendOrganization?: string;

  copyOrganization?: string;

  engineeringName?: string;

  subentryName?: string;

  branchName?: string;

  firstImagePath?: string;

  engineeringId?: string;

  branchId?: string;

  overTimeEngineer?: Date;

  /**
   * 模型名称
   */
  modelName?: string;
  /**
   * 主送单位名称
   */
  sendCompanyName?: string;
  /**
   * 抄送单位名称
   */
  copyCompanyName?: string;

  questionGrade?: string;
  questionType?: string;
}

export class SafeProcessRecord {
  id?: string;

  questionId?: string;

  projectId?: string;

  detail?: string;

  isDeleted?: boolean;

  creatorUserId?: string;

  creationTime?: Date;

  deleterUserId?: string;

  deletionTime?: Date;

  engineerDetail?: string;

  recheckEngineer?: string;

  recheckEngineerName?: string;

  isPass?: boolean;

  supervisorDetail?: string;

  recheckSupervisor?: string;

  recheckSupervisorName?: string;

  isOk?: boolean;
}

export class Permission {
  id?: string;
  code?: string;
  url?: string;
  method?: string;
  description?: string;
  isOk?: string;
  orderNum?: number;
  sysModuleId?: string;
}

export class AllotQuestionDTO {

  id?: string;
  /**
   * 问题类型
   */
  questionType?: string;
  /**
   * 整改人
   */
  buildingModifier?: string;
  /**
   * 构建id
   */
  partId?: string;
  /**
   * 模型名称
   */
  modelName?: string;

}
