const IS_DEMO = true;

const PROJECT_MODE = 1; // 0 is synth, 1 is socket from device audio

const colorPalette = [
    {
        start: [46, 38, 38], // #2E2626
        stop: [252, 207, 204] // #FCCFCC
    },
    {
        start: [46, 27, 7], // #2E1B07
        stop: [252, 146, 38] // #FC9226
    },
    {
        start: [38, 47, 32], // #262F20
        stop: [205, 255, 175] // #CDFFAF
    },
    {
        start: [20, 31, 47], // #141F2F
        stop: [106, 170, 255] // #6AAAFF
    },
    {
        start: [29, 17, 30], // #1D111E
        stop: [159, 91, 161] // #9F5BA1
    },
    {
        start: [12, 30, 6], // #0C1E06
        stop: [100, 181, 70] // #64b546
    }
];

const synthKeyMap = {
    'a': 'c4',
    's': 'd4',
    'd': 'e4',
    'f': 'f4',
    'g': 'g4',
    'h': 'a4',
    'j': 'b4',
    'k': 'c5'
};



const MODE_SETUP = 'SETUP';
const MODE_PLAY = 'PLAY';


class App {
    constructor() {
        this.canvas = document.getElementById('vis');
        this.ctx = this.canvas.getContext('2d');
        this.debug = document.getElementById('debug');
        var body = document.querySelector('body');
        this.canvas.width = body.offsetWidth;
        this.canvas.height = body.offsetHeight;
        this.elements = [];
        this.mode = MODE_SETUP;
        this.currentPolygon = this.generateEmptyPolygon();
        this.mousePosition = [0,0];
        this.currentValues = [
            {
                current: 0.5,
                direction: 0
            },
            {
                current: 0.5,
                direction: 0
            },
            {
                current: 0.5,
                direction: 0
            },
            {
                current: 0.5,
                direction: 0
            },
            {
                current: 0.5,
                direction: 0
            },
            {
                current: 0.5,
                direction: 0
            }
        ]

        // Bind events
        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.canvas.addEventListener('click', this.onMouseClick.bind(this));
        document.addEventListener('keydown', this.onButtonPressed.bind(this));
        document.addEventListener('keyup', this.onButtonUp.bind(this));


        if (PROJECT_MODE === 0) {
            this.wah = new Tone.AutoWah().toMaster();
            this.synth =  new Tone.PolySynth(3, Tone.Synth, {
                "oscillator" : {
                    "type" : "fatsawtooth",
                    "count" : 3,
                    "spread" : 30
                },
                "envelope": {
                    "attack": 0.01,
                    "decay": 0.1,
                    "sustain": 0.5,
                    "release": 0.4,
                    "attackCurve" : "exponential"
                },
            }).connect(this.wah).toMaster();

            // this.synth = new Tone.SimpleFM();

            // this.chorus = new Tone.Chorus(4, 20.5, 20.5);
            // this.distortion = new Tone.Distortion(0.5);
            // this.synth.connect(this.chorus);
            // this.synth = this.synth.connect(this.distortion);

            // this.synth = this.synth.toMaster();
        }



        this.render();
        this.mainLoop();

    }

    mainLoop() {
        this.runLoop();
        setTimeout(this.mainLoop.bind(this), 50);
    }

    runLoop() {
        this.currentValues.forEach(function(v) {
            if (v.direction > 0) {
                v.current = Math.min(1, v.current + 0.2);
            }
            if (v.direction < 0) {
                v.current = Math.max(0, v.current - 0.05);
            }
        });
        this.render();
    }

    getColor(type, intensivity) {
        intensivity = this.currentValues[type].current;
        const colorDef = colorPalette[type];
        const color = [
            Math.ceil(colorDef.start[0] + (colorDef.stop[0] - colorDef.start[0])*intensivity),
            Math.ceil(colorDef.start[1] + (colorDef.stop[1] - colorDef.start[1])*intensivity),
            Math.ceil(colorDef.start[2] + (colorDef.stop[2] - colorDef.start[2])*intensivity),
        ]
        // console.log('get Color', color.join(','));


        return 'rgb(' + color.join(',') + ')';
    }

