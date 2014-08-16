
function Parser(text){
    this._text = text;
    this.consumed = 0;
    this.text = text;
    this.tokens = [];
}

Parser.prototype.consume = function(num){
    this.consumed += num;
    var removed = this.text.slice(0, num);
    this.text = this.text.slice(num);
    return removed;
};

Parser.prototype.peek = function(){
    return this.text;
};

Parser.prototype.parse = function(){
    while(this.peek().length){
        this.consumeNext();
    }
    return this.tokens;
};

var beginNumber = /[0-9]/;
var beginWord = /[a-zA-Z_]/;

Parser.prototype.consumeNext = function(){
    var text = this.peek();

    var first = text.charAt(0);

    if(first === ' ' || first === '\t' || first === '\n' || first === '\r'){
        this.consumeSpace(first);
        return;
    }
    if(first === '"' || first === '\''){
        this.consumeString(first);
        return;
    }
    if(beginNumber.test(first)){
        this.consumeNumber(first);
        return;
    }
    if(beginWord.test(first)){
        this.consumeWord(first);
        return;
    }
    if(first === '}'){
        this.endBody();
        this.consume(1);
        return;
    }
    if(first === '{'){
        this.startBody();
        this.consume(1);
        return;
    }
    if(first === '('){
        this.startHead();
        this.consume(1);
        return;
    }
    if(first === ')'){
        this.endHead();
        this.consume(1);
        return;
    }
    if(first === '['){
        this.startAccess();
        this.consume(1);
        return;
    }
    if(first === ']'){
        this.endAccess();
        this.consume(1);
        return;
    }
    if(first === '.'){
        this.gotDot();
        this.consume(1);
        return;
    }
    if(first === ','){
        this.gotComma();
        this.consume(1);
        return;
    }
    if(first === ':'){
        this.gotColon();
        this.consume(1);
        return;
    }
    if(first === ';'){
        this.gotEnd();
        this.consume(1);
        return;
    }
    
    if(first === '?'){
        this.gotConditional(this.consume(1));
        return;
    }

    var second = text.charAt(1);        

    if(first === '-' && second === '>'){
        this.startCallback();
        this.consume(2);
        return;
    }
    
    if(first === '/'){
        if(second === '/'){
            this.consumeLineComment('//');
            return;
        }
        if(second === '*'){
            this.consumeMultilineComment('/*');
            return;
        }
        if(this.consumeRegEx('/')){
            return;
        }
    }
    if( first === '|' && second === '|' ){
        this.gotComparator(this.consume(2));
        return;
    }
    
    if( first === '|' && second === '|' ){
        this.gotComparator(this.consume(2));
        return;
    }
    
    if( first === '&' && second === '&' ){
        this.gotComparator(this.consume(2));
        return;
    }
    
    var third = text.charAt(2);
    
    if( (first === '=' || first === '!') && second === '=' && third === '='){
        this.gotComparator(this.consume(3));
        return;
    }
    
    if( (first === '=' || first === '!' || first === '<' || first === '>') && second === '='){
        this.gotComparator(this.consume(2));
        return;
    }
    
    if(first === '='){
        this.gotAssignment(this.consume(1));
        return;
    }
    
    if(first === '-' || first === '+' || first === '*' || first === '/' ||
       first === '%' || first === '!' || first === '&' || first === '|' ||
       first || '^' || first === '~'){
        if(second === '='){
            this.gotAssignment(this.consume(2));
        } else {
            this.gotOperator(this.consume(1));
        }
        return;
    }
     
    if(first === '<'){
        if(second === '<'){
            this.gotOperator(this.consume(2));
        } else {
            this.gotComparator(this.consume(1));
        }
        return;
    }
    
    if(first === '>'){
        if(second === '>'){
            if(third === '>'){
                this.gotOperator(this.consume(3));
            } else {
                this.gotOperator(this.consume(2));
            }
        } else {
            this.gotComparator(this.consume(1));
        }
        return;
    }
        
    this.throwError('Unexpected Character: ' + first);
};

Parser.prototype.token = function(){
    this.tokens.push(Array.prototype.slice.call(arguments));
};

Parser.prototype.throwError = function(error){
    //walk backwards to find line start
    var lineStart, char;
    for(lineStart=this.consumed; lineStart>0; lineStart--){
        char = this._text.charAt(lineStart);
        if(char === '\r' || char === '\n'){
            lineStart++; 
            break;
        }
    }
    var lineEnd = lineStart;
    for(; lineEnd>0; lineEnd++){
        char = this._text.charAt(lineEnd);
        if(char === '\r' || char === '\n'){
            break;
        }
    }
    var line = this._text.slice(lineStart, lineEnd);
    console.error(error);
    console.error(line);
    throw new Error(error);
};

