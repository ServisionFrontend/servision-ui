;
(function($) {

	function init(target) {
		var state = $.data(target, 'tooltip'),
			opts = state.options;

		bindEvent(target);

		reposition(target);
	}

	function bindEvent(target) {
		var state = $.data(target, 'tooltip'),
			opts = state.options,
			$target = $(target);

		$target.off(".tooltip").on(opts.showEvent + ".tooltip", function(e) {
				$target.tooltip("show", e);
			})
			.on(opts.hideEvent + ".tooltip", function(e) {
				$target.tooltip("hide", e);
			})
			.on("mousemove.tooltip", function(e) {
				if (opts.trackMouse) {
					opts.trackMouseX = e.pageX;
					opts.trackMouseY = e.pageY;
					$target.tooltip("reposition");
				}
			});
	}

	function position(target, pos) {
		var $target = $(target),
			state = $.data(target, 'tooltip'),
			$panel = state.panel,
			opts = $target.tooltip("options"),
			pos = pos || 'bottom',
			poslist = ["left", "right", "top", "bottom"],
			top = $.isFunction(opts.deltaY) ? opts.deltaY.call(target, pos) : opts.deltaY,
			left = $.isFunction(opts.deltaX) ? opts.deltaX.call(target, pos) : opts.deltaX;

		$panel.find(".s-tooltip-arrow-out,.s-tooltip-arrow").removeClass(poslist.join(' ')).addClass(pos);

		if (opts.trackMouse) {
			left = opts.trackMouseX + left;
			top = opts.trackMouseY + top;
		} else {
			left = $target.offset().left + left;
			top = $target.offset().top + top;
		}

		switch (pos) {
			case "top":
				left -= ($panel.outerWidth() - $target.outerWidth()) / 2;
				top -= $panel.outerHeight() + 12;
				break;
			case "left":
				left -= $panel.outerWidth() + 12;
				top -= ($panel.outerHeight() - $target.outerHeight()) / 2;
				break;
			case "right":
				left += $target.outerWidth() + 12;
				top -= ($panel.outerHeight() - $target.outerHeight()) / 2;
				break;
			case "bottom":
				left -= ($panel.outerWidth() - $target.outerWidth()) / 2;
				top += $target.outerHeight() + 12;
				break;
			default:
				break;
		}
		return {
			left: left,
			top: top
		};
	}

	function show(target, e) {
		var $target = $(target),
			state = $.data(target, 'tooltip'),
			opts = state.options,
			$panel = state.panel;

		if (state.showTime) {
			clearTimeout(state.showTime);
		}
		state.showTime = setTimeout(function() {
			defaultView.render.call(defaultView.render, target);

			$target.tooltip("reposition");

			$panel.show();

			if (opts.onShow) {
				opts.onShow.call(target, e);
			}
		}, opts.showDelay);
	}

	function hide(target, e) {
		var $target = $(target),
			state = $.data(target, 'tooltip'),
			opts = state.options,
			$panel = state.panel;

		if (state.hideTime) {
			clearTimeout(state.hideTime);
		}
		state.hideTime = setTimeout(function() {
			defaultView.render.call(defaultView.render, target);

			$target.tooltip("reposition");

			$panel.hide();

			if (opts.onHide) {
				opts.onHide.call(target, e);
			}
		}, opts.hideDelay);
	}

	function reposition(target) {
		var $target = $(target),
			state = $.data(target, 'tooltip'),
			$panel = state.panel,
			opts = state.options,
			pos = opts.position,
			_e = {
				top: -100000,
				left: -100000
			};

		_e = position(target, pos);

		if (pos === "top" && _e.top < 0) {
			_e = position(target, 'bottom');
		} else {
			if (pos === "bottom" && $target.offset().top + $target.outerHeight() + $panel.outerHeight() > $(document).scrollTop() + $(window).height()) {
				_e = position(target, 'top');
			}
		}
		if (_e.left < 0) {
			if (pos === "left") {
				_e = position(target, 'right');
			} else {
				_e.left = 0;
			}

		} else {
			if ($target.offset().left + $target.outerWidth() + $panel.outerWidth() > $(document).scrollLeft() + $(window).width()) {
				if (pos === "right") {
					_e = position(target, 'left');
				} else {
					_e.left = $(document).scrollLeft() + $(window).width() - $panel.outerWidth();
				}
			}
		}


		$panel.css({
			'top': _e.top,
			'left': _e.left,
			zIndex: opts.zIndex ? opts.zIndex : 100000
		});

		opts.onPosition.call(target, _e.left, _e.top);
	}

	var defaultView = {
		render: function(target, c) {
			var $target = $(target),
				state = $.data(target, 'tooltip'),
				opts = state.options,
				$panel = state.panel;
			if (c)
				opts.content = c;
			opts.content = $.isFunction(opts.content) ? opts.content.call(target) : opts.content;
			$panel.children('.s-tooltip-content').html(opts.content);
		}
	};


	$.fn.tooltip = function(options, params) {
		if (typeof options === "string") {
			var method = $.fn.tooltip.methods[options];
			if (method)
				return method(this, params);
		}
		options = options || {};
		return this.each(function() {
			var state = $.data(this, 'tooltip');
			if (state) {
				$.extend(state.options, options);
			} else {
				var dd = [];
				dd.push('<div class="s-tooltip">');
				dd.push('<div class="s-tooltip-content"></div>');
				dd.push('<div class="s-tooltip-arrow-out"></div>');
				dd.push('<div class="s-tooltip-arrow"></div>');
				dd.push('</div>');
				$.data(this, "tooltip", {
					options: $.extend(true, {}, $.fn.tooltip.defaults, $.fn.tooltip.parseOption(this), options),
					panel: $(dd.join('')).appendTo('body')
				});
			}

			init(this);

		});

	};

	$.fn.tooltip.parseOption = function(t) {
		var $t = $(t),
			_title = $t.attr("title");

		$t.attr("title", "");
		return {
			content: _title
		};
	};

	$.fn.tooltip.methods = {
		options: function(jq, opt) {
			return $.data(jq[0], 'tooltip').options;
		},

		panel: function(jq, opt) {
			return $.data(jq[0], 'tooltip').panel;
		},

		tip: function(jq, opt) {
			return $.data(jq[0], 'tooltip').panel.children(".s-tooltip-content");
		},

		arrow: function(jq) {
			return $.data(jq[0], 'tooltip').panel.children(".s-tooltip-arrow-out,.s-tooltip-arrow");
		},

		reposition: function(jq) {
			return jq.each(function() {
				reposition(this);
			});
		},

		show: function(jq, e) {
			return jq.each(function() {
				show(this, e);
			});
		},
		hide: function(jq, e) {
			return jq.each(function(val) {
				hide(this, e);
			});
		}
	};

	$.fn.tooltip.defaults = {
		position: "bottom",
		content: null,
		trackMouse: false,
		deltaX: 0,
		deltaY: 0,
		showEvent: "mouseenter",
		hideEvent: "mouseleave",
		showDelay: 200,
		hideDelay: 100,
		onShow: function(e) {},
		onHide: function(e) {},
		onUpdate: function(_2d) {},
		onPosition: function(left, top) {},
		onDestroy: function() {}
	};

})(jQuery);