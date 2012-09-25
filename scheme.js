 // Author: Travis Hoover, thoov7@gmail.com

Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
}

//
// Alist is the symbol table.
//
// Holds all of the symbols and their values along with primative functions.
//
var alist = { type:'NULL' };
var primfns = [];

//
// Make functions for the alist
//
var makeNumber = function ( number ) {

    return { type:'NUMBER', val:number };
}
var makeNull = function () {
    
    return { type:'NULL' };
}
var makeSymbol = function( symbol ) {
    
    return { type:'SYMBOL', val:symbol };    
}
var makeString = function( string ) {
    
    return { type:'STRING', val:string };
}
var makeCons = function ( car, cdr ) {
    
    return { type:'CONS', car:car, cdr:cdr };
}
var makePrimFunction = function ( number ) {
    return { type:'PRIM', val:number };
}

var makeLambdaFunction = function () {
    
    return {};
}


//
// load the primative functions and constants into the alist.
//
alist = makeCons( makeCons(makeSymbol('def'), makePrimFunction(1)),  alist);
alist = makeCons( makeCons(makeSymbol('+'), makePrimFunction(2)),  alist);
alist = makeCons( makeCons(makeSymbol('-'), makePrimFunction(3)),  alist);
alist = makeCons( makeCons(makeSymbol('PI'), makeNumber(3.14)),  alist);
alist = makeCons( makeCons(makeSymbol('lambda'), makePrimFunction(4)),  alist);
//alist = makeCons( makeCons(makeSymbol('exp'), makeLambdaFunction(4)),  alist);
//console.log(alist);


//
// Prim function for def
//
// TODO: make sure correct types.
//
primfns[1] = function (sexpr) {
    
    
    if (sexpr.length !== 3) {
        
        console.log('Invalid call of definition. Must have 3 elements, ' + sexpr.length + ' elements present.');
        process.exit(1);
    }
    
    var def = sexpr[0]; // The def keyword is the first token on the stack.

    var variable = sexpr[1]; // The second token is the variable being defined.
    
    if (variable.type !== 'SYMBOL') {
        
        console.log('Invalid definition type. Must be a symbol, a ' + variable.type + ' given.');
        process.exit(1);
    }

    //
    // The third param is the value for the variable
    // It can either be an atom or a sub list. We eval it to get a value.
    //
    var value = eval(sexpr[2]);
    
    
    //
    // Insert into alist the new variable that was defined.
    //
    if (typeof value === 'number') {
        
        alist = makeCons( makeCons(variable, makeNumber(value)),  alist);   
    }
    else if (typeof value === 'string') {
    
        alist = makeCons( makeCons(variable, makeString(value)),  alist);
    }
    else if (typeof value === 'object') {
        
        //
        // This is a lambda function. We need to go and rename variables.
        // Here we need to pre process functions to protect local variables.
        //
        
        
        var prefixFunctionName = variable;
        var prefixedParameterNames = [];

        //
        // Convert the old parameters into the new ones.
        //
        for (var i = 0; i < value.parameters.length; i++) {
            prefixedParameterNames.push( value.parameters[i].val );
            
            value.parameters[i].val = prefixFunctionName.val + '_' + value.parameters[i].val;
        }        
        
        //
        // Replace local variables with new names.
        //
        for (var i = 0; i < value.expression.length; i++) {
            
            if (prefixedParameterNames.contains(value.expression[i].val)) {
                
                value.expression[i].val = prefixFunctionName.val + '_' + value.expression[i].val;
            }
        }  
                
        alist = makeCons( makeCons(variable, value),  alist);
    }
    else {
        
        console.log("Feature not added yet.");
        process.exit(1);
    }
    
    return true;
}

//
// Prim function for +
//
primfns[2] = function (sexpr) {

    var plus = sexpr[0]; // The plus sign

    var value = eval(sexpr[1]); // The first element after the + sign goes on the left hand side of the plus sign.


    //
    // Loop through the rest of the elments and add them up.
    //
    for (var i = 2; i < sexpr.length; i++) {
        
        value += eval(sexpr[i]);
    }
    
    return value;
}

