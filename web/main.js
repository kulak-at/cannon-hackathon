const IS_DEMO = true;

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

    getColor(type, intensivity) {
        const colorDef = colorPalette[type];
        const color = [
            Math.ceil(colorDef.start[0] + (colorDef.stop[0] - colorDef.start[0])*intensivity),
            Math.ceil(colorDef.start[1] + (colorDef.stop[1] - colorDef.start[1])*intensivity),
            Math.ceil(colorDef.start[2] + (colorDef.stop[2] - colorDef.start[2])*intensivity),
        ]
        console.log('get Color', color.join(','));


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

const app = new App();
setInterval(function() {
    app.analyzeAudio([Math.random(), Math.random(), Math.random(),Math.random(), Math.random(), Math.random()]);
},100);
