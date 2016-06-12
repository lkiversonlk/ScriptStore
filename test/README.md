测试用例说明
==========

manageTest
----------
广告主ID "testAd"

## test configuration interface

#### draft CURD

* create an empty draft
调用/manage/export接口,测试是否生成对应广告主的一条草稿记录.

* update the draft
调用/put/draft/:id 修改广告主草稿,添加一个trigger,验证修改成功

* save the draft to version
调用/manage/toversion接口,将广告主下草稿导出为版本,验证版本库数目增加1,且其trigger与draft trigger相同

* get configurations of test advertiser
通过/manage接口,获取当前广告主所有配置,应该为草稿+版本 = 2

* publish the first version
调用/manage/publish/version,将版本发布,然后去找出当前广告主的release数目,应该为1.

* publish the draft
首先调用/put/draft/:id来修改draft,给draft增加一个tag,然后调用/publish/draft发布.
然后获取广告主当前所有配置,目前应该有3个配置.
第三个是当前draft,应该有一个tag,一个trigger
第二是是发布草稿新生成的版本,也应该有一个tag,一个trigger
第一个是最早的版本,就一个trigger

#### export test

* export version 0 with overwrite
将第一个版本导出成草稿,with overwrite true,因此原有草稿会被覆盖.
然后读取draft,这时trigger应该有1个,但是tag应该只有0个了,同时读取versions列表,应该只有两个.

* export version 1 with overwrite
再将版本1导出成草稿,此时草稿draft和trigger应该各一个,且版本总数保持为2

* export version 0 without overwrite
再次将版本0导出成草稿,with overwrite false,检测trigger,tag长度,此时从版本数应该为3,即原草稿被保存成版本了.

* export version 1 without overwrite
再次将版本1到出成草稿,检测trigger tag长度,此时版本总数应该为4

#### cookie test

* debug draft
请求/debug/draft,验证返回头部set-cookie,pyscript项json对象应该有设置广告主ID,内容为""

* debug version
请求/debug/version/:id, 验证返回头部set-cookie,pyscript项,adid内容为version id

manageTest2
-----------
modelTest
---------
operationBuilderTest
--------------------
parametersMiddlewareTest
-----------------------
restfulTest
-----------
