/**
 * Created by jerry on 3/11/16.
 */

var TRIGGER_TYPES = [
    {
        name : "始终加载",
        value : 0
    },
    {
        name : "当前页面URL",
        value : 1
    },
    {
        name : "来源页面URL",
        value : 2
    },
    {
        name : "元素存在性",
        value : 3
    },
    {
        name : "第一方Cookie",
        value : 4
    },
    {
        name : "点击事件",
        value : 5
    }
];

var OPS = [
    {
        name : "相等",
        value : 1
    },
    {
        name : "包含",
        value : 2
    },
    {
        name : "开头为",
        value : 3
    },
    {
        name : "结尾为",
        value : 4
    },
    {
        name : "JQuery Select",
        value : 5
    }
]


