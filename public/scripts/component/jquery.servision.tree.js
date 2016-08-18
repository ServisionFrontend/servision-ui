/**
 * jQuery  ServisionUI 1.0
 *
/**
 * tree - jQuery ServisionUI
 *
 */
(function($) {

	// 内部对象，私有方法，对内可见
	var tree = {
		init: function(target) {
			var self = this,
				url,
				opts = $.data(target, 'tree').options;

			self.initEvents(target);

			if (opts.data) {
				self.render(opts.data, target, opts);
			} else if (opts.url) {
				self.loadData(opts.url);
			}
		},

		initEvents: function(target) {
			var self = this;

			$(target).on('click', '.tree-hit', function() {
				self.toggleNode(this);
			});

			$(target).on('click', '.tree-icon, .tree-text', function(e) {
				self.clickNode(e, this, target);
			});
		},

		toggleNode: function(that) {
			var self = this;

			if ($(that).hasClass('tree-collapsed')) {
				$(that).removeClass('tree-collapsed');
				$(that).addClass('tree-expanded');
				$(that).parent().next().slideDown();
			} else {
				$(that).addClass('tree-collapsed');
				$(that).removeClass('tree-expanded');
				$(that).parent().next().slideUp();
			}
		},

		clickNode: function(e, that, target) {
			var self = this,
				id, node,
				opts = $.data(target, 'tree').options;

			if (typeof opts.onClickNode === 'function') {
				id = $(that).parent().attr('data-id');
				debugger;
				node = self.getNode(opts.data, id);

				if (opts.onClickNode(node) === false) {
					e.preventDefault();
				}
			}
		},

		loadData: function(url) {
			var self = this;

			$.ajax({
				url: url,
				type: 'GET',
				success: function(data) {
					self.render(data);
				}
			});
		},

		getNode: function(data, id) {
			var self = this;
			var node;
			var nodes = [];

			if (data.length === 0) return;

			for (var i = 0; i < data.length; i++) {
				node = {};
				if (data[i].id == id) {
					for (key in data[i]) {
						if (key !== 'children') node[key] = data[i][key];
					}
					nodes.push(node);
				}

				var result = self.getNode(data[i].children || [], id);

				if (result) {
					nodes.push(result);
				}
			}

			return nodes.length ? nodes[0] : null;
		},

		expandAll: function(target) {
			var self = this;

			$(target).find('.tree').find('ul').slideDown();
			$(target).find('.tree-hit').addClass('tree-expanded');
			$(target).find('.tree-hit').removeClass('tree-collapsed');
			$(target).find('.tree-folder').addClass('tree-folder-open');
		},

		collapseAll: function(target) {
			var self = this;

			$(target).find('.tree').find('ul').slideUp();
			$(target).find('.tree-hit').removeClass('tree-expanded');
			$(target).find('.tree-hit').addClass('tree-collapsed');
			$(target).find('.tree-folder').removeClass('tree-folder-open');
		},

		render: function(data, target, opts) {
			var self = this;

			var html = self.getHtml(data, 0, opts);

			$(target).html(html);
		},

		getHtml: function(data, level, opts) {
			var self = this,
				html;

			if (data.length == 0) {
				return ''
			};
			level++;
			html = level === 1 ? ['<ul class="tree">'] : ['<ul style="display:none;">'];

			for (var i = 0; i < data.length; i++) {
				var children = data[i].children || [];
				html.push('<li>');
				html.push(self.getNodeHtml(data[i], level, opts));
				html.push(self.getHtml(children, level, opts));
				html.push('</li>');
			}
			html.push('</ul>');

			return html.join('');
		},

		getNodeHtml: function(item, level, opts) {
			var self = this,
				html = ['<div class="tree-node" data-id=' + item.id + '>'],
				children = item.children || [];

			if (children.length == 0) {
				level = level + 1;
			}

			// 添加缩进
			for (var i = 0; i < level; i++) {
				html.push('<span class="tree-indent"></span>');
			}

			// 添加展开收起图标
			if (children.length > 0) {
				html.push('<span class="tree-hit tree-collapsed"></span>');
			}

			// 添加节点图标

			if (children.length > 0) {
				html.push('<span class="tree-icon ' + opts.folderCls + '"></span>');
			} else {
				html.push('<span class="tree-icon ' + opts.leafCls + '"></span>');
			}


			// 添加节点的文本
			if (item.url) {
				html.push('<a class="tree-text link" target="_blank;" href=' + item.url + '>' + item.text + '</a>');
			} else {
				html.push('<span class="tree-text">' + item.text + '</span>');
			}


			html.push('</div>');

			return html.join('');
		}
	};

	// jquery 插件扩展方法
	$.fn.tree = function(options, param) {
		if (typeof options == 'string') {
			return $.fn.tree.methods[options](this, param);
		}

		options = options || {};
		return this.each(function() {

			$.data(this, 'tree', {
				options: $.extend({}, $.fn.tree.defaults, options)
			});

			tree.init(this);
		});
	};

	// 公用方法对外面可见
	$.fn.tree.methods = {
		expandAll: function(jq) {

			tree.expandAll(jq[0]);
		},

		collapseAll: function(jq) {

			tree.collapseAll(jq[0]);
		}
	};

	// 内部默认配置
	$.fn.tree.defaults = {
		url: '',
		data: [],
		folderCls: 'tree-folder',
		leafCls: 'tree-file',
		hasNodeIcon: true,
		queryParams: {}
	};
})(jQuery);