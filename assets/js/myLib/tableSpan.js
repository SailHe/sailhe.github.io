/**
 * Descriptions: 合并指定行<p>
 *
 * @param 无需合并的行
 * @author SailHe
 * @date 2018/4/18 21:09
 */
function rowspanAssign($api, unMergeRowIdArray) {
    //$(selector).dataTable().api();  -> 一个 jQuery 对象
    //var $api = this.api();
    // 输出当前页的数据到浏览器控制台
    console.log($api.rows({page: 'current'}).data());
    //https://datatables.net/reference/type/column-selector  ; 获取多个 tr节点
    var rowsApi = $api.rows({page: 'current'}).nodes();
    //debugger;
    // 后面的列先进行合并 初始化时会调两次 此时表格内没有数据 rowsApi[index]会错误
    for (var columnIndexSelector = rowsApi.cells().length - 1; columnIndexSelector >= 0; columnIndexSelector--) {
        var spanIndex = 0;
        /*//不被合并的行  每次合并该数组包涵的行的下一行(如果有的话)
        var unMergeRowIdArray = new Array();
        unMergeRowIdArray.push(0, 2, 3);*/
        unMergeRowIdArray.sort();
        var pastValue = {id: 0};
        /*var pastValue = null;
        pastValue.id = 0;*/
        var currentTr = null;
        var pastTd = null;
        //Sum the data for column 4:
        /*var table = $('#example').DataTable();
        alert('Column 4 sum: ' +
            table.column(4).data().reduce(function (a, b) {
                return a + b;
            })
        );*/
        //在表格上选择一列 https://datatables.net/reference/api/column()
        $api.column(columnIndexSelector, {page: 'current'})
        //获取选中列单元格的值
            .data()
            //https://datatables.net/reference/api/each()
            .each(function (value, index, currentApi) {
                currentTr = $(rowsApi[index]);
                //:eq() 选择器选取带有指定 index 值的元素。 此处是第 columnIndexSelector 个td元素
                var currentTd = $("td:eq(" + columnIndexSelector + ")", currentTr);
                //debugger;
                //若此时不是即将移除的那一行的下一行
                if (unMergeRowIdArray[spanIndex] + 1 !== index) {
                    //currentTd.attr("rowspan", 1);
                    //currentTd.text(value.innerHTML);
                    pastTd = currentTd;
                    pastValue = value;
                } else {
                    //在上一行的合并值的基础上再+1 (使之可以合并这一行)
                    //pastTd.attr("rowspan", parseInt(pastTd.attr("rowspan")) + 1);
                    //修改表格的td属性并删除掉多余的单元格（td）-> 行合并删除下方第一个td
                    pastTd.attr("rowspan", 2);
                    //移除后会影响原有的表格结构
                    //currentTd.remove();
                    //$(this).hide();
                    currentTd.hide();
                    if (++spanIndex >= unMergeRowIdArray.length) {
                        return;
                    }
                }
            });
    }
}

/**
 * Descriptions: 重复行合并, 将指定列下 所有相邻且具有相同[非空]文本的 单元行合并为一个单元行</p><p>
 *
 * @param colIdx: 含有重复元素的列(从0开始)
 * @author SailHe
 * @date 2018/4/19 19:08
 */
jQuery.fn.rowspanRepeatedly = function (colIdx) {
    //this是被jQuery选择器选中的table
    return this.each(function () {
        var pastCell;
        //遍历这个table中的每一个行
        $('tr', this).each(function (row) {
            $('td:eq(' + colIdx + ')', this).filter(':visible').each(function (col) {
                /**
                 * html() 方法返回或设置被选元素的内容 (inner HTML)。
                 * 如果该方法未设置参数，则返回被选元素的当前内容。
                 * 语义: 若在 pastCell 不为空的情况下当前单元格this的页面内容与pastCell的相等
                 * this.innerHTML <==> $(this).html()
                 * */
                //console.log($(this).html());
                if (pastCell != null && $(this).html() == $(pastCell).html() && $(this).get(0).textContent !== "") {
                    this.rowspan = $(pastCell).attr("rowSpan");
                    if (this.rowspan == undefined) {
                        $(pastCell).attr("rowSpan", 1);
                        this.rowspan = $(pastCell).attr("rowSpan");
                    }
                    this.rowspan = Number(this.rowspan) + 1;
                    $(pastCell).attr("rowSpan", this.rowspan);
                    $(this).hide();
                } else {
                    pastCell = this;
                }
            });
        });
    });
}
</==></p>