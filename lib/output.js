
function Output(tokens){
    this.consumed = 0;
    this.tokens = tokens;
}

Output.prototype.find = function(what, start, options){
    options = options || {};
    var skip = options.skip;
    var stack = options.stack;
    var dir = options.dir || 1;
    var stacked = 0;
    var tokens = this.tokens;
    while(start >= 0 && start < tokens.length){
        var token = tokens[start];
        var type = token[0];

        if(what.indexOf(type) !== -1){
            if(stacked > 0){
                stacked--; 
            } else {
                return start;
            }
        } else if(type === stack){
            stacked++;
        } else if(typeof skip !== 'undefined' && skip.indexOf(type) === -1) {
            return -1;
        }

        start += dir;
    }
    return -1;
};

Output.prototype.capturePart = function(start){
    var tokens = this.tokens;
    var end = start;
    var next;
    var wasWord = false;
    while(end < tokens.length){
        if(wasWord){
            next = this.find(['dot', 'start_access', 'start_head'], end, {
                skip: ['space', 'comment']
            });
            wasWord = false;
        } else {
            next = this.find(['word', 'literal', 'start_head'], end, {
                skip: ['space', 'comment']
            });
            wasWord = true;
        }
        if(next === -1){
            break;
        }
        var token = tokens[next];
        var toFind;
        if(token[0] === 'start_access'){
            toFind = 'end_access';
        } else if(token[0] === 'start_head'){
            toFind = 'end_head';
            wasWord = true;
        }
        if(toFind){
            next = this.find([toFind], next+1, {
                stack: token[0]
            });
            if(next === -1){
                break;
            }
        }
        end = next + 1; //always exclusive index
    }
    return [start, end];
};

Output.prototype.captureExpression = function(start){
    var tokens = this.tokens;
    var first = this.find(['word', 'literal', 'function', 'start_head'], start);
    var firstToken = tokens[first];
    
    if(firstToken[0] === 'function'){
        var head_start = this.find(['start_head'], first+1, {
            skip: ['space', 'comment']
        });
        if(head_start === -1) return [start, start, start];
        var head_end = this.find(['end_head'], head_start+1, {
            stack: 'start_head'
        });
        if(head_end === -1) return [start, start, start];
        var body_start = this.find(['start_body'], head_end+1, {
            skip: ['space', 'comment']
        });
        if(body_start === -1) return [start, start, start];
        var body_end = this.find(['end_body'], body_start+1, {
            stack: 'start_body',
        });
        if(body_end === -1) return [start, start, start];
        return [start, body_end+1, first];
    }
    return [start, this.capturePart(first)[1], first];
};

Output.prototype.insert = function(start, insert){
    if(start <= this.consumed){
        this.consumed += insert.length;
    }
    var args = [start, 0];
    args.push.apply(args, insert);
    this.tokens.splice.apply(this.tokens, args);
};

Output.prototype.remove = function(start, end){
    var length = end - start;
    if(start < this.consumed){
        if(end < this.consumed){ 
            this.consumed -= length;
        } else {
            this.consumed = start;
        }
    }
    return this.tokens.splice(start, length);
};

Output.prototype.makeFunctions = function(){
    this.consumed = 0;
    var tokens = this.tokens;
    var token;
    var type;
    //Find and make all functions
    while(this.consumed<tokens.length){
        token = tokens[this.consumed];
        type = token[0];
        if(type === 'start_head'){
            this.makeFunction();
        }
        this.consumed++;
    }
};

Output.prototype.makeCallbacksAndClasses = function(){
    this.consumed = 0;
    var tokens = this.tokens;
    var token;
    var type;
    while(this.consumed<tokens.length){
        token = tokens[this.consumed];
        type = token[0];
        if(type === 'callback'){
            this.compileCallback();
        } else if(type === 'colon'){
            this.compileColon();
        }
        this.consumed++;
    }
};

Output.prototype.compile = function(){
    this.makeFunctions(); 
    this.makeCallbacksAndClasses();

    var tokens = this.tokens;

    var string = '';
    for(var i=0; i<tokens.length; i++){
        string += this.print(tokens[i]);
    }
    return string;
};

var printLookup = {
    'start_head': '(',
    'end_head': ')',
    'start_body': '{',
    'end_body': '}',
    'start_access': '[',
    'end_access': ']',
    'colon': ':',
    'comma': ',',
    'terminator': ';',
    'asterix': '*',
    'function': 'function',
    'dot': '.',
    'conditional': '?',
};

Output.prototype.print = function(token){
    var type = token[0];

    if(type === 'word' || type === 'space' || type === 'comment' || type === 'comparator' || type === 'operator' || type === 'literal' || type === 'assignment'){
        return token[1];
    }
    var lookup = printLookup[type];
    if(lookup){
        return lookup;
    }
    return "UNKNOWN# "+JSON.stringify(token);
};

