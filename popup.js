
var config_list_div;
var list = [];

function save() {
	localStorage.setItem('list', JSON.stringify(list));
}

function render(data, fresh) {
	var { value = '' } = data;

	var empty = value ? '': 'empty';
	var invalid = fresh ? 'invalid': '';
	var selected = fresh ? 'selected': '';
	fresh = fresh && 'fresh';
	data.commit = commit;
	data.available = available;

	var div = $(`
	<div class="target-discovery-line config-list-row ${empty} ${fresh} ${selected}">
		<input class="location preselected ${invalid} primary" 
		type="text" placeholder="IP address and port" value="${value}" />
		<div class="close-button"></div>
	</div>
	`);

	config_list_div.append(div);

	var input = div.find('input');
	var btn = div.find('.close-button');

	input.on('focus', e=>{
		console.log('focus');
		div.addClass('selected');
	});

	input.on('blur', e=>{
		div.removeClass('selected');
	});

	function active(keyCode) {
		value = input.val().trim();
		if (value) {
			div.removeClass('empty');

			var [ host, port ] = value.split(':');
			if (!host || !port) {
				input.addClass('invalid'); return;
			}

			// Verification host
			var domain = host.split('.');
			if (domain.every(e=>/^\d+$/.test(e) && Number(e) < 255) && domain.length == 4) { // ip
			} else if (domain.length > 1) { // domain
			} else {
				input.addClass('invalid'); return;
			}
			
			// Verification port
			port = Number(port);
			if (isNaN(port) || port < 1024 || 65535 < port) {
				input.addClass('invalid'); return;
			}
			input.removeClass('invalid');

			// Verification repeat
			if ( list.length && list.some(e=>e!==data&&e.value==value) ) {
				input.addClass('invalid'); return;
			}

			if (keyCode == 13) {
				data.value = value;
				data.ok = 1;
				if (fresh) {
					fresh = false;
					save();
					div.removeClass('selected');
					div.removeClass('fresh');
					render({}, true);
				} else if (data.value != value) {
					save();
					input.blur();
				}
			}

		} else {
			div.addClass('empty');
		}
	}

	function commit() {
		active(13);
	}

	function available(ok) {
		if (ok) {
			div.addClass('available');
		} else {
			div.removeClass('available');
		}
	}

	input.on('keydown', (e)=>setTimeout(()=>active(e.keyCode), 10));

	btn.on('click', (e)=>{
		for (var i = 0; i < list.length; i++) {
			if (list[i] === data) {
				list.splice(i, 1);
			}
		}
		save();
		div.remove();
		config_list_div.find('div.fresh > input').focus();
	});

	input.focus();
	list.push(data);

	return div;
}

$(function() {

	config_list_div = $('#config-list');//querySelector

	$('#button-done').click(function() {
		list.forEach(e=>e.commit());
		close();
	});

	/*
		<div class="target-discovery-line config-list-row">
			<input class="location preselected primary" type="text" placeholder="IP address and port" value="127.0.0.1:9225" />
			<div class="close-button"></div>
		</div>

		<div class="target-discovery-line config-list-row empty fresh">
			<input class="location preselected invalid primary" type="text" placeholder="IP address and port" />
			<div class="close-button"></div>
		</div>

		<div class="target-discovery-line config-list-row fresh selected">
			<input class="location preselected invalid primary" type="text" placeholder="IP address and port" />
			<div class="close-button"></div>
		</div>
	*/

	get().forEach(e=>render(e));
	render({}, true);

	// check
	setInterval(function() {
		list.filter(e=>e.ok&&e.value).map((e)=>check(e.value, function(err, desc) {
			e.available(!!desc);
		}));
	}, 1000);

});