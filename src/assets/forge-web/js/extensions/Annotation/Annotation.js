﻿///////////////////////////////////////////////////////////////////////////////
// Annotation viewer Extension
// by Philippe Leefsma, March 2015
//
///////////////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

Autodesk.ADN.Viewing.Extension.Annotation = function (viewer, options) {

    // base constructor
    Autodesk.Viewing.Extension.call(this, viewer, options);

    ///////////////////////////////////////////////////////////////////////////
    // Private members
    //
    ///////////////////////////////////////////////////////////////////////////
    var ModeEnum = {

        kModeIddle: 0,
        kModeInitDrag: 1,
        kModeDrag: 2
    };

    var _mode = ModeEnum.kModeIddle;

    var _selectedMarkUpId = null;

    var _currentMarkUp = null;

    var _propComboId = null;

    var _markUps = {};

    var _self = this;

    var _propName = '';
    var markUp_s = '';
    var overlayDivClass = '';
    var currentModel;
    ///////////////////////////////////////////////////////////////////////////
    // load callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.load = function () {
        var urlJs = 'extensions/Annotation/raphael-min.js';
        var dependencies = [urlJs];
        Autodesk.Viewing.loadDependency('Annotation', dependencies, function () {
            // context menu stuff
            Autodesk.ADN.Viewing.Extension.MarkUpContextMenu = function (viewer) {
                Autodesk.Viewing.Extensions.ViewerObjectContextMenu.call(
                    this, viewer);
            };

            Autodesk.ADN.Viewing.Extension.MarkUpContextMenu.prototype =
                Object.create(Autodesk.Viewing.Extensions.ViewerObjectContextMenu.prototype);

            Autodesk.ADN.Viewing.Extension.MarkUpContextMenu.prototype.constructor =
                Autodesk.ADN.Viewing.Extension.MarkUpContextMenu;

            Autodesk.ADN.Viewing.Extension.MarkUpContextMenu.prototype.buildMenu =

                function (event, status) {

                    if (typeof event.markUp !== 'undefined') {

                        var menu = [{

                            title: "Delete annotation",
                            target: function () {
                                deleteMarkUp(event.markUp);
                            }
                        }];

                        return menu;
                    }
                    else {

                        var menu = Autodesk.Viewing.Extensions.ViewerObjectContextMenu.
                            prototype.buildMenu.call(
                                this, event, status);
                        return menu;
                    }
                };

            _self.viewer.setContextMenu(
                new Autodesk.ADN.Viewing.Extension.MarkUpContextMenu(
                    _self.viewer));

            viewer.addEventListener(
                Autodesk.Viewing.EXPLODE_CHANGE_EVENT,
                _self.onExplode);

            _self.createOverlay(function (overlay) {
                _self.overlay = overlay;
            }, overlayDivClass);

            //activateAnnotate();

            /* getAllLeafComponents(function (components) {
 
                 getAvailableProperties(components, function (properties) {
 
                     var menuItems = [];
 
                     var labelIdx = 0;
 
                     properties.forEach(function (property, idx) {
 
                         var lproperty = property.toLowerCase();
 
                         if (lproperty === 'label' || lproperty === 'name') {
                             labelIdx = idx;
                             _propName = property;
                         }
 
                         menuItems.push({
                             label: property,
                             handler: function () {
                                 _propName = property;
                             }
                         })
                     });
 
                     _propComboId = createDropdownMenu(
                       'Annotation Property',
                       { top: 10, left: 10 },
                       menuItems,
                       labelIdx);
                 });
             });*/
            console.log("Autodesk.ADN.Viewing.Extension.Annotation loaded");
        });

        return true;
    };
    // TODO yuan
    _self.setModel = function (model) {
        _self.currentModel = model;
    }

    ///////////////////////////////////////////////////////////////////////////
    // 实时讨论
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.chat = function (id, dbid, fragId, textname, typeUrl, spanClassName, iconColor, title, clickEventMethod) {
        overlayDivClass = 'discussDivClass';
        _self.load();
        markUp_s = newMarkUp(dbid, fragId);
        _markUps[markUp_s.divId] = markUp_s;
        var title = title;
        // var iconColor ="";
        var spanId = "span_" + textname;
        var html = '';
        // TODO  yuan 20181218
        // if(typeof(clickEventMethod)=='undefined'){
        // 	// pc端
        // 	html += '<div  id="a_'+id+'" title="'+title+'" onclick="viewChatShow('+id+')">';
        // }else{
        // 	// 移动端
        // 	html += '<div  id="a_'+id+'" title="'+title+'" onclick="'+clickEventMethod+'('+id+')">';
        // }
        html += '<div  id="a_' + id + '" title="' + title + '">';
        // if(spanClassName == "textname_clo" || spanClassName == "mobile_textname_clo"){
        // 	iconColor = "red_arrow";
        // }else{
        // 	iconColor = "green_arrow";
        // }

        // 链接传入方式
        var regex = new RegExp("^((http|https)?://)");
        if (regex.test(typeUrl)) {
            html += '<div class="tooltip-arrow ' + iconColor + '"></div>';/*'<img  src="'+typeUrl+'"/>'+*/
        } else {
            html += '<div class="tooltip-arrow ' + iconColor + '"></div>';/*'<img  src=".'+typeUrl+'"/>'+*/
        }
        html += '<span id=' + spanId + ' class="m-chatViewName ' + spanClassName + '">' + textname + '</span>' +
            '</div>' +
            '<div class="g-gif-div" name="comment_' + id + '">' +
            '</div>'
        $('#' + markUp_s.divId).html(html);
        $('#' + 'a_' + id).on('click', (e) => {
            clickEventMethod.call(this, e.currentTarget.id.substring(2));
        })
        $('#' + markUp_s.divId).attr("name", "viewChatTags");
        $('#' + markUp_s.divId).css(
            {
                'visibility': 'visible',
                'z-index': '5',
                'cursor': 'pointer',
                "pointer-events": "auto"
            });
        // 设置span的样式
    	/*$('#span_'+textname).css(
    	{
    		'font-size': '13px',
    		'font-weight' : 'bold',
    		'color' : 'white',
    		'position':'relative',
    		'left':'-23px',
    		'top':'-15px'
    	});*/

        //画完markup  需要更新操作
        _self.updateMarkUp(markUp_s);
        $('#' + markUp_s.divId).click(function () { });
        //监听事件   随着camera变化而变化   放入委托事件
        viewer.addEventListener(Autodesk.Viewing.CAMERA_CHANGE_EVENT, _self.onCameraChanged);
    };

    ///////////////////////////////////////////////////////////////////////////
    // 移动端全景图——点击标记事件
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.do_mobile = function (id, dbid, fragId, textname, typeUrl) {
        overlayDivClass = 'overlayDivClass';
        _self.load();
        markUp_s = newMarkUp(dbid, fragId);
        _markUps[markUp_s.divId] = markUp_s;
        mobilePanorama.value = textname;
        var imgPath = publicJS.tomcat_url;
        var title = '';
        if (typeUrl == '/img/modeltool/red.png') {
            title = '安全';
        } else if (typeUrl == '/img/modeltool/green.png') {
            title = '进度';
        } else if (typeUrl == '/img/modeltool/blue.png') {
            title = '质量';
        }
        $('#' + markUp_s.divId).html('<a id="a_' + id + '" title="' + title + '" onclick="mobilePanorama.getImage(' + mobilePanorama.value + ')"><img  src="' + imgPath + typeUrl + '"/><a/>');
        $('#' + markUp_s.divId).attr("name", "360ViewTags");
        $('#' + markUp_s.divId).css(
            {
                'visibility': 'visible',
                'z-index': '1000000000',
                'cursor': 'pointer',
                "pointer-events": "auto"
            });
        //画完markup  需要更新操作
        _self.updateMarkUp(markUp_s);
        $('#' + markUp_s.divId).click(function () { });
        //监听事件   随着camera变化而变化   放入委托事件
        viewer.addEventListener(Autodesk.Viewing.CAMERA_CHANGE_EVENT, _self.onCameraChanged);
    };

    //定义一个公用的对方法   调用自己的函数使得外面的函数调用自己的私用函数
    _self.do = function (id, dbid, fragId, textname, typeUrl) {
        overlayDivClass = 'overlayDivClass';
        _self.load();
        markUp_s = newMarkUp(dbid, fragId);
        _markUps[markUp_s.divId] = markUp_s;
        var value = textname;
        var head = window.location.protocol;
        var body = window.location.host;
        //var imgPath = head+"//"+body;
        var imgPath = publicJS.tomcat_url;
        var title = '';
        if (typeUrl == 'img/modeltool/red.png' || typeUrl == '/img/modeltool/red.png' || typeUrl == '/bim-bdip-cloud-home-biz-web/img/modeltool/red.png') {
            title = '安全';
        } else if (typeUrl == 'img/modeltool/green.png' || typeUrl == '/img/modeltool/green.png' || typeUrl == '/bim-bdip-cloud-home-biz-web/img/modeltool/green.png') {
            title = '进度';
        } else if (typeUrl == 'img/modeltool/blue.png' || typeUrl == '/img/modeltool/blue.png' || typeUrl == '/bim-bdip-cloud-home-biz-web/img/modeltool/blue.png') {
            title = '质量';
        }
        $('#' + markUp_s.divId).html('<a id="a_' + id + '" title="' + title + '" onclick="show1(' + value + ')"><img  src="' + imgPath + typeUrl + '"/><a/>');
        $('#' + markUp_s.divId).attr("name", "360ViewTags");
        $('#' + markUp_s.divId).css(
            {
                'visibility': 'visible',
                'z-index': '1000000000',
                'cursor': 'pointer',
                "pointer-events": "auto"
            });

        //mark_up = markUp;
        //画完markup  需要更新操作
        _self.updateMarkUp(markUp_s);
        $('#' + markUp_s.divId).click(function () { });

        //监听事件   随着camera变化而变化   放入委托事件
        viewer.addEventListener(Autodesk.Viewing.CAMERA_CHANGE_EVENT, _self.onCameraChanged);
    };

    _self.dos = function (dbid, fragId, textname) {
        //var dbId =6296;
        //var fragId =191;

        markUp_s = newMarkUp(dbid, fragId);
        _markUps[markUp_s.divId] = markUp_s;
        //newMarkUptext(markUp.dbId,textname);
        var value = textname;
        //$('#' + markUp.divId).html('<a href="http://www.baidu.com">'+value+'</a>');
        $('#' + markUp_s.divId).html('');

        $('#' + markUp_s.divId).css(
            {
                'visibility': 'visible',
                'z-index': '1000000000',
                'cursor': 'pointer',
                "pointer-events": "auto"
            });
        //mark_up = markUp;
        //画完markup  需要更新操作
        _self.updateMarkUp(markUp_s);
        //console.log("markUp_s:"+markUp_s);
        $('#' + markUp_s.divId).click(function () {

        });


        //监听事件   随着camera变化而变化   放入委托事件
        viewer.addEventListener(Autodesk.Viewing.CAMERA_CHANGE_EVENT, _self.onCameraChanged);
        // alert(12);
    };

    _self.loadCustomAttrAnnotation = function (dbid, fragId) {
        _self.load();
        markUp_s = newMarkUp(dbid, fragId);
        _markUps[markUp_s.divId] = markUp_s;
        var imgPath = publicJS.tomcat_url + "/img/modeltool/red.png";
        $('#' + markUp_s.divId).html('<a id="custom_' + dbid + '" refdbid="' + dbid + '" onclick="bimCustomAttr.selectSelf(this)"><img src="' + imgPath + '"/><a/>');
        $('#' + markUp_s.divId).attr("name", "customattr_annotation");
        $('#' + markUp_s.divId).css(
            {
                'visibility': 'visible',
                'z-index': '1000000000',
                'cursor': 'pointer',
                "pointer-events": "auto"
            });

        //mark_up = markUp;
        //画完markup  需要更新操作
        _self.updateMarkUp(markUp_s);
        $('#' + markUp_s.divId).click(function () { });

        //监听事件   随着camera变化而变化   放入委托事件
        viewer.addEventListener(Autodesk.Viewing.CAMERA_CHANGE_EVENT, _self.onCameraChanged);
    };
    ///////////////////////////////////////////////////////////////////////////
    // creates new markuptxt
    //
    ///////////////////////////////////////////////////////////////////////////
    function newMarkUptext(markupdbId, textname) {
        //画出数字
        viewer.getProperties(markupdbId, function (result) {

            if (result.properties) {

                var properties = result.properties.filter(
                    function (prop) {

                        return (prop.displayName === _propName);
                    });

                var value = textname;

                if (properties.length) {

                    value = properties[0].displayValue;
                }

                $('#' + markUp_s.divId).text(value);

                $('#' + markUp_s.divId).css(
                    {
                        'visibility': 'visible'
                    });
            }
        });
    }
    ///////////////////////////////////////////////////////////////////////////
    // creates new markup
    //
    ///////////////////////////////////////////////////////////////////////////
    function newMarkUp(dbId, fragId) {

        var divId = guid();

        $(viewer.container).append(
            '<div id="' + divId + '" class = "pnamed ths-markup"></div>');

        $('#' + divId).css({

            'position': 'absolute',
            'font-family': 'arial',
            'color': '#ED1111',
            'font-size': '20px',
            'visibility': 'hidden',
            'pointer-events': 'none'
        });

        var path = _self.overlay.path("M 0,0 L 0,0");

        path.attr({
            'stroke-width': '0',
            'opacity': '1'
        });

        var connector = _self.overlay.circle(1, 1, 0.0);

        connector.attr("fill", "blue");

        var markUp_s = {

            dbId: dbId,
            fragId: fragId,
            line: path,
            divId: divId,
            textPos: "123",
            connector: connector,
            attachmentPoint: null,
            position: _self.getMeshPosition(fragId)
        };

        //  console.log(markUp_s);



        $('#' + divId).on('contextmenu',
            function (e) {

                e.preventDefault();

                e.markUp_s = _markUps[_selectedMarkUpId];

                if (e.markUp_s.screenPoint.y - e.markUp_s.textPos.y < 0) {

                    e.clientX = $('#' + divId).offset().left;
                    e.clientY = $('#' + divId).offset().top + 25;
                }
                else {

                    e.clientX = $('#' + divId).offset().left;
                    e.clientY = $('#' + divId).offset().top - 25;
                }

                viewer.contextMenu.show(e);
            });

        return markUp_s;
    }





    ///////////////////////////////////////////////////////////////////////////
    // normalize screen coordinates
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.normalizeCoords = function (screenPoint) {

        var viewport =
            viewer.navigation.getScreenViewport();

        var n = {
            x: (screenPoint.x - viewport.left) / viewport.width,
            y: (screenPoint.y - viewport.top) / viewport.height
        };

        return n;
    }

    ///////////////////////////////////////////////////////////////////////////
    // world -> screen coords conversion
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.worldToScreen = function (worldPoint, camera) {

        var p = new THREE.Vector4();

        p.x = worldPoint.x;
        p.y = worldPoint.y;
        p.z = worldPoint.z;
        p.w = 1;

        p.applyMatrix4(camera.matrixWorldInverse);
        p.applyMatrix4(camera.projectionMatrix);

        // Don't want to mirror values with negative z (behind camera)
        // if camera is inside the bounding box,
        // better to throw markers to the screen sides.
        if (p.w > 0) {
            p.x /= p.w;
            p.y /= p.w;
            p.z /= p.w;
        }

        // This one is multiplying by width/2 and â€“height/2,
        // and offsetting by canvas location
        var point = viewer.impl.viewportToClient(p.x, p.y);

        // snap to the center of the pixel
        point.x = Math.floor(point.x) + 0.5;
        point.y = Math.floor(point.y) + 0.5;

        return point;
    }

    ///////////////////////////////////////////////////////////////////////////
    // screen to world coordinates conversion
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.screenToWorld = function (event) {

        var screenPoint = {
            x: event.clientX,
            y: event.clientY
        };

        var viewport =
            viewer.navigation.getScreenViewport();

        var n = {
            x: (screenPoint.x - viewport.left) / viewport.width,
            y: (screenPoint.y - viewport.top) / viewport.height
        };

        return viewer.navigation.getWorldPoint(n.x, n.y);
    }

    ///////////////////////////////////////////////////////////////////////////
    // camera changed callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.onCameraChanged = function (event) {

        _self.updateMarkUps();
    };

    ///////////////////////////////////////////////////////////////////////////
    // explode changed callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.onExplode = function (event) {

        _self.updateMarkUps();
    };

    ///////////////////////////////////////////////////////////////////////////
    // update markUp graphics
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.updateMarkUp = function (markUp) {

        var pos = _self.getMeshPosition(
            markUp.fragId);

        //  console.log(pos);
        //alert("x:"+pos.x+",y:"+pos.y+",z:"+pos.z);
        var attachmentPoint = {
            x: pos.x,
            y: pos.y,
            z: pos.z
        };

        var screenPoint = _self.worldToScreen(
            attachmentPoint,
            viewer.getCamera());

        var offset = getClientOffset(
            viewer.container);

        markUp.screenPoint = screenPoint;
        markUp.textPos = screenPoint;
        markUp.attachmentPoint = screenPoint;


        markUp.connector.attr({
            cx: screenPoint.x,
            cy: screenPoint.y
        });

        markUp.line.attr({
            path:
                "M" + (screenPoint.x) +
                "," + (screenPoint.y) +
                "L" + (markUp.textPos.x - offset.x) +
                "," + (markUp.textPos.y - offset.y)
        });

        var divYOffset = 30;

        if (screenPoint.y - markUp.textPos.y < 0)
            divYOffset = 0;
        var w = $('#' + markUp.divId).width();
        //alert(markUp.textPos.x+"---"+offset.x+"----"+w);
        // TODO yuan 20181218
        $('#' + markUp.divId).css({
            'left': (markUp.textPos.x - w * 0.25).toString() + "px",
            'top': (markUp.textPos.y - divYOffset).toString() + "px"
        });
    };

    _self.updateMarkUps = function () {

        for (var key in _markUps) {

            _self.updateMarkUp(_markUps[key]);
        }
    }

    ///////////////////////////////////////////////////////////////////////////
    // create overlay 2d canvas
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.createOverlay = function (callback, overlayDivClass) {

        if (typeof Raphael === 'undefined') {
            callback(null);
        }

        var overlayDiv = document.createElement("div");

        overlayDiv.id = 'overlayDivId';
        overlayDiv.setAttribute("class", overlayDivClass);

        /* viewer.container.appendChild(
             overlayDiv);*/

        overlayDiv.style.top = "0";
        overlayDiv.style.left = "0";
        overlayDiv.style.right = "0";
        overlayDiv.style.bottom = "0";
        overlayDiv.style.position = "absolute";
        overlayDiv.style.pointerEvents = "none";

        var overlay = new Raphael(
            overlayDiv,
            overlayDiv.clientWidth,
            overlayDiv.clientHeight);
        //console.log(overlay);
        callback(overlay);
    }

    ///////////////////////////////////////////////////////////////////////////
    // get mesh postion
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.getMeshPosition = function (fragId) {
        // var mesh = viewer.impl.getRenderProxy(
        //   viewer.model,
        //   fragId);
        // TODO yuanmh
        var mesh = viewer.impl.getRenderProxy(
            _self.currentModel,
            fragId);

        var fraglistids = [fragId];
        // TODO yuanmh
        // var bBox = _self.getModifiedWorldBoundingBox(fraglistids,viewer.model.getFragmentList());
        var bBox = _self.getModifiedWorldBoundingBox(fraglistids, _self.currentModel.getFragmentList());
        var pos = new THREE.Vector3((bBox.max.x + bBox.min.x) / 2.0,
            (bBox.max.y + bBox.min.y) / 2.0,
            (bBox.max.z + bBox.min.z) / 2.0);
        return pos;
    }



    _self.getModifiedWorldBoundingBox = function (fragIds, fragList) {

        var fragbBox = new THREE.Box3();
        var nodebBox = new THREE.Box3();

        fragIds.forEach(function (fragId) {
            fragList.getWorldBounds(fragId, fragbBox);
            nodebBox.union(fragbBox);
        });
        return nodebBox;
    }

    ///////////////////////////////////////////////////////////////////////////
    // return mouse position
    //
    ///////////////////////////////////////////////////////////////////////////
    function getClientOffset(element) {

        var x = 0;
        var y = 0;

        while (element) {

            x += element.offsetLeft -
                element.scrollLeft +
                element.clientLeft;

            y += element.offsetTop -
                element.scrollTop +
                element.clientTop;

            element = element.offsetParent;
        }

        return { x: x, y: y };
    }

    ///////////////////////////////////////////////////////////////////////////
    // Generate GUID
    //
    ///////////////////////////////////////////////////////////////////////////
    function guid() {

        var d = new Date().getTime();

        var guid = 'xxxx-xxxx-xxxx-xxxx-xxxx'.replace(
            /[xy]/g,
            function (c) {
                var r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
            });
        // var guid = "pname";
        return guid;
    }

    ///////////////////////////////////////////////////////////////////////////
    // Gets all existing properties from components list
    //
    ///////////////////////////////////////////////////////////////////////////
    function getAvailableProperties(components, onResult) {

        var propertiesMap = {};

        async.each(components,

            function (component, callback) {

                viewer.getProperties(component.dbId, function (result) {

                    for (var i = 0; i < result.properties.length; i++) {

                        var prop = result.properties[i];

                        propertiesMap[prop.displayName] = {};
                    }

                    callback();
                });
            },
            function (err) {

                onResult(Object.keys(propertiesMap));
            });
    }

    ///////////////////////////////////////////////////////////////////////////
    // Get all leaf components
    //
    ///////////////////////////////////////////////////////////////////////////
    function getAllLeafComponents(callback) {

        function getLeafComponentsRec(parent) {

            var components = [];

            if (typeof parent.children !== "undefined") {

                var children = parent.children;

                for (var i = 0; i < children.length; i++) {

                    var child = children[i];

                    if (typeof child.children !== "undefined") {

                        var subComps = getLeafComponentsRec(child);

                        components.push.apply(components, subComps);
                    }
                    else {
                        components.push(child);
                    }
                }
            }

            return components;
        }

        viewer.getObjectTree(function (result) {

            var allLeafComponents = getLeafComponentsRec(result.getRootId());

            callback(allLeafComponents);
        });
    }

    ///////////////////////////////////////////////////////////////////////////
    // Creates dropdown menu from input
    //
    ///////////////////////////////////////////////////////////////////////////
    function createDropdownMenu(title, pos, menuItems, selectedItemIdx) {

        var labelId = guid();

        var menuId = guid();

        var listId = guid();

        var html = [
            '<div id ="' + menuId + '" class="dropdown chart-dropdown">',
            '<button class="btn btn-default dropdown-toggle" type="button" data-toggle="dropdown">',
            '<label id="' + labelId + '" style="font: normal 14px Times New Roman">' + title + '</label>',
            '<span class="caret"></span>',
            '</button>',
            '<ul id="' + listId + '"class="dropdown-menu scrollable-menu" >',
            '</ul>',
            '</div>'
        ].join('\n');

        $(viewer.container).append(html);

        $('#' + menuId).css({

            'top': pos.top + 'px',
            'left': pos.left + 'px'
        });

        $('#' + labelId).text(title + ': ' + menuItems[selectedItemIdx || 0].label);

        menuItems.forEach(function (menuItem) {

            var itemId = guid();

            var itemHtml = '<li id="' + itemId + '"><a href="">' + menuItem.label + '</a></li>';

            $('#' + listId).append(itemHtml);

            $('#' + itemId).click(function (event) {

                event.preventDefault();

                menuItem.handler();

                $('#' + labelId).text(title + ': ' + menuItem.label);
            });
        });

        return menuId;
    }

    ///////////////////////////////////////////////////////////////////////////
    // dynamic css styles
    //
    ///////////////////////////////////////////////////////////////////////////
    var css = [

        'canvas.graph {',
        'top:10px;',
        'left:30px;',
        'width:300px;',
        'height:300px;',
        'position:absolute;',
        'overflow:hidden;',
        '}',

        'div.chart-dropdown {',
        //'position: absolute;',
        '}',

        '.scrollable-menu {',
        'height: auto;',
        'max-height: 300px;',
        'overflow-x: hidden;',
        'overflow-y: scroll;',
        '}',

    ].join('\n');

    $('<style type="text/css">' + css + '</style>').appendTo('head');
};

Autodesk.ADN.Viewing.Extension.Annotation.prototype =
    Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.Annotation.prototype.constructor =
    Autodesk.ADN.Viewing.Extension.Annotation;

Autodesk.Viewing.theExtensionManager.registerExtension(
    'Autodesk.ADN.Viewing.Extension.Annotation',
    Autodesk.ADN.Viewing.Extension.Annotation);