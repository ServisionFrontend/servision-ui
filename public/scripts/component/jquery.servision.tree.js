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
				opts = $.data(target, 'tree').options,
				url = opts.url,
				data = opts.data;

			self.initEvents(target);

			if (data.length) {
				self.buildData(data, 0, [], opts.nodePathList);
				self.render(target, data);
			} else if (url) {
				self.loadData(target, url);
			}
		},

		initEvents: function(target) {
			var self = this;

			$(target).on('mouseover', '.tree-node', function(e) {

				$(this).addClass('tree-node-hover');
			});

			$(target).on('mouseout', '.tree-node', function(e) {

				$(this).removeClass('tree-node-hover');
			});

			$(target).on('dblclick', '.tree-node', function(e) {
				var that = $(this).find('.tree-hit').get(0);

				self.toggleNode(e, that, target);
			});

			$(target).on('click', '.tree-node', function(e) {
				var id = $(this).attr('data-id');

				if (!$(e.target).hasClass('tree-hit')) {
					self.selectionNode(target, id);
				}

				self.clickRow(e, this, target);
			});

			$(target).on('click', '.tree-checkbox', function(e) {

				self.toggleChecked(e, this, target);
			});

			$(target).on('click', '.tree-hit', function(e) {

				self.toggleNode(e, this, target);
			});

			$(target).on('click', '.tree-text', function(e) {

				self.clickNode(e, this, target);
			});
		},

		clearAllSelection: function(target) {
			var self = this;

			$(target).find('.tree-node').removeClass('tree-node-selected');
		},

		toggleNode: function(e, that, target) {
			var self = this,
				opts = $.data(target, 'tree').options,
				node = self.getNode(target, that);

			if ($(that).hasClass(opts.collapseCls)) {
				self.expandNode(target, that);
				if (typeof opts.onExpanded === 'function') {
					opts.onExpanded.apply(that, [e, node]);
				}
			} else {
				self.collapseNode(target, that);
				if (typeof opts.onCollapsed === 'function') {
					opts.onCollapsed.apply(that, [e, node]);
				}
			}
		},

		toggleChecked: function(e, that, target) {
			var self = this,
				checked,
				opts = $.data(target, 'tree').options,
				data = opts.data,
				id = $(that).parent().attr('data-id'),
				node = self.getNodeById(target, id),
				ids = utils.getNodeIds([node]);

			if ($(that).hasClass('tree-checkbox0')) {
				checked = true;
			} else {
				checked = false;
			}

			self.cascadeChecked(target, data, checked, ids);
			self.bubbleChecked(target, node, data);
		},

		bubbleChecked: function(target, node, data) {
			if (node.level == 1) return;

			var self = this,
				parentNode, id, isChecked,
				level = node.level,
				nodePath = $.extend([], node.nodePath);

			while (level > 1) {
				nodePath = nodePath.slice(0, --level);
				parentNode = self.getNodeByPath(nodePath, data);
				isChecked = self.isHasUnChecked(parentNode.children);

				self.setDataChecked(data, isChecked, parentNode.id);
				self.setDomChecked(target, isChecked, parentNode.id);
			}
		},

		isHasUnChecked: function(data) {
			if (data.length === 0) return;

			var self = this,
				result,
				checked = true;

			for (var i = 0; i < data.length; i++) {
				if (data[i].checked === false) {
					return false;
				}
				result = self.isHasUnChecked(data[i].children || []);

				if (result === false) checked = result;
			}

			return checked;
		},

		cascadeChecked: function(target, data, checked, ids) {
			var self = this;

			for (var i = 0; i < ids.length; i++) {
				self.setDataChecked(data, checked, ids[i]);
				self.setDomChecked(target, checked, ids[i]);
			}
		},

		getCheckedNodes: function(data) {
			if (data.length === 0) return [];

			var self = this,
				nodes = [];

			for (var i = 0; i < data.length; i++) {
				if (data[i].checked === true) {
					nodes.push(utils.cloneNode(data[i]));
				}
				nodes = nodes.concat(self.getCheckedNodes(data[i].children || []));
			}

			return nodes;
		},

		checkAll: function(target, checked) {
			var self = this,
				opts = $.data(target, 'tree').options,
				$nodeCheckboxs = $(target).find('.tree-checkbox');

			if (checked === true) {
				$nodeCheckboxs.removeClass('tree-checkbox0');
				$nodeCheckboxs.addClass('tree-checkbox1');
			} else if (checked === false) {
				$nodeCheckboxs.removeClass('tree-checkbox1');
				$nodeCheckboxs.addClass('tree-checkbox0');
			}

			self.setDataChecked(opts.data, checked);
		},

		setDataChecked: function(data, checked, id) {
			if (data.length === 0) return;

			var self = this;

			for (var i = 0; i < data.length; i++) {
				if (typeof id !== 'undefined') {
					if (data[i].id == id) {
						data[i].checked = checked;
					}
				} else {
					data[i].checked = checked;
				}
				self.setDataChecked(data[i].children || [], checked, id);
			}
		},

		setDomChecked: function(target, checked, id) {
			var self = this,
				$that = $(target).find('[data-id=' + id + ']').find('.tree-checkbox');

			if (checked) {
				$that.removeClass('tree-checkbox0');
				$that.addClass('tree-checkbox1');
			} else {
				$that.removeClass('tree-checkbox1');
				$that.addClass('tree-checkbox0');
			}
		},

		expandNode: function(target, that) {
			var self = this,
				opts = $.data(target, 'tree').options;

			$(that).removeClass(opts.collapseCls);
			$(that).addClass(opts.expandCls);
			$(that).parent().next().slideDown();
			if (opts.folderOpenCls !== opts.folderCls) {
				$(that).parent().find('.tree-icon').addClass(opts.folderOpenCls);
			}
		},

		collapseNode: function(target, that) {
			var self = this,
				opts = $.data(target, 'tree').options;

			$(that).addClass(opts.collapseCls);
			$(that).removeClass(opts.expandCls);
			$(that).parent().next().slideUp();
			if (opts.folderOpenCls !== opts.folderCls) {
				$(that).parent().find('.tree-icon').removeClass(opts.folderOpenCls);
			}
		},

		selectionNode: function(target, id) {
			var self = this,
				node = self.getNodeById(target, id),
				opts = $.data(target, 'tree').options,
				$node = $(target).find('[data-id=' + id + ']');

			self.clearAllSelection(target);
			$node.addClass('tree-node-selected');

			if (typeof opts.onSelectedNode === 'function') {
				opts.onSelectedNode.apply(self, [node]);
			}
		},

		selectionNodes: function(target, ids) {
			var self = this,
				$node,
				ids = $.isArray(ids) ? ids : [];

			for (var i = 0; i < ids.length; i++) {
				$node = $(target).find('[data-id=' + ids[i] + ']');
				$node.addClass('tree-node-selected');
			}
		},

		clickNode: function(e, that, target) {
			var self = this,
				node,
				opts = $.data(target, 'tree').options;

			if (typeof opts.onClickNode === 'function') {
				node = self.getNode(target, that);

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
				node = self.getNode(target, that);

				if (opts.onClickRow.apply(that, [e, node]) === false) {
					e.preventDefault();
				}
			}
		},

		loadData: function(target, url) {
			var self = this,
				opts = $.data(target, 'tree').options;

			$.ajax({
				url: url,
				type: 'GET',
				cache: opts.cache,
				beforeSend: opts.onAjaxBeforeSend,
				complete: opts.onAjaxComplete,
				error: opts.onAjaxError,
				timeout: opts.timeout,
				success: function(result) {
					self.finishLoaded(target, result);
				}
			});
		},

		finishLoaded: function(target, result) {
			var self = this,
				opts = $.data(target, 'tree').options;

			opts.data = result.data;
			self.buildData(opts.data, 0, [], opts.nodePathList);
			self.render(target, opts.data);
		},

		getNode: function(target, that) {
			var self = this,
				id = $(that).parent().attr('data-id'),
				node = self.getNodeById(target, id);

			return node;
		},

		getNodes: function(target, ids) {
			var self = this,
				nodes = [];

			for (var i = 0; i < ids.length; i++) {
				nodes.push(self.getNodeById(target, ids[i]));
			}

			return nodes;
		},

		getLastLeafNode: function(data) {
			if (data.length === 0) return [];

			var self = this,
				nodes = [],
				result,
				item = data[data.length - 1],
				children = item.children || [];

			if (children.length > 0) {
				result = self.getLastLeafNode(children);

				if (result) {
					nodes.push(result);
				}
			} else {
				nodes.push(item)
			}

			return nodes.length ? nodes[0] : null;;
		},

		expandTo: function(target, id) {
			var self = this,
				that, parentNode,
				opts = $.data(target, 'tree').options,
				node = self.getNodeById(target, id),
				level = node.level,
				nodePath = node.nodePath;

			while (level > 1) {
				nodePath = nodePath.slice(0, --level);
				parentNode = self.getNodeByPath(nodePath, opts.data);
				that = $(target).find('[data-id=' + parentNode.id + ']').find('.tree-hit').get(0);
				self.expandNode(target, that);
			}
		},

		expandAll: function(target) {
			var self = this,
				opts = $.data(target, 'tree').options;

			$(target).find('.tree').find('ul').slideDown();
			$(target).find('.tree-hit').addClass(opts.expandCls);
			$(target).find('.tree-hit').removeClass(opts.collapseCls);

			if (opts.folderCls !== opts.folderOpenCls) {
				$(target).find('.' + opts.folderCls).addClass(opts.folderOpenCls);
			}
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

			if (opts.folderCls !== opts.folderOpenCls) {
				$(target).find('.' + opts.folderCls).removeClass(opts.folderOpenCls);
			}
			if (typeof opts.onCollapseAll === 'function') {
				opts.onCollapseAll();
			}
		},

		prevNodeSelection: function(target, isSelectionFolder) {
			var self = this,
				id, prevNode,
				selectedNode = self.getSelectedNode(target);

			if (selectedNode.length > 0) {
				id = selectedNode[0].id;
				prevNode = self.getPrevNode(target, id, isSelectionFolder);

				if (prevNode) {
					self.selectionNode(target, prevNode.id);
					self.expandTo(target, prevNode.id);
					return true;
				}
			}

			return false;
		},

		nextNodeSelection: function(target, isSelectionFolder) {
			var self = this,
				id, nextNode,
				selectedNode = self.getSelectedNode(target);

			if (selectedNode.length > 0) {
				id = selectedNode[0].id;
				nextNode = self.getNextNode(target, id, isSelectionFolder);

				if (nextNode) {
					self.selectionNode(target, nextNode.id);
					self.expandTo(target, nextNode.id);
					return true;
				}
			}

			return false;
		},

		getPrevNode: function(target, id, isSelectionFolder) {
			var self = this,
				siblingNode,
				prevLeafNode,
				opts = $.data(target, 'tree').options,
				data = opts.data,
				node = self.getNodeById(target, id),
				level = node.level,
				parent = false,
				nodePath = $.extend([], node.nodePath);

			while (!siblingNode && level > -1) {
				nodePath[level - 1] = nodePath[level - 1] - 1;

				if (self.getNodeByPath(nodePath, data)) {
					siblingNode = self.getNodeByPath(nodePath, data);
				} else {
					nodePath = nodePath.slice(0, --level);
					if (isSelectionFolder) {
						return self.getNodeByPath(nodePath, data);
					}
				}
			}

			if (siblingNode) {
				prevLeafNode = self.getLastLeafNode([siblingNode]);
			}

			return prevLeafNode;
		},

		getNextNode: function(target, id, isSelectionFolder) {
			var self = this,
				index = 0,
				siblingNode,
				nextLeafNode,
				opts = $.data(target, 'tree').options,
				data = opts.data,
				node = self.getNodeById(target, id),
				level = node.level,
				nodePath = $.extend([], node.nodePath);

			while (!siblingNode && level > -1) {

				if (node.isLeaf) {
					nodePath[level - 1] = nodePath[level - 1] + 1;
				} else {
					nodePath.push(0);
				}
				nextLeafNode = self.getNodeByPath(nodePath, data);
				if (nextLeafNode) {
					node = nextLeafNode;
					if (isSelectionFolder) {
						siblingNode = nextLeafNode;
					} else {
						if (nextLeafNode.isLeaf) {
							siblingNode = nextLeafNode;
						}
					}
				} else {
					nodePath = nodePath.slice(0, --level);
				}
			}

			return siblingNode;
		},

		getNodeById: function(target, id) {
			var self = this,
				node,
				opts = $.data(target, 'tree').options,
				nodePath = opts.nodePathList[id];

			if (nodePath) {
				node = self.getNodeByPath(nodePath, opts.data);
			}

			return node;
		},

		getNodeByPath: function(path, data) {
			var self = this,
				node, i = 0;

			while (typeof path[i] !== 'undefined') {
				node = $.extend({}, data[path[i]]);
				data = node.children;
				i++;
			}

			return $.isEmptyObject(node) ? null : node;
		},

		getSelectedNode: function(target) {
			var self = this,
				ids = self.getSelectedIds(target),
				nodes = self.getNodes(target, ids);

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

		buildData: function(data, level, parentNodePath, nodePathList) {
			var self = this,
				id, newNodePath,
				children;

			level++;
			for (var i = 0; i < data.length; i++) {
				children = data[i].children || [];
				data[i].level = level;
				newNodePath = $.extend([], parentNodePath);
				newNodePath.push(i)
				data[i].nodePath = $.extend([], newNodePath);
				data[i].isLeaf = children.length > 0 ? false : true;
				nodePathList[data[i].id] = data[i].nodePath;
				self.buildData(children, level, newNodePath, nodePathList);
			}
		},

		render: function(target, data) {
			var self = this,
				opts = $.data(target, 'tree').options,
				html = self.getTreeHtml(data, opts);

			$(target).html(html);

			if (opts.expandAll) {
				self.expandAll(target);
			}

			if (typeof opts.onAfterRender === 'function') {
				opts.onAfterRender.apply(self, []);
			}
		},

		getTreeHtml: function(data, opts) {
			if (data.length === 0) return '';

			var self = this,
				children,
				html = data[0].level === 1 ? ['<ul class="tree">'] : ['<ul style="display:none;">'];

			for (var i = 0; i < data.length; i++) {
				children = data[i].children || [];
				html.push('<li>');
				html.push(self.getNodeHtml(data[i], opts));
				html.push(self.getTreeHtml(children, opts));
				html.push('</li>');
			}
			html.push('</ul>');

			return html.join('');
		},

		getNodeHtml: function(item, opts) {
			var self = this,
				html = ['<div class="tree-node" data-id=' + item.id + '>'],
				children = item.children || [],
				level = children.length == 0 ? item.level + 1 : item.level;

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

			if (typeof item.checked !== 'undefined') {
				if (item.checked) {
					html.push('<span class="tree-checkbox tree-checkbox1"></span>');
				} else {
					html.push('<span class="tree-checkbox tree-checkbox0"></span>');
				}
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

	var utils = {
		cloneNode: function(node) {
			var newNode = {};

			for (var key in node) {
				if (key !== 'children') newNode[key] = node[key];
			}

			return newNode;
		},

		getNodeIds: function(node) {
			if (node.length === 0) return;

			var self = this,
				result,
				ids = [];

			for (var i = 0; i < node.length; i++) {
				ids.push(node[i].id);

				result = self.getNodeIds(node[i].children || []);

				if (result) {
					ids = ids.concat(result)
				}
			}

			return ids;
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
				options: $.extend(true, {}, $.fn.tree.defaults, options)
			});

			tree.init(this);
		});
	};

	// 公用方法对外面可见
	$.fn.tree.methods = {
		expandTo: function(jq, id) {

			tree.expandTo(jq[0], id);
		},
		selectionNode: function(jq, id) {

			tree.selectionNode(jq[0], id);
		},
		selectionNodes: function(ids) {

			tree.selectionNodes(jq[0], ids);
		},
		expandAll: function(jq) {

			tree.expandAll(jq[0]);
		},
		collapseAll: function(jq) {

			tree.collapseAll(jq[0]);
		},
		checkAll: function(jq, checked) {

			tree.checkAll(jq[0], checked);
		},
		prevNodeSelection: function(jq, isSelectionFolder) {

			return tree.prevNodeSelection(jq[0], isSelectionFolder);
		},
		nextNodeSelection: function(jq, isSelectionFolder) {

			return tree.nextNodeSelection(jq[0], isSelectionFolder);
		},
		getSelectedNode: function(jq) {

			return tree.getSelectedNode(jq[0]);
		},

		getCheckedNodes: function(jq) {
			var opts = $.data(jq[0], 'tree').options;

			return tree.getCheckedNodes(opts.data);
		},

		clearAllSelection: function(jq) {

			tree.clearAllSelection(jq[0]);
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
		expandAll: false,
		cache: false,
		timeout: 60000,
		queryParams: {},
		nodePathList: {},
		onAjaxBeforeSend: function() {},
		onAjaxComplete: function() {},
		onAjaxError: function() {},
		onClickNode: function(e, node) {},
		onClickRow: function(e, ndoe) {},
		onExpanded: function(e, node) {},
		onCollapsed: function(e, node) {},
		onSelectedNode: function(node) {},
		onExpandedAll: function() {},
		onCollapseAll: function() {},
		onAfterRender: function() {}
	};
})(jQuery);