//
// Prim function for -
//
primfns[3] = function (sexpr) {

    var minus = sexpr[0]; // The minus sign

    var value = eval(sexpr[1]); // The first element after the - sign goes on the left hand side of the minus sign.


    //
    // Loop through the rest of the elments and subtract them up.
    //
    for (var i = 2; i < sexpr.length; i++) {

        value -= eval(sexpr[i]);
    }

    return value;
}

//
// Prim function for lambda
//
// (def exp (lambda (x) (* x x)))
//
// TODO: make sure correct types.
//
primfns[4] = function (sexpr) {

    var lambda = sexpr[0]; // The lambda keyword is the first token on the stack.
    var parameters = sexpr[1]; // The second token is the variable being defined.
    var body = sexpr[2]; // The third element is the expression of the function.
    
    console.log({ type:'LAMBDA', parameters:parameters.val, expression:body.val });

    return { type:'LAMBDA', parameters:parameters.val, expression:body.val };
}


//
// Loopup symbols inside of the alist.
//
// @param symbol - The symbol to find inside of the alist.
// @return - { type:'PRIM', val:1 } or { type:'NUMBER', val:23} or false if not found.
//
var lookup = function (symbol) {

    var alistPtr = alist;
        
    while (alistPtr.type !== 'NULL') {
        
        if (alistPtr.car.car.val == symbol.val) {

            // The return value is like { type:'PRIM', val:1 } or { type:'NUMBER', val:23}
            return alistPtr.car.cdr;
        }
        else {
            
            alistPtr = alistPtr.cdr; // "advance the pointer"

            // If null then we are at the end of the alist.
            if (alistPtr.type === 'NULL') { alistPtr = { type:'NULL' }; } 
        }
    }
    
    return false;
}

//
// Print the symbols in the alist. Used only for debugging.
//
var listSymbols = function () {
    
    var alistPtr = alist;
    
    while (alistPtr.type !== 'NULL') {
    
        console.log(alistPtr.car.car.val);
                
        alistPtr = alistPtr.cdr; // "advance the pointer"

        // If null then we are at the end of the alist.
        if (alistPtr.type === 'NULL') { alistPtr = { type:'NULL' }; }     
    }
}

var evalLambda = function ( parentExpression, lambdaFunction ) {

    var lambdaParameters = lambdaFunction.parameters;
    var lambdaExpression = lambdaFunction.expression;
    
    if (lambdaParameters.length !== parentExpression.length - 1) {
        
        console.log("Lambda function " + parentExpression[0].val + " invoked with invalid parameters.");
        process.exit(1);
    }
    
    
    //
    // Add the temp variables into the alist.
    //
    for (var i = 1, j = 0; i < parentExpression.length; i++, j++) {
        
        alist = makeCons( makeCons(lambdaParameters[j], makeNumber(parentExpression[i].val)),  alist);
    }
    
    //
    // Evaluate the function expression.
    //
    return eval({ type:'LIST', val:lambdaExpression });
}


//
// Evaluation function. Pops off sexpr from a tokenized stack of sexpr.
//
// @param SEXPR - A stack of sexpr expressions to be evaluated.
// @param RETURN - Return the value of an individual token.
//
var eval = function( SEXPR ) {

    var currentSexpr = SEXPR;
    var parentExpression = SEXPR;

    //
    // If the sexpr is a list then we want to eval the array.
    //
    if (SEXPR.type === 'LIST') {
        currentSexpr = SEXPR.val[0];
        parentExpression = SEXPR.val;
    }


    if (currentSexpr.type === 'SYMBOL') {
        
        var lookupValue = lookup( currentSexpr );
        
        if (lookupValue.type === 'PRIM') {
             
            return primfns[lookupValue.val]( parentExpression );
        }
        else if (lookupValue.type === 'LAMBDA') {

            console.log(parentExpression);
            return evalLambda( parentExpression, lookupValue );
        }
        else if (lookupValue.type !== 'NULL') {
            
            return lookupValue.val;
        }
        else {
            
            // Error invalid symbol not defined.  
            process.exit(1); 
        }
    }
    else if(currentSexpr.type === 'LIST') {
        
        return eval(currentSexpr.val);
    }
    else { // Numbers and strings

        return currentSexpr.val;
    }
}





