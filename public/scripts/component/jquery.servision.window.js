(function($, global) {
	function setup() {
		var openedLayers = {};
		var currentLayerId = '';
		var baseZ = 1000;
		var canOpen = true;
		var overLayer = null;
		var window = {
			init: function(options) {
				var self = this;

				self.opts = options;
				self.initAttrs();
				self.bindData();
			},

			initAttrs: function() {
				var self = this;
				self.layers = []; //记录要关闭的弹层关联的层
				self.nameArr = [];
				self.move = {
					x: 0,
					y: 0
				}
			},

			bindData: function() {
				var self = this,
					name = self.opts.name = self.opts.name || 'default';

				if (openedLayers[name] && name !== 'default') {
					return console.log('该层已创建');
				}

				if (name === 'default') {
					self.removeAll();
				} //若没有给name。则默认为default。并且关闭之前所有打开的弹层

				if (isEmptyObject(openedLayers)) { //判断是否为顶层类。以此作为z-index的基准
					baseZ = self.opts.baseZ;
					self.opts.top = true;
				} else {
					baseZ++;
					self.opts.top = false;
				}
				if (!self.opts.parent) { //确定父亲
					self.opts.parent = currentLayerId;
				}
				self.opts.baseZ = baseZ;

				currentLayerId = name;

				self.diffLayerType();
				if (!canOpen) {
					setTimeout(function() {
						self.open();
					}, self.opts.speed);
				} else {
					self.open();
				}
			},

			diffLayerType: function() { //弹出层类型为dialog时做出额外的初始化
				var self = this;

				if (!self.opts.dialog) {
					return;
				}
				self.dialogTempl = $('<div class="dialog"><div class="dialog-title" data-action="drag"><a href="javascript:;" class="close-btn" data-action="cancel"></a><span class="text">' + self.opts.title + '</span></div><div class="dialog-content"><div class="content-text"><span class="icon"></span><span class="text">' + self.opts.content + '</span></div></div><div class="dialog-btn-wrapper"><a href="javascript:;" class="btn" data-action="confirm">确定</a><a href="javascript:;" class="btn" data-action="cancel">取消</a></div></div>');
				self.opts.$dialog = self.dialogTempl.eq(0);
				self.opts.$confirmBtn = self.opts.$dialog.find(self.opts.confirmBtn);
				self.opts.$cancelBtn = self.opts.$dialog.find(self.opts.cancelBtn);
				if (!self.opts.confirm) {
					self.opts.$confirmBtn.remove();
				}
				if (!self.opts.cancel) {
					self.opts.$cancelBtn.remove();
				}
				if (self.opts.type !== 'info') {
					self.opts.$dialog.addClass(self.opts.type);
				}
				self.opts.message = self.dialogTempl;
			},

			create: function() {
				var self = this,
					layer1, layer2,
					wrapDiv = $('<div class="contentWrapper" style="position:absolute"></div>');;

				if (self.opts.layerWrapper === 'body') {
					layer1 = $('<div class="overLayer" style="display: none; position: fixed; z-index:' + baseZ + '; margin: 0; padding: 0; width: 100%;height: 100%; top:0; left: 0;opacity: 0.5;filter: alpha(opacity=50); background-color: #000"></div>');
					layer2 = $('<div class="contentLayer" style="display: none; position: fixed; z-index: ' + baseZ + '; margin: 0; padding: 0; width: 100%;height: 100%; top:0; left: 0;"></div>');
				} else {
					layer1 = $('<div class="overLayer" style="display: none; position: absolute; z-index:' + baseZ + '; margin: 0; padding: 0; width: 100%;height: 100%; top:0; left: 0;opacity: 0.5;filter: alpha(opacity=50); background-color: #000"></div>');
					layer2 = $('<div class="contentLayer" style="display: none; position: absolute; z-index: ' + baseZ + '; margin: 0; padding: 0; width: 100%;height: 100%; top:0; left: 0;"></div>');
					$(self.opts.layerWrapper).css('position', 'relative');
				}

				self.opts.layers = [layer1, layer2];

				if (self.opts.top) {
					overLayer = layer1;
				}
				if (!self.opts.top && self.opts.layerWrapper === 'body') {
					self.opts.layers.shift();
					layer1 = null;
					overLayer.css({
						zIndex: baseZ
					});
				}

				$.each(self.opts.layers, function() {
					this[0].id = self.opts.name;
					$(self.opts.layerWrapper).append(this);
				});

				layer2.attr("data-id", self.opts.name).empty().append(wrapDiv);
				if (self.opts.message.jquery || self.opts.message.nodeType) {
					self.opts.msgParent = self.opts.message.parent();
					wrapDiv.append(self.opts.message.show());
				} else {
					wrapDiv.html(self.opts.message);
				}
				self.opts.msgBox = wrapDiv;

				if (layer1 && !isEmptyObject(self.opts.overlayCss)) {
					layer1.css(self.opts.overlayCss);
				}
				if (layer2 && !isEmptyObject(self.opts.contentLayerCss)) {
					layer2.css(self.opts.contentLayerCss);
				}
				if (!isEmptyObject(self.opts.css)) {
					self.opts.msgBox.css(self.opts.css);
				}
				if (self.opts.needCloseBtn) {
					var closeBtnHtml = $('<a class="icon-remove" href="javascript:;" style=" right: 20px; top: 20px;" data-action="close"></a>');
					$(layer2).append(closeBtnHtml);
				}
				if (self.opts.needLeftBtn) {
					var leftBtnHtml = $('<a class="icon-left" href="javascript:;" style="left: 20px; top: 50%;" data-action="left"></span></a>');
					$(layer2).append(leftBtnHtml);
				}
				if (self.opts.needRightBtn) {
					var rightBtnHtml = $('<a class="icon-right" href="javascript:;" style="right: 20px; top: 50%;" data-action="right"></a>');
					$(layer2).append(rightBtnHtml);
				}

				openedLayers[self.opts.name] = {
					opts: self.opts
				}; //记录所有的配置
				self.initEvents();
				//	if(!self.opts.draggable || self.opts.layerWrapper != 'body') { return;}	
				self.initDraggle(self.opts);
			},

			initEvents: function() {
				var self = this,
					opts = self.opts;
				spaceName = '.' + opts.name;

				$('#' + opts.name + ' ' + opts.closeBtn).on('click' + spaceName, function() {
					self.close(opts);
				});
				$(document).on('click' + spaceName, '#' + opts.name + ' ' + opts.confirmBtn, function() {
					self.onConfirm(opts);
				});
				$(document).on('click' + spaceName, '#' + opts.name + ' ' + opts.cancelBtn, function() {
					self.onCancel(opts);
				});
				$(document).on('click' + spaceName, '#' + opts.name + ' ' + opts.leftBtn, function() {
					if (typeof opts.leftBtnEvent === 'function') {
						opts.leftBtnEvent.apply(self, [opts]);
					}
					return;
				});
				$(document).on('click' + spaceName, '#' + opts.name + ' ' + opts.rightBtn, function() {
					if (typeof opts.rightBtnEvent === 'function') {
						opts.rightBtnEvent.apply(self, [opts]);
					}
					return;
				});
			},

			initDraggle: function(opts) {
				var self = this,
					spaceName = '.' + opts.name,
					$draggableDom = $('#' + opts.name + ' ' + opts.dragController),
					timer = 0,
					time = 0,
					pos = {
						x: 0,
						y: 0
					};
				opts.draggable = false;
				opts.$blockDom = $('<div style="position:absolute;width:100%;height:100%;top:0;left:0;background:#eee;opacity:0.5;cursor:move;z-index:19000;display:none"></div>');
				
				if(!isEmptyObject(self.opts.blockDomCss)) {
					opts.$blockDom.css(self.opts.blockDomCss)
				}
				
				if ($draggableDom.length <= 0) {
					return;
				}
				$draggableDom.css({
					cursor: 'move'
				});
				opts.$blockDom.insertAfter(opts.msgBox);
				$(document).on('mousedown' + spaceName, '#' + opts.name + ' ' + opts.dragController, function(e) {
					pos.x = e.clientX;
					pos.y = e.clientY;
					time = (new Date()).getTime();
					timer = setTimeout(function() {
						self.moveStart(opts, e);
					}, 1000);
					//return false;
				});
				$(document).on('mousemove' + spaceName, function(e) {
					if ((new Date()).getTime() - time < 1000 && (Math.abs(e.clientX - pos.x) > 20 || Math.abs(e.clientY - pos.y) > 20)) {
						time = 0;
						clearTimeout(timer);
						if (timer) {
							self.moveStart(opts, e);
						}
					}
					self.moveDom(opts, e);
//					return false;
				});
				$(document).on('mouseup' + spaceName, function() {
					clearTimeout(timer);
					timer = null;
					self.moveEnd(opts);
				});
			},

			moveStart: function(opts, e) {
				var self = this,
					$blockDom = opts.$blockDom;
				opts.draggable = true;
				self.move.x = e.clientX;
				self.move.y = e.clientY;

				$blockDom.css({
					width: opts.msgBox.outerWidth(),
					height: opts.msgBox.outerHeight(),
					top: opts.msgBox.position().top,
					left: opts.msgBox.position().left
				}).show();
				opts.msgBox.hide();
			},

			moveEnd: function(opts) {
				var $blockDom = opts.$blockDom;

				if (!opts.draggable) {
					return;
				}
				opts.msgBox.css({
					top: $blockDom.position().top,
					left: $blockDom.position().left
				}).show();
				$blockDom.hide();
				opts.draggable = false;
			},

			moveDom: function(opts, e) {
				var self = this,
					$domWrapper = opts.$blockDom,
					domPos = $domWrapper.position(),
					calPos = {},
					maxLeft = $(global).outerWidth() - $domWrapper.outerWidth(),
					maxTop = $(global).outerHeight() - $domWrapper.outerHeight();

				if (!opts.draggable) {
					return;
				}

				calPos = {
					left: domPos.left + e.clientX - self.move.x,
					top: domPos.top + e.clientY - self.move.y
				};

				if (opts.layerWrapper === 'body') {
					calPos.left = calPos.left < 0 ? 0 : calPos.left;
					calPos.top = calPos.top < 0 ? 0 : calPos.top;
				}

				calPos.left = calPos.left > maxLeft ? maxLeft : calPos.left;

				calPos.top = calPos.top > maxTop ? maxTop : calPos.top;

				$domWrapper.css({
					left: calPos.left + 'px',
					top: calPos.top + 'px'
				});
				self.move.x = e.clientX;
				self.move.y = e.clientY;
			},

			open: function() {
				var self = this;

				self.create();

				if (typeof self.opts.onBeforeOpen === 'function') {
					self.opts.onBeforeOpen.apply(self, [self.opts]);
				}

				if (self.opts.delay) {
					self.timer = setTimeout(function() {
						self.show();
					})
				} else {
					self.show();
				}
			},

			show: function() {
				var self = this,
					layers = self.opts.layers;

				$.each(layers, function(index) {
					$(this).fadeIn(self.opts.speed);
					if (index === layers.length - 1) {
						self.setLayerPosition(self.opts);
					}
				});
				if (typeof self.opts.onAfterOpen === 'function') {
					self.opts.onAfterOpen.apply(self, [self.opts]);
				}
			},

			reset: function(nameArr, options) { //注销关闭的层已注册的事件
				var self = this;

				$.each(nameArr, function(index, name) {
					currentLayerId = (openedLayers[name] && openedLayers[name].opts.parent) || '';

					delete openedLayers[name];
					if (currentLayerId) {
						overLayer.css({
							zIndex: openedLayers[self.getBodyparent(currentLayerId)].opts.baseZ
						});
					} else {
						overLayer = null;
					}
			
					$('#' + options.name + ' ' + options.closeBtn).off('click' + '.' + name);
					$(global).off('resize' + '.' + name);
					$(document).off('click' + '.' + name);
					$(document).off('mousedown' + '.' + name);
					$(document).off('mousemove' + '.' + name);
					$(document).off('mouseup' + '.' + name);
				});
			},
			close: function(options) {
				var self = this,
					name = options.name || 'default';

					var targeLayer = openedLayers[name];
					layers = [targeLayer],
					nameArr = [name],
					options = $.extend(true, {}, options, targeLayer.opts);

				if (!openedLayers[name]) {
					return;
				}
				/*if(!openedLayers[name].opts.layers[1].is(':focus')) {
				    return;
				}*/
				self.getParentLayer(name);
				layers = self.layers.concat(layers).reverse(); //获得正确的关闭顺序
				nameArr = nameArr.concat(self.nameArr).reverse();

				if (typeof options.onBeforeClose === 'function') {
					options.onBeforeClose.apply(self, [options]);
				}

				$.each(layers, function(index, item) {
					canOpen = false;
					var exsitLayers = item.opts.layers;
					
					$.each(exsitLayers, function(index, item) {
						item.fadeOut(options.speed, function() {
							if (index === exsitLayers.length - 1) {
							    	if (options.msgParent) {
								    options.msgParent.append(options.message.hide())
								} 
								canOpen = true;
								clearTimeout(self.timer);
							}
							item.remove();
						});
					})
				});

				self.reset(nameArr, options);

				if (typeof options.onAfterClose === 'function') {
					options.onAfterClose.apply(self, [options]);
				}
			},

			getParentLayer: function(name) {
				var self = this;

				for (var i in openedLayers) {
					var item = openedLayers[i];

					if (item.opts.parent == name) {
						self.layers.push(item);
						self.nameArr.push(item.opts.name);
						self.getParentLayer(item.opts.name);
						return false;
					}
				}
			},

			setLayerPosition: function(options) {
				var self = this;

				for (var i in openedLayers) {
					var single = options && options.name;
					var layer = single ? openedLayers[options.name] : openedLayers[i],
						msgBox = layer.opts.msgBox,
						wrapDom = layer.opts.layerWrapper === 'body' ? global : layer.opts.layerWrapper;

					msgBox.css({
						left: $(wrapDom).outerWidth() / 2 - msgBox.outerWidth() / 2,
						top: $(wrapDom).outerHeight() / 2 - msgBox.outerHeight() / 2
					});
					if (single) {
						break;
					}
				}
			},

			onConfirm: function(options) {
				var self = this;

				if (typeof options.onBeforeConfirm === 'function') {
					options.onBeforeConfirm.apply(self, [options]);
				}

				self.close(options);

				if (typeof options.onAfterConfirm === 'function') {
					options.onAfterConfirm.apply(self, [options]);
				}
			},

			onCancel: function(options) {
				var self = this;

				if (typeof options.onBeforeCancel === 'function') {
					options.onBeforeCancel.apply(self, [options]);
				}

				self.close(options);

				if (typeof options.onAfterCancel === 'function') {
					options.onAfterCancel.apply(self, [options]);
				}
			},

			removeAll: function(layerObj) {
				var self = this,
					layerObj = layerObj || openedLayers;

				for (var i in layerObj) {
					var exsitLayer = layerObj[i];
					self.close(exsitLayer.opts);
				}
			},

			getBodyparent: function(currentLayerId) {
				var self = this;
				if (currentLayerId && openedLayers[currentLayerId].opts.layerWrapper != 'body') {
					return self.getBodyparent(openedLayers[currentLayerId].opts.parent);
				} else {
					return currentLayerId;
				}
			}

		};

		(function initGlobalEvents() {
			$(document).on('keydown', function(e) {
				if (e.which == 27 && currentLayerId) {
					window.close({
						name: window.getBodyparent(currentLayerId)
					});
				}
			});
			$(global).on('resize', debounce(function(e) {
				window.setLayerPosition();
			}, 200));
		})();

		$.fn.window = function(options, param) {
			if (typeof options == 'string') {
				return $.fn.window.methods[options].apply(this, [param]);
			}
			if (Object.prototype.toString.apply(options, []) === '[object Object]') {
				if (options.name) {
					options.message = $(this).eq(0).html();
				} else {
					options.parent = $(this).eq(0).closest('.contentLayer').attr("data-id");
					options.layerWrapper = $(this).eq(0);
					options.name = 'layer_' + new Date().getTime() + Math.round(Math.random() * 1000);
				}
			}
			$.window(options, param);

		};
		$.window = function(options, param) {
			var opts = $.extend(true, {}, $.fn.window.defaults, options || {});
			
			window.init(opts);
		};
		$.unWindow = function(options) {
			window.close(options || {});
		};
		$.fn.window.methods = {
			unWindow: function(options) {
				return window.close(options || {});
			},
			setLayerPosition: function(options) {
				return window.setLayerPosition(options || {});
			}
		};
		$.fn.window.defaults = {
			name: '', //必填
			message: '',
			parent: '',
			title: '提示',
			baseZ: 1000,
			speed: 300,
			delay: 0,
			draggable: true,
			dragController: '[data-action="drag"]',
			overlayCss: {},
			contentLayerCss: {
				width: 'auto',
				height: 'auto'
			},
			blockDomCss: {},
			css: {},
			layerWrapper: 'body',
			needCloseBtn: false,
			needLeftBtn: false,
			needRightBtn: false,
			closeBtn: '[data-action="close"]',
			leftBtn: '[data-action="left"]',
			rightBtn: '[data-action="right"]',
			onBeforeOpen: null,
			onAfterOpen: null,
			onBeforeClose: null,
			onAfterClose: null,
			leftBtnEvent: null,
			rightBtnEvent: null,
			//dialog的配置,若是dialog,不需要配置meassage
			dialog: false,
			type: 'info',
			content: '提示',
			confirm: true,
			cancel: true,
			onBeforeCancel: null,
			onAfterCancel: null,
			onBeforeConfirm: null,
			onAfterConfirm: null,
			confirmBtn: '[data-action="confirm"]',
			cancelBtn: '[data-action="cancel"]'
		};

		function debounce(fun, wait, immediate) {
			var timer;
			return function() {
				var args = arguments,
					context = this,
					later = function() {
						timer = null;
						if (!immediate) {
							fun.apply(context, args);
						}
					};
				var callNow = !timer && immediate;
				clearTimeout(timer);
				if (callNow) {
					return fun.apply(context, args);
				}
				timer = setTimeout(later, wait);
			}
		};

		function isEmptyObject(obj) {
			var count = 0;
			for (var i in obj) {
				count++;
			}
			return !count ? true : false;
		};
	};

	if (typeof define === 'function') {
		define([], setup);
	} else {
		setup();
	}

})(jQuery, window);