    generateEmptyPolygon() {
        return {
            pos: [],
            typeId: 0,
            cut: {
                x: 1,
                y: 1
            },
            intensity: 1
        };
    }

    dbg(text) {
        this.debug.innerHTML = text;
    }

    render() {
        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
        this.elements.forEach(this.renderElement.bind(this));

        // if setup, show setup element as well.
        if(this.mode === MODE_SETUP && this.currentPolygon.pos.length) {
            this.renderElement({
                pos: [...this.currentPolygon.pos, this.mousePosition],
                cut: {x:1,y:1},
                typeId: this.currentPolygon.typeId,
                    intensity: 1,
            });
        }
    }

    renderElement(elem) {
        const c = this.ctx;
        c.beginPath();
        c.moveTo(...elem.pos[elem.pos.length -1]);
        elem.pos.forEach(function(x) {
            c.lineTo(...x);
        });
        c.fillStyle = this.getColor(elem.typeId, elem.intensity);
        c.fill();
    }

    onMouseMove(evt) {
        // console.log('XXX', this)
        this.dbg(evt.clientX + ', ' + evt.clientY);
        this.mousePosition = [evt.clientX, evt.clientY];

        this.render();
    }

    onMouseClick(evt) {
        console.log('mouse click', evt);

        if (this.mode === MODE_SETUP) {
            this.currentPolygon.pos.push([evt.clientX, evt.clientY]);
        }

        this.render();
    }

    setNextMode() {
        if (this.mode === MODE_SETUP) {
            this.mode = MODE_PLAY;
        }
        this.render();
    }

    setPrevMode() {
        if (this.mode === MODE_PLAY) {
            this.mode = MODE_SETUP;
        }
        this.render();
    }

    onButtonUp(evt) {
        console.log('button up', evt);
        const key = evt.key;
        if (PROJECT_MODE === 0) {
            var idx = Object.keys(synthKeyMap).indexOf(key);
            if(idx > -1) {
                this.musicKeyDown(idx);
            }
        }
    }

    musicKeyUp(idx) {
        this.synth.triggerAttack(synthKeyMap[Object.keys(synthKeyMap)[idx]]);
        if (this.currentValues[idx]) {
            this.currentValues[idx].direction = +1;
        }
    }

    musicKeyDown(idx) {
        this.synth.triggerRelease(synthKeyMap[Object.keys(synthKeyMap)[idx]]);
        if (this.currentValues[idx]) {
            this.currentValues[idx].direction = -1;
        }
    }

    convertToFreq(m) {
        return Math.pow(2, (m-69)/12)*440;
    }

    musicKeyUpMidi(m, velocity) {
        if (!velocity) {
            velocity = 1;
        }
        this.synth.triggerAttack(this.convertToFreq(m), null, velocity);
    }

    musicKeyDownMidi(m) {
        this.synth.triggerRelease(this.convertToFreq(m));
    }



