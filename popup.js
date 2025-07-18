
var config_list_div;
var list = [];

function saveList() {
	chrome.storage.local.set({list});
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
					saveList();
					div.removeClass('selected');
					div.removeClass('fresh');
					render({}, true);
				} else if (data.value != value) {
					saveList();
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
		saveList();
		div.remove();
		config_list_div.find('div.fresh > input').focus();
	});

	input.focus();
	list.push(data);

	return div;
}

async function updateSwitch() {
	let val = await chrome.storage.local.get('switch');
	if (val.switch === '1') {
		$('#button-switch').html('Off');
		$('#button-switch').addClass('on');
	} else {
		$('#button-switch').html('On');
		$('#button-switch').removeClass('on');
	}
}

$(async function() {

	config_list_div = $('#config-list');//querySelector

	$('#button-done').click(function() {
		list.forEach(e=>e.commit());
		close();
	});

	$('#button-switch').click(async function() {
		let val = await chrome.storage.local.get('switch');
		if (val.switch === '1') {
			await chrome.storage.local.set({'switch': '0'});
		} else {
			await chrome.storage.local.set({'switch': '1'});
		}
		await updateSwitch();
	});

	await updateSwitch();

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

	for (let it of await getList()) {
		render(it);
	}
	render({}, true);

	// check
	setInterval(async function() {
		for (var e of list.filter(e=>e.ok&&e.value)) {
			e.available(!!await getDebugInfo(e.value));
		}
	}, 1000);

});