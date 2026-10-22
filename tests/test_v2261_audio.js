// Node-only simulated lifecycle regression for iOS Scriptable WebAudio recovery.
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const src=fs.readFileSync(path.join(__dirname,'../src/browser/v2261-audio-recovery.js'),'utf8');
const stub=