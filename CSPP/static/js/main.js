$(document).ready(() => {
	$("#saveBtn").on('click', saveSettings);
	$("#restoreBtn").on('click', restoreSettings);
	restoreSettings();
});

const getSettings = ($form) => {
	var unindexed_array = $form.serializeArray();
	var indexed_array = {};
	$.map(unindexed_array, (n, i) => {
		indexed_array[n['name']] = n['value'];
	});
	return indexed_array;
}

const mergeSettings = (target, source) => {
	for (let key in source) {
		if ((typeof target[key] === 'object') && (typeof source[key] === 'object')) {
			mergeSettings(target[key], source[key]);
		} else {
			target[key] = source[key];
		}
	}
	return target;
}

const showToast = (msg) => {
	$("#toast-text").text(msg);
	$("#toast").removeClass("hidden");
	setTimeout(() => {
		$("#toast").addClass("hidden");
	}, 2000);
}

const restoreSettings = () => {
	$.get('/api/settings', (savedSettings) => {
		if (typeof savedSettings === 'object') {
			defaultSettings = getSettings($('#pet-form'));
			userSettings = mergeSettings(defaultSettings, savedSettings);
			Object.keys(userSettings).forEach((key) => {
				settingVal = userSettings[key];
				if (settingVal == "true" || settingVal == "false") {
					$(`[name=${key}]`).prop("checked", (settingVal == "true") ? true : false);
				} else {
					$(`[name=${key}]`).val(settingVal);
				}
			});
			showToast("Settings restored!");

			loadActivity();
		}
	});
}

const loadActivity = () => {
	$.get('/api/pet/activity', (data) => {
		if (data.activity_feed && Array.isArray(data.activity_feed)) {
			var html = '';
			data.activity_feed.forEach((item) => {
				html += '<div class="activity-item"><span class="time">' + item.time + '</span> ' + item.message + '</div>';
			});
			$("#activity-feed").html(html);
		}
		if (data.pet_happiness !== undefined) {
			$("#bar-fill").css("width", data.pet_happiness + "%");
			$("#bar-value").text(data.pet_happiness + "%");
			$("#happiness-bar").removeClass("hidden");
		}
	});
}

const saveSettings = () => {
	userSettings = getSettings($('#pet-form'));
	$.ajax({
		url: '/api/settings',
		type: 'post',
		dataType: 'json',
		contentType: 'application/json',
		data: JSON.stringify(userSettings),
		success: (data) => {
			showToast(data.message || "Settings saved!");
		},
		error: (request, status, error) => {
			try {
				response = JSON.parse(request.responseText).message;
			} catch {
				response = request.responseText;
			}
			showToast(response || "Error saving settings");
		}
	});
}