var tokenized = null;
var createItem = function (identifier, value) { return {type:identifier.toUpperCase, val:value}; };
var create_null = function () { return { type:'NULL' }; }
var create_string = function (x) { return { type:'STRING', val:x }; }
var create_symbol = function (x) { return { type:'SYMBOL', val:x }; }
var create_number = function (x) { return { type:"NUMBER", val:x }; }
var create_list = function (x) { 
    
    if ( isArray(x) ) { return { type:'LIST', val:x }; }
    
    return { type:'LIST', val:[x] }; 
}
var create_dot_list = function (x, y) { 
    
    var array = []; // this holds the "proper" array
    
    //
    // Before the dot
    //
    if ( isArray(x.val) ) {
        for ( var i = 0; i < x.val.length; i++ ) {
            array.push(x.val[i]);
        }
    }
    else { array.push(x); }
    
    //
    // After the dot
    //
    if ( isArray(y.val) ) {
        for ( var i = 0; i < y.val.length; i++ ) {
            array.push(y.val[i]);
        }
    }
    else { array.push(y); }

    return { type:'LIST', val:array };
}
var array_append = function (x, y) { 
    
    if( isArray(x) ) { x.push(y); return x; }
    
    return [x,y];    
}

var isArray = function (x) { return ( x instanceof Array ); }


/*
	Default template driver for JS/CC generated parsers running as
	browser-based JavaScript/ECMAScript applications.
	
	WARNING: 	This parser template will not run as console and has lesser
				features for debugging than the console derivates for the
				various JavaScript platforms.
	
	Features:
	- Parser trace messages
	- Integrated panic-mode error recovery
	
	Written 2007, 2008 by Jan Max Meyer, J.M.K S.F. Software Technologies
	
	This is in the public domain.
*/

var NODEJS__dbg_withtrace		= false;
var NODEJS__dbg_string			= new String();
if(NODEJS__dbg_withtrace){
	var fd = require("fs").openSync("NODEJS__dbg_withtrace.log", "w+");
	require('fs').writeSync(fd, new Date );
}
function __NODEJS_dbg_print( text )
{
	NODEJS__dbg_string += text + "\n";
}