Parser.prototype.consumeString = function(terminator){
    var text = this.peek();
    var old = terminator;
    for(var i = 1; i<text.length; i++){
        var char = text.charAt(i);
        if(char === terminator && old !== '\\'){
            break;
        }
        old = char;
    }
    this.gotLiteral(this.consume(i+1), 'string');
};

var numberCharacters = /[0-9.e]/;
Parser.prototype.consumeNumber = function(){
    var text = this.peek();
    for(var i = 1; i<text.length; i++){
        var char = text.charAt(i);
        if(!numberCharacters.test(char)){
            break;
        }
    }
    this.gotLiteral(this.consume(i), 'number');
};

var wordCharacters = /[a-zA-Z0-9_]/;
Parser.prototype.consumeWord = function(){
    var text = this.peek();
    for(var i = 1; i<text.length; i++){
        var char = text.charAt(i);
        if(!wordCharacters.test(char)){
            break;
        }
    }
    this.gotWord(this.consume(i));
};

Parser.prototype.consumeSpace = function(){
    var text = this.peek();
    for(var i = 1; i<text.length; i++){
        var char = text.charAt(i);
        if(char !== ' ' && char !== '\t' && char !== '\r' && char !== '\n'){
            break;
        }
    }
    this.gotSpace(this.consume(i), 'space');
};

Parser.prototype.consumeLineComment = function(){
    var text = this.peek();
    for(var i = 2; i<text.length; i++){
        var char = text.charAt(i);
        if(char === '\r' || char === '\n'){
            break;
        }
    }
    var char2 = text.charAt(i+1);
    if(char2 === '\r' || char2 === '\n'){
        this.gotComment(this.consume(i+1));
    } else {
        this.gotComment(this.consume(i));
    }
};

Parser.prototype.consumeMultilineComment = function(){
    var text = this.peek();
    var char2;
    for(var i = 2; i<text.length; i++){
        var char = text.charAt(i);
        if(char === '/' && char2 === '*'){
            break;
        }
        char2 = char;
    }
    this.gotComment(this.consume(i+1));
};

var regexFlags = /[gimy]/;
Parser.prototype.consumeRegEx = function(){
    var text = this.peek();
    var char;
    var escaped;
    for(var i = 1; i<text.length; i++){
        char = text.charAt(i);
        if(escaped){
            escaped = false;
            continue;
        }
        if(char === '\n'){
            return false;
        }
        if(char === '/'){
            break;
        }
        if(char === '\\'){
            escaped = true;
        }
    }
    i++;

    for(; i<text.length; i++){
        char = text.charAt(i);
        if(!regexFlags.test(char)){
            break;
        }
    }

    this.gotLiteral(this.consume(i), 'regex');

    return true;
};

Parser.prototype.gotComment = function(comment){
    this.token('comment', comment);
};

Parser.prototype.gotSpace = function(space){
    this.token('space', space);
};

Parser.prototype.startCallback = function(){
    this.token('callback');
};

Parser.prototype.startHead = function(){
    this.token('start_head');
};

Parser.prototype.endHead = function(){
    this.token('end_head');
};

Parser.prototype.startBody = function(){
    this.token('start_body');
};

Parser.prototype.endBody = function(){
    this.token('end_body');
};

Parser.prototype.gotWord = function(word){
    if(word === 'function'){
        this.token('function');
    } else {
        this.token('word', word);
    }
};

Parser.prototype.gotDot = function(){
    this.token('dot');
};

Parser.prototype.gotColon = function(){
    this.token('colon');
};

Parser.prototype.startAccess = function(){
    this.token('start_access');
};

Parser.prototype.endAccess = function(){
    this.token('end_access');
};

Parser.prototype.gotComma = function(){
    this.token('comma');
};

Parser.prototype.gotEnd = function(){
    this.token('terminator');
};

Parser.prototype.gotComparator = function(c){
    this.token('comparator', c);
};

Parser.prototype.gotOperator = function(o){
    this.token('operator', o);
};

Parser.prototype.gotConditional = function(){
    this.token('conditional');
};

Parser.prototype.gotAssignment = function(a){
    this.token('assignment', a);
};

Parser.prototype.gotLiteral = function(literal, type){
    this.token('literal', literal, type);
};

module.exports = Parser;
