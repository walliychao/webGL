var GRAPH = function() {
    // N={0}
    this.polygon = [
        'REPEAT {0}',
            'FORWARD 1',
            'TURN 2*Math.PI/{0}',
        'END'
    ],
    // N={0} 
    this.star = [
        'REPEAT {0}',
            'FORWARD 1',
            'TURN 4*Math.PI/{0}',
        'END'
    ],
    // N={0}, A={1}, S={2}
    this.spiral = [
        'REPEAT {0}',
            'FORWARD 1',
            'TURN {1}',
            'RESIZE {2}',
        'END'
    ],
    // FUNCTION={0}, N={1}, A={2}
    this.spin = [
        'REPEAT {1}',
            '{0}',
            'TURN {2}',
        'END'
    ],
    // N={0}, A={1}
    this.poly = [
        'REPEAT {0}',
            'FORWARD 1',
            'TURN {1}',
        'END'
    ],
    // level={0}
    this.sierpinski = [
        'IF {0} == 0',
            'POLY(3, 2*Math.PI/3)',
        'ElSE',
            'REPEAT 3',
                'RESIZE 1/2',
                'SIERPINSKI({0} - 1)',
                'RESIZE 2',
                'MOVE 1',
                'TURN 2*Math.PI/3',
            'END',
        'END'
    ],
    // N={0},level={1}
    this.polygasket = [
        'IF {1} == 0',
            'POLY({0}, 2*Math.PI/{0})',
        'ELSE',
            'REPEAT {0}',
                'RESIZE 1/2',
                'POLYGASKET({0}, {1} - 1)',
                'RESIZE 2',
                'MOVE 1',
                'TURN 2*Math.PI/{0}',
            'END',
        'END'
    ],
    this.switzflag = [
        'IF {0} == 0',
            'POLY(4, Math.PI/2)',
        'ELSE',
            'REPEAT 4',
                'RESIZE 2/5',
                'SWITZFLAG({0} - 1)',
                'RESIZE 5/2',
                'FORWARD 1',
                'TURN Math.PI/2',
            'END',
        'END'
    ],
    this.koch = [
        'IF {0} == 0',
            'FORWARD 1',
        'ELSE',
            'RESIZE 1/3',
            'KOCH({0} - 1)',
            'TURN Math.PI/3',
            'KOCH({0} - 1)',
            'TURN -2*Math.PI/3',
            'KOCH({0} - 1)',
            'TURN Math.PI/3',
            'KOCH({0} - 1)',
            'RESIZE 3',
        'END'
    ],
    this.kochflower = [
        'REPEAT 3',
            'KOCH({0})',
            'TURN -2*Math.PI/3',
        'END'
    ]
};
GRAPH.prototype = {
    constructor: GRAPH,
    trans: function(name, arg) {
        var inst = this[name].join(';');
        for (var i = 0; i < arg.length; i++) {
            inst = inst.replace(new RegExp('\\{' + i + '\\}', 'g'), arg[i].toString());
        }
        return inst;
    }
};
