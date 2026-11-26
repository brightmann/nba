(function () {
  // Public blog homepage. Reads posts from the nbb API, shows only published posts.
  var API = 'https://nbb.brightmann.workers.dev';
  var PER_PAGE = 5; // posts per page
  var EMBED_HOSTS = /^https:\/\/([a-z0-9-]+\.)*(youtube\.com|youtube-nocookie\.com|youku\.com|videa\.hu|vimeo\.com|player\.vimeo\.com)\//i;
  var app = document.getElementById('app');

  // Google sign-in returns to the site root with ?code=...; hand it to the admin panel.
  if (location.pathname === '/' && /[?&]code=/.test(location.search)) {
    location.replace('/admin/' + location.search);
    return;
  }

  DOMPurify.addHook('uponSanitizeElement', function (node, data) {
    if (data.tagName === 'iframe' && !EMBED_HOSTS.test(node.getAttribute('src') || '')) {
      node.parentNode && node.parentNode.removeChild(node);
    }
  });
  function clean(html) {
    return DOMPurify.sanitize(html, {
      ADD_TAGS: ['iframe'],
      ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'referrerpolicy', 'target'],
      FORBID_TAGS: ['form', 'script', 'style'],
    });
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }
  function fmt(d) {
    var x = new Date(d);
    return isNaN(x) ? '' : x.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }
  function excerpt(content) {
    var tmp = document.createElement('div');
    tmp.innerHTML = clean(marked.parse(String(content || '')));
    var t = (tmp.textContent || '').replace(/\s+/g, ' ').trim();
    return t.length > 160 ? t.slice(0, 160) + '…' : t;
  }
  function getJSON(path) {
    return fetch(API + path).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
  }
  function published(list) {
    return list.filter(function (p) { return p.published === true; })
      .sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
  }

  function renderList(page) {
    getJSON('/posts').then(function (all) {
      var posts = published(all);
      var pages = Math.max(1, Math.ceil(posts.length / PER_PAGE));
      if (page < 1 || page > pages) { renderMsg('Page not found.'); return; }
      document.title = 'Blog';
      var items = posts.slice((page - 1) * PER_PAGE, page * PER_PAGE).map(function (p) {
        var ex = excerpt(p.content);
        return '<div class="post-item"><h2><a href="/post/' + encodeURIComponent(p.id) + '">' + esc(p.title) + '</a></h2>' +
          '<div class="muted">' + fmt(p.createdAt) + (p.category && p.category.name ? ' · ' + esc(p.category.name) : '') + '</div>' +
          (ex ? '<p class="excerpt">' + esc(ex) + '</p>' : '') + '</div>';
      }).join('');
      if (!posts.length) items = '<p class="muted">No posts yet.</p>';
      var prev = page > 1 ? '<a href="' + (page === 2 ? '/' : '/page/' + (page - 1)) + '">← Newer</a>' : '<span class="dis">← Newer</span>';
      var next = page < pages ? '<a href="/page/' + (page + 1) + '">Older →</a>' : '<span class="dis">Older →</span>';
      app.innerHTML = items + (pages > 1 ? '<div class="pager">' + prev + '<span class="muted">Page ' + page + ' of ' + pages + '</span>' + next + '</div>' : '');
    }).catch(function () { renderMsg('Could not load posts. Please try again.'); });
  }

  function renderPost(id) {
    getJSON('/posts/' + encodeURIComponent(id)).then(function (p) {
      if (!p || !p.id || p.published !== true) { renderMsg('Post not found.'); return; }
      document.title = p.title + ' - Blog';
      app.innerHTML = '<article><h1>' + esc(p.title) + '</h1><div class="muted">' + fmt(p.createdAt) +
        (p.category && p.category.name ? ' · ' + esc(p.category.name) : '') + '</div>' +
        '<div class="content">' + clean(marked.parse(String(p.content || ''))) + '</div></article>' +
        '<p><a href="/">← All posts</a></p>';
    }).catch(function () { renderMsg('Could not load the post. Please try again.'); });
  }
  function renderMsg(m) { app.innerHTML = '<p class="muted">' + esc(m) + '</p><p><a href="/">← Home</a></p>'; }

  var path = location.pathname.replace(/\/+$/, '') || '/';
  var m;
  if (path === '/') renderList(1);
  else if ((m = path.match(/^\/page\/(\d+)$/))) renderList(parseInt(m[1], 10));
  else if ((m = path.match(/^\/post\/([^/]+)$/))) renderPost(decodeURIComponent(m[1]));
  else renderMsg('Page not found.');
})();
