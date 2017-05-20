$(function(){

  var REGIONS = ['北海道','青森県','岩手県','宮城県','秋田県',
  '山形県','福島県','茨城県','栃木県','群馬県','埼玉県','千葉県',
  '東京都','神奈川県','新潟県','富山県','石川県','福井県','山梨県',
  '長野県','岐阜県','静岡県','愛知県','三重県','滋賀県','京都府',
  '大阪府','兵庫県','奈良県','和歌山県','鳥取県','島根県','岡山県',
  '広島県','山口県','徳島県','香川県','愛媛県','高知県','福岡県',
  '佐賀県','長崎県','熊本県','大分県','宮崎県','鹿児島県','沖縄県'
  ];

  var CHARACTERS = [
    {
      id: 'anakaris',
      name: 'アナカリス',
      image: 'img_s_anakaris_50x50.jpg'
    }, {
      id: 'aulbath',
      name: 'オルバス',
      image: 'img_s_aulbath_50x50.jpg'
    }, {
      id: 'bishamon',
      name: 'ビシャモン',
      image: 'img_s_bishamon_50x50.jpg'
    }, {
      id: 'bulleta',
      name: 'バレッタ',
      image: 'img_s_bulleta_50x50.jpg'
    }, {
      id: 'demitri',
      name: 'デミトリ',
      image: 'img_s_demitri_50x50.jpg'
    }, {
      id: 'felicia',
      name: 'フェリシア',
      image: 'img_s_felicia_50x50.jpg'
    }, {
      id: 'gallon',
      name: 'ガロン',
      image: 'img_s_gallon_50x50.jpg'
    }, {
      id: 'jedah',
      name: 'ジェダ',
      image: 'img_s_jedah_50x50.jpg'
    }, {
      id: 'leilei',
      name: 'レイレイ',
      image: 'img_s_leilei_50x50.jpg'
    }, {
      id: 'lilith',
      name: 'リリス',
      image: 'img_s_lilith_50x50.jpg'
    }, {
      id: 'morrigan',
      name: 'モリガン',
      image: 'img_s_morrigan_50x50.jpg'
    }, {
      id: 'qbee',
      name: 'キュービー',
      image: 'img_s_qbee_50x50.jpg'
    }, {
      id: 'sasquatch',
      name: 'サスカッチ',
      image: 'img_s_sasquatch_50x50.jpg'
    }, {
      id: 'victor',
      name: 'ビクトル',
      image: 'img_s_victor_50x50.jpg'
    }, {
      id: 'zabel',
      name: 'ザベル',
      image: 'img_s_zabel_50x50.jpg'
    }
  ];

  // ハッシュ作成
  var charas = {}
  for (var i = 0, len = CHARACTERS.length; i < len; i++) {
    var chara = CHARACTERS[i];
    charas[chara.id] = {
      name: chara.name,
      image: chara.image
    };
  }

  // firebase
  var ref = new Firebase("https://ddf.firebaseio.com/02/");
  var teamsRef = ref.child('teams');
  var singlesRef = ref.child('singles');

  // 設定
  var configRef = ref.child('config');
  var config;
  configRef.child('open');
  configRef.once('value', function(snapshot) {
    config = snapshot.val();
    if (!config) {
      config = {
        open: true,
        adminPass: 'd3a6d490ae9d4f9453629159b7a26794'
      }
      configRef.set(config);
    }
    configUpdated(config);
    configRef.on('value', function(snapshot) {
      config = snapshot.val();
      configUpdated(config);
    });
  });

  function configUpdated(config) {
    $('.status').show();
    if (config.open) {
      $('.status').removeClass('alert-warning').addClass('alert-success');
      $('.status-text').text('只今エントリー受付中');
      $('.start').hide();
      $('.stop').show();
    } else {
      $('.status').removeClass('alert-success').addClass('alert-warning');
      $('.status-text').text('エントリー受付停止中');
      $('.start').show();
      $('.stop').hide();
    }
  }

  $('.start').on('click', function(e) {
    e.preventDefault();
    config.open = true;
    configRef.set(config);
  });
  $('.stop').on('click', function(e) {
    e.preventDefault();
    config.open = false;
    configRef.set(config);
  });



  // 追加
  var teams = [];
  teamsRef.on('child_added', function(snapshot) {
    var team = snapshot.val();
    var key = snapshot.key();
    team.key = key;
    teams.push(team);
    teamUpdated(team);
  });
  var singles = [];
  singlesRef.on('child_added', function(snapshot) {
    var single = snapshot.val();
    var key = snapshot.key();
    single.key = key;
    singles.push(single);
    singleUpdated(single);
  });

  // 削除
  teamsRef.on('child_removed', function(snapshot) {
    var key = snapshot.key();
    for (var i = 0, len = teams.length; i < len; i++) {
      if (teams[i].key === key) {
        teams.splice(i, 1);
        break;
      }
    }
    teamUpdated();
  });
  singlesRef.on('child_removed', function(snapshot) {
    var key = snapshot.key();
    for (var i = 0, len = singles.length; i < len; i++) {
      if (singles[i].key === key) {
        singles.splice(i, 1);
        break;
      }
    }
    singleUpdated();
  });

  // 変更
  teamsRef.on('child_changed', function(snapshot, old) {
    var team = snapshot.val();
    var key = snapshot.key();
    team.key = key;
    for (var i = 0, len = teams.length; i < len; i++) {
      if (teams[i].key === key) {
        teams[i] = team;
        break;
      }
    }
    teamUpdated(team);
  });
  singlesRef.on('child_changed', function(snapshot, old) {
    var single = snapshot.val();
    var key = snapshot.key();
    single.key = key;
    for (var i = 0, len = singles.length; i < len; i++) {
      if (singles[i].key === key) {
        singles[i] = single;
        break;
      }
    }
    singleUpdated(single);
  });

  function teamUpdated(team) {
    $('.team-entry-count').text(teams.length);
    if (team) {
      if (team.updatedAt) {
        $('.team-last-updated-at').text(getDateString(team.updatedAt));
      }
    } else {
      $('.team-last-updated-at').text(getDateString());
    }
  }
  function singleUpdated(single) {
    $('.single-entry-count').text(singles.length);
    if (single) {
      if (single.updatedAt) {
        $('.single-last-updated-at').text(getDateString(single.updatedAt));
      }
    } else {
      $('.single-last-updated-at').text(getDateString());
    }
  }

  function getDateString(date) {
    if (date === undefined) {
      date = new Date();
    } else if (typeof date === 'string' && date.length !== 0) {
      date = new Date(date);
    }
    if (date) {
      return date.getFullYear() + '/' +
             padLeft(date.getMonth() + 1) + '/' +
             padLeft(date.getDate()) + ' ' +
             padLeft(date.getHours()) + ':' +
             padLeft(date.getMinutes()) + ':' +
             padLeft(date.getSeconds());
    } else {
      return '';
    }
  }
  function padLeft(str, len, pad) {
    if (pad === undefined) {
      pad = '0';
    }
    if (len === undefined) {
      len = 2;
    }
    var buf = ''
    for (var i = 0; i < len; i++) {
      buf += pad;
    }
    str = pad + str;
    return str.slice(-len);
  }

  function getFormData() {
    // must inputs
    var data = {
      password: md5($('#pass').val()),
      members: [
        {
          name: $('#member1-name').val(),
          character: $('#member1-character').val(),
          comment: $('#member1-comment').val().replace(/[\n\r]/g, ''),
          region: $('#member1-region').val(),
          home: $('#member1-home').val(),
          after: $('input[name=member1-after]:checked').val() || ''
        }
      ]
    }
    if ($('#type-team').prop('checked')) {
      // チーム名、2人目
      data.name = $('#teamName').val();
      data.members.push({
        name: $('#member2-name').val(),
        character: $('#member2-character').val(),
        comment: $('#member2-comment').val().replace(/[\n\r]/g, ''),
        region: $('#member2-region').val(),
        home: $('#member2-home').val(),
        after: $('input[name=member2-after]:checked').val() || ''
      });
    }
    return data;
  }

  function setFormData(entry, key) {
    $('#key').val(key || '');

    $('#member1-name').val(entry.members[0].name);
    $('#member1-character').val(entry.members[0].character);
    $('#member1-comment').val(entry.members[0].comment);
    $('#member1-region').val(entry.members[0].region);
    $('#member1-home').val(entry.members[0].home);
    var after1 = entry.members[0].after;
    if (after1) {
      if (after1 == 1) {
        $('#member1-join-ok').prop('checked', true);
      } else {
        $('#member1-join-ng').prop('checked', true);
      }
    }

    if (entry.name && entry.name.length !== 0) {
      $('#type-team').prop('checked', true).trigger('change');

      $('#teamName').val(entry.name);
      $('#member2-name').val(entry.members[1].name);
      $('#member2-character').val(entry.members[1].character);
      $('#member2-comment').val(entry.members[1].comment);
      $('#member2-region').val(entry.members[1].region);
      $('#member2-home').val(entry.members[1].home);
      var after2 = entry.members[1].after;

      if (after2) {
        if (after2 == 1) {
          $('#member2-join-ok').prop('checked', true);
        } else {
          $('#member2-join-ng').prop('checked', true);
        }
      }
    } else {
      $('#type-single').prop('checked', true).trigger('change');
    }
  }

  var BOM = '\ufeff';
  $('#teams-output-utf8').on('click', function(e) {
    $(this).prop('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(BOM + createTeamsData()));
  });
  $('#teams-output-sjis').on('click', function(e) {
    $(this).prop('href', 'data:text/plain;charset=sjis,' + EscapeSJIS(createTeamsData()));
  });
  $('#singles-output').on('click', function(e) {
    $(this).prop('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(BOM + createSinglesData()));
  });
  $('#singles-output-sjis').on('click', function(e) {
    $(this).prop('href', 'data:text/plain;charset=sjis,' + EscapeSJIS(createSinglesData()));
  });

  function createTeamsData() {
    var rowHeader = [
      'チーム名',
      '1:プレイヤー名',
      '1:使用キャラ',
      '1:コメント',
      '1:棲息地域',
      '1:出没場所',
      '1:打ち上げ',
      '1:前夜祭',
      '2:プレイヤー名',
      '2:使用キャラ',
      '2:コメント',
      '2:棲息地域',
      '2:出没場所',
      '2:打ち上げ',
      '2:前夜祭',
      '更新日時'
    ];
    var rows = [];
    rows.push(rowHeader);
    for (var i = 0, len = teams.length; i < len; i++) {
      var team = teams[i];
      var columns = [];
      columns.push(team.name || '');
      columns.push(team.members[0].name || '');
      columns.push(charas[team.members[0].character].name);
      columns.push(team.members[0].comment || '');
      columns.push(REGIONS[parseInt(team.members[0].region, 10) - 1] || '');
      columns.push(team.members[0].home || '');
      columns.push(team.members[0].after || '');
      columns.push(team.members[0].eve || '');
      columns.push(team.members[1].name || '');
      columns.push(charas[team.members[1].character].name);
      columns.push(team.members[1].comment || '');
      columns.push(REGIONS[parseInt(team.members[1].region, 10) - 1] || '');
      columns.push(team.members[1].home || '');
      columns.push(team.members[1].after || '');
      columns.push(team.members[1].eve || '');
      columns.push(getDateString(team.updatedAt));
      rows.push(columns);
    }

    // parse
    var lines = [];
    for (var i = 0, len = rows.length; i < len; i++) {
      lines.push('"' + rows[i].join('","') + '"');
    }
    return lines.join('\n');
  }
  function createSinglesData() {
    var rowHeader = [
      'プレイヤー名',
      '使用キャラ',
      'コメント',
      '棲息地域',
      '出没場所',
      '打ち上げ',
      '前夜祭',
      '更新日時'
    ];
    var rows = [];
    rows.push(rowHeader);
    for (var i = 0, len = singles.length; i < len; i++) {
      var single = singles[i];
      var columns = [];
      columns.push(single.members[0].name || '');
      columns.push(charas[single.members[0].character].name);
      columns.push(single.members[0].comment || '');
      columns.push(REGIONS[parseInt(single.members[0].region, 10) - 1] || '');
      columns.push(single.members[0].home || '');
      columns.push(single.members[0].after || '');
      columns.push(single.members[0].eve || '');
      columns.push(getDateString(single.updatedAt));
      rows.push(columns);
    }

    // parse
    var lines = [];
    for (var i = 0, len = rows.length; i < len; i++) {
      lines.push('"' + rows[i].join('","') + '"');
    }
    return lines.join('\n');
  }

  // login
  $('#login-button').on('click', function(e) {
    e.preventDefault();
    if ( config.adminPass === md5($('#admin-pass').val())) {
      $('.login').hide();
      $('.page').show();
    } else {
      $('.login-message').addClass('alert-danger').text('パスワードが違います').show();
    }
  })
});