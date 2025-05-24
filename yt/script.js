function fetchThumbnails() {
	const videoUrl = document.getElementById('videoUrl').value;
	const videoId = extractVideoId(videoUrl);
    
	if(!videoId) {
    	alert('Please enter a valid YouTube URL');
    	return;
	}

	displayThumbnails(videoId);
}

function extractVideoId(url) {
	const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
	const match = url.match(regExp);
	return (match && match[2].length === 11) ? match[2] : null;
}

function displayThumbnails(videoId) {
	const qualities = [
    	{ res: '4K', url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` },
    	{ res: 'HD', url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` },
    	{ res: 'SD', url: `https://img.youtube.com/vi/${videoId}/sddefault.jpg` }
	];

	const container = document.getElementById('thumbnailContainer');
	container.innerHTML = '';

	qualities.forEach(quality => {
    	const card = document.createElement('div');
    	card.className = 'thumbnail-card';
    	card.innerHTML = `
        	<img src="${quality.url}" class="thumbnail-img" alt="${quality.res} thumbnail">
        	<div class="download-options">
            	<a href="${quality.url}" download class="download-btn">
                	<i class="fas fa-download"></i> ${quality.res}
            	</a>
        	</div>
    	`;
    	container.appendChild(card);
	});
}
