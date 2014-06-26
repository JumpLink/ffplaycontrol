/**
 * node-simple-ffplay fork of node-simple-mplayer
 * Javascript simple mplayer wrapper for Node.js
 *
 * @author Jonathan Blanchet (@jblanchefr)
 * Copyright 2012 Jonathan Blanchet @ Lab212.
 *
 * MIT License
 */

var spawn = require('child_process').spawn,
    events = require('events'),
    util = require('util');

module.exports = function Media() {
    events.EventEmitter.call(this);
    // this.filename = filename;
};

util.inherits(module.exports, events.EventEmitter);



module.exports.prototype.start = function (filename, options) {
    this.filename = filename;
    if(!this.stopped)
        this.stop();
    this.stopped = false;
    var args = [this.filename];

    for(var prop in options) {
        if(options.hasOwnProperty(prop)){
            args.unshift('-'+prop, options[prop] );
        }
    }
    this.emit('start', filename, options); // FIXME
    this.process = spawn('ffplay', args, {stdio: [ 'ignore', 'ignore', 'ignore' ]});
    this.process.on('exit', function (code, sig) {
        this.emit('complete');
    });
    this.process.on('close', function (code, sig) {
        this.emit('complete');
    });
};

module.exports.prototype._stop = function () {
    this.stopped = true;
    if(this.process){
        this.process.kill('SIGTERM');
    }
};
module.exports.prototype.stop = function (next) {
    this._resume();
    this._stop();
    this.emit('stop');
    if(next) next(); 
};
module.exports.prototype._pause = function () {
    this.paused = true;
    if (this.stopped) return;
    if(this.process){
        this.process.kill('SIGSTOP');
    }
};
module.exports.prototype.pause = function () {
    this._pause();
    this.emit('pause');
};
module.exports.prototype._resume = function () {
    this.paused = false;
    if (this.stopped) return this.start();
    if(this.process){
        this.process.kill('SIGCONT');
    }
};
module.exports.prototype.resume = function () {
    this._resume();
    this.emit('resume');
};
module.exports.prototype.toggle_pause = function () {
    if(this.paused) this.resume();
    else this.pause(); 
};
