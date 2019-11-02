const error = 5_000;

let bestList = (avaliable, time) => {
    if (avaliable.length === 0 || Math.abs(time) <= error)
        return new Array();

    if (time < -error)
        return null;

    for (let i = 0; i < avaliable.length; i++) {
        const song = avaliable[i];
        let newList = avaliable.slice(0);
        newList.splice(newList.indexOf(song), 1);
        newList = bestList(newList, time - song.duration_ms);

        if (newList != null) {
            newList.push(song);
            return newList;
        }
    }

    return null;
}