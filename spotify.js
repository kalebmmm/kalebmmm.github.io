// Get the hash of the url
const hash = window.location.hash
  .substring(1)
  .split('&')
  .reduce(function (initial, item) {
    if (item) {
      var parts = item.split('=');
      initial[parts[0]] = decodeURIComponent(parts[1]);
    }
    return initial;
  }, {});
window.location.hash = '';

// Set token
let _token = hash.access_token;
let device_id = null;
let tracks = null;

const authEndpoint = 'https://accounts.spotify.com/authorize';

// Replace with your app's client ID, redirect URI and desired scopes
const clientId = 'cbffa8440e094e8d9771b39aed0d7802';
const redirectUri = 'https://kaleb.win';
const scopes = [
  'streaming',
  'user-read-private',
  'user-modify-playback-state',
  'playlist-read-collaborative',
  'playlist-read-private'
];

// If there is no token, redirect to Spotify authorization
if (!_token)
  window.location = `${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join('%20')}&response_type=token&show_dialog=true`;

// Set up the Web Playback SDK

window.onSpotifyPlayerAPIReady = () => {
  const player = new Spotify.Player({
    name: 'Church Player',
    getOAuthToken: cb => { cb(_token); }
  });

  // Error handling
  player.on('initialization_error', e => console.error(e));
  player.on('authentication_error', e => console.error(e));
  player.on('account_error', e => console.error(e));
  player.on('playback_error', e => console.error(e));

  // Playback status updates
  player.on('player_state_changed', state => {
    $('#current-track-img').attr('src', state.track_window.current_track.album.images[0].url);
    $('#current-track-name').text(state.track_window.current_track.name);
    $('#current-album-name').text(state.track_window.current_track.album.name);
    $('#current-artist-name').text('By ' + state.track_window.current_track.artists.map(obj => obj.name).join(', '));
  });

  // Ready
  player.on('ready', data => {
    device_id = data.device_id;
    console.log('Ready with Device ID', data.device_id);
    getPlaylists();
  });

  player.connect();
}

// Play a specified track on the Web Playback SDK's device ID
function play(device_id, uris) {
  $.ajax({
    url: "https://api.spotify.com/v1/me/player/play?device_id=" + device_id,
    type: "PUT",
    data: JSON.stringify(uris),
    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + _token); },
  });
}

function getPlaylists() {
  $.ajax({
    url: "https://api.spotify.com/v1/me/playlists",
    type: "GET",
    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + _token); },
    success: function (data) {
      let items = data.items;

      for (let i = 0; i < items.length; i++) {
        let item = items[i];
        $('#playlist').append(`<option value="${item.id}">${item.name}</option>`);
      }
    }
  });
}

function getTracks(playlist) {
  $.ajax({
    url: `https://api.spotify.com/v1/playlists/${playlist}/tracks`,
    type: "GET",
    beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + _token); },
    success: function (data) {
      tracks = data.items.map(item => item.track);
      console.log(tracks);
    }
  });
};

function loadPlaylist(playlist) {
  getTracks(playlist);
}

function startPlayer(endTime) {
  shuffle(tracks);
  let list = bestList(tracks, endTime - new Date());
  shuffle(list);

  let length = list.map(song => song.duration_ms).reduce((a, b) => a + b)
  console.log('Real end time: ' + (new Date().getTime() + length));
  console.log('Requested end time: ' + (endTime))
  console.log('Diff: ' + (Math.abs((new Date().getTime() + length) - endTime)))

  let songs = list.map(song => new String(song.uri));
  let uris = { "uris": songs };
  play(device_id, uris);



  let tbody = $('#playlist_display tbody');
  tbody.empty();

  for (let i = 0; i < list.length; i++) {
    let song = list[i];
    let artists = song.artists.map(obj => obj.name).join(', ');
    tbody.append(`<tr><td>${song.name}</td><td>${artists}</td><td>${song.album.name}</td><td>${new Date(song.duration_ms).toISOString().slice(11, 19)}</td></tr>`);
  }

  $("#playlist_display").removeClass('hidden');
}

function shuffle(array) {
  array.sort(() => Math.random() - 0.5);
}