Output.prototype.compileColon = function(){

    var previousWord = this.find(['word'], this.consumed-1, {
        dir: -1,
        skip: ['space', 'comment']
    });
    
    if(previousWord === -1) return;
    
    var previousDot = this.find(['dot'], previousWord-1, {
        dir: -1,
        skip: ['space', 'comment']
    });
    
    var nextFunction = this.find(['function'], this.consumed+1, {
        skip: ['space', 'comment'],
    });
    
    if(nextFunction === -1) return;
    
    this.remove(this.consumed, nextFunction);

    if(previousDot !== -1){
        //Add this to the prototype
        this.insert(previousDot+1, [
            ['word', 'prototype'],
            ['dot'],
        ]);
        
        this.insert(this.consumed, [
            ['space', ' '],
            ['assignment', '='],
            ['space', ' '],
        ]);
        return;
    } 

    var wordToken = this.tokens[previousWord];

    this.remove(previousWord, previousWord+1);

    //This is the constructor, move the word after 'function'
    var fnStart = this.find(['function'], this.consumed, {
        skip: ['space', 'comment']  
    });
    if(fnStart === -1) return;
    
    var fnSpace = this.find(['space'], fnStart+1, {
        skip: []  
    });
    if(fnSpace === -1){
        this.insert(fnStart+1, [
            ['space', ' '],
        ]);
        fnSpace = fnStart + 1;
    }

    this.insert(fnSpace+1, [
        wordToken
    ]);
};

Output.prototype.compileCallback = function(){
    this.remove(this.consumed, this.consumed+1);

    var headEnd = this.find(['end_head'], this.consumed-1, {
        dir: -1,
        skip : ['space', 'comment'],
    });
    if(headEnd === -1) return;

    var boundary = this.captureExpression(this.consumed);

    var bfirst = this.tokens[boundary[2]];

    var headPreviousArg = false;

    for(var i=headEnd-1; i>=0; i--){
        var token = this.tokens[i];
        var type = token[0];
        if(type === 'start_head') break;
        if(type !== 'space' && type !== 'comment'){
            headPreviousArg = true;
            break;
        }
    }

    var expression = this.remove(boundary[0], boundary[1]);
    if(headPreviousArg){
        expression.unshift(['comma']);
    }

    if(bfirst[0] === 'function'){
        expression.push(
            ['dot'],
            ['word', 'bind'],
            ['start_head'],
            ['word', 'this'],
            ['end_head']
        );
    }
    this.insert(headEnd, expression);

    this.consumed = headEnd;
};

Output.prototype.compileOptionalArgs = function(args){
    var checks = [];
    for(var i=0; i<args.length; i++){
        var arg = args[i];
        if(arg.length !== 2) continue;
        var word = arg[0];
        if(word[0] !== 'word') continue;
        var second = arg[1];
        if(second[0] !== 'conditional') continue; 
        break;
    }
    if(i<args.length){
        var last = args[args.length-1];
        if(last.length !== 1) return [];
        if(last[0][0] !== 'word') return [];

        var changes = [];
        var previous;
        for(var i2=i; i2<args.length; i2++){
            var current = args[i2];
            if(current.length > 1){
                current.splice(1, current.length-1);
            }
            if(current[0][0] !== 'word') return [];
            if(previous){
                changes.push([
                    current[0],
                    ['assignment', '='],
                    previous[0] ,
                    ['terminator']
                ]);
            } else {
                changes.push([
                    current[0],
                    ['assignment', '='],
                    ['word', 'undefined'],
                    ['terminator']
                ]);
            }
            previous = current;
        }

        checks.push(
            ['word', 'if'],
            ['start_head'],
            last[0],
            ['comparator', '==='],
            ['word', 'null'],
            ['comparator', '||'],
            ['word', 'typeof'],
            ['space', ' '],
            last[0],
            ['comparator', '==='],
            ['literal', "'undefined'", 'string'],
            ['end_head'],
            ['start_body']
        );

        for(var i3=changes.length-1; i3>=0; i3--){
            checks.push.apply(checks,changes[i3]);
        }

        checks.push(['end_body']);
    }
    return checks;
};

Output.prototype.compileArg = function(arg){
    for(var i=0; i<arg.length; i++){
        var part = arg[i];
        var ptype = part[0];
        if(ptype === 'comment' || ptype === 'space'){
            arg.splice(i, 1);
            i--;
        }
    }
    if(arg.length < 2){
        return [];
    }

    var p1 = arg[0];
    var p1t = p1[0];
    var p2 = arg[1];
    var p2t = p2[0];
        
    var right = arg.slice(2);
    
    if(p1t !== 'word') return [];

    var check = [];

    if(p2t === 'colon'){

        makeDefaultValueCheck(p1, right, check);
        arg.splice(1, arg.length - 1);

    } else if (p2t === 'operator' && p2[1] === '!'){

        makeErrorPassingCheck(p1, right, check);
        arg.splice(1, arg.length - 1);

    }

    return check;
};

