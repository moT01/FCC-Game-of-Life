// glossary
// t = this
// p = this.props
// s = this.state
// mi = mainIndex
// si = subIndex

class Header extends React.Component {
    constructor(props) {
        super(props);        
    } //end constructor
    render() {
        return (
            <div>
                <h2>Welcome to Conway's Game of Life</h2>
                <p>GENERATION={this.props.generation}</p>
            </div>
        );
    } //end render()
}; //end Header Component

const Footer = function() {
    return(
        <div>
            <h2>Rules:</h2>
            <h5>Any live cell with fewer than two live neighbors dies, as if caused by underpopulation.</h5>
            <h5>Any live cell with two or three live neighbors lives on to the next generation.</h5>
            <h5>Any live cell with more than three live neighbors dies, as if by overpopulation.</h5>
            <h5>Any dead cell with exactly three live neighbors becomes a live cell, as if by reproduction.</h5>
       </div>
    ); //end return 
}; //end Footer

class Square extends React.Component {
    constructor(props) {
        super(props);    
    }; //end constructor
    render() {
        var p = this.props;
        return (
            <rect x={p.x} y={p.y} width={p.width} height={p.height} fill={p.fill} onClick={p.squareClick.bind(this)}>{p.mainIndex+','+p.subIndex}</rect>
        ); //end return
    }; //end render
}; //end Square Component