function __NODEJS_lex( info )
{
	var state		= 0;
	var match		= -1;
	var match_pos	= 0;
	var start		= 0;
	var pos			= info.offset + 1;

	do
	{
		pos--;
		state = 0;
		match = -2;
		start = pos;

		if( info.src.length <= start )
			return 13;

		do
		{

switch( state )
{
	case 0:
		if( ( info.src.charCodeAt( pos ) >= 0 && info.src.charCodeAt( pos ) <= 8 ) || ( info.src.charCodeAt( pos ) >= 11 && info.src.charCodeAt( pos ) <= 12 ) || ( info.src.charCodeAt( pos ) >= 14 && info.src.charCodeAt( pos ) <= 31 ) || info.src.charCodeAt( pos ) == 33 || ( info.src.charCodeAt( pos ) >= 35 && info.src.charCodeAt( pos ) <= 38 ) || ( info.src.charCodeAt( pos ) >= 42 && info.src.charCodeAt( pos ) <= 43 ) || info.src.charCodeAt( pos ) == 45 || info.src.charCodeAt( pos ) == 47 || info.src.charCodeAt( pos ) == 58 || ( info.src.charCodeAt( pos ) >= 60 && info.src.charCodeAt( pos ) <= 63 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 95 ) || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 254 ) ) state = 1;
		else if( ( info.src.charCodeAt( pos ) >= 9 && info.src.charCodeAt( pos ) <= 10 ) ) state = 2;
		else if( info.src.charCodeAt( pos ) == 40 ) state = 3;
		else if( info.src.charCodeAt( pos ) == 41 ) state = 4;
		else if( info.src.charCodeAt( pos ) == 46 ) state = 5;
		else if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) ) state = 6;
		else if( info.src.charCodeAt( pos ) == 34 ) state = 8;
		else if( info.src.charCodeAt( pos ) == 13 ) state = 9;
		else if( info.src.charCodeAt( pos ) == 32 ) state = 10;
		else if( info.src.charCodeAt( pos ) == 59 ) state = 14;
		else state = -1;
		break;

	case 1:
		if( ( info.src.charCodeAt( pos ) >= 0 && info.src.charCodeAt( pos ) <= 31 ) || ( info.src.charCodeAt( pos ) >= 33 && info.src.charCodeAt( pos ) <= 40 ) || ( info.src.charCodeAt( pos ) >= 42 && info.src.charCodeAt( pos ) <= 254 ) ) state = 1;
		else state = -1;
		match = 6;
		match_pos = pos;
		break;

	case 2:
		if( ( info.src.charCodeAt( pos ) >= 0 && info.src.charCodeAt( pos ) <= 31 ) || ( info.src.charCodeAt( pos ) >= 33 && info.src.charCodeAt( pos ) <= 40 ) || ( info.src.charCodeAt( pos ) >= 42 && info.src.charCodeAt( pos ) <= 254 ) ) state = 1;
		else state = -1;
		match = 1;
		match_pos = pos;
		break;

	case 3:
		if( info.src.charCodeAt( pos ) == 32 ) state = 11;
		else state = -1;
		match = 3;
		match_pos = pos;
		break;

	case 4:
		state = -1;
		match = 2;
		match_pos = pos;
		break;

	case 5:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) ) state = 12;
		else state = -1;
		match = 4;
		match_pos = pos;
		break;

	case 6:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) ) state = 6;
		else if( info.src.charCodeAt( pos ) == 46 ) state = 12;
		else if( info.src.charCodeAt( pos ) == 32 ) state = 16;
		else state = -1;
		match = 5;
		match_pos = pos;
		break;

	case 7:
		state = -1;
		match = 7;
		match_pos = pos;
		break;

	case 8:
		if( info.src.charCodeAt( pos ) == 34 ) state = 7;
		else if( ( info.src.charCodeAt( pos ) >= 0 && info.src.charCodeAt( pos ) <= 33 ) || ( info.src.charCodeAt( pos ) >= 35 && info.src.charCodeAt( pos ) <= 254 ) ) state = 8;
		else state = -1;
		break;

	case 9:
		if( ( info.src.charCodeAt( pos ) >= 0 && info.src.charCodeAt( pos ) <= 9 ) || ( info.src.charCodeAt( pos ) >= 11 && info.src.charCodeAt( pos ) <= 31 ) || ( info.src.charCodeAt( pos ) >= 33 && info.src.charCodeAt( pos ) <= 40 ) || ( info.src.charCodeAt( pos ) >= 42 && info.src.charCodeAt( pos ) <= 254 ) ) state = 1;
		else if( info.src.charCodeAt( pos ) == 10 ) state = 2;
		else state = -1;
		match = 6;
		match_pos = pos;
		break;

	case 10:
		if( info.src.charCodeAt( pos ) == 41 ) state = 4;
		else state = -1;
		match = 1;
		match_pos = pos;
		break;

	case 11:
		state = -1;
		match = 3;
		match_pos = pos;
		break;

	case 12:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) ) state = 12;
		else state = -1;
		match = 5;
		match_pos = pos;
		break;

	case 13:
		if( ( info.src.charCodeAt( pos ) >= 0 && info.src.charCodeAt( pos ) <= 9 ) || ( info.src.charCodeAt( pos ) >= 11 && info.src.charCodeAt( pos ) <= 254 ) ) state = 13;
		else if( info.src.charCodeAt( pos ) == 10 ) state = 15;
		else state = -1;
		break;

	case 14:
		if( info.src.charCodeAt( pos ) == 10 ) state = 2;
		else if( info.src.charCodeAt( pos ) == 32 || info.src.charCodeAt( pos ) == 41 ) state = 13;
		else if( ( info.src.charCodeAt( pos ) >= 0 && info.src.charCodeAt( pos ) <= 9 ) || ( info.src.charCodeAt( pos ) >= 11 && info.src.charCodeAt( pos ) <= 31 ) || ( info.src.charCodeAt( pos ) >= 33 && info.src.charCodeAt( pos ) <= 40 ) || ( info.src.charCodeAt( pos ) >= 42 && info.src.charCodeAt( pos ) <= 254 ) ) state = 14;
		else state = -1;
		match = 6;
		match_pos = pos;
		break;

	case 15:
		state = -1;
		match = 1;
		match_pos = pos;
		break;

	case 16:
		state = -1;
		match = 5;
		match_pos = pos;
		break;

}


			pos++;

		}
		while( state > -1 );

	}
	while( 1 > -1 && match == 1 );

	if( match > -1 )
	{
		info.att = info.src.substr( start, match_pos - start );
		info.offset = match_pos;
		
switch( match )
{
	case 5:
		{
		 info.att = parseFloat( info.att ); 
		}
		break;

	case 6:
		{
		 /*symbols cannot begin with digits, parens, quotes, dots, etc.*/ 
		}
		break;

	case 7:
		{
		 info.att = info.att.substr( 1, info.att.length - 2 ); 
		}
		break;

}


	}
	else
	{
		info.att = new String();
		match = -1;
	}

	return match;
}


