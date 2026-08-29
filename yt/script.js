function fetchThumbnails() {
    const videoUrl = document.getElementById('videoUrl').value;
    const videoId = extractVideoId(videoUrl);
    
    if (!videoId) {
        alert('Please enter a valid YouTube URL (e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ)');
        return;
    }

    displayThumbnails(videoId);
}

function extractVideoId(url) {
    if (!url) return null;
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const match = url.trim().match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

function displayThumbnails(videoId) {
    const qualities = [
        { name: 'Max Resolution (1080p / 4K)', label: 'Max Res', url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` },
        { name: 'High Definition (HQ)', label: 'HD (720p)', url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` },
        { name: 'Standard Definition (SD)', label: 'SD (480p)', url: `https://img.youtube.com/vi/${videoId}/sddefault.jpg` },
        { name: 'Medium Quality (MQ)', label: 'MQ (360p)', url: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` }
    ];

    const container = document.getElementById('thumbnailContainer');
    container.innerHTML = '';

    qualities.forEach(quality => {
        const card = document.createElement('div');
        card.className = 'thumbnail-card';
        card.innerHTML = `
            <img src="${quality.url}" class="thumbnail-img" alt="${quality.name}" onerror="this.parentElement.style.display='none'">
            <div class="download-options" style="margin-top: 10px; display: flex; gap: 8px; justify-content: center;">
                <button type="button" onclick="downloadImage('${quality.url}', '${videoId}_${quality.label}.jpg')" class="download-btn" style="cursor: pointer; padding: 8px 16px; background: #ef4444; color: white; border: none; border-radius: 6px; font-weight: bold;">
                    <i class="fas fa-download"></i> Download ${quality.label}
                </button>
                <a href="${quality.url}" target="_blank" rel="noopener noreferrer" style="padding: 8px 12px; background: #e5e7eb; color: #374151; border-radius: 6px; text-decoration: none; font-size: 14px;">
                    <i class="fas fa-external-link-alt"></i> View
                </a>
            </div>
        `;
        container.appendChild(card);
    });
}

async function downloadImage(imageSrc, filename) {
    try {
        const response = await fetch(imageSrc, { mode: 'cors' });
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
    } catch (err) {
        // Fallback for CORS restricted environments
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = function () {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            canvas.toBlob(blob => {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }, 'image/jpeg', 0.95);
        };
        img.src = imageSrc;
    }
}
