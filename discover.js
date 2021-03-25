
// var url = 
// 	'https://chrome-devtools-frontend.appspot.com/serve_file/'+
// 	'@548c459fb7741b83bd517b12882f533b04a5513e/inspector.html?'+
// 	'experiments=true&v8only=true&ws=' + `${e.value}/${desc.id}`;

function fix_devtools_url(url, item, desc) {
	// chrome-devtools://devtools/bundled/inspector.html?experiments=true&v8only=true&ws=192.168.2.40:9221/d04be233-ba4f-4f04-b455-b716b29f22c9
	// 													/devtools/inspector.html?ws=192.168.2.40:9224/devtools/page/84c46d91-06e3-4c4f-944e-5f9cdbd1b636
	url = url.replace(/(wss?=).+?\//, function(all, a, b) {
		return `${a}${item.value}/`;
	});
	url = url.replace(/^chrome-devtools:/, 'chrome:');
	url = url.replace(/^devtools:/, 'chrome:');
	if (url[0] == '/') {
		url = 'chrome:/' + url;
		url = url.replace('devtools/inspector.html', 'devtools/bundled/inspector.html');
	}

	var m = navigator.userAgent.match(/Chrome\/(\d+)/);
	if (m && Number(m[1]) >= 83) {
		url = url.replace('chrome-devtools:', 'devtools:');
	}

	return url;
}

var tabs = {};
var checking = false;

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
	for (var host in tabs) {
		var tab = tabs[host];
		if (!tab || tab.id == tabId) {
			delete tabs[host];
		}
	}
});

function check_tab(url) {
	return new Promise((resolve)=>{
		chrome.tabs.query({ url }, function(result) {
			resolve(result && result.length ? true: false);
		});
	});
}

async function check() {

	for (var e of get()) {
		var desc = await request_desc(e.value);
		if (!desc) continue;
		var url = desc.devtoolsFrontendUrlCompat || desc.devtoolsFrontendUrl;
		if (!url) continue;

		url = fix_devtools_url(url, e, desc);
		var host = e.value;

		var urls = [
			url,
		];

		for (var url of urls) {
			if (await check_tab(url))
				return;
		}

		if (tabs[host] && tabs[host].active) {
			chrome.tabs.update(tabs[host].id, { url: url });
		} else {
			chrome.tabs.create({ url: url }, function(tab) {
				tabs[host] = tab;
			});
		}
	}
}

// check
setInterval(async function() {
	if (localStorage.getItem('switch') !== '1' || checking) return;
	try {
		checking = true;
		await check();
	} finally {
		checking = false;
	}
}, 500);