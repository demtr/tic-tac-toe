import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
    return (
        <button className="square" onClick={props.onClick} style={{background: props.star?"yellow":""}}>
            {props.value}
        </button>
    );
}

class Board extends React.Component {

    renderSquare(i) {
        let line = this.props.line ? this.props.line[1] : null;
        let star = line ? line.some(el=>el===i) : false;
        return <Square value={this.props.squares[i]}
                       onClick={() => {
                           this.props.onClick(i);
                       }}
                       star={star} key={i}
        />;
    }

    render() {
        return <div>{[0, 1, 2].map(el =>
                        <div className="board-row" key={el}>
                            {[0, 1, 2].map(em => this.renderSquare(el * 3 + em))}
                        </div>)
                    }
        </div>
    }
}

class Game extends React.Component {

    constructor(props) {
        super(props);
        this.state = this.initialState();
    }

    initialState() {
        return  {
            history: [
                {
                    squares: Array(9).fill(null),
                    squarePressed: null
                }
            ],
            isXFirst: true,
            stepNumber: 0,
            sortAscent: true,
            outline: false
        }
    }

    handleClick(tile) {
        let history, current;
        history = this.state.history.slice(0, this.state.stepNumber + 1);
        current = history[history.length - 1];
        const squares = current.squares.slice();
        if (calculateWinner(squares) || squares[tile]) return;
        squares[tile] = this.state.isXFirst ? 'X' : 'O';
        this.setState({
            history:
                [...history,{squares: squares, squarePressed: tile}],
            isXFirst: !this.state.isXFirst,
            stepNumber: history.length,
            outline: false
        });
    }

    jumpToHistory(move) {
        this.setState({
            isXFirst: move % 2 === 0,
            stepNumber: move,
            outline: true
        })
    }

    render() {
        const history = this.state.history.slice();
        const current = history[this.state.stepNumber];
        const winner= calculateWinner(current.squares);
        let status;

        const moves = history.map((step, move, arr) => {
            let desc, mv;
            if (this.state.sortAscent) {
                mv = move;
            } else {
                mv = arr.length-move-1;
            }
            desc = mv ? "Перейти к ходу № "+mv : "К началу игры";

            // count coordinated position of cell
            const pos = (n) => {
                if (n === null) return '';
                return ` (${Math.trunc(n/3)+1+', '+ (n%3+1)})`
            }

            return (
            <li key={move} style={this.state.outline && this.state.stepNumber === mv
                                  ? {background:"red",marginLeft:"3px"}
                                  : {}}>
                <button onClick={() => {this.jumpToHistory(mv);} }>{desc}</button>
                {pos(arr[mv].squarePressed)}
            </li>);
        });

        if (winner)
            status = 'Выиграл: ' + winner[0];
        else {
            status = 'Следующий игрок: ' + (this.state.isXFirst ? 'X' : 'O');
            if (this.state.stepNumber===9 && history.length > 9) status = 'Ничья'
        }

        return (<div>
                <h1>Крестики-нолики</h1>
                <div className="game">
                    <div className="game-board">
                        <Board squares={current.squares}
                               onClick={(i) => {
                                   this.handleClick(i);
                               }}
                               line={winner}
                        />
                    </div>
                    <div className="game-info">
                        <div>{status}</div>
                        <ol>{moves}</ol>
                    </div>
                    <div>
                        <div className="game-set">Сортировка</div>
                        <div>
                            <button onClick={() => {
                                        this.setState({sortAscent: true});
                                    }}
                                    disabled={this.state.sortAscent ? "disabled" : ""}>
                                По возрастанию
                            </button>
                        </div>
                        <div>
                            <button onClick={() => {
                                        this.setState({sortAscent: false});
                                    }}
                                    disabled={this.state.sortAscent ? "" : "disabled"}>
                                По убыванию
                            </button>
                        </div>
                        <div className="game-reset">Играть заново</div>
                        <div><button onClick={()=>{this.setState(this.initialState());}}>Сброс</button></div>
                    </div>
                </div>
            </div>
        );
    }
}

// ========================================
function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return [squares[a], lines[i]];
        }
    }
    return null;
}

ReactDOM.render(
    <Game/>,
    document.getElementById('root')
);
