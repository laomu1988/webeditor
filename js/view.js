(function(window,$,editor){
  function getChild(path,callback){
    var fs = require("fs");
    var files = [];
    var a = fs.readdirSync(path);
    console.log(a);
    for (var i = 0; i < a.length; i++) {
        var p = (path.charAt(path.length-1)=="/"?path:path+"/") + a[i];
        try{
          var stat = fs.statSync(p);
          //console.log(p);
          //console.log(stat);
          files.push({"path":p,"file":a[i],"isDic":stat.isDirectory(),"isFile":stat.isFile()})
        }catch(err){
          console.log(err);
        }
    }
    files = files.sort(function(a,b){
      return a.isFile?1:-1;
    })
    var outStr = "<ul class=\"jqueryFileTree\" style=\"display: none;\">";
    for(var i = 0;i<files.length;i++){
        if(files[i].isDic){
            outStr += "<ul class='jqueryFileTree'><li class='directory'><a rel='"+files[i].path+"'>"+files[i].file+"</a></li></ul>";
        }else{
            outStr += "<li class='file ext_"+files[i].file.substring(files[i].file.lastIndexOf(".")+1)+"'><a rel='"+files[i].path+"'>"+files[i].file+"</a></li>";
        }
    }
    outStr+="</ul>";
    callback(outStr);
    return outStr;
  };
  editor.bind("init",
    function(){
      $(".editorArea").show();
      if(editor.stageArray.folder){
        openfolder(editor.stageArray.folder[editor.stageArray.folder.length - 1]);//打开最后一次打开的文件夹
      }
      if(editor.file){
         openfile(editor.file);
      }

    }
  );
  editor.bind("open",function(){
      updateFileList();
      changeSize();
      $(".openFileList span").click(function(event){
        var t = $(event.target);
        console.log(t);
        openfile(t.attr("path"));
      });
  });
  editor.bind("change",function(){
    updateFileList();
  });
  editor.init("code");
  /*打开文件*/
  function openfile(filename){
    try{
      filename = filename.replace(/\\/,"/");
      editor.openfile(filename);
    }catch(err){
      console.log(err);
    }
  }
  /**打开文件夹*/
  function openfolder(folder){
    folder = folder.replace(/\\/,"/");
    $('#myfileTree').fileTree({ root: folder,script: getChild }, function(file) { 
      openfile(file);
    });
    editor.saveStageArray("folder",folder);
  }
  /**更新打开文件视图*/
  function updateFileList(){
      var html = "";
      for(var i = 0;i<editor.files.length;i++){
        var file = editor.files[i];
        if(file !== editor.file){
          html += "<span path='"+editor.files[i].path+"'>";
        }else{
          html += "<span class='opened' path='"+editor.files[i].path+"'>";
        }
        html += editor.files[i].name;
        if(editor.files[i].changed){
          html+="*";
        }
        html += "</span>";
      }
      $(".openFileList").html(html);
  }

  $("#selectFolder").change(
      function() {
        var folder = $("#selectFolder").val();
        if (folder.length <= 0) {
            return;
        }
        $('#myfileTree').fileTree({ root: folder,script: getChild }, function(file) { 
          openfile(file);
        });
        editor.saveStageArray("folder",folder);
      }
  );
    /**打开文件事件*/
    $("#filename").change(function() {
        var filename = $("#filename").val();
        if (filename.length <= 0) {
            return;
        }
        openfile(filename);
    });
    /**保存文件*/
    $("#savefile").click(function() {
        editor.savefile();
    })
    $("#closefile").click(function() {
        editor.closefile();
    })

  function changeSize(){
    console.log("changesize");
    var width = $(window).width(),height = $(window).height();
    width = width>600?width:600;
    height = height>600?height:600;
    height = height - 10;
    $("body").width(width);
    $("body").height(height);
    $(".CodeMirror").height(height - 45);
    $(".CodeMirror").width(width - 400);
  }
  $(window).resize(function(){
    changeSize();
  });
  $(window).ready(function(){
    changeSize();
  });
})(window,jQuery,editor);