function __NODEJS_parse( src, err_off, err_la )
{
	var		sstack			= new Array();
	var		vstack			= new Array();
	var 	err_cnt			= 0;
	var		act;
	var		go;
	var		la;
	var		rval;
	var 	parseinfo		= new Function( "", "var offset; var src; var att;" );
	var		info			= new parseinfo();
	
/* Pop-Table */
var pop_tab = new Array(
	new Array( 0/* readonce' */, 1 ),
	new Array( 9/* readonce */, 1 ),
	new Array( 8/* sexpr */, 1 ),
	new Array( 8/* sexpr */, 1 ),
	new Array( 11/* list */, 2 ),
	new Array( 11/* list */, 3 ),
	new Array( 11/* list */, 5 ),
	new Array( 12/* members */, 2 ),
	new Array( 12/* members */, 1 ),
	new Array( 10/* atom */, 1 ),
	new Array( 10/* atom */, 1 ),
	new Array( 10/* atom */, 1 )
);

/* Action-Table */
var act_tab = new Array(
	/* State 0 */ new Array( 5/* "NUMBER" */,5 , 6/* "SYMBOL" */,6 , 7/* "STRING" */,7 , 3/* "LPAREN" */,8 ),
	/* State 1 */ new Array( 13/* "$" */,0 ),
	/* State 2 */ new Array( 13/* "$" */,-1 ),
	/* State 3 */ new Array( 13/* "$" */,-2 , 2/* "RPAREN" */,-2 , 4/* "DOT" */,-2 , 5/* "NUMBER" */,-2 , 6/* "SYMBOL" */,-2 , 7/* "STRING" */,-2 , 3/* "LPAREN" */,-2 ),
	/* State 4 */ new Array( 13/* "$" */,-3 , 2/* "RPAREN" */,-3 , 4/* "DOT" */,-3 , 5/* "NUMBER" */,-3 , 6/* "SYMBOL" */,-3 , 7/* "STRING" */,-3 , 3/* "LPAREN" */,-3 ),
	/* State 5 */ new Array( 13/* "$" */,-9 , 2/* "RPAREN" */,-9 , 4/* "DOT" */,-9 , 5/* "NUMBER" */,-9 , 6/* "SYMBOL" */,-9 , 7/* "STRING" */,-9 , 3/* "LPAREN" */,-9 ),
	/* State 6 */ new Array( 13/* "$" */,-10 , 2/* "RPAREN" */,-10 , 4/* "DOT" */,-10 , 5/* "NUMBER" */,-10 , 6/* "SYMBOL" */,-10 , 7/* "STRING" */,-10 , 3/* "LPAREN" */,-10 ),
	/* State 7 */ new Array( 13/* "$" */,-11 , 2/* "RPAREN" */,-11 , 4/* "DOT" */,-11 , 5/* "NUMBER" */,-11 , 6/* "SYMBOL" */,-11 , 7/* "STRING" */,-11 , 3/* "LPAREN" */,-11 ),
	/* State 8 */ new Array( 2/* "RPAREN" */,10 , 5/* "NUMBER" */,5 , 6/* "SYMBOL" */,6 , 7/* "STRING" */,7 , 3/* "LPAREN" */,8 ),
	/* State 9 */ new Array( 2/* "RPAREN" */,13 , 4/* "DOT" */,14 , 5/* "NUMBER" */,5 , 6/* "SYMBOL" */,6 , 7/* "STRING" */,7 , 3/* "LPAREN" */,8 ),
	/* State 10 */ new Array( 13/* "$" */,-4 , 2/* "RPAREN" */,-4 , 4/* "DOT" */,-4 , 5/* "NUMBER" */,-4 , 6/* "SYMBOL" */,-4 , 7/* "STRING" */,-4 , 3/* "LPAREN" */,-4 ),
	/* State 11 */ new Array( 2/* "RPAREN" */,-8 , 4/* "DOT" */,-8 , 5/* "NUMBER" */,-8 , 6/* "SYMBOL" */,-8 , 7/* "STRING" */,-8 , 3/* "LPAREN" */,-8 ),
	/* State 12 */ new Array( 2/* "RPAREN" */,-7 , 4/* "DOT" */,-7 , 5/* "NUMBER" */,-7 , 6/* "SYMBOL" */,-7 , 7/* "STRING" */,-7 , 3/* "LPAREN" */,-7 ),
	/* State 13 */ new Array( 13/* "$" */,-5 , 2/* "RPAREN" */,-5 , 4/* "DOT" */,-5 , 5/* "NUMBER" */,-5 , 6/* "SYMBOL" */,-5 , 7/* "STRING" */,-5 , 3/* "LPAREN" */,-5 ),
	/* State 14 */ new Array( 5/* "NUMBER" */,5 , 6/* "SYMBOL" */,6 , 7/* "STRING" */,7 , 3/* "LPAREN" */,8 ),
	/* State 15 */ new Array( 2/* "RPAREN" */,16 ),
	/* State 16 */ new Array( 13/* "$" */,-6 , 2/* "RPAREN" */,-6 , 4/* "DOT" */,-6 , 5/* "NUMBER" */,-6 , 6/* "SYMBOL" */,-6 , 7/* "STRING" */,-6 , 3/* "LPAREN" */,-6 )
);

/* Goto-Table */
var goto_tab = new Array(
	/* State 0 */ new Array( 9/* readonce */,1 , 8/* sexpr */,2 , 10/* atom */,3 , 11/* list */,4 ),
	/* State 1 */ new Array(  ),
	/* State 2 */ new Array(  ),
	/* State 3 */ new Array(  ),
	/* State 4 */ new Array(  ),
	/* State 5 */ new Array(  ),
	/* State 6 */ new Array(  ),
	/* State 7 */ new Array(  ),
	/* State 8 */ new Array( 12/* members */,9 , 8/* sexpr */,11 , 10/* atom */,3 , 11/* list */,4 ),
	/* State 9 */ new Array( 8/* sexpr */,12 , 10/* atom */,3 , 11/* list */,4 ),
	/* State 10 */ new Array(  ),
	/* State 11 */ new Array(  ),
	/* State 12 */ new Array(  ),
	/* State 13 */ new Array(  ),
	/* State 14 */ new Array( 8/* sexpr */,15 , 10/* atom */,3 , 11/* list */,4 ),
	/* State 15 */ new Array(  ),
	/* State 16 */ new Array(  )
);



/* Symbol labels */
var labels = new Array(
	"readonce'" /* Non-terminal symbol */,
	"WHITESPACE" /* Terminal symbol */,
	"RPAREN" /* Terminal symbol */,
	"LPAREN" /* Terminal symbol */,
	"DOT" /* Terminal symbol */,
	"NUMBER" /* Terminal symbol */,
	"SYMBOL" /* Terminal symbol */,
	"STRING" /* Terminal symbol */,
	"sexpr" /* Non-terminal symbol */,
	"readonce" /* Non-terminal symbol */,
	"atom" /* Non-terminal symbol */,
	"list" /* Non-terminal symbol */,
	"members" /* Non-terminal symbol */,
	"$" /* Terminal symbol */
);


	
	info.offset = 0;
	info.src = src;
	info.att = new String();
	
	if( !err_off )
		err_off	= new Array();
	if( !err_la )
	err_la = new Array();
	
	sstack.push( 0 );
	vstack.push( 0 );
	
	la = __NODEJS_lex( info );
	while( true )
	{
		act = 18;
		for( var i = 0; i < act_tab[sstack[sstack.length-1]].length; i+=2 )
		{
			if( act_tab[sstack[sstack.length-1]][i] == la )
			{
				act = act_tab[sstack[sstack.length-1]][i+1];
				break;
			}
		}

		if( NODEJS__dbg_withtrace && sstack.length > 0 )
		{
			__NODEJS_dbg_print( "\nState " + sstack[sstack.length-1] + "\n" +
							"\tLookahead: " + labels[la] + " (\"" + info.att + "\")\n" +
							"\tAction: " + act + "\n" + 
							"\tSource: \"" + info.src.substr( info.offset, 30 ) + ( ( info.offset + 30 < info.src.length ) ?
									"..." : "" ) + "\"\n" +
							"\tStack: " + sstack.join() + "\n" +
							"\tValue stack: " + vstack.join() + "\n" );
		}
		
			
		//Panic-mode: Try recovery when parse-error occurs!
		if( act == 18 )
		{
			if( NODEJS__dbg_withtrace )
				__NODEJS_dbg_print( "Error detected: There is no reduce or shift on the symbol " + labels[la] );
			
			err_cnt++;
			err_off.push( info.offset - info.att.length );			
			err_la.push( new Array() );
			for( var i = 0; i < act_tab[sstack[sstack.length-1]].length; i+=2 )
				err_la[err_la.length-1].push( labels[act_tab[sstack[sstack.length-1]][i]] );
			
			//Remember the original stack!
			var rsstack = new Array();
			var rvstack = new Array();
			for( var i = 0; i < sstack.length; i++ )
			{
				rsstack[i] = sstack[i];
				rvstack[i] = vstack[i];
			}
			
			while( act == 18 && la != 13 )
			{
				if( NODEJS__dbg_withtrace )
					__NODEJS_dbg_print( "\tError recovery\n" +
									"Current lookahead: " + labels[la] + " (" + info.att + ")\n" +
									"Action: " + act + "\n\n" );
				if( la == -1 )
					info.offset++;
					
				while( act == 18 && sstack.length > 0 )
				{
					sstack.pop();
					vstack.pop();
					
					if( sstack.length == 0 )
						break;
						
					act = 18;
					for( var i = 0; i < act_tab[sstack[sstack.length-1]].length; i+=2 )
					{
						if( act_tab[sstack[sstack.length-1]][i] == la )
						{
							act = act_tab[sstack[sstack.length-1]][i+1];
							break;
						}
					}
				}
				
				if( act != 18 )
					break;
				
				for( var i = 0; i < rsstack.length; i++ )
				{
					sstack.push( rsstack[i] );
					vstack.push( rvstack[i] );
				}
				
				la = __NODEJS_lex( info );
			}
			
			if( act == 18 )
			{
				if( NODEJS__dbg_withtrace )
					__NODEJS_dbg_print( "\tError recovery failed, terminating parse process..." );
				break;
			}


			if( NODEJS__dbg_withtrace )
				__NODEJS_dbg_print( "\tError recovery succeeded, continuing" );
		}
		
		/*
		if( act == 18 )
			break;
		*/
		
		
		//Shift
		if( act > 0 )
		{			
			if( NODEJS__dbg_withtrace )
				__NODEJS_dbg_print( "Shifting symbol: " + labels[la] + " (" + info.att + ")" );
		
			sstack.push( act );
			vstack.push( info.att );
			
			la = __NODEJS_lex( info );
			
			if( NODEJS__dbg_withtrace )
				__NODEJS_dbg_print( "\tNew lookahead symbol: " + labels[la] + " (" + info.att + ")" );
		}
		//Reduce
		else
		{		
			act *= -1;
			
			if( NODEJS__dbg_withtrace )
				__NODEJS_dbg_print( "Reducing by producution: " + act );
			
			rval = void(0);
			
			if( NODEJS__dbg_withtrace )
				__NODEJS_dbg_print( "\tPerforming semantic action..." );
			
switch( act )
{
	case 0:
	{
		rval = vstack[ vstack.length - 1 ];
	}
	break;
	case 1:
	{
		 tokenized = vstack[ vstack.length - 1 ]; 
	}
	break;
	case 2:
	{
		rval = vstack[ vstack.length - 1 ];
	}
	break;
	case 3:
	{
		 rval = vstack[ vstack.length - 1 ]; 
	}
	break;
	case 4:
	{
		 rval = create_null(); 
	}
	break;
	case 5:
	{
		 rval = create_list(vstack[ vstack.length - 2 ]) 
	}
	break;
	case 6:
	{
		 rval = create_dot_list(vstack[ vstack.length - 4 ], vstack[ vstack.length - 2 ]); 
	}
	break;
	case 7:
	{
		 rval = array_append(vstack[ vstack.length - 2 ], vstack[ vstack.length - 1 ]); 
	}
	break;
	case 8:
	{
		 rval = vstack[ vstack.length - 1 ]; 
	}
	break;
	case 9:
	{
		 rval = create_number(vstack[ vstack.length - 1 ]); 
	}
	break;
	case 10:
	{
		 rval = create_symbol(vstack[ vstack.length - 1 ]); 
	}
	break;
	case 11:
	{
		 rval = create_string(vstack[ vstack.length - 1 ]); 
	}
	break;
}



			if( NODEJS__dbg_withtrace )
				__NODEJS_dbg_print( "\tPopping " + pop_tab[act][1] + " off the stack..." );
				
			for( var i = 0; i < pop_tab[act][1]; i++ )
			{
				sstack.pop();
				vstack.pop();
			}
									
			go = -1;
			for( var i = 0; i < goto_tab[sstack[sstack.length-1]].length; i+=2 )
			{
				if( goto_tab[sstack[sstack.length-1]][i] == pop_tab[act][0] )
				{
					go = goto_tab[sstack[sstack.length-1]][i+1];
					break;
				}
			}
			
			if( act == 0 )
				break;
				
			if( NODEJS__dbg_withtrace )
				__NODEJS_dbg_print( "\tPushing non-terminal " + labels[ pop_tab[act][0] ] );
				
			sstack.push( go );
			vstack.push( rval );			
		}
		
		if( NODEJS__dbg_withtrace )
		{	
				
			require('fs').writeSync(fd, NODEJS__dbg_string );
			NODEJS__dbg_string = new String();
		}
	}

	if( NODEJS__dbg_withtrace )
	{
		__NODEJS_dbg_print( "\nParse complete." );
		require('fs').writeSync(fd, NODEJS__dbg_string );
		NODEJS__dbg_string = new String();
	}
	
	return err_cnt;
}



