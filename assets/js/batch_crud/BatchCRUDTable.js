// 建立（Create）、读取（Read）、更新（Update）、删除（Delete），也就是 CRUD；
// 这是一连串常见的动作行为，而其行为通常是为了针对某个特定资源所作出的举动（例如：建立资料、读取资料等）。

//大中小类型的缓存(所有的DTO 的 Json数组)  {big: new Array(), middle: new Array(), small: new Array()}
var categoryGradeBuffer = new Array(new Array(), new Array(), new Array());

$(document).ready(function (data) {
//    loadDropdownMenu($goodsDataTableAPI);
    //初始化模态框
    //loadDropSelect($('#goodsCategory1Id'), "BIG");
    function modalSelectAppend($dropAble, dataDTO) {
        categoryGradeBuffer[dataDTO.goodsCategoryGrade].push(dataDTO);
        $dropAble.append("<option value + datadto.goodscategoryid "">" + dataDTO.goodsCategoryName + "</option>");
    }
/*

    dynamicLoadClassification($('#goodsCategory1Id').on('requestSuccessfulEvent', function () {
        $(this).trigger('onchange');
    }), "BIG", modalSelectAppend);
    //添加一个选项 中类 和 小类都可以不选? 或是表单验证是判断?
    dynamicLoadClassification($('#goodsCategory2Id').on('requestSuccessfulEvent', function () {
        //this是绑定了事件的Dom
        //this.add(new Option("", ""));
        //$(this).trigger('onchange');
    }), "MIDDLE", modalSelectAppend);
    dynamicLoadClassification($('#goodsCategory3Id').on('requestSuccessfulEvent', function () {
        //this.add(new Option("", ""));
    }), "SMALL", modalSelectAppend);
*/
    listStationRequest();

});

/**
 * Descriptions: 二级联动<p>
 *     找到左侧select框选中的元素 将右侧select框中与左侧选中元素无关的元素隐藏 并选中 空
 *
 * @author SailHe
 * @date 2018/4/22 13:59
 */
function secondaryLinkage(lhsSelectDom, rhsSelectDom, categoryGradeIndex) {
    /*
     此处的this是window

    * 通过隐藏实现二级联动:
    * 获取所有的次级分类
    * 将不属于该分类的下一级分类隐藏
    * 右侧选中空 空
    */

    rhsSelectDom.value = '';
    //获取当前选中元素的次级分类主键
    ++categoryGradeIndex;
    var subNodesPrimaryKey = new Array();
    var nextClassificationNodes = categoryGradeBuffer[categoryGradeIndex];
    for (var index = 0; index < nextClassificationNodes.length; ++index) {
        if (nextClassificationNodes[index].goodsCategoryParentId == lhsSelectDom.value) {
            subNodesPrimaryKey.push(nextClassificationNodes[index].goodsCategoryId);
        }
    }

    var rhsOptArray = rhsSelectDom.options;
    //显示子结点 隐藏非子结点
    for (var index = 0; index < rhsOptArray.length; ++index) {
        if (subNodesPrimaryKey.indexOf(parseInt(rhsOptArray[index].value)) >= 0) {
            //console.debug('显示');
            //同一元素不会出现两次 找到一次后将其删除 subNodesPrimaryKey
            rhsOptArray[index].style.display = '';
        } else {
            //console.log('隐藏');
            //不是左侧选中的元素的子结点->将其隐藏
            rhsOptArray[index].style.display = 'none';
        }
    }
}

$('#stationInfoModal').modal({
  //点击空白处关闭
  backdrop: 'static',
  //escape 键退出
  keyboard: false,
  focus: true,
  //初始化后显示与否
  show: false,
  //hide.bs.modal
}).on('station.modal.submit.success', function () {
  $('.audit-need-info').css('display', '');

  //对stationTable中的数据进行处理
  var $stationStorehouse = $("#stationStorehouse");
  var stationIdList = $stationStorehouse.getTableColValue(0, function ($cell) {
    return $cell.is(':checked');
  });
  debugLog(stationIdList);

  var stationGoodsDTO = new StationPriceDTO();
  stationGoodsDTO.stationPriceFactoryPrice = $('input[name=factoryPriceInput]').val();
  stationGoodsDTO.stationPriceSalesPrice = $('input[name=salesPriceInput]').val();
  //貌似这个无关紧要
  stationGoodsDTO.goodsSkuId = $($('input[name=goodsSkuId]')).val();
  var $stationGoodsStorehouse = $("#stationGoodsStorehouse");
  const len = stationIdList.length;
  for (var i = 0; i < len; ++i) {
    stationGoodsDTO.stationId = parseInt(stationIdList[i]);
    $stationGoodsStorehouse.addOrUpdateStationGoodsTableRow(stationIdNameMap.get(stationGoodsDTO.stationId), stationGoodsDTO);
  }
});
</p>