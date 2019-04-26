
// check
setInterval(function() {
	if (localStorage.getItem('switch') !== '1') return;
	get().map(e=>check(e.value, function(err, desc) {
		if (err) return;
		// var url = 
		// 	'https://chrome-devtools-frontend.appspot.com/serve_file/'+
		// 	'@548c459fb7741b83bd517b12882f533b04a5513e/inspector.html?'+
		// 	'experiments=true&v8only=true&ws=' + `${e.value}/${desc.id}`;
		var url = desc.devtoolsFrontendUrl;
		if (url) {
			// chrome-devtools://devtools/bundled/inspector.html?experiments=true&v8only=true&ws=192.168.2.40:9221/d04be233-ba4f-4f04-b455-b716b29f22c9
			// 													/devtools/inspector.html?ws=192.168.2.40:9224/devtools/page/84c46d91-06e3-4c4f-944e-5f9cdbd1b636
			url = url.replace(/(wss?=).+?\//, function(all, a, b) {
				return `${a}${e.value}/`;
			});
			if (url[0] == '/') {
				url = 'chrome-devtools:/' + url;
				url = url.replace('devtools/inspector.html', 'devtools/bundled/inspector.html');
			}

			chrome.tabs.query({url}, function(result) {
				debugger;
				if (result.length == 0)
					chrome.tabs.create({ url });
			});
		}
	}));
}, 500);