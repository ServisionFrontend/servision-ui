/**
 * jQuery  ServisionUI 1.0
 *
 * combobox - jQuery ServisionUI
 *
 **/
;
(function($) {

	(function() {
		$(document).off(".s-combobox-p").on("click", function(e) {
			var $panel = $(e.target).closest('.s-combobox-p');
			if ($panel.size()) {
				return;
			}

			$("body>div.s-combobox-p:visible").combobox("close");
		});
	})();

	var no0p = $.noop,
		COMBOBOX_SERNO = 10000;

	function init(target) {
		var state = $.data(target, 'combobox'),
			panel = state.panel,
			opts = state.options;
		if (panel) {
			if (!panel.hasClass("s-combobox-p")) {
				COMBOBOX_SERNO++;
				panel.addClass('s-combobox-p').css({
					'zIndex': COMBOBOX_SERNO,
					'top': fixTop(target),
					'left': fixLeft(target)
						// 'display': 'none'
				});
			}
		}

		initTextBox(state);

		//init panel event handler
		panel.off('.s-combobox');
		for (var event in opts.panelEvents) {
			panel.on(event + '.s-combobox', {
				target: target
			}, opts.panelEvents[event]);
		}
	}

	function initTextBox(state) {
		var state = $.data(target, 'combobox'),
			panel = state.panel,
			opts = state.options;
		for (var event in opts.panelEvents) {
			panel.on(event + '.s-combobox', {
				target: target
			}, opts.panelEvents[event]);
		}

	}

	function fixTop(target) {
		var $target = $(target),
			$panel = $target.combobox("panel"),
			top = 0;
		if ($target.offset().top + $target.outerHeight() + $panel.outerHeight() > $(document).scrollTop() + $(window).height())
			top = $target.offset().top - $panel.outerHeight();
		else
			top = $target.offset().top + $target.outerHeight();
		return top;
	}

	function fixLeft(target) {
		var $target = $(target);

		return $target.offset().left;
	}

	function bindEvent(target) {

	}

	function loadData(target, data, remainText) {
		var state = $.data(target, 'combobox'),
			opts = state.options;

		state.data = opts.loadFilter.call(target, data);

		opts.view.render.call(opts.view, target, state.panel.children(), state.data);

		opts.onLoadSuccess.call(target, data);

	}

	function request(target, url, param, remainText) {
		var opts = $.data(target, 'combobox').options;
		if (url) {
			opts.url = url;
		}
		param = $.extend({}, opts.queryParam, param);

		if (opts.onBeforeLoad.call(target, param) === false) return;

		opts.loader.call(target, param, function(data) {
			loadData(target, data, remainText);
		}, function() {
			opts.onLoadError.call(this, arguments);
		});
	}

	function mouseoverHandler(target) {}

	function mouseoutHandler(target) {}

	function clickHandler(target) {}

	function scrollHandler(target) {}

	$.fn.combobox = function(options, params) {

		if (typeof options === "string") {
			var methods = $.fn.combobox.methods[options];
			if (methods) {
				return methods(this, params);
			}
		}
		options = options || {};

		return this.each(function() {
			var state = $.data(this, 'combobox');
			if (state) {

				state = $.extend(state.options, options);
			} else {

				$.data(this, 'combobox', {
					options: $.extend($.fn.combobox.defaults, options),
					panel: $("<div class='s-combobox-container'><div class='s-combobox-inner'></div></div>").appendTo("body"),
					data: []
				});
			}

			init(this);

			request(this);
		});
	};

	$.fn.combobox.methods = {
		options: function(jq) {
			return $.data(jq[0], "combobox").options;
		},
		panel: function(jq) {
			return $.data(jq[0], "combobox").panel;
		},
		close: function(jq) {
			jq.hide();
		}
	};

	var defaultView = {
		render: function(target, container, data) {
			var state = $.data(target, 'combobox'),
				opts = state.options;

			state.itemIdPrefix = '_s_combobox_i';
			state.groupIdPrefix = '_s_combobox_g';
			state.groups = [];
			COMBOBOX_SERNO++;

			var dd = [],
				i = 0,
				l = data.length,
				groups = undefined;

			for (; i < l; i++) {
				var t = data[i][opts.textField];
				var v = data[i][opts.valueField];
				var g = data[i][opts.groupField];
				if (g) {
					if (g != groups) {
						groups = g;

						state.gruops.push({
							value: g,
							startIndex: i,
							count: 1
						});

						dd.push("<div id='" + state.groupIdPrefix + "_" + (state.gruops.length - 1) + "' class='s-combobo-group'></div>");
						dd.push(g);
						dd.push("</div>");
					} else {
						state.gruops[state.gruops.length - 1].count++;
					}
				} else {
					groups = undefined;
				}
				dd.push("<div id='" + state.itemIdPrefix + "_" + i + "' class='s-combobo-item " + (g ? 's-combobo-gitem' : '') + "'>");
				dd.push(t);
				dd.push("</div>");
			}


			$(container).html(dd.join(''));
		}
	};

	$.fn.combobox.defaults = {
		width: 200,
		height: 200,
		valueField: 'value',
		textField: 'text',
		groupField: 'group',
		isCheckBox: false,
		mode: 'remote', //or 'local'
		method: 'post',
		url: null,
		data: null,
		view: defaultView,
		inputEvents: {
			click: no0p,
			keydown: no0p,
			paste: no0p,
			drop: no0p
		},
		keyHandler: {
			up: no0p,
			down: no0p,
			right: no0p,
			left: no0p,
			query: function() {}
		},
		panelEvents: {
			mouseenter: mouseoverHandler,
			mouseleave: mouseoutHandler,
			click: clickHandler,
			scroll: scrollHandler
		},
		loader: function(params, success, error) {
			var opts = $(this).combobox('options');
			if (!opts.url) return;
			$.ajax({
				type: opts.method,
				url: opts.url,
				data: params,
				dataType: 'json',
				success: function(data) {
					success(data);
				},
				error: function() {
					error.apply(this, arguments);
				}
			});
		},
		loadFilter: function(data) {
			return data;
		},
		onBeforeLoad: function(param) {},
		onLoadSuccess: function(param) {},
		onLoadError: function(param) {}
	};


})(jQuery);