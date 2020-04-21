var context;
var shape = new Object();
var moving_candy = new Object();
var monsters = [];
var board;
var score;
var pac_color;
var pac_direction;
var pac_lives;
var start_time;
var time_elapsed;
var interval;



$(document).ready(function () {
	context = canvas.getContext("2d");
	Start();
});

const monster_colors = ["pink", "blue", "red", "orange"]

//key
// 0 - blank
// 1 - heart
// 2 - pacman
// 4-  wall
// 5 - small candy (5 points)
// 6 - medium candy (10 points)
// 7 - large candy (25 points)
// 8 - moving candy (50 points)
// 11,12,13,14 monsters accordingly



function Start() {
	board = new Array();
	score = 0;
	pac_lives = 5;
	pac_color = "yellow";
	pac_direction = "right";
	var cnt = 140;
	var food_remain = 50;
	var small_food = 0.6 * food_remain;
	var medium_food = 0.3 * food_remain;
	var large_food = 0.1 * food_remain;
	var pacman_remain = 1;
	var monster_remain = 2;
	var monster_cnt = 0;
	start_time = new Date();
	for (var i = 0; i < 16; i++) {
		board[i] = new Array();
		//put obstacles in (i=3,j=3) and (i=3,j=4) and (i=3,j=5), (i=6,j=1) and (i=6,j=2)
		for (var j = 0; j < 12; j++) {
			if (monster_remain > 0 && (i == 1 && j == 1 || i == 1 && j == 10 || i == 14 && j == 1 || i == 14 && j == 10)) {
				var monster = new Object();
				monster.i = i;
				monster.j = j;
				monster.id = monster_remain + 10; //monsters from 14,13,12,11
				board[i][j] = monster.id;
				monster.prev = 0;
				monsters.push(monster);
				monster_remain--;
			}
			else if ((i == 0 || i == 15) && j == 5) { //bridges
				board[i][j] = 0;
			}
			else if (i == 0 || i == 15 || j == 0 || j == 11) {
				board[i][j] = 4;
			}
			else if (
				(i == 3 && j == 3) ||
				(i == 3 && j == 4) ||
				(i == 3 && j == 5) ||
				(i == 6 && j == 1) ||
				(i == 6 && j == 2) ||
				(i >= 5 && i <= 7 && j <= 8 && j >= 6) ||
				(i >= 10 && i <= 12 && j <= 8 && j >= 6) ||
				(j > 2 && j < 9 && i % 6 == 0)

			) {
				board[i][j] = 4;
			} else {
				var randomNum = Math.random();
				if (randomNum <= (1.0 * food_remain) / cnt) {
					var randomFood = Math.random() * food_remain;
					if (randomFood < large_food) {
						large_food--;
						board[i][j] = 7;
					}
					else if (randomFood < large_food + medium_food) {
						medium_food--;
						board[i][j] = 6;
					}
					else {
						small_food--;
						board[i][j] = 5;
					}
					food_remain--;
				} else if (randomNum < (1.0 * (pacman_remain + food_remain)) / cnt) {
					shape.i = i;
					shape.j = j;
					pacman_remain--;
					board[i][j] = 2;
				}
				else {
					board[i][j] = 0;
				}
				cnt--;
			}
		}
	}
	while (food_remain > 0) {
		var emptyCell = findRandomEmptyCell(board);
		if (large_food > 0) {
			large_food--;
			board[emptyCell[0]][emptyCell[1]] = 7;
		}
		else if (medium_food > 0) {
			medium_food--;
			board[emptyCell[0]][emptyCell[1]] = 6;
		}
		else {
			small_food--;
			board[emptyCell[0]][emptyCell[1]] = 5;
		}
		food_remain--;
	}
	if (pacman_remain > 0) {
		var emptyCell = findRandomEmptyCell(board);
		shape.i = emptyCell[0];
		shape.j = emptyCell[1];
		board[emptyCell[0]][emptyCell[1]] = 2;
		pacman_remain--;
	}
	//Insert Extra life
	var emptyCell = findRandomEmptyCell(board);
	board[emptyCell[0]][emptyCell[1]] = 1;
	//Insert Moving candy
	var emptyCell = findRandomEmptyCell(board);
	board[emptyCell[0]][emptyCell[1]] = 8;
	moving_candy.i = emptyCell[0];
	moving_candy.j = emptyCell[1];
	moving_candy.prev = 0;
	moving_candy.eaten = false;


	keysDown = {};
	addEventListener(
		"keydown",
		function (e) {
			keysDown[e.keyCode] = true;
		},
		false
	);
	addEventListener(
		"keyup",
		function (e) {
			keysDown[e.keyCode] = false;
		},
		false
	);
	interval = setInterval(UpdatePosition, 250);
	//monster_interval = setInterval(UpdateMonsterPosition, 300);
}

