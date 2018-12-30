"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path="../../../../node_modules/ahoops-web/js/hoops_web_viewer.d.ts" />
var core_1 = require("@angular/core");
var http_1 = require("@angular/http");
var ModelBroweComponent = (function () {
    function ModelBroweComponent(http) {
        this.http = http;
    }
    ModelBroweComponent.prototype.ngOnInit = function () {
        // this.openStream();
    };
    ModelBroweComponent.prototype.test = function () {
        this.openStream();
    };
    ModelBroweComponent.prototype.openStream = function () {
        var url = 'http://www.bimsvc.com:11182/service';
        var body = {
            class: 'ssr_session',
            params: {}
        };
        var header = new http_1.Headers({ 'Content-Type': 'application/json' });
        var options = new http_1.RequestOptions();
        options.headers = header;
        this.http.post(url, JSON.stringify(body), options).subscribe(function (data) {
            var config = {
                containerId: 'viewerContainer',
                endpointUri: 'ws://119.23.145.88:11400',
                model: '结构模型算量配筋模型(1)~-~20171101143303',
                rendererType: 'scr',
                streamingMode: 1,
                memoryLimit: 0
            };
            var viewer = new Communicator.WebViewer(config);
            viewer.start();
        }, function (error2) {
        });
    };
    return ModelBroweComponent;
}());
ModelBroweComponent = __decorate([
    core_1.Component({
        selector: 'app-model-browe',
        templateUrl: './model-browe.component.html',
        styleUrls: ['./model-browe.component.css'],
        encapsulation: core_1.ViewEncapsulation.None
    })
], ModelBroweComponent);
exports.ModelBroweComponent = ModelBroweComponent;
