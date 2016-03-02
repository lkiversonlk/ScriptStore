ScriptStore
===========

广告主页面脚本管理服务,接口采用Restful风格设计.

接口以资源为单位组织如下:

* 获取指定id的资源

> GET  /model/:id?select=[]

返回指定id的资源,select列出了需要返回的属性列表

* 创建资源

> POST /model
> Content-Type : Application/json
> {
>   data : obj
> }


scriptHistory
-------------

* GET  /scriptHistory/:id?select=[
返回指定id的scriptHistory, 如果不带参数,表示取出对象所有属性,带有参数时,表示需要返回的属性

* GET  /scriptHistory?select=[]&query={}
返回scriptHistory列表,select参数表示要显示的属性列表,query表示查询条件

* POST /scriptHistory