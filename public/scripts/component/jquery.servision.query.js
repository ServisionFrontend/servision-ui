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

    var query = {

        init: function ($target) {
            var self = this;

            self.initGlobalScope($target);
            self.render($target);
        },

        initGlobalScope: function ($target) {
            var self = this;

        },

        render: function ($target) {
            var self = this;

        },

        initJqueryObject: function ($target) {
            var self = this;

        },

        initEvent: function ($target) {
            var self = this;

        }
    };

    $.fn.query = function (options, param) {
        if (typeof options == 'string') {
            return $.fn.query.methods[options](this, param);
        }

        options = options || {};

        return this.each(function () {

            $.data(this, 'query', {
                options: $.extend(true, {}, $.fn.query.defaults, options)
            });

            query.init($(this));
        });
    };

    $.fn.query.methods = {};

    $.fn.query.defaults = {
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
        onAfterRender: null
    };
});