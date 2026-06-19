import { H as Hls } from './hls-vendor-dru42stk.js';

var players = document.querySelectorAll('[data-video-player]');

players.forEach(function (player) {
  var video = player.querySelector('video');
  var playButton = player.querySelector('[data-play-button]');
  var status = player.querySelector('[data-player-status]');
  var source = player.getAttribute('data-src') || (video ? video.getAttribute('data-src') : '');
  var hls = null;
  var prepared = false;

  var setStatus = function (message) {
    if (status) {
      status.textContent = message || '';
    }
  };

  var prepare = function () {
    if (!video || !source || prepared) {
      return;
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        setStatus('');
      });
      hls.on(Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          setStatus('视频加载失败，请刷新页面重试');
        }
      });
      prepared = true;
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      prepared = true;
      return;
    }

    setStatus('当前浏览器暂不支持此播放格式');
  };

  var playVideo = function () {
    prepare();
    if (!video) {
      return;
    }
    var promise = video.play();
    if (promise && typeof promise.then === 'function') {
      promise.then(function () {
        player.classList.add('is-playing');
        setStatus('');
      }).catch(function () {
        setStatus('请再次点击播放按钮');
      });
    } else {
      player.classList.add('is-playing');
    }
  };

  if (playButton) {
    playButton.addEventListener('click', playVideo);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    });
    video.addEventListener('play', function () {
      player.classList.add('is-playing');
    });
    video.addEventListener('pause', function () {
      if (!video.ended) {
        player.classList.remove('is-playing');
      }
    });
  }

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
    }
  });
});
