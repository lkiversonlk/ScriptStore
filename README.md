系统设计及接口文档
==========================
本文档描述了ScriptStore系统的架构设计和对外接口，帮助需要与本系统进行交互的开发人员了解系统业务结构和使用本系统API。

[TOC]

相关概念
-----------
* 脚本 script
脚本指的是具体的一段javascript脚本，例如"console.log('hello world');"。
* 触发器 trigger
触发器指的是脚本的触发条件，例如点击触发表示当用户在广告主页面上点击某指定部分时触发对应脚本。
* 配置单元 tag
一段script以及对应的几个trigger，组成一个配置单元tag。
* 配置版本 version
一个广告主配置好的一系列tag统一称为一个版本。
* 草稿 draft
每个广告主有且仅有一个当前草稿，当编辑完成后，广告主可以将其保存，或者生成版本，也可以直接发布该草稿。
* 发布版本 release
发布版本指的是广告主当前激活的配置版本。

业务描述
------------
ScriptStore系统提供接口以广告主为基本单位对页面脚本进行配置，包括脚本内容和触发器。
操作者还可以将完成的配置保存成版本，并将旧有版本导出到草稿区进行编辑，或者发布版本为该广告主当前页面脚本。
为了方便调试，操作者可以选择debug当前草稿或者指定版本，ScriptStore系统会将相关信息写入客户端cookie，当相同客户端打开广告主页面时，脚本获取模块可以根据debug信息在该客户端上执行指定的调试脚本。

数据库结构
--------------
系统使用nosql数据库，以json格式直接存储数据。

* version表存储配置好的版本，一个广告主可以有多个version。
* draft表存放当前草稿，一个广告主只能有一个当前草稿，version和draft的数据格式大致相同。
* release表存放广告主当前publish的配置版本，一个广告主只能有一个release版本，为了提高release内容的读取效率，version和draft被用户publish到release表后内容会经过一定的调整和转换。

#### version表
version表存放广告主保存的版本。

* _id
记录唯一id
* creation
记录创建时间，自标准时间以来经过的毫秒数
* publish
默认为0，如果该版本被发布过，则记录最近一次发布时间
* adid
广告主id
* name
记录名称，默认为空
* description
版本描述，默认为空
* triggers
触发器数组，里面存了该版本定义的触发器列表，每一项格式为：
	* name
	触发器名称，在同一版本内trigger名称不可以重复
	* ruleType
	触发器类型，参见附表
	* op
	匹配方法，参见附表
	* value
	匹配值，字符串
* tags
配置单元数组，每一项格式为： 
	* name
	tag名称，在同一版本内tag名称不可以重复
	* script
	tag脚本
	* triggers
	int数组，对应triggers数组中的序号，从0开始
	* conversion
	转化点
* deleted
该version是否被删除，默认为false

#### draft表
draft表保存广告主当前草稿。

* _id
记录唯一id
* creation
记录创建时间，自标准时间以来经过的毫秒数
* adid
广告主id
* triggers
触发器数组，里面存了该版本定义的触发器列表，每一项格式为：
	* name
	触发器名称，在同一版本内trigger名称不可以重复
	* ruleType
	触发器类型，参见附表
	* op
	匹配方法，参见附表
	* value
	匹配值，字符串
* tags
配置单元数组，每一项格式为：
	* name
	tag名称，在同一版本内tag名称不可以重复
	* script
	tag脚本
	* triggers
	int数组，对应triggers数组中的序号，从0开始
	* conversion
	转化点

#### release表
release表保存广告主当前publish的版本。

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

接口及规范
--------

#### 参数，头部和接口返回消息格式

