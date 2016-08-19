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

		initTextBox(target);

		if (panel) {
			if (!panel.hasClass("s-combobox-p")) {
				COMBOBOX_SERNO++;
				panel.addClass('s-combobox-p').css({
					'zIndex': COMBOBOX_SERNO,
					'top': fixTop(target),
					'left': fixLeft(target),
					'display': 'none'
				});
			}
		}

		//init panel event handler
		for (var event in opts.panelEvents) {
			panel.on(event + '.s-combobox', {
				target: target
			}, opts.panelEvents[event]);
		}
	}

	function initTextBox(target) {
		var state = $.data(target, 'combobox'),
			opts = state.options,
			$panel = state.panel,
			$target = $(target),
			tw = $target.outerWidth(),
			th = $target.outerHeight(),
			m = {
				top: $target.css('marginTop'),
				left: $target.css('marginLeft'),
				right: $target.css('marginRight'),
				bottom: $target.css('marginBottom')
			},
			p = {
				top: $target.css('paddingTop'),
				left: $target.css('paddingLeft'),
				right: $target.css('paddingRight'),
				bottom: $target.css('paddingBottom')
			},
			$comboTarget = $target.combobox('comboTarget'),
			$input = $comboTarget.find("input.s-textbox-text"),
			$inputHide = $comboTarget.find("input.s-textbox-value"),
			$arrow = $comboTarget.find("a.s-combobox-arrow");

		//initialization component size
		$comboTarget.css({
			width: tw,
			height: th,
			lineHeight: th + 'px'
		});

		$panel.css({
			width: opts.width || tw,
			height: opts.height || 200
		});

		var padding = ['0', p.right, '0', p.left],
			margin = ['0', $arrow.outerWidth(true), '0', '0'];

		$input.css({
			width: tw - $arrow.outerWidth(true) - p.left - p.bottom,
			padding: padding.join(' '),
			height: th,
			lineHeight: th + 'px',
			margin: margin.join(' ')
		});

		$arrow.css({
			height: th
		});


		//initialization component events
		$input
			.add($arrow)
			.off('.s-combobox');

		$arrow.on("click.s-combobox", function(e) {
			$target.combobox("open");
			e.stopPropagation();
		});

		for (var event in opts.inputEvents) {
			$input.on(event + '.s-combobox', {
				target: target
			}, opts.inputEvents[event]);
		}
	}

	function open(target) {
		var state = $.data(target, 'combobox');

		if (state.panel.not(":visible"))
			state.panel.css({
				'zIndex': COMBOBOX_SERNO,
				'top': fixTop(target),
				'left': fixLeft(target)
			}).show();
	}

	function fixTop(target) {
		var $target = $(target),
			$panel = $target.combobox("panel"),
			$comboTarget = $target.combobox('comboTarget'),
			top = 0;

		if ($comboTarget.offset().top + $comboTarget.outerHeight() + $panel.outerHeight() > $(document).scrollTop() + $(window).height())
			top = $comboTarget.offset().top - $panel.outerHeight();
		else
			top = $comboTarget.offset().top + $comboTarget.outerHeight();

		return top;
	}

	function fixLeft(target) {
		var $target = $(target),
			$comboTarget = $target.combobox('comboTarget'),
			left = $comboTarget.offset().left;

		return left;
	}

	function bindKeyHandlerEvent(e) {
		var target = e.target,
			$target = $(target),
			state = $.data(target, 'combobox'),
			opts = state.options;

		switch (e.keyCode) {
			case 38:
				opts.keyHandler.up.call(target, e);
				break;
			case 40:
				opts.keyHandler.down.call(target, e);
				break;
			case 37:
				opts.keyHandler.left.call(target, e);
				break;
			case 39:
				opts.keyHandler.right.call(target, e);
				break;
			case 13:
				opts.keyHandler.enter.call(target, e);
				return false;
			case 9:
			case 27:
				$target.combobox("panel").combobox("close");
				break;
			default:
				if (state.timer) {
					clearTimeout(state.timer);
				}
				state.timer = setTimeout(function() {
					var q = $target.combobox("getText");
					if (state.previous != q) {
						state.previous = q;
						opts.keyHandler.query.call(target, q, e);
					}
				}, opts.delay);
				break;

		}
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

	function clickHandler(e) {
		var target = e.data.target;
		if (!target) return;

		var state = $.data(target, 'combobox'),
			$panel = state.panel,
			$comboTarget = state.comboTarget;
		if (!$comboTarget) return;

		var opts = state.options,
			$item = $(e.target).closest(".s-combobox-item");
		if (!$item.size()) return;
		var row = opts.finder.getRow(target, $item);
		if (!row) return;
		var values = row[opts.valueField];

		$(target).combobox("setValue", values);

		$panel.combobox('close');
		e.stopPropagation();
	}

	function scrollHandler(target) {}

	function setValues(target, values) {
		var state = $.data(target, 'combobox'),
			opts = state.options,
			$panel = state.panel,
			i = 0,
			l = values.length,
			v, s, vv = [],
			ss = [];

		// unselect the old rows
		$.map($(target).combobox("getValues"), function(v) {
			//TODO
			//hasClass s-combobox-selected
			var $el = opts.finder.getEl(target, v);
			if ($el.size()) {
				if ($el.hasClass("s-combobox-selected")) {
					$el.removeClass("s-combobox-selected");
					opts.onUnselect.call(target, row);
				}
			}
		});

		for (; i < l; i++) {
			v = values[i];
			s = v;
			var row = opts.finder.getRow(target, v);
			if (row) {
				s = row[opts.textField];
				var $el = opts.finder.getEl(target, v);
				if ($el.size()) {
					if (!$el.hasClass("s-combobox-selected")) {
						$el.addClass("s-combobox-selected");
						opts.onSelect.call(target, row);
					}
				}
			}
			vv.push(v);
			ss.push(s);

		}

		state.comboTarget.find("input.s-textbox-value").val(vv.join(','));
		state.comboTarget.find("input.s-textbox-text").val(ss.join(','));
	}

	function getRowIndex(target, value) {
		var state = $.data(target, 'combobox');
		for (var i = 0; i < state.data.length; i++) {
			if (state.data[i][state.options.valueField] == value) {
				return i;
			}
		}
	}

	$.fn.combobox = function(options, params) {

		if (typeof options === "string") {
			var methods = $.fn.combobox.methods[options];
			if (methods) {
				return methods(this, params);
			}
			return null;
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
		comboTarget: function(jq) {
			if (!$.data(jq[0], "combobox").comboTarget) {
				var dd = [];
				dd.push('<span class="s-textbox">');
				dd.push('<span class="s-textbox-addon s-textbox-addon-right"><a class="s-textbox-icon s-combobox-arrow" href="javascript:;"></a></span>');
				dd.push('<input type="text" class="s-textbox-text">');
				dd.push('<input type="hidden" class="s-textbox-value">');
				dd.push('</span>');
				$.data(jq[0], 'combobox').comboTarget = $(dd.join('')).insertAfter(jq);
				jq.hide();
			}
			return $.data(jq[0], "combobox").comboTarget;

		},
		setValues: function(jq, values) {
			return jq.each(function() {
				setValues(this, values);
			});
		},

		setValue: function(jq, value) {
			return jq.each(function() {
				setValues(this, $.isArray(value) ? value : [value]);
			});
		},

		getValues: function(jq) {
			var state = $.data(jq[0], 'combobox'),
				$comboTarget = state.comboTarget;

			return $comboTarget.find("input.s-textbox-value").val().split(",");
		},

		getText: function(jq) {
			return jq.val();
		},
		open: function(jq) {
			return open(jq[0]);
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

						dd.push("<div id='" + state.groupIdPrefix + "_" + (state.gruops.length - 1) + "' class='s-combobox-group'></div>");
						dd.push(g);
						dd.push("</div>");
					} else {
						state.gruops[state.gruops.length - 1].count++;
					}
				} else {
					groups = undefined;
				}
				dd.push("<div id='" + state.itemIdPrefix + "_" + i + "' class='s-combobox-item " + (g ? 's-combobox-gitem' : '') + "'>");
				dd.push(t);
				dd.push("</div>");
			}


			$(container).html(dd.join(''));
		}
	};

	$.fn.combobox.defaults = {
		valueField: 'value',
		textField: 'text',
		groupField: 'group',
		isCheckBox: false,
		mode: 'remote', //or 'local'
		method: 'post',
		url: null,
		data: null,
		delay: 200,
		view: defaultView,
		inputEvents: {
			click: no0p,
			keydown: bindKeyHandlerEvent,
			paste: no0p,
			drop: no0p
		},
		keyHandler: {
			up: no0p,
			down: no0p,
			right: no0p,
			left: no0p,
			enter: function(e) {

			},
			query: function(q, e) {}
		},
		panelEvents: {
			mouseenter: mouseoverHandler,
			mouseleave: mouseoutHandler,
			click: clickHandler,
			scroll: scrollHandler
		},
		finder: {
			getEl: function(target, value) {
				var index = getRowIndex(target, value);
				var id = $.data(target, 'combobox').itemIdPrefix + '_' + index;
				return $('#' + id);
			},
			getRow: function(target, p) {
				var state = $.data(target, 'combobox');
				var index = (p instanceof $) ? p.attr('id').substr(state.itemIdPrefix.length + 1) : getRowIndex(target, p);
				return state.data[parseInt(index)];
			}
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
		onLoadError: function(param) {},
		onSelect: function(record) {},
		onUnselect: function(record) {}
	};


})(jQuery);