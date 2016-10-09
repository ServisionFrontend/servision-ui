;(function (fn) {
    "use strict";

    if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {
        define(function () {
            fn(jQuery);
        });
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = fn(jQuery);
    } else {
        fn(jQuery);
    }
})(function ($) {
    "use strict";

    var _id = 0;

    var grid = {

        init: function (target) {
            var self = this;
            var opts = $(target).data('grid').options;

            self.scrollbarWidth = util.getScrollbarWidth();
            self.initGlobalScope(target);
            self.render(target);
            self.initJqueryObject(target);
            self.initEvent(target);
            self.initPlugins(target);
            if (opts.autoLoad) self.loadData(target);
        },

        initGlobalScope: function (target) {
            var self = this;
            var $target = $(target);
            var opts = $target.data('grid').options;

            target.ns = {};

            target.ns.minWidth = '30px';
            target.ns.cssPrefix = $.trim(opts.cssPrefix);
            target.ns.id = _id++;
            target.ns.tbodyIdList = [];
            target.ns.divDragLine = null;
            target.ns.originPointX = 0;
            target.ns.leftFrozenCols = [];
            target.ns.rightFrozenCols = [];
            target.ns.unFrozenCols = [];
            target.ns.leftFrozenColsW = 0;
            target.ns.rightFrozenColsW = 0;
            target.ns.unFrozenColsW = 0;
            target.ns.unFrozenColsWrapperW = 0;
            target.ns.store = null;
            target.ns.templateMap = JSON.parse(
                JSON.stringify(self.templateMap)
                    .replace(/\{cssPrefix\}/g, target.ns.cssPrefix)
            );
            target.ns.multiSelect = opts.multiSelect;
            target.ns.params = {
                paging: {},
                filters: {},
                sorts: []
            };
        },

        render: function (target) {
            var self = this;
            var $target = $(target);
            var opts = $target.data('grid').options;
            var html = self.createShellHtml(target, opts);

            opts.onBeforeRender && opts.onBeforeRender.call(null, target);

            $target.html(html);

            opts.onAfterRender && opts.onAfterRender.call(null, target);
        },

        initJqueryObject: function (target) {
            var self = this;
            var $target = $(target);
            var cssPrefix = target.ns.cssPrefix;

            target.jq = {};

            target.jq.$curDragTarget = null;
            target.jq.$cols = $target.find('colgroup');
            target.jq.$rows = $target.find('tr');
            target.jq.$headerCols = $target.find('.' + cssPrefix + 'table-column');
            target.jq.$headerColsText = $target.find('.' + cssPrefix + 'table-column:not(.' + cssPrefix + 'grid-disable-sort) .s-grid-text');
            target.jq.$btnSelectAll = $target.find('.' + cssPrefix + 'table-header .' + cssPrefix + 'grid-check-wrapper');
            target.jq.$loading = $target.find('.' + cssPrefix + 'grid-loading-mask');
        },

        initEvent: function (target) {
            var self = this;
            var $target = $(target);
            var opts = $target.data('grid').options;
            var cssPrefix = target.ns.cssPrefix;

            $target.find('.' + cssPrefix + 'table-wrapper').on({
                'mousewheel DOMMouseScroll': function (e) {
                    var $this = $(this);
                    var $table = $this.find('table');
                    var deltaY = 20;
                    var tableWrapperH = $this.height();
                    var tableH = $table.outerHeight();
                    var boundLength = tableH - tableWrapperH + 50;
                    var $closestGridTable = $this.closest('.' + cssPrefix + 'grid-table');
                    var temp;

                    if (util.getMousewheelDirection(e) === 'up') {  // 鼠标向上滚动
                        temp = $this.scrollTop() - deltaY;
                        $this.scrollTop(temp >= 0 ? temp : 0);
                    } else if (util.getMousewheelDirection(e) === 'down') {
                        temp = $this.scrollTop() + deltaY;
                        $this.scrollTop(temp <= boundLength ? temp : boundLength);
                    }

                    $closestGridTable
                        .siblings('.' + cssPrefix + 'grid-table')
                        .find('.' + cssPrefix + 'table-wrapper')
                        .scrollTop($this.scrollTop());
                },
                'scroll': function (e) {
                    var $this = $(this);
                    var $closestGridTable = $this.closest('.' + cssPrefix + 'grid-table');

                    $closestGridTable
                        .find('.' + cssPrefix + 'table-header')
                        .css({
                            left: -$this.scrollLeft() + 'px'
                        });

                    $closestGridTable
                        .siblings('.' + cssPrefix + 'grid-table')
                        .find('.' + cssPrefix + 'table-wrapper')
                        .scrollTop($this.scrollTop());
                }
            });

            $target.find('.' + cssPrefix + 'table-column:not(.' + cssPrefix + 'grid-disable-resize)').on({
                'mousedown': function (e) {
                    var $this = $(this);
                    var offsetLeft = $this.offset().left;
                    var width = $this.outerWidth();
                    var pointX = offsetLeft + width - e.pageX;

                    if (pointX >= 0 && pointX < 5) {
                        target.jq.$curDragTarget = $this;
                        target.ns.originPointX = e.pageX;
                        self.createTableDragMask(target, e);
                    }
                },
                'mouseenter mousemove': function (e) {
                    var $this = $(this);
                    var offsetLeft = $this.offset().left;
                    var width = $this.outerWidth();
                    var pointX = offsetLeft + width - e.pageX;

                    if (pointX >= 0 && pointX < 5) {
                        $this.css({'cursor': 'col-resize'});
                    } else {
                        $this.css({'cursor': 'default'});
                    }
                }
            });

            target.jq.$btnSelectAll.on({
                'click': function (e) {
                    var $this = $(this);

                    if ($this.is('.' + cssPrefix + 'grid-row-selected')) {
                        $this.removeClass(cssPrefix + 'grid-row-selected');
                        target.jq.$rows.removeClass(cssPrefix + 'grid-row-selected');
                    } else {
                        $this.addClass(cssPrefix + 'grid-row-selected');
                        target.jq.$rows.addClass(cssPrefix + 'grid-row-selected');
                    }
                }
            });

            $target.find('table').on({
                'mouseleave': function () {
                    var len = target.jq.$rows.length;

                    for (var i = 0; i < len; i++) {
                        var $temp = $(target.jq.$rows[i]);

                        $temp.removeClass(cssPrefix + 'grid-row-hover');
                    }
                }
            });

            target.jq.$headerColsText.on({
                'click': function () {
                    var $curCol = $(this).closest('.s-table-column');
                    var len = target.jq.$headerCols.length;
                    var $temp = null;
                    var query = target.plugins.query;
                    var params = {
                        sorts: []
                    };

                    opts.onBeforeSort && opts.onBeforeSort.call(null, this);

                    if (query && query.query && query.query('isRequiredIsEmpty')) return;

                    target.jq.$btnSelectAll.removeClass(cssPrefix + 'grid-row-selected');

                    for (var i = 0; i < len; i++) {

                        if (target.jq.$headerCols[i] !== $curCol[0]) {
                            $temp = $(target.jq.$headerCols[i]);
                            $temp.removeClass(cssPrefix + 'grid-sort-asc').removeClass(cssPrefix + 'grid-sort-desc');
                        }
                    }

                    if ($curCol.hasClass(cssPrefix + 'grid-sort-asc')) {
                        $curCol.removeClass(cssPrefix + 'grid-sort-asc').addClass(cssPrefix + 'grid-sort-desc');
                    } else if ($curCol.hasClass(cssPrefix + 'grid-sort-desc')) {
                        $curCol.removeClass(cssPrefix + 'grid-sort-desc');
                    } else {
                        if ($curCol.is(':not(.' + cssPrefix + 'grid-disable-sort)')) {
                            $curCol.addClass(cssPrefix + 'grid-sort-asc');
                        }
                    }

                    var index = $curCol.data('index');
                    var isAsc = $curCol.is('.' + cssPrefix + 'grid-sort-asc') ? true : $curCol.is('.' + cssPrefix + 'grid-sort-desc') ? false : null;

                    if (typeof isAsc === 'boolean') {
                        params.sorts.push({
                            field: index,
                            asc: isAsc
                        });
                    }
                    self.loadData(target, params);

                    opts.onAfterSort && opts.onAfterSort.call(null, this);
                }
            });

            self.initRowEvent(target);
        },

        initRowEvent: function (target) {
            var cssPrefix = target.ns.cssPrefix;
            var opts = $(target).data('grid').options;

            target.jq.$rows.on({
                'mouseenter': function (e) {
                    var $this = $(this);
                    var rowIndex = $this.data('row-index');
                    var len = target.jq.$rows.length;

                    for (var i = 0; i < len; i++) {
                        var $temp = $(target.jq.$rows[i]);

                        $temp.is('tr[data-row-index="' + rowIndex + '"]') ? $temp.addClass(cssPrefix + 'grid-row-hover') : $temp.removeClass(cssPrefix + 'grid-row-hover');
                    }
                },
                'click': function (e) {
                    var $this = $(this);
                    var rowIndex = $this.data('row-index');
                    var len = target.jq.$rows.length;
                    var count = 0;
                    var $temp;

                    opts.onClickRow && opts.onClickRow.call(null, this);

                    if ($this.is('.' + cssPrefix + 'grid-row-selected')) {

                        target.jq.$btnSelectAll.removeClass(cssPrefix + 'grid-row-selected');

                        for (var i = 0; i < len; i++) {
                            $temp = $(target.jq.$rows[i]);
                            if ($temp.is('tr[data-row-index="' + rowIndex + '"]')) $temp.removeClass(cssPrefix + 'grid-row-selected');
                        }
                        return;
                    }

                    if (target.ns.multiSelect) {
                        for (var j = 0; j < len; j++) {
                            $temp = $(target.jq.$rows[j]);

                            if ($temp.is('tr[data-row-index="' + rowIndex + '"]')) {
                                $temp.addClass(cssPrefix + 'grid-row-selected');
                                count++;
                            } else if ($temp.is('.' + cssPrefix + 'grid-row-selected')) {
                                count++;
                            }
                        }

                        if (count === len) {
                            target.jq.$btnSelectAll.addClass(cssPrefix + 'grid-row-selected');
                        } else {
                            target.jq.$btnSelectAll.removeClass(cssPrefix + 'grid-row-selected');
                        }

                        return;
                    }

                    for (var k = 0; k < len; k++) {
                        $temp = $(target.jq.$rows[k]);

                        $temp.is('tr[data-row-index="' + rowIndex + '"]') ? $temp.addClass(cssPrefix + 'grid-row-selected') : $temp.removeClass(cssPrefix + 'grid-row-selected');
                    }
                }
            });
        },

        initPlugins: function (target) {
            var self = this;
            var $target = $(target);
            var plugins = $target.data('grid').options.plugins;

            target.plugins = {};

            plugins && $.extend(true, target.plugins, plugins);

            self.initPluginsEvent(target);
        },

        initPluginsEvent: function (target) {
            var self = this;
            var plugins = target.plugins;

            for (var i in plugins) {
                if (plugins.hasOwnProperty(i)) {
                    var $temp = plugins[i];

                    if (i === 'pagination') {
                        $temp.on({
                            'changePage': function (e, params) {
                                self.loadData(target, {paging: params});
                            }
                        });
                    } else if (i === 'query') {
                        $temp.on({
                            'query': function (e, params) {
                                self.loadData(target, {filters: params});
                            }
                        });
                    }
                }
            }
        },

        createShellHtml: function (target, opts) {
            var self = this;
            var templateMap = target.ns.templateMap;
            var html = '';

            self.assignColumns(target, opts);

            html += templateMap.wrapper.begin
                .replace(/\{width\}/g, opts.width);

            html += templateMap.loading
                .replace('{top}', opts.theadHeight);

            html += self.controlCreateHtml(target, opts, false);

            html += templateMap.wrapper.end;

            return html;
        },

        assignColumns: function (target, opts) {
            var self = this;
            var cols = opts.columns;
            var len = cols.length;
            var temp;

            self.resetFlexWidth(target, opts);

            for (var i = 0; i < len; i++) {
                temp = cols[i];
                if (temp.frozen) {
                    switch (opts.frozenAlign) {
                        case 'right':
                            target.ns.rightFrozenColsW += temp.width;
                            target.ns.rightFrozenCols.push(temp);
                            break;
                        case 'left-right':
                            if (temp.align === 'right') {
                                target.ns.rightFrozenColsW += temp.width;
                                target.ns.rightFrozenCols.push(temp);
                            } else {
                                target.ns.leftFrozenColsW += temp.width;
                                target.ns.leftFrozenCols.push(temp);
                            }
                            break;
                        case 'left':
                        default:
                            target.ns.leftFrozenColsW += temp.width;
                            target.ns.leftFrozenCols.push(temp);
                    }
                } else {
                    target.ns.unFrozenColsW += temp.width;
                    target.ns.unFrozenCols.push(temp);
                }
            }

            target.ns.unFrozenColsWrapperW = parseInt(opts.width) - target.ns.leftFrozenColsW - target.ns.rightFrozenColsW;
        },

        resetFlexWidth: function (target, opts) {
            var self = this;
            var cols = opts.columns;
            var len = cols.length;
            var widthCount = 0;
            var flexCount = 0;
            var temp;
            var flexCols = [];
            var unitWidth;
            var result;

            if (opts.withCheckbox) widthCount += parseInt(opts.checkboxWidth);
            if (opts.withRowNumber) widthCount += parseInt(opts.rowNumberWidth);

            for (var i = 0; i < len; i++) {
                temp = cols[i];
                if (temp.width) {
                    temp.width = parseInt(temp.width);
                    widthCount += temp.width;
                } else if (temp.flex) {
                    temp.flex = parseInt(temp.flex);
                    flexCount += temp.flex;
                    flexCols.push(temp);
                } else {
                    temp.width = parseInt(target.ns.minWidth);
                    widthCount += temp.width;
                }
            }

            unitWidth = flexCount ? (parseInt(opts.width) - widthCount) / flexCount : 0;
            result = parseInt(unitWidth > parseInt(target.ns.minWidth) ? unitWidth : target.ns.minWidth);

            for (var j = 0; j < flexCols.length; j++) {
                temp = flexCols[j];
                temp.width = result * temp.flex;
            }
        },

        controlCreateHtml: function (target, opts, isOnlyUpdateTbody) {
            var self = this;
            var html = null;
            var htmlLeftFrozenPart = '';
            var htmlRightFrozenPart = '';
            var htmlUnfrozenPart = '';
            var createHtml = isOnlyUpdateTbody ? self.createTbodyHtml : self.createGridTableHtml;

            var deltaColIndex = 0;

            if (opts.withCheckbox) deltaColIndex++;
            if (opts.withRowNumber) deltaColIndex++;

            switch (opts.frozenAlign) {
                case 'right':
                    htmlUnfrozenPart = createHtml.call(self, target, opts, '', 0);
                    htmlRightFrozenPart = createHtml.call(self, target, opts, 'right', target.ns.unFrozenCols.length + deltaColIndex);
                    html = [htmlUnfrozenPart, htmlRightFrozenPart];
                    break;
                case 'left-right':
                    htmlLeftFrozenPart = createHtml.call(self, target, opts, 'left', 0);
                    htmlUnfrozenPart = createHtml.call(self, target, opts, '', target.ns.leftFrozenCols.length + deltaColIndex);
                    htmlRightFrozenPart = createHtml.call(self, target, opts, 'right', target.ns.leftFrozenCols.length + target.ns.unFrozenCols.length + deltaColIndex);
                    html = [htmlLeftFrozenPart, htmlUnfrozenPart, htmlRightFrozenPart];
                    break;
                case 'left':
                    htmlLeftFrozenPart = createHtml.call(self, target, opts, 'left', 0);
                    htmlUnfrozenPart = createHtml.call(self, target, opts, '', target.ns.leftFrozenCols.length + deltaColIndex);
                    html = [htmlLeftFrozenPart, htmlUnfrozenPart];
                    break;
                default:
                    htmlUnfrozenPart = createHtml.call(self, target, opts, '', 0);
                    html = [htmlUnfrozenPart];
            }

            return isOnlyUpdateTbody ? html : html.join('');
        },

        createGridTableHtml: function (target, opts, align, beginColIndex) {
            var self = this;
            var templateMap = target.ns.templateMap;
            var htmlGridTable = '';
            var htmlColgroup = '';
            var originalColIndex = beginColIndex;
            var cols;
            var colsW;
            var deltaW = 0;
            var tbodyId;
            var len;
            var temp;

            if (align === 'left') {
                cols = target.ns.leftFrozenCols;
                colsW = target.ns.leftFrozenColsW;
            } else if (align === 'right') {
                cols = target.ns.rightFrozenCols;
                colsW = target.ns.rightFrozenColsW;
            } else {
                cols = target.ns.unFrozenCols;
                colsW = target.ns.unFrozenColsWrapperW;
            }

            len = cols.length;

            if (!len) return '';

            tbodyId = target.ns.cssPrefix + 'grid-tbody-' + target.ns.id + '-' + target.ns.tbodyIdList.length;
            target.ns.tbodyIdList.push(tbodyId);

            if (originalColIndex) {
                if (opts.withCheckbox) deltaW -= parseInt(opts.checkboxWidth);
                if (opts.withRowNumber) deltaW -= parseInt(opts.rowNumberWidth);
            } else {
                if (opts.withCheckbox) deltaW += parseInt(opts.checkboxWidth);
                if (opts.withRowNumber) deltaW += parseInt(opts.rowNumberWidth);
            }

            htmlGridTable += templateMap.gridTable.begin
                .replace('{align}', align)
                .replace('{width}', self.getGridTableW(target, opts, align, beginColIndex, colsW, deltaW) + 'px');

            htmlGridTable += templateMap.tableHeader.begin
                .replace('{width}', self.getFixedTableHeaderW(target, opts, align, beginColIndex, deltaW))
                .replace('{theadHeight}', opts.theadHeight)
                .replace('{theadLineHeight}', opts.theadHeight);

            if (!originalColIndex && opts.withCheckbox) {
                htmlColgroup += templateMap.colgroup
                    .replace('{width}', opts.checkboxWidth);

                htmlGridTable += templateMap.tableColumn.begin
                    .replace('{classList}', self.createColumnClass(target, {isCheckbox: true}))
                    .replace('{colIndex}', beginColIndex++)
                    .replace('{index}', 'checkbox')
                    .replace('{width}', opts.checkboxWidth)
                    .replace('{theadHeight}', opts.theadHeight)
                    .replace('{theadLineHeight}', parseInt(opts.theadHeight) - 1 + 'px');

                if (opts.multiSelect) {
                    htmlGridTable += templateMap.checkbox;
                }

                htmlGridTable += templateMap.tableColumn.end;
            }

            if (!originalColIndex && opts.withRowNumber) {
                htmlColgroup += templateMap.colgroup
                    .replace('{width}', opts.rowNumberWidth);

                htmlGridTable += templateMap.tableColumn.begin
                    .replace('{classList}', self.createColumnClass(target, {isRowNumber: true}))
                    .replace('{colIndex}', beginColIndex++)
                    .replace('{index}', 'checkbox')
                    .replace('{width}', opts.rowNumberWidth)
                    .replace('{theadHeight}', opts.theadHeight)
                    .replace('{theadLineHeight}', parseInt(opts.theadHeight) - 1 + 'px');

                htmlGridTable += templateMap.gridText
                    .replace('{title}', opts.lang.toLowerCase() === 'en' ? 'NO.' : '序号');
                htmlGridTable += templateMap.tableColumn.end;
            }

            for (var i = 0; i < len; i++) {
                temp = cols[i];
                htmlColgroup += templateMap.colgroup
                    .replace('{width}', temp.width + 'px');

                htmlGridTable += templateMap.tableColumn.begin
                    .replace('{classList}', self.createColumnClass(target, temp))
                    .replace('{colIndex}', beginColIndex++)
                    .replace('{index}', temp.index)
                    .replace('{width}', temp.width + 'px')
                    .replace('{theadHeight}', opts.theadHeight)
                    .replace('{theadLineHeight}', parseInt(opts.theadHeight) - 1 + 'px');

                htmlGridTable += templateMap.gridText
                    .replace('{title}', temp.title);

                if (temp.resizeable) {
                    htmlGridTable += templateMap.dragQuarantine;
                }
                htmlGridTable += templateMap.tableColumn.end;
            }
            htmlGridTable += templateMap.tableHeader.end;
            htmlGridTable += self.getTableWrapperBeginHtml(target, opts, align);
            htmlGridTable += htmlColgroup;
            htmlGridTable += templateMap.tbody.begin
                .replace('{id}', tbodyId);

            if (opts.localData) {
                target.ns.store = opts.localData;
                htmlGridTable += self.createTbodyHtml(target, opts, align, beginColIndex);
            }

            htmlGridTable += templateMap.tbody.end;
            htmlGridTable += templateMap.tableWrapper.end;
            htmlGridTable += templateMap.gridTable.end;

            return htmlGridTable;
        },

        getGridTableW: function (target, opts, align, beginColIndex, colsW, deltaW) {
            var self = this;

            if (!target.ns.leftFrozenCols.length && align === '') {
                return colsW;
            } else if (align === 'right') {
                return colsW
            } else {
                return colsW + deltaW;
            }
        },

        createColumnClass: function (target, opt) {
            var cssPrefix = target.ns.cssPrefix;
            var classList = [cssPrefix + 'table-column'];

            if (opt.isCheckbox) classList.push(cssPrefix + 'grid-checkbox');
            if (opt.isRowNumber) classList.push(cssPrefix + 'grid-rownumber');
            if (!opt.resizeable) classList.push(cssPrefix + 'grid-disable-resize');
            if (!opt.sortable) classList.push(cssPrefix + 'grid-disable-sort');

            return classList.join(' ');
        },

        getFixedTableHeaderW: function (target, opts, align, beginColIndex, deltaW) {
            var self = this;
            var tempWidth;

            if (align) return '';

            if (!beginColIndex) {
                tempWidth = target.ns.unFrozenColsW + deltaW;
            } else {
                tempWidth = target.ns.unFrozenColsW + Math.abs(deltaW);
            }

            if (tempWidth > target.ns.unFrozenColsWrapperW) {

                if (target.ns.leftFrozenCols.length && beginColIndex) deltaW = 0;

                return (target.ns.unFrozenColsW + deltaW + self.scrollbarWidth) + 'px';
            } else {
                return '';
            }
        },

        getTableWrapperBeginHtml: function (target, opts, align) {
            var self = this;
            var templateMap = target.ns.templateMap;
            var width;
            var height;
            var tbodyHeight;
            var overflowMode;
            var temp;

            if (align === 'left') {
                width = target.ns.leftFrozenColsW;
                overflowMode = 'hidden';
                tbodyHeight = parseInt(opts.size) * parseInt(opts.trHeight);
                temp = parseInt(opts.height) - parseInt(opts.theadHeight);
                height = tbodyHeight > temp ? temp - self.scrollbarWidth : temp;
            } else if (align === 'right') {
                width = target.ns.rightFrozenColsW;
                overflowMode = 'hidden';
                tbodyHeight = parseInt(opts.size) * parseInt(opts.trHeight);
                temp = parseInt(opts.height) - parseInt(opts.theadHeight);
                height = tbodyHeight > temp ? temp - self.scrollbarWidth : temp;
            } else {
                width = target.ns.unFrozenColsW;
                overflowMode = 'auto';
                height = parseInt(opts.height) - parseInt(opts.theadHeight);
            }

            return templateMap.tableWrapper.begin
                .replace(/\{width\}/g, width + 'px')
                .replace(/\{height\}/g, height + 'px')
                .replace('{overflowMode}', overflowMode);
        },

        loadData: function (target, params, isClickedQuery) {
            var self = this;
            var $target = $(target);
            var opts = $target.data('grid').options;
            var pagination = target.plugins.pagination;
            var query = target.plugins.query;

            if (opts.url) {

                if (query && query.query && query.query('isRequiredIsEmpty')) return;

                var paginationParams = {
                    paging: pagination && pagination.pagination && pagination.pagination('getParams')
                };

                var queryParams = {
                    filters: query && query.query && query.query('getParams')
                };

                if (isClickedQuery) paginationParams.paging.page = 1;

                target.jq.$loading.show();

                $.extend(target.ns.params, queryParams, paginationParams, params);

                var queryString = '';
                var tempParams = null;
                if (opts.method.toLowerCase() === 'get') {
                    queryString = opts.rebuildAjaxParams ? (opts.rebuildAjaxParams.call(target, target.ns.params) || '?args=' + JSON.stringify(target.ns.params)) : '?args=' + JSON.stringify(target.ns.params);
                } else {
                    tempParams = opts.rebuildAjaxParams ? (opts.rebuildAjaxParams.call(target, target.ns.params) || target.ns.params) : target.ns.params;
                }

                $.ajax({
                    url: encodeURI(opts.url + queryString),
                    type: opts.method,
                    cache: opts.cache,
                    timeout: opts.timeout,
                    data: tempParams,
                    dataType: 'json',
                    beforeSend: opts.onAjaxBeforeSend,
                    complete: opts.onAjaxComplete,
                    error: function () {
                        target.jq.$loading.hide();
                        opts.onAjaxError && opts.onAjaxError.apply(null, Array.prototype.slice.apply(null, arguments));
                    },
                    success: function (result) {
                        result = opts.rebuildAjaxResponse ? (opts.rebuildAjaxResponse.call(target, result) || result) : result;

                        self.renderTbody(target, opts, result);
                        target.jq.$rows = $target.find('tr');
                        self.initRowEvent(target);
                        target.jq.$loading.hide();

                        pagination && pagination.pagination && pagination.pagination('update', result);
                        opts.onAjaxSuccess && opts.onAjaxSuccess.apply(null, [result]);
                    }
                });
            }
        },

        renderTbody: function (target, opts, result) {
            var self = this;
            var $target = $(target);
            var htmlList;
            var temp;

            target.ns.store = result;

            htmlList = self.controlCreateHtml(target, opts, true);

            for (var i = 0; i < target.ns.tbodyIdList.length; i++) {
                temp = target.ns.tbodyIdList[i];
                $target.find('#' + temp).html(htmlList[i]);
            }
        },

        createTbodyHtml: function (target, opts, align, beginColIndex) {
            var self = this;
            var templateMap = target.ns.templateMap;
            var htmlTbody = '';
            var originalColIndex = beginColIndex;
            var list = target.ns.store[opts.root];
            var rowNumberStart = target.ns.store.start || 0;
            var listLen = list.length;
            var cols;
            var colsLen;
            var tempCol;
            var temp;
            var title;
            var index;

            if (align === 'left') {
                cols = target.ns.leftFrozenCols;
            } else if (align === 'right') {
                cols = target.ns.rightFrozenCols;
            } else {
                cols = target.ns.unFrozenCols;
            }

            colsLen = cols.length;

            if (!colsLen) return '';

            for (var i = 0; i < listLen; i++) {
                htmlTbody += templateMap.tr.begin
                    .replace('{rowIndex}', i);

                if (self.isGridTableNeed(target, opts, align)) {
                    if (opts.withCheckbox) htmlTbody += templateMap.tdCheckbox
                        .replace('{trHeight}', opts.trHeight)
                        .replace('{trLineHeight}', parseInt(opts.trHeight) - 1 + 'px');

                    if (opts.withRowNumber) htmlTbody += templateMap.tdRowNumber
                        .replace('{trHeight}', opts.trHeight)
                        .replace('{trLineHeight}', parseInt(opts.trHeight) - 1 + 'px')
                        .replace('{number}', rowNumberStart + i + 1);
                }

                for (var j = 0; j < colsLen; j++) {
                    tempCol = cols[j];
                    index = tempCol['index'];

                    if (tempCol['renderer'] && typeof tempCol['renderer'] === 'function') {
                        title = '';
                        temp = tempCol['renderer'].apply(null, [list[i][index], list[i], list]);
                    } else {
                        temp = title = list[i][index] ? list[i][index] : (list[i][index] == '0' ? list[i][index] : '');
                    }

                    htmlTbody += templateMap.td
                        .replace('{className}', tempCol.className ? 'class="' + tempCol['className'] + '"' : '')
                        .replace('{trHeight}', opts.trHeight)
                        .replace('{trLineHeight}', parseInt(opts.trHeight) - 1 + 'px')
                        .replace('{title}', title)
                        .replace('{content}', temp);
                }
                htmlTbody += templateMap.tr.end;
            }

            return htmlTbody;
        },

        isGridTableNeed: function (target, opts, align) {
            if (!align && !target.ns.leftFrozenCols.length) return true;
            if (align === 'left') return true;
            if (align === 'right' && !target.ns.leftFrozenCols.length && !target.ns.unFrozenCols.length) return true;

            return false;
        },

        createTableDragMask: function (target, e) {
            var self = this;
            var cssPrefix = target.ns.cssPrefix;
            var mousePosition = util.getEventPosition(e);
            var gridWrapperH = target.jq.$curDragTarget.closest('.' + cssPrefix + 'grid-wrapper').outerHeight();

            target.ns.divDragLine = document.createElement('div');
            target.ns.divDragLine.className = cssPrefix + 'grid-drag-line';
            target.ns.divDragLine.style.cssText = 'width:1px;height:' + gridWrapperH + 'px;left:' + mousePosition.x + 'px;top:' + target.jq.$curDragTarget.offset().top + 'px;position:absolute;background:black;z-index:999900;';

            document.body.appendChild(target.ns.divDragLine);

            $(document).on({
                'mousemove': dragAndCalculate,
                'mouseup': finishResizeColumn
            });

            function dragAndCalculate(e) {
                var minColumnW = parseInt(target.ns.minWidth);
                var curDragTargetW = target.jq.$curDragTarget.outerWidth();
                var mousePosition = util.getEventPosition(e);
                var $gridWrapper = target.jq.$curDragTarget.closest('.' + cssPrefix + 'grid-wrapper');
                var gridWrapperW = $gridWrapper.outerWidth();
                var gridWrapperLeft = $gridWrapper.offset().left;

                util.clearDocumentSelection();

                if (curDragTargetW + mousePosition.x - target.ns.originPointX >= minColumnW) {
                    if (mousePosition.x < gridWrapperLeft + gridWrapperW - self.scrollbarWidth && mousePosition.x > gridWrapperLeft) {
                        target.ns.divDragLine.style.opacity = 1;
                    } else {
                        target.ns.divDragLine.style.opacity = 0;
                    }
                    target.ns.divDragLine.style.left = mousePosition.x + 'px';
                }
            }

            function finishResizeColumn(e) {

                resizeColumn();

                $(document).off({
                    'mousemove': dragAndCalculate,
                    'mouseup': finishResizeColumn
                });

                target.ns.divDragLine && document.body.removeChild(target.ns.divDragLine);
                target.jq.$curDragTarget = null;
            }

            function resizeColumn() {
                var colIndex = target.jq.$curDragTarget.data('col-index');
                var deltaX = parseInt(target.ns.divDragLine.style.left) - target.ns.originPointX;
                var $curCol = $(target.jq.$cols[colIndex]).find('col');
                var $curTable = $curCol.closest('table');
                var $curTableHeader = target.jq.$curDragTarget.closest('.' + cssPrefix + 'table-header');
                var $curGridTable = target.jq.$curDragTarget.closest('.' + cssPrefix + 'grid-table');
                var $gridWrapper = target.jq.$curDragTarget.closest('.' + cssPrefix + 'grid-wrapper');
                var $gridWrapperInner = target.jq.$curDragTarget.closest('.' + cssPrefix + 'grid-wrapper-inner');
                var gridWrapperW = $gridWrapper.outerWidth();
                var curColumnW = $curCol.outerWidth() + deltaX;

                target.jq.$curDragTarget[0].style.width = $curCol[0].style.width = curColumnW + 'px';

                $curTableHeader[0].style.width = $curTableHeader.outerWidth() + deltaX + 'px';

                if ($curGridTable.data('frozen') === 'left' || $curGridTable.data('frozen') === 'right') {
                    $gridWrapperInner[0].style.width = $gridWrapperInner.outerWidth() + deltaX + 'px';
                    $curTable[0].style.width = $curTableHeader.outerWidth() + 'px';
                    $curGridTable[0].style.width = $curGridTable.outerWidth() + deltaX + 'px';
                } else {
                    $curTable[0].style.width = $curTableHeader.outerWidth() - self.scrollbarWidth + 'px';
                }
            }
        },

        templateMap: {
            wrapper: {
                begin: '<div class="{cssPrefix}grid-wrapper-outer"><div class="{cssPrefix}grid-wrapper" style="width:{width};"><div class="{cssPrefix}grid-wrapper-inner" style="width:{width};">',
                end: '</div></div></div>'
            },
            gridTable: {
                begin: '<div class="{cssPrefix}grid-table" data-frozen="{align}" style="width:{width};">',
                end: '</div>'
            },
            tableHeader: {
                begin: '<div class="{cssPrefix}table-header-wrapper" style="overflow:hidden;"><div class="{cssPrefix}table-header" style="width:{width};height:{theadHeight};line-height:{theadLineHeight};">',
                end: '</div></div>'
            },
            tableColumn: {
                begin: '<div class="{classList}" data-col-index="{colIndex}" data-index="{index}" style="width:{width};height:{theadHeight};line-height:{theadLineHeight};"><div class="{cssPrefix}grid-text-wrapper">',
                end: '</div></div>'
            },
            checkbox: '<span class="{cssPrefix}grid-check-wrapper"><span class="{cssPrefix}grid-check"></span></span>',
            gridText: '<span class="{cssPrefix}grid-text">{title}</span>',
            dragQuarantine: '<span class="sc-grid-drag-quarantine"></span>',
            tableWrapper: {
                begin: '<div class="{cssPrefix}table-wrapper" style="height:{height};overflow:{overflowMode};"><div style="height:{height};"><table style="width:{width};" cellspacing="0" cellpadding="0" border="0">',
                end: '</table></div></div>'
            },
            colgroup: '<colgroup><col style="width:{width};"/></colgroup>',
            tbody: {
                begin: '<tbody id="{id}">',
                end: '</tbody>'
            },
            tr: {
                begin: '<tr data-row-index="{rowIndex}">',
                end: '</tr>'
            },
            td: '<td {className} style="height:{trHeight};line-height:{trLineHeight};" title="{title}">{content}</td>',
            tdCheckbox: '<td class="{cssPrefix}grid-checkbox" style="height:{trHeight};line-height:{trLineHeight};"><span class="{cssPrefix}grid-check-wrapper"><span class="{cssPrefix}grid-check"></span></span></td>',
            tdRowNumber: '<td class="{cssPrefix}grid-rownumber" style="height:{trHeight};line-height:{trLineHeight};">{number}</td>',
            loading: '<div class="{cssPrefix}grid-loading-mask" style="top:{top};"><span class="{cssPrefix}grid-loading"></span></div>'
        }
    };

    var util = {

        getScrollbarWidth: function () {
            var divA = document.createElement('div');
            var divB = document.createElement('div');
            var result;

            divA.style.overflowY = 'hidden';
            divB.style.height = '1px';
            divA.appendChild(divB);
            document.body.appendChild(divA);
            var tempWidth = divB.clientWidth;
            divA.style.overflowY = 'scroll';
            result = tempWidth - divB.clientWidth;
            document.body.removeChild(divA);

            return result;
        },

        getEventPosition: function (e) {
            return {
                x: e.pageX,
                y: e.pageY
            };
        },

        clearDocumentSelection: function () {
            if (document.selection) {
                document.selection.empty ? document.selection.empty() : (document.selection = null);
            } else if (window.getSelection) {
                window.getSelection().removeAllRanges();
            }
        },

        getMousewheelDirection: function (e) {
            if (e.originalEvent.wheelDelta) {  // 非firefox
                return e.originalEvent.wheelDelta > 0 ? 'up' : 'down';
            } else if (e.originalEvent.detail) {
                return e.originalEvent.detail > 0 ? 'down' : 'up';
            }
        }
    };

    $.fn.grid = function (options, params) {
        if (typeof options == 'string') {
            return $.fn.grid.methods[options](this, params);
        }

        options = options || {};

        return this.each(function () {
            var tempW = $(this).width();
            $.data(this, 'grid', {
                options: $.extend(true, {}, $.fn.grid.defaults, {
                    width: tempW ? tempW + 'px' : '800px',
                    height: parseInt(options.theadHeight || 24) + parseInt(options.trHeight || 24) * parseInt(options.size || 20)
                }, options)
            });

            return grid.init(this);
        });
    };

    $.fn.grid.methods = {
        loadData: function ($target, params) {

            grid.loadData($target[0], params);
        }
    };

    $.fn.grid.defaults = {
        cssPrefix: 's-',
        lang: 'zh',  // 'en' | 'zh'
        width: '',
        height: '',
        size: 20,
        autoLoad: false,
        withCheckbox: true,
        checkboxWidth: '26px',
        withRowNumber: true,
        rowNumberWidth: '44px',
        multiSelect: false,
        frozenAlign: '',  // 'left' | 'right' | 'left-right' | ''
        theadHeight: '24px',
        trHeight: '24px',
        columns: [],
        plugins: null,
        localData: null,
        url: '',
        method: 'GET',
        cache: false,
        timeout: 3000,
        root: 'list',
        params: null,
        onAjaxBeforeSend: null,
        onAjaxComplete: null,
        onAjaxError: null,
        onAjaxSuccess: null,
        onBeforeRender: null,
        onAfterRender: null,
        onClickRow: null,
        onBeforeSort: null,
        onAfterSort: null,
        rebuildAjaxParams: null,
        rebuildAjaxResponse: null
    };
});