Output.prototype.makeFunction = function(){
    //First we gotta check if this is a function head

    var tokens = this.tokens;
    var mustBeComma = false;
    var free = false;

    for(var i=this.consumed+1; i<tokens.length; i++){
        var token = this.tokens[i];
        var type = token[0];

        if(type === 'end_head') break;
        if(type === 'space' || type === 'comment') continue;
        if(type === 'comma'){
            mustBeComma = false;
            free = false;
            continue;
        }
        if(mustBeComma){
            //Not a valid head
            return;
        }
        if(type === 'conditional'){
            mustBeComma = true;
            continue;
        }
        if(type === 'operator'){
            if(token[1] === '!'){
                free = true;
                continue;
            } else {
                return;
            }
        }
        if(type === 'literal' || type === 'word'){
            continue;
        }
        if(type === 'colon'){
            free = true;
            continue;
        }
        if(!free){
            return;
        }
    }

    var headEnd = i;
    
    var funcstart = this.find(['callback', 'function'], this.consumed-1, {
        dir: -1,
        skip : ['space', 'word'],
    });
    
    var funcend = this.find(['start_body'], headEnd + 1, {
        skip : ['space'],
    });

    if(funcstart === -1 && funcend === -1) return; //This is not function head
    
    var funcword = this.find(['word'], this.consumed-1, {
        dir: -1,
        skip: 'space'
    });

    if(funcword !== -1){
        var wordType = tokens[funcword][1];
        if(wordType === 'while' || wordType === 'for' || wordType === 'if' || wordType === 'catch'){
            return;
        }
    }

    if(funcstart === -1 || tokens[funcstart][0] !== 'function'){
        this.insert(this.consumed, [['function']]);
        headEnd++;
    }

    var headChecks = this.compileHead(this.consumed+1, headEnd);
    
    headEnd = this.find(['end_head'], this.consumed+1, {
        stack: 'start_head'
    });
    
    var bodyPos = this.insertBody(headEnd + 1);
    var bodyStart = bodyPos[0];

    this.insert(bodyStart + 1, headChecks);
};

Output.prototype.compileHead = function(head_first, head_last){
    var head = this.remove(head_first, head_last);
    var headArgs = [];
    var checks = [];
    for(var i=0; i<head.length;){
        var part = head[i];
        if(part[0] === 'comma'){
            headArgs.push(head.slice(0, i));
            head = head.slice(i+1);
            i = 0;
        } else {
            i++;
        }
    }
    if(head.length > 0){
        headArgs.push(head);
    }
    for(var i2=0; i2<headArgs.length; i2++){
        checks.push.apply(checks, this.compileArg(headArgs[i2]));
    }

    checks.unshift.apply(checks, this.compileOptionalArgs(headArgs));
    
    head = [];
    for(var i3=0; i3<headArgs.length; i3++){
        head.push.apply(head, headArgs[i3]);
        if(i3 < headArgs.length-1){
            head.push(['comma'], ['space', ' ']);
        }
    }

    this.insert(head_first, head);

    return checks;
};


Output.prototype.insertBody = function(start){
    var contentStart = start;
    var startType, startToken;
    for(;contentStart < this.tokens.length; contentStart++){
        startToken = this.tokens[contentStart];
        startType = startToken[0];
        if(startType === 'start_body' || (startType !== 'comment' && startType !== 'space')){
            break;
        }
    }

    var contentEnd = this.find(['end_body'], start+1, {
        stack: 'start_body'
    });

    //Insert the body
    if(startType !== 'start_body'){
        this.insert(start, [['start_body']]);
        if(contentEnd === -1){
            this.tokens.push(['end_body']);
        } else {
            contentEnd++;
            this.insert(contentEnd, [['end_body']]);
        }
    } else {
        start = contentStart;
    }
    
    return [start, contentEnd];
};

module.exports = Output;

function makeErrorPassingCheck(word, right, check){
    //passing on errors
    check.push(
        ['word', 'if'],
        ['start_head'],
        word,
        ['comparator', '!=='],
        ['word', 'null'],
        ['comparator', '&&'],
        ['word', 'typeof'],
        ['space', ' '],
        word,
        ['comparator', '!=='],
        ['literal', "'undefined'", 'string'],
        ['end_head'],
        ['start_body'],
        ['word', 'return'],
        ['space', ' ']
    ); 
    if(right.length > 0){
        check.push.apply(check, right);
        check.push(
                ['start_head'],
                word, 
                ['end_head']
        );
    } else {
        check.push(word);
    }
    check.push(['end_body']);
}

function makeDefaultValueCheck(word, right, check){
    //Using a default value
    check.push(
        ['word', 'if'],
        ['start_head'],
        word,
        ['comparator', '==='],
        ['word', 'null'],
        ['comparator', '||'],
        ['word', 'typeof'],
        ['space', ' '],
        word,
        ['comparator', '==='],
        ['literal', "'undefined'", 'string'],
        ['end_head'],
        ['start_body'],
        word,
        ['assignment', '=']
    ); 
    check.push.apply(check, right);
    check.push(['end_body']);
}
