/* SAC Pro by Jeff Starr @ Monzilla Media */

'use strict';

// chat width

function sacproResize() {
	var sacpro = document.getElementById('sacpro');
	if (sacpro) {
		if (sacpro.offsetWidth < 570) {
			sacpro.className = '';
			sacpro.classList.add('sacpro-classic-narrow');
		} else {
			sacpro.className = '';
		}
	}
}

// field order

function sacproOrder() {
	if (sacpro.field_order === 'true') {
		var box  = document.querySelector('.sacpro-box');
		var form = document.querySelector('.sacpro-form');
		box.parentNode.insertBefore(form, box);
	}
}

// chat scroll

function sacproScroll() {
	if (sacpro.chat_order === 'asc' && sacpro.disable_scroll === 'false') {
		var box = document.querySelector('.sacpro-box-inner');
		box.scrollTop = box.scrollHeight;
	}
}

// fade out

function sacproFade(element, toValue = 0, duration = 200) {
	
	const fromValue = parseFloat(element.style.opacity) || 1;
	const startTime = Date.now();
	const framerate = 1000 / 60; // 60fps
	
	let interval = setInterval(() => {
		
		const currentTime = Date.now();
		const timeDiff = (currentTime - startTime) / duration;
		const value = fromValue - (fromValue - toValue) * timeDiff;
		
		if (timeDiff >= 1) {
			clearInterval(interval);
			interval = 0;
			element.style.opacity = '0';
			element.style.display = 'none';
			element.innerHTML = '';
		}
		
		element.style.opacity = value.toString();
		
	}, framerate);
	
}

// enter submit

function sacproEnter(a, e) {
	var text = document.getElementById('sacpro-text');
	if (text) {
		text.addEventListener('keypress', function(e) {
		var key = e.keyCode ? e.keyCode : e.which ? e.which : e.charCode;
			if (key == 13 && !e.shiftKey) {
				var val = this.value.replace(/^(\s+)/g, '');
				if (val !== '') {
					e.preventDefault();
					sacproRecaptcha();
				}
				return false;
			} else {
				return true;
			}
		});
	}
}

// button submit

function sacproSubmit(e) {
	e.preventDefault();
	if (!document.forms[sacpro.prefixed_id].elements['sacpro-submit'].disabled) {
		sacproRecaptcha();
	}
}

// recaptcha

function sacproRecaptcha() {
	if (sacpro.recaptcha_enable === 'true') {
		grecaptcha.ready(function() {
			grecaptcha.execute(sacpro.recaptcha_public, { action: 'submit' }).then(function(recaptcha) {
				sacpro.recaptcha_response = recaptcha;
				sacproProcess();
			});
		});
	} else {
		sacproProcess();
	}
}

// submit status

function sacproStatus(status = '') {
	var form = document.forms[sacpro.prefixed_id];
	if (form) {
		var text   = form.elements['sacpro-text'];
		var submit = form.elements['sacpro-submit'];
		if (text.value !== '' || status == 'active') {
			submit.disabled = false;
		} else {
			submit.disabled = true;
		}
	}
}

// ajax chat

sacproInit();

