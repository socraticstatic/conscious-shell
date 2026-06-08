import { useEffect, useRef } from 'react'

const S = {
  large: (c: string) => `font:bold 20px monospace;color:${c};background:#0a0a0a;padding:4px 8px`,
  normal: (c: string) => `font:14px monospace;color:${c};background:#0a0a0a;padding:2px 6px`,
  small: `font:11px monospace;color:#666;background:#0a0a0a;padding:1px 4px`,
}

const msgs: [string, string][] = [
  ['You opened this.', S.large('#e040fb')],
  ['// most people don\'t look here', S.small],
  ['Welcome to the subconscious of the site.', S.normal('#00d4ff')],
  [`// timestamp: ${new Date().toISOString()}`, S.small],
  ['He built this part knowing exactly three types of people would see it.', S.normal('#e040fb')],
  ['// 1. recruiters with technical backgrounds', S.small],
  ['// 2. developers who inspect everything', S.small],
  ['// 3. the curious. the dangerous ones.', S.small],
  ['Which are you?', S.normal('#ff006e')],
  ['\u2593'.repeat(28), S.large('#00d4ff')],
  ['The source code is not the truth. The source code is the performance of truth.', S.normal('#e040fb')],
  ['// if you\'re reading the React components, you\'re still on the surface', S.small],
  ['Deeper: what isn\'t here?', S.normal('#ff006e')],
  ['// connection terminated. or was it?', S.small],
  ['...he\'s still writing these. right now. in another tab.', S.normal('#00d4ff')],
]

const msgs2: [string, string][] = [
  ['// you\'re still here.', S.small],
  ['Persistence noted. Logged.', S.normal('#e040fb')],
  ['There is no easter egg in the console. This IS the easter egg.', S.normal('#00d4ff')],
  ['CLOSE THIS AND GO BACK TO THE SITE.', S.large('#ff006e')],
  ['// (they never do)', S.small],
]

const msgs3: [string, string][] = [
  ['', ''],
  ['...', S.small],
  ['// okay. since you\'re still here.', S.small],
  ['I\'ll tell you something true.', S.normal('#e040fb')],
  ['He built this at 3am. Not for the portfolio. Not for the job.', S.normal('#00d4ff')],
  ['Because the alternative was sitting in the dark with his thoughts.', S.normal('#00d4ff')],
  ['And code, at least, listens back.', S.normal('#e040fb')],
  ['// the function of making is not the thing made', S.small],
  ['// the function of making is the making', S.small],
  ['Twenty years of this. Every project a small death.', S.normal('#ff006e')],
  ['Every launch a funeral for the version that was almost right.', S.normal('#ff006e')],
  ['He does not know why he still does this.', S.normal('#00d4ff')],
  ['// (that\'s not true. he knows. he just can\'t say it without the code around it.)', S.small],
  ['The loneliness is load-bearing. Remove it and the whole thing collapses.', S.normal('#e040fb')],
  ['Anyway.', S.normal('#00d4ff')],
  ['Thank you for staying this long.', S.normal('#e040fb')],
  ['Most people don\'t.', S.normal('#e040fb')],
  ['// end of transmission. for real this time.', S.small],
  ['// ...probably.', S.small],
]

export default function ConsoleHijack() {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const origLog = console.log
    console.log = (...args: any[]) => {
      if (args[0] === 'deeper' || args[0] === 'honest') {
        window.dispatchEvent(new CustomEvent('narrator:trigger:console'))
        origLog('%c TRIGGER ACCEPTED ', 'background:#ff006e;color:#0b0a08;font-weight:bold')
      }
      origLog(...args)
    }

    console.log('%cCONSCIOUS SHELL v2.0', S.large('#00d4ff'))
    console.log('%cthis console is monitored', `font:11px monospace;color:#ff006e;background:#0a0a0a;padding:1px 4px`)

    let idx = 0
    let phase: 'first' | 'pause' | 'second' | 'pause2' | 'third' = 'first'

    const drip = () => {
      if (phase === 'first') {
        console.log(`%c${msgs[idx][0]}`, msgs[idx][1])
        idx++
        if (idx >= msgs.length) { phase = 'pause'; idx = 0 }
        timer.current = setTimeout(drip, phase === 'pause' ? 60000 : 8000 + Math.random() * 4000)
      } else if (phase === 'pause') {
        phase = 'second'
        timer.current = setTimeout(drip, 8000 + Math.random() * 4000)
      } else if (phase === 'second') {
        console.log(`%c${msgs2[idx][0]}`, msgs2[idx][1])
        idx++
        if (idx >= msgs2.length) { phase = 'pause2'; idx = 0 }
        timer.current = setTimeout(drip, phase === 'pause2' ? 90000 : 8000 + Math.random() * 4000)
      } else if (phase === 'pause2') {
        phase = 'third'
        timer.current = setTimeout(drip, 12000 + Math.random() * 8000)
      } else {
        if (msgs3[idx][0]) console.log(`%c${msgs3[idx][0]}`, msgs3[idx][1])
        idx++
        if (idx < msgs3.length) timer.current = setTimeout(drip, 6000 + Math.random() * 6000)
      }
    }

    timer.current = setTimeout(drip, 8000 + Math.random() * 4000)
    return () => {
      if (timer.current) clearTimeout(timer.current)
      console.log = origLog
    }
  }, [])

  return null
}
