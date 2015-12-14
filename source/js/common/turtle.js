var TURTLE = function(opts) {
    var defaults = {
        width: 1000,
        height: 500,
        backgroundColor: '#000',
        color: '#fff',
        step: 100,
        initAx: 1,
        initAy: 0,
        initPx: 300,
        initPy: 400,
        id: 'graph'
    };
    this.opts = {};
    for (key in defaults) {
        this.opts[key] = defaults[key];
    }
    for (key in opts) {
        this.opts[key] = opts[key];
    }
    this.x = this.opts.initPx;
    this.y = this.opts.initPy;
    this.vector = [this.opts.initAx * this.opts.step, this.opts.initAy * this.opts.step];
    this.graphs = new GRAPH();
    this.init.apply(this);
}

TURTLE.prototype = {
    constructor: TURTLE,
    init: function() {
        var id = this.opts.id;
        var canvas = document.getElementById(id);
        if (!canvas) {
            throw new Error('no canvas found');
        }
        canvas.width = this.opts.width;
        canvas.height = this.opts.height;
        canvas.style.backgroundColor = this.opts.backgroundColor;
        this.ctx = canvas.getContext('2d');
        this.ctx.strokeStyle = this.opts.color;
        this.ctx.moveTo(this.x, this.y);
    },
    forward: function(D) {
        var d = + eval(D);
        if (d !== d) {
            throw Error('unexpected token: ' + D);
        }
        this.x = this.x + this.vector[0] * d;
        this.y = this.y + this.vector[1] * d;
        this.ctx.lineTo(this.x, this.y);
        this.ctx.stroke();
    },
    move: function(D) {
        var d = + eval(D);
        if (d !== d) {
            throw Error('unexpected token: ' + D);
        }
        this.x = this.x + this.vector[0] * d;
        this.y = this.y + this.vector[1] * d;
        this.ctx.moveTo(this.x, this.y);
    },
    turn: function(A) {
        var a = + eval(A);
        if (a !== a) {
            throw Error('unexpected token: ' + A);
        }
        var newV0 = this.vector[0] * Math.cos(-a) - this.vector[1] * Math.sin(-a);
        var newV1 = this.vector[0] * Math.sin(-a) + this.vector[1] * Math.cos(-a);
        this.vector[0] = newV0;
        this.vector[1] = newV1;
    },
    resize: function(S) {
        var s = + eval(S);
        if (s !== s) {
            throw Error('unexpected token: ' + S);
        }
        if (s < 0) {
            this.turn(Math.PI);
            s = -s;
        }
        this.vector[0] *= s;
        this.vector[1] *= s;
    },
    repeat: function(N, instructs) {
        var n = + eval(N);
        if (n !== n) {
            throw Error('unexpected token: ' + N);
        }
        for(var i = 0; i < n; i++) {
            this.parse(instructs);
        }
    },
    parse: function(instructs) {
        if (instructs && typeof instructs === 'string') {
            instructs.replace(/[{|}|\r\n]/g, '');
            instructs = instructs.split(';');
        }
        if (!instructs || !instructs.length) {
            throw Error('vail instructs');
        }
        var ins = [];
        var keyWords;
        for (var i = 0; i < instructs.length; i++) {
            ins = instructs[i].trim().split(/\s+/g);
            keyWords = ins[0].toLowerCase();
            if (ins.length > 2) {
                ins[1] = instructs[i].replace(ins[0], '').trim();
            }
            switch (keyWords) {
                case 'repeat':
                    var rNum = ins[1]; 
                    var subInstructs = [];
                    var subIns = [];
                    var subKey;
                    var expEnds = 1;
                    var actualEnds = 0;
                    for (var j = i + 1; j < instructs.length; j++) {
                        subIns = instructs[j].trim().split(/\s+/g);
                        subKey = subIns[0].toLowerCase();
                        if (subKey !== 'end') {
                            if (subKey === 'if' || subKey === 'repeat') {
                                expEnds++;
                            }
                            subInstructs.push(instructs[j]);
                        }
                        else {
                            actualEnds++;
                            if (actualEnds === expEnds) {
                                i = j;
                                this.repeat(rNum, subInstructs);
                                break;
                            }
                            else {
                                subInstructs.push(instructs[j]);
                            }
                        }
                    }
                    break;
                case 'if':
                    var result;
                    if (ins[1]) {
                        var result = !!eval(ins[1]);
                    }
                    var subInstructs = [];
                    var SubIns = [];
                    var subKey;
                    var expEnds = 1;
                    var actualEnds = 0;
                    for (var j = i + 1; j < instructs.length; j++) {
                        subIns = instructs[j].trim().split(/\s+/g);
                        subKey = subIns[0].toLowerCase();
                        if (subKey !== 'else' && subKey !== 'end') {
                            if (result) {
                                if (subKey === 'if' || subKey === 'repeat') {
                                    expEnds++;
                                }
                                subInstructs.push(instructs[j]);
                            }
                        }
                        else if (subKey === 'else') {
                            if (expEnds - actualEnds === 1) {
                                result = !result;
                            }
                            else if (result) {
                                subInstructs.push(instructs[j]);
                            }
                        }
                        else {
                            actualEnds++;
                            if (expEnds === actualEnds) {
                                i = j;
                                this.parse(subInstructs);
                                break;
                            }
                            else if (result) {
                                subInstructs.push(instructs[j]);
                            }
                            
                        }
                    }
                    break;
                case 'forward':
                case 'move':
                case 'turn':
                case 'resize':
                    if (ins[1]) {
                        this[keyWords](ins[1]);
                    }
                    break;
                default:
                    // 检查预定义的graph函数
                    ins = instructs[i].split('(');
                    keyWords = ins[0].trim().toLowerCase();
                    var args = [];
                    if (ins[1]) {
                        ins[1] = ins[1].trim().slice(0, -1);
                        args = ins[1].split(',');
                    }
                    
                    for (var k = 0; k < args.length; k++) {
                        args[k] = eval(args[k]);
                    }
                    if (keyWords in this.graphs) {
                        var funcIns = this.graphs.trans(keyWords, args);
                        this.parse(funcIns);
                    }
                    break;
            }
        }
    }
}