
// check
setInterval(function() {
	if (localStorage.getItem('switch') !== '1') return;
	get().map(e=>check(e.value, function(err, desc) {
		if (err) return;
		var url = 
			'https://chrome-devtools-frontend.appspot.com/serve_file/'+
			'@548c459fb7741b83bd517b12882f533b04a5513e/inspector.html?'+
			'experiments=true&v8only=true&ws=' + `${e.value}/${desc.id}`;
		chrome.tabs.query({url}, function(result) {
			if (result.length == 0)
				open(url, e.value);
		});
	}));
}, 500);