function findRandomEmptyCell(board) {
	var i = Math.floor(Math.random() * 14 + 1);
	var j = Math.floor(Math.random() * 9 + 1);
	while (board[i][j] != 0) {
		i = Math.floor(Math.random() * 14 + 1);
		j = Math.floor(Math.random() * 9 + 1);
	}
	return [i, j];
}

function GetKeyPressed() {
	if (keysDown[38]) { //up
		return 1;
	}
	if (keysDown[40]) { //down
		return 2;
	}
	if (keysDown[37]) { //left
		return 3;
	}
	if (keysDown[39]) { //right
		return 4;
	}
}

function DrawPacManRight(center) {
	context.beginPath();
	context.arc(center.x, center.y, 30, 0.15 * Math.PI, 1.85 * Math.PI); // half circle
	context.lineTo(center.x, center.y);
	context.fillStyle = pac_color; //color
	context.fill();
	context.beginPath();
	context.arc(center.x + 5, center.y - 15, 5, 0, 2 * Math.PI); // circle
	context.fillStyle = "black"; //color
	context.fill();
}

function DrawPacManLeft(center) {
	context.beginPath();
	context.arc(center.x, center.y, 30, 1.15 * Math.PI, 0.85 * Math.PI); // half circle
	context.lineTo(center.x, center.y);
	context.fillStyle = pac_color; //color
	context.fill();
	context.beginPath();
	context.arc(center.x - 5, center.y - 15, 5, 0, 2 * Math.PI); // circle
	context.fillStyle = "black"; //color
	context.fill();
}

function DrawPacManUp(center) {
	context.beginPath();
	context.arc(center.x, center.y, 30, 1.65 * Math.PI, 1.35 * Math.PI); // half circle
	context.lineTo(center.x, center.y);
	context.fillStyle = pac_color; //color
	context.fill();
	context.beginPath();
	context.arc(center.x + 15, center.y, 5, 0, 2 * Math.PI); // circle
	context.fillStyle = "black"; //color
	context.fill();
}

function DrawPacManDown(center) {
	context.beginPath();
	context.arc(center.x, center.y, 30, 0.65 * Math.PI, 0.35 * Math.PI); // half circle
	context.lineTo(center.x, center.y);
	context.fillStyle = pac_color; //color
	context.fill();
	context.beginPath();
	context.arc(center.x - 15, center.y, 5, 0, 2 * Math.PI); // circle
	context.fillStyle = "black"; //color
	context.fill();
}

function DrawHeart(center) {
	context.beginPath();
	//context.moveTo(37.5, 20);
	var deltax = center.x - 37.5;
	var deltay = center.y - 35;
	context.moveTo(center.x, center.y - 10);
	context.bezierCurveTo(37.5 + deltax, 18.5 + deltay, 35 + deltax, 12.5 + deltay, 25 + deltax, 12.5 + deltay);
	context.bezierCurveTo(10 + deltax, 12.5 + deltay, 10 + deltax, 31.25 + deltay, 10 + deltax, 31.25 + deltay);
	context.bezierCurveTo(10 + deltax, 40 + deltay, 20 + deltax, 51 + deltay, 37.5 + deltax, 60 + deltay);
	context.bezierCurveTo(55 + deltax, 51 + deltay, 65 + deltax, 40 + deltay, 65 + deltax, 31.25 + deltay);
	context.bezierCurveTo(65 + deltax, 31.25 + deltay, 65 + deltax, 12.5 + deltay, 50 + deltax, 12.5 + deltay);
	context.bezierCurveTo(42.5 + deltax, 12.5 + deltay, 37.5 + deltax, 18.5 + deltay, 37.5 + deltax, 20 + deltay);
	context.fillStyle = "red"; //color
	context.fill();
}

function DrawCandy(center) {
	context.beginPath();
	context.fillStyle = "#ecc700"; //color
	context.moveTo(25 + center.x - 30, 25 + center.y - 30);
	context.lineTo(25 + center.x - 30, 5 + center.y - 30);
	context.lineTo(5 + center.x - 30, 25 + center.y - 30);
	context.fill();

	context.beginPath();
	context.moveTo(35 + center.x - 30, 35 + center.y - 30);
	context.lineTo(55 + center.x - 30, 35 + center.y - 30);
	context.lineTo(35 + center.x - 30, 55 + center.y - 30);
	context.fill();
	context.closePath();

	context.beginPath();
	context.arc(center.x, center.y, 12, 0. * Math.PI, 2 * Math.PI); // half circle
	context.fillStyle = "#8300c7"; //color
	context.fill();

}


