function Triangle() {
    return {
        //Counter-Clockwise (The side to the right is the next one)
        sides: [
            {
                edge: undefined,
                angle: undefined //angle opposite of the edge
            },
            {
                edge: undefined,
                angle: undefined //angle opposite of the edge
            },
            {
                edge: undefined,
                angle: undefined //angle opposite of the edge
            }

        ],
        error: undefined,

        //Clockwise
        rotate: function (steps) {
            this.sides.unshift.apply(this.sides, this.sides.splice(steps, this.sides.length));
            return this.sides;
        }
    }
}
var calculateRemainingParameters = function (triangle) {

    var conditions = [isSAS,isSSS, isASA, isSAA, isAAS,isSSA,isASS];
    var functions = [fromSAS,fromSSS, fromASA, fromSAA, fromAAS, fromSSA, fromASS];

    //First: Determine what congruency criteria the triangle-object represents
    var t;
    for(var i = 0; i < conditions.length; i++){
        if((t = contains(triangle, conditions[i]))){
            console.log(i);
            functions[i](t);
            return;
        }
    }
    //Error: input not valid
    console.error("invalid triangle: " + triangle);
};

var contains = function (triangle, condition) {
    t = Triangle();
    //We need a shallow copy of the initial sides to work with
    t.sides = triangle.sides.slice();
    //Rotate clockwise
    var rotations = 0;
    while (rotations < 3) {
        //Test if it forms an SAS beginning from 0
        if (condition(t)) {
            //congruency proven
            return t;
        }
        //Rotate to the next side
        t.rotate(1);
        rotations++;
    }
    return false;
};

//The following Methods test if the triangle fulfills any of the congruency criteria.
var isSAS = function (t) {
    return t.sides[0].edge && t.sides[2].angle && t.sides[1].edge;
};

var isSSS = function (t) {
    return t.sides[0].edge && t.sides[1].edge && t.sides[2].edge;
};

var isASA = function (t) {
    return t.sides[0].edge && t.sides[1].angle && t.sides[2].angle;
};

//angle to the right of the edge
var isSAA = function (t) {
    return t.sides[0].edge && t.sides[2].angle && t.sides[0].angle;
};
//Basically the same as SAA but the angle is on the left side of the edge
var isAAS = function (t) {
    return t.sides[0].edge && t.sides[1].angle && t.sides[0].angle;
};

//This one is a little more complicated
var isSSA = function (t) {
    return t.sides[0].edge && t.sides[1].edge && t.sides[0].angle;
};

//Same as SSA but the longer edge is on the left
var isASS = function (t) {
    return t.sides[0].edge && t.sides[2].edge && t.sides[0].angle;
};

var fromSAS = function (triangle) {
    var a = triangle.sides[0].edge;
    var b = triangle.sides[1].edge;
    var C = triangle.sides[2].angle;

    var c = locToEdge(a,b,C);
    //Choose the smaller angle (opposite of the smaller side)
    if(a < b){
        var A = losToAngle(a,c,C);
        var B = remainingAngle(A,C);
    } else {
        var B = losToAngle(b,c,C);
        var A = remainingAngle(B,C);
    }

    triangle.sides[2].edge = c;
    triangle.sides[1].angle = B;
    triangle.sides[0].angle = A;

    return triangle;
};

var fromSSS = function(triangle){
    var a = triangle.sides[0].edge;
    var b = triangle.sides[1].edge;
    var c = triangle.sides[2].edge;

    var A = locToAngle(a,b,c);
    var B = locToAngle(b,c,a);
    var C = remainingAngle(A,B);

    triangle.sides[0].angle = A;
    triangle.sides[1].angle = B;
    triangle.sides[2].angle = C;

    return triangle;
};

var fromASA = function(triangle){
    var B = triangle.sides[1].angle;
    var C = triangle.sides[2].angle;
    var a = triangle.sides[0].edge;

    var A = remainingAngle(B,C);
    var b = losToEdge(B,a,A);
    var c = losToEdge(C,a,A);

    triangle.sides[0].angle = A;
    triangle.sides[1].edge = b;
    triangle.sides[2].edge = c;

    return triangle;
};
var fromSAA = function(triangle){
    var A = triangle.sides[0].angle;
    var C = triangle.sides[2].angle;
    var a = triangle.sides[0].edge;

    var B = remainingAngle(C,A);
    var b = losToEdge(B,a,A);
    var c = losToEdge(C,a,A);

    triangle.sides[1].angle = B;
    triangle.sides[1].edge = b;
    triangle.sides[2].edge = c;

    return triangle;
};

