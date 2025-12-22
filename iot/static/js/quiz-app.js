// Variables globales
let current = 0;
let score = 0;
let questions = [];
let randomFacts = [];
let moods = [];
let selected = [];

// Initialisation
document.addEventListener('DOMContentLoaded', async function() {
    try {
        await loadQuizData();
        if (questions.length > 0) {
            selected = new Array(questions.length).fill(null);
            document.getElementById('score').textContent = score;
            updateStats();
            renderQuestion();
            updateRandomFact();
            
            // Mettre à jour le fait aléatoire toutes les 15 secondes
            setInterval(updateRandomFact, 15000);
            
            // Événements des boutons
            document.getElementById('prevBtn').addEventListener('click', prevQuestion);
            document.getElementById('nextBtn').addEventListener('click', nextQuestion);
        } else {
            document.getElementById('quiz').innerHTML = '<div class="alert alert-warning">Aucune question disponible pour le moment.</div>';
        }
    } catch (error) {
        console.error('Erreur lors du chargement du quiz:', error);
        document.getElementById('quiz').innerHTML = '<div class="alert alert-danger">Erreur de chargement du quiz. Veuillez réessayer plus tard.</div>';
    }
});

async function loadQuizData() {
    const response = await fetch('/api/quiz/questions/');
    if (!response.ok) throw new Error('Erreur réseau');
    
    const data = await response.json();
    questions = data.questions;
    randomFacts = data.facts;
    moods = data.moods;
    
    // Initialise les sélections
    selected = new Array(questions.length).fill(null);
}

// Fonctions d'affichage
function createEmojiRain(emoji, count = 15) {
  for(let i = 0; i < count; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'emoji-rain';
      el.textContent = emoji;
      el.style.left = Math.random() * 100 + 'vw';
      el.style.top = '-50px';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 3000);
    }, i * 80);
  }
}

function createConfetti() {
  const colors = ['#4361ee', '#10b981', '#f59e0b', '#ef4444', '#a78bfa', '#22d3ee'];
  for(let i = 0; i < 50; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'confetti';
      el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      el.style.left = Math.random() * 100 + 'vw';
      el.style.top = '-10px';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 3000);
    }, i * 30);
  }
}

function showReaction(text) {
  const el = document.createElement('div');
  el.className = 'reaction-text';
  el.textContent = text;
  document.getElementById('quiz').appendChild(el);
  setTimeout(() => el.remove(), 1200);
}

function updateMood() {
  if (!moods.length) return;
  
  const percentage = (score / questions.length) * 100;
  // Trouve le mood approprié basé sur le min_percentage
  let currentMood = moods[0];
  for (let m of moods) {
      if (percentage >= m.min_percentage) {
          currentMood = m;
      }
  }
  
  const moodContainer = document.getElementById('moodMeter');
  if (moodContainer) {
      document.getElementById('moodEmoji').textContent = currentMood.emoji;
      document.getElementById('moodText').textContent = currentMood.text;
      moodContainer.style.backgroundColor = currentMood.color;
  }
}

function updateRandomFact() {
  const factElement = document.getElementById('randomFact');
  if (factElement && randomFacts.length > 0) {
    factElement.textContent = randomFacts[Math.floor(Math.random() * randomFacts.length)];
  }
}

function updateStats() {
  const answered = selected.filter(v => v !== null).length;
  const remaining = questions.length - answered;
  document.getElementById('statTotal').textContent = questions.length;
  document.getElementById('statAnswered').textContent = answered;
  document.getElementById('statRemaining').textContent = remaining;
  document.getElementById('statCorrect').textContent = score;
  updateMood();
}

function renderQuestion() {
  if (!questions.length) return;

  const q = questions[current];
  const root = document.getElementById('quiz');
  const pct = Math.round(((current) / questions.length) * 100);
  document.getElementById('progressBar').style.width = `${pct}%`;
  document.getElementById('qIndex').textContent = current + 1;
  document.getElementById('qTotal').textContent = questions.length;

  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  prevBtn.disabled = current === 0;
  
  if(current === questions.length - 1) {
    nextBtn.innerHTML = 'Découvrir mon destin <i class="fas fa-scroll ms-2"></i>';
  } else {
    nextBtn.innerHTML = 'Continuer l\'aventure <i class="fas fa-rocket ms-2"></i>';
  }

  root.innerHTML = `
    <div class="mb-3">
      <span class="badge bg-gradient" style="background: linear-gradient(135deg, var(--primary), var(--success));">
        📍 Question ${current+1} / ${questions.length}
      </span>
    </div>
    <div class="question-text">${q.q}</div>
    <div class="row g-3">
      ${q.options.map((opt, i) => `
        <div class="col-12">
          <button type="button" class="option ${selected[current] !== null ? (i === q.answer ? 'correct' : (i === selected[current] ? 'wrong' : '')) : ''}" data-index="${i}">
            <span class="bullet">${String.fromCharCode(65 + i)}</span>
            <span>${opt}</span>
          </button>
        </div>`).join('')}
    </div>
    ${selected[current] !== null ? `<div class="fun-fact-box"><strong><i class="fas fa-lightbulb me-2"></i>Le Saviez-Vous ?</strong><br>${q.funFact}</div>` : ''}
  `;

  nextBtn.disabled = (selected[current] === null);

  root.querySelectorAll('.option').forEach(el => {
    el.addEventListener('click', () => {
      if(selected[current] !== null) return;
      const idx = Number(el.dataset.index);
      selected[current] = idx;
      const isCorrect = idx === questions[current].answer;
      
      if(isCorrect) {
        score++;
        const reactions = q.reactions.correct;
        showReaction(reactions[Math.floor(Math.random() * reactions.length)]);
        createEmojiRain('⭐', 12);
        createEmojiRain('✨', 8);
      } else {
        const reactions = q.reactions.wrong;
        showReaction(reactions[Math.floor(Math.random() * reactions.length)]);
        createEmojiRain('💀', 6);
      }
      
      document.getElementById('score').textContent = score;
      nextBtn.disabled = false;
      renderQuestion();
      updateStats();
    });
  });
}