1. 参数
	ScriptStore系统对参数做了统一的解析处理，对特定参数名，其参数格式都是固定的，如下：
	* query
	json字典格式，如 /rest/draft?query={adid : "234, _id : "23434"}
	* select
	json数组，如 /rest/draft?select=["name", "description"]

1. 头部
	所有请求必须带上"Content-Type:application/json"头部。

1. 接口返回消息格式
	所有接口的返回消息均为json格式，通用结构如下：

	```javascript
	{ 
		code : CODE，  //错误码，0表示成功，其余值请参见附表
		data : DATA    //返回数据，根据接口决定，当code不为0时，data为错误信息字符串。
	}
	```
	**在下面接口部分的返回值示例中，只给出data字段的值**
	
#### rest接口
对于draft，version和release三种resource，系统提供了一套通用的rest接口实现增删改查。

接口的标准形式为

	Method(GET, POST, PUT, DELETE) /rest/{resource}[/{id}]?[query={}]
	
query参数用来筛选操作数据集，指明id属性时，表示对指定的单一记录进行操作，实际上id参数会被转化成 query={_id : id}。为了防止误操作，大部分接口即使给出数据对象id，仍需要在query中指定广告主id，起到双重验证的作用。

* 创建资源
	* POST /rest/{resource}
	使用post的json data创建单个reource。
	
* 读取资源
	* GET /rest/**{resource}**/**ID**?query={} [&release="true"|"false"]
	根据id读取单个resource。

			release参数仅对于draft和version有效，当release为“true”时，返回经过release转化的draft或者version内容。该参数供调试模式时的脚本获取模块使用。
		
	* GET /rest/**{resource}**?query={}
	根据query内的条件读取resource列表。

* 更新资源
	* PUT /rest/{resource}[ /**ID**]?query={}
	根据query和id选择的条件选取resource并更新成post data的值，目前的更新机制要求是全部更新，不允许更新部分字段。
	
* 删除资源
	* DELETE /rest/{resource}[/**ID**]?query={}
	根据query和id选择的条件，删除对应的resource。
	
#### manage接口
部分业务接口需要多种资源操作的组合，ScriptStore有以下业务接口：

* 读取广告主所有配置（包括草稿)
	
		GET /manage?query={adid : ADID}
		
		1. ADID
			广告主ID

		返回data：
			[
				{
					...,                      //version 内容
				},
				...,
				{
					...                        //draft 内容
					draft : true
				}
			]
	
	读取指定广告主下所有配置列表，列表中单项格式与version表和draft表相同，草稿只会在列表的最后一个位置里,并且有一个字段draft标明其为草稿。
	
* 导出指定版本到草稿区
		
		GET /manage/export?query={adid : ADID}&from=FROM&overwrite=OVERWRITE
	
		1. ADID
			广告主ID
		2. FROM
			导出版本ID
		3. OVERWRITE
			是否覆盖现有草稿，字符串，"true"或者"false“

	将指定广告主的指定版本导出到草稿区，from参数不提供时表示创建空白草稿，如果不覆盖现有草稿，将会把现有草稿保存成一个版本。
	
* 将指定草稿保存成版本

		GET /manage/toversion?query={adid : ADID}

		1. ADID
			广告主ID
		返回data：返回创建成功的version记录内容

	将广告主的当前草稿保存成版本。
	
* 发布指定版本

		GET /manage/publish/version/ID?query={adid : ADID}

		1.ID
			版本ID
		2.ADID
			广告主ID
			
* 发布草稿

		GET /manage/publish/draft?query={adid:ADID}

		1. ADID
			广告主ID


	<em>
		调试功能说明：
		调试版本/草稿时会在http返回中设置cookie，目前的key为"scriptStore",value为json对象的字符串表示。其json格式为：

	```javascript
			{
				"ADID1" : "" | versionid，
				"ADID2" : "" | version      为空时表示调试debug版本,传值时表示version id
			}
	```
	</em>
	
* 调试指定版本

		GET /manage/debug/version/ID?query={adid : ADID}

		1. ID
			版本ID
		1. ADID
			广告主ID
			
* 调试草稿

		GET /manage/debug/draft?query={adid : ADID}
	
		1. ADID
			广告主ID
			
* 取消某指定广告主调试状态

		GET /manage/undebug?query={adid : ADID}

		1. ADID
			广告主

* 获取广告主当前激活脚本
	
		GET /manage/release?query={adid:ADID}[&cookie=COOKIE]
	
		1. ADID
			广告主ID
		2.COOKIE
			在scriptStore key下的cookie
		返回data：
			供页面端加载的release脚本
			
系统使用教程
----------------

下面以一个广告主为例，讲解常见的系统使用流程：

1. 获取广告主id 234所有配置
	获取广告主已有的所有配置，包括草稿。
	
		GET /manage?query={adid : "234"}
2. 创建草稿DraftA
	发现广告主配置为空，创建第一个空白草稿。
			
		GET /manage/export?query={adid : "234"}
		假设返回值里草稿id为“draftA”
3. 编辑草稿DraftA
	对草稿A进行一系列编辑，生成完整的草稿json数据，然后更新该草稿
	
		PUT /rest/draft?query={adid : "234"}
		post内容填入更新后的完整草稿
		
4. 调试草稿DraftA
	在浏览器中发出调试请求

		GET /manage/debug/draft?query={adid : "234"}

5. 打开广告主页面，调试草稿
	在浏览器中打开广告主页面，投放中心分析cookie得知当前处于调试模式，且类型为"draft"，于是向scriptStore系统发出请求，取经过release的草稿版本

		 GET /rest/draft?query={adid : "234"}&release="true"
		 注意：上述接口返回的是一个list，请检查长度并取出第一项返回
5. 保存成版本VersionA
	调试完后，将草稿保存成版本,
		
		 GET /manage/toversion/draftA?query={adid : "234"}
		 从返回的data._id里可以取到生成的版本id，假设为"versionA"
6. 发布该版本ReleaseA

		 GET /manage/publish/version/versionA
		 
7. 导出该版本到草稿区DraftB
		当又需要对版本A进行修改时，先导出版本A到草稿区
	
		GET /manage/export?query={adid:"234"}&from=versionA
	

附表
-------

#### <a id="TriggerType"></a> Trigger type字段对应表

| 值 | 含义 | 
|---|-----|
| 0 | 始终加载 |
| 1 | 当前页面URL |
| 2 | 来源页面URL |
| 3 | 元素存在性 |
| 4 | 指定第一方Cookie为触发判断条件 |
| 5 | 点击事件 |

#### <a id="TriggerOp"></a> Trigger op字段对应表

| 值 | 含义 |
|---- |------|
| 1 | 相等|
| 2 | 包含|
| 3 | 开头为|
| 4 | 结果为|
| 5 | JQuery Select |

#### <a id="Errors"></a> 错误码表

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

#### 发现的bug列表

1. creation时间不变
在schema里定义的default值为Date.now()，这个值会在schema定义时就取到，之后创建的所有creation时间都是一样的。
	* 自动测试时应该检查连续创建记录，比较creation时间

2. subarray有_id属性
创建的document里会有自动创建的_id属性。
	* 自动测试创建记录时要完整的检查记录值
	
3. Operation链上data.toJSON bug
在Operation链上传递data的时候，从mongoose里传回的数据需要call toJSON才能变成扁平值类型。
   * 设计问题，没法通过自动测试解决

4. 参数解析问题
在用parameter层解析参数的时候，有关overwrite和release参数的传值用true还是"true"造成的解析bug。
   * 对parameter层加入自动化测试

5. publish draft问题
publish draft要从之前的数据中取出query字段创建新的release，由于带入了id字段，导致会重新创建一个release版本，这样同一个广告主会有两个release版本
   * schema里加入限制
   * 自动化测试时仔细检查结果

5. operation layerl里对data.data的识别
当data.data为空时,operation会复用上一次操作结果,但是在判断是否空时,if(data.data)在data.data为空字符串或者空对象时都会返回否,只能用data.data == null才行.