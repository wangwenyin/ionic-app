import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserSelectComponent } from './user-select/user-select';
import { SignUserSelectComponent } from './sign-user-select/sign-user-select';

@NgModule({
	declarations: [UserSelectComponent,
    SignUserSelectComponent,
    ],
	imports: [IonicPageModule],
	exports: [UserSelectComponent,
    SignUserSelectComponent,
    ]
})
export class ComponentsModule {}
