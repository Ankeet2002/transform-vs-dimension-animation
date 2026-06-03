import { useState } from 'react'
import './App.css'

const sizeDemoCss = `.box-row {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.box {
  flex: 1;
  min-width: 0;
  height: 80px;
  transition: width 0.35s ease, height 0.35s ease, flex 0.35s ease;
}

.box-target.expanded {
  flex: 0 0 160px;
  width: 160px;
  height: 140px;
}`

const justifyDemoCss = `.flex-row {
  display: flex;
  gap: 0.75rem;
  transition: justify-content 0.35s ease;
}

.flex-row.flex-start {
  justify-content: flex-start;
}

.flex-row.flex-spaced {
  justify-content: space-between;
}`

const scaleDemoCss = `.box-row {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.box {
  flex: 1;
  min-width: 0;
  height: 80px;
  transition: transform 0.35s ease;
}

.box-target.scaled {
  transform: scale(1.58, 1.75);
}`

const counterScaleDemoCss = `.scale-wrap {
  --scale-x: 1.58;
  --scale-y: 1.75;
  border: 3px solid #fff;
  border-radius: 8px;
}

.scale-wrap.scaled {
  transform: scale(var(--scale-x), var(--scale-y));
  border-top-width: calc(3px / var(--scale-y));
  border-bottom-width: calc(3px / var(--scale-y));
  border-left-width: calc(3px / var(--scale-x));
  border-right-width: calc(3px / var(--scale-x));
  border-radius: calc(8px / var(--scale-x)) / calc(8px / var(--scale-y));
}

.scale-wrap.scaled .scale-inner {
  transform: scale(calc(1 / var(--scale-x)), calc(1 / var(--scale-y)));
}`