function Draw() {
	context.clearRect(0, 0, canvas.width, canvas.height); //clean board
	lblScore.value = score;
	lblTime.value = time_elapsed;
	var monsters_drawn = 0;
	for (var i = 0; i < 16; i++) {
		for (var j = 0; j < 12; j++) {
			var center = new Object();
			center.x = i * 60 + 30;
			center.y = j * 60 + 30;
			if (board[i][j] == 2) {
				switch (pac_direction) {
					case "left":
						DrawPacManLeft(center);
						break;
					case "up":
						DrawPacManUp(center);
						break;
					case "down":
						DrawPacManDown(center);
						break;
					default:
						DrawPacManRight(center);
				}
			} else if (board[i][j] == 1) { //heart
				DrawHeart(center);
			} else if (board[i][j] == 5) { //small food
				context.beginPath();
				context.arc(center.x, center.y, 10, 0, 2 * Math.PI); // circle
				context.fillStyle = "black"; //color
				context.fill();
			} else if (board[i][j] == 6) { // medium food
				context.beginPath();
				context.arc(center.x, center.y, 15, 0, 2 * Math.PI); // circle
				context.fillStyle = "#66c800"; //color
				context.fill();
			} else if (board[i][j] == 7) { //large food
				context.beginPath();
				context.arc(center.x, center.y, 20, 0, 2 * Math.PI); // circle
				context.fillStyle = "#00a0d4"; //color
				context.fill();
			} else if (board[i][j] == 8) { //moving food
				DrawCandy(center);
			} else if (board[i][j] == 4) {
				context.beginPath();
				context.rect(center.x - 30, center.y - 30, 60, 60);
				context.fillStyle = "grey"; //color
				context.fill();
			}
			else if (board[i][j] > 10 && board[i][j] < 15) { //draw monsters
				context.beginPath();
				context.arc(center.x, center.y, 26, 0, 2 * Math.PI); // half circle
				context.lineTo(center.x, center.y);
				context.fillStyle = monster_colors[board[i][j] - 11]; //color
				context.fill();
				context.beginPath();
				context.arc(center.x - 12, center.y - 2, 7, 0, 2 * Math.PI); // circle
				context.fillStyle = "white"; //color
				context.fill();
				context.beginPath();
				context.arc(center.x + 12, center.y - 2, 7, 0, 2 * Math.PI); // circle
				context.fillStyle = "white"; //color
				context.fill();
				context.beginPath();
				context.arc(center.x - 12, center.y, 5, 0, 2 * Math.PI); // circle
				context.fillStyle = "black"; //color
				context.fill();
				context.beginPath();
				context.arc(center.x + 12, center.y, 5, 0, 2 * Math.PI); // circle
				context.fillStyle = "black"; //color
				context.fill();
			}
		}
	}
}

function UpdatePosition() {
	board[shape.i][shape.j] = 0;
	var x = GetKeyPressed();
	if (x == 1) {
		if (shape.j > 0 && board[shape.i][shape.j - 1] != 4) {
			shape.j--;
			pac_direction = "up";
		}
	}
	if (x == 2) {
		if (shape.j < 10 && board[shape.i][shape.j + 1] != 4) {
			shape.j++;
			pac_direction = "down";
		}
	}
	if (x == 3) {
		//special loop
		if (shape.i == 0 & shape.j == 5) {
			shape.i = 15;
			pac_direction = "left";
		}
		else if (shape.i > 0 && board[shape.i - 1][shape.j] != 4) {
			shape.i--;
			pac_direction = "left";
		}
	}
	if (x == 4) {
		//special loop
		if (shape.i == 15 & shape.j == 5) {
			shape.i = 0;
			pac_direction = "right";
		}
		else if (shape.i < 15 && board[shape.i + 1][shape.j] != 4) {
			shape.i++;
			pac_direction = "right";
		}
	}
	if (board[shape.i][shape.j] == 5) {
		score += 5;
	}
	if (board[shape.i][shape.j] == 6) {
		score += 10;
	}
	if (board[shape.i][shape.j] == 7) {
		score += 25;
	}
	if (board[shape.i][shape.j] == 8) {
		score += 40
		if (moving_candy.prev == 5)
			score += 5;
		if (moving_candy.prev == 6)
			score += 10;
		if (moving_candy.prev == 7)
			score += 25;
		moving_candy.prev = 0;

	}
	if (board[shape.i][shape.j] == 1) {
		pac_lives++;
	}
	board[shape.i][shape.j] = 2;
	var currentTime = new Date();
	time_elapsed = (currentTime - start_time) / 1000;
	if (score >= 60 && time_elapsed <= 10) {
		pac_color = "green";
	}
	UpdateMovingCandyPosition();
	UpdateMonsterPosition();
	if (score == 250) {
		window.clearInterval(interval);
		window.alert("Game completed");
	}
}

