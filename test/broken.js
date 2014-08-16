
/* 
 *  When using Design.js always
 *  remember to state your
 *  intent quite clearly
 *
 */

// Ambigous:
// Having more than one optional argument could introduce ambiguity
function optionalArguments(first, second?, third) {
}

// Correct:
// Handle additional arguments yourself
function optionalArguments(first, second, third) {if(third===null||typeof third==='undefined'){third=second;second=first;first=undefined;}
    if(third === null || typeof third === 'undefined'){
        third = second;
        second = undefined;
    }
}

// Ambigous:
// There would be two ways to produce correct JS code from this statement
asyncFunction(arg1, arg2, decide)   ? fn1 : fn2

// Correct:
// Make yourself clear
asyncFunction(arg1, arg2, (decide ? fn1 : fn2))  

