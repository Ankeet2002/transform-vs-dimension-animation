import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Explanation from './Explanation.jsx'
import './App.css'

const EXPLANATIONS = {
  sizeExpanded: {
    what: 'Box 2 grew taller and wider. Boxes 3 and 4 were pushed to the right.',
    why: 'Animating width and height changes the element\'s real layout size. The browser reflows the flex row so neighbours make room.',
  },
  sizeStatic: {
    what: 'This box shifted because the element next to it changed size.',
    why: 'Static boxes still participate in layout. When a neighbour grows, flex recalculates every item\'s position in the row.',
  },
  justifySpaced: {
    what: 'Items A, B, and C spread apart — A moved left, C moved right.',
    why: 'Changing justify-content to space-between tells flex to put free space between items. The browser recalculates each child\'s position.',
  },
  scaleActive: {
    what: 'Box 2 looks bigger, but boxes 1, 3, and 4 did not move.',
    why: 'transform: scale() only repaints the element. It does not change its layout slot, so the browser does not reflow the row.',
  },
  scaleStatic: {
    what: 'This box stayed in the same place.',
    why: 'Only the painted appearance of box 2 changed. Its layout size never grew, so flex had no reason to reposition neighbours.',
  },
  compareActive: {
    what: 'Both boxes look bigger — but the left keeps sharp text and borders while the right does not.',
    why: 'Width and height only change the box dimensions. Scale zooms the entire element, including text, borders, and corners.',
  },
  compareWidth: {
    what: 'This box grew using real width and height. The text inside stayed the same size.',
    why: 'Font size is independent of the box dimensions. Only the container got bigger — not the content inside it.',
  },
  compareScale: {
    what: 'This box grew using scale. The text, border, and corners all look bigger too.',
    why: 'transform scales everything painted inside the element as one layer — like zooming a screenshot.',
  },
  counterScaleActive: {
    what: 'Box 2 looks bigger. Neighbours stayed still and the text inside stayed sharp.',
    why: 'The outer wrapper scaled up for visual size. The inner layer counter-scaled the content, and the border was inverse-scaled on the outer div.',
  },
  fixCompareActive: {
    what: 'Both boxes look similar in size — but only the right one keeps normal text, border, and corners.',
    why: 'Plain scale zooms everything. The counter-scale fix shrinks inner content and border values before scaling so they look correct after.',
  },
  fixComparePlain: {
    what: 'Plain scale made the box bigger but blurred the content styling.',
    why: 'A single scale transform affects text, border thickness, and corner radius all at once.',
  },
  fixCompareFixed: {
    what: 'The counter-scale box grew with normal-looking content.',
    why: 'Outer scale handles size, inner counter-scale undoes content zoom, and inverse-scaled border values stay visually at 3px and 8px.',
  },
}

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

const DOCK_GAP = 10
const VIEWPORT_PAD = 16
const DOCK_MAX_WIDTH = 680

function getExplanationPosition(anchorEl) {
  if (!anchorEl?.getBoundingClientRect) return null

  const rect = anchorEl.getBoundingClientRect()
  const width = Math.min(DOCK_MAX_WIDTH, window.innerWidth - VIEWPORT_PAD * 2)
  let left = rect.left
  left = Math.max(VIEWPORT_PAD, Math.min(left, window.innerWidth - VIEWPORT_PAD - width))

  return {
    top: rect.bottom + DOCK_GAP,
    left,
    width,
  }
}

function getExplanationOverflow(anchorEl, dockHeight) {
  const position = getExplanationPosition(anchorEl)
  if (!position || dockHeight <= 0) return 0

  const panelBottom = position.top + dockHeight
  const viewportBottom = window.innerHeight - VIEWPORT_PAD
  return Math.max(0, panelBottom - viewportBottom)
}