function sacproInit() {
	
	if (!document.getElementById('sacpro')) return;
	
	sacpro.cycle = 1;
	
	sacpro.ajax_receive = new XMLHttpRequest();
	sacpro.ajax_send    = new XMLHttpRequest();
	sacpro.ajax_online  = new XMLHttpRequest();
	sacpro.ajax_active  = new XMLHttpRequest();
	
	window.addEventListener('resize', function() { sacproResize(); }, true);
	
	sacproResize();
	sacproOrder();
	sacproScroll();
	sacproEnter();
	sacproStatus();
	sacproName();
	sacproUrl();
	
	setInterval(sacproUsersOnline,  5000);
	setInterval(sacproActiveNumber, 5000);
	setInterval(sacproChatCount,    1000);
	
	setTimeout(sacproRefresh, sacpro.interval_current);
	
	if (sacpro.chat_order === 'asc') {
		var chats = document.querySelector('.sacpro-chats > .sacpro-chat:last-of-type');
	} else {
		var chats = document.querySelector('.sacpro-chats > .sacpro-chat:first-of-type');
	}
	if (chats && typeof chats !== 'string') sacpro.chat_id = chats.dataset.chatid;
	
	var name = document.getElementById('sacpro-name');
	if (name && typeof name !== 'string') name.onblur = sacproName;
	
	var url = document.getElementById('sacpro-url');
	if (url && typeof url !== 'string') url.onblur = sacproUrl;
	
	var text = document.getElementById('sacpro-text');
	if (text) {
		text.onfocus = function() { sacproStatus('active'); };
		text.onblur  = function() { sacproStatus(); };
	}
	
	var submit = document.getElementById('sacpro-submit');
	if (submit) submit.onclick = sacproSubmit;
	
	document.getElementById(sacpro.prefixed_id).onsubmit    = function() { return false; };
	document.getElementById(sacpro.prefixed_id).onmouseover = function() {
		
		if (sacpro.cycle > 9) {
			sacpro.cycle = 1;
			sacproRefresh();
		}
		
		sacpro.interval_current = sacpro.interval_default;
		
	};
	
	sacproScroll();
	
}

function sacproProcess() {
	
	if (sacpro.ajax_send.readyState == 4 || sacpro.ajax_send.readyState == 0) {
		
		sacpro.ajax_send.open('POST', encodeURI(sacpro.ajax_url), true);
		sacpro.ajax_send.onreadystatechange = sacproRefresh;
		sacpro.ajax_send.onload = function() {
			
			var data = sacpro.ajax_send.response;
			var div  = document.querySelector('.sacpro-error');
			
			if (data && data !== 'SAC Pro: Ajax success') {
				
				div.innerHTML = data;
				div.style.display = 'block';
				div.style.opacity = '1';
				
				setTimeout(() => { sacproFade(div, 0, 300); }, 3000);
				
			}
			
		};
		
		sacpro.ajax_send.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		sacpro.ajax_send.send(sacproProcessVars());
		
		document.forms[sacpro.prefixed_id].elements['sacpro-text'].value = '';
		
		var count = document.getElementById('sacpro-count-chars');
		var max   = (count) ? parseInt(count.dataset.max) : 0;
		
		count.textContent = max + '/' + max;
		
	}
	
}

function sacproRefresh() {
	
	if (sacpro.ajax_receive.readyState == 4 || sacpro.ajax_receive.readyState == 0) {
		
		var url = encodeURI(sacpro.ajax_url);
		
		var a = '?action=sacpro_refresh';
		var b = '&sacpro-refresh='        + encodeURIComponent(sacpro.nonce_refresh);
		var c = '&sacpro-formid='         + encodeURIComponent(sacpro.form_id);
		var d = '&sacpro-chat-order='     + encodeURIComponent(sacpro.chat_order);
		var e = '&sacpro-chatid='         + encodeURIComponent(parseInt(sacpro.chat_id));
		var f = '&sacpro-user-url='       + encodeURIComponent(sacproGetUserUrl());
		var g = '&sacpro-user-avatar='    + encodeURIComponent(sacproGetUserAvatar());
		var h = '&sacpro-display-meta='   + encodeURIComponent(sacproGetDisplayMeta());
		
		url = url + a + b + c + d + e + f + g + h; 
		
		sacpro.ajax_receive.open('GET', url, true);
		sacpro.ajax_receive.onreadystatechange = sacproReceive;
		sacpro.ajax_receive.timeout = 10000; // ms
		sacpro.ajax_receive.ontimeout = function() { console.log('Error: request timeout'); };
		sacpro.ajax_receive.onerror   = function() { console.log('Error: network problem'); };
		sacpro.ajax_receive.responseType = 'json';
		sacpro.ajax_receive.send(null);
		
		sacpro.cycle++;
		
		if (sacpro.cycle > 9) {
			sacpro.interval_current = sacpro.interval_current * 1.25;
		}
		
	}
	
	// console.log('Cycle: '+ sacpro.cycle +', Timeout: '+ sacpro.interval_current);
	
	setTimeout(sacproRefresh, sacpro.interval_current);
	
}

