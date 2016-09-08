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
            target.ns.templateMap = $.parseJSON(JSON.stringify(self.templateMap).replace(/\{cssPrefix\}/g, target.ns.cssPrefix));
        },

        render: function (target) {
            var self = this;
            var $target = $(target);
            var opts = $(target).data('pagination').options;
            var html = self.createPaginationHtml(target);

            opts.onBeforeRender && opts.onBeforeRender.call(null, target);

            $target.html(html);

            self.initJqueryObject(target);
            self.initEvent(target);

            opts.onAfterRender && opts.onAfterRender.call(null, target);
        },

        createPaginationHtml: function (target) {
            var self = this;
            var templateMap = target.ns.templateMap;
            var opts = $(target).data('pagination').options;
            var html = '';

            target.ns.totalPage = Math.floor(target.ns.totalRecord / target.ns.pageSize) + (target.ns.totalRecord % target.ns.pageSize > 0 ? 1 : 0);

            html += templateMap.wrapper.begin;
            html += templateMap.paginationInfo.begin;

            html += templateMap.record
                .replace('{totalRecord}', target.ns.totalRecord);

            html += templateMap.slash;

            html += templateMap.page
                .replace('{totalPage}', target.ns.totalPage);

            html += templateMap.current.replace('{currentPage}', target.ns.curPageIndex);

            html += templateMap.paginationInfo.end;
            html += templateMap.paginationFunction.begin;

            html += templateMap.btnFirst
                .replace('{pageIndex}', 1)
                .replace('{disabled}', self.isFirstBtnDisabled(target) ? 'disabled' : '');

            html += templateMap.btnPrev
                .replace('{pageIndex}', (target.ns.curPageIndex - 1 > 0) ? (target.ns.curPageIndex - 1) : 1)
                .replace('{disabled}', self.isPrevBtnDisabled(target) ? 'disabled' : '');

            html += templateMap.btnList.begin;

            html += self.createBtnListHtml(target);

            html += templateMap.btnList.end;

            html += templateMap.btnNext
                .replace('{pageIndex}', (target.ns.curPageIndex + 1) <= target.ns.totalPage ? (target.ns.curPageIndex + 1) : target.ns.totalPage)
                .replace('{disabled}', self.isNextBtnDisabled(target) ? 'disabled' : '');

            html += templateMap.btnLast
                .replace('{pageIndex}', target.ns.totalPage)
                .replace('{disabled}', self.isLastBtnDisabled(target) ? 'disabled' : '');

            if (opts.withRefresh) html += templateMap.refresh;

            if (opts.withSelect) {
                html += templateMap.select.begin;
                for (var j = 0; j < target.ns.pageSizeList.length; j++) {
                    html += templateMap.option
                        .replace(/\{value\}/g, target.ns.pageSizeList[j])
                        .replace('{isSelected}', target.ns.pageSizeList[j] === target.ns.pageSize ? 'selected' : '');
                }
                html += templateMap.select.end;
            }

            html += templateMap.input;
            html += templateMap.jump;
            html += templateMap.paginationFunction.end;
            html += templateMap.wrapper.end;

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
                    params: params,
                    beforeSend: opts.onAjaxBeforeSend,
                    complete: opts.onAjaxComplete,
                    error: function (err) {
                        opts.onAjaxError && opts.onAjaxError.apply(null, err);
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
            wrapper: {
                begin: '<div class="{cssPrefix}pagination-wrapper">',
                end: '</div>'
            },
            paginationInfo: {
                begin: '<div class="{cssPrefix}pagination-info">',
                end: '</div>'
            },
            record: '<span class="{cssPrefix}pagination-record">共<span class="{cssPrefix}pagination-record-total">{totalRecord}</span>条记录</span>',
            slash: '<span class="{cssPrefix}pagination-slash">/</span>',
            page: '<span class="{cssPrefix}pagination-page">共<span class="{cssPrefix}pagination-page-total">{totalPage}</span>页</span>',
            current: '<span class="{cssPrefix}pagination-current">（当前第<span class="{cssPrefix}pagination-page-current">{currentPage}</span>页）</span>',
            paginationFunction: {
                begin: '<div class="{cssPrefix}pagination-function">',
                end: '</div>'
            },
            btnFirst: '<a class="{cssPrefix}pagination-btn {cssPrefix}pagination-btn-first {disabled}" data-page-index="{pageIndex}" href="javascript:;"></a>',
            btnLast: '<a class="{cssPrefix}pagination-btn {cssPrefix}pagination-btn-last {disabled}" data-page-index="{pageIndex}" href="javascript:;"></a>',
            btnPrev: '<a class="{cssPrefix}pagination-btn {cssPrefix}pagination-btn-prev {disabled}" data-page-index="{pageIndex}" href="javascript:;"></a>',
            btnNext: '<a class="{cssPrefix}pagination-btn {cssPrefix}pagination-btn-next {disabled}" data-page-index="{pageIndex}" href="javascript:;"></a>',
            ellipsis: '<span class="{cssPrefix}pagination-ellipsis">&hellip;</span>',
            refresh: '<a class="{cssPrefix}pagination-refresh"></a>',
            input: '<input class="{cssPrefix}pagination-input" type="text" />',
            jump: '<a class="{cssPrefix}pagination-jump" href="javascript:;">跳转</a>',
            select: {
                begin: '<select class="{cssPrefix}pagination-select">',
                end: '</select>'
            },
            option: '<option value="{value}" {isSelected}>{value}</option>',
            btnList: {
                begin: '<span class="{cssPrefix}pagination-btn-list">',
                end: '</span>'
            },
            btn: '<a class="{cssPrefix}pagination-btn {active}" data-page-index="{pageIndex}" href="javascript:;">{pageIndex}</a>'
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