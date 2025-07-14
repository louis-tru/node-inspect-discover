
var is_checks = [];

async function getList() {
	var val = await chrome.storage.local.get('list');
	return (val.list || []).filter(e=>e.ok&&e.value);
}

async function request(url) {
	let res = await fetch(url, {
		timeout: 5000,
	});
	if (res.ok == false) {
		throw new Error(`status: ${res.status}, ${res.statusText}`);
	}
	return res.json();
}

async function getDebugInfo(host) {
	if (is_checks[host])
		return null;
	try {
		is_checks[host] = true;
		var [desc] = await request(`http:/${host}/json`);
		if (desc) {
			return desc;
		}
	} catch(err) {
		console.warn(err);
	} finally {
		delete is_checks[host];
	}
	return null;
}
