import { Component } from '@angular/core';
import { AppSessionService } from '../../shared/app-session.service';
@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = 'MenuOptionPage';
  tab2Root = 'NoticePage';
  tab3Root = 'PersonalPage';
  tab4Root = 'SecurityManageTypePage';
  tab5Root = 'ThreeModelPage';
  constructor(public  appSessionService: AppSessionService) {

  }
  ionViewDidLoad() {
  }
  isGranted(permissionName: string): boolean{
    return this.appSessionService.isGranted(permissionName)
  }
}
