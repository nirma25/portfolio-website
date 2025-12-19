const availableCoins = [
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC' },
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH' },
  { id: 'cardano', name: 'Cardano', symbol: 'ADA' },
  { id: 'solana', name: 'Solana', symbol: 'SOL' },
  { id: 'ripple', name: 'Ripple', symbol: 'XRP' },
  { id: 'polkadot', name: 'Polkadot', symbol: 'DOT' },
  { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE' },
  { id: 'avalanche-2', name: 'Avalanche', symbol: 'AVAX' }
];

let selectedCoins = [];
let activeTab = 'analyze';

const coinsContainer = document.getElementById('coinsContainer');
const submitBtn = document.getElementById('submitBtn');
const errorDiv = document.getElementById('error');
const resultsDiv = document.getElementById('results');
const analyzeBtn = document.getElementById('analyzeBtn');
const compareBtn = document.getElementById('compareBtn');
const coinSearch = document.getElementById('coinSearch');

function renderCoins() {
  const searchTerm = coinSearch.value.toLowerCase();
  coinsContainer.innerHTML = '';
  availableCoins
    .filter(coin => coin.name.toLowerCase().includes(searchTerm) || coin.symbol.toLowerCase().includes(searchTerm))
    .forEach(coin => {
      const btn = document.createElement('button');
      btn.textContent = `${coin.symbol} - ${coin.name}`;
      if (selectedCoins.includes(coin.id)) btn.classList.add('selected');
      btn.onclick = () => {
        selectedCoins.includes(coin.id)
          ? selectedCoins.splice(selectedCoins.indexOf(coin.id), 1)
          : selectedCoins.push(coin.id);
        renderCoins();
      };
      coinsContainer.appendChild(btn);
    });
}

coinSearch.addEventListener('input', renderCoins);

function switchTab(tab) {
  activeTab = tab;
  analyzeBtn.classList.toggle('active', tab === 'analyze');
  compareBtn.classList.toggle('active', tab === 'compare');
  submitBtn.textContent = tab === 'analyze' ? 'Analyze Selected Coins' : 'Compare Selected Coins';
}

analyzeBtn.onclick = () => switchTab('analyze');
compareBtn.onclick = () => switchTab('compare');

submitBtn.onclick = async () => {
  if (selectedCoins.length === 0) {
    errorDiv.textContent = 'Please select at least one cryptocurrency';
    return;
  }
  errorDiv.textContent = '';
  resultsDiv.innerHTML = '<p>Loading...</p>';

  try {
    const endpoint = activeTab === 'analyze' ? '/crypto/analyze' : '/crypto/compare';
    const res = await fetch(`https://crypto-ai-backend-production.up.railway.app${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coins: selectedCoins })
    });

    if (!res.ok) throw new Error('Request failed');
    const data = await res.json();
    renderResults(data);
  } catch (err) {
    resultsDiv.innerHTML = `<p style="color:#f87171">${err.message}</p>`;
  }
};

function renderResults(data) {
  resultsDiv.innerHTML = '';
  if (activeTab === 'analyze' && data.analysis) {
    data.analysis.forEach(coin => {
      const div = document.createElement('div');
      div.innerHTML = `
        <div class="result-header">
          <h3>${coin.coin}</h3>
          <span class="sentiment ${coin.sentiment.toLowerCase()}">${coin.sentiment.toUpperCase()}</span>
        </div>
        <p>${coin.summary}</p>
        <div class="key-factors">
          <h4>Key Factors</h4>
          ${coin.key_factors.map(f => `<div><b>${f.factor}</b>: ${f.impact}</div>`).join('')}
        </div>
        <div class="insights">
          <h4>Market Insights</h4>
          ${coin.insights.map(i => `<div>${i.prediction} - <b>${i.confidence}%</b></div>`).join('')}
        </div>
      `;
      resultsDiv.appendChild(div);
    });
  } else if (activeTab === 'compare' && data.comparison) {
    const div = document.createElement('div');
    div.innerHTML = `
      <h2>🏆 Winner: ${data.comparison.winner}</h2>
      <p>${data.comparison.summary}</p>
      <div class="reasons">
        <h4>Key Reasons</h4>
        ${data.comparison.reasons.map((r,i) => `<div>${i+1}. ${r}</div>`).join('')}
      </div>
    `;
    resultsDiv.appendChild(div);
  }
}

// Initial render
renderCoins();
