/* SAC Pro - Emoji Picker */

(function($) {
	
	$.fn.emoji = function() {
		
		this.each(function (n, input) {
			
			var $input = $(input);
			
			var $open = false;
			
			var $button = $('<div class="sacpro-emoji-picker-button" title="Toggle Emoji Picker">').html('&#x1F642;').on('click', toggleEmoji);
			
			var $list = $('<div class="sacpro-emoji-picker">');
			
			var $wrap = $('<div class="sacpro-emoji-picker-wrap">');
			
			for (var n in sacpro.emoji_list) {
				
				$('<div class="sacpro-emoji">').html(sacpro.emoji_list[n]).on('click', clickEmoji).appendTo($list);
			}
			
			$button.insertAfter(this);
			
			$list.insertAfter($input);
			
			$list.wrapInner($wrap);
			
			function toggleEmoji() {
				
				if ($open) {
					$open = false;
					$list.hide();
					
				} else {
					$open = true;
					$list.show();
					$input.focus();
				}
			}
			
			function clickEmoji(ev) {
				
				if (input.selectionStart || input.selectionStart == '0') {
					
					var startPos = input.selectionStart;
					var endPos   = input.selectionEnd;
					
					input.value = input.value.substring(0, startPos) + ev.currentTarget.innerHTML + input.value.substring(endPos, input.value.length);
					
				} else {
					
					input.value += ev.currentTarget.innerHTML;
				}
				
				$input.focus();
				input.selectionStart = startPos + 2;
				input.selectionEnd = endPos + 2;
				
			}
			
		});
		
		return this;
		
	};
	
	$('#sacpro-text').emoji();
	
})(jQuery);