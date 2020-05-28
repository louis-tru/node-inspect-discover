
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
	if (url[0] == '/') {
		// url = 'chrome-devtools:/' + url;
		url = 'chrome-devtools:/' + url;
		url = url.replace('devtools/inspector.html', 'devtools/bundled/inspector.html');
	}

	var m = navigator.userAgent.match(/Chrome\/(\d+)/);
	if (m && Number(m[1]) >= 83) {
		url = url.replace('chrome-devtools:', 'devtools:');
	}

	return url;
}

var tabs = {};

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
	for (var host in tabs) {
		var tab = tabs[host];
		if (tab.id == tabId) {
			delete tabs[host];
		}
	}
});

// check
setInterval(function() {
	if (localStorage.getItem('switch') !== '1') return;
	get().map(e=>check(e.value, function(err, desc) {
		if (err) return;
		var url = desc.devtoolsFrontendUrlCompat || desc.devtoolsFrontendUrl;
		if (!url) return;
		url = fix_devtools_url(url, e, desc);
		var host = e.value;
		chrome.tabs.query({ url: url.replace('chrome-', '') }, function(result) {
			if (result && result.length) return;
			chrome.tabs.query({ url }, function(result) {
				if (result && result.length) return;
				if (tabs[host] && tabs[host].active) {
					chrome.tabs.update(tabs[host].id, { url: url });
				} else {
					chrome.tabs.create({ url: url }, function(tab) {
						tabs[host] = tab;
					});
				}
			});
		});
	}));
}, 500);