var fromAAS = function(triangle){
    var A = triangle.sides[0].angle;
    var B = triangle.sides[1].angle;
    var a = triangle.sides[0].edge;

    var C = remainingAngle(B,A);
    var b = losToEdge(B,a,A);
    var c = losToEdge(C,a,A);

    triangle.sides[2].angle = C;
    triangle.sides[1].edge = b;
    triangle.sides[2].edge = c;

    return triangle;
};

var fromSSA = function(triangle){
    var A = triangle.sides[0].angle;
    var b = triangle.sides[1].edge;
    var a = triangle.sides[0].edge;

    //First possibility
    var B_1 = losToAngle(b,a,A);
    var C_1 = remainingAngle(A,B_1);
    var c_1 = losToEdge(C_1,a,A);

    //second possibility
    var B_2 = remainingAngle(B_1,0);
    var C_2 = remainingAngle(A,B_2);
    var c_2 = losToEdge(C_2,a,A);

    if(C_2 > 0 && B_2 > 0 && c_2 > 0){
        triangle.sides[2].angle = C_1.toFixed(4) + " or " + C_2.toFixed(4);
        triangle.sides[1].angle = B_1.toFixed(4) + " or " + B_2.toFixed(4);
        triangle.sides[2].edge = c_1.toFixed(4) + " or " + c_2.toFixed(4);
    } else {
        triangle.sides[2].angle = C_1;
        triangle.sides[1].angle = B_1;
        triangle.sides[2].edge = c_1;
    }
    return triangle;
};

var fromASS = function(triangle){
    var A = triangle.sides[0].angle;
    var c = triangle.sides[2].edge;
    var a = triangle.sides[0].edge;

    //First possibility
    var C_1 = losToAngle(c,a,A);
    var B_1 = remainingAngle(A,C_1);
    var b_1 = losToEdge(B_1,a,A);

    //second possibility
    var C_2 = remainingAngle(C_1,0);
    var B_2 = remainingAngle(A,C_2);
    var b_2 = losToEdge(B_2,a,A);

    if(C_2 > 0 && B_2 > 0 && b_2 > 0){
        triangle.sides[2].angle = C_1.toFixed(4) + " or " + C_2.toFixed(4);
        triangle.sides[1].angle = B_1.toFixed(4) + " or " + B_2.toFixed(4);
        triangle.sides[1].edge = b_1.toFixed(4) + " or " + b_2.toFixed(4);
    } else {
        triangle.sides[2].angle = C_1;
        triangle.sides[1].angle = B_1;
        triangle.sides[1].edge = b_1;
    }
    return triangle;
};

//law of sines; returning an angle
var losToAngle = function(a,b,B){
    return Math.asin(Math.sin(B) * a / b);
};

//law of sines; returning an edge
var losToEdge = function(A,b,B){
    return b * Math.sin(A) / Math.sin(B);
};

//law of cosines; returning an angle
var locToAngle = function(a,b,c){
   return  Math.acos((Math.pow(b,2) + Math.pow(c,2) - Math.pow(a,2)) / (2*b*c));
};
//law of cosines; returning an edge
var locToEdge = function(a,b,C){
    return Math.sqrt(Math.pow(a,2) + Math.pow(b,2) - 2*a*b*Math.cos(C));
};

//law of 180 degree in a triangle; returning remaining angle
var remainingAngle = function(A,B){
    return Math.PI - A - B;
};







//fromSAS,fromSSS, fromASA, fromSAA, fromAAS, fromSSA, fromASS
var test = function () {
    var t = Triangle();
    t.sides[0].edge = 1;
    t.sides[1].edge = 1;
    t.sides[0].angle = 1;

    calculateRemainingParameters(t);

    console.log(t);
};
test();

//TODO vorher noch auf genau 3 Inputs testen!