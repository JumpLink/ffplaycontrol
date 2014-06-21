var exec = require('child_process').exec;

var pipe = false;
var map = false;

function ffplay(mapper) {
    map = mapper;
}

ffplay.stop = function(cb) {
    if (!pipe) {
        cb();
        return;
    }
    console.info('killing ffplay..');
    exec('rm -f '+pipe, function (error, stdout, stderr) {
        if (error !== null) console.error('rm exec error: ' + error);
        pipe = false;
        exec('killall ffplay', cb);
    });
};

ffplay.start = function(fn) {
    if (!pipe) {
        pipe = '/tmp/ffplaycontrol';
        exec('rm -f '+pipe, function (error, stdout, stderr) {
            if (error !== null) {
                console.error('rm exec error: ' + error);
            } else {
                exec('mkfifo '+pipe, function (error, stdout, stderr) {
                    if (error !== null) {
                        console.error('mkfifo exec error: ' + error);
                    } else {
                        if (map) {
                            map(fn,cb);
                        } else {
                            cb(fn);
                        }
                    }
                });
            }
        });
    } else {
        console.info("Pipe already exists! Restarting...");
        ffplay.stop(function () {
            return ffplay.start(fn);
        });
    }

    function cb(fn) {
        console.info(fn);
        exec('ffplay -fs "'+fn+'" < '+pipe, function (error, stdout, stderr) {
            if (error !== null) {
              console.error('ffplay exec error: ' + error);
            }
        });
        ffplay.sendKey('.') // play
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