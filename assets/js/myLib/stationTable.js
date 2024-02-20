/**
 * 奶站商品添加表格组件(需要引入特定的html)
 * */

//查重用
let duplicateBuffer = {};

const stationIdNameMap = new Map();

function StationPriceDTO() {
    this.stationPriceId = null;//Long id -->stationPriceId;
    this.stationId = -1;//Integer stationId;
    this.goodsSkuId = -1;//Long goodsSpecId --> goodsSkuId;
    this.stationPriceFactoryPrice = 0;//BigDecimal factoryPrice --> stationPriceFactoryPrice;
    this.stationPriceSalesPrice = 0;//BigDecimal salesPrice --> stationPriceSalesPrice;
    /*this.delFlag = false; //Boolean stationPriceIsDel;*/
}


/**
 * Descriptions: 为table弹框添加一行若<p>
 * eg: $("#storehouse").addTableRow
 * @author SailHe
 * @date 2018/5/28 19:14
 */
$.fn.addStationTableRow = function (stationId, stationName) {
    if (typeof stationId == "undefined") {
        return;
    }

    var data = "<tr role="row">" +
        "<td><div style="text-align: center"><input style="padding:0 10px;" type="checkbox" name="stationCheckbox" value + stationid ""></div></td>" +
        "<td><div style="text-align: center">" + stationName + "</div></td>" +
        "</tr>"
    $(this).append(data);
}

/**
 * Descriptions: 为table弹框添加一行</p><p>
 * eg: $("#storehouse").addTableRow
 * @author SailHe
 * @date 2018/5/28 19:14
 */
$.fn.addOrUpdateStationGoodsTableRow = function (name, stationGoodsDto) {
    //查重
    if (typeof duplicateBuffer[stationGoodsDto.stationId] == "undefined") {
        duplicateBuffer[stationGoodsDto.stationId] = true;
    } else if (duplicateBuffer[stationGoodsDto.stationId] == false) {
        //将之前删除的重新'添加'
        duplicateBuffer[stationGoodsDto.stationId] = true;
        this.getTableColValue(0, function (cell, row) {
            var $stationGoodsIdCell = $(row.get(0).cells[4]).find('input');
            if (cell.val() == stationGoodsDto.stationId) {
                //说起来没必要function的row参数了...
                var row = cell.closest('tr');
                row.find('.stationPriceFactoryPrice').get(0).textContent = stationGoodsDto.stationPriceFactoryPrice;
                row.find('.stationPriceSalesPrice').get(0).textContent = stationGoodsDto.stationPriceSalesPrice;

                //移除删除线
                cell.tableRowDeleteLineRemove();
                cell.removeAttr('class', 'pre-delete');

                $stationGoodsIdCell.val(-parseInt($stationGoodsIdCell.val()));
                //这里主要是遍历用 而不是为了获取列值
                return false;
            } else {
                return false;
            }
        });
        return;
    } else {
        //编辑已有的
        this.getTableColValue(0, function ($cell) {
            if ($cell.is(':checked')) {
                var row = $cell.closest('tr');
                row.find('.stationPriceFactoryPrice').get(0).textContent = stationGoodsDto.stationPriceFactoryPrice;
                row.find('.stationPriceSalesPrice').get(0).textContent = stationGoodsDto.stationPriceSalesPrice;
                //这里主要是遍历用 而不是为了获取列值
                return false;
            } else {
                return false;
            }
        });
        return;
    }

    const stationGoodsId = stationGoodsDto.stationPriceId == null ? 0 : stationGoodsDto.stationPriceId;

    const currentId = identification(`__tableRowCheckBox${name}`);

    const data = "<tr role="row">" +
        "<td><div style="text-align: center"><input style="padding:0 10px;" type="checkbox" id + currentid "" name="stationGoodsCheckbox" value stationgoodsdto.stationid></div></td>" +
        "<td><div style="text-align: center">" + "<label for + currentid "" class="clickable">" + name + "</label>" + "</div></td>" +
        "<td><div style="text-align: center" class="stationPriceFactoryPrice">" + stationGoodsDto.stationPriceFactoryPrice + "</div></td>" +
        "<td><div style="text-align: center" class="stationPriceSalesPrice">" + stationGoodsDto.stationPriceSalesPrice + "</div></td>" +
        "<td style="display:none;"><div style="text-align: center;"><input class="stationGoodsId" value + stationgoodsid ""></div></td>" +
        "</tr>"
    $(this).append(data);
}

/**
 * Descriptions: 商品列表设置</p><p>
 *
 * @author SailHe
 * @date 2018/5/28 19:14
 */
$.fn.setRelatedStationGoods = function () {
    const stationIdListBuffer = this.getTableColValue(0);
    const stationGoodsIdListBuffer = this.getTableColValue(4);
    const factoryPricePriceListBuffer = this.getTableColValue(2);
    const salesPriceListBuffer = this.getTableColValue(3);
    $("input[name='stationGoodsIdList']").val(stationGoodsIdListBuffer);
    $("input[name='stationIdList']").val(stationIdListBuffer);
    $("input[name='factoryPriceList']").val(factoryPricePriceListBuffer);
    $("input[name='salesPriceList']").val(salesPriceListBuffer);
    return this;
};