    onButtonPressed(evt) {
        if(evt.repeat) {
            return;
        }
        console.log('button', evt);
        const key = evt.key;

        // change modes
        if (key === 'w') {
            this.setNextMode();
            return;
        }

        if (key === 'q') {
            this.setPrevMode();
            return;
        }


        //
        if (PROJECT_MODE === 0) {
            var idx = Object.keys(synthKeyMap).indexOf(key);
            if(idx > -1) {
                this.musicKeyUp(idx);
            }
        }

        if (this.mode === MODE_SETUP) {
            console.log(this.currentPolygon);
            if (key === 'Enter') {
                this.addPolygon(this.currentPolygon);
                this.currentPolygon = this.generateEmptyPolygon();
            }

            if (key === 'ArrowRight') {
                console.log('arrow right');
                this.currentPolygon.cut.x++;
                console.log(this.currentPolygon.cut);
            }
            if (key === 'ArrowLeft') {
                this.currentPolygon.cut.x--;
            }

            if (key === 'ArrowUp') {
                this.currentPolygon.cut.y++;
            }

            if (key === 'ArrowDown') {
                this.currentPolygon.cut.y--;
            }
            if (key === 'm') {
                this.currentPolygon.typeId = (this.currentPolygon.typeId + 1) % colorPalette.length;
            }

            if (key === 'x') {
                this.currentPolygon = this.generateEmptyPolygon();
            }

            if (key === 'c') {
                this.elements = [];
                this.currentPolygon = this.generateEmptyPolygon();
            }

            if( key === 's') {
                localStorage.setItem('mapping', JSON.stringify(this.elements));
            }

            if(key === 'r') {
                this.elements = JSON.parse(localStorage.getItem('mapping'));
            }

            if (key === 'p') {
                this.elements = [];
                console.log('load');
                for(var i=0;i<6;i++) {
                    this.elements.push({
                        pos: [
                            [100*i,0],
                            [100*i,100],
                            [100+100*i,100],
                            [100*i+100,0]
                            // [i*300 + 100, 0],
                            // [i*300 + 350, 0],
                            // [i*300 + 150, 250],
                            // [i*300 + 350, 0],
                        ],
                        cut: {x:1,y:1},
                        typeId: i,
                    })
                }
                this.render();
            }

            this.dbg('cut' + JSON.stringify(this.currentPolygon.cut));
        }


        this.render();
    }

    addPolygon(poly) {
        //
        // var n=2;
        // var m=2;
        //
        //
        // const ps = poly.pos;
        // var x0 = ps[0][0];
        // var y0 = ps[0][1];
        // var x1 = ps[1][0];
        // var y1 = ps[1][1];
        // var x2 = ps[2][0];
        // var y2 = ps[2][1];
        // var x3 = ps[3][0];
        // var y3 = ps[3][1];
        //
        // var x0d = (x3 - x0) / n;
        // var y0d = (y3 - y0) / m;
        //
        // var x1d = (x2 - x1) / n;
        // var y1d = (y2 - y1) / m;
        //
        // var x2d = (x1 - x0) / n;
        // var y2d = (y1 - y0) / m;
        //
        //
        // var cx0 = x0;
        // var cy0 = y0;
        //
        // var cx1,cx2,cx3,cy1,cy2,cy3;

        this.elements.push(this.currentPolygon);
        // for(var i=0;i<2;i++) {
        //     for (var j = 0; j < 2; j++) {
        //
        //         cx0 = x0 + j * x2d + i*x0d;
        //         cy0 = y0 + j * y2d + i*y0d;
        //
        //         cx3 = x0 + j * x2d + (i + 1) * x0d;
        //         cy3 = y0 + j * y2d + (i + 1) * y0d;
        //
        //         cx1 = x0 + (j + 1) * x2d;
        //         cy1 = y0 + (j + 1) * y2d;
        //
        //         cx2 = cx1 + (j + 1) * x1d;
        //         cy2 = cy1 + (j + 1) * y1d;
        //
        //         console.log('X', [cx0, cy0], [cx1, cy1], [cx2, cy2], [cx3, cy3]);
        //
        //         this.elements.push({
        //             pos: [[cx0, cy0], [cx1, cy1], [cx2, cy2], [cx3, cy3]],
        //             typeId: j + i*2+2,
        //             cut: {x: 1, y: 1}
        //         })
        //     }
        // }

    }

    analyzeAudio(data) {
        this.elements.forEach(e => {
            e.intensity = data[e.typeId];
        })
        this.render();
    }
}

var elements = [];

const debugEl = document.getElementById('debug');

function debugText(text) {
    debugEl.innerHTML = text;
}

function socketConnect() {

}


//setTimeout(setup, 0);

const allowedKeys = [60,62,64,65,67,69,71,72];

const app = new App();
if (PROJECT_MODE !== 0) {
    setInterval(function () {
        app.analyzeAudio([Math.random(), Math.random(), Math.random(), Math.random(), Math.random(), Math.random()]);
    }, 100);
}

const keys = [];
for(var i=0;i<40;i++) {
    keys.push(0);
}