var error_offsets = new Array();
var error_lookaheads = new Array();
var error_count = 0;
var DEBUG = false;

console.log("Welcome to the Scheme REPL by Travis Hoover");

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdout.write("> ");

process.argv.forEach(function (val, index, array) {
    if( val === '--debug' || val === '-d' ){
        DEBUG = true;
    }
});

process.stdin.on('data', function (text) {

    // ( R )
    
    text = text.trim();
    
    if( text != "" ) {
        
                    
        if (text.toLowerCase() == 'print alist') {
            
            listSymbols();
        }
        else if (text.toLowerCase() == 'print tokens') {
            
            console.log('> Tokenized: ');
            console.log(JSON.stringify(tokenized)); 
        }
        else {
        
            // send text to scheme tokenizer ( E )
            if( ( error_count = __NODEJS_parse( text, error_offsets, error_lookaheads ) ) > 0 ) {
           
                for( var i = 0; i < error_count; i++ )
                    console.log( "Parse error near " + text.substr( error_offsets[i] ) + ", expecting \"" + error_lookaheads[i].join() + "\"" );
            }
            else {
          
                console.log(eval(tokenized)); // Print the evaluated expression ( P )
            }
        }
    }
    process.stdout.write("> "); // now loop or wait for user input again ( L )
});