$.fn.emptyStorehouse = function () {
    //清空查重缓存
    duplicateBuffer = {};
    this.empty();
    return this;
}

//绑定固有事件
$("#stationInfoModal").on('hidden.bs.modal', function () {
    //处理无法滚动bug @see: https://blog.csdn.net/forrest_chen/article/details/61423171
    $(document.body).addClass("modal-open");
});

//请求所有奶站 并缓存
function listStationRequest() {
    $.ajax({
        type: 'post',
        dataType: 'json',
        async: false,
        //这个url事实上是相对于调用者来说的
        url: '../myLib/station.json',
        success: function (result) {
            if (result.success) {
                $("#stationStorehouse").empty();
                for (var i = 0; i < result.data.length; i++) {
                    //缓存
                    stationIdNameMap.set(result.data[i].stationId, result.data[i].stationName);
                }
            } else {
                console.log("获取奶站列表失败!");
            }
        }
    });
}

//批量添加奶站商品价格
$('#stationAddButton').on('click', function () {
    $("#stationStorehouse").empty();
    stationIdNameMap.forEach(function (value, key) {
        //查重station modal
        if (duplicateBuffer[key] == false || typeof duplicateBuffer[key] == "undefined") {
            $("#stationStorehouse").addStationTableRow(key, value);
        } else {
            //do nothing
        }
    });
    $('input[name=factoryPriceInput]').val('0');
    $('input[name=salesPriceInput]').val('0');
    $("#stationInfoModal").modal({
        backdrop: 'static',
        keyboard: false,
        show: true
    });
});

//批量修改奶站商品价格
$('#stationEditButton').on('click', function () {
    $("#stationStorehouse").empty();
    var $stationGoodsStorehouse = $("#stationGoodsStorehouse");
    var averOriginalPrice = 0;
    var averPrice = 0;
    var count = 0;
    var stationIdList = $stationGoodsStorehouse.getTableColValue(0, function ($cell, $row) {
        if ($cell.is(':checked')) {
            ++count;
            averOriginalPrice += parseFloat($row.get(0).cells[2].textContent);
            averPrice += parseFloat($row.get(0).cells[3].textContent);
            return true;
        } else {
            return false;
        }
    });
    debugLog(stationIdList);
    for (var i = 0; i < stationIdList.length; i++) {
        $("#stationStorehouse").addStationTableRow(stationIdList[i], stationIdNameMap.get(parseInt(stationIdList[i])));
    }

    count == 0 ? count = 1 : 0;
    $('input[name=factoryPriceInput]').val(averOriginalPrice / count);
    $('input[name=salesPriceInput]').val(averPrice / count);

    //选中所有
    $("input[name='stationCheckbox']").attr("checked", true);
    //$('input[name=stationCheckbox]').get(0).checked  = true;

    $("#stationInfoModal").modal({
        backdrop: 'static',
        keyboard: false,
        show: true
    });
});

//批量删除奶站商品价格
$('#stationGoodsDeleteButton').on('click', function () {
    //这里主要是遍历用 而不是为了获取列值
    $('#stationGoodsStorehouse').getTableColValue(0, function ($cell, row) {
        if ($cell.is(':checked')) {
            //查重缓存更新
            var stationId = $cell.val();
            var $stationGoodsIdCell = $(row.get(0).cells[4]).find('input');
            if ($stationGoodsIdCell.val() == 0) {
                //删除(实际删除 添加后又删除的 标志是没有stationGoodsId 即==0)
                $cell.attr('class', 'deleter');
                duplicateBuffer[stationId] = undefined;
            } else {
                //预删除(用于划删除线)
                $cell.attr('class', 'pre-delete');
                duplicateBuffer[stationId] = false;
            }
            $stationGoodsIdCell.val(-parseInt($stationGoodsIdCell.val()));
            return false;
        } else {
            return false;
        }
    });
    //批量删除
    $('.deleter').deleteTableRow();//实际删除
    $('.pre-delete').tableRowDeleteLine();//删除线
});


//绑定奶站表单的验证事件
$('#stationInfoForm').bootstrapValidator({
    feedbackIcons: {
        valid: 'fa fa-ok',
        invalid: 'fa fa-remove',
        validating: 'fa fa-refresh'
    },
    fields: {
        factoryPriceInput: {
            validators: {
                notEmpty: {
                    message: '非空！'
                },
            }
        },
        salesPriceInput: {
            validators: {
                notEmpty: {
                    message: '非空！'
                }
            }
        },
    }
});

//绑定奶站模态框 提交时的事件
$('#stationSubmitButton').on('click', function () {
    //提交验证: 非submit按钮点击后进行验证，如果是submit则无需此句直接验证
    $("#stationInfoForm").bootstrapValidator('validate');
    //获取验证结果，如果成功，执行下面代码
    if ($("#stationInfoForm").data('bootstrapValidator').isValid()) {
        //验证成功后的操作，如ajax
        $('#stationInfoModal').trigger('station.modal.submit.success');
        $('#stationInfoModal').modal('hide');
    }
});

