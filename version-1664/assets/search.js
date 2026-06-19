(function () {
  var input = document.getElementById('globalSearchInput');
  var button = document.getElementById('globalSearchButton');
  var results = document.getElementById('globalSearchResults');
  var data = window.MOVIE_SEARCH_INDEX || [];

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function render(items, query) {
    if (!results) {
      return;
    }

    if (!items.length) {
      results.innerHTML = '<p class="empty-state">没有找到匹配影片。</p>';
      return;
    }

    results.innerHTML = items.slice(0, 120).map(function (item) {
      return [
        '<a class="search-result-item" href="' + item.url + '">',
        '  <strong>' + escapeHtml(item.title) + '</strong>',
        '  <p>' + escapeHtml([item.year, item.region, item.type, item.genre, item.category].filter(Boolean).join(' · ')) + '</p>',
        '  <p>' + escapeHtml(item.oneLine || '') + '</p>',
        '</a>'
      ].join('');
    }).join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function search() {
    var query = normalize(input ? input.value : '');

    if (!query) {
      render(data.slice(0, 60), query);
      return;
    }

    var items = data.filter(function (item) {
      var haystack = normalize([
        item.title,
        item.year,
        item.region,
        item.type,
        item.genre,
        item.tags,
        item.category,
        item.oneLine
      ].join(' '));
      return haystack.indexOf(query) !== -1;
    });

    render(items, query);
  }

  if (button) {
    button.addEventListener('click', search);
  }

  if (input) {
    input.addEventListener('input', search);
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    input.value = query;
  }

  search();
})();