function App() {
  const [sizeExpanded, setSizeExpanded] = useState(false)
  const [justifySpaced, setJustifySpaced] = useState(false)
  const [box2Scaled, setBox2Scaled] = useState(false)
  const [box2CounterScaled, setBox2CounterScaled] = useState(false)
  const [compareActive, setCompareActive] = useState(false)
  const [fixCompareActive, setFixCompareActive] = useState(false)
  const [darkMode, setDarkMode] = useState(true)

  return (
    <div className={`page${darkMode ? ' dark' : ''}`}>
      <div className="top-bar">
        <button
          type="button"
          className="theme-toggle"
          onClick={() => setDarkMode((v) => !v)}
          aria-pressed={darkMode}
        >
          {darkMode ? 'Light mode' : 'Dark mode'}
        </button>
      </div>

      <div className="content">
        <header className="header">
        <h1>Layout shift demo</h1>
        <p className="lede">
          When one thing gets bigger or moves, the things next to it move too.
        </p>
        <p className="hint">
          Use <code>scale</code> and <code>translate</code> so nothing else has
          to move. See the fix below.
        </p>
      </header>

      <section className="demo">
        <div className="demo-header">
          <h2>Change width and height</h2>
          <p>Box 2 gets bigger. Boxes 3 and 4 get pushed away.</p>
        </div>

        <div className="illustration-frame">
          <div className="preview">
            <div className="box-row">
              <div className="box">1</div>
              <div className={`box box-target ${sizeExpanded ? 'expanded' : ''}`}>
                Hello
              </div>
              <div className="box">3</div>
              <div className="box">4</div>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="toggle"
          onClick={() => setSizeExpanded((v) => !v)}
        >
          {sizeExpanded ? 'Reset box 2' : 'Make box 2 bigger'}
        </button>

        <div className="code-block">
          <span className="code-label">CSS</span>
          <pre className="code-snippet">
            <code>{sizeDemoCss}</code>
          </pre>
        </div>
      </section>

      <section className="demo">
        <div className="demo-header">
          <h2>Change justify-content</h2>
          <p>
            The items inside the row jump to new spots. That&apos;s a layout
            change too.
          </p>
        </div>

        <div className="illustration-frame">
          <div className="preview">
            <div
              className={`flex-row ${justifySpaced ? 'flex-spaced' : 'flex-start'}`}
            >
              <div className="flex-item">A</div>
              <div className="flex-item">B</div>
              <div className="flex-item">C</div>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="toggle"
          onClick={() => setJustifySpaced((v) => !v)}
        >
          {justifySpaced ? 'Pull items together' : 'Spread items apart'}
        </button>

        <div className="code-block">
          <span className="code-label">CSS</span>
          <pre className="code-snippet">
            <code>{justifyDemoCss}</code>
          </pre>
        </div>
      </section>

      <section className="demo">
        <div className="demo-header">
          <h2>Use scale instead</h2>
          <p>
            Box 2 looks about the same size. Boxes 1, 3, and 4 do not move.
          </p>
        </div>

        <div className="illustration-frame">
          <div className="preview preview-scale">
            <div className="box-row">
              <div className="box">1</div>
              <div className={`box box-target ${box2Scaled ? 'scaled' : ''}`}>
                Hello
              </div>
              <div className="box">3</div>
              <div className="box">4</div>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="toggle"
          onClick={() => setBox2Scaled((v) => !v)}
        >
          {box2Scaled ? 'Reset box 2' : 'Scale box 2'}
        </button>

        <div className="code-block">
          <span className="code-label">CSS</span>
          <pre className="code-snippet">
            <code>{scaleDemoCss}</code>
          </pre>
        </div>
      </section>

      <section className="demo">
        <div className="demo-header">
          <h2>Issue with scale</h2>
          <p>
            Scale changes how everything looks — not just the box size. Text,
            borders, and corners all scale up. With width and height, only the
            box grows.
          </p>
        </div>

        <p className="compare-note">
          Both boxes start with a <strong>3px border</strong> and{' '}
          <strong>8px rounded corners</strong>.
        </p>

        <div className="compare-grid">
          <div className="compare-item">
            <p className="compare-label">Width &amp; height</p>
            <p className="compare-ref">
              Hello <span className="compare-ref-note">normal text</span>
            </p>
            <div className="compare-preview">
              <div
                className={`box box-target compare-box${compareActive ? ' expanded' : ''}`}
              >
                Hello
              </div>
            </div>
            <ul className="compare-differences">
              <li className={compareActive ? 'highlight-good' : ''}>
                Text stays the same size
              </li>
              <li className={compareActive ? 'highlight-good' : ''}>
                Border stays 3px thick
              </li>
              <li className={compareActive ? 'highlight-good' : ''}>
                Corners stay 8px round
              </li>
            </ul>
          </div>

          <div className="compare-item">
            <p className="compare-label">Scale</p>
            <p className="compare-ref">
              Hello <span className="compare-ref-note">normal text</span>
            </p>
            <div className="compare-preview">
              <div
                className={`box box-target compare-box${compareActive ? ' scaled' : ''}`}
              >
                Hello
              </div>
            </div>
            <ul className="compare-differences">
              <li className={compareActive ? 'highlight-bad' : ''}>
                Text scales up
              </li>
              <li className={compareActive ? 'highlight-bad' : ''}>
                Border looks thicker
              </li>
              <li className={compareActive ? 'highlight-bad' : ''}>
                Corners look more rounded
              </li>
            </ul>
          </div>
        </div>

        <button
          type="button"
          className="toggle"
          onClick={() => setCompareActive((v) => !v)}
        >
          {compareActive ? 'Reset boxes' : 'Make boxes bigger'}
        </button>
      </section>

      <section className="demo demo-solution">
        <div className="demo-header">
          <h2>Fix: counter-scale inner content</h2>
          <p>
            Scale the wrapper up. Scale everything inside back down by the same
            amount. The box grows but text, border, and corners stay normal.
          </p>
        </div>

        <div className="illustration-frame">
          <div className="preview preview-scale">
            <div className="box-row">
              <div className="box">1</div>
              <div className={`scale-wrap${box2CounterScaled ? ' scaled' : ''}`}>
                <div className="scale-inner">Hello</div>
              </div>
              <div className="box">3</div>
              <div className="box">4</div>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="toggle"
          onClick={() => setBox2CounterScaled((v) => !v)}
        >
          {box2CounterScaled ? 'Reset box 2' : 'Scale box 2 (with fix)'}
        </button>

        <div className="code-block">
          <span className="code-label">CSS</span>
          <pre className="code-snippet">
            <code>{counterScaleDemoCss}</code>
          </pre>
        </div>

        <p className="compare-note compare-note-spaced">
          Border stays on the outer div. Its width and radius are inverse-scaled
          so they still look like <strong>3px</strong> and{' '}
          <strong>8px</strong> after the transform. Inner content is
          counter-scaled too.
        </p>

        <div className="compare-grid">
          <div className="compare-item">
            <p className="compare-label">Plain scale</p>
            <div className="compare-preview">
              <div
                className={`box box-target compare-box${fixCompareActive ? ' scaled' : ''}`}
              >
                Hello
              </div>
            </div>
            <ul className="compare-differences">
              <li className={fixCompareActive ? 'highlight-bad' : ''}>
                Text scales up
              </li>
              <li className={fixCompareActive ? 'highlight-bad' : ''}>
                Border looks thicker
              </li>
              <li className={fixCompareActive ? 'highlight-bad' : ''}>
                Corners look more rounded
              </li>
            </ul>
          </div>

          <div className="compare-item">
            <p className="compare-label">Counter-scale fix</p>
            <div className="compare-preview">
              <div
                className={`compare-box-wrap${fixCompareActive ? ' scaled' : ''}`}
              >
                <div className="compare-inner">Hello</div>
              </div>
            </div>
            <ul className="compare-differences">
              <li className={fixCompareActive ? 'highlight-good' : ''}>
                Text stays the same size
              </li>
              <li className={fixCompareActive ? 'highlight-good' : ''}>
                Border stays 3px thick
              </li>
              <li className={fixCompareActive ? 'highlight-good' : ''}>
                Corners stay 8px round
              </li>
            </ul>
          </div>
        </div>

        <button
          type="button"
          className="toggle"
          onClick={() => setFixCompareActive((v) => !v)}
        >
          {fixCompareActive ? 'Reset boxes' : 'Compare both fixes'}
        </button>
      </section>
      </div>
    </div>
  )
}

export default App
