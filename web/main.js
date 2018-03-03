const IS_DEMO = true;

const colors = [
    [255,0,0],
    [0,255,0],
    [0,0,255]
];


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

        // Bind events
        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.canvas.addEventListener('click', this.onMouseClick.bind(this));
        document.addEventListener('keydown', this.onButtonPressed.bind(this));



        this.render();

    }

    generateEmptyPolygon() {
        return {
            pos: [],
            colorId: 0,
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
                colorId: this.currentPolygon.colorId,
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
        c.fillStyle = 'rgba(' + (colors[elem.colorId]).join(',') + ',' + elem.intensity + ')';
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

    onButtonPressed(evt) {
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

        if (CURRENT_MODE === MODE_SETUP) {
            console.log(this.currentPolygon);
            if (key === 'Enter') {
                this.addPolygon(this.currentPolygon);
                this.currentPolygon = generateEmptyPoly();
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
                this.currentPolygon.colorId = (this.currentPolygon.colorId + 1) % colors.length;
            }

            if (key === 'x') {
                this.currentPolygon = this.generateEmptyPolygon();
            }

            if (key === 'c') {
                this.elements = [];
                this.currentPolygon = this.generateEmptyPolygon();
            }
            this.dbg('cut' + JSON.stringify(this.currentPolygon.cut));
        }


        this.render();
    }

    addPolygon(poly) {

        const ps = poly.pos;
        const x0 = ps[0][0];
        const y0 = ps[0][1];
        const x1 = ps[1][0];
        const y1 = ps[1][1];
        const x2 = ps[2][0];
        const y2 = ps[2][1];
        const x3 = ps[3][0];
        const y3 = ps[3][1];

        const x1d = x0 - x1;
        const y1d = y0 - y1;
        const x2d = x2 - x3;
        const y2d = y2 - y3;



        this.elements.push(this.currentPolygon);
    }

    analyzeAudio(data) {
        this.elements.forEach(e => {
            e.intensity = data[e.colorId];
        })
        this.render();
    }
}


// const elements = [
//     {
//         cut: {
//             x: 3,
//             y: 2
//         },
//         pos: [[206,367], [200,520], [509, 521], [514,370]],
//         colorId: 0
//     },
//     {
//         cut: {x: 2,y:4},
//         pos: [[675,229], [670, 528], [828, 533], [829,232]],
//         colorId: 1
//     }
// ];

var elements = [];

const debugEl = document.getElementById('debug');

function debugText(text) {
    debugEl.innerHTML = text;
}

// function setup() {
//     const bg = document.getElementById('bg');
//     const vis = document.getElementById('vis');
//     const body = document.querySelector('body');
//     vis.width = body.offsetWidth;
//     vis.height = body.offsetHeight;
//     if (!IS_DEMO) {
//         bg.style.display = 'none';
//     }
//
//     vis.addEventListener('mousemove', onMouseMove);
//     vis.addEventListener('click', onMouseClick);
//     document.addEventListener('keydown', onButtonClicked);
//
//     draw(vis);
// }
//
// function drawInit(vis) {
//     //console.log('draw Init');
//     draw(vis);
//     setTimeout(drawInit.bind(this,vis), 100);
// }
//
// function draw(canvas) {
//     //return;
//     const c = canvas.getContext('2d');
//     c.clearRect(0, 0, canvas.width, canvas.height);
//     elements.forEach(drawElement.bind(null, c))
// }
//
// function drawElement(c, elem) {
//     c.beginPath();
//     c.moveTo(...elem.pos[elem.pos.length -1]);
//     elem.pos.forEach(function(x) {
//         c.lineTo(...x);
//     });
//     console.log('color',  'rgba(' + (colors[elem.colorId]).join(',') + ',' + elem.intensity + ')');
//     c.fillStyle = 'rgba(' + (colors[elem.colorId]).join(',') + ',' + elem.intensity + ')';
//     c.fill();
//     //e.colorId = (e.colorId + 1) % colors.length;
// }

function socketConnect() {

}


//setTimeout(setup, 0);

const app = new App();
setInterval(function() {
    app.analyzeAudio([Math.random(), Math.random(), Math.random()]);
},10);




function generateEmptyPoly() {
    return {
        pos: [],
        colorId: 0,
        cut: {
            x: 1,
            y: 1
        }
    }
}


// available modes: 'SETUP', 'PLAY'
var CURRENT_MODE = MODE_SETUP;
var currentPoly = generateEmptyPoly();
// var elements = [];

function onMouseMove(evt) {
    //console.log(evt);
    debugText(evt.clientX + ',' + evt.clientY);
    //debug.
    //debug
}

function onMouseClick(evt) {
    console.log(evt);
    if (CURRENT_MODE === MODE_SETUP) {
        currentPoly.pos.push([evt.clientX, evt.clientY]);
    }
}

function onButtonClicked(evt) {
    const key = evt.key;
    if (CURRENT_MODE === MODE_SETUP) {
        if (key === 'Enter') {
            elements.push(currentPoly);
            currentPoly = generateEmptyPoly();
        }
    }
}

function drawCurrent() {

}