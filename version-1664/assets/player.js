(function () {
  var shell = document.querySelector('[data-video-shell]');
  var startButton = document.querySelector('[data-video-start]');
  var video = document.getElementById('videoPlayer');

  if (!shell || !startButton || !video) {
    return;
  }

  function playVideo() {
    var source = video.getAttribute('data-src');

    if (!source) {
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {
          video.controls = true;
        });
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.addEventListener('loadedmetadata', function () {
        video.play().catch(function () {
          video.controls = true;
        });
      }, { once: true });
    } else {
      video.src = source;
      video.play().catch(function () {
        video.controls = true;
      });
    }

    shell.classList.add('is-playing');
  }

  startButton.addEventListener('click', playVideo);
})();