function animationStep(i, o) {
    for(var j=0;j<8;j++) {
        o.send([144, j+8*i, 5]);
    }
}


function startAnimation(o) {
    for(var i=0;i<40;i++) {
        o.send([144, i, 0]);
    }
    for(var i=0;i<5;i++) {
        setTimeout(animationStep.bind(null, i, o), i*100);
    }
}

if (PROJECT_MODE === 0) {
    navigator.requestMIDIAccess()
        .then(function(access) {

            // Get lists of available MIDI controllers
            const inputs = Array.from(access.inputs.values());
            console.log(inputs)

            const outputs = Array.from(access.outputs.values());
            console.log('o', outputs);

            startAnimation(outputs[1]);

            inputs[1].onmidimessage =function(m) {

                const key = m.data[1];

                if(m.data[0] === 144) {
                    keys[key] = (keys[key] + 1) % 4;
                    console.log(keys[key]);
                    outputs[1].send([144, m.data[1], keys[key] === 0? 0 : 2*keys[key]+1]);
                }


                if (m.data[0] === 145 && allowedKeys.indexOf(m.data[1]) > -1) {
                    var keyNr = allowedKeys.indexOf(m.data[1]);
                    console.log('key nr', keyNr);
                    app.musicKeyUp(keyNr);
                } else if (m.data[0] === 129 && allowedKeys.indexOf(m.data[1]) > -1) {
                    var keyNr = allowedKeys.indexOf(m.data[1]);
                    app.musicKeyDown(keyNr);
                } else {
                    // Playing note
                    if (m.data[0] === 145) {
                        app.musicKeyUpMidi(m.data[1], 0.5);
                    } else if(m.data[0] === 129) {
                        app.musicKeyDownMidi(m.data[1]);
                    }
                }

                if (m.data[0] === 176) {
                    const device = m.data[1];
                    const value = m.data[2] / 127;
                    if (device === 48) {
                        // attack
                        app.synth.set({
                            envelope: {
                                attack: 20 * value
                            }
                        });
                        console.log('APP', app);
                    }

                    if (device === 49) {
                        app.synth.set({
                            envelope: {
                                decay: 20*value
                            }
                        })
                    }

                    if (device === 50) {
                        app.synth.set({
                            envelope: {
                                sustain: 20 * value
                            }
                        })
                    }

                    if (device === 51) {

                        app.synth.set({
                            envelope: {
                                release: 20*value
                            }
                        })
                    }

                    if (device === 55) {
                        app.synth.set({
                            oscillator: {
                                spread: 100*value
                            }
                        })
                    }
                }
            };

            access.onstatechange = function(e) {

                // Print information about the (dis)connected MIDI controller
                console.log(e.port.name, e.port.manufacturer, e.port.state);
            };
        });
} else {
    console.log('MODE 2');
    window.THRESHOLD = 50;
   // var socket = new WebSocket('ws://192.168.43.125:8765');
    var socket = new WebSocket('ws://localhost:8765');
    socket.onmessage = function (e) {
        try {
            var msg = JSON.parse(e.data);
            console.log('Got from socket', msg);
            for(var i=0;i<6;i++) {
                app.currentValues[i] = {
                    current: Math.min(1, msg[i] / window.THRESHOLD),
                    direction: -1
                }
            }
        } catch(e) {

        }
    };

    socket.onopen = function(e) {
        console.log('On open');
    };

    socket.onerror = function(e) {
        console.error('Error while connecting with Websocket');
    };


    // using knob to control threshold
    navigator.requestMIDIAccess()
        .then(function(access) {

            // Get lists of available MIDI controllers
            const inputs = Array.from(access.inputs.values());
            console.log(inputs)

            const outputs = Array.from(access.outputs.values());
            console.log('o', outputs);

            inputs[1].onmidimessage = function (m) {
                console.log(m.data);
                if (m.data[0] === 176 && m.data[1] === 52) {
                    window.THRESHOLD = (m.data[2]/127)*200 + 0.5;
                }
            }
        });
}