class Main extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            width: 8,      //width of each <rect>
            height: 8,     //height of each <rect>
            rows: 50,         //# of rows
            columns: 100,    //# of columns
            living: [[]],        //array of 'living'(black) <rect>'s
            generation: 1, //number of generations passed
            fillLevel: 8,   //used in randomFill() - value = 16 -> 8 -> 4 -> 2 -> repeat
            playing: false,  //currently playing?
            interval: null
        }; //end this.state
    }; //end constructor
    
    createEmptyArray = () => { //this creates an empty 2-dimensional array the size of the grid
        var array = [];
        for (var a=0; a<this.state.rows; a++) {
            array.push(new Array);
            for (var b=0; b<this.state.columns; b++) {
                array[a].push(0);
            }
        }
        return array;
    };
    
    getNextGen = () => {
        var t = this,
            s = this.state,
            array = t.createEmptyArray(),
            array2 = t.createEmptyArray(),
            L= s.living,
            generation = s.generation;

        for(var mi=0; mi<L.length; mi++) { //first half of algorithm creates an array - each spot will have the number of neighbors that spot has
            for(var si=0; si<L[mi].length; si++) { 
                if(L[mi][si] === 1) { //if cell of previous generation was alive -- find all neighbors and add one to each appropriate neighbor
                    for(var mi2 = mi-1; mi2 < mi+2; mi2++) { //the next two loops create a small grid for all the neighbors of the living cell
                        for(var si2 = si-1; si2 < si+2; si2++) {
                            if(mi2 >= 0 && si2 >= 0 && mi2 < this.state.rows && si2 < this.state.columns && (mi2 !== mi || si2 !== si)) { //this tests if the neighbor is in the range of the grid(not below 0 or more than # of rows/columns), also that it is not the living cell itself(which is included in the 'small grid')
                                array[mi2][si2] += 1;
                            } //end if
                        } //end for (newx)
                    } //end for (newy)
                } //end if
            } //end for x
        } //end for y
        for(var mi3 = 0; mi3<array.length; mi3++) { //second half of the algorithm translates the numbers from the first half to 1(alive) or 0(dead)
            for(var si3 = 0; si3<array[mi3].length; si3++) { //all will be '0' by default
                if (array[mi3][si3] === 3) { //any cell that had 3 neighbors will be a 1 for the next generation (alive)
                    array2[mi3][si3] = 1; 
                } else if (array[mi3][si3] === 2 && L[mi3][si3] === 1) { //any cell that had 2 neighbors and was alive the last generation will stay alive for this generation
                    array2[mi3][si3] = 1; 
                } //end if
            } // end for xx
        } // end for yy

        generation +=1;
        this.setState({
            living: array2,
            generation: generation
        });
    }; //end getNeighbors()

    randomFill = () => {//this randomly fills an empty array with numbers relative to the fillLevel 
        var array = this.createEmptyArray(),
            fillLevel = this.state.fillLevel;
        for (var mi=0; mi<this.state.rows; mi++) {
            for (var si=0; si<this.state.columns; si++) {
                array[mi][si] = Math.round(Math.random() * fillLevel);
            }
        }
        if(fillLevel > 2) {
            fillLevel /= 2;
        } else {
            fillLevel = 16;
        }
        this.setState({
            living: array,
            fillLevel: fillLevel
        });
    };
    
    squareClick = (e) => { //toggles the fill of a single square when clicked and the state of the 'living' array
        var array = this.state.living, //creates of array of current state
            mi = e.target.textContent.split(',')[0], //mainIndex
            si = e.target.textContent.split(',')[1]; //subIndex
        if (array[mi][si] === 1) {
            array[mi][si] = 0;
        } else {
            array[mi][si] = 1; 
        }
        this.setState({
            living: array
        });
        array = array.join(',');
        console.log(array);
    }; //end squareClick

    fill = (index) => {
        if(index === 1) { return 'black'; }
        else { return 'white'; }
    };

    fillTheBlanks = (array) => { //this algorithm is for making preset layouts, it takes a small array (layout) and turn it to the size of the grid. basically adding 0's all around it -- will only work if passed array has the same length sub arrays throughout, also might want to make sure there are more columns and rows than the smaller, hardcoded array
        var width = array[0].length, //columns - width - rounded 
            height = array.length, //rows - height - rounded
            rows = this.state.rows,
            columns = this.state.columns,
            mainArray = [],
            subArray = [],
            mi = 0, //mainIndex of 2d array from argument
            si = 0; //subIndex of 2d array from argument
    
        var leftOffset = Math.floor((columns-width)/2);
        var rightOffset = width + leftOffset;
        var topOffset = Math.floor((rows-height)/2);
        var bottomOffset = height + topOffset;
        
        for(var c=0; c<this.state.rows; c++) { //c for column (starts at 0)
            subArray = []; //empty subArray
            si = 0; //subIndex 
            for(var r=0; r<this.state.columns; r++) { //r for rows (starts at 0)
                if( r>=leftOffset && r<rightOffset && c>=topOffset && c<bottomOffset) {  
                    subArray.push(array[mi][si]);
                    si++;
                    if(si === width) {
                        mi++;
                    }
                } else {
                    subArray.push(0);
                }
            } //end for (columns)
            mainArray.push(subArray);
        } //end for (rows)
        return mainArray;
    }; //end fillTheBlanks

    presets = (e) => {
            var object = {
                gliderGun:  [[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
                                    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0],
                                    [0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
                                    [0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
                                    [1,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                                    [1,1,0,0,0,0,0,0,0,0,1,0,0,0,1,0,1,1,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0],
                                    [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
                                    [0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                                    [0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]],
                pulsar: [[0,0,1,1,1,0,0,0,1,1,1,0,0],
                             [0,1,0,0,0,1,0,1,0,0,0,1,0],
                             [0,1,0,0,0,1,0,1,0,0,0,1,0],
                             [1,0,1,1,1,1,0,1,1,1,1,0,1],
                             [1,1,0,0,0,0,0,0,0,0,0,1,1],
                             [0,0,0,0,0,0,0,0,0,0,0,0,0],
                             [0,0,0,0,0,0,0,0,0,0,0,0,0],
                             [0,0,0,0,1,1,0,1,1,0,0,0,0],
                             [0,0,0,1,0,1,0,1,0,1,0,0,0],
                             [0,0,0,0,1,0,0,0,1,0,0,0,0]],
                fireworks: [[0,0,1,1,1,0,0,0,1,1,1,0,0],
                                 [0,0,0,0,0,0,0,0,0,0,0,0,0],
                                 [1,0,0,0,0,1,0,1,0,0,0,0,1],
                                 [1,0,0,0,0,1,0,1,0,0,0,0,1],
                                 [1,0,0,0,0,1,0,1,0,0,0,0,1],
                                 [0,0,1,1,1,0,0,0,1,1,1,0,0],
                                 [0,0,0,0,0,0,0,0,0,0,0,0,0],
                                 [0,0,1,1,1,0,0,0,1,1,1,0,0],
                                 [1,0,0,0,0,1,0,1,0,0,0,0,1],
                                 [1,0,0,0,0,1,0,1,0,0,0,0,1],
                                 [1,0,0,0,0,1,0,1,0,0,0,0,1],
                                 [0,0,0,0,0,0,0,0,0,0,0,0,0],
                                 [0,0,1,1,1,0,0,0,1,1,1,0,0]],
                glider: [[0,1,0],
                            [0,0,1],
                            [1,1,1]],
                exploder: [[0,1,0],
                                [1,1,1],
                                [1,0,1],
                                [0,1,0]],
                eyes: [[1,1,1,1,1,1,1,1,1,1]],
                tumbleweed: [[1,1,1,0,1,1,1],
                                       [1,0,0,0,0,0,1],
                                       [0,0,1,0,1,0,0],
                                       [0,1,1,0,1,1,0],
                                       [1,0,0,0,0,0,1]],
            };
            var array = this.fillTheBlanks(object[e.target.id]);
            this.setState({
              living: array
            });
    }; //end presets();

    play = () => {
        if(!this.state.playing) {
            this.setState({ 
                playing: true 
            });
            this.state.interval = setInterval(this.getNextGen, 400);
        }
    };    

    pause = () => {
        if(this.state.playing) {
            this.setState({ 
                playing: false 
            });
            clearInterval(this.state.interval);
        }
    };
    
    clear = () => {
        var array = this.createEmptyArray();
        this.setState({
            generation: 0,
            living: array
        });
        this.pause();
    };

    componentDidMount() {
        this.randomFill(); 
        this.play();
    };

    render() {
        var squaresArray = [],
            mainIndex = -1,
            subIndex,
            s = this.state, 
            t = this;  
        if(s.living[0][0] > -1) {
            for (var y=0; y<s.rows; y++) {
                mainIndex ++;
                subIndex = -1;
                for (var x=0; x<s.columns; x++) {
                    subIndex++;
                    squaresArray.push(<Square squareClick={t.squareClick.bind(t)} mainIndex={mainIndex} subIndex={subIndex} x={x*s.width} y={y*s.height} width={s.width} height={s.height} fill={ t.fill(s.living[mainIndex][subIndex]) } />);
                } //end for x
            } //end for y
        } //end if

        return (
            <div>
            <Header generation={this.state.generation} />
                <div className="flex">
                    <svg width={s.width*s.columns} height={s.height*s.rows} stroke="lime" strokewidth="1">
                        {squaresArray.map(squareComponent => squareComponent)}
                    </svg>
                </div>
                <br />
                <button onClick={t.play.bind(t)}>PLAY</button>
                <button onClick={t.pause.bind(t)}>PAUSE</button>
                <button onClick={t.clear.bind(t)}>CLEAR</button>
                <button onClick={t.randomFill.bind(t)}>RANDOM</button>
                <select>
                    <option>-Preset Fill-</option> 
                    <option id="gliderGun" onClick={t.presets.bind(t)}>Glider Gun</option>
                    <option id="glider" onClick={t.presets.bind(t)}>Glider</option>
                    <option id="pulsar" onClick={t.presets.bind(t)}>Pulsar</option>
                    <option id="fireworks" onClick={t.presets.bind(t)}>Fireworks</option>
                    <option id="exploder" onClick={t.presets.bind(t)}>Exploder</option>
                    <option id="eyes" onClick={t.presets.bind(t)}>Eyes</option>
                    <option id="tumbleweed" onClick={t.presets.bind(t)}>Tumbleweed</option>
                </select>
                <Footer />
            </div>
        ); //end return
    }; //end render
}; //end Main Component
            
ReactDOM.render(<Main />, document.body);