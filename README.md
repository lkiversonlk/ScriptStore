ScriptStore
===========

[TOC]

概念及操作
--------------
首先厘清一些基本概念和web管理系统提供的操作。

#### 概念
* 脚本 script
脚本指的是具体的一段javascript脚本，例如"console.log('hello world');"。
* 触发器 trigger
触发器指的是脚本的触发条件，例如根据url触发，根据点击触发。
* 配置单元 tag
一段script以及对应的几个trigger，组成一个配置单元，表示当这几个触发器中的任意一个触发时执行对应脚本。
* 配置版本 version
多个tag组合在一起成为一个配置版本。
* 广告主 advertiser
一个广告主可以有多个version。

> 注意，trigger可以在同一个广告主的同一个version中的不同tag中共享

数据库设计
-------------

#### version表
版本表，记录了用户发布的所有版本

* _id 
记录唯一id
* creation
记录创建时间
* publish
发布时间，默认为0
* adid
广告主id
* name
记录名称
* description
版本描述
* triggers
触发器数组，里面存了该版本下的预定义的触发器列表。每一项格式为：
	* name
	触发器名称
	* ruleType
	触发器类型
	* op
	匹配方法类型
	* value
	匹配值
	* deleted
	是否已经删除
* tags
配置单元，数组，具体每项为： 
	* name
	tag名称
	* script
	tag脚本内容
	* triggers
	触发器index数组，每一项均为触发器在triggers列表内的索引
	* transferId
	转化ID，（考虑把这项并入script中)
* deleted
该记录是否被删除，默认为false

#### draft表
草稿表，记录当前广告主的正在编辑版本。

* _id 
记录唯一id
* creation
记录创建时间
* adid
广告主id
* triggers
触发器数组，里面存了该版本下的预定义的触发器列表。每一项格式为：
	* name
	触发器名称
	* ruleType
	触发器类型
	* op
	匹配方法类型
	* value
	匹配值
	* deleted
	是否已经删除
* tags
配置单元，数组，具体每项为： 
	* name
	tag名称
	* script
	tag脚本内容
	* triggers
	触发器index数组，每一项均为触发器在triggers列表内的索引
* deleted
该记录是否被删除，默认为false

#### active表
记录当前广告主的激活的配置，以加速最常用的读操作。大部分结构类似version表，但是去掉了所有非页面功能相关字段，以及将tags中的triggerid展开为trigger内容。

* _id 
记录唯一id
* vid
该记录在version表中唯一id
* adid
广告主id
* tags
配置单元，数组，具体每项为： 
	* script
	tag脚本内容
	* triggers
	触发器数组，每项数据内容为:
		* ruleType
		触发器类型
		* op
		匹配方法类型
		* value
		匹配值



REST接口
----------- 
广告主页面脚本管理服务,接口采用Restful风格设计，接下来以资源为单位介绍对应的接口。

 > 请注意，所有接口都需要指明"Content-Type : application/json"

#### version, active,draft

这三个资源的接口形式和含义相同，接口组织如下:

* 获取指定id的资源

	> GET  /rest/资源名称/**id**?select=**Select_array**

	返回指定**id**的资源,**Select_array**列出了需要返回的属性列表。
	
	> 注意_id字段一定会被返回。
	
	示例：

	> GET /rest/version/23s9erc?select=["adid", "name"]
	检索_id为23s9erc的version，返回它的adid和name属性
	返回:
	```
	{
		code : 0,
		data : {
			_id : 23s9erc,
			adid : 3,
			name : "测试版本"
		}
	}
	```

	> GET /rest/version/234343?select=["tags”]
	检索_id为234343的version，只读取tags属性
	返回:
	```
	{
		code : 0,
		data : {
			_id : "234343",
			tags : [
				{
					name : "tag1",
					script : "console.log('hello world');",
					triggers : [
						1,
						3
					]
				},
				{
					name : "tag2",
					script : "console.log('hello world2');"
					triggers : [
						3,
						2
					]
				}
			]
		}
	}
	```

* 检索资源列表

	> GET  /资源名称?query=**Query**&select=**Select_array**
	
	返回资源列表，query列出了检索条件，select给出了需要返回的属性。

	示例

	> GET /rest/version?query={ adid : "deef1"}&select=["name"]
	检索adid为"deef1"的version，返回name属性
	返回:
	```
	{
		code : 0,
		data : [
			{
				_id : "232de",
				name : "test version1"
			},
			{
				_id : "23dre",
				name : "test version2"
			}
		]
	}
	```
	
* 创建资源 (仅version可用）

	> POST /rest/资源名称
	> Content-Type : Application/json
	> Post Data
	
	创建资源，post content给出了创建数据的json表示

* 更新资源（仅version可用）

	> PUT /rest/资源名称/:id
	> Content-Type : Application/json
	> Post Data
	更新资源，post content给出了新资源的json表示

业务接口
-----------

#### 读取指定广告主当前released版本
 > GET /rest/active?query={adid:**adid**}

#### 读取指定id的版本release之后的内容（该接口供debug模式使用)
 > GET /rest/debug/**id**

#### 读取指定广告主版本列表
 > GET /rest/version?query={adid:**adid**}&select=**select_fields**
 
#### 读取指定id的版本原始内容
 > GET /rest/version/**id**?select=**select_fields**

#### 创建草稿
 > GET /configuration/checkout?from=**version_id**&overwrite=**Boolean**

> * 当**version_id**未给出时，创建一个内容为空的版本，当**version_id**给出时，复制对应version的内容，并且创建新版本。因为是最新版本，默认便是编辑版本。
> * 当**overwrite**为true时，删除之前的最新版本。

#### 保存草稿
 > PUT /rest/draft/:id?

 > * 用post data更新当前最新版本（编辑版本）。

#### 发布版本
 > GET /configuration/release/**version_id**

 > * 发布指定**version_id**的版本，更新该版本发布时间
 > * 如果该id为草稿，，则复制该草稿到版本库。

#### debug指定id的版本
 > POST /rest/debug/**id**

#### undebug指定id的版本 
 > DELETE /rest/debug/**id**

业务场景
-----------

1. 当用户第一次进广告主配置页面
	前端页面加载广告主版本列表，如果版本列表为空，向后台发送创建编辑版本请求，创建空白编辑版本。
	
2. 用户编辑配置，点击保存
	前端页面记录用户更改，向后台发送保存草稿请求
	
3. 用户创建版本1
	前端页面向后台发送创建编辑版本请求，from参数填入当前版本id，overwrite参数填否
	
4. 用户在新建的当前编辑版本上编辑，保存
	前端页面记录用户更改，向后台发送保存草稿请求
	
5. 用户创建版本2
    前端页面向后台发送创建编辑版本请求，from参数填入当前版本id，overwrite参数填否

6. 用户在新建的当前版本上继续编辑，保存
	前端页面记录用户更改，向后台发送保存草稿请求
	
7. 用户在版本列表中选择版本1，选择将该版本导出进行编辑
	前端页面询问用户是否覆盖当前正在编辑版本，然后向后台发送创建编辑版本请求，from参数填入版本1 id，overwrite参数根据用户选择填写true，false

8. 用户选择发布某一个版本（历史版本，或者当前编辑版本）
	前端向后台发送发布版本请求，id填入版本id