function sacproReceive() {
	
	if (sacpro.ajax_receive.readyState == 4) {
		
		var status = sacpro.ajax_receive.status;
		var error  = sacpro.ajax_receive.response.error;
		var chatid = sacpro.ajax_receive.response.chatid;
		var since  = sacpro.ajax_receive.response.since;
		var notif  = sacpro.ajax_receive.response.notif;
		var output = sacpro.ajax_receive.response.output.join('');
		
		if (status != 200) {
			console.log('Error: request status '+ status);
			return;
		}
		
		if (error) {
			console.log(error);
			return;
		}
		
		if (chatid) {
			sacpro.chat_id = chatid;
		}
		
		if (since) {
			document.querySelector('.sacpro-latest-message-val').innerHTML = since;
		}
		
		if (sacpro.chat_order === 'asc') {
			document.querySelector('.sacpro-chats').insertAdjacentHTML('beforeend', output);
		} else {
			document.querySelector('.sacpro-chats').insertAdjacentHTML('afterbegin', output);
		}
		
		if (output && output.length !== 0) {
			var audio = document.getElementById('sacpro-audio-alert');
			if (audio) audio.play();
			
			sacpro.interval_current = sacpro.interval_default;
			sacpro.cycle = 1;
		}
		
		for (var key in notif) {
			if (notif.hasOwnProperty(key)) {
				if (sacpro.notif_disable === 'false') {
					if ('Notification' in window) {
						var url = (sacpro.notif_url === 'false') ? window.location.href : false;
						sacproNotification(sacpro.notif_title, notif[key]['name'] + ': ' + notif[key]['text'] + "\r\n" + notif[key]['date'], url);
					}
				}
			}
		}
		
		sacproScroll();
		
	}
	
}

// name field

function sacproName() {
	
	var cookie = Cookies.get('sacpro-name');
	
	if (sacpro.logged_in === 'true' || sacpro.user_name === 'auto_gen') {
		var input = document.getElementById('sacpro-name-static');
		var name = (input) ? input.innerText : '';
	} else {
		var input = document.getElementById('sacpro-name');
		var name = (input) ? input.value : '';
	}
	
	if ((!cookie || name !== cookie) && (name !== '')) {
		Cookies.set('sacpro-name', name, { expires: parseInt(sacpro.cookie_expire), sameSite: 'strict', path: '' });
	}
	
	if (input && cookie && name == '') {
		if (sacpro.logged_in === 'true' || sacpro.user_name === 'auto_gen') {
			input.innerText = cookie;
		} else {
			input.value = cookie;
		}
		return;
	}
	
	if (input && name == '') {
		var guest = 'guest_'+ Math.floor(Math.random() * 10000);
		if (sacpro.logged_in === 'true' || sacpro.user_name === 'auto_gen') {
			input.innerText = guest;
		} else {
			if (sacpro.user_name !== 'user_defined') {
				input.value = guest;
			}
		}
	}
	
}

// url field

function sacproUrl() {
	
	if (sacpro.logged_in === 'true' && sacpro.user_url !== 'user_defined') {
		return;
	}
	
	var cookie = Cookies.get('sacpro-url');
	var input = document.getElementById('sacpro-url');
	var url = (input && typeof input !== 'string') ? input.value : '';
	
	if (url == '') {
		return;
	}
	
	if (!cookie || url !== cookie) {
		Cookies.set('sacpro-url', url, { expires: parseInt(sacpro.cookie_expire), sameSite: 'strict', path: '' });
		return;
	}
	
	if (input && cookie && url == '') {
		input.value = cookie;
		return;
	}
	
}

// count chars

sacproCountChars();

function sacproCountChars() {
	
	var text  = document.getElementById('sacpro-text');
	var count = document.getElementById('sacpro-count-chars');
	var max   = (count) ? parseInt(count.dataset.max) : 0;
	
	const countChars = () => {
		
		let num = text.value.length;
		let counter = max - num;
		let percent = (20/100) * max;
		
		// console.log(percent);
		
		count.textContent = counter + '/' + max;
		
		if (counter < 0) {
			count.style.color = 'red';
		} else if (counter < percent) {
			count.style.color = 'orange';
		} else {
			count.style.color = '#777';
		}
	};
	
	if (text) text.addEventListener('input', countChars);
	
}

