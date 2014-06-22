ffplaycontrol
==========

Nodejs module to control [ffplay](https://www.ffmpeg.org/ffplay.html), like [omxcontrol](https://github.com/dplesca/omxcontrol) for omxplayer.

Requirements
------------

* ffplay (included in [ffmpeg](http://www.ffmpeg.org/))
* nodejs (`apt-get install nodejs`)

Install
-------

    npm install ffplaycontrol

Usage
-----

Basic usage
    
    ffplay = require('ffplaycontrol');

    ffplay.start(filename);

    ffplay.pause();

    ffplay.quit();

`ffplay()` can be passed a mapping function to map the filename to something else. Calling the provided start method is required to actually start the video. Your logic can be async and even choose not to start things:

    ffplay = require('ffplaycontrol');
    ffplay(function(fn,start) {
        //do something special
        start(fn);
    });
