// Загрузка редактируемых текстов сайта из Supabase (таблица site_content).
// Тексты в HTML — это текст "по умолчанию": если запрос не удался (нет сети,
// таблица ещё не создана и т.п.), на странице просто останется то, что уже
// написано в разметке. Значения из базы аккуратно подставляются поверх него
// после загрузки, поэтому мигания/пустых мест не будет.
//
// Кроме простых текстовых полей (data-content-key), есть повторяющиеся блоки
// (FAQ, преимущества, шаги бронирования, карточки подарка, посты Instagram),
// где из админки можно добавлять/удалять/переставлять пункты, а не только
// редактировать существующий текст. Их содержимое хранится в site_content
// как JSON-массив под отдельным ключом (см. LIST_BLOCKS ниже) и полностью
// перерисовывает контейнер — если ключа нет или он пуст, остаётся статичная
// разметка по умолчанию.
(function(){
  var SUPABASE_URL = 'https://wbcsetdfwwkwnehiodjd.supabase.co';
  var SUPABASE_ANON_KEY = 'sb_publishable_pMfUWEpLctVpXYubG4SNmg_vF4plRIn';

  if (!window.supabase || !window.supabase.createClient) return;
  var sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Небольшой набор готовых иконок для карточек преимуществ — их выбирают
  // из выпадающего списка в админке, а не рисуют вручную.
  var ADV_ICONS = {
    guests: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="8" r="3" stroke="currentColor" stroke-width="1.4"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><circle cx="17" cy="9" r="2.4" stroke="currentColor" stroke-width="1.4"/><path d="M14.5 20c.3-2.6 2.1-4.6 4.5-4.9" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
    link: '<svg width="30" height="30" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="12" r="6.5" stroke="currentColor" stroke-width="1.3"/><circle cx="15" cy="12" r="6.5" stroke="currentColor" stroke-width="1.3"/></svg>',
    leaf: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2c2.2 4.2 4.4 5.4 4.4 9.6a4.4 4.4 0 01-8.8 0C7.6 7.4 9.8 6.2 12 2z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>',
    wheel: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M12 3v14M8.5 6.5h7M4 12.5a8 8 0 0016 0" stroke="currentColor" stroke-width="1" fill="none" stroke-linecap="round"/></svg>',
    anchor: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M12 3v14M8 7h8M5 12.5a7 7 0 0014 0M12 17v4M9 21h6" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round"/></svg>',
    clock: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.3"/><path d="M12 7v5l3.5 2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
    calendar: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3.5" y="5" width="17" height="15" rx="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M3.5 9.5h17M8 3v3.5M16 3v3.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
    star: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 3l2.6 5.9 6.4.6-4.8 4.3 1.4 6.3L12 16.9 6.4 20.1l1.4-6.3-4.8-4.3 6.4-.6L12 3z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>'
  };

  function el(tag, className, html){
    var e = document.createElement(tag);
    if (className) e.className = className;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }
  function text(tag, className, str){
    var e = document.createElement(tag);
    if (className) e.className = className;
    e.textContent = str || '';
    return e;
  }

  function renderFAQ(container, items){
    container.innerHTML = '';
    items.forEach(function(item, i){
      var d = document.createElement('details');
      d.className = 'faq-item reveal in';
      if (i === 0) d.open = true;
      var summary = document.createElement('summary');
      summary.appendChild(text('span', null, item.q));
      summary.appendChild(el('span', 'plus'));
      d.appendChild(summary);
      d.appendChild(text('p', null, item.a));
      container.appendChild(d);
    });
  }

  function renderAdvantages(container, items){
    container.innerHTML = '';
    items.forEach(function(item){
      var wrap = el('div', 'adv-item reveal in');
      var figure = el('div', 'adv-figure');
      figure.appendChild(el('span', 'adv-icon', ADV_ICONS[item.icon] || ADV_ICONS.star));
      wrap.appendChild(figure);
      wrap.appendChild(text('h3', null, item.title));
      wrap.appendChild(text('p', null, item.desc));
      container.appendChild(wrap);
    });
  }

  function renderProcess(container, items){
    container.innerHTML = '';
    items.forEach(function(item, i){
      var wrap = el('div', 'process-item reveal in');
      wrap.appendChild(text('span', 'process-num', String(i + 1)));
      wrap.appendChild(text('h3', null, item.title));
      wrap.appendChild(text('p', null, item.desc));
      container.appendChild(wrap);
    });
  }

  function renderGift(container, items){
    container.innerHTML = '';
    items.forEach(function(item){
      var wrap = el('div', 'gift-card reveal in');
      wrap.appendChild(text('span', 'gift-card-icon', item.icon));
      wrap.appendChild(text('h3', null, item.title));
      wrap.appendChild(text('p', null, item.desc));
      container.appendChild(wrap);
    });
  }

  function renderInstagram(container, items){
    container.innerHTML = '';
    items.forEach(function(item){
      var card = el('div', 'insta-card');
      var wrap = el('div', 'insta-embed-wrap');
      var bq = document.createElement('blockquote');
      bq.className = 'instagram-media';
      bq.setAttribute('data-instgrm-permalink', item.url);
      bq.setAttribute('data-instgrm-version', '14');
      wrap.appendChild(bq);
      card.appendChild(wrap);
      container.appendChild(card);
    });
    // Разметку подменили уже после того, как embed.js мог успеть один раз
    // обработать страницу (или ещё не успел) — просим его переобработать
    // блокquote'ы заново, как только скрипт будет готов.
    function reprocess(){ if (window.instgrm && window.instgrm.Embeds) window.instgrm.Embeds.process(); }
    if (window.instgrm) reprocess();
    else window.addEventListener('load', function(){ setTimeout(reprocess, 300); });
  }

  // ключ в site_content -> { id контейнера в разметке, функция рендера }
  var LIST_BLOCKS = {
    faq_items: { id: 'faqList', render: renderFAQ },
    adv_items: { id: 'advGrid', render: renderAdvantages },
    process_items: { id: 'processGrid', render: renderProcess },
    gift_items: { id: 'giftGrid', render: renderGift },
    instagram_posts: { id: 'instaScroller', render: renderInstagram }
  };

  sb.from('site_content').select('key,value').then(function(res){
    if (!res || res.error || !res.data) return;
    var map = {};
    res.data.forEach(function(row){ map[row.key] = row.value; });

    document.querySelectorAll('[data-content-key]').forEach(function(elm){
      var key = elm.getAttribute('data-content-key');
      if (Object.prototype.hasOwnProperty.call(map, key) && map[key] !== ''){
        elm.textContent = map[key];
      }
    });

    // Ссылки на соцсети (Instagram, TikTok, Telegram, Viber и т.п.) — в разметке
    // по умолчанию такие иконки скрыты (style="display:none"), пока для них нет
    // настоящей ссылки. Показываем иконку только если в админке сохранена
    // непустая ссылка — так никогда не остаётся нерабочая "#".
    document.querySelectorAll('[data-content-href]').forEach(function(elm){
      var key = elm.getAttribute('data-content-href');
      var val = (map[key] || '').trim();
      if (val){
        elm.setAttribute('href', val);
        elm.style.display = '';
      } else {
        elm.style.display = 'none';
      }
    });

    Object.keys(LIST_BLOCKS).forEach(function(key){
      var raw = map[key];
      if (!raw) return; // ключа ещё нет — оставляем статичную разметку по умолчанию
      var items;
      try { items = JSON.parse(raw); } catch (e) { return; }
      if (!Array.isArray(items) || items.length === 0) return;
      var block = LIST_BLOCKS[key];
      var container = document.getElementById(block.id);
      if (!container) return;
      block.render(container, items);
    });
  }).catch(function(){ /* оставляем текст по умолчанию из HTML */ });
})();
