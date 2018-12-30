import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-need-todo',
  templateUrl: 'need-todo.html',
})
export class NeedTodoPage {

  public todos: string = 'needDo';

  todoList = [];

  doneList = [];

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad NeedTodoPage');

    this.todoList = [
      {name: '检查问题检查问题检查问题', date: new Date()},
      {name: '检查问题检查问题检查问题', date: new Date()},
      {name: '检查问题检查问题检查问题', date: new Date()},
    ]
    this.doneList = [
      {name: '已完成检查问题检查问题', date: new Date()},
      {name: '已完成检查问题检查问题', date: new Date()},
      {name: '已完成检查问题检查问题', date: new Date()},
    ]
  }

  goBack() {
    this.navCtrl.push('MenuOptionPage')
  }

}
