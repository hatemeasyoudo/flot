// Загрузка редактируемых текстов сайта из Supabase (таблица site_content).
// Тексты в HTML — это текст "по умолчанию": если запрос не удался (нет сети,
// таблица ещё не создана и т.п.), на странице просто останется то, что уже
// написано в разметке. Значения из базы аккуратно подставляются поверх него
// после загрузки, поэтому мигания/пустых мест не будет.
(function(){
  var SUPABASE_URL = 'https://wbcsetdfwwkwnehiodjd.supabase.co';
  var SUPABASE_ANON_KEY = 'sb_publishable_pMfUWEpLctVpXYubG4SNmg_vF4plRIn';

  if (!window.supabase || !window.supabase.createClient) return;
  var sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  sb.from('site_content').select('key,value').then(function(res){
    if (!res || res.error || !res.data) return;
    var map = {};
    res.data.forEach(function(row){ map[row.key] = row.value; });
    document.querySelectorAll('[data-content-key]').forEach(function(el){
      var key = el.getAttribute('data-content-key');
      if (Object.prototype.hasOwnProperty.call(map, key) && map[key] !== ''){
        el.textContent = map[key];
      }
    });
  }).catch(function(){ /* оставляем текст по умолчанию из HTML */ });
})();