// active number

function sacproActiveNumber() {
	
	if (document.getElementById('sacpro-active-users') === null) return;
	
	if (sacpro.ajax_active.readyState == 4 || sacpro.ajax_active.readyState == 0) {
		
		var url = encodeURI(sacpro.ajax_url);
		
		var a = '?action=sacpro_online';
		var b = '&sacpro-online='        + encodeURIComponent(sacpro.nonce_online);
		var c = '&sacpro-formid='        + encodeURIComponent(sacproGetActiveFormID());
		var d = '&sacpro-display='       + encodeURIComponent(sacproGetActiveDisplay());
		var e = '&sacpro-style='         + encodeURIComponent(sacproGetActiveStyle());
		
		var url = url + a + b + c + d + e; 
		
		sacpro.ajax_active.open('GET', url, true);
		sacpro.ajax_active.onreadystatechange = sacproActiveNumberReceive;
		sacpro.ajax_active.timeout = 10000; // ms
		sacpro.ajax_active.responseType = 'json';
		sacpro.ajax_active.send(null);
		
	}
	
}

function sacproActiveNumberReceive() {
	
	if (document.getElementById('sacpro-active-users') === null) return;
	
	if (sacpro.ajax_active.readyState == 4) {
		
		var status = sacpro.ajax_active.status;
		var output = sacpro.ajax_active.response;
		
		if (status != 200) {
			console.log('Error: request status '+ status);
			return;
		}
		
		if (output) {
			var div = document.createElement('div');
			div.innerHTML = output;
			
			var widget = document.getElementById('sacpro-active-users');
			widget.parentNode.replaceChild(div.firstChild, widget);
		}
	}
}

// users online

function sacproUsersOnline() {
	
	if (document.getElementById('sacpro-online-users') === null) return;
	
	if (sacpro.ajax_online.readyState == 4 || sacpro.ajax_online.readyState == 0) {
		
		var url = encodeURI(sacpro.ajax_url);
		
		var a = '?action=sacpro_online';
		var b = '&sacpro-online='        + encodeURIComponent(sacpro.nonce_online);
		var c = '&sacpro-formid='        + encodeURIComponent(sacproGetOnlineFormID());
		var d = '&sacpro-display='       + encodeURIComponent(sacproGetOnlineDisplay());
		var e = '&sacpro-style='         + encodeURIComponent(sacproGetOnlineStyle());
		
		var url = url + a + b + c + d + e; 
		
		sacpro.ajax_online.open('GET', url, true);
		sacpro.ajax_online.onreadystatechange = sacproUsersOnlineReceive;
		sacpro.ajax_online.timeout = 10000; // ms
		sacpro.ajax_online.responseType = 'json';
		sacpro.ajax_online.send(null);
		
	}
	
}

function sacproUsersOnlineReceive() {
	
	if (document.getElementById('sacpro-online-users') === null) return;
	
	if (sacpro.ajax_online.readyState == 4) {
		
		var status = sacpro.ajax_online.status;
		var output = sacpro.ajax_online.response;
		
		if (status != 200) {
			console.log('Error: request status '+ status);
			return;
		}
		
		if (output) {
			var div = document.createElement('div');
			div.innerHTML = output;
			
			var widget = document.getElementById('sacpro-online-users');
			widget.parentNode.replaceChild(div.firstChild, widget);
		}
	}
}

// chat count

function sacproChatCount() {
	
	if (document.getElementById('sacpro-chat-count') === null) return;
	
	if (document.querySelector('.sacpro-chats') === null) return;
	
	var chats = document.querySelector('.sacpro-chats');
	
	var count = chats.querySelectorAll('.sacpro-chat').length;
	
	var widget = document.getElementById('sacpro-chat-count');
	
	widget.innerHTML = count;
	
}

// browser notifications

