let unit_circle_center, radius
let curr_picked
let filter_plane
let unit_circle_mode
let last_press_position
const zero_mode_btn = document.getElementById("zero")
const pole_mode_btn = document.getElementById("pole")
const modes_btns = [zero_mode_btn, pole_mode_btn]
const CANVAS_SIZE = 300
const NONE_PICKED = { item: {point: null, conjugate: null}, index: -1 }
const Mode = { ZERO : 0, POLE : 1, CONJ_ZERO : 2, CONJ_POLE : 3 }
const Conj_Modes = {2: Mode.CONJ_ZERO, 3: Mode.CONJ_POLE}
const API = "http://127.0.0.1:8000/"
const modesMap = {
    'zero': Mode.ZERO,
    'pole': Mode.POLE,
}

const btnDownloadCsv = document.getElementById("btnDownloadCsv");
btnDownloadCsv.addEventListener("click", () => {
    download(filter_plane.getZerosPoles(radius));
});

const s = (p5_inst) => {
    p5_inst.setup = function () {
        p5.disableFriendlyErrors = true;

        p5_inst.createCanvas(CANVAS_SIZE, CANVAS_SIZE)
        radius = CANVAS_SIZE / 2.1
        unit_circle_center = p5_inst.createVector(
            CANVAS_SIZE / 2,
            CANVAS_SIZE / 2
        )
        curr_picked = NONE_PICKED
        unit_circle_mode = Mode.ZERO
        filter_plane = new FilterPlane()

        p5_inst.noLoop()
    }

    p5_inst.draw = function () {
        p5_inst.clear()
        drawUnitCricle()
        drawPoints()
    }
    p5_inst.mousePressed = function () {
        let p = p5_inst.createVector(p5_inst.mouseX, p5_inst.mouseY)
        last_press_position = p
    }

    p5_inst.mouseMoved = function () {
        drawCursor()
    }

    p5_inst.doubleClicked = function () {
        curr_picked = NONE_PICKED
        p5_inst.redraw()
    }

    p5_inst.mouseClicked = function () {
        updateFilterDesign(filter_plane.getZerosPoles(radius))
        // updateAllPassCoeff()
        p5_inst.noLoop()
        return true
    }

    p5_inst.mouseReleased = function () {
        let p = p5_inst.createVector(p5_inst.mouseX, p5_inst.mouseY)
        let position_changed = p.dist(last_press_position) != 0
        if (filter_plane.isInsidePlane(p)) {
            let found = filter_plane.therePoint(p)
            if (found.item.point) {
                curr_picked = found
            }
            else if(!position_changed) filter_plane.addItem(p, mode = unit_circle_mode)
            drawCursor()
            p5_inst.redraw()
        }
    }

    p5_inst.mouseDragged = function () {
        let p = p5_inst.createVector(p5_inst.mouseX, p5_inst.mouseY)
        if (curr_picked != NONE_PICKED && isInsideCircle(p, unit_circle_center, radius, 0)) {
            if(!curr_picked.item.conjugate){
                p.y = unit_circle_center.y
                //curr_picked.item.point.center = p
            }
            // else{
            //     curr_picked.item.point.center = p
            //     curr_picked.item.conjugate.center = curr_picked.item.point.getConjugate().center
            // }
        }
        updateFilterDesign(filter_plane.getZerosPoles(radius))
        updateAllPassCoeff()
        drawCursor()
        p5_inst.redraw()
    }

    function drawCursor() {
        let p = p5_inst.createVector(p5_inst.mouseX, p5_inst.mouseY)
        if (filter_plane.isInsidePlane(p)) {
            const { index: found } = filter_plane.therePoint(p)
            if (p5_inst.mouseIsPressed) p5_inst.cursor('grabbing')
            else if (found != -1) {
                p5_inst.cursor('pointer')
            } else {
                p5_inst.cursor()
            }
        }
    }

    function drawPoints() {
        filter_plane.items.forEach(({ point, conjugate }) => {
            if (point == curr_picked.item.point) {
                point.draw(undefined, undefined, (picked = true))
                conjugate?.draw(undefined, undefined, (picked = true))
            }
            else {
                point.draw()
                //conjugate?.draw()
            }

        })
    }

    function drawUnitCricle() {
        // p5_inst.background('rgba(0,255,0, 0)')
        p5_inst.stroke(255)
        p5_inst.fill('#f9f9f9')
        p5_inst.circle(unit_circle_center.x, unit_circle_center.y, radius * 2)
        p5_inst.stroke("#5b5a5a")
        p5_inst.noFill()
        p5_inst.circle(unit_circle_center.x, unit_circle_center.y, radius * 2)
        const axes = [
            p5_inst.createVector(radius, 0),
            p5_inst.createVector(-radius, 0),
            p5_inst.createVector(0, radius),
            p5_inst.createVector(0, -radius)
        ]
        axes.forEach((axis) => { arrow(unit_circle_center, axis, '#000') })
    }

    function isInsideCircle(p, center, radius, error=0) {
        if(!p || !center || !radius) return
        return p.dist(center) < radius + (radius * error) / 100
    }


    function cross(center, size = 8, fill = '#fff', weight = 2, stroke = '#fff') {
        const lines = {
            top_right: p5_inst.createVector(size / 2, -size / 2),
            top_left: p5_inst.createVector(-size / 2, -size / 2),
            down_left: p5_inst.createVector(-size / 2, size / 2),
            down_right: p5_inst.createVector(size / 2, size / 2),
        }
        p5_inst.push()
        p5_inst.stroke(stroke)
        p5_inst.strokeWeight(weight)
        p5_inst.fill(fill)
        p5_inst.translate(center.x, center.y)
        for (const key in lines) {
            p5_inst.line(0, 0, lines[key].x, lines[key].y)
        }
        p5_inst.pop()
    }

    function arrow(base, vec, myColor) {
        let arrowSize = 7
        p5_inst.push()
        p5_inst.stroke(myColor)
        p5_inst.strokeWeight(1.5)
        p5_inst.fill(myColor)
        p5_inst.translate(base.x, base.y)
        p5_inst.line(0, 0, vec.x, vec.y)
        p5_inst.rotate(vec.heading())
        p5_inst.translate(vec.mag() - arrowSize, 0)
        p5_inst.pop()
    }

    class Point {
        constructor(center, origin) {
            this.center = center
            this.origin = origin
        }

        getRelativeX(x_max) {
            return (this.center.x - this.origin.x) / x_max
        }

        getRelativeY(y_max) {
            return (this.center.y - this.origin.y) / y_max
        }

        getRelativePosition(max){
            return [this.getRelativeX(max), this.getRelativeY(max)]
        }

        getConjugate() {
            let conjugate_center = p5_inst.createVector(
                this.center.x,
                this.origin.y - this.getRelativeY(1)
            )
            return new Point(conjugate_center, this.origin)
        }

        hash() {
            return `${this.center.x}${this.center.y}`
        }
    }

    class Zero extends Point {
        constructor(center, origin) {
            super(center, origin)
        }

        draw(size = 10, fill = '#1f77b4', picked = false) {
            p5_inst.push()
            if (picked) fill = '#fd413c' 
            p5_inst.stroke("#ffff")
            p5_inst.fill(fill)
            p5_inst.circle(this.center.x, this.center.y, size)
            p5_inst.pop()
        }

        getConjugate() {
            let p = super.getConjugate()
            return new Zero(p.center, p.origin)
        }
    }

    class Pole extends Point {
        constructor(center, origin) {
            super(center, origin)
        }

        draw(size = 10, fill = '#1f77b4', picked = false) {
            picked
                ? cross(this.center, size, fill, 2, '#fd413c')
                : cross(this.center, size, fill, 2, fill)
        }

        getConjugate() {
            let p = super.getConjugate()
            return new Pole(p.center, p.origin)
        }
    }

    class FilterPlane {
        constructor() {
            this.items = []
        }

        therePoint(p, error = 5) {
            for (let i = 0; i < this.items.length; i++) {
                let item = this.items[i]
                if (this.#isInsideItem(p, item, error)) {
                    return { item, index: i }
                }
            }
            return { item: { point: null, conjugate: null }, index: -1 }
        }

        #isInsideItem(p, item, error) {
            let insidePonit = isInsideCircle(p, item.point.center, 8, error)
            let insideConjugate = isInsideCircle(p, item.conjugate?.center, 8, error)
            return insidePonit || insideConjugate
        }

        isInsidePlane(p) {
            return isInsideCircle(p, unit_circle_center, radius, 0)
        }

        getZerosPoles(max) {
            let zerosPositions = [],
                polesPositions = []
            this.items.forEach(({ point, conjugate }) => {
                let pointPosition = point.getRelativePosition(max)
                let conjugatePosition = conjugate?.getRelativePosition(max)
                let positions =
                    point instanceof Zero ? zerosPositions : polesPositions
                positions.push(pointPosition)
                if (conjugatePosition) positions.push(conjugatePosition)
            })
            return { zeros: zerosPositions, poles: polesPositions }
        }

        addItem(p, mode) {
            if (mode == Mode.ZERO) this.#addZero(p)
            else if (mode == Mode.POLE) this.#addPole(p)
            curr_picked = NONE_PICKED
        }

      

        remove(index) {
            if (index < 0) return
            this.items.splice(index, 1)
            p5_inst.redraw()
        }

        #addZero(p) {
            if (Math.abs(unit_circle_center.y - p.y) > 5){
                this.#addConjugateZero(p)
                return
            }
            let center = p5_inst.createVector(p.x, unit_circle_center.y)
            let zero = new Zero(center, unit_circle_center)
            this.items.push({ point: zero, conjugate: null })
        }

        #addPole(p) {
            if (Math.abs(unit_circle_center.y - p.y) > 5){
                this.#addConjugatePole(p)
                return
            }
            let center = p5_inst.createVector(p.x, unit_circle_center.y)
            let pole = new Pole(center, unit_circle_center)
            this.items.push({ point: pole, conjugate: null })
        }
        

        #addConjugatePole(p) {
            let center = p5_inst.createVector(p.x, p.y)
            let pole = new Pole(center, unit_circle_center)
            let conjugate_pole = pole.getConjugate()
            this.items.push({ point: pole, conjugate: conjugate_pole })
        }

        #addConjugateZero(p) {
            let center = p5_inst.createVector(p.x, p.y)
            let zero = new Zero(center, unit_circle_center)
            let conjugate_zero = zero.getConjugate()
            this.items.push({ point: zero, conjugate: conjugate_zero })
        }
    }

}