function isFood(cell) {
	return cell > 4 && cell < 9
}

function UpdateMonsterPosition() {
	var eaten = false;
	for (var i = 0; i < monsters.length; i++) {
		var monster = monsters[i];
		if (monster.prev == 2 || monster.prev == 8) {
			board[monster.i][monster.j] = 0;
		}
		else {
			board[monster.i][monster.j] = monster.prev;
		}
		if (monster.j > shape.j && (board[monster.i][monster.j - 1] < 4 | isFood(board[monster.i][monster.j - 1]))) {
			if (monster.j > 0) {
				monster.prev = board[monster.i][monster.j - 1];
				monster.j--;
			}
		}
		else if (monster.j < shape.j && (board[monster.i][monster.j + 1] < 4) | isFood(board[monster.i][monster.j + 1])) {
			if (monster.j < 10) {
				monster.prev = board[monster.i][monster.j + 1];
				monster.j++;
			}
		}
		else if (monster.i > shape.i && (board[monster.i - 1][monster.j] < 4) | isFood(board[monster.i - 1][monster.j])) {
			if (monster.j > 0) {
				monster.prev = board[monster.i - 1][monster.j];
				monster.i--;
			}
		}
		else if (monster.i < shape.i && (board[monster.i + 1][monster.j] < 4) | isFood(board[monster.i + 1][monster.j])) {
			if (monster.j < 15) {
				monster.prev = board[monster.i + 1][monster.j];
				monster.i++;
			}
		}
		if (board[monster.i][monster.j] == 2) //eaten pacman
		{
			eaten = true;
			break;
		}
		else {
			board[monster.i][monster.j] = monster.id;
		}
	}
	Draw();
	if (eaten) {
		var monster_positions = [[1, 1], [1, 10], [14, 1], [14, 10]];
		score = Math.max(0, score - 10);
		for (var k = 0; k < monsters.length; k++) {
			var monster = monsters[k];
			var position = monster_positions[k];
			board[monster.i][monster.j] = monster.prev;
			monster.i = position[0];
			monster.j = position[1];
			board[monster.i][monster.j] = monster.id;
		}
		pac_lives--;
		if (pac_lives == 0) {
			window.clearInterval(interval);
			window.alert("Game Over");
		}
		var emptyCell = findRandomEmptyCell(board);
		board[shape.i][shape.j] = 0;
		shape.i = emptyCell[0];
		shape.j = emptyCell[1];
		board[emptyCell[0]][emptyCell[1]] = 2;
		Draw();
	}
}

function UpdateMovingCandyPosition() {
	if (moving_candy.eaten == true)
		return;
	if (board[moving_candy.i][moving_candy.j] == 2) {
		moving_candy.eaten = true;
		moving_candy.prev = 0;
		return;
	}
	if (moving_candy.prev == 2 | (moving_candy.prev > 10 && moving_candy.prev < 15)) {
		board[moving_candy.i][moving_candy.j] = 0;
	}
	else {
		board[moving_candy.i][moving_candy.j] = moving_candy.prev;
	}
	var succeeded = false;
	while (!succeeded) {
		var rndm = Math.floor(Math.random() * 4);
		switch (rndm) {
			case 0:
				if ((board[moving_candy.i][moving_candy.j - 1] < 4 | isFood(board[moving_candy.i][moving_candy.j - 1]))) {
					if (moving_candy.j > 0) {
						moving_candy.prev = board[moving_candy.i][moving_candy.j - 1];
						moving_candy.j--;
						succeeded = true;
					}
				}
				break;
			case 1:
				if ((board[moving_candy.i][moving_candy.j + 1] < 4) | isFood(board[moving_candy.i][moving_candy.j + 1])) {
					if (moving_candy.j < 10) {
						moving_candy.prev = board[moving_candy.i][moving_candy.j + 1];
						moving_candy.j++;
						succeeded = true;
					}
				}
				break;
			case 2:
				if ((board[moving_candy.i - 1][moving_candy.j] < 4) | isFood(board[moving_candy.i - 1][moving_candy.j])) {
					if (moving_candy.j > 0) {
						moving_candy.prev = board[moving_candy.i - 1][moving_candy.j];
						moving_candy.i--;
						succeeded = true;
					}
				}
				break;
			case 3:
				if ((board[moving_candy.i + 1][moving_candy.j] < 4) | isFood(board[moving_candy.i + 1][moving_candy.j])) {
					if (moving_candy.j < 15) {
						moving_candy.prev = board[moving_candy.i + 1][moving_candy.j];
						moving_candy.i++;
						succeeded = true;
					}
				}
				break;
		}
	}
	board[moving_candy.i][moving_candy.j] = 8;
}


