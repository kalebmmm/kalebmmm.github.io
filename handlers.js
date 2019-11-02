$('#playlist_load_button').on('click', event => {
    $('#playlist').removeClass('is-invalid');
    $('#playlist').removeClass('is-valid');

    if ($('#playlist').val() === null) {
        $('#playlist').addClass('is-invalid');
    } else {
        $('#playlist').addClass('is-valid');
        loadPlaylist($('#playlist').children('option:selected').val());
    }
});

$('#start_playing').on('click', event => {
    $('#time').removeClass('is-invalid');
    $('#time').removeClass('is-valid');

    if ($('#time').val() === "" || tracks === null) {
        $('#time').addClass('is-invalid');
    } else {
        let date = new Date();
        let time = $('#time').val().split(':');
        date.setHours(time[0]);
        date.setMinutes(time[1]);
        date.setSeconds(0);

        if (date < new Date()) {
            $('#time').addClass('is-invalid');
            return;
        }

        $('#time').addClass('is-valid');
        startPlayer(date);
    }
});