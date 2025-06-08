// main.js

// ... (no início do seu código, junto com as outras variáveis de estado)

// --- State Management ---
// Modifique a inicialização para carregar os dados ou usar os padrões
let stats = loadProgress()?.stats || {
  fed: 0,
  rest: 0,
  tasks: 0,
  focus: 0,
  love: 0,
};
let level = loadProgress()?.level || 1;
let xp = loadProgress()?.xp || 0;
let xpForNextLevel = loadProgress()?.xpForNextLevel || 100;
// ... resto do estado

// --- Core Functions ---

// Função para salvar o progresso
function saveProgress() {
  const progress = {
    stats,
    level,
    xp,
    xpForNextLevel,
    // Você também pode salvar o nome do pet, a lista de tarefas, etc.
    petName: document.getElementById("pet-name").textContent,
    tasks: Array.from(document.querySelectorAll(".todo-item")).map((item) => ({
      text: item.querySelector(".task-text").textContent,
      checked: item.querySelector('input[type="checkbox"]').checked,
    })),
  };
  // localStorage só armazena strings, então convertemos o objeto para JSON
  localStorage.setItem("tamaTaskProgress", JSON.stringify(progress));
}

// Função para carregar o progresso
function loadProgress() {
  const savedData = localStorage.getItem("tamaTaskProgress");
  if (savedData) {
    return JSON.parse(savedData);
  }
  return null; // Retorna null se não houver dados salvos
}

// Chame saveProgress() sempre que algo importante mudar:
// Por exemplo, no final das funções updateStat(), updateXP(), e ao adicionar/marcar uma tarefa.

// Exemplo em updateXP()
function updateXP(amount) {
  // ... seu código existente ...
  xpBar.style.width = `${xpPercentage}%`;
  xpText.textContent = `${xp} / ${xpForNextLevel} xp`;

  saveProgress(); // Salva o progresso aqui!
}

// No final da função initializeApp(), carregue os dados:
function initializeApp() {
  const savedData = loadProgress();
  if (savedData) {
    // ... aqui você atualizaria a UI com os dados carregados ...
    // Por exemplo:
    document.getElementById("pet-name").textContent = savedData.petName;
    levelDisplay.textContent = `Level ${savedData.level}`;
    // Recriar a lista de tarefas, atualizar as barras de status, etc.
  }

  // ... resto do seu código de inicialização ...
}
