let solvedQuestions = JSON.parse(localStorage.getItem('hogwarts_dsa_solved')) || [];

const container = document.getElementById('tracker-container');
const progressBar = document.getElementById('progress-bar');
const progressPercentage = document.getElementById('progress-percentage');
const solvedCountSpan = document.getElementById('solved-count');
const totalCountSpan = document.getElementById('total-count');
const searchInput = document.getElementById('search-input');
const resetBtn = document.getElementById('reset-btn');

function getTotalQuestionsCount() {
    let count = 0;
    dsaData.forEach(folder => count += folder.questions.length);
    return count;
}

function updateStats() {
    const total = getTotalQuestionsCount();
    const solved = solvedQuestions.length;
    const percentage = total > 0 ? Math.round((solved / total) * 100) : 0;

    progressBar.style.width = `${percentage}%`;
    progressPercentage.innerText = `${percentage}%`;
    solvedCountSpan.innerText = solved;
    totalCountSpan.innerText = total;
}

// Hogwarts House styling mapping for difficulties
function getDifficultyBadgeClass(difficulty) {
    switch (difficulty) {
        case 'Easy': return 'bg-emerald-950/70 text-emerald-300 border-emerald-700/50'; // Slytherin green tone
        case 'Medium': return 'bg-amber-950/70 text-amber-300 border-amber-700/50';     // Hufflepuff gold tone
        case 'Hard': return 'bg-rose-950/70 text-rose-300 border-rose-700/50';         // Gryffindor crimson tone
        default: return 'bg-slate-800 text-amber-200 border-amber-900';
    }
}

function renderTracker(filterText = '') {
    container.innerHTML = '';
    const query = filterText.toLowerCase().trim();

    let hasResults = false;

    dsaData.forEach((folder) => {
        const filteredQuestions = folder.questions.filter(q => 
            q.title.toLowerCase().includes(query) || 
            folder.title.toLowerCase().includes(query) ||
            q.difficulty.toLowerCase().includes(query)
        );

        if (filteredQuestions.length === 0) return;
        hasResults = true;

        const folderCard = document.createElement('div');
        folderCard.className = 'bg-slate-950/80 border border-amber-500/20 rounded-2xl overflow-hidden shadow-md shadow-amber-950/10 backdrop-blur';

        const headerBtn = document.createElement('div');
        headerBtn.className = 'w-full px-5 py-4 bg-slate-900/60 hover:bg-slate-900/90 flex items-center justify-between cursor-pointer transition select-none';
        
        const folderSolved = folder.questions.filter(q => solvedQuestions.includes(q.id)).length;
        
        headerBtn.innerHTML = `
            <div class="flex items-center gap-3">
                <span class="text-amber-400 text-base">📜</span>
                <div>
                    <h2 class="text-base font-bold font-magical tracking-wider text-amber-300">${folder.title}</h2>
                    <span class="text-xs text-amber-200/40 font-mono">Vault: ${folder.folderName}</span>
                </div>
            </div>
            <div class="flex items-center gap-3">
                <span class="text-xs font-magical font-semibold px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    ${folderSolved} / ${folder.questions.length} Spells Mastered
                </span>
                <span class="text-amber-500/70 text-xs transform transition-transform duration-200">▼</span>
            </div>
        `;

        const listContainer = document.createElement('div');
        listContainer.className = 'border-t border-amber-500/10 divide-y divide-amber-500/5 bg-slate-950/40';

        filteredQuestions.forEach(q => {
            const isChecked = solvedQuestions.includes(q.id);

            const row = document.createElement('div');
            row.className = 'px-5 py-3.5 flex items-center justify-between hover:bg-amber-500/[0.03] transition gap-4';

            const leftDiv = document.createElement('div');
            leftDiv.className = 'flex items-center gap-3.5 flex-1 min-w-0';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = isChecked;
            checkbox.className = 'w-4 h-4 rounded accent-amber-500 cursor-pointer shrink-0 bg-slate-900 border-amber-500/40';

            const titleContainer = document.createElement('div');
            titleContainer.className = 'flex items-center gap-2.5 min-w-0 flex-wrap';

            const titleLink = document.createElement('a');
            titleLink.href = q.link;
            titleLink.target = '_blank';
            titleLink.innerText = q.title;
            titleLink.className = `text-sm transition font-magical ${isChecked ? 'line-through text-amber-200/30' : 'text-amber-100/90 hover:text-amber-400'}`;

            const diffBadge = document.createElement('span');
            diffBadge.innerText = q.difficulty;
            diffBadge.className = `text-[10px] px-2 py-0.5 rounded border font-magical font-semibold uppercase tracking-wider ${getDifficultyBadgeClass(q.difficulty)}`;

            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                    if (!solvedQuestions.includes(q.id)) solvedQuestions.push(q.id);
                    titleLink.classList.add('line-through', 'text-amber-200/30');
                    titleLink.classList.remove('text-amber-100/90', 'hover:text-amber-400');
                } else {
                    solvedQuestions = solvedQuestions.filter(id => id !== q.id);
                    titleLink.classList.remove('line-through', 'text-amber-200/30');
                    titleLink.classList.add('text-amber-100/90', 'hover:text-amber-400');
                }
                localStorage.setItem('hogwarts_dsa_solved', JSON.stringify(solvedQuestions));
                updateStats();
                updateFolderBadge(folderCard, folder);
            });

            titleContainer.appendChild(titleLink);
            titleContainer.appendChild(diffBadge);
            leftDiv.appendChild(checkbox);
            leftDiv.appendChild(titleContainer);
            row.appendChild(leftDiv);

            const leetCodeLink = document.createElement('a');
            leetCodeLink.href = q.link;
            leetCodeLink.target = '_blank';
            leetCodeLink.innerHTML = 'Cast Spell ↗';
            leetCodeLink.className = 'text-[11px] font-magical font-bold bg-amber-500/10 hover:bg-amber-500 hover:text-slate-950 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-md transition shrink-0';
            row.appendChild(leetCodeLink);

            listContainer.appendChild(row);
        });

        let isOpen = true;
        headerBtn.addEventListener('click', () => {
            isOpen = !isOpen;
            listContainer.style.display = isOpen ? 'block' : 'none';
            headerBtn.querySelector('.transform').style.transform = isOpen ? 'rotate(0deg)' : 'rotate(-90deg)';
        });

        folderCard.appendChild(headerBtn);
        folderCard.appendChild(listContainer);
        container.appendChild(folderCard);
    });

    if (!hasResults) {
        container.innerHTML = `
            <div class="text-center py-12 text-amber-200/40 bg-slate-950 border border-amber-500/20 rounded-2xl font-magical">
                Mischief Managed! No matching spells or vaults found in the archives.
            </div>
        `;
    }

    updateStats();
}

function updateFolderBadge(folderCard, folder) {
    const folderSolved = folder.questions.filter(q => solvedQuestions.includes(q.id)).length;
    const badge = folderCard.querySelector('span.rounded-full');
    if(badge) {
        badge.innerText = `${folderSolved} / ${folder.questions.length} Spells Mastered`;
    }
}

searchInput.addEventListener('input', (e) => {
    renderTracker(e.target.value);
});

resetBtn.addEventListener('click', () => {
    if (confirm("Are you sure you wish to cast Obliviate and clear all your memory of mastered spells?")) {
        solvedQuestions = [];
        localStorage.removeItem('hogwarts_dsa_solved');
        renderTracker(searchInput.value);
    }
});

renderTracker();