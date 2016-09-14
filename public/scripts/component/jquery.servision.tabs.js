;
(function($) {

	function getTableWidth(container, idx) {
		var $cc = $(container),
			ul = $cc.children('.s-tabs-header').find(".s-tabs"),
			outerWidth = ul.outerWidth() - ul.width();
		ul.children(idx > -1 ? ":lt('" + (idx + 1) + "')" : "").each(function() {
			outerWidth += $(this).outerWidth(true);
		});

		return outerWidth;
	}

	function wrapTabs(container) {
		var tabs = $.data(container, 'tabs').tabs,
			options = $.data(container, 'tabs').options,
			cc = $(container).addClass("s-tabs-container"),
			panels = $("<div class='s-tabs-panels'></div>").insertBefore(cc),
			header = [];

		cc.children('div').each(function() {
			panels[0].appendChild(this);
		});
		cc[0].appendChild(panels[0]);

		header.push('<div class="s-tabs-header">');
		header.push('<div class="s-scroller-left" data-action="s-scroller-left"></div>');
		header.push('<div class="s-scroller-right" data-action="s-scroller-right"></div>');
		header.push('<div class="s-tabs-wrap">');
		header.push('<ul class="s-tabs"></ul>');
		header.push('</div>');
		header.push('<div class="s-tabs-tools"></div>');
		header.push('</div>');

		$(header.join('')).prependTo(cc);

		panels.children('div').each(function() {
			var opts = $.extend({}, options, {
				disabled: ($(this).attr("disabled") ? true : false),
				selected: ($(this).attr("selected") ? true : false),
			});

			createTab(container, opts, $(this));
		});

		cc.children(".s-tabs-header").on({
			"mouseenter": function(e) {
				var cls = $(this).attr("data-action");
				$(this).addClass(cls + '-hover');
			},
			"mouseleave": function(e) {
				var cls = $(this).attr("data-action");
				$(this).removeClass(cls + '-hover');
			}
		}, "div.s-scroller-left,div.s-scroller-right");
	}

	function createTab(container, opts, pp) {
		opts = opts || {};
		var $cc = $(container),
			state = $.data(container, 'tabs'),
			options = state.options,
			tabs = state.tabs,
			panels = $cc.children(".s-tabs-panels"),
			header = $cc.children(".s-tabs-header"),
			ul = header.find(".s-tabs"),
			p = $("<div class='s-tabs-panel'></div>"),
			t = [],
			tab, panelsub, tabTitle;

		if (opts.index == undefined || opts.index > tabs.length) {
			opts.index = tabs.length;
		} else if (opts.index < 0) {
			opts.index = 0;
		}

		//TODO
		t.push('<li class="s-tabs-first">');
		t.push('<a href="javascript:;" class="s-tabs-inner">');
		t.push('<span class="s-tabs-title"></span>');
		t.push('<span></span>');
		t.push('</a>');

		if (opts.closable && !opts.disabled) {
			t.push('<a href="javascript:;" class="s-tabs-closed"></a>');
		}
		t.push('</li>');

		tab = $(t.join(''));

		if (!pp) pp = opts.content ? $(opts.content) : $("<div></div>");

		tabTitle = opts.title || pp.attr("title");
		tab.find(".s-tabs-title").html(tabTitle);

		pp.attr("title", '').appendTo(p);

		$.data(p[0], 'options', $.extend(opts, {
			_title: tabTitle
		}));

		if (opts.index >= tabs.length) {
			tab.appendTo(ul);
			tabs.push(p);
			p.appendTo(panels);
		} else {
			tab.insertBefore(ul.children("li:eq('" + opts.index + "'"));
			p.insertBefore(panels.children('div.s-tabs-panel:eq("' + opts.index + '")'));
			tabs.splice(opts.index, 0, p);
		}

		tab.children('a.s-tabs-inner').css({
			'width': options.tabWidth,
			'height': options.tabHeight || ul.outerHeight(),
			'line-height': (options.tabHeight || ul.outerHeight()) + 'px'
		});

		ul.children('li').removeClass("s-tabs-first s-tabs-last");
		ul.children('li:first').addClass("s-tabs-first");
		ul.children('li:last').addClass("s-tabs-last");

		if (opts.disabled) {
			tab.addClass("s-tabs-disabled");
		} else {
			tab.removeClass("s-tabs-disabled");
		}


		toggleIcon(container);
	}

	function toggleIcon(container) {
		var $cc = $(container),
			$header = $cc.children(".s-tabs-header"),
			$wrap = $header.children('.s-tabs-wrap'),
			$ul = $wrap.children(".s-tabs"),
			$lIcon = $header.children('.s-scroller-left'),
			$rIcon = $header.children('.s-scroller-right'),
			headerW = $header.width(),
			lw = $lIcon.width(),
			rw = $rIcon.width(),
			sumWidth = getTableWidth(container);


		if (sumWidth > $ul.parent().width()) {
			var w = headerW - lw - rw;

			$lIcon.add($rIcon).fadeIn();
			$ul.css("paddingLeft", lw);
			$wrap.css({
				"width": w,
				"margin-left": lw,
				"margin-right": rw
			});
		} else {
			$lIcon.add($rIcon).fadeOut();
			$ul.css("paddingLeft", '');
			$wrap.stop(false, true).animate({
				"width": headerW,
				"margin-left": 0,
				"margin-right": 0
			});
		}
	}

	function setSize(container) {
		var $cc = $(container),
			state = $.data(container, 'tabs'),
			opts = state.options,
			header = $cc.children(".s-tabs-header"),
			ul = header.find('.s-tabs'),
			tbW = parseFloat(ul.css("borderBottomWidth")) + parseFloat(ul.css("borderTopWidth"));


		$cc.width(opts.width == 'auto' ? 'auto' : opts.width);
		$cc.children(".s-tabs-panels").height(opts.height == 'auto' ? 'auto' : opts.height - header.outerHeight(true));
		ul.height(header.height() - tbW);
	}

	function doFirstSelect(container) {
		var state = $.data(container, 'tabs'),
			options = $(container).tabs('options'),
			tabs = state.tabs;
		for (var i = 0; i < tabs.length; i++) {
			var p = $.data(tabs[i][0], 'options');
			if (p) {
				if (p.selected && !p.disabled)
					return selectTab(container, i);
			}
		}

		selectTab(container, options.selected);
	}

	function getTab(container, which, removeit) {
		var tabs = $.data(container, 'tabs').tabs,
			tab = null;
		if (typeof which == "number") {
			if (which >= 0 && which < tabs.length) {
				tab = tabs[which];
				if (removeit) {
					//removeit somethings
					tabs.splice(which, 1);
				}
			}
		} else {
			for (var i = 0; i < tabs.length; i++) {
				var p = $.data(tabs[i][0], 'options');
				if (p._title == which) {
					tab = tabs[i];
					break;
				}
			}
			if (removeit) {
				//removeit somethings
				tabs.splice(which, 1);
			}
		}
		return tab;
	}

	function getSeletedTabIndex(container) {
		var $cc = $(container),
			ul = $cc.children('.s-tabs-header').find('.s-tabs'),
			index = ul.children('.s-tabs-selected').index();

		return index >= 0 ? index : -1;
	}

	function selectTab(container, idx) {
		var state = $.data(container, 'tabs'),
			tabs = state.tabs,
			ul = $(container).children(".s-tabs-header").find(".s-tabs"),
			p, prev;

		if (idx < 0) {
			idx = ul.children('li:first').index();
		}
		p = getTab(container, idx);

		if (p && !p.is(":visible")) {

			prev = ul.children("li.s-tabs-selected");
			if (prev.length) {
				var prevIdx = prev.index();
				var prevTab = getTab(container, prevIdx);
				var prevTitle = $.data(prevTab[0], 'options')._title;

				prev.removeClass("s-tabs-selected");
				state.options.onUnSelect.call(container, prevTitle, prevIdx);
			}

			var title = $.data(p[0], 'options')._title;
			ul.children(":eq('" + idx + "')").addClass("s-tabs-selected");

			p.show().siblings().hide();

			state.options.onSelect.call(container, title, idx);

			scrollBy(container, false, idx);
		}
	}

	function addTab(container, opts) {
		var $cc = $(container),
			state = $.data(container, 'tabs'),
			ul = $cc.children('.s-tabs-header').find(".s-tabs"),
			options = state.options;


		if (opts.selected == undefined) opts.selected = true;

		createTab(container, opts);

		options.onAdd.call(container, opts.title, opts.index);

		if (opts.selected) {
			selectTab(container, opts.index);
		}
	}

	function close(container, which) {
		var $cc = $(container),
			state = $.data(container, 'tabs'),
			options = state.options,
			ul = $cc.children('.s-tabs-header').find(".s-tabs"),
			selectIdx = $cc.tabs('options').selected,
			tab = getTab(container, which, true),
			tabOpts = $.data(tab[0], 'options');

		//remove tab by index and tabpanel
		tab.remove();
		ul.children('li:eq("' + which + '")').remove();

		if (selectIdx == which) {
			selectTab(container, --which);
		} else {
			scrollBy(container, false, --which);
		}

		options.onClose.call(container, tabOpts._title, tabOpts.index);

		toggleIcon(container);
	}

	function scrollBy(container, dir, which) {
		var $cc = $(container),
			$wrap = $cc.children('.s-tabs-header').children('.s-tabs-wrap'),
			$ul = $wrap.children(".s-tabs"),
			state = $.data(container, 'tabs'),
			which = which > -1 ? which : $ul.children(':last').index(),
			outWidth = getTableWidth(container, which),
			wrapW = $wrap.width(),
			scrollLf = outWidth - wrapW,
			curScrollw = state.scrollFlag || $wrap.scrollLeft(),
			sw = state.options.moveDistance ? state.options.moveDistance : $ul.children(':first').outerWidth();

		if (dir === "left") {
			if (!curScrollw || curScrollw < 0) return false;
			curScrollw -= sw;
		} else if (dir === "right") {
			if (curScrollw > scrollLf) return false;
			curScrollw += sw;
		} else if (which > -1) {
			if (outWidth > wrapW) {
				var $li = $ul.children('li:eq("' + which + '")'),
					left = $li.position().left;
				if (left < 0) {
					curScrollw += left;
				} else if (left + $li.outerWidth(true) > wrapW) {
					curScrollw = scrollLf;
				}
			} else {
				curScrollw = 0;
			}
		}

		$wrap.stop(false, true).animate({
			"scrollLeft": curScrollw
		});
		state.scrollFlag = curScrollw;
	}

	function bindEvents(container) {
		var $cc = $(container),
			state = $.data(container, 'tabs'),
			$header = $cc.children('.s-tabs-header');

		$header.off(".tabs").on({
			"click.tabs": function(e) {
				var $target = $(e.target);
				if ($target.hasClass('s-scroller-left')) {
					scrollBy(container, 'left');
				} else if ($target.hasClass('s-scroller-right')) {
					scrollBy(container, 'right');
				} else {
					var $li = $target.closest("li"),
						$close = $target.closest(".s-tabs-closed");
					if ($li.hasClass("s-tabs-disabled")) return false;

					if ($close.length) {
						return $cc.tabs("close", $li.index());
					} else if ($li.length) {

						var idx = $target.closest("li").index();
						selectTab(container, idx);
					}
				}
			},
			"contextmenu.tabs": function(e) {

				var li = $(e.target).closest('li');
				if (li.hasClass('s-tabs-disabled')) {
					return;
				}
				if (li.length) {
					state.options.onContextMenu.call(container, e, li.find('span.s-tabs-title').html(), li.index());
				}
			}
		});

	}

	$.fn.tabs = function(options, params) {
		if (typeof options === "string") {
			var method = $.fn.tabs.method[options];
			if (method) {
				return method(this, params);
			}
		}
		options = options || {};
		return this.each(function() {
			var state = $.data(this, 'tabs');
			if (state) {
				$.extend(state.options, options);
			} else {
				$.data(this, 'tabs', {
					options: $.extend({}, $.fn.tabs.defaults, options),
					tabs: []
				});
				wrapTabs(this);
			}

			bindEvents(this);

			setSize(this);

			doFirstSelect(this);
		});
	};

	$.fn.tabs.method = {
		options: function(jq) {
			var opts = $.data(jq[0], 'tabs').options,
				idx = getSeletedTabIndex(jq[0]);

			opts.selected = idx;
			return opts;
		},

		tabs: function(jq) {
			return $.data(jq[0], 'tabs').tabs;
		},

		selectTab: function(jq, idx) {
			return selectTab(jq[0], idx);
		},

		getTab: function(jq, which) {
			return getTab(jq[0], which);
		},

		getSeletedTabIndex: function(jq) {
			return getSeletedTabIndex(jq[0]);
		},

		addTab: function(jq, opts) {
			return jq.each(function() {
				addTab(this, opts);
			});
		},

		close: function(jq, which) {
			return jq.each(function() {
				close(this, which);
			});
		}
	};

	$.fn.tabs.defaults = {
		content: null,
		width: 'auto',
		height: 'auto',
		tabWidth: 'auto',
		selected: false,
		tabHeight: 27,
		closable: false,
		moveDistance: 200,
		onAdd: function(title, index) {},
		onClose: function(title, index) {},
		onSelect: function(title, index) {},
		onUnSelect: function(title, index) {},
		onContextMenu: function(e, title, index) {}

	};

})(jQuery);