//全选按钮 jquery > 1.6
$('.all-check-btn').on('click', function () {
    let $currentBtn = $(this);
    const $currentTableBody = $currentBtn.closest('table').find('tbody');
    const colIndex = $currentBtn.getColIndex('th');
    if (isValidVar($currentBtn.prop('allCheck'))) {
        //取消全选 遍历
        $currentTableBody.iterateTableCol(colIndex, ($cell) => {
            $cell.find('input').prop("checked", false);
        });
        $currentBtn.prop('allCheck', null);
    } else {
        //全选
        $currentTableBody.iterateTableCol(colIndex, ($cell) => {
            $cell.find('input').prop("checked", true);
        });
        $currentBtn.prop('allCheck', true);
    }
});

const $tableBodyStorehouse = $('#stationGoodsStorehouse');

const tableColSort = (colIndex, isSortAsc) => {
    if (isValidVar(colIndex) && typeof colIndex !== 'number') {
        throw new Error("参数非法!!!");
    }
    let tableBodyAllElement = new Array();
    $tableBodyStorehouse.iterateTableCol(colIndex, ($cell, $row) => {
        tableBodyAllElement.push($row);
    }).emptyStorehouse();
    tableBodyAllElement.sort(
        ($lhsRow, $rhsRow) => {
            let lhsValue = $lhsRow.find('td')[colIndex].textContent;
            let lhsValueNum = parseFloat(lhsValue);
            let rhsValue = $rhsRow.find('td')[colIndex].textContent;
            let rhsValueNum = parseFloat(rhsValue);
            return (isNaN(lhsValueNum) || isNaN(rhsValueNum))
                ? (isSortAsc ? (lhsValue.localeCompare(rhsValue, 'zh')) : (rhsValue.localeCompare(lhsValue, 'zh')))
                : (isSortAsc ? (lhsValueNum - rhsValueNum) : (rhsValueNum - lhsValueNum));
        }
    );
    tableBodyAllElement.forEach($value => {
        let temp = new StationPriceDTO();
        temp.stationId = $($value.find('td')[0]).find('input').val();
        temp.stationPriceFactoryPrice = $value.find('td')[2].textContent;
        temp.stationPriceSalesPrice = $value.find('td')[3].textContent;
        $tableBodyStorehouse.addOrUpdateStationGoodsTableRow(
            $value.find('td')[1].textContent, temp);
    });
    //$.messageBox("排序完成", 'alert_');
}

/**
 * Descriptions: 返回此cell在表格中的index 若失败返回-1</p><p>
 *
 * @author SailHe
 * @date 2018/9/11 18:06
 */
$.fn.getColIndex = function (cellTag) {
    let $row = this.closest('tr');
    if (this.length > 1) {
        throw new Error("此方法暂不支持多元素操作!");
    }
    let $currentCol = this[0];
    let index = -1;
    let $allCol = $row.find(cellTag);
    let len = $allCol.length;
    while (index < len) {
        ++index;
        if ($allCol[index] === $currentCol) {
            break;
        }
    }
    return index >= len ? -1 : index;
}

$.fn.replaceClass = function (oldClassName, newClassName) {
    this.removeClass(oldClassName);
    this.addClass(newClassName);
    return this;
}

//排序
$('.sortable-col').on('click', function () {
    const colIndex = $(this).getColIndex('th');
    let sortAsc = true;
    const $currentBtn = $(this);
    if (isValidVar($currentBtn.hasClass('sorting-both'))) {
        $('.sortable-col').removeClass('sorting-desc').removeClass('sorting-asc').addClass('sorting-both');
        $currentBtn.replaceClass('sorting-both', 'sorting-asc');
    } else {
        if (isValidVar($currentBtn.hasClass('sorting-asc'))) {
            $('.sortable-col').removeClass('sorting-desc').removeClass('sorting-asc').addClass('sorting-both');
            $currentBtn.replaceClass('sorting-both', 'sorting-desc');
            sortAsc = false;
        } else {
            $('.sortable-col').removeClass('sorting-desc').removeClass('sorting-asc').addClass('sorting-both');
            $currentBtn.replaceClass('sorting-both', 'sorting-asc');
        }
    }
    if (colIndex > 0) {
        //$.messageBox(`按照第${colIndex}列排序`);
        tableColSort(colIndex, sortAsc);
    }
});

$('.searcher').on('searchUtility', function () {
    let searchText = this.value;
    $tableBodyStorehouse.iterateTableCol(0, ($cell, $row) => {
        if ($row.text().indexOf(searchText) < 0) {
            $row.prop('class', 'deleter');
            //不能置为 false
            duplicateBuffer[$cell.find('input').val()] = undefined;
        }
    });
    $('.deleter').deleteTableRow();
});

//键盘事件监听
$('#stationInfoModal').on('keypress', function (event) {
    //enter事件
    if (event.keyCode == "13") {
        //提交搜索时使用ajax->阻止表单的默认行为
        event.preventDefault();
        $('#stationSubmitButton').trigger('click');
    }
});

$('.btn-untitled').on('click', function () {
    $.messageBox("这是一个" + $(this).text());
});
</p>