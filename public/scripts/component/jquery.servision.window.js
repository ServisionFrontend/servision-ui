(function($, global) {
	function setup() {
		var openedLayers = {};
		var currentLayerId = '';
		var baseZ = 1000;
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
				self.draggable = false;
				self.move = {x: 0,y: 0}
			},

			bindData: function() {
				var self = this,
					name = self.opts.name = self.opts.name || 'default';

				if(openedLayers[name] && name!=='default') {
					return console.log('该层已创建');
				}
				//self.opts.baseZ = ++baseZ;
				if(isEmptyObject(openedLayers)) { //判断是否为顶层类。以此作为z-index的基准
					baseZ = self.opts.baseZ;
					self.opts.top = true;
				} else {
					baseZ++;
					self.opts.top = false;
				}
				if(!self.opts.parent) {  //确定父亲
					self.opts.parent = currentLayerId;
				}
				
				if(name === 'default') { self.removeAll();} //若没有给name。则默认为default。并且关闭之前所有打开的弹层
	
				currentLayerId = name;

				self.diffLayerType();
				self.open();
			},

			diffLayerType: function() {  //弹出层类型为dialog时做出额外的初始化
				var self = this;

				if(!self.opts.dialog) { return; }
				self.dialogTempl = $('<div class="dialog"><div class="dialog-title"><a href="javascript:;" class="close-btn" data-action="cancel"></a><span class="text">'+ self.opts.title +'</span></div><div class="dialog-content"><div class="content-text"><span class="icon"></span><span class="text">'+ self.opts.content +'</span></div></div><div class="dialog-btn-wrapper"><a href="javascript:;" class="btn" data-action="confirm">确定</a><a href="javascript:;" class="btn" data-action="cancel">取消</a></div></div>');
				self.opts.$dialog = self.dialogTempl.eq(0);
				self.opts.$confirmBtn = self.opts.$dialog.find(self.opts.confirmBtn);
				self.opts.$cancelBtn = self.opts.$dialog.find(self.opts.cancelBtn);
				if(!self.opts.confirm) {self.opts.$confirmBtn.remove();}
				if(!self.opts.cancel) {self.opts.$cancelBtn.remove();}
				if(self.opts.type !== 'info') {self.opts.$dialog.addClass(self.opts.type);}
				self.opts.message = self.dialogTempl;
			},

			create: function() {
				var self = this, layer1, layer2;

				if(self.opts.layerWrapper === 'body') {
					layer1 = $('<div class="overLayer" style="display: none; position: fixed; z-index:'+ baseZ +'; margin: 0; padding: 0; width: 100%;height: 100%; top:0; left: 0;opacity: 0.5;filter: alpha(opacity=50); background-color: #000"></div>');
					layer2 = $('<div class="contentLayer" style="display: none; position: fixed; z-index: '+ baseZ +'; margin: 0; padding: 0; width: 100%;height: 100%; top:0; left: 0;"></div>');
				} else {
					layer1 = $('<div class="overLayer" style="display: none; position: absolute; z-index:'+ baseZ +'; margin: 0; padding: 0; width: 100%;height: 100%; top:0; left: 0;opacity: 0;filter: alpha(opacity=0); background-color: #000"></div>');
					layer2 = $('<div class="contentLayer" style="display: none; position: absolute; z-index: '+ baseZ +'; margin: 0; padding: 0; width: 100%;height: 100%; top:0; left: 0;"></div>');
				}

				self.opts.layers = [layer1, layer2];
				
				if(!self.opts.top) {self.opts.layers.shift();layer1=null;}

				$.each(self.opts.layers, function() {
					this[0].id = self.opts.name;
					$(self.opts.layerWrapper).append(this);
				});
				if(self.opts.message) {
					var wrapDiv = $('<div class="contentWrapper" style="position:absolute"></div>');
					$(layer2).empty().append(wrapDiv);
					wrapDiv.html(self.opts.message);
					self.opts.msgBox = wrapDiv;
				}
				if(layer1 && !isEmptyObject(self.opts.overlayCss)) {
					layer1.css(self.opts.overlayCss);
				}
				if(!isEmptyObject(self.opts.css)) {
					self.opts.msgBox.css(self.opts.css);
				}
				if(self.opts.needCloseBtn) {
					var closeBtnHtml = $('<a class="icon-remove" href="javascript:;" style=" right: 20px; top: 20px;" data-action="close"></a>');
					$(layer2).append(closeBtnHtml);
				}
				if(self.opts.needLeftBtn) {
					var leftBtnHtml = $('<a class="icon-left" href="javascript:;" style="left: 20px; top: 50%;" data-action="left"></span></a>');
					$(layer2).append(leftBtnHtml);
				}
				if(self.opts.needRightBtn) {
					var rightBtnHtml = $('<a class="icon-right" href="javascript:;" style="right: 20px; top: 50%;" data-action="right"></a>');
					$(layer2).append(rightBtnHtml);
				}

				openedLayers[self.opts.name] = {opts: self.opts};  //记录所有的配置
				self.initEvents();
				if(!self.opts.draggable || self.opts.layerWrapper != 'body') { return;}	
				self.initDraggle(self.opts);
			},

			initEvents: function() {
				var self = this,
					opts = self.opts;
					spaceName = '.' + opts.name;

				$(document).on('click' + spaceName, '#' + opts.name + ' ' + opts.closeBtn, function() {
					self.close(opts);
				});
				$(document).on('click' + spaceName, '#' + opts.name + ' ' + opts.confirmBtn, function() {
					self.onConfirm(opts);
				});
				$(document).on('click' + spaceName, '#' + opts.name + ' ' + opts.cancelBtn, function() {
					self.onCancel(opts);
				});
				$(document).on('click' + spaceName, '#' + opts.name + ' ' + opts.leftBtn, function() {
					if(typeof opts.leftBtnEvent === 'function') {
						opts.leftBtnEvent.apply(self, [opts]);
					}
					return;
				});
				$(document).on('click' + spaceName, '#' + opts.name + ' ' + opts.rightBtn, function() {
					if(typeof opts.rightBtnEvent === 'function') {
						opts.rightBtnEvent.apply(self, [opts]);
					}
					return;
				});
			},

			initDraggle: function(opts) {
				var self = this,
					spaceName = '.' + opts.name,
					$draggableDom = $('#' + opts.name + ' ' + opts.dragController),
					draggable = false;
					$blockDom = $('<div style="position:absolute;width:100%;height:100%;top:0;left:0;background: #eee;z-index:19000;display:none"></div>');

				if($draggableDom.length <= 0) {return;}
				$draggableDom.css({cursor: 'move'});
				//self.opts.msgBox.append($blockDom)
				$(document).on('mousedown' + spaceName, '#' + opts.name + ' ' + opts.dragController, function(e) {
					draggable = true;
					self.move.x = e.clientX;
					self.move.y = e.clientY;
					return false;
				});
				$(document).on('mousemove' + spaceName, function(e) {
					if(!draggable) {return;}
					self.moveDom($('#' + opts.name + ' ' + opts.dragController), e);
					return false;
				});
				$(document).on('mouseup' + spaceName, function() {
					draggable = false;
					return false;
				});

			},

			moveDom: function($dom, e) {
				console.log($dom);
				var self = this,
					$domWrapper = $dom.closest('.contentWrapper'),
					domPos = $domWrapper.offset(),calPos = {},
					maxLeft = $(global).outerWidth() - $domWrapper.outerWidth(),
					maxTop = $(global).outerHeight() - $domWrapper.outerHeight();

				calPos = {left: domPos.left + e.clientX - self.move.x,
							top: domPos.top + e.clientY - self.move.y};
				calPos.left  = calPos.left < 0 ? 0 : calPos.left;
				calPos.left  = calPos.left > maxLeft ? maxLeft : calPos.left;
				calPos.top  = calPos.top < 0 ? 0 : calPos.top;
				calPos.top  = calPos.top > maxTop ? maxTop : calPos.top;

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

				if(typeof self.opts.onBeforeOpen === 'function') {
					self.opts.onBeforeOpen.apply(self, [self.opts]);
				}

				if(self.opts.delay) {
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
					if(index === layers.length-1) {
						self.setLayerPosition(self.opts);
					}
				});
				if(typeof self.opts.onAfterOpen === 'function') {
					self.opts.onAfterOpen.apply(self, [self.opts]);
				}
			},

			reset: function(nameArr) { //注销关闭的层已注册的事件
				var self = this;

				$.each(nameArr, function(index, name) {
					currentLayerId = (openedLayers[name] && openedLayers[name].opts.parent) || '';

					delete openedLayers[name];
					$(global).off('resize' + '.' +name);
					$(document).off('click' + '.' + name);
					$(document).off('mousedown' + '.' + name);
					$(document).off('mousemove' + '.' + name);
					$(document).off('mouseup' + '.' + name);
				});
			},
			close: function(options) {
				var self = this,
					name = options.name || 'default',
					layers = [openedLayers[name]],nameArr = [name];

					if(!openedLayers[name]) {return;}
					self.getParentLayer(name);
					layers = self.layers.concat(layers).reverse(); //获得正确的关闭顺序
					nameArr = nameArr.concat(self.nameArr).reverse();

				if(typeof options.onBeforeClose === 'function') {
					options.onBeforeClose.apply(self, [options]);
				}

				$.each(layers, function(index,item) {
					var exsitLayers = item.opts.layers;
					$.each(exsitLayers, function(index, item) {
						item.fadeOut(options.speed, function() {
							item.remove();
							if(index === exsitLayers.length-1) {
								self.timer = null;
							}
						});
					})
				});

				self.reset(nameArr);

				if(typeof options.onAfterClose === 'function') {
					options.onAfterClose.apply(self, [options]);
				}

			},

			getParentLayer: function(name) {
				var self = this;

				for(var i in openedLayers) {
					var item = openedLayers[i];

					if(item.opts.parent == name) {  
						self.layers.push(item);
						self.nameArr.push(item.opts.name);
						self.getParentLayer(item.opts.name);
						return false;
					}
				}
			},

			setLayerPosition: function(options) {
				var self = this;

				for(var i in openedLayers) {
					var single = options &&　options.name;
					var layer = single ? openedLayers[options.name] :openedLayers[i],
						msgBox = layer.opts.msgBox,
						wrapDom = layer.opts.layerWrapper === 'body' ? global : layer.opts.layerWrapper;

					msgBox.css({
						left: $(wrapDom).outerWidth()/2 - msgBox.outerWidth()/2,
						top: $(wrapDom).outerHeight()/2 - msgBox.outerHeight()/2
					});
					if(single) {break;}
				}
			},

			onConfirm: function(options) {
				var self = this;

				if(typeof options.onBeforeConfirm === 'function') {
					options.onBeforeConfirm.apply(self, [options]);
				}

				self.close(options);

				if(typeof options.onAfterConfirm === 'function') {
					options.onAfterConfirm.apply(self, [options]);
				}
			},

			onCancel: function(options) {
				var self = this;

				if(typeof options.onBeforeCancel === 'function') {
					options.onBeforeCancel.apply(self, [options]);
				}

				self.close(options);

				if(typeof options.onAfterCancel === 'function') {
					options.onAfterCancel.apply(self, [options]);
				}
			},

			removeAll: function(layerObj) {
				var layerObj = layerObj || openedLayers;

				for(var i in layerObj) {
					var exsitLayer = layerObj[i];
					$.each(exsitLayer.layers, function(index, item) {
						item.remove();
					});
				}
			},

			removeByName: function(layerName) {
				var exsitLayer = layerObj[layerName];
				$.each(exsitLayer.layers, function(index, item) {
					item.remove();
				});
			}
			
		};

		(function initGlobalEvents() {
			$(document).on('keyup', function(e) {
				if(e.which == 27 && currentLayerId) {
					if(openedLayers[currentLayerId].opts.layerWrapper != 'body') {
						return window.close({name: openedLayers[currentLayerId].opts.parent || currentLayerId});
					}
					window.close({name: currentLayerId});
				}
			});
			$(global).on('resize', debounce(function(e) {
				    window.setLayerPosition();
				}, 200)
			);
		})();

		$.fn.window = function(options, param) {
			if(typeof options == 'string') {
				return $.fn.window.methods[options].apply(this, [param]);
			}
			if(Object.prototype.toString.apply(options,[]) === '[object Object]') {
				options.message = $(this).eq(0).html();
			}
			$.window(options, param);
			
		};
		$.window = function(options, param) {

			var opts = $.extend(true, {}, $.fn.window.defaults, options || {});
			window.init(opts);
		};
		$.unWindow = function(options) {
			window.close(options);
		};
		$.fn.window.methods = {

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
						if(!immediate) {
							fun.apply(context, args);
						}
					};
				var callNow = !timer && immediate;
				clearTimeout(timer);
				if(callNow) {
					return fun.apply(context, args);
				}
				timer = setTimeout(later, wait);
			}
		};

		function isEmptyObject(obj) {
			var count = 0;
			for(var i in obj) {
				count++;
			}
			return !count ? true : false;
		};
	};

	if(typeof define === 'function') {
		define([], steup);
	} else {
		setup();
	}
	
})(jQuery, window);