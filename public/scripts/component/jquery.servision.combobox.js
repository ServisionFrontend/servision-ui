/**
 * jQuery  ServisionUI 1.0
 *
 * combobox - jQuery ServisionUI
 *
 **/
;
(function($) {


	var no0p = $.noop,
		COMBOBOX_SERNO = 10000,
		INDENT = 0,
		GLOBAL_TARGET_CACHE = (function() {
			var caches = [];
			return {
				add: function(el) {
					if (el) {
						for (var key in caches) {
							if (el === caches[key]) return;
						}
						caches.push(el);
						if (caches.length > 100) {
							caches.splice(100);
						}
					}
				},
				get: function() {
					return caches;
				}
			};
		})(),
		debounce = function(fn, wait, immediait) {
			var timer;
			return function() {
				var context = this,
					args = arguments,
					later = function() {
						timer = null;
						if (!immediait) {
							fn.apply(context, args);
						}
					};
				var callNow = immediait && !timer;
				clearTimeout(timer);
				timer = setTimeout(later, wait);
				if (callNow) {
					fn.apply(context, args);
				}
			};
		};

	(function() {

		$(document).off(".s-combobox-p").on("mousedown.s-combobox-p", function(e) {
			var $panel = $(e.target).closest('.s-combobox-p,.s-textbox');

			if ($panel.length) {
				return;
			}

			var cacheTags = GLOBAL_TARGET_CACHE.get();

			$(cacheTags).combobox('close');

			// debounce(function() {
			// 	var cacheTags = GLOBAL_TARGET_CACHE.get();
			// 	$(cacheTags).combobox('close');
			// }, 2 * 1000)();

		});

		$(window).off(".s-combobox-p").on("resize.s-combobox-p", debounce(function() {
			var $panel = $('.s-combobox-p:visible');
			if ($panel.length) {

				var cacheTags = GLOBAL_TARGET_CACHE.get();
				$.each(cacheTags, function(idx, val) {
					if ($.data(val, "combobox").panel[0] == $panel[0]) {
						$(val).combobox('fixPosition');
						return false;
					}
				});
			}
		}, 300));
	})();

	function scrollTo(target, value) {
		var opts = $.data(target, 'combobox').options,
			panel = $(target).combobox('panel').children(),
			item = opts.finder.getEl(target, value),
			h;
		if (item.length) {
			if (item.position().top <= 0) {
				h = panel.scrollTop() + item.position().top;
				panel.scrollTop(h);
			} else if (item.position().top + item.outerHeight() > panel.height()) {
				h = panel.scrollTop() + item.position().top + item.outerHeight() - panel.height();
				panel.scrollTop(h);
			}
		}
	}

	function init(target) {
		var state = $.data(target, 'combobox'),
			panel = state.panel,
			opts = state.options;

		initTextBox(target, state);

		GLOBAL_TARGET_CACHE.add(target);

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

		panel.off(".s-combobox");
		//init panel event handler
		for (var event in opts.panelEvents) {
			panel.on(event + '.s-combobox', {
				target: target
			}, opts.panelEvents[event]);
		}
	}

	function initTextBox(target, state) {
		var opts = state.options,
			$panel = state.panel,
			$target = $(target),
			tw = $target.innerWidth(),
			th = $target.innerHeight(),
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

		$panel.children(":eq(0)").css({
			width: opts.width || tw,
			maxHeight: opts.height || 200,
			'_height': opts.height || 200
		});

		var padding = [p.top, p.right, p.bottom, p.left],
			margin = ['0', $arrow.outerWidth(true) + 'px', '0', '0'];

		$input.css({
			width: $target.width() - $arrow.outerWidth(true),
			padding: padding.join(' '),
			height: $target.height(),
			lineHeight: $target.height() + 'px',
			margin: margin.join(' ')
		}).attr("readOnly", opts.disabled).addClass(opts.disabled ? 's-textbox-disabled' : '');

		$arrow.css({
			height: th
		});


		//initialization component events
		$input
			.add($arrow)
			.off('.s-combobox');

		$arrow.on("click.s-combobox", {
			target: target
		}, function(e) {
			toggleOpen(e);
		});

		if (opts.disabled) {
			$comboTarget.off('.s-combobox').on("click.s-combobox", {
				target: target
			}, function(e) {
				toggleOpen(e);
			});
		}

		for (var event in opts.inputEvents) {
			$input.on(event + '.s-combobox', {
				target: target
			}, opts.inputEvents[event]);
		}

		function toggleOpen(e) {
			var target = e.data.target,
				$target = $(target),
				stateIner = $.data(target, 'combobox');

			var cacheTags = GLOBAL_TARGET_CACHE.get();

			$(cacheTags).not(target).combobox('close');

			if (stateIner.panel.is(":hidden")) {
				$target.combobox("open");
			} else {
				$target.combobox("close");
			}

			e.stopPropagation();
		}

		if ($.trim(opts.originalValue).length > 0)
			setValues(target, opts.originalValue);
	}

	function open(target) {
		if (!target) return;

		var state = $.data(target, 'combobox'),
			opts = state.options,
			q;

		if (state.panel.is(":hidden")) {
			COMBOBOX_SERNO++;
			state.panel.css({
				'zIndex': COMBOBOX_SERNO,
				'top': fixTop(target),
				'left': fixLeft(target)
			}).show();

			state.comboTarget.find(".s-textbox-text").focus();

			q = $(target).combobox("getText");

			doQuery(target, q);

			if (opts.onOpenPanel) {
				opts.onOpenPanel.call(target);
			}
		}
	}

	function getDependencies(target) {
		var state = $.data(target, 'combobox'),
			opts = state.options,
			dependV = [];
		//级联依赖项
		if (opts.dependenciesIds) {
			if (!$.isArray(opts.dependenciesIds))
				opts.dependenciesIds = [opts.dependenciesIds];
			var i = 0,
				l = opts.dependenciesIds.length,
				selector;
			for (; selector = opts.dependenciesIds[i]; i++) {

				var vv = $(selector).combobox("getValues"),
					vs = opts.dependenciesParams ? opts.dependenciesParams.call(target, vv) : {
						parentId: vv
					};

				opts.queryParams = $.extend(opts.queryParams, vs);

				dependV = dependV.concat(vv);
			}
		}

		if (opts.dependenciesIds && opts.dependenciesIds.length && !dependV.length) {
			if (opts.mode == 'local') {
				state.panel.children().children('.s-combobox-item,.s-combobox-group').hide();
			} else if (opts.mode == 'remote') {
				opts.view.render.call(opts.view, target, state.panel.children(':eq(0)'), []);
			}
			$(target).combobox('fixPosition');
			return false;
		}
		return true;
	}

	function close(target) {
		var state = $.data(target, 'combobox');
		if (!state) return;

		var opts = state.options;

		if (state.panel && state.panel.is(":visible")) {

			if (opts.onHidePanel) {
				opts.onHidePanel.call(target);
			}
			state.panel.hide();

			if (state.panel.blockUI) {
				state.panel.blockUI.remove();
			}
		}
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

	function fixPosition(target) {
		if (!target) return;
		var state = $.data(target, 'combobox'),
			$panel = state.panel;
		if ($panel.is(":visible")) {
			$panel.css({
				'top': fixTop(target),
				'left': fixLeft(target)
			});
		}
	}

	function bindKeyHandlerEvent(e) {
		var target = e.data.target,
			$target = $(target),
			$input = $(e.target),
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
				$target.combobox("close");
				break;
			default:
				if (state.timer) {
					clearTimeout(state.timer);
				}
				state.timer = setTimeout(function() {
					var q = $(target).combobox("getText");
					if (state.previous != q) {
						setPrevAndClear(target, q);
						if (state.panel.is(":hidden")) {
							$target.combobox('open');
						} else {
							opts.keyHandler.query.call(target, q, e);
						}
					}
				}, opts.delay);
				break;
		}
	}

	function mouseoverHandler(e) {
		$(this).children().children('div.s-combobox-item-hover').removeClass('s-combobox-item-hover');
		var $item = $(e.target).closest("div.s-combobox-item");
		$item.addClass("s-combobox-item-hover");
		e.stopPropagation();
	}

	function mouseoutHandler(e) {
		$(e.target).closest('div.s-combobox-item').removeClass('s-combobox-item-hover');
		e.stopPropagation();
	}

	function loadData(target, data, remainText) {
		var state = $.data(target, 'combobox'),
			query = $(target).combobox('getText'),
			opts = state.options,
			$target = $(target),
			$panel = state.panel,
			vv;

		state.data = opts.loadFilter.call(target, data) || [];

		opts.view.render.call(opts.view, target, state.panel.children(':eq(0)'), state.data);

		query = opts.multiple ? query.split(opts.separator) : [query];

		setLimitItem(target, query);

		vv = $(target).combobox('getValues');

		if (opts.multiple) {
			setValues(target, vv, remainText);
		} else {
			setValues(target, vv.length ? [vv[0]] : [], remainText);
		}

		opts.onLoadSuccess.call(target, data);

		$(target).combobox('fixPosition');

	}

	function request(target, url, param, remainText) {
		var state = $.data(target, 'combobox'),
			opts = state.options,
			hasDependencies = getDependencies(target);
		if (url) {
			opts.url = url;
		}
		if (!hasDependencies) return;

		param = $.extend({}, opts.queryParams, param);

		if (opts.onBeforeLoad.call(target, param) === false) return;

		opts.loader.call(target, param, function(data) {
			loadData(target, data, remainText);
		}, function() {
			opts.onLoadError.call(this, arguments);
			opts.view.render.call(opts.view, target, state.panel.children(':eq(0)'), []);
		});
	}

	function doQuery(target, q) {
		var state = $.data(target, 'combobox'),
			opts = state.options,
			$panel = state.panel,
			query = opts.multiple ? q.split(opts.separator) : [q];

		if (opts.mode == 'remote') {
			//此步骤必须，异步获取成功后会再次读取文本框值并再次赋值
			_setValue(query, true);
			request(target, null, {
				q: query
			}, null);
		} else {
			var vv = setLimitItem(target, query);
			//重置选中样式
			_setValue(vv);

			$(target).combobox('fixPosition');
		}

		function _setValue(v, remineText) {
			setValues(target, opts.multiple ? (q ? v : []) : v, remineText);
		}

	}

	function setLimitItem(target, query) {
		var state = $.data(target, 'combobox'),
			data = state.data,
			opts = state.options,
			$panel = state.panel,
			vv = [],
			group = undefined;

		if (opts.showLimitItem) {
			$panel
				.find('.s-combobox-item-hover')
				.removeClass('s-combobox-item-hover')
				.end()
				.find('.s-combobox-item,.s-combobox-group')
				.hide();
		}

		$.map(query, function(val, idx) {
			var value = val;

			for (var i = 0, row; row = data[i]; i++) {
				var t = row[opts.textField] || '',
					v = row[opts.valueField] || '',
					g = row[opts.groupField] || '';
				if (t.toLowerCase().indexOf(val.toLowerCase()) > -1) {

					var $el = opts.finder.getEl(target, v).show();
					if (t.toLowerCase() == val.toLowerCase()) {
						value = v;
						select(target, v, true);
					}

					if (opts.groupField && group != g) {
						opts.finder.getGroupEl(target, g).show();
						group = g;
					}
				}
			}
			vv.push(value);
		});
		return vv;
	}

	function setValues(target, values, remainText) {
		var state = $.data(target, 'combobox');

		if (!state) return;

		var opts = state.options,
			$panel = state.panel,
			i = 0,
			l = 0,
			v, t, vv = [],
			tt = [];

		if (!$.isArray(values)) {
			values = values.split(opts.separator);
		}
		if (!opts.multiple) {
			values = values.length ? [values[0]] : [''];
		}
		l = values.length;

		// unselect the old rows
		$.map($(target).combobox("getValues"), function(v) {
			//hasClass s-combobox-selected
			if ($.inArray(v, values) === -1) {
				var $el = opts.finder.getEl(target, v, remainText);
				if ($el.size()) {
					if ($el.hasClass("s-combobox-selected")) {
						$el.removeClass("s-combobox-selected");
						opts.onUnselect.call(target, opts.finder.getRow(target, v, remainText));
					}
				}
			}
		});

		for (; i < l; i++) {
			v = values[i];
			t = v;
			var row = opts.finder.getRow(target, v, remainText);
			if (row) {
				t = row[opts.textField];
				v = row[opts.valueField];
				var $el = opts.finder.getEl(target, v);
				if ($el.size()) {
					if (!$el.hasClass("s-combobox-selected")) {
						$el.addClass("s-combobox-selected");
						opts.onSelect.call(target, row);
					}
				}
			}
			vv.push(v);
			tt.push(t);
		}

		setTextBoxValue(state, vv, tt, remainText);
	}

	function setTextBoxValue(state, vv, tt) {
		var opts = state.options,
			$v = state.comboTarget.find("input.s-textbox-value"),
			$t = state.comboTarget.find("input.s-textbox-text"),
			v = vv.join(opts.separator),
			t = tt.join(opts.separator);

		$v.val(v);
		$t.val(t);
	}

	function doEnter(target) {
		var $target = $(target),
			state = $.data(target, 'combobox'),
			opts = state.options,
			$panel = state.panel,
			$item = $panel.children(":eq(0)").find("div.s-combobox-item-hover");
		if ($item.size()) {
			var row = opts.finder.getRow(target, $item);
			var v = row[opts.valueField];
			if (opts.multiple) {
				if ($item.hasClass("s-combobox-selected")) {
					$target.combobox('unselect', v);
				} else {
					$target.combobox('select', v);
				}

			} else {
				$target.combobox('select', v);
			}
		}

		if (!opts.multiple) {
			$target.combobox('close');
		}
	}

	function clickHandler(e) {
		var target = e.data.target;

		if (!target) return;
		var $target = $(target),
			state = $.data(target, 'combobox'),
			$panel = state.panel,
			$comboTarget = state.comboTarget;
		if (!$comboTarget) return;

		var opts = state.options,
			$item = $(e.target).closest(".s-combobox-item");
		if (!$item.size()) return;
		var row = opts.finder.getRow(target, $item);
		if (!row) return;
		var val = row[opts.valueField];
		if (opts.multiple) {
			if ($item.hasClass('s-combobox-selected')) {
				$target.combobox('unselect', val);
			} else {
				$target.combobox("select", val);
			}
		} else {
			$target.combobox("select", val);
		}

		if (!opts.multiple) {
			$target.combobox('close');
		}
		e.stopPropagation();
	}

	function select(target, value, openflag) {
		var state = $.data(target, 'combobox'),
			opts = state.options,
			values = $(target).combobox('getValues'),
			key;

		if (typeof value != 'string') {
			key = value.key;
			value = value.v;
		}
		if ($.inArray(value, values) == -1) {
			if (key) {
				values = [value];
				if (!opts.multiple) {
					$(target).combobox("setValues", values);
					setPrevAndClear(target, $(target).combobox("getText"), openflag);
				}
			} else {
				if (opts.multiple) {
					values.push(value);
				} else {
					values = [value];
				}
				$(target).combobox("setValues", values);
				setPrevAndClear(target, $(target).combobox("getText"), openflag);
			}
		}
	}

	function unselect(target, value) {
		var state = $.data(target, 'combobox'),
			opts = state.options,
			values = $(target).combobox('getValues'),
			idx = $.inArray(value, values);

		if (idx >= 0) {
			values.splice(idx, 1);
			$(target).combobox("setValues", values);

			setPrevAndClear(target, $(target).combobox("getText"));
		}
	}

	function setPrevAndClear(target, q, openflag) {
		var state = $.data(target, 'combobox'),
			opts = state.options;

		if (state.previous != q) {
			//级联清除项
			if (opts.clearIds) {
				if (!$.isArray(opts.clearIds)) {
					opts.clearIds = [opts.clearIds];
				}
				//打开下拉框不做事
				if (!openflag) {
					$(opts.clearIds.join(',')).combobox("clear");
					opts.onClearDependencies.call(target, $(opts.clearIds.join(',')));
				}

			}
			state.previous = q;
		}
	}

	function getRowIndex(target, value, remainText) {
		var state = $.data(target, 'combobox'),
			matchfield = state.options.valueField;
		if (remainText) {
			if (!state.options.queryMatch) {
				state.options.queryMatch = state.options.valueField;
			}
			matchfield = state.options.queryMatch || state.options.valueField;
		}
		for (var i = 0; i < state.data.length; i++) {
			var v = state.data[i][matchfield];
			if (v != undefined) {
				if (v.toLowerCase() == value.toLowerCase()) {
					return i;
				}
			}
		}
		return -1;
	}

	function nav(target, dir) {
		var $target = $(target),
			state = $.data(target, 'combobox'),
			opts = state.options,
			$panel = state.panel.children(":eq(0)"),
			$item = $panel.children('div.s-combobox-item-hover'),
			firstSelector = "div.s-combobox-item:visible:first",
			lastSelector = "div.s-combobox-item:visible:last";
		if (!$item.size()) {
			$item = $panel.children('div.s-combobox-selected');
		}

		$item.removeClass("s-combobox-item-hover");

		if (!$item.size()) {
			$item = $panel.children(dir == 'prev' ? firstSelector : firstSelector);
		} else {
			if (dir === 'next') {
				$item = $item.nextAll(firstSelector);
				if (!$item.size()) {
					$item = $panel.children(firstSelector);
				}
			} else {
				$item = $item.prevAll(firstSelector);
				if (!$item.size()) {
					$item = $panel.children(lastSelector);
				}
			}
		}

		if ($item.size()) {
			$item.addClass("s-combobox-item-hover");
			var row = opts.finder.getRow(target, $item);
			if (row) {
				$(target).combobox('scrollTo', row[opts.valueField]);
				$target.combobox('select', {
					v: row[opts.valueField],
					key: true
				});
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

				$.extend(state.options, options);
			} else {

				state = $.data(this, 'combobox', {
					options: $.extend(true, {}, $.fn.combobox.defaults, options),
					panel: $("<div class='s-combobox-container'><div class='s-combobox-inner'></div></div>").appendTo("body"),
					data: []
				});
			}

			init(this);

			if (state.options.data) {
				loadData(this, state.options.data);
			}

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

		loadData: function(jq, data) {
			return jq.each(function(idx, val) {
				loadData(val, data);
			});
		},
		comboTarget: function(jq) {
			var state = $.data(jq[0], "combobox");
			if (state && !state.comboTarget) {
				var dd = [];
				dd.push('<span class="s-textbox">');
				dd.push('<span class="s-textbox-addon s-textbox-addon-right"><a class="s-textbox-icon s-combobox-arrow" href="javascript:;"></a></span>');
				dd.push('<input type="text" class="s-textbox-text" tabIndex="1" value="">');
				dd.push('<input type="hidden" class="s-textbox-value" value="">');
				dd.push('</span>');
				$.data(jq[0], 'combobox').comboTarget = $(dd.join('')).insertAfter(jq);
				jq.hide();
			}
			if (!state) return jq;

			return state.comboTarget;
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

		getValue: function(jq) {
			var values = jq.combobox("getValues");
			return values.length ? values[0] : "";
		},

		getValues: function(jq) {
			var state = $.data(jq[0], 'combobox'),
				opts = state.options,
				$comboTarget = state.comboTarget,
				vs = $comboTarget.find("input.s-textbox-value").val();

			if (opts.multiple) {
				vs = vs.split(opts.separator);
			} else {
				vs = [vs];
			}

			return vs;
		},


		getText: function(jq) {
			var state = $.data(jq[0], 'combobox'),
				opts = state.options,
				$comboTarget = state.comboTarget,
				vs = $.trim($comboTarget.find("input.s-textbox-text").val());
			return vs;
		},



		reload: function(jq, url) {
			return jq.each(function(idx, val) {
				if (typeof url == 'string') {
					request(this, url);
				} else {
					if (url) {
						var opts = $.data(this, 'combobox').option;
						opts.queryParams = url;
					}
					request(this);
				}
			});
		},

		fixPosition: function(jq) {
			return jq.each(function(idx, val) {
				fixPosition(val);
			});
		},

		reset: function(jq) {
			return jq.each(function(idx, val) {
				var opts = $(this).combobox('options');
				if (opts.multiple) {
					$(this).combobox('setValues', opts.originalValue);
				} else {
					$(this).combobox('setValue', opts.originalValue);
				}
			});
		},

		clear: function(jq) {
			return jq.each(function(idx, val) {
				setValues(this, []);
			});
		},

		select: function(jq, v) {
			return jq.each(function() {
				select(this, v);
			});
		},

		unselect: function(jq, v) {
			return jq.each(function() {
				unselect(this, v);
			});
		},

		scrollTo: function(jq, v) {
			return jq.each(function() {
				scrollTo(this, v);
			});
		},

		open: function(jq) {
			return open(jq[0]);
		},
		close: function(jq) {
			return jq.each(function(idx, val) {
				close(val);
			});
		}
	};

	var defaultView = {
		render: function(target, container, data) {
			var state = $.data(target, 'combobox'),
				opts = state.options;

			INDENT++;

			state.itemIdPrefix = '_s_combobox_i_' + INDENT;
			state.groupIdPrefix = '_s_combobox_g_' + INDENT;
			state.groups = [];


			var dd = [],
				i = 0,
				l = data.length,
				groups = undefined;

			for (; i < l; i++) {
				var row = data[i],
					t = row[opts.textField],
					v = row[opts.valueField],
					g = row[opts.groupField];

				if (g) {
					if (g != groups) {
						groups = g;

						state.groups.push({
							value: g,
							startIndex: i,
							count: 1
						});

						dd.push("<div id='" + state.groupIdPrefix + "_" + (state.groups.length - 1) + "' class='s-combobox-group'>");
						dd.push(opts.groupFormatter ? opts.groupFormatter.call(target, g) : g);
						dd.push("</div>");
					} else {
						state.groups[state.groups.length - 1].count++;
					}
				} else {
					groups = undefined;
				}
				dd.push("<div id='" + state.itemIdPrefix + "_" + i + "' class='s-combobox-item " + (g ? 's-combobox-gitem' : '') + "'>");
				dd.push(opts.formatter ? opts.formatter.call(target, row) : t);
				dd.push("</div>");
			}

			$(container).html(dd.join(' '));
		}
	};

	$.fn.combobox.defaults = {
		valueField: 'value',
		textField: 'text',
		originalValue: '',
		groupField: '',
		//渲染分组时自定义
		groupFormatter: function(g) {
			return g;
		},
		//按XX字段查询
		queryMatch: '',
		//远程请求方式
		method: 'GET',
		url: null,
		//默认查询参数
		queryParams: null,
		//筛选数据请求方式(级联查询时只支持remote)
		mode: 'local', //or 'remote'  
		//是否显示与筛选数据不相关的项
		showLimitItem: false,
		//本地数据加载
		data: null,
		//按键输入延迟查询
		delay: 500,
		multiple: false,
		disabled: false,
		//级联父级以下(所有子级)必须填写
		dependenciesIds: [],
		//清除级联下的子项
		clearIds: [],
		//传递到后台时依赖项参数
		dependenciesParams: function(vs) {
			return {
				parentId: vs
			};
		},
		//多选时分隔符
		separator: ',',
		view: defaultView,
		inputEvents: {
			click: function(e) {
				var target = e.data.target,
					state = $.data(target, 'combobox'),
					opts = state.options;

				if (state.panel.is(":visible") && !opts.disabled) {
					e.stopPropagation();
				}
			},
			blur: function(e) {
				var target = e.data.target,
					state = $.data(target, 'combobox'),
					opts = state.options,
					p = $(target).combobox("getText");
				//state.previous = p;
			},
			keydown: bindKeyHandlerEvent,
			paste: no0p,
			drop: no0p
		},
		keyHandler: {
			up: function(e) {
				nav(this, 'prev');
				e.preventDefault();
			},
			down: function(e) {
				nav(this, 'next');
				e.preventDefault();
			},
			right: no0p,
			left: no0p,
			enter: function(e) {
				doEnter(this);
			},
			query: function(q, e) {
				doQuery(this, q);
			}
		},
		panelEvents: {
			mouseover: mouseoverHandler,
			mouseout: mouseoutHandler,
			click: clickHandler
		},
		//格式化选项
		formatter: function(row) {
			var opts = $(this).combobox("options");
			return row[opts.textField];
		},
		finder: {
			getEl: function(target, value, remainText) {
				var index = getRowIndex(target, value, remainText);
				var id = $.data(target, 'combobox').itemIdPrefix + '_' + index;
				return $('#' + id);
			},
			getRow: function(target, p, remainText) {
				var state = $.data(target, 'combobox');
				var index = (p instanceof $) ? p.attr('id').substr(state.itemIdPrefix.length + 1) : getRowIndex(target, p, remainText);
				return state.data[parseInt(index)];
			},

			getGroupEl: function(target, gv) {
				var state = $.data(target, 'combobox'),
					index, id;
				$.each(state.groups, function(idx, val) {
					if (val.value == gv) {
						index = idx;
						return false;
					}
				});
				var id = state.groupIdPrefix + '_' + index;
				return $('#' + id);
			}
		},
		block: function(target) {
			var $panel = $(target).combobox('panel');
			var block = [];
			if ($panel.blockUI) {
				$panel.blockUI.remove();
			}
			block.push('<div class="mask-block-msg">');
			block.push('<div class="block-panel">');
			block.push('<div class="loading"></div>');
			block.push('</div></div>');

			if ($panel.is(":visible")) {
				$panel.blockUI = $(block.join(' ')).appendTo('body');
				var cssText = {
					'zIndex': $panel.css("zIndex"),
					'top': $panel.css("top"),
					'left': $panel.css("left"),
					'width': $panel.css("width"),
					'height': parseFloat($panel.css("height")) || 40
				};

				$panel.blockUI.css({
					'zIndex': cssText.zIndex,
					'top': cssText.top,
					'left': cssText.left,
					'width': cssText.width,
					'height': cssText.height
				});
			}
		},

		unblock: function(target) {
			var $panel = $(target).combobox('panel');
			if ($panel.blockUI) {
				$panel.blockUI.remove();
			}
		},
		//远程加载方法，可外部重写，接收参数，成功回调，失败回调
		loader: function(params, success, error) {
			var target = this;
			var opts = $(target).combobox('options');
			if (!opts.url) return;
			$.ajax({
				type: opts.method,
				url: opts.url,
				data: params,
				dataType: 'json',
				beforeSend: function() {
					opts.block(target);
				},
				complete: function() {
					opts.unblock(target);
				},
				success: function(data) {
					success(data);
				},
				error: function() {
					error.apply(this, arguments);
				}
			});
		},
		//重构数据
		loadFilter: function(data) {
			return data;
		},
		onClearDependencies: function(list) {},
		onHidePanel: function() {},
		onOpenPanel: function() {},
		onBeforeLoad: function(param) {},
		onLoadSuccess: function(param) {},
		onLoadError: function(param) {},
		onSelect: function(record) {},
		onUnselect: function(record) {}
	};


})(jQuery);