// Navigation
function prevQuestion() {
  if(current > 0) {
    current--;
    renderQuestion();
  }
}

function nextQuestion() {
  if(current < questions.length - 1) {
    current++;
    renderQuestion();
  } else {
    showFinalResults();
  }
}

// Résultats finaux
async function showFinalResults() {
  document.getElementById('progressBar').style.width = '100%';
  const root = document.getElementById('quiz');
  
  // Submit results to backend
  try {
      const response = await fetch('/api/quiz/submit/', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              answers: selected
          })
      });
      
      if (response.ok) {
          const resultData = await response.json();
          renderResultScreen(resultData, root);
      } else {
          // Fallback if API fails
          const percentage = (score / questions.length) * 100;
          renderResultScreen({
              percentage: percentage,
              score: score,
              total: questions.length,
              // Backend would provide these, but fallback just in case
              message: "Quiz terminé !",
              title: "Résultat",
              emoji: "🏁",
              color_class: "primary",
              badge_text: "Terminé"
          }, root);
      }
  } catch (error) {
      console.error('Error submitting quiz:', error);
      // Construct minimal result object for display
      const percentage = (score / questions.length) * 100;
      renderResultScreen({
          percentage: percentage,
          score: score,
          total: questions.length,
          message: "Quiz terminé (Résultat non sauvegardé)",
          title: "Résultat",
          emoji: "⚠️",
          color_class: "warning",
          badge_text: "Hors Ligne"
      }, root);
  }
}

function renderResultScreen(data, root) {
    const { percentage, score, total, message, title, emoji, color_class, badge_text } = data;
    
    // Trigger effects
    if (percentage === 100) {
        createConfetti();
        createEmojiRain('🏆', 30);
        createEmojiRain('👑', 20);
    } else if (percentage >= 80) {
        createEmojiRain('⭐', 20);
    }

    // Determine color class if not provided (fallback)
    const color = color_class || (percentage >= 50 ? 'success' : 'warning');
    const badge = badge_text || `${percentage}%`;

  root.innerHTML = `<div class='text-center py-5'>
    <div class='mb-4' style='font-size: 6rem; animation: bounce 1s infinite;'>${emoji || '🏁'}</div>
    
    <div class='mb-3'>
      <span class='badge bg-${color} fs-6 px-3 py-2'>${badge}</span>
    </div>
    
    <h2 class='mb-3 fw-bold'>${title || 'Résultat du Quiz'}</h2>
    <p class='lead mb-2'>Score Final: <strong class='text-${color} fs-3'>${score}/${total}</strong> <span class='text-muted'>(${typeof percentage === 'number' ? percentage.toFixed(0) : percentage}%)</span></p>
    <p class='text-muted mb-4 mx-auto' style='max-width: 600px;'>${message}</p>
    
    <div class='alert alert-info mx-auto' style='max-width: 700px;'>
      <i class='fas fa-quote-left me-2'></i>
      <em>"L'IoT éco-responsable, c'est pas juste une mode, c'est une nécessité. Et aussi un excellent sujet de conversation en soirée."</em>
      <div class='mt-2 text-end'><small>- Personne (mais c'est vrai quand même)</small></div>
    </div>
    
    <div class='d-flex gap-3 justify-content-center flex-wrap mt-4'>
      <button class='btn btn-${color} btn-lg px-4' onclick='location.reload()'>
        <i class='fas fa-redo me-2'></i>Retenter ma chance
      </button>
      <a href='${typeof DASHBOARD_URL !== "undefined" ? DASHBOARD_URL : "/dashboard/"}' class='btn btn-outline-light btn-lg px-4'>
        <i class='fas fa-gauge-high me-2'></i>Retour Dashboard
      </a>
    </div>
    
    <div class='mt-5 pt-4 border-top border-secondary'>
      <small class='text-muted'>
        <i class='fas fa-heart text-danger me-1'></i>
        Quiz créé avec amour (et beaucoup de café) pour la planète 🌍
      </small>
    </div>
  </div>`;
  
  if(document.getElementById('prevBtn')) document.getElementById('prevBtn').disabled = true;
  if(document.getElementById('nextBtn')) document.getElementById('nextBtn').disabled = true;
}