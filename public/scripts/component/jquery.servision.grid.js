!(function (fn) {
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

        init: function ($target) {
            var self = this;

            self.scrollbarWidth = util.getScrollbarWidth();
            self.initGlobalScope($target);
            self.render($target);
            self.initJqueryObject($target);
            self.initEvents($target);
        },

        initGlobalScope: function ($target) {
            var self = this;

            $target.ns = {};

            $target.ns.id = _id++;
            $target.ns.tbodyIdList = [];
            $target.ns.divDragLine = null;
            $target.ns.originPointX = 0;
            $target.ns.leftFrozenCols = [];
            $target.ns.rightFrozenCols = [];
            $target.ns.unFrozenCols = [];
            $target.ns.leftFrozenColsW = 0;
            $target.ns.rightFrozenColsW = 0;
            $target.ns.unFrozenColsW = 0;
            $target.ns.unFrozenColsWrapperW = 0;
        },

        render: function ($target) {
            var self = this;
            var data = $target.data('grid');
            var html = self.createShellHtml($target, data.options);

            return $target.html(html);
        },

        createShellHtml: function ($target, opts) {
            var self = this;
            var html = '';
            var htmlLeftFrozenPart = '';
            var htmlRightFrozenPart = '';
            var htmlUnfrozenPart = '';
            var deltaColIndex = 0;

            if (opts.withCheckbox) deltaColIndex++;
            if (opts.withRowNumber) deltaColIndex++;

            self.assignColumns($target, opts);

            html += self.templateMap.wrapper.begin.replace(/\{width\}/g, opts.width);

            switch (opts.frozenColsAlign) {
                case 'right':
                    htmlUnfrozenPart = self.createGridTableHtml($target, opts, '', 0);
                    htmlRightFrozenPart = self.createGridTableHtml($target, opts, 'right', $target.ns.unFrozenCols.length + deltaColIndex);
                    html += htmlUnfrozenPart + htmlRightFrozenPart;
                    break;
                case 'left-right':
                    htmlLeftFrozenPart = self.createGridTableHtml($target, opts, 'left', 0);
                    htmlUnfrozenPart = self.createGridTableHtml($target, opts, '', $target.ns.leftFrozenCols.length + deltaColIndex);
                    htmlRightFrozenPart = self.createGridTableHtml($target, opts, 'right', $target.ns.leftFrozenCols.length + $target.ns.unFrozenCols.length + deltaColIndex);
                    html += htmlLeftFrozenPart + htmlUnfrozenPart + htmlRightFrozenPart;
                    break;
                case 'left':
                    htmlLeftFrozenPart = self.createGridTableHtml($target, opts, 'left', 0);
                    htmlUnfrozenPart = self.createGridTableHtml($target, opts, '', $target.ns.leftFrozenCols.length + deltaColIndex);
                    html += htmlLeftFrozenPart + htmlUnfrozenPart;
                    break;
                default:
                    htmlUnfrozenPart = self.createGridTableHtml($target, opts, '', 0);
                    html += htmlUnfrozenPart;
            }

            html += self.templateMap.wrapper.end;

            return html;
        },

        assignColumns: function ($target, opts) {
            var self = this;
            var cols = opts.columns;
            var len = cols.length;
            var temp;

            for (var i = 0; i < len; i++) {
                temp = opts.columns[i];
                if (temp.frozen) {
                    switch (opts.frozenColsAlign) {
                        case 'right':
                            $target.ns.rightFrozenColsW += parseInt(temp.width);
                            $target.ns.rightFrozenCols.push(temp);
                            break;
                        case 'left-right':
                            if (temp.frozenAlign === 'right') {
                                $target.ns.rightFrozenColsW += parseInt(temp.width);
                                $target.ns.rightFrozenCols.push(temp);
                            } else {
                                $target.ns.leftFrozenColsW += parseInt(temp.width);
                                $target.ns.leftFrozenCols.push(temp);
                            }
                            break;
                        case 'left':
                        default:
                            $target.ns.leftFrozenColsW += parseInt(temp.width);
                            $target.ns.leftFrozenCols.push(temp);
                    }
                } else {
                    $target.ns.unFrozenColsW += parseInt(temp.width);
                    $target.ns.unFrozenCols.push(temp);
                }
            }

            $target.ns.unFrozenColsWrapperW = parseInt(opts.width) - $target.ns.leftFrozenColsW - $target.ns.rightFrozenColsW;
        },

        createGridTableHtml: function ($target, opts, frozenAlign, beginColIndex) {
            var self = this;
            var htmlGridTable = '';
            var htmlColgroup = '';
            var originalColIndex = beginColIndex;
            var cols;
            var colsW;
            var deltaW = 0;
            var tbodyId;
            var len;
            var temp;

            if (frozenAlign === 'left') {
                cols = $target.ns.leftFrozenCols;
                colsW = $target.ns.leftFrozenColsW;
            } else if (frozenAlign === 'right') {
                cols = $target.ns.rightFrozenCols;
                colsW = $target.ns.rightFrozenColsW;
            } else {
                cols = $target.ns.unFrozenCols;
                colsW = $target.ns.unFrozenColsWrapperW;
            }

            len = cols.length;

            if (!len) return '';

            tbodyId = $target.ns.id + '-' + $target.ns.tbodyIdList.length;
            $target.ns.tbodyIdList.push(tbodyId);

            if (originalColIndex) {
                if (opts.withCheckbox) deltaW -= parseInt(opts.checkboxWidth);
                if (opts.withRowNumber) deltaW -= parseInt(opts.rowNumberWidth);
            } else {
                if (opts.withCheckbox) deltaW += parseInt(opts.checkboxWidth);
                if (opts.withRowNumber) deltaW += parseInt(opts.rowNumberWidth);
            }

            htmlGridTable += self.templateMap.gridTable.begin.replace('{frozenAlign}', frozenAlign).replace('{width}', self.getGridTableW($target, opts, frozenAlign, beginColIndex, colsW, deltaW) + 'px');
            htmlGridTable += self.templateMap.tableHeader.begin.replace('{width}', self.getFixedTableHeaderW($target, opts, frozenAlign, beginColIndex, deltaW)).replace('{theadHeight}', opts.theadHeight).replace('{theadLineHeight}', opts.theadHeight);

            if (!originalColIndex && opts.withCheckbox) {
                htmlColgroup += self.templateMap.colgroup.replace('{width}', opts.checkboxWidth);
                htmlGridTable += self.templateMap.tableColumn.begin.replace('{classList}', self.createColumnClass({isCheckbox: true})).replace('{colIndex}', beginColIndex++).replace('{index}', 'checkbox').replace('{width}', opts.checkboxWidth).replace('{theadHeight}', opts.theadHeight).replace('{theadLineHeight}', parseInt(opts.theadHeight) - 1 + 'px');
                htmlGridTable += self.templateMap.checkbox;
                htmlGridTable += self.templateMap.tableColumn.end;
            }

            if (!originalColIndex && opts.withRowNumber) {
                htmlColgroup += self.templateMap.colgroup.replace('{width}', opts.rowNumberWidth);
                htmlGridTable += self.templateMap.tableColumn.begin.replace('{classList}', self.createColumnClass({isRowNumber: true})).replace('{colIndex}', beginColIndex++).replace('{index}', 'checkbox').replace('{width}', opts.rowNumberWidth).replace('{theadHeight}', opts.theadHeight).replace('{theadLineHeight}', parseInt(opts.theadHeight) - 1 + 'px');
                htmlGridTable += self.templateMap.gridText.replace('{title}', '序号');
                htmlGridTable += self.templateMap.tableColumn.end;
            }

            for (var i = 0; i < len; i++) {
                temp = cols[i];
                htmlColgroup += self.templateMap.colgroup.replace('{width}', temp.width);
                htmlGridTable += self.templateMap.tableColumn.begin.replace('{classList}', self.createColumnClass(temp)).replace('{colIndex}', beginColIndex++).replace('{index}', temp.index).replace('{width}', temp.width).replace('{theadHeight}', opts.theadHeight).replace('{theadLineHeight}', parseInt(opts.theadHeight) - 1 + 'px');
                htmlGridTable += self.templateMap.gridText.replace('{title}', temp.title);
                if (temp.resizeable) {
                    htmlGridTable += self.templateMap.dragQuarantine;
                }
                htmlGridTable += self.templateMap.tableColumn.end;
            }
            htmlGridTable += self.templateMap.tableHeader.end;
            htmlGridTable += self.getTableWrapperBeginHtml($target, opts, frozenAlign);
            htmlGridTable += htmlColgroup;
            htmlGridTable += self.templateMap.tbody.begin.replace('{id}', tbodyId);
            htmlGridTable += self.createTbodyHtml($target, opts, frozenAlign, beginColIndex);
            htmlGridTable += self.templateMap.tbody.end;
            htmlGridTable += self.templateMap.tableWrapper.end;
            htmlGridTable += self.templateMap.gridTable.end;

            return htmlGridTable;
        },

        getGridTableW: function ($target, opts, frozenAlign, beginColIndex, colsW, deltaW) {
            var self = this;

            if (!$target.ns.leftFrozenCols.length && frozenAlign === '') {
                return colsW;
            } else if (frozenAlign === 'right') {
                return colsW
            } else {
                return colsW + deltaW;
            }
        },

        createColumnClass: function (opt) {
            var classList = ['s-table-column'];

            if (opt.isCheckbox) classList.push('s-grid-checkbox');
            if (opt.isRowNumber) classList.push('s-grid-rownumber');
            if (!opt.resizeable) classList.push('s-grid-disable-resize');
            if (!opt.sortable) classList.push('s-grid-disable-sort');

            return classList.join(' ');
        },

        getFixedTableHeaderW: function ($target, opts, frozenAlign, beginColIndex, deltaW) {
            var self = this;

            if (frozenAlign) return '';
            if ($target.ns.unFrozenColsW > $target.ns.unFrozenColsWrapperW) {
                if ($target.ns.leftFrozenCols.length && beginColIndex) deltaW = 0;

                return ($target.ns.unFrozenColsW + deltaW + self.scrollbarWidth) + 'px';
            }

            return '';
        },

        getTableWrapperBeginHtml: function ($target, opts, frozenAlign) {
            var self = this;
            var width;
            var height;
            var tbodyHeight;
            var overflowMode;
            var temp;

            if (frozenAlign === 'left') {
                width = $target.ns.leftFrozenColsW;
                overflowMode = 'hidden';
                tbodyHeight = parseInt(opts.size) * parseInt(opts.trHeight);
                temp = parseInt(opts.height) - parseInt(opts.theadHeight);
                height = tbodyHeight > temp ? temp - self.scrollbarWidth : temp;
            } else if (frozenAlign === 'right') {
                width = $target.ns.rightFrozenColsW;
                overflowMode = 'hidden';
                tbodyHeight = parseInt(opts.size) * parseInt(opts.trHeight);
                temp = parseInt(opts.height) - parseInt(opts.theadHeight);
                height = tbodyHeight > temp ? temp - self.scrollbarWidth : temp;
            } else {
                width = $target.ns.unFrozenColsW;
                overflowMode = 'auto';
                height = parseInt(opts.height) - parseInt(opts.theadHeight);
            }

            return self.templateMap.tableWrapper.begin.replace(/\{width\}/g, width + 'px').replace(/\{height\}/g, height + 'px').replace('{overflowMode}', overflowMode);
        },

        createTbodyHtml: function ($target, opts, frozenAlign, beginColIndex) {
            var self = this;
            var htmlTbody = '';
            var originalColIndex = beginColIndex;
            var list = opts.localData.list;
            var listLen = list.length;
            var cols;
            var colsLen;
            var temp;
            var index;

            if (frozenAlign === 'left') {
                cols = $target.ns.leftFrozenCols;
            } else if (frozenAlign === 'right') {
                cols = $target.ns.rightFrozenCols;
            } else {
                cols = $target.ns.unFrozenCols;
            }

            colsLen = cols.length;

            if (!colsLen) return '';

            for (var i = 0; i < listLen; i++) {
                htmlTbody += self.templateMap.tr.begin.replace('{rowIndex}', i);

                if (self.isGridTableNeed($target, opts, frozenAlign)) {
                    if (opts.withCheckbox) htmlTbody += self.templateMap.tdCheckbox.replace('{trHeight}', opts.trHeight).replace('{trLineHeight}', parseInt(opts.trHeight) - 1 + 'px');
                    if (opts.withRowNumber) htmlTbody += self.templateMap.tdRowNumber.replace('{trHeight}', opts.trHeight).replace('{trLineHeight}', parseInt(opts.trHeight) - 1 + 'px').replace('{number}', i + 1);
                }

                for (var j = 0; j < colsLen; j++) {
                    index = cols[j]['index'];
                    temp = list[i][index];

                    htmlTbody += self.templateMap.td.replace('{trHeight}', opts.trHeight).replace('{trLineHeight}', parseInt(opts.trHeight) - 1 + 'px').replace('{content}', temp);
                }
                htmlTbody += self.templateMap.tr.end;
            }

            return htmlTbody;
        },

        isGridTableNeed: function ($target, opts, frozenAlign) {
            if (!frozenAlign && !$target.ns.leftFrozenCols.length) return true;
            if (frozenAlign === 'left') return true;
            if (frozenAlign === 'right' && !$target.ns.leftFrozenCols.length && !$target.ns.unFrozenCols.length) return true;

            return false;
        },

        initJqueryObject: function ($target) {
            var self = this;

            $target.jq = {};

            $target.jq.$curDragTarget = null;
            $target.jq.$cols = $target.find('colgroup');
            $target.jq.$rows = $target.find('tr');
            $target.jq.$headerCols = $target.find('.s-table-column');
            $target.jq.$btnSelectAll = $target.find('.s-table-header .s-grid-check-wrapper');
        },

        initEvents: function ($target) {
            var self = this;

            $target.find('.s-table-wrapper').on({
                'mousewheel DOMMouseScroll': function (e) {
                    var $this = $(this);
                    var $table = $this.find('table');
                    var deltaY = 20;
                    var tableWrapperH = $this.height();
                    var tableH = $table.outerHeight();
                    var boundLength = tableH - tableWrapperH + 50;
                    var $closestGridTable = $this.closest('.s-grid-table');
                    var temp;

                    if (util.getMousewheelDirection(e) === 'up') {  // 鼠标向上滚动
                        temp = $this.scrollTop() - deltaY;
                        $this.scrollTop(temp >= 0 ? temp : 0);
                    } else if (util.getMousewheelDirection(e) === 'down') {
                        temp = $this.scrollTop() + deltaY;
                        $this.scrollTop(temp <= boundLength ? temp : boundLength);
                    }

                    $closestGridTable
                        .siblings('.s-grid-table')
                        .find('.s-table-wrapper')
                        .scrollTop($this.scrollTop());
                },
                'scroll': function (e) {
                    var $this = $(this);
                    var $closestGridTable = $this.closest('.s-grid-table');

                    $closestGridTable
                        .find('.s-table-header-wrapper')
                        .scrollLeft($this.scrollLeft());

                    $closestGridTable
                        .siblings('.s-grid-table')
                        .find('.s-table-wrapper')
                        .scrollTop($this.scrollTop());
                }
            });

            $target.find('.s-table-column:not(.s-grid-disable-resize)').on({
                'mousedown': function (e) {
                    var $this = $(this);
                    var offsetLeft = $this.offset().left;
                    var width = $this.outerWidth();
                    var pointX = offsetLeft + width - e.pageX;

                    if (pointX >= 0 && pointX < 5) {
                        $target.jq.$curDragTarget = $this;
                        $target.ns.originPointX = e.pageX;
                        self.createTableDragMask($target, e);
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

            $target.jq.$rows.on({
                'mouseenter': function (e) {
                    var $this = $(this);
                    var rowIndex = $this.data('row-index');
                    var len = $target.jq.$rows.length;

                    for (var i = 0; i < len; i++) {
                        var $temp = $($target.jq.$rows[i]);

                        $temp.is('tr[data-row-index="' + rowIndex + '"]') ? $temp.addClass('s-grid-row-hover') : $temp.removeClass('s-grid-row-hover');
                    }
                },
                'click': function (e) {
                    var $this = $(this);
                    var rowIndex = $this.data('row-index');
                    var len = $target.jq.$rows.length;
                    var $temp;

                    if ($this.is('.s-grid-row-selected')) {
                        $target.jq.$btnSelectAll.removeClass('s-grid-row-selected');

                        for (var i = 0; i < len; i++) {
                            $temp = $($target.jq.$rows[i]);
                            if ($temp.is('tr[data-row-index="' + rowIndex + '"]')) $temp.removeClass('s-grid-row-selected');
                        }
                        return;
                    }

                    for (var j = 0; j < len; j++) {
                        $temp = $($target.jq.$rows[j]);

                        $temp.is('tr[data-row-index="' + rowIndex + '"]') ? $temp.addClass('s-grid-row-selected') : $temp.removeClass('s-grid-row-selected');
                    }
                }
            });

            $target.jq.$btnSelectAll.on({
                'click': function (e) {
                    var $this = $(this);

                    if ($this.is('.s-grid-row-selected')) {
                        $this.removeClass('s-grid-row-selected');
                        $target.jq.$rows.removeClass('s-grid-row-selected');
                    } else {
                        $this.addClass('s-grid-row-selected');
                        $target.jq.$rows.addClass('s-grid-row-selected');
                    }
                }
            });

            $target.find('table').on({
                'mouseleave': function () {
                    var len = $target.jq.$rows.length;

                    for (var i = 0; i < len; i++) {
                        var $temp = $($target.jq.$rows[i]);

                        $temp.removeClass('s-grid-row-hover');
                    }
                }
            });

            $target.jq.$headerCols.on({
                'click': function () {
                    var $this = $(this);
                    var len = $target.jq.$headerCols.length;
                    var $temp = null;

                    for (var i = 0; i < len; i++) {

                        if ($target.jq.$headerCols[i] !== this) {
                            $temp = $($target.jq.$headerCols[i]);
                            $temp.removeClass('s-grid-sort-asc').removeClass('s-grid-sort-desc');
                        }
                    }

                    if ($this.hasClass('s-grid-sort-asc')) {
                        $this.removeClass('s-grid-sort-asc').addClass('s-grid-sort-desc');
                    } else if ($this.hasClass('s-grid-sort-desc')) {
                        $this.removeClass('s-grid-sort-desc');
                    } else {
                        if ($this.is(':not(.s-grid-disable-sort)')) {
                            $this.addClass('s-grid-sort-asc');
                        }
                    }
                }
            });
        },

        createTableDragMask: function ($target, e) {
            var self = this;
            var mousePosition = util.getEventPosition(e);
            var gridWrapperH = $target.jq.$curDragTarget.closest('.s-grid-wrapper').outerHeight();

            $target.ns.divDragLine = document.createElement('div');
            $target.ns.divDragLine.className = 's-grid-drag-line';
            $target.ns.divDragLine.style.cssText = 'width:1px;height:' + gridWrapperH + 'px;left:' + mousePosition.x + 'px;top:' + $target.jq.$curDragTarget.offset().top + 'px;position:absolute;background:black;z-index:999900;';

            document.body.appendChild($target.ns.divDragLine);

            $(document).on({
                'mousemove': dragAndCalculate,
                'mouseup': finishResizeColumn
            });

            function dragAndCalculate(e) {
                var minColumnW = 30;
                var curDragTargetW = $target.jq.$curDragTarget.outerWidth();
                var mousePosition = util.getEventPosition(e);
                var $gridWrapper = $target.jq.$curDragTarget.closest('.s-grid-wrapper');
                var gridWrapperW = $gridWrapper.outerWidth();

                util.clearDocumentSelection();

                if (curDragTargetW + mousePosition.x - $target.ns.originPointX >= minColumnW) {
                    if (mousePosition.x < $gridWrapper.offset().left + gridWrapperW - self.scrollbarWidth) {
                        $target.ns.divDragLine.style.opacity = 1;
                    } else {
                        $target.ns.divDragLine.style.opacity = 0;
                    }
                    $target.ns.divDragLine.style.left = mousePosition.x + 'px';
                }
            }

            function finishResizeColumn(e) {

                resizeColumn();

                $(document).off({
                    'mousemove': dragAndCalculate,
                    'mouseup': finishResizeColumn
                });

                $target.ns.divDragLine && document.body.removeChild($target.ns.divDragLine);
                $target.jq.$curDragTarget = null;
            }

            function resizeColumn() {
                var colIndex = $target.jq.$curDragTarget.data('col-index');
                var deltaX = parseInt($target.ns.divDragLine.style.left) - $target.ns.originPointX;
                var $curCol = $($target.jq.$cols[colIndex]).find('col');
                var $curTable = $curCol.closest('table');
                var $curTableHeader = $target.jq.$curDragTarget.closest('.s-table-header');
                var $curGridTable = $target.jq.$curDragTarget.closest('.s-grid-table');
                var $gridWrapper = $target.jq.$curDragTarget.closest('.s-grid-wrapper');
                var $gridWrapperInner = $target.jq.$curDragTarget.closest('.s-grid-wrapper-inner');
                var gridWrapperW = $gridWrapper.outerWidth();
                var curColumnW = $curCol.outerWidth() + deltaX;

                $target.jq.$curDragTarget[0].style.width = $curCol[0].style.width = curColumnW + 'px';

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
                begin: '<div class="s-grid-wrapper-outer"><div class="s-grid-wrapper" style="width:{width};"><div class="s-grid-wrapper-inner" style="width:{width};">',
                end: '</div></div></div>'
            },
            gridTable: {
                begin: '<div class="s-grid-table" data-frozen="{frozenAlign}" style="width:{width};">',
                end: '</div>'
            },
            tableHeader: {
                begin: '<div class="s-table-header-wrapper" style="overflow:hidden;"><div class="s-table-header" style="width:{width};height:{theadHeight};line-height:{theadLineHeight};">',
                end: '</div></div>'
            },
            tableColumn: {
                begin: '<div class="{classList}" data-col-index="{colIndex}" data-index="{index}" style="width:{width};height:{theadHeight};line-height:{theadLineHeight};"><div class="s-grid-text-wrapper">',
                end: '</div></div>'
            },
            checkbox: '<span class="s-grid-check-wrapper"><span class="s-grid-check"></span></span>',
            gridText: '<span class="s-grid-text">{title}</span>',
            dragQuarantine: '<span class="sc-grid-drag-quarantine"></span>',
            tableWrapper: {
                begin: '<div class="s-table-wrapper" style="height:{height};overflow:{overflowMode};"><div style="height:{height};"><table style="width:{width};" cellspacing="0" cellpadding="0" border="0">',
                end: '</table></div></div>'
            },
            colgroup: '<colgroup><col style="width:{width};"/></colgroup>',
            tbody: {
                begin: '<tbody id="s-grid-tbody-{id}">',
                end: '</tbody>'
            },
            tr: {
                begin: '<tr data-row-index="{rowIndex}">',
                end: '</tr>'
            },
            td: '<td style="height:{trHeight};line-height:{trLineHeight};">{content}</td>',
            tdCheckbox: '<td class="s-grid-checkbox" style="height:{trHeight};line-height:{trLineHeight};"><span class="s-grid-check-wrapper"><span class="s-grid-check"></span></span></td>',
            tdRowNumber: '<td class="s-grid-rownumber" style="height:{trHeight};line-height:{trLineHeight};">{number}</td>'
        }
    };

    var util = {

        getScrollbarWidth: function () {
            var divA = document.createElement('div');
            var divB = document.createElement('div');

            divA.style.overflowY = 'hidden';
            divB.style.height = '1px';
            divA.appendChild(divB);
            document.body.appendChild(divA);
            var tempWidth = divB.clientWidth;
            divA.style.overflowY = 'scroll';

            return tempWidth - divB.clientWidth;
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

    $.fn.grid = function (options, param) {
        if (typeof options == 'string') {
            return $.fn.grid.methods[options](this, param);
        }

        options = options || {};

        return this.each(function () {

            $.data(this, 'grid', {
                options: $.extend({}, $.fn.grid.defaults, options)
            });

            grid.init($(this));
        });
    };

    $.fn.grid.methods = {};

    $.fn.grid.defaults = {
        width: '800px',
        height: '200px',
        size: 20,
        withCheckbox: true,
        checkboxWidth: '26px',
        withRowNumber: true,
        rowNumberWidth: '44px',
        multiSelect: false,
        frozenColsAlign: '',  // 'left' | 'right' | 'left-right'
        theadHeight: '24px',
        trHeight: '24px',
        columns: [],
        localData: null,
        proxy: {
            url: '',
            cache: false,
            timeout: 3000,
            data: null
        },
        onAjaxBeforeSend: null,
        onAjaxComplete: null,
        onAjaxError: null,
        onAfterRender: null
    };
});