function App() {
  const [sizeExpanded, setSizeExpanded] = useState(false)
  const [justifySpaced, setJustifySpaced] = useState(false)
  const [box2Scaled, setBox2Scaled] = useState(false)
  const [box2CounterScaled, setBox2CounterScaled] = useState(false)
  const [compareActive, setCompareActive] = useState(false)
  const [fixCompareActive, setFixCompareActive] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [explanation, setExplanation] = useState(null)
  const explanationDockRef = useRef(null)
  const anchorRef = useRef(null)
  const pageRef = useRef(null)

  function applyExplanationScrollRoom(overflow, shouldScroll = false) {
    const page = pageRef.current
    if (!page) return

    if (overflow > 0) {
      page.style.paddingBottom = `calc(clamp(3rem, 8vw, 5rem) + ${overflow + VIEWPORT_PAD}px)`
      if (shouldScroll) {
        window.scrollBy({ top: overflow, behavior: 'smooth' })
      }
    } else {
      page.style.paddingBottom = ''
    }
  }

  function setExplanationAt(content, elOrEvent) {
    const el = elOrEvent?.currentTarget ?? elOrEvent
    if (!el) return

    anchorRef.current = el
    setExplanation({
      ...content,
      position: getExplanationPosition(el),
    })
  }

  function closeExplanation() {
    setExplanation(null)
  }

  useLayoutEffect(() => {
    if (!explanation || !anchorRef.current || !explanationDockRef.current) {
      if (pageRef.current) pageRef.current.style.paddingBottom = ''
      return
    }

    const height = explanationDockRef.current.offsetHeight
    const next = getExplanationPosition(anchorRef.current)
    const overflow = getExplanationOverflow(anchorRef.current, height)

    setExplanation((prev) => {
      if (!prev || !next) return prev
      const current = prev.position
      if (
        current?.top === next.top &&
        current?.left === next.left &&
        current?.width === next.width
      ) {
        return prev
      }
      return { ...prev, position: next }
    })

    applyExplanationScrollRoom(overflow, true)

    return () => {
      if (pageRef.current) pageRef.current.style.paddingBottom = ''
    }
  }, [explanation?.what, explanation?.why])

  useEffect(() => {
    if (!explanation) return

    function handleClickOutside(event) {
      if (explanationDockRef.current?.contains(event.target)) return
      if (event.target.closest('.keep-explanation-open')) return
      setExplanation(null)
    }

    function reposition() {
      if (!anchorRef.current || !explanationDockRef.current) return

      const height = explanationDockRef.current.offsetHeight
      const next = getExplanationPosition(anchorRef.current)
      if (!next) return

      const overflow = getExplanationOverflow(anchorRef.current, height)

      setExplanation((prev) => (prev ? { ...prev, position: next } : null))
      applyExplanationScrollRoom(overflow)
    }

    const outsideClickTimer = window.setTimeout(() => {
      document.addEventListener('click', handleClickOutside)
    }, 0)

    window.addEventListener('scroll', reposition, true)
    window.addEventListener('resize', reposition)

    return () => {
      window.clearTimeout(outsideClickTimer)
      document.removeEventListener('click', handleClickOutside)
      window.removeEventListener('scroll', reposition, true)
      window.removeEventListener('resize', reposition)
      if (pageRef.current) pageRef.current.style.paddingBottom = ''
    }
  }, [explanation])

  function toggleSize(event) {
    const next = !sizeExpanded
    setSizeExpanded(next)
    if (next) setExplanationAt(EXPLANATIONS.sizeExpanded, event)
  }

  function toggleJustify(event) {
    const next = !justifySpaced
    setJustifySpaced(next)
    if (next) setExplanationAt(EXPLANATIONS.justifySpaced, event)
  }

  function toggleScale(event) {
    const next = !box2Scaled
    setBox2Scaled(next)
    if (next) setExplanationAt(EXPLANATIONS.scaleActive, event)
  }

  function toggleCompare(event) {
    const next = !compareActive
    setCompareActive(next)
    if (next) setExplanationAt(EXPLANATIONS.compareActive, event)
  }

  function toggleCounterScale(event) {
    const next = !box2CounterScaled
    setBox2CounterScaled(next)
    if (next) setExplanationAt(EXPLANATIONS.counterScaleActive, event)
  }

  function toggleFixCompare(event) {
    const next = !fixCompareActive
    setFixCompareActive(next)
    if (next) setExplanationAt(EXPLANATIONS.fixCompareActive, event)
  }

  return (
    <div ref={pageRef} className={`page${darkMode ? ' dark' : ''}`}>
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
          <h1>When one element grows, its neighbours are forced to move</h1>
          <p className="lede">
            A lot of the time you need to change an element&apos;s width or height
            to a new value — opening a panel, expanding a card, revealing more
            content — and you want that change to animate smoothly in between.
          </p>
          <p className="intro-text">
            The obvious approach is to animate <code>width</code> and{' '}
            <code>height</code> directly. That works, but it comes with a cost:
            the browser has to recalculate layout on every frame. Anything sitting
            next to your element gets pushed or pulled out of the way. That is
            what we call a <strong>layout shift</strong>.
          </p>
          <p className="intro-text">
            This page walks through that problem, a common way around it using{' '}
            <code>transform: scale()</code>, why that approach creates its own
            issues, and a final counter-scale technique that tries to get the best
            of both worlds.
          </p>
        </header>

      <div className="chapter">
        <p className="chapter-label">The problem</p>
        <p className="chapter-intro">
          Animating real dimensions — or moving flex children with{' '}
          <code>justify-content</code> — forces the browser to reflow the page.
          Try the demos below and watch what happens to the elements around the
          one you change.
        </p>

      <section className="demo">
        <div className="demo-header">
          <h2>Change width and height</h2>
          <p>
            Here we animate the real width and height of box 2. Because it needs
            more space, boxes 3 and 4 must shift over. The browser recalculates
            the whole row — that is a layout change.
          </p>
        </div>

        <div className="illustration-frame">
          <div className="preview">
            <div className="box-row">
              <div className="box">1</div>
              <button
                type="button"
                className={`box box-target box-interactive keep-explanation-open${sizeExpanded ? ' expanded' : ''}`}
                onClick={toggleSize}
              >
                Hello
              </button>
              <button
                type="button"
                className="box box-interactive keep-explanation-open"
                onClick={(e) => sizeExpanded && setExplanationAt(EXPLANATIONS.sizeStatic, e)}
              >
                3
              </button>
              <button
                type="button"
                className="box box-interactive keep-explanation-open"
                onClick={(e) => sizeExpanded && setExplanationAt(EXPLANATIONS.sizeStatic, e)}
              >
                4
              </button>
            </div>
          </div>
        </div>

        <button type="button" className="toggle keep-explanation-open" onClick={toggleSize}>
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
            Layout changes are not just about size. Changing{' '}
            <code>justify-content</code> moves flex children to new positions
            inside the row. The row itself may stay the same size, but the
            browser still recalculates where each child sits.
          </p>
        </div>

        <div className="illustration-frame">
          <div className="preview">
            <div
              className={`flex-row flex-interactive keep-explanation-open ${justifySpaced ? 'flex-spaced' : 'flex-start'}`}
              onClick={toggleJustify}
              onKeyDown={(e) => e.key === 'Enter' && toggleJustify(e)}
              role="button"
              tabIndex={0}
            >
              <div className="flex-item">A</div>
              <div className="flex-item">B</div>
              <div className="flex-item">C</div>
            </div>
          </div>
        </div>

        <button type="button" className="toggle keep-explanation-open" onClick={toggleJustify}>
          {justifySpaced ? 'Pull items together' : 'Spread items apart'}
        </button>

        <div className="code-block">
          <span className="code-label">CSS</span>
          <pre className="code-snippet">
            <code>{justifyDemoCss}</code>
          </pre>
        </div>
      </section>
      </div>

      <div className="chapter">
        <p className="chapter-label">Solution 1 — use scale</p>
        <p className="chapter-intro">
          Instead of changing the element&apos;s real size, we can use{' '}
          <code>transform: scale()</code>. The element keeps the same layout slot,
          so nothing else on the page has to move. Visually it grows — but without
          a layout shift.
        </p>

      <section className="demo">
        <div className="demo-header">
          <h2>Use scale instead of width and height</h2>
          <p>
            <code>transform: scale()</code> makes box 2 look bigger without
            changing its layout slot. Boxes 1, 3, and 4 stay exactly where they
            are because the browser does not reflow the page — it only repaints
            the scaled box on the GPU.
          </p>
        </div>

        <div className="illustration-frame">
          <div className="preview preview-scale">
            <div className="box-row">
              <div className="box">1</div>
              <button
                type="button"
                className={`box box-target box-interactive keep-explanation-open${box2Scaled ? ' scaled' : ''}`}
                onClick={toggleScale}
              >
                Hello
              </button>
              <button
                type="button"
                className="box box-interactive keep-explanation-open"
                onClick={(e) => box2Scaled && setExplanationAt(EXPLANATIONS.scaleStatic, e)}
              >
                3
              </button>
              <button
                type="button"
                className="box box-interactive keep-explanation-open"
                onClick={(e) => box2Scaled && setExplanationAt(EXPLANATIONS.scaleStatic, e)}
              >
                4
              </button>
            </div>
          </div>
        </div>

        <button type="button" className="toggle keep-explanation-open" onClick={toggleScale}>
          {box2Scaled ? 'Reset box 2' : 'Scale box 2'}
        </button>

        <div className="code-block">
          <span className="code-label">CSS</span>
          <pre className="code-snippet">
            <code>{scaleDemoCss}</code>
          </pre>
        </div>
      </section>
      </div>

      <div className="chapter">
        <p className="chapter-label">The problem with scale</p>
        <p className="chapter-intro">
          Scale avoids layout shift, but it is not a perfect replacement.{' '}
          <code>transform</code> scales the entire element like a zoom — text,
          borders, and corner radius all grow together. Compare both approaches
          below to see the difference.
        </p>

      <section className="demo">
        <div className="demo-header">
          <h2>Scale affects everything inside</h2>
          <p>
            Click the button and compare side by side. Width and height keeps
            content sharp. Plain scale does not.
          </p>
        </div>

        <p className="compare-note">
          Both boxes below start with a <strong>3px border</strong> and{' '}
          <strong>8px rounded corners</strong>. Click the button and compare:
          the left box grows by changing its real size, the right box grows by
          scaling. Watch what happens to the text, border, and corners.
        </p>

        <div className="compare-grid">
          <div className="compare-item">
            <p className="compare-label">Width &amp; height</p>
            <p className="compare-ref">
              Hello <span className="compare-ref-note">normal text</span>
            </p>
            <div className="compare-preview">
              <button
                type="button"
                className={`box box-target compare-box box-interactive keep-explanation-open${compareActive ? ' expanded' : ''}`}
                onClick={(e) => {
                  if (!compareActive) toggleCompare(e)
                  else setExplanationAt(EXPLANATIONS.compareWidth, e)
                }}
              >
                Hello
              </button>
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
              <button
                type="button"
                className={`box box-target compare-box box-interactive keep-explanation-open${compareActive ? ' scaled' : ''}`}
                onClick={(e) => {
                  if (!compareActive) toggleCompare(e)
                  else setExplanationAt(EXPLANATIONS.compareScale, e)
                }}
              >
                Hello
              </button>
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

        <button type="button" className="toggle keep-explanation-open" onClick={toggleCompare}>
          {compareActive ? 'Reset boxes' : 'Make boxes bigger'}
        </button>
      </section>
      </div>

      <div className="chapter chapter-solution">
        <p className="chapter-label">The fix — counter-scale</p>
        <p className="chapter-intro">
          To grow the box without moving neighbours <em>and</em> keep the content
          looking normal, use two layers. Scale the outer wrapper up, then
          counter-scale the inner content back down. The border stays on the
          outer div, but its thickness and radius are inverse-scaled so they
          still look correct after the transform.
        </p>

      <section className="demo demo-solution">
        <div className="demo-header">
          <h2>Counter-scale inner content</h2>
          <p>
            The outer wrapper handles the visual growth. The inner layer undoes
            the scale on text. The border width and corner radius are shrunk
            before scaling so they still read as 3px and 8px when the animation
            finishes.
          </p>
        </div>

        <div className="illustration-frame">
          <div className="preview preview-scale">
            <div className="box-row">
              <div className="box">1</div>
              <button
                type="button"
                className={`scale-wrap box-interactive keep-explanation-open${box2CounterScaled ? ' scaled' : ''}`}
                onClick={toggleCounterScale}
              >
                <div className="scale-inner">Hello</div>
              </button>
              <button
                type="button"
                className="box box-interactive keep-explanation-open"
                onClick={(e) =>
                  box2CounterScaled && setExplanationAt(EXPLANATIONS.scaleStatic, e)
                }
              >
                3
              </button>
              <button
                type="button"
                className="box box-interactive keep-explanation-open"
                onClick={(e) =>
                  box2CounterScaled && setExplanationAt(EXPLANATIONS.scaleStatic, e)
                }
              >
                4
              </button>
            </div>
          </div>
        </div>

        <button type="button" className="toggle keep-explanation-open" onClick={toggleCounterScale}>
          {box2CounterScaled ? 'Reset box 2' : 'Scale box 2 (with fix)'}
        </button>

        <div className="code-block">
          <span className="code-label">CSS</span>
          <pre className="code-snippet">
            <code>{counterScaleDemoCss}</code>
          </pre>
        </div>

        <p className="compare-note compare-note-spaced">
          Why inverse-scale the border? When you <code>scale(1.58, 1.75)</code>{' '}
          an element, its border and corners scale too — a 3px border becomes
          visually thicker. So we shrink the border width and radius{' '}
          <em>before</em> the transform (<code>calc(3px / 1.58)</code> etc.) so
          that after scaling the result still looks like{' '}
          <strong>3px</strong> and <strong>8px</strong>. The inner content uses
          the same inverse trick to stay sharp.
        </p>

        <p className="compare-note">
          Click the button below to see plain scale side by side with the
          counter-scale fix. The box size should look similar — but only the fix
          keeps text, border, and corners looking correct.
        </p>

        <div className="compare-grid">
          <div className="compare-item">
            <p className="compare-label">Plain scale</p>
            <div className="compare-preview">
              <button
                type="button"
                className={`box box-target compare-box box-interactive keep-explanation-open${fixCompareActive ? ' scaled' : ''}`}
                onClick={(e) => {
                  if (!fixCompareActive) toggleFixCompare(e)
                  else setExplanationAt(EXPLANATIONS.fixComparePlain, e)
                }}
              >
                Hello
              </button>
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
              <button
                type="button"
                className={`compare-box-wrap box-interactive keep-explanation-open${fixCompareActive ? ' scaled' : ''}`}
                onClick={(e) => {
                  if (!fixCompareActive) toggleFixCompare(e)
                  else setExplanationAt(EXPLANATIONS.fixCompareFixed, e)
                }}
              >
                <div className="compare-inner">Hello</div>
              </button>
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

        <button type="button" className="toggle keep-explanation-open" onClick={toggleFixCompare}>
          {fixCompareActive ? 'Reset boxes' : 'Compare both fixes'}
        </button>
      </section>
      </div>
      </div>

      {explanation && (
        <aside
          ref={explanationDockRef}
          className="explanation-dock"
          style={{
            top: explanation.position?.top,
            left: explanation.position?.left,
            width: explanation.position?.width,
          }}
          aria-live="polite"
        >
          <Explanation
            what={explanation.what}
            why={explanation.why}
            onClose={closeExplanation}
          />
        </aside>
      )}
      <p className="to-be-continued">To be continued ...</p>
    </div>
  )
}

export default App
