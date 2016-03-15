ScriptStore
===========
ScriptStore是广告主页面脚本配置统一管理系统的后台。

[TOC]

概念及操作
--------------
广告主往往会在页面上配合DSP挂载一些脚本以对用户进行跟踪以及对广告效果进行统计，讨论系统设计之前，先厘清一些基本概念和web管理系统提供的操作。

#### 概念
* 脚本 script
脚本指的是具体的一段javascript脚本，例如"console.log('hello world');"。
* 触发器 trigger
触发器指的是脚本的触发条件，例如根据url触发，根据点击触发。
* 配置单元 tag
一段script以及对应的几个trigger，组成一个配置单元，表示当这几个触发器中的任意一个触发时执行对应脚本。
* 配置版本 version
一个广告主配置好的一系列tag统一称为一个版本，广告主页面每次取回一个版本的数据，并且根据配置挂载脚本。
* 广告主 advertiser
系统管理的最基本单元，每个版本有且仅有一个广告主。
* 草稿 draft
每个广告主有且仅有一个当前草稿，当编辑完成后，广告主可以将其保存，或者生成版本，也可以直接发布该草稿。
* 发布版本 release
发布版本指的是广告主当前激活的配置版本。

#### 操作
* 对数据模型的增删改查
对draft， version， release的基于Rest API的增删改查，根据具体业务有些操作是被禁止的。
* 获取广告主全部版本
返回指定广告主当前的所有版本（包括草稿）列表。草稿通常会被放在列表最后一项。
* 保存草稿为版本
将该草稿内容复制并保存一份到版本库
* 发布指定版本和发布指定草稿
将指定版本设成当前激活配置，发布草稿时，会首先将该草稿保存成一个版本
* debug指定版本和debug指定草稿
通过配置cookie设置对应广告主当前debug状态和debug的版本

数据库设计
-------------

#### version表
版本表，记录了用户发布的所有版本

* _id 
记录唯一id
* creation
记录创建时间
* publish
启用时间，默认为0
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
* tags
配置单元，数组，具体每项为： 
	* name
	tag名称
	* script
	tag脚本内容
	* triggers
	触发器index数组，每一项均为触发器在triggers列表内的索引
	* conversion
	转化点
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
* tags
配置单元，数组，具体每项为： 
	* name
	tag名称
	* script
	tag脚本内容
	* triggers
	触发器index数组，每一项均为触发器在triggers列表内的索引

#### release表

记录当前广告主的publish version，以加速最常用的读操作。大部分结构类似version表，但是去掉了所有非页面功能相关字段，以及将tags中的trigger id展开为trigger内容。

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
	* conversion
	转化点
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

#### version, release, draft

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
	
* 创建资源 (该接口不对外提供）

	> POST /rest/资源名称
	> Content-Type : Application/json
	> Post Data
	
	创建资源，post content给出了创建数据的json表示

* 更新资源（仅draft可用）

	> PUT /rest/资源名称/:id
	> Content-Type : Application/json
	> Post Data
	更新资源，post content给出了新资源的json表示

常用业务接口
-----------

#### 读取指定广告主当前released版本
 > GET /rest/release?query={adid:**adid**}

#### 读取指定id的版本release之后的内容（该接口供debug模式使用)
 > GET /rest/version/**id**?release=true
 > GET /rest/draft/**id**?release=true

#### 读取指定广告主版本列表
 > GET /manage?query={adid:**adid**}&select=**select_fields**
 
#### 读取指定id的版本原始内容
 > GET /rest/version/**id**?select=**select_fields**

#### 创建草稿
 > GET /manage/export?from=**version_id**&overwrite=**Boolean**

> * 当**version_id**未给出时，创建一个内容为空的草稿，当**version_id**给出时，复制对应version的内容创建草稿。
> * 当**overwrite**为true时，删除之前的草稿，否则保存之前的草稿为最新版本。

#### 保存草稿
 > PUT /rest/draft/:id

 > * 用post data更新当前最新版本（编辑版本）。

#### 发布草稿
 > GET /manage/publish/draft/:id
 > 
 > * 发布指定**id**的的草稿

#### debug指定id的版本
 > GET /manage/debug/version/:id
 > GET /manage/debug/draft/:id

#### undebug指定id的版本 
 > DELETE /manage/debug/**id**

业务场景
-----------

1. 当用户第一次进广告主配置页面
	前端页面加载广告主版本列表，如果版本列表为空，向后台发送创建编辑版本请求，创建空白编辑版本。
	
1. 用户编辑配置，点击保存
	前端页面记录用户更改，向后台发送保存草稿请求
	
1. 用户创建版本1
	前端页面向后台发送创建编辑版本请求，from参数填入当前版本id，overwrite参数填否
	
1. 用户在新建的当前编辑版本上编辑，保存
	前端页面记录用户更改，向后台发送保存草稿请求
	
1. 用户创建版本2
    前端页面向后台发送创建编辑版本请求，from参数填入当前版本id，overwrite参数填否

1. 用户在新建的当前版本上继续编辑，保存
	前端页面记录用户更改，向后台发送保存草稿请求
	
1. 用户在版本列表中选择版本1，选择将该版本导出进行编辑
	前端页面询问用户是否覆盖当前正在编辑版本，然后向后台发送创建编辑版本请求，from参数填入版本1 id，overwrite参数根据用户选择填写true，false

1. 用户选择debug当前草稿，向后台发送debug消息

1. 用户选择发布某一个版本（历史版本，或者当前编辑版本）
	前端向后台发送发布版本请求，id填入版本id

测试
------

#### 数据模型测试

1. 数据完整性测试
	* 验证系统是否对数据项有足够的检查，包括数据类型，内容。
1. 数据逻辑正确性的验证机制测试
	* 验证系统是否对数据逻辑正确性有足够检查。

#### 单元功能测试

1. Dao
2. DBOperator
3. scriptOperator
4. utils
5. operation
6. parameters
7. presentation
8. restful

#### 端到端测试

1. 

附表
-------

###<a id="TriggerType"></a> Trigger type字段对应表

| 值 | 含义 | 
|---|-----|
| 0 | 始终加载 |
| 1 | 当前页面URL |
| 2 | 来源页面URL |
| 3 | 元素存在性 |
| 4 | 指定第一方Cookie为触发判断条件 |
| 5 | 点击事件 |

###<a id="TriggerOp"></a> Trigger op字段对应表

| 值 | 含义 |
|---- |------|
| 1 | 相等|
| 2 | 包含|
| 3 | 开头为|
| 4 | 结果为|
| 5 | JQuery Select |

###<a id="Errors"></a> 错误码表

| 值 | 含义 |
|-----|------|
| 0 | 成功|
| 1 | 接口参数错误|
| 2 | header错误 |
| 3 | server内部错误 |
| 4 | 数据库错误 |
| 5 | 接口路径不存在 |
| 6 | 业务逻辑错误 |
| 7 | 数据错误 |