// Real-time Text Updates
document.getElementById('input-headline').addEventListener('input', (e) => {
  document.getElementById('preview-headline').textContent = e.target.value || 'Headline';
});

document.getElementById('input-subtext').addEventListener('input', (e) => {
  document.getElementById('preview-subtext').textContent = e.target.value || '';
});

document.getElementById('input-cta').addEventListener('input', (e) => {
  document.getElementById('preview-cta').textContent = e.target.value || '';
});

// Real-time Image Upload
document.getElementById('input-image').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(event) {
      document.getElementById('preview-img').src = event.target.result;
    };
    reader.readAsDataURL(file);
  }
});

// Export preview to PNG
document.getElementById('download-btn').addEventListener('click', () => {
  const canvasElement = document.getElementById('tiktok-canvas');
  
  html2canvas(canvasElement, { scale: 2 }).then((canvas) => {
    const link = document.createElement('a');
    link.download = 'tiktok-3d-post.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  });
});
