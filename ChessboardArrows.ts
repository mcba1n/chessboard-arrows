/*

A library that extends any chessboard library to allow users to draw arrows and circles.
Right-click to draw arrows and circles, left-click to clear the drawings.

Author: Brendon McBain
Date: 07/04/2020

*/
const NUM_SQUARES = 8;

export default class ChessboardArrows {

    private resFactor: number;
    private colour: string;
    private drawCanvas: any;
    private drawContext: any;
    private primaryCanvas: any;
    private primaryContext:any;

    private initialPoint: any;
    private finalPoint: any;
    private arrowWidth: number;
    private mouseDown: boolean;

    ChessboardArrows(id, resFactor: number = 2, colour: string = 'rgb(50, 104, 168)') {
        this.resFactor = resFactor;
        this.colour = colour;
        this.initialPoint = { x: null, y: null };
        this.finalPoint = { x: null, y: null };
        this.arrowWidth = 15;
        this.mouseDown = false;

        // drawing canvas
        this.drawCanvas = document.getElementById('drawing_canvas');
        this.drawContext = this.setResolution(this.drawCanvas, resFactor);
        this.setContextStyle(this.drawContext);

        // primary canvas
        this.primaryCanvas = document.getElementById('primary_canvas');
        this.primaryContext = this.setResolution(this.primaryCanvas, resFactor);
        this.setContextStyle(this.primaryContext);

        // setup mouse event callbacks
        var board = document.getElementById(id);
        board.addEventListener("mousedown", (event) => this.onMouseDown(event) );
        board.addEventListener("mouseup", (event) => this.onMouseUp(event) );
        board.addEventListener("mousemove", (event) => this.onMouseMove(event) );
        board.addEventListener('contextmenu', (event) => event.preventDefault(), false);
    }

    // source: https://stackoverflow.com/questions/808826/draw-arrow-on-canvas-tag
    private drawArrow(context: any, fromx: number, fromy: number, tox: number, toy: number, r: number): void {
        const x_center = tox;
        const y_center = toy;
        let angle: number, x: number, y: number;
        
        context.beginPath();
        
        angle = Math.atan2(toy-fromy,tox-fromx)
        x = r*Math.cos(angle) + x_center;
        y = r*Math.sin(angle) + y_center;

        context.moveTo(x, y);
        
        angle += (1/3)*(2*Math.PI)
        x = r*Math.cos(angle) + x_center;
        y = r*Math.sin(angle) + y_center;
        
        context.lineTo(x, y);
        
        angle += (1/3)*(2*Math.PI)
        x = r*Math.cos(angle) + x_center;
        y = r*Math.sin(angle) + y_center;
        
        context.lineTo(x, y);
        context.closePath();
        context.fill();
    }

    private getMousePos(canvas: any, evt: any): any {
        const rect = canvas.getBoundingClientRect();
        return {
            x: this.Q(evt.clientX - rect.left),
            y: this.Q(evt.clientY - rect.top)
        };
    }

    private setContextStyle(context: any): void {
        context.strokeStyle = context.fillStyle = this.colour;
        context.lineJoin = 'butt';
    }

    private onMouseDown(event: any): void {
        if (event.which == 3) { // right click
            this.mouseDown = true;
            this.initialPoint = this.finalPoint = this.getMousePos(this.drawCanvas, event);
            this.drawCircle(this.drawContext, this.initialPoint.x, this.initialPoint.y, this.primaryCanvas.width/(this.resFactor*NUM_SQUARES*2) - 1);
        }
    }

    private onMouseUp(event: any): void {
        if (event.which == 3) { // right click
            this.mouseDown = false;
            // if starting position == ending position, draw a circle to primary canvas
            if (this.initialPoint.x == this.finalPoint.x && this.initialPoint.y == this.finalPoint.y) {
                this.drawCircle(this.primaryContext, this.initialPoint.x, this.initialPoint.y, this.primaryCanvas.width/(this.resFactor*NUM_SQUARES*2) - 1); // reduce radius of square by 1px
            }
            // otherwise draw an arrow 
            else {
                this.drawArrowToCanvas(this.primaryContext);
            }
            this.drawContext.clearRect(0, 0, this.drawCanvas.width, this.drawCanvas.height);
        }
        else if (event.which == 1) { // left click
            this.clearCanvas();
        }
    }

    public clearCanvas(): void {
        // clear canvases
        this.drawContext.clearRect(0, 0, this.drawCanvas.width, this.drawCanvas.height);
        this.primaryContext.clearRect(0, 0, this.primaryCanvas.width, this.primaryCanvas.height);
    }

    private onMouseMove(event: any): void {
        this.finalPoint = this.getMousePos(this.drawCanvas, event);

        if (!this.mouseDown) return;
        if (this.initialPoint.x == this.finalPoint.x && this.initialPoint.y == this.finalPoint.y) return;

        this.drawContext.clearRect(0, 0, this.drawCanvas.width, this.drawCanvas.height);
        this.drawArrowToCanvas(this.drawContext);
    }

    private drawArrowToCanvas(context: any): void {
        // offset finalPoint so the arrow head hits the center of the square
        let xFactor, yFactor, offsetSize;
        if (this.finalPoint.x == this.initialPoint.x) {
            yFactor = Math.sign(this.finalPoint.y - this.initialPoint.y)*this.arrowWidth;
            xFactor = 0
        }
        else if (this.finalPoint.y == this.initialPoint.y) {
            xFactor = Math.sign(this.finalPoint.x - this.initialPoint.x)*this.arrowWidth;
            yFactor = 0;
        }
        else {
            // find delta x and delta y to achieve hypotenuse of arrowWidth
            const slope_mag = Math.abs((this.finalPoint.y - this.initialPoint.y)/(this.finalPoint.x - this.initialPoint.x));
            xFactor = Math.sign(this.finalPoint.x - this.initialPoint.x)*this.arrowWidth/Math.sqrt(1 + Math.pow(slope_mag, 2));
            yFactor = Math.sign(this.finalPoint.y - this.initialPoint.y)*Math.abs(xFactor)*slope_mag;
        }

        // draw line
        context.beginPath();
        context.lineCap = "round";
        context.lineWidth = 8;
        context.moveTo(this.initialPoint.x, this.initialPoint.y);
        context.lineTo(this.finalPoint.x - xFactor, this.finalPoint.y - yFactor);
        context.stroke();

        // draw arrow head
        this.drawArrow(context, this.initialPoint.x, this.initialPoint.y, this.finalPoint.x - xFactor, this.finalPoint.y - yFactor, this.arrowWidth);
    }
    
    private Q(x: number): number {  // mid-tread quantiser
        const d = this.primaryCanvas.width/(this.resFactor*NUM_SQUARES);
        return d*(Math.floor(x/d) + 0.5);
    }

    private drawCircle(context: any, x: any, y: any, r: number): void {
        context.beginPath();
        context.lineWidth = 3;
        context.arc(x, y, r, 0, 2 * Math.PI);
        context.stroke();
    }

    // source: https://stackoverflow.com/questions/14488849/higher-dpi-graphics-with-html5-canvas
    public setResolution(canvas: any, scaleFactor: number): any {
        // set up CSS size
        canvas.style.width = canvas.style.width || canvas.width + 'px';
        canvas.style.height = canvas.style.height || canvas.height + 'px';

        // resize canvas and scale future draws
        canvas.width = Math.ceil(canvas.width * scaleFactor);
        canvas.height = Math.ceil(canvas.height * scaleFactor);
        const ctx = canvas.getContext('2d');
        ctx.scale(scaleFactor, scaleFactor);
        return ctx;
    }

}
