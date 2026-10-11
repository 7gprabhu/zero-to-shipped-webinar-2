import React, { useState } from 'react';
const sample = { score: 78, presentSkills: ['JavaScript', 'React', 'HTML & CSS', 'Git', 'REST APIs', 'Problem solving'], missingSkills: ['TypeScript', 'Automated testing', 'CI/CD'], method: 'sample' };
export default function App() {
  const [file, setFile] = useState(null);
  const [jd, setJd] = useState('');
  const [report, setReport] = useState(sample);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  function selectFile(files) {
    setError(''); setFile(null);
    const selected = files[0];
    if (files.length !== 1 || !selected || !/\.pdf$/i.test(selected.name) || (selected.type && selected.type !== 'application/pdf')) return setError('Choose one PDF file.');
    if (!selected.size || selected.size > 10 * 1024 * 1024) return setError('Choose a non-empty PDF up to 10 MB.');
    setFile(selected);
  }
  async function analyze() {
    setBusy(true); setError('');
    try {
      const form = new FormData(); form.append('resume', file); form.append('jobDescription', jd);
      const response = await fetch('/api/resumes/analyze', { method: 'POST', body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Comparison failed.');
      setReport(data);
    } catch (err) { setError(err instanceof TypeError ? 'Cannot reach the API. Make sure the backend is running.' : err.message); }
    finally { setBusy(false); }
  }
  return <>
  <header className="header wrap">
    <a className="brand" href="#" aria-label="0 to shipped home"><span className="brand-icon">↗</span> 0 to shipped<span className="brand-divider"></span><span className="brand-product">resume parser</span></a>
    <a className="header-link" href="#how-it-works">How it works <span>↗</span></a>
  </header>
  <main className="wrap">
    <section className="hero">
      <div className="eyebrow"><span className="live-dot"></span> YOUR NEXT CHAPTER STARTS HERE</div>
      <h1>A Nivvi resume.<br />A clearer <span>next step.</span></h1>
      <p>See where your resume stands. Discover your strongest skills<br className="desktop-break" /> and the gaps to close before your next application.</p>
      <div className="hero-notes"><span>✓ No sign-up needed</span><span>✓ PDF resumes</span><span>✓ Job-specific comparison</span></div>
    </section>
    <section className="workspace" aria-label="Resume analysis workspace">
      <div className="upload-panel">
        <div className="step-label"><span>01</span> YOUR RESUME</div>
        <h2>Let’s start with your story.</h2>
        <p className="muted">Upload your resume and add the job description.</p>
        <label className="dropzone" id="dropzone" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); if (!busy) selectFile(e.dataTransfer.files); }} htmlFor="resume-file">
          <span className="upload-icon" aria-hidden="true">↥</span>
          <strong id="upload-title">{file ? file.name : 'Drop your resume here'}</strong>
          <span id="upload-description">or <span className="browse">browse files</span> on your computer</span>
          <small>PDF only · Up to 10 MB</small>
          <input type="file" id="resume-file" accept=".pdf,application/pdf" disabled={busy} onChange={e => { selectFile(e.target.files); e.target.value = ""; }} />
        </label>
        <p id="file-status" className="file-status" role="status" aria-live="polite">{error || (file ? `${(file.size / 1024 / 1024).toFixed(2)} MB selected` : "")}</p><label className="jd-label" htmlFor="job-description">Job description</label><textarea id="job-description" value={jd} onChange={e => setJd(e.target.value)} disabled={busy} maxLength={20000} placeholder="Paste the job description, including required skills…" />
        <button className="primary-button" id="analyze" disabled={!file || !jd.trim() || busy} onClick={analyze}>{busy ? "Comparing…" : "Analyze my resume"} <span>↗</span></button>
        <div className="privacy-note"><span aria-hidden="true">♧</span><p>Resume text and the JD are sent to labd for AI analysis.<br /><span>Each analysis uses your labd allowance. Results and the JD are saved in MongoDB.</span></p></div>
        <div className="sample-prompt">Just taking a look? <button id="sample" disabled={busy} onClick={() => { setReport(sample); setError(""); }}>Try a sample resume <span>→</span></button></div>
      </div>
      <div className="results-panel" id="results" aria-busy={busy}>
        <div className="results-heading"><div className="step-label"><span>02</span> YOUR RESUME SNAPSHOT</div><span className="demo-badge" id="demo-badge">{report.method === "sample" ? "SAMPLE REPORT" : "AI ANALYSIS"}</span></div>
        <div className="score-row">
          <div className="score-ring" aria-label={`Resume score: ${report.score ?? "unavailable"}`} style={{background: `conic-gradient(from 220deg, #478153 ${(report.score ?? 0) * 3.6}deg, #e8eddf 0)`}}><div><strong>{report.score ?? "—"}<span>/100</span></strong><small>RESUME SCORE</small></div></div>
          <div className="score-copy"><span className="good-badge">{report.score >= 70 ? "A strong foundation" : "Room to grow"}</span><h2>Your skills, at a glance.</h2><p>{report.method === "sample" ? "Preview a sample report before uploading." : report.summary}</p></div>
        </div>
        <div className="skills-section"><div className="section-heading"><h3><span className="status-icon present">✓</span> Skills present</h3><span>{report.presentSkills.length} matched</span></div><div className="chips present-chips">{report.presentSkills.length ? report.presentSkills.map(skill => <span key={skill}>{skill}</span>) : <p className="muted">No matching skills found.</p>}</div></div>
        <div className="skills-section missing-section"><div className="section-heading"><h3><span className="status-icon missing">+</span> Skills to strengthen</h3><span>{report.missingSkills.length} missing</span></div><div className="chips missing-chips">{report.missingSkills.length ? report.missingSkills.map(skill => <span key={skill}>{skill}</span>) : <p className="muted">No missing skills identified.</p>}</div><p className="skills-note">AI estimates job fit from your documents. Review the results for accuracy.</p></div>
        <div className="tip"><span aria-hidden="true">✧</span><p><strong>Make your experience count.</strong><br />Add specific projects and measurable outcomes to show how you’ve used your skills.</p></div>
        <p className="report-note" id="report-note" aria-live="polite">{report.method === "sample" ? "Example results only. Upload a PDF and JD for your own comparison." : `${report.filename} · AI analysis saved to MongoDB.`}</p>
      </div>
    </section>
    <section className="how-section" id="how-it-works"><div className="how-intro"><span className="eyebrow">LESS GUESSWORK. MORE DIRECTION.</span><h2>Small steps.<br />Stronger applications.</h2></div><div className="how-step"><span>01 / UPLOAD</span><h3>Bring your resume</h3><p>Choose a text-based PDF and paste<br />the job description you want to match.</p></div><div className="how-step"><span>02 / EXPLORE</span><h3>See the big picture</h3><p>Compare the skills in your PDF<br />with the requirements in the JD.</p></div><div className="how-step"><span>03 / IMPROVE</span><h3>Find your next step</h3><p>Review present and missing skills<br />to guide your next revision.</p></div></section>
  </main>
  <footer className="wrap"><span>© 2026 0 to shipped</span><span>Built for your next beginning. <span className="footer-star">✳</span></span><span>Powered by labd AI</span></footer>
</>;
}