function sacproNotification(title, desc, url) {
	if (window.Notification && Notification.permission === 'granted') {
		var notification = new Notification(title, {
			icon: sacpro.notif_icon,
			body: desc,
		});
		if (url) {
			notification.onclick = function() {
				window.open(url);
			};
		}
		notification.onclose = function() {
			// console.log('Notification closed');
		};
	} else if (sacproNotificationSupported()) {
		Notification.requestPermission();
	}
}

function sacproNotificationSupported() {
	if (!window.Notification || !Notification.requestPermission) return false;
	if (Notification.permission === 'granted') throw new Error('Browser notification error for SAC Pro');
	try {
		new Notification('');
	} catch (e) {
		if (e.name == 'TypeError') return false;
	}
	return true;
}

// ajax vars

function sacproProcessVars() {
	
	var a = 'action=sacpro_process';
	var b = '&sacpro-process='             + encodeURIComponent(sacpro.nonce_process);
	var c = '&sacpro-formid='              + encodeURIComponent(sacpro.form_id);
	var d = '&sacpro-recaptcha-enable='    + encodeURIComponent(sacpro.recaptcha_enable);
	var e = '&sacpro-recaptcha-response= ' + encodeURIComponent(sacpro.recaptcha_response);
	
	var f = '&sacpro-name-check='          + encodeURIComponent(sacproGetNameCheck());
	var g = '&sacpro-user-name='           + encodeURIComponent(sacproGetUserName());
	var h = '&sacpro-name='                + encodeURIComponent(sacproGetName());
	var i = '&sacpro-url-check='           + encodeURIComponent(sacproGetUrlCheck());
	var j = '&sacpro-user-url='            + encodeURIComponent(sacproGetUserUrl());
	
	var k = '&sacpro-url='                 + encodeURIComponent(sacproGetUrl());
	var l = '&sacpro-text='                + encodeURIComponent(sacproGetText());
	var m = '&sacpro-max-chats-saved='     + encodeURIComponent(sacproGetMaxChats());
	var n = '&sacpro-max-chars-name='      + encodeURIComponent(sacproGetCharsName());
	var o = '&sacpro-max-chars-text='      + encodeURIComponent(sacproGetCharsText());
	
	var p = '&sacpro-max-chars-url='       + encodeURIComponent(sacproGetCharsUrl());
	var q = '&sacpro-logged-only='         + encodeURIComponent(sacproGetLoggedOnly());
	var r = '&sacpro-read-only='           + encodeURIComponent(sacproGetReadOnly());
	var s = '&sacpro-private-chat='        + encodeURIComponent(sacproGetPrivateChat());
	var t = '&sacpro-welcome-name='        + encodeURIComponent(sacproGetWelcomeName());
	
	var u = '&sacpro-email-alerts='        + encodeURIComponent(sacproGetEmailAlerts());
	var v = '&sacpro-max-users='           + encodeURIComponent(sacproGetMaxUsers());
	var w = '&sacpro-user-avatar='         + encodeURIComponent(sacproGetUserAvatar());
	var x = '&sacpro-display-meta='        + encodeURIComponent(sacproGetDisplayMeta());
	var y = '&sacpro-form-nonce='          + encodeURIComponent(sacproGetFormNonce());
	
	return a + b + c + d + e + f + g + h + i + j + k + l + m + n + o + p + q + r + s + t + u + v + w + x + y;
	
}

// get values

function sacproGetNameCheck() { //
	if (document.getElementById('sacpro-name-check')) {
		return document.getElementById('sacpro-name-check').value;
	}
	return '';
}

function sacproGetUserName() {
	if (document.getElementById('sacpro-user-name')) {
		return document.getElementById('sacpro-user-name').value;
	}
	return '';
}

function sacproGetName() {
	if (document.getElementById('sacpro-name')) {
		return document.getElementById('sacpro-name').value;
	}
	return '';
}

function sacproGetUrlCheck() { //
	if (document.getElementById('sacpro-url-check')) {
		return document.getElementById('sacpro-url-check').value;
	}
	return '';
}

