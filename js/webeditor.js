/**
* 4.18 打开和保存文件
* 打开多个文件
* 自动判断语言,加载格式文件
* 提示错误,并提示修复方法：JSHint
* 文件记录
* 另存为按钮
* 事件：bind,fire;init,open：打开文件,init,open,close,change,beforechange
* 添加快捷键
* 修改文件名称
* 格式化
* 监控文件修改
*/

(function (window, $){
    'use strict';
    var editor = {};
    editor.options = {
        codeId:"",
        defaultMode:"javascript"
    };

    /**定义语言和对应的codemirror模式和文件*/
    editor.modeList = {
        html: {
            ext: ".html",
            mode: 'htmlmixed',
            modefile: 'lib/codemirror/htmlmixed.js'
        },
        js: {
            ext: ".js",
            mode: 'javascript',
            modefile: 'lib/codemirror/javascript.js'
        },
        md:{
            ext:".md",
            mode:"markdown",
            modefile:'lib/codemirror/markdown.js'
        },
        less:{
            ext:".less",
            mode:"x-less",
            modefile:'lib/codemirror/css.js'
        }
    };
    /**打开的文件列表*/
    editor.files = []; //    { path:'', name:'', value:'', ext:''}
    /**打开过的文件夹列表*/
    editor.folders = [];
    /**当前打开的文件*/
    editor.file = null;
    editor.setOption = function(option) {
        if(!option){
            return;
        }
        var i;
        for (i in option) {
            if(option.hasOwnProperty(i)){
                editor.cm.setOption(i,option[i]);
            }
        }
    };
    /**CodeMirror对象*/
    editor.cm = null;
    function toEng(code) {
        code = code.replace(/,/g, ",");
        code = code.replace(/;/g, ";");
        code = code.replace(/(/g, "(");
        code = code.replace(/)/g, ")");
        code = code.replace(/{/g, "{");
        code = code.replace(/}/g, "}");

        code = code.replace(/>/g, ">");
        code = code.replace(/</g, "<");

        //替换引号
        code = code.replace(/'/g, "'");
        code = code.replace(/'/g, "'");
        code = code.replace(/"/g, "\"");
        code = code.replace(/"/g, "\"");

        //替换！
        //code = code.replace(/！/g, "!");

        return code;
    }
    editor.getValue = function() {
        return editor.cm ? editor.cm.getValue() : '';
    };
    editor.setValue = function(value) {
        if (editor.cm) {
            editor.cm.setValue(value);
            editor.file.value = value;
            return true;
        }else{
            console.log("cm未建立,不能设置文本！");
        }
        return false;
    };
    editor.init = function(codeid) {
        if(codeid){
            editor.options.codeId = codeid;
        }
        editor.loadModeByName(".js",function(){
            console.log('init cm;');
            editor.cm = CodeMirror.fromTextArea(document.getElementById(editor.options.codeId), {
                lineNumbers: true,
                mode: "javascript",
                indentUnit: 4,
                tabSize: 4
            });
            //editor.on("") =
            /**替换中文标点符号为英文标点符号*/
            /*editor.cm.on("beforeChange",function(cm, obj) {
                for (var i = 0; i < obj.text.length; i++) {
                    obj.text[i] = toEng(obj.text[i]);
                }
            });*/
            editor.cm.on("change",function(){
                editor.fire("change");
            });
            editor.cm.on("beforeChange",function(){editor.fire("beforeChange");});
            editor.readStage(function(){
                if(editor.stageArray.folder){
                    editor.folders = editor.stageArray.folder;
                }
                editor.fire("init");
            });
        });
    };

    editor.loadModeByName = function(filename, callback) {
        if(!filename){
            return;
        }
        callback = callback?callback:function(){};
        var ext = filename.substring(filename.lastIndexOf(".") + 1);
        var modeStage = editor.modeList[ext];
        //假如没有定义该mode，则自动创建
        if(!modeStage){
            modeStage = {
                ext: "."+ext,
                mode: ext,
                modefile: 'lib/codemirror/'+ext+'.js'
            }
            editor.modeList[ext] = modeStage;
        }

        if (modeStage && !modeStage.loaded) { //js文件没有加载
            console.log("文件模式：" + modeStage.mode);
            $.getScript(modeStage.modefile,
            function(data) {
                modeStage.loaded = true;
                console.log("加载文件完毕!" + modeStage.modefile);
                callback(modeStage);
            });
        } else {
            callback(modeStage);
        }
        return modeStage;
    }
    /**打开文件
    * @param path:文件路径
    * @param notRightNow：不立即打开(只将文件加入记录)
    */
    editor.openfile = function(path,notRhightNow) {
        if(!path){
            return;
        }
        path = path.replace(/\\/g,"/");
        for(var i = 0;i<editor.files.length;i++){
            if(editor.files[i].path === path && editor.files[i].value){
                editor.file = editor.files[i];
                editor.setValue(editor.files[i].value);
                console.log("已经打开过该文件！");
                editor.fire("open");
                return true;
            }
        }
        var name = path.substring(path.lastIndexOf("/")+1);
        editor.loadModeByName(name,
        function(modeStage) {
            if(!modeStage){
                modeStage = {};
            }
            var fileOption = {
                "path": path,
                "name": name,
                "ext": modeStage.ext
            };
            for (var i = 0; i < editor.files.length; i++) {
                if (editor.files[i].path === path) {
                    fileOption = editor.files[i];
                    break;
                }
            }
            if (i >= editor.files.length) {
                editor.files.push(fileOption);
            }
            if(!notRhightNow){
               var fs = require("fs");
               fs.readFile(path, 'utf-8',
               function(err, data) {
                if (err) {
                    console.log(err);
                    alert("打开文件错误：" + err);
                } else {
                    console.log("打开文件："+path);
                    if (editor.file && editor.cm) {
                        editor.file.value = editor.getValue();
                    }
                    editor.file = fileOption;
                    editor.setOption(modeStage);
                    editor.setValue(data);
                    editor.saveStage();
                    editor.fire("open");
                }
            });
            }
        });
    }
    /**保存文件*/
    editor.savefile = function(callback) {
        if (!editor.file) {
            return false;
        }
        callback =callback?callback:function(){};

        editor.file.value = editor.getValue();
        console.log("保存文件：" + editor.file.path);
        var fs = require("fs");
        fs.writeFile(editor.file.path, editor.file.value, 'utf-8',
        function(err) {
            if (err) {
                console.log(err);
                callback(err);
                alert("保存文件出错：" + err);
            } else {
                console.log("保存文件成功！" + editor.file.path);
                editor.fire("change");
                callback();
            }
        });
    }
    /**!保存文件*/
    editor.saveAll = function(){
    }
    /**关闭当前文件*/
    editor.closefile = function(){
        console.log("关闭当前文件");
        function closelist(err){
            if(err){
                return false;
            }
            console.log("删除记录");
            var index = editor.files.indexOf(editor.file);
            editor.files.shift(index,1);
            if(index>=editor.files.length){
                index = editor.files.length - 1;
            }else if(index<0){
                editor.fire("open");
                return;
            }
            editor.openfile(editor.files[index].path);
        }
        var value = editor.getValue();
        if(editor.file.value != value && confirm("是否保存当前修改?")){
            editor.savefile(closelist);
        }else{
            closelist();
        }
    }

    window.editor = editor;
})(window, jQuery);

/**editor data save and read*/
(function(window,$,editor){
    editor.stageKey = {};
    editor.stageArray = {};
    editor.saveStageKey = function(key,value){
        if(typeof value !== "string" || typeof key !== "string"){
            throw new Error("saveStageKey函数需要两个参数并且必须都是字符串!");
        }
        editor.stageKey[key] = value;
        editor.saveStage();
        return editor;
    }
    editor.saveStageArray = function(key,value){
        if(typeof value !== "string" || typeof key !== "string"){
            throw new Error("addStageArray函数需要两个参数并且必须都是字符串!");
        }
        if(typeof editor.stageArray[key] === "undefined"){
            editor.stageArray[key] = [];
        }
        var index =editor.stageArray[key].indexOf(value);
        if(index >= 0){
            editor.stageArray[key].shift(index,1);
        }
        editor.stageArray[key].push(value);
        editor.saveStage();
        return editor;
    }
    editor.deleteStageArray = function(key,value){
        if(typeof value !== "string"){
            throw new Error("deleteStageArray的参数必须是字符串类型!");
        }
        if(typeof editor.stageArray[key] === "undefined"){
            return editor;
        }
        if(typeof value === "undefined"){
            editor.stageArray[key] = [];
        }else{
            var index =editor.stageArray[key].indexOf(value);
            if(index >= 0){
                editor.stageArray[key].shift(index,1);
            }
        }
        editor.saveStage();
        return editor;
    }
    /**读取项目状态*/
    editor.readStage = function(callback){
        var place = process.execPath.substring(0,process.execPath.lastIndexOf("\\"))+"\\webeditor.json";
        var fs = require("fs");
        fs.readFile(place,"utf-8",function(err,data){
            if(err){
                console.log(err);
                callback(err);
            }
            else{
                try{
                    data = data.replace(/\\/g,"\\\\");
                    data = $.parseJSON(data);
                    if(data && data.files){
                        for(var i = 0;i<data.files.length;i++){
                            editor.openfile(data.files[i],true);
                        }
                        if(data.file){
                            editor.openfile(data.file);
                        }
                        if(data.stageKey){
                            editor.stageKey = data.stageKey;
                        }
                        if(data.stageArray){
                            editor.stageArray = data.stageArray;
                        }
                    }
                    console.log(data);
                    callback();
                    return data;
                }catch(err){
                    console.log(data);
                    console.log(err);
                    callback(err);
                }
            }
        });
        return editor;
    }
    /**保存项目状态*/
    editor.saveStage = function(){
        var place = process.execPath.substring(0,process.execPath.lastIndexOf("\\"))+"\\webeditor.json";
        //打开的文件列表
        var data = '"files":[';
        for(var i = 0;i<editor.files.length;i++){
            data += '"'+editor.files[i].path+'"';
            if(i <editor.files.length - 1){
                data += ',';
            }
        }
        data += ']';
        //当前正在编辑的文件
        if(editor.file){
            data += ',"file":"'+editor.file.path+'"';
        }
        //保存的状态数据
        data += ',"stageKey":{';
        for(i in editor.stageKey){
            data += '"'+i+'":"'+editor.stageKey[i]+'",';
        }
        if(data.charAt(data.length -1 ) == ","){
            data = data.substring(0,data.length-1);
        }
        data += "}";

        //状态数组
        data += ',"stageArray":{';
        for(i in editor.stageArray){
            var array = editor.stageArray[i];
            data += '"'+i+'":[';
            for(var j = 0;j<array.length;j++){
                if(j>0){
                    data += ",";
                }
                data +='"'+array[j]+'"';
            }
            data += "],";
        }
        if(data.charAt(data.length -1 ) == ","){
            data = data.substring(0,data.length-1);
        }
        data += "}";
        data = '{'+data+'}';
        fs = require("fs");
        fs.writeFile(place,data,"utf-8");
        console.log(data);
    }
})(window,jQuery,editor);

/**editor event*/
(function(window,$,editor){
    editor._listeners = {};
    editor.bind = function(type,func){
        var listeners = editor._listeners;
        if(typeof listeners[type] === "undefined"){
            listeners[type] = [];
        } 
        if(typeof func === "function"){
            listeners[type].push(func);
        }
        return editor;
    }
    editor.fire = function(type){
        console.log("fire event: "+type);
        var arrayEvent = editor._listeners[type];
        if (arrayEvent instanceof Array) {
            for (var i=0, length=arrayEvent.length; i<length; i+=1) {
                if (typeof arrayEvent[i] === "function") {
                    arrayEvent[i]({ type: type });    
                }
            }
        }    
        return editor;
    }
    editor.unbind = function(type,func){
        var arrayEvent = eidtor._listeners[type];
        if (typeof type === "string" && arrayEvent instanceof Array) {
            if (typeof func === "function") {
                // 清除当前type类型事件下对应fn方法
                for (var i=0, length=arrayEvent.length; i<length; i+=1){
                    if (arrayEvent[i] === func){
                        eidtor._listeners[type].splice(i, 1);
                        break;
                    }
                }
            } else {
                // 如果仅仅参数type, 或参数fn邪魔外道,则所有type类型事件清除
                delete eidtor._listeners[type];
            }
        }
        return eidtor;
    }

    editor.bind("change",function(){
        console.log("file changed");
        if(editor.getValue() != editor.file.value){
            editor.file.changed = true;
        }else{
            editor.file.changed = false;
        }
    })
})(window,jQuery,editor);


/**editor.tools
* 工具名称
* 适用的文件
* 需加载的文件
* 快捷键
* 参数选项
*/
(function(window,$,editor){
    editor.tools = {
        _data:[]//工具栏的工具
    };
    var tools = editor.tools;
    /**todo:显示工具栏*/
    tools.showTools = function() {
    }
    /**todo:更新工具栏*/
    tools.updateTools = function() {}
    /**todo:隐藏工具栏*/
    tools.hideTools = function() {}
    /**添加工具
    *ext:文件扩展名
    *func：执行内容*/
    tools.add = function(toolname, ext, func ,key) {
        var data = tools._data;
        for (var i = 0; i < data.length; i++) {
            if (data[i].toolname === toolname) {
                console.log("已经存在该工具名称,请改用其他工具名称！");
                return false;
            }
        }
        if(!toolname || !func){
            return false;
        }
        if(!ext){
            ext = "*";
        }
        data.push({
            "toolname": toolname,
            "ext": ext,
            "func": func
        });
    }

    /**todo:取消工具*/
    tools.untool = function(toolname) {}
    
    tools.call = function(toolname){
        for(var i = 0;i<tools._data.length;i++){
            var data= tools._data[i];
            if(toolname === data.toolname){
                data.func();
            }
        }
    }
    editor.bind("open",function(){
        var html = "";
        for(var i = 0;i<tools._data.length;i++){
            var data= tools._data[i];
            if(data.ext === "*" || data.ext === editor.file.ext){
                html+= "<p toolname='"+data.toolname+"'>"+data.toolname+"</p>"
            }
        }
        $(".tools").html(html);
    });
    $(document).ready(function(){
        $(".tools").on("click",function(e){
            var t = $(e.target);
            var toolname = t.attr("toolname");
            if(toolname.length && toolname.length > 0){
                editor.tools.call(toolname);
            }
        });
    });
})(window,jQuery,editor);