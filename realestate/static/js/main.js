// Bootstrap handles navigation, alerts, and inquiry dialogs.
// Card hover and focus styles are kept in CSS to avoid layout shifts.
document.querySelectorAll('.year').forEach(function (element) {
  element.textContent = new Date().getFullYear();
});

(function () {
  var links = Array.from(document.querySelectorAll('[data-gallery-photo]'));
  var dialog = document.querySelector('.property-gallery');
  if (!links.length || !dialog || typeof dialog.showModal !== 'function') return;
  var photo = dialog.querySelector('.gallery-image');
  var status = dialog.querySelector('.gallery-status');
  var thumbnails = dialog.querySelector('.gallery-thumbnails');
  var index = 0;
  var opener;
  var previousOverflow;
  var requestId = 0;
  var closeTimer;
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  function closeGallery() {
    if (!dialog.open || dialog.classList.contains('is-closing')) return;
    requestId++;
    if (reducedMotion.matches) {
      dialog.close();
      return;
    }
    dialog.classList.add('is-closing');
    // Fallback also closes the dialog if animation events are unavailable.
    closeTimer = window.setTimeout(function () { dialog.close(); }, 240);
  }
  dialog.addEventListener('animationend', function (event) {
    if (event.target === dialog && event.animationName === 'gallery-close') dialog.close();
  });
  function showPhoto(next) {
    if (dialog.classList.contains('is-closing')) return;
    index = (next + links.length) % links.length;
    var link = links[index];
    var token = ++requestId;
    photo.hidden = true;
    status.textContent = 'Loading photo…';
    dialog.querySelector('.gallery-title').textContent = link.dataset.caption;
    dialog.querySelector('.gallery-count').textContent = 'Photo ' + (index + 1) + ' of ' + links.length;
    Array.from(thumbnails.children).forEach(function (button, position) {
      button.setAttribute('aria-pressed', String(position === index));
    });
    thumbnails.children[index].scrollIntoView({ block: 'nearest', inline: 'nearest' });
    var loading = new Image();
    loading.onload = function () {
      if (token !== requestId) return;
      photo.src = loading.src;
      photo.alt = link.dataset.caption + ' — photo ' + (index + 1);
      photo.hidden = false;
      status.textContent = '';
    };
    loading.onerror = function () {
      if (token === requestId) status.textContent = 'This photo could not be loaded. Please try another photo.';
    };
    loading.src = link.dataset.photoSrc;
  }
  links.forEach(function (link, position) {
    var button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', 'View photo ' + (position + 1));
    var preview = document.createElement('img');
    preview.src = link.dataset.photoSrc;
    preview.alt = '';
    preview.loading = 'lazy';
    button.appendChild(preview);
    button.addEventListener('click', function () { showPhoto(position); });
    thumbnails.appendChild(button);
    link.addEventListener('click', function (event) {
      event.preventDefault();
      opener = link;
      previousOverflow = document.body.style.overflow;
      window.clearTimeout(closeTimer);
      dialog.classList.remove('is-closing');
      dialog.showModal();
      document.body.style.overflow = 'hidden';
      showPhoto(position);
      dialog.querySelector('.gallery-close').focus();
    });
  });
  dialog.querySelector('.gallery-prev').hidden = links.length < 2;
  dialog.querySelector('.gallery-next').hidden = links.length < 2;
  dialog.querySelector('.gallery-prev').addEventListener('click', function () { showPhoto(index - 1); });
  dialog.querySelector('.gallery-next').addEventListener('click', function () { showPhoto(index + 1); });
  dialog.querySelector('.gallery-close').addEventListener('click', closeGallery);
  dialog.addEventListener('click', function (event) { if (event.target === dialog) closeGallery(); });
  dialog.addEventListener('cancel', function (event) {
    event.preventDefault();
    closeGallery();
  });
  dialog.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      showPhoto(index + (event.key === 'ArrowLeft' ? -1 : 1));
    }
  });
  dialog.addEventListener('close', function () {
    window.clearTimeout(closeTimer);
    dialog.classList.remove('is-closing');
    requestId++;
    document.body.style.overflow = previousOverflow;
    if (opener) opener.focus();
  });
})();