function changeMode(e){
    unit_circle_mode = modesMap[e.target.id]
    for(btn of modes_btns){
        btn.style.color = (btn !== e.target) ? "#fff" : "#fff";
    }
}

document.querySelectorAll('.mode-control').forEach(item => {
    item.addEventListener('click', changeMode)
})

document
    .querySelector('#remove')
    .addEventListener('click', () => filter_plane.remove(curr_picked.index))

let filterCanvas = new p5(s, 'circle-canvas')

async function download(data){
    let points = { ze, po } =  await postData(`${API}/getZerosAndPoles`, data)
    downloadCsv("filter.csv", json2csv.parse(points));
    function downloadCsv(filename, csvData) {
        const element = document.createElement("a");

        element.setAttribute("href", `data:text/csv;charset=utf-8,${csvData}`);
        element.setAttribute("download", filename);
        element.style.display = "none";

        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        console.log(downloadData);
        console.log(csvData);
    }
}




 
function importfilter(){
    var poles=[];
    var zeros=[]; 
    var file= document.getElementById("csv2").files[0]
        Papa.parse(file, {
            header : true,
            skipEmptyLines: true,
            complete : function(results, file) {  
                for (i=0; i< results.data.length; i++){
                    poles.push(results.data[i].poles);
                    zeros.push(results.data[i].zeros);

                }
                const strparsedpoles= poles;
                const strparsedzeroes= zeros;
                console.log(strparsedpoles);
                console.log(strparsedzeroes);
                var arrayparsedpoles = '{"key": '+strparsedpoles+'}';
                var arrayparsedzeros = '{"key": '+strparsedzeroes+'}';
                console.log(arrayparsedpoles);
                const polesobj= JSON.parse(arrayparsedpoles);
                const zerosobj= JSON.parse(arrayparsedzeros);
                const finalpoles= polesobj.key;
                const finalzeros= zerosobj.key;
              
                points = {zeros : finalzeros, poles : finalpoles};
                updateFilterDesign(points)
            }
                }); 
};

