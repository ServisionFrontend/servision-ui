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

    var pagination = {

        init: function ($target) {
            var self = this;

            self.initGlobalScope($target);
            self.render($target);
        },

        initGlobalScope: function ($target) {
            var self = this;
            var opts = $target.data('pagination').options;

            $target.ns = {};

            $target.ns.pageSize = parseInt(opts.pageSize);
            $target.ns.pageBtnCount = parseInt(opts.pageBtnCount);
            $target.ns.totalRecord = parseInt(opts.total);
            $target.ns.curPageIndex = parseInt(opts.curPageIndex);
            $target.ns.totalPage = Math.floor($target.ns.totalRecord / $target.ns.pageSize) + ($target.ns.totalRecord % $target.ns.pageSize > 0 ? 1 : 0);
            $target.ns.pageSizeList = opts.pageSizeList;
        },

        render: function ($target) {
            var self = this;
            var html = self.createPaginationHtml($target);

            $target.html(html);

            self.initJqueryObject($target);
            self.initEvent($target);
        },

        createPaginationHtml: function ($target) {
            var self = this;
            var html = '';

            html += self.templateMap.wrapper.begin;

            html += self.templateMap.paginationInfo.begin;
            html += self.templateMap.record.replace('{totalRecord}', $target.ns.totalRecord);
            html += self.templateMap.slash;
            html += self.templateMap.page.replace('{totalPage}', $target.ns.totalPage);
            html += self.templateMap.current.replace('{currentPage}', $target.ns.curPageIndex);
            html += self.templateMap.paginationInfo.end;

            html += self.templateMap.paginationFunction.begin;
            html += self.templateMap.btnFirst.replace('{pageIndex}', 1).replace('{disabled}', self.isFirstBtnDisabled($target) ? 'disabled' : '');
            html += self.templateMap.btnPrev.replace('{pageIndex}', ($target.ns.curPageIndex - 1) > 0 ? ($target.ns.curPageIndex - 1) : 1).replace('{disabled}', self.isPrevBtnDisabled($target) ? 'disabled' : '');

            html += self.templateMap.btnList.begin;

            html += self.createBtnListHtml($target);

            html += self.templateMap.btnList.end;

            html += self.templateMap.btnNext.replace('{pageIndex}', ($target.ns.curPageIndex + 1) <= $target.ns.totalPage ? ($target.ns.curPageIndex + 1) : $target.ns.totalPage).replace('{disabled}', self.isNextBtnDisabled($target) ? 'disabled' : '');
            html += self.templateMap.btnLast.replace('{pageIndex}', $target.ns.totalPage).replace('{disabled}', self.isLastBtnDisabled($target) ? 'disabled' : '');
            html += self.templateMap.refresh.replace('{disabled}', self.isRefreshBtnDisabled($target) ? 'disabled' : '');

            html += self.templateMap.select.begin;
            for (var j = 0; j < $target.ns.pageSizeList.length; j++) {
                html += self.templateMap.option.replace(/\{value\}/g, $target.ns.pageSizeList[j]).replace('{isSelected}', $target.ns.pageSizeList[j] === $target.ns.pageSize ? 'selected' : '');
            }
            html += self.templateMap.select.end;

            html += self.templateMap.input;
            html += self.templateMap.jump;

            html += self.templateMap.paginationFunction.end;
            html += self.templateMap.wrapper.end;

            return html;
        },

        createBtnListHtml: function ($target) {
            var self = this;
            var btnListHtml = '';
            var pageNum;
            var temp;
            var isShowPrevEllipsis;
            var isShowNextEllipsis;

            if ($target.ns.curPageIndex <= 0) $target.ns.curPageIndex = 1;
            if ($target.ns.curPageIndex > $target.ns.totalPage) $target.ns.curPageIndex = $target.ns.totalPage;

            temp = $target.ns.pageBtnCount / 2;

            isShowPrevEllipsis = self.isShowPrevEllipsis($target);
            isShowNextEllipsis = self.isShowNextEllipsis($target);

            if (!isShowPrevEllipsis) {
                pageNum = 1;
            } else if ($target.ns.curPageIndex > temp && isShowNextEllipsis) {
                pageNum = $target.ns.curPageIndex - (Math.floor(temp) + ($target.ns.pageBtnCount % 2 === 0 ? -1 : 0));
            } else if ($target.ns.curPageIndex > temp && !isShowNextEllipsis) {
                pageNum = $target.ns.totalPage - $target.ns.pageBtnCount + 1;
            } else {
                pageNum = $target.ns.curPageIndex;
            }

            if (isShowPrevEllipsis) {
                btnListHtml += self.templateMap.ellipsis;
            }

            for (var i = 0; i < $target.ns.pageBtnCount; i++) {

                if (pageNum > 0 && pageNum <= $target.ns.totalPage) {
                    btnListHtml += self.templateMap.btn.replace(/\{pageIndex\}/g, pageNum).replace('{active}', self.isBtnActive($target, pageNum) ? 'active' : '');

                    pageNum++;
                }
            }

            if (isShowNextEllipsis) {
                btnListHtml += self.templateMap.ellipsis;
            }

            return btnListHtml;
        },

        updatePagination: function ($target) {
            var self = this;
            var pageIndex = $target.ns.curPageIndex;
            var prevPageIndex = pageIndex - 1;
            var nextPageIndex = pageIndex + 1;

            $target.jq.$currentPage.html(pageIndex);
            $target.jq.$btnPrev.data('page-index', prevPageIndex > 0 ? prevPageIndex : 1);
            $target.jq.$btnNext.data('page-index', nextPageIndex <= $target.ns.totalPage ? nextPageIndex : $target.ns.totalPage);

            self.isFirstBtnDisabled($target) ? $target.jq.$btnFirst.addClass('disabled') : $target.jq.$btnFirst.removeClass('disabled');
            self.isLastBtnDisabled($target) ? $target.jq.$btnLast.addClass('disabled') : $target.jq.$btnLast.removeClass('disabled');
            self.isPrevBtnDisabled($target) ? $target.jq.$btnPrev.addClass('disabled') : $target.jq.$btnPrev.removeClass('disabled');
            self.isNextBtnDisabled($target) ? $target.jq.$btnNext.addClass('disabled') : $target.jq.$btnNext.removeClass('disabled');
        },

        isShowPrevEllipsis: function ($target) {
            var self = this;

            if ($target.ns.curPageIndex === 1) return false;

            return $target.ns.curPageIndex < $target.ns.pageBtnCount ? false : true;
        },

        isShowNextEllipsis: function ($target) {
            var self = this;

            if ($target.ns.curPageIndex === $target.ns.totalPage) return false;

            return $target.ns.curPageIndex > ($target.ns.totalPage - $target.ns.pageBtnCount + 1) ? false : true;
        },

        isPrevBtnDisabled: function ($target) {
            var self = this;

            return $target.ns.curPageIndex > 1 ? false : true;
        },

        isNextBtnDisabled: function ($target) {
            var self = this;

            return $target.ns.curPageIndex < $target.ns.totalPage ? false : true;
        },

        isFirstBtnDisabled: function ($target) {
            var self = this;

            return $target.ns.curPageIndex > 1 ? false : true;
        },

        isLastBtnDisabled: function ($target) {
            var self = this;

            return $target.ns.curPageIndex < $target.ns.totalPage ? false : true;
        },

        isRefreshBtnDisabled: function ($target) {
            var self = this;
        },

        isBtnActive: function ($target, pageIndex) {
            var self = this;

            return $target.ns.curPageIndex === pageIndex ? true : false;
        },

        initJqueryObject: function ($target) {
            var self = this;

            $target.jq = {};

            $target.jq.$currentPage = $target.find('.s-pagination-page-current');
            $target.jq.$boxBtnList = $target.find('.s-pagination-btn-list');
            $target.jq.$btnFirst = $target.find('.s-pagination-btn-first');
            $target.jq.$btnPrev = $target.find('.s-pagination-btn-prev');
            $target.jq.$btnNext = $target.find('.s-pagination-btn-next');
            $target.jq.$btnLast = $target.find('.s-pagination-btn-last');
            $target.jq.$btnRefresh = $target.find('.s-pagination-refresh');
            $target.jq.$select = $target.find('.s-pagination-select');
            $target.jq.$input = $target.find('.s-pagination-input');
            $target.jq.$btnJump = $target.find('.s-pagination-jump');
        },

        initEvent: function ($target) {
            var self = this;

            $target.jq.$btnFirst.on({
                'click': self.btnClickHandler($target)
            });

            $target.jq.$btnPrev.on({
                'click': self.btnClickHandler($target)
            });

            $target.jq.$btnNext.on({
                'click': self.btnClickHandler($target)
            });

            $target.jq.$btnLast.on({
                'click': self.btnClickHandler($target)
            });

            $target.jq.$btnRefresh.on({
                'click': function () {
                    var $this = $(this);

                    if ($this.is('.disabled')) return;

                    self.goto($target, $target.ns.curPageIndex);
                }
            });

            $target.jq.$boxBtnList.on({
                'click': function (e) {
                    var $elem = $(e.target);
                    var index = $elem.data('page-index');

                    $target.ns.curPageIndex = index;

                    self.goto($target, index);
                }
            });

            $target.jq.$btnJump.on({
                'click': function () {
                    var params = self.getParams($target);

                    params && self.goto($target, params);
                }
            });

            $target.jq.$select.on({
                'change': function () {
                    var $this = $(this);

                    $target.ns.curPageIndex = 1;
                    $target.ns.pageSize = parseInt($this.val());
                    $target.ns.totalPage = Math.floor($target.ns.totalRecord / $target.ns.pageSize) + ($target.ns.totalRecord % $target.ns.pageSize > 0 ? 1 : 0);

                    self.render($target);
                }
            });

            $target.jq.$input.on({
                'keypress': function (e) {
                    if (e.keyCode === 13) {
                        var params = self.getParams($target);

                        params && self.goto($target, params);
                    }
                }
            });
        },

        btnClickHandler: function ($target) {
            var self = this;

            return function (e) {
                var $this = $(this);

                if ($this.is('.disabled')) return;

                var index = $this.data('page-index');

                $target.ns.curPageIndex = index;

                self.goto($target, index);
            };
        },

        goto: function ($target, pageInfo) {
            var self = this;
            var opts = $target.data('pagination').options;
            var params;

            params = typeof pageInfo === 'object' ? pageInfo : {
                page: pageInfo,
                size: $target.ns.pageSize
            };

            if (opts.url) {
                $.ajax({
                    url: opts.url,
                    type: opts.method,
                    cache: opts.cache,
                    timeout: opts.timeout,
                    beforeSend: opts.onAjaxBeforeSend,
                    complete: opts.onAjaxComplete,
                    error: opts.onAjaxError,
                    success: function (result) {
                        $target.jq.$boxBtnList.html(self.createBtnListHtml($target));
                        self.updatePagination($target);
                        opts.onDataLoaded && opts.onDataLoaded.apply(null, [result]);
                    }
                });
            } else {
                $target.jq.$boxBtnList.html(self.createBtnListHtml($target));
                self.updatePagination($target);
            }
        },

        getParams: function ($target) {
            var self = this;
            var regex = /\d+/;
            var pageIndex = parseInt($.trim($target.jq.$input.val()));

            if (regex.test(pageIndex) && (pageIndex > 0)) {
                pageIndex = pageIndex > $target.ns.totalPage ? $target.ns.totalPage : pageIndex;
                $target.jq.$input.val('');
                $target.ns.curPageIndex = pageIndex;
                return {
                    page: pageIndex,
                    size: $target.ns.pageSize
                };
            }

            return false;
        },

        templateMap: {
            wrapper: {
                begin: '<div class="s-pagination-wrapper">',
                end: '</div>'
            },
            paginationInfo: {
                begin: '<div class="s-pagination-info">',
                end: '</div>'
            },
            record: '<span class="s-pagination-record">共<span class="s-pagination-record-total">{totalRecord}</span>条记录</span>',
            slash: '<span class="s-pagination-slash">/</span>',
            page: '<span class="s-pagination-page">共<span class="s-pagination-page-total">{totalPage}</span>页</span>',
            current: '<span class="s-pagination-current">（当前第<span class="s-pagination-page-current">{currentPage}</span>页）</span>',
            paginationFunction: {
                begin: '<div class="s-pagination-function">',
                end: '</div>'
            },
            btnFirst: '<a class="s-pagination-btn s-pagination-btn-first {disabled}" data-page-index="{pageIndex}" href="javascript:;"></a>',
            btnLast: '<a class="s-pagination-btn s-pagination-btn-last {disabled}" data-page-index="{pageIndex}" href="javascript:;"></a>',
            btnPrev: '<a class="s-pagination-btn s-pagination-btn-prev {disabled}" data-page-index="{pageIndex}" href="javascript:;"></a>',
            btnNext: '<a class="s-pagination-btn s-pagination-btn-next {disabled}" data-page-index="{pageIndex}" href="javascript:;"></a>',
            ellipsis: '<span class="s-pagination-ellipsis">&hellip;</span>',
            refresh: '<a class="s-pagination-refresh {disabled}"></a>',
            input: '<input class="s-pagination-input" type="text" />',
            jump: '<a class="s-pagination-jump" href="javascript:;">跳转</a>',
            select: {
                begin: '<select class="s-pagination-select">',
                end: '</select>'
            },
            option: '<option value="{value}" {isSelected}>{value}</option>',
            btnList: {
                begin: '<span class="s-pagination-btn-list">',
                end: '</span>'
            },
            btn: '<a class="s-pagination-btn {active}" data-page-index="{pageIndex}" href="javascript:;">{pageIndex}</a>'
        }
    };

    $.fn.pagination = function (options, param) {
        if (typeof options == 'string') {
            return $.fn.pagination.methods[options](this, param);
        }

        options = options || {};

        return this.each(function () {

            $.data(this, 'pagination', {
                options: $.extend(true, {}, $.fn.pagination.defaults, options)
            });

            pagination.init($(this));
        });
    };

    $.fn.pagination.methods = {};

    $.fn.pagination.defaults = {
        pageSize: 20,
        pageBtnCount: 3,
        total: 0,
        curPageIndex: 1,
        pageSizeList: [5, 10, 15, 20],
        url: '',
        method: 'GET',
        cache: false,
        timeout: 3000,
        params: null,
        onAjaxBeforeSend: null,
        onAjaxComplete: null,
        onAjaxError: null,
        onDataLoaded: null,
        onBeforeRender: null,
        onAfterRender: null,
        onBeforeChangePage: null,
        onAfterChangePage: null
    };
});