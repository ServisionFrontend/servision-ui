/**
 * jQuery  ServisionUI 1.0
 *
/**
 * textbox - jQuery ServisionUI
 *
 */
(function($) {

	// 内部对象，私有方法，对内可见
	var textbox = {
		init: function(target) {
			var self = this;
			var opts = $.data(target, 'textbox').options;

			self.initEvents(target);
			self.setSize(target, opts.width, opts.height);


			if (!self.placeholderSupport()) {
				self.setPlaceholder(target);
			}
		},

		initEvents: function(target) {
			var self = this;
			var opts = $.data(target, 'textbox').options;
			var placeholder = $(target).attr('placeholder');

			if (!self.placeholderSupport()) {
				$(target).on('focus', function() {
					var $input = $(this);
					if ($input.val() === $input.attr('placeholder')) {
						$input.val('');
						$input.removeClass('placeholder');
					}
				});

				$(target).on('blur', function() {
					var $input = $(this);
					var placeholder = $input.attr('placeholder');

					if ($input.val() === '' || $input.val() === placeholder) {
						$input.addClass('placeholder');
						$input.val(placeholder);
					}
				}).blur();
			}

			$(target).on('change', function() {
				var newVal = $(this).val();

				if (typeof opts.onChanged === 'function') {
					opts.onChanged(newVal);
				}
			});
		},

		setPlaceholder: function(target) {
			var self = this;
			var placeholder = $(target).attr('placeholder');

			if (placeholder) {
				$(target).val(placeholder);
			}
		},

		setSize: function(target, width, height) {
			var self = this;

			$(target).css({
				"width": width,
				"height": height
			});
		},

		getValue: function(target) {
			var self = this;

			return $(target).val();
		},

		setValue: function(target, value) {
			var self = this;

			$(target).val(value);
		},

		placeholderSupport: function() {
			var self = this;

			return 'placeholder' in document.createElement('input');
		}
	};

	// jquery 插件扩展方法
	$.fn.textbox = function(options, param) {
		if (typeof options == 'string') {
			return $.fn.textbox.methods[options](this, param);
		}

		options = options || {};
		return this.each(function() {

			$.data(this, 'textbox', {
				options: $.extend({}, $.fn.textbox.defaults, options)
			});

			textbox.init(this);
		});
	};

	// 公用方法对外面可见
	$.fn.textbox.methods = {
		setValue: function(jq, values) {

			return jq.each(function() {
				textbox.setValue(this, values);
			});
		},

		getValue: function(jq, values) {

			return textbox.getValue(jq[0]);
		}
	};

	// 内部默认配置
	$.fn.textbox.defaults = {
		width: 120,
		height: 21,
		emptyText: '',
		onChanged: function(param) {}
	};
})(jQuery);