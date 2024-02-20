/**
 * 商品添加表格组件(需要引入特定的html)
 * */

var goodsNameIDMap = {};
//查重用
var goodsIdBuffer = {};

//是否显示份数列
var showCopies = false;

/**
 * Descriptions: 为table弹框添加一行若number为undefine则不会添加数字列<p>
 * eg: $("#storehouse").addTableRow
 * @author SailHe
 * @date 2018/5/7 17:26
 */
$.fn.addTableRow = function (ID, name, number) {
    if(typeof ID == "undefined"){
        return;
    }

    //查重
    if (typeof goodsIdBuffer[ID] == "undefined" || goodsIdBuffer[ID] == false) {
        goodsIdBuffer[ID] = true;
    } else {
        return;
    }

    //根据促销类型 判断弹框上份数控制的显示
    var copiesCol = '';
    if (typeof number !== "undefined") {
        copiesCol = "<td class="copiesCol"><div style="text-align: center">" +
            "<input type="number" value + number "" min="1" max="99"></div></td>";
    } else {
        copiesCol = "<td class="copiesCol" style="display: none;" disabled="disabled"><div style="text-align: center">" +
            "<input 1 type="number" value + "" min="1" max="99"></div></td>";
    }
    var data = "<tr role="row">" +
        "<td><div style="text-align: center">" + ID + "</div></td>" +
        "<td><div style="text-align: center">" + name + "</div></td>" +
        copiesCol +
        "<td><div style="text-align: center">" +
        "<button style="padding:0 10px;" class="btn btn-primary btn-xs deleter" type="button">删除" +
        "</button></div></td>" +
        "</tr>"
    $(this).append(data);

    $('.deleter').click(function () {
        var id = $(this).deleteTableRow().find('td').get(0).textContent;
        goodsIdBuffer[id] = false;
    });
}

$.addSelectGoods = function () {
    if ($("#allGoodsCheckbox").is(':checked')) {
        $('#queryGoodsList').find('option').each(function (i, option) {
            $('#storehouse').addTableRow(goodsNameIDMap[option.value], option.value, showCopies ? 1 : undefined);
        });
    } else {
        var selectName = $('select[id=queryGoodsList]').val();
        if (selectName !== undefined) {
            $('#storehouse').addTableRow(goodsNameIDMap[selectName], selectName, showCopies ? 1 : undefined);
        }
    }
}

/**
 * Descriptions: 商品列表设置</p><p>
 *
 * @author SailHe
 * @date 2018/5/10 12:56
 */
$.setRelatedGoods = function () {
    var goodsIDList = $("#storehouse").getTableColValue(0);
    var copiesListBuffer = $("#storehouse").getTableColValue(2);
    $("input[name='goodsIDList']").val(goodsIDList);
    //商品设置界面只会在更新copiesMap内的内容
    promotionRule.copiesMap = {};
    //(当前的顺序是严格对应的 但无法保证之后的对应关系 所以必须使用Map)
    goodsIDList.length = copiesListBuffer.length;
    for (var i = 0; i < goodsIDList.length; ++i) {
        promotionRule.copiesMap[goodsIDList[i]] = copiesListBuffer[i];
    }
};

function emptyStorehouse() {
    //清空查重缓存
    goodsIdBuffer = {};
    $("#storehouse").empty();
}


$('#goodsSearchButton').click(function () {
    $.ajax({
        type: 'post',
        dataType: 'json',
        async: false,
        data: {
            search: $('#goodsSearchText').val()
        },
        url: 'goods/fuzzyQuery',
        success: function (result) {
            if (result.success) {
                $("#queryGoodsList").empty();
                for (var i = 0; i < result.data.length; i++) {
                    goodsNameIDMap[result.data[i].name] = result.data[i].goodsId;
                    var options = "<option>" + result.data[i].goodsName + "</option>";
                    $("#queryGoodsList").append(options);
                }
            }else{
                console.error("商品查询失败! in goodsTable goodsSearchButton");
            }
        }
    });
});
//键盘事件监听
$('input[id=goodsSearchText]').on('keypress', function (event) {
    //enter事件
    if (event.keyCode == "13") {
        //提交搜索时使用ajax->阻止表单的默认行为
        event.preventDefault();
        $('#goodsSearchButton').trigger('click');
    }
});
</p>