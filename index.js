var exec = require('child_process').exec;

var pipe = false;
var map = false;

function ffplay(mapper) {
    map = mapper;
}

ffplay.remove_pipe = function (cb) {
    exec('rm -f '+pipe, function (error, stdout, stderr) {
        if (error !== null) cb('rm -f '+pipe+' exec error: ' + error);
        pipe = false;
        cb(null);
    });
}

ffplay.stop = function(cb) {
    if (!pipe) {
        cb();
        return;
    }
    ffplay.remove_pipe(function (error) {
        exec('killall ffplay', cb);
    });
};

ffplay.start = function(filename, exit) {
    var exit = exit;
    if (!pipe) {
        pipe = '/tmp/ffplaycontrol';
        ffplay.remove_pipe(function (error) {
            if (error !== null) {
                player_stopped(error)
            } else {
                pipe = '/tmp/ffplaycontrol';
                exec('mkfifo '+pipe, function (error, stdout, stderr) {
                    if (error !== null) {
                        player_stopped('mkfifo exec error: ' + error)
                    } else {
                        if (map) {
                            map(filename, start_player);
                        } else {
                            start_player(filename);
                        }
                    }
                });
            }
        });
    } else {
        console.info("Pipe already exists! Restarting...");
        ffplay.stop(function () {
            return ffplay.start(filename);
        });
    }

    function player_stopped(error) {
        if(error != null) console.error(error); 
        ffplay.stop(function(){
            if (typeof(exit) == 'function') return exit(error);
            else console.error('exit function is not defined');
        })
    }

    function start_player(filename) {
        exec('ffplay -fs -autoexit "'+filename+'" < '+pipe, function (error, stdout, stderr) {
            if (error !== null) {
                player_stopped('ffplay exec error: ' + error);
            } else {
                player_stopped(null);
            }
            
        });
        ffplay.play();
    }
};

ffplay.sendKey = function(key) {
    if (!pipe) return;
    exec('echo -n '+key+' > '+pipe);
};

ffplay.mapKey = function(command,key,then) {
    ffplay[command] = function() {
        ffplay.sendKey(key);
        if (then) {
            then();
        }
    };
};

ffplay.mapKey('pause','p');
ffplay.mapKey('quit','q',function() {
    ffplay.stop();
});
ffplay.mapKey('play','.');
ffplay.mapKey('forward',"\x5b\x43");
ffplay.mapKey('backward',"\x5b\x44");
ffplay.mapKey('next_subtitle', 't');
ffplay.mapKey('next_audio', 'a');
ffplay.mapKey('next_video', 'v');
ffplay.mapKey('full_screen', 'f');


module.exports = ffplay;
