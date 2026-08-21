import React, { useState } from 'react';
import { ShieldAlert, CheckCircle, Search, History, Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('fake-news');
  const [headline, setHeadline] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentResult, setCurrentResult] = useState(null);
  const [history, setHistory] = useState([]);

  const handleAnalyze = (e) => {
    e.preventDefault();
    if (!headline.trim()) return;

    setIsAnalyzing(true);
    setCurrentResult(null);

    setTimeout(() => {
      const lower = headline.toLowerCase();
      const isSuspect = lower.includes('shocking') || lower.includes('secret') || lower.includes('won') || lower.includes('miracle');
      const mockConfidence = isSuspect ? Math.floor(Math.random() * 20 + 75) : Math.floor(Math.random() * 20 + 10);

      const result = {
        id: Date.now(),
        headline,
        type: activeTab,
        detected: isSuspect,
        confidence: mockConfidence,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setCurrentResult(result);
      setHistory((prev) => [result, ...prev]);
      setIsAnalyzing(false);
    }, 1000);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ borderBottom: '1px solid #1e293b', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Sparkles style={{ color: '#38bdf8' }} />
          <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>AI Headline Inspector</h1>
        </div>
        <span style={{ fontSize: '0.85rem', color: '#94a3b8', background: '#1e293b', padding: '0.25rem 0.75rem', borderRadius: '999px' }}>
          React Sandbox (Mock AI)
        </span>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', maxWidth: '1200px', margin: '2rem auto', gap: '2rem', padding: '0 1rem' }}>
        <main>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <button
              onClick={() => { setActiveTab('fake-news'); setCurrentResult(null); }}
              style={{
                flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600',
                backgroundColor: activeTab === 'fake-news' ? '#0284c7' : '#1e293b', color: '#fff'
              }}
            >
              Fake News Detection
            </button>
            <button
              onClick={() => { setActiveTab('clickbait'); setCurrentResult(null); }}
              style={{
                flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600',
                backgroundColor: activeTab === 'clickbait' ? '#0284c7' : '#1e293b', color: '#fff'
              }}
            >
              Clickbait Classifier
            </button>
          </div>

          <form onSubmit={handleAnalyze} style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder={activeTab === 'fake-news' ? "Paste a news headline to verify..." : "Paste headline to check for clickbait..."}
              style={{
                flex: 1, padding: '1rem', borderRadius: '8px', border: '1px solid #334155',
                backgroundColor: '#1e293b', color: '#fff', fontSize: '1rem', outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={isAnalyzing}
              style={{
                padding: '0 1.5rem', borderRadius: '8px', border: 'none', backgroundColor: '#38bdf8',
                color: '#0f172a', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}
            >
              <Search size={18} />
              {isAnalyzing ? 'Analyzing...' : 'Inspect'}
            </button>
          </form>

          {currentResult && (
            <div style={{
              background: '#1e293b', borderRadius: '12px', padding: '1.5rem',
              borderLeft: `6px solid ${currentResult.detected ? '#ef4444' : '#22c55e'}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                {currentResult.detected ? <ShieldAlert color="#ef4444" size={28} /> : <CheckCircle color="#22c55e" size={28} />}
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem' }}>
                    {currentResult.type === 'fake-news'
                      ? (currentResult.detected ? 'Likely Fake News' : 'Appears Legitimate')
                      : (currentResult.detected ? 'High Clickbait Score' : 'Standard Headline')}
                  </h3>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Headline: "{currentResult.headline}"</span>
                </div>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  <span>AI Risk Probability:</span>
                  <strong>{currentResult.confidence}%</strong>
                </div>
                <div style={{ height: '8px', background: '#334155', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${currentResult.confidence}%`,
                    backgroundColor: currentResult.detected ? '#ef4444' : '#22c55e', transition: 'width 0.5s ease'
                  }} />
                </div>
              </div>
            </div>
          )}
        </main>

        <aside style={{ background: '#1e293b', borderRadius: '12px', padding: '1.25rem', height: 'fit-content' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#94a3b8' }}>
            <History size={18} />
            <h3 style={{ fontSize: '1rem', margin: 0, color: '#f8fafc' }}>Recent Searches</h3>
          </div>

          {history.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: '#64748b', textAlign: 'center' }}>No inspection history yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {history.map((item) => (
                <div key={item.id} style={{
                  padding: '0.75rem', background: '#0f172a', borderRadius: '6px', fontSize: '0.85rem',
                  borderLeft: `3px solid ${item.detected ? '#ef4444' : '#22c55e'}`
                }}>
                  <div style={{ fontWeight: '500', color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.headline}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginTop: '0.25rem', fontSize: '0.75rem' }}>
                    <span>{item.type}</span>
                    <span>{item.confidence}% Risk</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}