function sacproGetUserUrl() {
	if (document.getElementById('sacpro-user-url')) {
		return document.getElementById('sacpro-user-url').value;
	}
	return '';
}

function sacproGetUrl() {
	if (document.getElementById('sacpro-url')) { //
		return document.getElementById('sacpro-url').value;
	}
	return '';
}

function sacproGetText() {
	if (document.getElementById('sacpro-text')) {
		return document.getElementById('sacpro-text').value;
	}
	return '';
}

function sacproGetMaxChats() {
	if (document.getElementById('sacpro-max-chats-saved')) {
		return document.getElementById('sacpro-max-chats-saved').value;
	}
	return '';
}

function sacproGetCharsName() {
	if (document.getElementById('sacpro-max-chars-name')) {
		return document.getElementById('sacpro-max-chars-name').value;
	}
	return '';
}

function sacproGetCharsText() {
	if (document.getElementById('sacpro-max-chars-text')) {
		return document.getElementById('sacpro-max-chars-text').value;
	}
	return '';
}

function sacproGetCharsUrl() {
	if (document.getElementById('sacpro-max-chars-url')) {
		return document.getElementById('sacpro-max-chars-url').value;
	}
	return '';
}

function sacproGetLoggedOnly() {
	if (document.getElementById('sacpro-logged-only')) {
		return document.getElementById('sacpro-logged-only').value;
	}
	return '';
}

function sacproGetReadOnly() {
	if (document.getElementById('sacpro-read-only')) {
		return document.getElementById('sacpro-read-only').value;
	}
	return '';
}

function sacproGetPrivateChat() {
	if (document.getElementById('sacpro-private-chat')) {
		return document.getElementById('sacpro-private-chat').value;
	}
	return '';
}

function sacproGetWelcomeName() {
	if (document.getElementById('sacpro-welcome-name')) {
		return document.getElementById('sacpro-welcome-name').value;
	}
	return '';
}

function sacproGetEmailAlerts() {
	if (document.getElementById('sacpro-email-alerts')) {
		return document.getElementById('sacpro-email-alerts').value;
	}
	return '';
}

function sacproGetMaxUsers() {
	if (document.getElementById('sacpro-max-users')) {
		return document.getElementById('sacpro-max-users').value;
	}
	return '';
}

function sacproGetUserAvatar() {
	if (document.getElementById('sacpro-user-avatar')) {
		return document.getElementById('sacpro-user-avatar').value;
	}
	return '';
}

function sacproGetDisplayMeta() {
	if (document.getElementById('sacpro-display-meta')) {
		return document.getElementById('sacpro-display-meta').value;
	}
	return '';
}

function sacproGetFormNonce() {
	if (document.getElementById('sacpro-form-nonce')) {
		return document.getElementById('sacpro-form-nonce').value;
	}
	return '';
}

//

function sacproGetActiveFormID() {
	if (document.getElementById('sacpro-active-users')) {
		return document.getElementById('sacpro-active-users').dataset.formid;
	}
	return '';
}
function sacproGetActiveDisplay() {
	if (document.getElementById('sacpro-active-users')) {
		return document.getElementById('sacpro-active-users').dataset.display;
	}
	return '';
}
function sacproGetActiveStyle() {
	if (document.getElementById('sacpro-active-users')) {
		return document.getElementById('sacpro-active-users').dataset.style;
	}
	return '';
}

//

function sacproGetOnlineFormID() {
	if (document.getElementById('sacpro-online-users')) {
		return document.getElementById('sacpro-online-users').dataset.formid;
	}
	return '';
}
function sacproGetOnlineDisplay() {
	if (document.getElementById('sacpro-online-users')) {
		return document.getElementById('sacpro-online-users').dataset.display;
	}
	return '';
}
function sacproGetOnlineStyle() {
	if (document.getElementById('sacpro-online-users')) {
		return document.getElementById('sacpro-online-users').dataset.style;
	}
	return '';
}

//

function sacproGetCountFormID() {
	if (document.getElementById('sacpro-chat-count')) {
		return document.getElementById('sacpro-chat-count').dataset.formid;
	}
	return '';
}