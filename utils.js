
var is_checks = [];

function get() {
	var r;
	try { r = JSON.parse(localStorage.getItem('list')) } catch(er) {}
	return (r || []).filter(e=>e.ok&&e.value);
}

async function request(url) {
	return new Promise((resolve, reject)=>{
		$.ajax({
			url,
			timeout: 5000,
			dataType: "json",
			complete:function(xhr, status) {
				if (status == 'success') {
					resolve(xhr.responseJSON);
				} else {
					reject(status);
				}
			}
		});
	});
}

async function request_desc(host) {
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
