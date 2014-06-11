/**editor.tools
* 工具名称
* 适用的文件
* 需加载的文件
* 快捷键
* 参数选项
*/
(function(window,$,editor){
    editor.tools.add("htmlformat",".html",function(){
        console.log("tool:htmlformat");
    });
    editor.tools.add("lessformat",".less",function(){
        console.log("tool:lessformat");
        var value = lessformat(editor.getValue());
        editor.setValue(value);
    });
    editor.tools.add("jsformat",".js",function(){
        console.log("tool:jsformat");
    });

    var jsformat = function(code){
        code = code.replace(/\{/g,"\n{\n");
        code = code.replace(/\}/g,"\n}\n");
        code = code.replace(/;/g,"\n;\n");
        code = code.replace(/\n\n/g,"\n");
        code = code.replace(/\n\n/g,"\n");
        var codes = code.split("\n"),i=0;
        code = "";
        for(i = 0;i<codes.length;i++){
            code = code + $.trim(codes[i])+"\n";
        }
        code = code.replace(/\n\n/g,"\n");
        code = code.replace(/\n\n/g,"\n");
        code = code.replace(/\n;/g,";");
        //for语句的分号不换行
        code = code.replace(/(for.+;)\n/g,"$1");
        code = code.replace(/(for.+;)\n/g,"$1");

        codes =  code.split("\n");
        code = "";
        var space = "  ";
        var tabs = 0;
        for(var x = 0;x<codes.length;x++){
            var str = codes[x];
            if(str === "{"){
                for(i = 0;i<tabs;i++){
                    code += space;
                }
                tabs += 1;
            }else if(str === "}"){
                tabs -= 1;
                for(i = 0;i<tabs;i++){
                    code += space;
                }
            }else{
                for(i = 0;i<tabs;i++){
                    code += space;
                }
            }
            code += str + "\n";
        }
        return code;
    };
    var lessformat = function(code){
        var codes = code.split("\n"),i=0;
        code = "";
        for(i = 0;i<codes.length;i++){
            code = code + $.trim(codes[i])+"\n";
        }
        code = code.replace(/\n;/g,";");
        code = code.replace(/\};/g,"}");
        codes =  code.split("\n");
        code = "";
        var space = "  ";
        var tabs = 0;
        for(var x = 0;x<codes.length;x++){
            var str = codes[x];
            if(str.length > 0 && str.lastIndexOf("{") === str.length - 1){
                for(i = 0;i<tabs;i++){
                    code += space;
                }
                tabs += 1;
            }else if(str === "}"){
                tabs -= 1;
                for(i = 0;i<tabs;i++){
                    code += space;
                }
            }else{
                for(i = 0;i<tabs;i++){
                    code += space;
                }
            }
            code += str + "\n";
        }
        return code;
    };


    editor.tools.add("js_mddoc",function(){
        var code = editor.getValue();
    })
})(window,jQuery,editor);