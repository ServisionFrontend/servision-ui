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

			// 在树节点移动改变背景色
			$(target).on('mouseover', '.tree-node', function(e) {
				$(this).addClass('tree-node-hover');
			});

			$(target).on('mouseout', '.tree-node', function(e) {
				$(this).removeClass('tree-node-hover');
			});

			// 选择节点行
			$(target).on('click', '.tree-icon, .tree-text', function(e) {
				self.selectRow(this, target);
			});

			// 节点行事件监听
			$(target).on('click', '.tree-node', function(e) {
				self.clickRow(e, this, target);
			});

			// 展开收起图标事件监听
			$(target).on('click', '.tree-hit', function(e) {
				self.toggleNode(e, this, target);
			});

			// 节点文本事件监听
			$(target).on('click', '.tree-text', function(e) {
				self.clickNode(e, this, target);
			});
		},

		toggleNode: function(e, that, target) {
			var self = this,
				opts = $.data(target, 'tree').options,
				node = self.findNode(target, that);

			if ($(that).hasClass(opts.collapseCls)) {
				$(that).removeClass(opts.collapseCls);
				$(that).addClass(opts.expandCls);
				$(that).parent().next().slideDown();
				if (opts.folderOpenCls !== opts.folderCls) {
					$(that).parent().find('.tree-icon').addClass(opts.folderOpenCls);
				}
				if (typeof opts.onExpanded === 'function') {
					opts.onExpanded.apply(that, [e, node]);
				}
			} else {
				$(that).addClass(opts.collapseCls);
				$(that).removeClass(opts.expandCls);
				$(that).parent().next().slideUp();
				if (opts.folderOpenCls !== opts.folderCls) {
					$(that).parent().find('.tree-icon').removeClass(opts.folderOpenCls);
				}
				if (typeof opts.onCollapsed === 'function') {
					opts.onCollapsed.apply(that, [e, node]);
				}
			}
		},

		selectRow: function(that, target) {
			var self = this;

			$(target).find('.tree-node').removeClass('tree-node-selected');
			$(that).parent().addClass('tree-node-selected');
		},

		clickNode: function(e, that, target) {
			var self = this,
				node,
				opts = $.data(target, 'tree').options;

			if (typeof opts.onClickNode === 'function') {
				node = self.findNode(target, that);

				if (opts.onClickNode.apply(that, [e, node]) === false) {
					e.preventDefault();
				}
			}
		},

		clickRow: function(e, that, target) {
			var self = this,
				node,
				opts = $.data(target, 'tree').options;

			if (typeof opts.onClickRow === 'function') {
				node = self.findNode(target, that);

				if (opts.onClickRow.apply(that, [e, node]) === false) {
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

		findNode: function(target, that) {
			var self = this,
				id = $(that).parent().attr('data-id'),
				opts = $.data(target, 'tree').options,
				node = self.getNode(opts.data, id);

			return node;
		},

		getNode: function(data, id) {
			if (data.length === 0) return;

			var self = this,
				node,
				nodes = [];

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

		getNodes: function(data, ids) {
			if (data.length === 0) return;

			var self = this,
				node,
				nodes = [];

			for (var i = 0; i < data.length; i++) {
				node = {};
				if (ids.indexOf(data[i].id) > -1) {
					for (key in data[i]) {
						if (key !== 'children') node[key] = data[i][key];
					}
					nodes.push(node);
				}

				var result = self.getNode(data[i].children || [], ids);

				if (result.length) {
					nodes = nodes.concat(result);
				}
			}

			return nodes;
		},

		expandAll: function(target) {
			var self = this,
				opts = $.data(target, 'tree').options;

			$(target).find('.tree').find('ul').slideDown();
			$(target).find('.tree-hit').addClass(opts.expandCls);
			$(target).find('.tree-hit').removeClass(opts.collapseCls);
			$(target).find('.' + opts.folderCls).addClass(opts.folderOpenCls);

			if (typeof opts.onExpandAll === 'function') {
				opts.onExpandAll();
			}
		},

		collapseAll: function(target) {
			var self = this,
				opts = $.data(target, 'tree').options;

			$(target).find('.tree').find('ul').slideUp();
			$(target).find('.tree-hit').removeClass(opts.expandCls);
			$(target).find('.tree-hit').addClass(opts.collapseCls);
			$(target).find('.' + opts.folderCls).removeClass(opts.folderOpenCls);

			if (typeof opts.onCollapseAll === 'function') {
				opts.onCollapseAll();
			}
		},

		nodeMoveUp: function(target) {
			var self = this,
				prevNode = me.getPrevNode(target);

			if (prevNode) {
				self.selectRow(prevNode, target);
			}
		},

		nodeMoveDown: function(target) {
			var self = this,
				nextNode = me.getNextNode(target);

			if (nextNode) {
				self.selectRow(nextNode, target);
			}
		},

		getPrevNode: function(target) {
			var self = this;
		},

		getNextNode: function(target) {
			var self = this;
		},

		getSelectedNode: function(target) {
			var self = this,
				ids = self.getSelectedIds(target),
				opts = $.data(target, 'tree').options,
				nodes = me.getNodes(opts.data, ids);

			return nodes;
		},

		getSelectedIds: function(target) {
			var self = this,
				ids = [],
				$selectedNodes = $(target).find('.tree-node-selected');

			$selectedNodes.each(function(idx, item) {
				var id = $(item).attr('data-id');
				ids.push(id);
			});

			return ids;
		},

		render: function(data, target, opts) {
			var self = this,
				html = self.getTreeHtml(data, 0, opts);

			$(target).html(html);
		},

		getTreeHtml: function(data, level, opts) {
			if (data.length === 0) return '';

			level++;

			var self = this,
				html = level === 1 ? ['<ul class="tree">'] : ['<ul style="display:none;">'];

			for (var i = 0; i < data.length; i++) {
				var children = data[i].children || [];
				html.push('<li>');
				html.push(self.getNodeHtml(data[i], level, opts));
				html.push(self.getTreeHtml(children, level, opts));
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
				html.push('<span class="tree-hit ' + opts.collapseCls + '"></span>');
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
		},
		nodeMoveUp: function(jq) {

			tree.nodeMoveUp(jq[0]);
		},
		nodeMoveDown: function(jq) {

			tree.nodeMoveDown(jq[0]);
		},
		getSelectedNode: function(jq) {

			return tree.getSelectedNode(jq[0]);
		}
	};

	// 内部默认配置
	$.fn.tree.defaults = {
		url: '',
		data: [],
		expandCls: 'tree-expanded',
		collapseCls: 'tree-collapsed',
		leafCls: 'tree-file',
		folderCls: 'tree-folder',
		folderOpenCls: 'tree-folder-open',
		hasNodeIcon: true,
		queryParams: {},
		onClickNode: function(e, node) {},
		onClickRow: function(e, ndoe) {},
		onExpanded: function(e, node) {},
		onCollapsed: function(e, node) {},
		onExpandedAll: function() {},
		onCollapseAll: function() {},
	};
})(jQuery);