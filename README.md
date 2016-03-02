ScriptStore
===========

广告主页面脚本管理服务,接口采用Restful风格设计，接下来以资源为单位介绍对应的接口。

scriptActive, scriptHistory, trigger
--------------

这三个资源的接口形式和含义相同，接口组织如下:

* 获取指定id的资源

	> GET  /model/:id?select=[]&populate=[]

	返回指定id的资源,select列出了需要返回的属性列表,populate列出了需要展开的属性。
	
	示例：

	> GET /trigger/23s9erc?select=["op", "type"]
	检索id为23s9erc的trigger数据，返回它的op和type属性
	返回:
	```
	{
		code : 0,
		data : {
			"op" : 3,
			"type" : 2
		}
	}
	```

	> GET /scriptHistory/234343?select=["scripts
* 检索资源

	> GET  /model/?query={}&select=[]
	
	返回资源列表，query列出了检索条件，select给出了需要返回的属性。
	
* 创建资源

	> POST /model
	> Content-Type : Application/json
	```
	{
		data : jsonObj
	}
	```
	
	创建资源，post content中的data字段给出了创建数据的json表示。

active
-------
active表示激活操作，接口如下

* 激活指定id的scriptHistory

	> GET /active/:id

	指定id的scriptHistory被激活作为其广告主的当前页面脚本配置

debug
-------
debug表示开启debug模式，接口如下

* debug指定id的scriptHistory

	> GET /debug/:id

	 将指定id的scriptHistory配置作为其广告主在本机上的当前页面脚本debug配置。 
