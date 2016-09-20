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

    var pagination = {

        init: function (target) {
            var self = this;

            self.initGlobalScope(target);
            self.render(target);
        },

        initGlobalScope: function (target) {
            var self = this;
            var $target = $(target);
            var opts = $target.data('pagination').options;

            target.ns = {};

            target.ns.cssPrefix = $.trim(opts.cssPrefix);
            target.ns.pageSize = parseInt(opts.pageSize);
            target.ns.pageBtnCount = parseInt(opts.pageBtnCount);
            target.ns.totalRecord = parseInt(opts.total);
            target.ns.curPageIndex = parseInt(opts.curPageIndex);
            target.ns.totalPage = 0;
            target.ns.pageSizeList = opts.pageSizeList;
            target.ns.mode = opts.mode;
            target.ns.templateMap = $.parseJSON(JSON.stringify(self.templateMap[target.ns.mode]).replace(/\{cssPrefix\}/g, target.ns.cssPrefix));
        },

        render: function (target) {
            var self = this;
            var $target = $(target);
            var opts = $(target).data('pagination').options;
            var html = self.createPaginationHtml(target, opts);

            opts.onBeforeRender && opts.onBeforeRender.call(null, target);

            $target.html(html);

            self.initJqueryObject(target);
            self.initEvent(target);

            opts.onAfterRender && opts.onAfterRender.call(null, target);
        },

        createPaginationHtml: function (target, opts) {
            var self = this;
            var templateMap = target.ns.templateMap;
            var html = '';

            target.ns.totalPage = Math.floor(target.ns.totalRecord / target.ns.pageSize) + (target.ns.totalRecord % target.ns.pageSize > 0 ? 1 : 0);

            html += templateMap.shell
                .replace('{totalRecord}', target.ns.totalRecord)
                .replace('{totalPage}', target.ns.totalPage)
                .replace('{currentPage}', target.ns.curPageIndex)
                .replace('{firstPageIndex}', 1)
                .replace('{firstDisabled}', self.isFirstBtnDisabled(target) ? 'disabled' : '')
                .replace('{prevPageIndex}', (target.ns.curPageIndex - 1 > 0) ? (target.ns.curPageIndex - 1) : 1)
                .replace('{prevDisabled}', self.isPrevBtnDisabled(target) ? 'disabled' : '')
                .replace('{btnListHolder}', self.createBtnListHtml(target))
                .replace('{nextPageIndex}', (target.ns.curPageIndex + 1) <= target.ns.totalPage ? (target.ns.curPageIndex + 1) : target.ns.totalPage)
                .replace('{nextDisabled}', self.isNextBtnDisabled(target) ? 'disabled' : '')
                .replace('{lastPageIndex}', target.ns.totalPage)
                .replace('{lastDisabled}', self.isLastBtnDisabled(target) ? 'disabled' : '')
                .replace('{refreshHolder}', opts.withRefresh ? templateMap.refresh : '')
                .replace('{selectHolder}', self.createSelectHtml(target, opts));

            return html;
        },

        createBtnListHtml: function (target) {
            var self = this;
            var templateMap = target.ns.templateMap;
            var btnListHtml = '';
            var pageNum;
            var temp;
            var isShowPrevEllipsis;
            var isShowNextEllipsis;

            if (target.ns.curPageIndex <= 0) target.ns.curPageIndex = 1;
            if (target.ns.curPageIndex > target.ns.totalPage) target.ns.curPageIndex = target.ns.totalPage;

            temp = target.ns.pageBtnCount / 2;

            isShowPrevEllipsis = self.isShowPrevEllipsis(target);
            isShowNextEllipsis = self.isShowNextEllipsis(target);

            if (!isShowPrevEllipsis) {
                pageNum = 1;
            } else if (target.ns.curPageIndex > temp && isShowNextEllipsis) {
                pageNum = target.ns.curPageIndex - (Math.floor(temp) + (target.ns.pageBtnCount % 2 === 0 ? -1 : 0));
            } else if (target.ns.curPageIndex > temp && !isShowNextEllipsis) {
                pageNum = target.ns.totalPage - target.ns.pageBtnCount + 1;
            } else {
                pageNum = target.ns.curPageIndex;
            }

            if (isShowPrevEllipsis) {
                btnListHtml += templateMap.ellipsis;
            }

            for (var i = 0; i < target.ns.pageBtnCount; i++) {

                if (pageNum > 0 && pageNum <= target.ns.totalPage) {

                    btnListHtml += templateMap.btn
                        .replace(/\{pageIndex\}/g, pageNum)
                        .replace('{active}', self.isBtnActive(target, pageNum) ? 'active' : '');
                    pageNum++;
                }
            }

            if (isShowNextEllipsis) {
                btnListHtml += templateMap.ellipsis;
            }

            return btnListHtml;
        },

        createSelectHtml: function (target, opts) {
            var html = '';
            var templateMap = target.ns.templateMap;

            if (opts.withSelect) {
                html += templateMap.select.begin;
                for (var i = 0; i < target.ns.pageSizeList.length; i++) {
                    html += templateMap.option
                        .replace(/\{value\}/g, target.ns.pageSizeList[i])
                        .replace('{isSelected}', target.ns.pageSizeList[i] === target.ns.pageSize ? 'selected' : '');
                }
                html += templateMap.select.end;
            }

            return html;
        },

        updatePagination: function (target) {
            var self = this;
            var pageIndex = target.ns.curPageIndex;
            var prevPageIndex = pageIndex - 1;
            var nextPageIndex = pageIndex + 1;

            target.jq.$currentPage.html(pageIndex);
            target.jq.$btnPrev.data('page-index', prevPageIndex > 0 ? prevPageIndex : 1);
            target.jq.$btnNext.data('page-index', nextPageIndex <= target.ns.totalPage ? nextPageIndex : target.ns.totalPage);

            self.isFirstBtnDisabled(target) ? target.jq.$btnFirst.addClass('disabled') : target.jq.$btnFirst.removeClass('disabled');
            self.isLastBtnDisabled(target) ? target.jq.$btnLast.addClass('disabled') : target.jq.$btnLast.removeClass('disabled');
            self.isPrevBtnDisabled(target) ? target.jq.$btnPrev.addClass('disabled') : target.jq.$btnPrev.removeClass('disabled');
            self.isNextBtnDisabled(target) ? target.jq.$btnNext.addClass('disabled') : target.jq.$btnNext.removeClass('disabled');
        },

        isShowPrevEllipsis: function (target) {
            var self = this;

            if (target.ns.curPageIndex === 1) return false;

            return target.ns.curPageIndex < target.ns.pageBtnCount ? false : true;
        },

        isShowNextEllipsis: function (target) {
            var self = this;

            if (target.ns.curPageIndex === target.ns.totalPage) return false;

            return target.ns.curPageIndex > (target.ns.totalPage - target.ns.pageBtnCount + 1) ? false : true;
        },

        isPrevBtnDisabled: function (target) {
            var self = this;

            return target.ns.curPageIndex > 1 ? false : true;
        },

        isNextBtnDisabled: function (target) {
            var self = this;

            return target.ns.curPageIndex < target.ns.totalPage ? false : true;
        },

        isFirstBtnDisabled: function (target) {
            var self = this;

            return target.ns.curPageIndex > 1 ? false : true;
        },

        isLastBtnDisabled: function (target) {
            var self = this;

            return target.ns.curPageIndex < target.ns.totalPage ? false : true;
        },

        isBtnActive: function (target, pageIndex) {
            var self = this;

            return target.ns.curPageIndex === pageIndex ? true : false;
        },

        initJqueryObject: function (target) {
            var self = this;
            var $target = $(target);
            var cssPrefix = target.ns.cssPrefix;

            target.jq = {};

            target.jq.$currentPage = $target.find('.' + cssPrefix + 'pagination-page-current');
            target.jq.$boxBtnList = $target.find('.' + cssPrefix + 'pagination-btn-list');
            target.jq.$btnFirst = $target.find('.' + cssPrefix + 'pagination-btn-first');
            target.jq.$btnPrev = $target.find('.' + cssPrefix + 'pagination-btn-prev');
            target.jq.$btnNext = $target.find('.' + cssPrefix + 'pagination-btn-next');
            target.jq.$btnLast = $target.find('.' + cssPrefix + 'pagination-btn-last');
            target.jq.$btnRefresh = $target.find('.' + cssPrefix + 'pagination-refresh');
            target.jq.$select = $target.find('.' + cssPrefix + 'pagination-select');
            target.jq.$input = $target.find('.' + cssPrefix + 'pagination-input');
            target.jq.$btnJump = $target.find('.' + cssPrefix + 'pagination-jump');
        },

        initEvent: function (target) {
            var self = this;
            var $target = $(target);

            target.jq.$btnFirst.on({
                'click': self.btnClickHandler(target)
            });

            target.jq.$btnPrev.on({
                'click': self.btnClickHandler(target)
            });

            target.jq.$btnNext.on({
                'click': self.btnClickHandler(target)
            });

            target.jq.$btnLast.on({
                'click': self.btnClickHandler(target)
            });

            target.jq.$btnRefresh.on({
                'click': function () {
                    var $this = $(this);

                    if ($this.is('.disabled')) return;

                    self.goto(target, target.ns.curPageIndex);
                }
            });

            target.jq.$boxBtnList.on({
                'click': function (e) {
                    var $elem = $(e.target);
                    var index = $elem.data('page-index');

                    if (!index) return;

                    target.ns.curPageIndex = index;

                    self.goto(target, index);
                }
            });

            target.jq.$btnJump.on({
                'click': function () {
                    var params = self.getParams(target);

                    params && self.goto(target, params);
                }
            });

            target.jq.$select.on({
                'change': function () {
                    var $this = $(this);

                    target.ns.curPageIndex = 1;
                    target.ns.pageSize = parseInt($this.val());
                    target.ns.totalPage = Math.floor(target.ns.totalRecord / target.ns.pageSize) + (target.ns.totalRecord % target.ns.pageSize > 0 ? 1 : 0);

                    self.render(target);
                    $target.triggerHandler('changePage', {
                        page: target.ns.curPageIndex,
                        size: target.ns.pageSize
                    });
                }
            });

            target.jq.$input.on({
                'keypress': function (e) {
                    if (e.keyCode === 13) {
                        var params = self.getParams(target);

                        params && self.goto(target, params);
                    }
                }
            });
        },

        btnClickHandler: function (target) {
            var self = this;

            return function (e) {
                var $this = $(this);

                if ($this.is('.disabled')) return;

                var index = $this.data('page-index');

                target.ns.curPageIndex = index;

                self.goto(target, index);
            };
        },

        goto: function (target, pageInfo, isNotTriggerChangePage) {
            var self = this;
            var $target = $(target);
            var opts = $target.data('pagination').options;
            var params;

            params = typeof pageInfo === 'object' ? pageInfo : {
                page: pageInfo,
                size: target.ns.pageSize
            };

            $.extend(true, target.ns, params);

            opts.onBeforeChangePage && opts.onBeforeChangePage.call(null, target);
            if (opts.url) {
                $.ajax({
                    url: opts.url,
                    type: opts.method,
                    cache: opts.cache,
                    timeout: opts.timeout,
                    data: params,
                    dataType: 'json',
                    beforeSend: opts.onAjaxBeforeSend,
                    complete: opts.onAjaxComplete,
                    error: function () {
                        opts.onAjaxError && opts.onAjaxError.apply(null, Array.prototype.slice.apply(null, arguments));
                    },
                    success: function (result) {
                        target.jq.$boxBtnList.html(self.createBtnListHtml(target));
                        self.updatePagination(target);
                        opts.onAjaxSuccess && opts.onAjaxSuccess.apply(null, [result]);
                    }
                });
            } else {
                if (isNotTriggerChangePage) {
                    self.render(target);
                    return;
                }
                target.jq.$boxBtnList.html(self.createBtnListHtml(target));
                self.updatePagination(target);
            }

            if (!isNotTriggerChangePage) $target.triggerHandler('changePage', params);
            opts.onAfterChangePage && opts.onAfterChangePage.call(null, target);
        },

        getParams: function (target) {
            var self = this;
            var regex = /\d+/;
            var pageIndex = parseInt($.trim(target.jq.$input.val()));

            if (regex.test(pageIndex) && (pageIndex > 0)) {
                pageIndex = pageIndex > target.ns.totalPage ? target.ns.totalPage : pageIndex;
                target.jq.$input.val('');
                target.ns.curPageIndex = pageIndex;
                return {
                    page: pageIndex,
                    size: target.ns.pageSize
                };
            }

            return false;
        },

        templateMap: {
            mode1: {
                shell: '<div class="{cssPrefix}pagination-wrapper"><div class="{cssPrefix}pagination-info"><span class="{cssPrefix}pagination-record">共<span class="{cssPrefix}pagination-record-total">{totalRecord}</span>条记录</span><span class="{cssPrefix}pagination-slash">/</span><span class="{cssPrefix}pagination-page">共<span class="{cssPrefix}pagination-page-total">{totalPage}</span>页</span><span class="{cssPrefix}pagination-current">（当前第<span class="{cssPrefix}pagination-page-current">{currentPage}</span>页）</span></div><div class="{cssPrefix}pagination-function"><a class="{cssPrefix}pagination-btn {cssPrefix}pagination-btn-first {firstDisabled}" data-page-index="{firstPageIndex}" href="javascript:;"></a><a class="{cssPrefix}pagination-btn {cssPrefix}pagination-btn-prev {prevDisabled}" data-page-index="{prevPageIndex}" href="javascript:;"></a><span class="{cssPrefix}pagination-btn-list">{btnListHolder}</span><a class="{cssPrefix}pagination-btn {cssPrefix}pagination-btn-next {nextDisabled}" data-page-index="{nextPageIndex}" href="javascript:;"></a><a class="{cssPrefix}pagination-btn {cssPrefix}pagination-btn-last {lastDisabled}" data-page-index="{lastPageIndex}" href="javascript:;"></a>{refreshHolder}{selectHolder}<input class="{cssPrefix}pagination-input" type="text" /><a class="{cssPrefix}pagination-jump" href="javascript:;">跳转</a></div></div>',
                btn: '<a class="{cssPrefix}pagination-btn {active}" data-page-index="{pageIndex}" href="javascript:;">{pageIndex}</a>',
                ellipsis: '<span class="{cssPrefix}pagination-ellipsis">&hellip;</span>',
                refresh: '<a class="{cssPrefix}pagination-refresh"></a>',
                select: {
                    begin: '<select class="{cssPrefix}pagination-select">',
                    end: '</select>'
                },
                option: '<option value="{value}" {isSelected}>{value}</option>'
            },
            mode2: {  // 暂无
            }
        }
    };

    $.fn.pagination = function (options, params) {
        if (typeof options == 'string') {
            return $.fn.pagination.methods[options](this, params);
        }

        options = options || {};

        return this.each(function () {

            $.data(this, 'pagination', {
                options: $.extend(true, {}, $.fn.pagination.defaults, options)
            });

            return pagination.init(this);
        });
    };

    $.fn.pagination.methods = {
        update: function ($target, params) {
            var pageInfo = {
                curPageIndex: parseInt(params.page) || 1,
                totalRecord: parseInt(params.total) || 0
            };

            pagination.goto($target[0], pageInfo, true);
        }
    };

    $.fn.pagination.defaults = {
        cssPrefix: 's-',
        mode: 'mode1',
        pageSize: 20,
        pageBtnCount: 3,
        total: 0,
        curPageIndex: 1,
        pageSizeList: [5, 10, 15, 20],
        withRefresh: false,
        withSelect: true,
        url: '',
        method: 'GET',
        cache: false,
        timeout: 3000,
        params: null,
        onAjaxBeforeSend: null,
        onAjaxComplete: null,
        onAjaxError: null,
        onAjaxSuccess: null,
        onBeforeRender: null,
        onAfterRender: null,
        onBeforeChangePage: null,
        onAfterChangePage: null
    };
});