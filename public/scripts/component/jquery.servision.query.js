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

    var query = {

        init: function (target) {
            var self = this;

            self.initGlobalScope(target);
            self.render(target);
            self.initJqueryObject(target);
            self.initCombobox(target);
            self.initEvent(target);
            self.loadData(target);
        },

        initGlobalScope: function (target) {
            var self = this;
            var $target = $(target);
            var opts = $target.data('query').options;

            target.ns = {};

            target.ns.cssPrefix = opts.cssPrefix;
            target.ns.templateMap = JSON.parse(
                JSON.stringify(self.templateMap)
                    .replace(/\{cssPrefix\}/g, target.ns.cssPrefix)
                    .replace(/\{queryText\}/g, opts.lang.toLowerCase() === 'en_us' ? 'query' : '查询')
                    .replace(/\{resetText\}/g, opts.lang.toLowerCase() === 'en_us' ? 'reset' : '重置')
            );
        },

        render: function (target) {
            var self = this;
            var $target = $(target);
            var opts = $target.data('query').options;
            var html = self.createQueryHtml(target, opts);

            opts.onBeforeRender && opts.onBeforeRender.call(null, target);

            $target.html(html);

            opts.onAfterRender && opts.onAfterRender.call(null, target);
        },

        initJqueryObject: function (target) {
            var self = this;
            var $target = $(target);

            target.jq = {};

            target.jq.$queryItemList = $target.find('.' + target.ns.cssPrefix + 'query-item');
            target.jq.$querySelectList = $target.find('select.' + target.ns.cssPrefix + 'query-input');
            target.jq.$queryInputList = $target.find('input.' + target.ns.cssPrefix + 'query-input');
            target.jq.$queryAllInputList = $target.find('.' + target.ns.cssPrefix + 'query-input');
            target.jq.$btnQuery = $target.find('.' + target.ns.cssPrefix + 'query-action');
            target.jq.$btnReset = $target.find('.' + target.ns.cssPrefix + 'query-reset');
            target.jq.$comboboxList = [];
        },

        initCombobox: function (target) {
            var self = this;
            var $target = $(target);
            var items = $target.data('query').options.items;

            for (var i = 0; i < items.length; i++) {
                if (items[i].type === 'combobox') {
                    target.jq.$comboboxList.push($target.find('#' + items[i].id).combobox(items[i].config || {}));
                }
            }
        },

        initEvent: function (target) {
            var self = this;
            var $target = $(target);
            var opts = $target.data('query').options;

            target.jq.$querySelectList.on({
                click: function () {
                    var $this = $(this);

                    if ($this.data('noCache') === true || $this.data('loaded') !== true) {

                        self.loadSelectData(target, $this);
                    }
                },
                change: function () {
                    var $this = $(this);
                    var $nextSelect = $target.find($this.data('next'));

                    if ($nextSelect.length) self.loadSelectData(target, $nextSelect, true);
                }
            });

            target.jq.$btnQuery.on({
                click: function () {
                    var params = self.getParams(target);

                    opts.onBeforeQuery && opts.onBeforeQuery.call(null, target);

                    if (params) {
                        self.doQuery(target, params);
                    }

                    opts.onAfterQuery && opts.onAfterQuery.call(null, target);
                }
            });

            target.jq.$btnReset.on({
                click: function () {

                    opts.onBeforeReset && opts.onBeforeReset.call(null, target);

                    for (var i = 0; i < target.jq.$queryAllInputList.length; i++) {
                        self.resetItem($(target.jq.$queryAllInputList[i]));
                    }

                    for (var j = 0; j < target.jq.$comboboxList.length; j++) {
                        target.jq.$comboboxList[j].combobox('clear');
                    }

                    opts.onAfterReset && opts.onAfterReset.call(null, target);
                }
            });
        },

        createQueryHtml: function (target, opts) {
            var self = this;
            var templateMap = target.ns.templateMap;
            var html = '';

            html += templateMap.wrapper.begin;

            html += templateMap.content.begin;
            html += self.createItemsHtml(target, opts);
            html += templateMap.content.end;

            html += templateMap.operation.begin;

            html += self.createOperationHtml(target, opts);

            html += templateMap.operation.end;

            html += templateMap.wrapper.end;
            return html;
        },

        createItemsHtml: function (target, opts) {
            var self = this;
            var templateMap = target.ns.templateMap;
            var html = '';
            var temp;

            for (var i = 0; i < opts.items.length; i++) {
                temp = opts.items[i];
                html += templateMap.item.begin
                    .replace('{required}', temp.required ? target.ns.cssPrefix + 'query-required' : '')
                    .replace(/\{label\}/g, temp.label);

                if (temp.type !== 'select') {
                    html += templateMap.input.replace('{name}', temp.name).replace('{id}', temp.id);
                } else {
                    html += templateMap.select
                        .replace('{name}', temp.name)
                        .replace('{id}', temp.id)
                        .replace('{url}', temp.config.url || '')
                        .replace('{withAll}', temp.config.withAll || '')
                        .replace('{withAllText}', temp.config.withAllText || '')
                        .replace('{preload}', temp.config.preload || '')
                        .replace('{dependenciesIds}', temp.config.dependenciesIds ? JSON.stringify(temp.config.dependenciesIds).replace(/\"/g, '\'') : '')
                        .replace('{clearIds}', temp.config.clearIds ? JSON.stringify(temp.config.clearIds).replace(/\"/g, '\'') : '')
                        .replace('{next}', temp.config.next || '')
                        .replace('{options}', self.createOptionsHtml(target, opts, temp.config || []));
                }
                html += templateMap.item.end;
            }

            return html;
        },

        createOperationHtml: function (target, opts) {
            var self = this;
            var templateMap = target.ns.templateMap;
            var html = '';

            for (var i = 0; i < opts.operationBtnList.length; i++) {
                html += templateMap[opts.operationBtnList[i]];
            }

            return html;
        },

        createOptionsHtml: function (target, opts, config) {
            var self = this;
            var withAll = config.withAll || opts.withAll;
            var withAllText = config.withAllText || opts.withAllText;
            var html = withAll ? '<option value="">' + withAllText + '</option>' : '';

            if (!config.localData) return '';

            for (var i = 0; i < config.localData.length; i++) {
                html += '<option value="' + config.localData[i].code + '">' + config.localData[i].name + '</option>';
            }

            return html;
        },

        loadData: function (target) {
            var self = this;
            var $selectList = target.jq.$querySelectList;
            var len = $selectList.length;
            var $temp;

            for (var i = 0; i < len; i++) {
                $temp = $($selectList[i]);
                if ($temp.data('preload') === true) {
                    self.loadSelectData(target, $temp);
                }
            }
        },

        loadSelectData: function (target, $select, isClearSelf) {
            var self = this;
            var url = $select.data('url');
            var opts = $(target).data('query').options;
            var queryString = self.getQueryString(target, $select);

            if (!url) return;

            if (queryString === false) {
                self.clearSelect(target, $select, isClearSelf);
                return;
            }

            $.ajax({
                url: url + queryString,
                type: 'GET',
                cache: false,
                timeout: 3000,
                success: function (result) {
                    self.clearSelect(target, $select);
                    self.updateSelect(target, $select, result);
                    $select.data('loaded', true);
                },
                error: opts.onSelectAjaxError && opts.onSelectAjaxError.call(null, $select)
            });
        },

        getQueryString: function (target, $select) {
            var self = this;
            var dependenciesIdStr = $select.data('dependenciesids');
            var dependenciesIdList = dependenciesIdStr && JSON.parse(dependenciesIdStr.replace(/\'/g, '"'));
            var len = dependenciesIdList && dependenciesIdList.length;
            var $target = $(target);
            var $temp;
            var list = [];

            for (var i = 0; i < len; i++) {
                $temp = $target.find(dependenciesIdList[i]);
                if ($temp.length === 0 || $temp.val() === '') return false;
                list.push($temp[0].name + '=' + $temp.val());
            }

            return len ? '?' + list.join('&') : '';
        },

        clearSelect: function (target, $select, isClearSelf) {
            var self = this;
            var $target = $(target);
            var opts = $target.data('query').options;
            var withAll = $select.data('withall') || opts.withAll;
            var withAllText = $select.data('withalltext') || opts.withAllText;
            var clearIdStr = $select.data('clearids');
            var clearIdList = clearIdStr && JSON.parse(clearIdStr.replace(/\'/g, '"'));
            var len = clearIdList && clearIdList.length;
            var $temp;

            if (isClearSelf)  $select.html(withAll ? '<option value="">' + withAllText + '</option>' : '');

            for (var i = 0; i < len; i++) {
                $temp = $target.find(clearIdList[i]);
                $temp.html(withAll ? '<option value="">' + withAllText + '</option>' : '');
                $temp.data('loaded', false);
            }
        },

        updateSelect: function (target, $select, data) {
            var self = this;
            var opts = $(target).data('query').options;
            var withAll = $select.data('withall') || opts.withAll;
            var withAllText = $select.data('withalltext') || opts.withAllText;
            var html = withAll ? '<option value="">' + withAllText + '</option>' : '';

            for (var i = 0; i < data.length; i++) {
                html += '<option value="' + data[i].code + '">' + data[i].name + '</option>';
            }

            $select.html(html);
            $select.val($select.data('value'));
        },

        resetItem: function ($item) {
            var self = this;

            if ($item.is('select')) {
                $item.data('loaded', false);
            }

            $item.val('');
        },

        getParams: function (target) {
            var self = this;
            var len = target.jq.$queryItemList.length;
            var opts = $(target).data('query').options;
            var $temp;
            var $input;
            var value;
            var result = {};

            for (var i = 0; i < len; i++) {
                $temp = $(target.jq.$queryItemList[i]);
                $input = $temp.find('.' + target.ns.cssPrefix + 'query-input');

                try {
                    value = $input.combobox ? $input.combobox('getValue') : $input.val();
                } catch (e) {
                    value = $input.val();
                }

                if ($temp.is('.' + target.ns.cssPrefix + 'query-required') && value == '') {
                    opts.onRequiredIsEmpty.call(null, target);
                    return;
                }
                if (value != '') {
                    result[$input[0].name] = value;
                }
            }

            return result;
        },

        doQuery: function (target, params) {
            var self = this;
            var $target = $(target);
            var opts = $target.data('query').options;

            target.ns.params = params;

            if (opts.url) {
                $.ajax({
                    url: opts.url,
                    type: opts.method,
                    cache: opts.cache,
                    timeout: opts.timeout,
                    data: target.ns.params,
                    dataType: 'json',
                    beforeSend: opts.onAjaxBeforeSend,
                    complete: opts.onAjaxComplete,
                    error: function () {
                        opts.onAjaxError && opts.onAjaxError.apply(null, Array.prototype.slice.apply(null, arguments));
                    },
                    success: function (result) {
                        opts.onAjaxSuccess && opts.onAjaxSuccess.apply(null, [result]);
                    }
                });
            }

            $target.triggerHandler('query', target.ns.params);
        },

        templateMap: {
            wrapper: {
                begin: '<div class="{cssPrefix}query-wrapper">',
                end: '</div>'
            },
            content: {
                begin: '<div class="{cssPrefix}query-content">',
                end: '</div>'
            },
            operation: {
                begin: '<div class="{cssPrefix}query-operation">',
                end: '</div>'
            },
            item: {
                begin: '<div class="{cssPrefix}query-item {required}"><span class="{cssPrefix}query-label"><label title="{label}">{label}：</label></span><span class="{cssPrefix}query-input-wrapper">',
                end: '</span></div>'
            },
            input: '<input type="text" class="{cssPrefix}query-input" name="{name}" id="{id}">',
            select: '<select class="{cssPrefix}query-input" name="{name}" id="{id}" data-withall="{withAll}" data-withalltext="{withAllText}" data-preload="{preload}" data-dependenciesids="{dependenciesIds}"  data-clearids="{clearIds}" data-next="{next}" data-url="{url}">{options}</select>',
            query: '<a class="{cssPrefix}query-btn {cssPrefix}query-action" href="javascript:;">{queryText}</a>',
            reset: '<a class="{cssPrefix}query-btn {cssPrefix}query-reset" href="javascript:;">{resetText}</a>'
        }
    };

    $.fn.query = function (options, params) {
        if (typeof options == 'string') {
            return $.fn.query.methods[options](this, params);
        }

        options = options || {};

        return this.each(function () {

            $.data(this, 'query', {
                options: $.extend(true, {}, $.fn.query.defaults, options)
            });

            return query.init(this);
        });
    };

    $.fn.query.methods = {
        getParams: function ($target) {
            return query.getParams($target[0]);
        },
        isRequiredIsEmpty: function ($target) {
            return query.getParams($target[0]) ? false : true;
        }
    };

    $.fn.query.defaults = {
        cssPrefix: 's-',
        lang: 'zh_CN',  // 'en_US ' | 'zh_CN'
        withAll: true,
        withAllText: '全部',
        url: '',
        method: 'POST',
        cache: false,
        timeout: 3000,
        params: null,
        operationBtnList: ['query', 'reset'],
        onAjaxBeforeSend: null,
        onAjaxComplete: null,
        onAjaxError: null,
        onAjaxSuccess: null,
        onBeforeRender: null,
        onAfterRender: null,
        onBeforeQuery: null,
        onAfterQuery: null,
        onBeforeReset: null,
        onAfterReset: null,
        onRequiredIsEmpty: function () {
        },
        onSelectAjaxError: function () {
        }
    };
});