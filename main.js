 const emojis = ['🍎','🍌','🍇','🍊','🍉','🍓','🍍','🥝'];
    let cards = [...emojis, ...emojis];
    let players = [];
    let scores = [];
    let currentPlayer = 0;
    let firstCard = null, secondCard = null;
    let lockBoard = false;
    let gameEnded = false;
    const TOTAL_PAIRS = 8;
    let matchedPairs = 0;
    const clickSound = document.getElementById("clickSound");
    const winSound = document.getElementById("winSound");

    function shuffle(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    }

    function startGame() {
      const numHuman = parseInt(document.getElementById("numHuman").value);
      const numCPU = parseInt(document.getElementById("numCPU").value);
      if (numHuman + numCPU > 4) {
        alert("Max 4 players allowed.");
        return;
      }

      players = [];
      scores = [];

      for (let i = 0; i < numHuman; i++) {
        players.push({ name: `Player ${i + 1}`, type: "human" });
      }
      for (let i = 0; i < numCPU; i++) {
        players.push({ name: `Computer ${i + 1}`, type: "cpu" });
      }

      scores = Array(players.length).fill(0);
      currentPlayer = 0;
      matchedPairs = 0;
      gameEnded = false;

      document.getElementById("playerSelect").style.display = "none";
      document.getElementById("gameBoard").style.display = "grid";
      document.getElementById("restartBtn").style.display = "none";
      document.getElementById("leaderboard").style.display = "block";

      cards = [...emojis, ...emojis];
      shuffle(cards);
      createBoard();
      updateTurnInfo();
      updateLeaderboard();
      setTimeout(autoTurn, 800);
    }

    function createBoard() {
      const board = document.getElementById("gameBoard");
      board.innerHTML = '';
      cards.forEach((emoji, index) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.emoji = emoji;
        card.dataset.index = index;
        card.addEventListener('click', () => handleCardClick(card));
        board.appendChild(card);
      });
    }

    function handleCardClick(card) {
      if (lockBoard || gameEnded || players[currentPlayer].type !== "human") return;
      if (card.classList.contains('flipped') || card === firstCard) return;
      flipCard(card);
    }

    function flipCard(card) {
      clickSound.currentTime = 0;
      clickSound.play();
      card.classList.add('flipped');
      card.textContent = card.dataset.emoji;

      if (!firstCard) {
        firstCard = card;
        return;
      }

      secondCard = card;
      lockBoard = true;

      if (firstCard.dataset.emoji === secondCard.dataset.emoji) {
        scores[currentPlayer]++;
        matchedPairs++;
        updateLeaderboard();
        setTimeout(() => {
          resetTurn();
          checkGameEnd();
          if (!gameEnded) nextTurn();
        }, 700);
      } else {
        setTimeout(() => {
          firstCard.classList.remove('flipped');
          secondCard.classList.remove('flipped');
          firstCard.textContent = '';
          secondCard.textContent = '';
          resetTurn();
          nextTurn();
        }, 900);
      }
    }

    function resetTurn() {
      [firstCard, secondCard] = [null, null];
      lockBoard = false;
    }

    function nextTurn() {
      currentPlayer = (currentPlayer + 1) % players.length;
      updateTurnInfo();
      setTimeout(autoTurn, 800);
    }

    function updateTurnInfo() {
      document.getElementById("turnInfo").textContent = `${players[currentPlayer].name}'s Turn`;
    }

    function updateLeaderboard() {
      const scoreList = document.getElementById("scoreList");
      scoreList.innerHTML = '';
      players.forEach((p, i) => {
        const li = document.createElement("li");
        li.textContent = `${p.name}: ${scores[i]} pairs`;
        scoreList.appendChild(li);
      });
    }

    function checkGameEnd() {
      if (matchedPairs >= TOTAL_PAIRS) {
        gameEnded = true;
        const maxScore = Math.max(...scores);
        const winners = players.filter((_, i) => scores[i] === maxScore);
        const winnerNames = winners.map(w => w.name).join(', ');

        winSound.play();
        document.getElementById("turnInfo").textContent = winners.length > 1
          ? `It's a draw between ${winnerNames}!`
          : `${winnerNames} wins!`;

        document.getElementById("restartBtn").style.display = "block";
        document.getElementById("winMessage").textContent = winners.length > 1
          ? `It's a draw between ${winnerNames}!`
          : `${winnerNames} won the game!`;

        document.getElementById("winModal").style.display = "flex";
      }
    }

    function autoTurn() {
      if (gameEnded || players[currentPlayer].type !== "cpu") return;
      let unflipped = [...document.querySelectorAll('.card:not(.flipped)')];
      if (unflipped.length >= 2) {
        const [card1, card2] = unflipped.sort(() => 0.5 - Math.random()).slice(0, 2);
        flipCard(card1);
        setTimeout(() => flipCard(card2), 600);
      }
    }

    function closeModal() {
      document.getElementById("winModal").style.display = "none";
    }

    function restartGame() {
      document.getElementById("playerSelect").style.display = "block";
      document.getElementById("gameBoard").style.display = "none";
      document.getElementById("restartBtn").style.display = "none";
      document.getElementById("turnInfo").textContent = "Select number of players";
      document.getElementById("leaderboard").style.display = "none";
    }
 