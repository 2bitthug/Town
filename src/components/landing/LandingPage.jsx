import React from 'react'

const principles = [
  {
    number: '01',
    title: 'Find your downtown',
    description: 'Explore communities built around the subjects, interests, and places that matter to you.',
    mark: '⌘',
  },
  {
    number: '02',
    title: 'Ask. Answer. Discuss.',
    description: 'Bring a real question, share what you know, or take part in a conversation.',
    mark: '↗',
  },
  {
    number: '03',
    title: 'Choose what you see',
    description: 'Browse public conversations and decide how your feed is ordered. No hidden popularity formula.',
    mark: '≋',
  },
]

export function LandingPage() {
  return (
    <main className="town-landing">
      <header className="landing-header">
        <a className="landing-wordmark" href="/" aria-label="Town home">TOWN<span>.</span></a>
        <nav aria-label="Main">
          <a href="#/about">About</a>
          <a href="#/communities">Explore downtowns</a>
          <a className="landing-signin" href="#/signin">Sign in <span aria-hidden="true">↗</span></a>
        </nav>
      </header>

      <section className="landing-hero" aria-labelledby="landing-title">
        <div className="landing-hero-copy">
          <p className="landing-kicker"><span /> A PLACE FOR PEOPLE, NOT ALGORITHMS</p>
          <h1 id="landing-title">The internet feels smaller when you find <em>your people.</em></h1>
          <p className="landing-intro">Town is a place to discover communities, ask questions, and have conversations around the things you care about. You decide where to go and what deserves your attention.</p>
          <div className="landing-actions">
            <a className="landing-primary" href="#/home">Enter Town <span aria-hidden="true">→</span></a>
            <a className="landing-secondary" href="#/communities">Explore downtowns</a>
          </div>
          <p className="landing-note">Browse public conversations first. Join in when you're ready.</p>
        </div>

        <div className="landing-art" aria-label="Illustration of connected community spaces" role="img">
          <div className="landing-art-orbit orbit-one" />
          <div className="landing-art-orbit orbit-two" />
          <div className="landing-art-cross cross-one" />
          <div className="landing-art-cross cross-two" />
          <div className="landing-art-center"><span>town</span><i>●</i></div>
          <div className="landing-art-node node-top"><b>01</b><span>Shared interests</span></div>
          <div className="landing-art-node node-right"><b>02</b><span>Open questions</span></div>
          <div className="landing-art-node node-bottom"><b>03</b><span>Real conversations</span></div>
          <div className="landing-art-caption">A little corner of the internet<br />that belongs to its people.</div>
        </div>
        <div className="landing-index"><span>01 / 03</span><span>FIND YOUR PLACE</span></div>
      </section>

      <section className="landing-principles" aria-labelledby="principles-title">
        <div className="landing-section-heading">
          <p className="landing-kicker">A DIFFERENT KIND OF SOCIAL SPACE</p>
          <h2 id="principles-title">Less feed. More <em>community.</em></h2>
          <p>Town gives conversations a home—and gives you more say in how you find them.</p>
        </div>
        <div className="landing-principle-grid">
          {principles.map(item => (
            <article className="landing-principle" key={item.number}>
              <div className="landing-principle-top"><span>{item.number}</span><b aria-hidden="true">{item.mark}</b></div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-final">
        <div><p className="landing-kicker">YOUR TOWN IS WAITING</p><h2>Start with a conversation.</h2></div>
        <a className="landing-primary" href="#/home">Take a look inside <span aria-hidden="true">→</span></a>
      </section>

      <footer className="landing-footer">
        <a className="landing-wordmark" href="/">TOWN<span>.</span></a>
        <span>Built around people and the things they want to talk about.</span>
        <div><a href="#/privacy">Privacy</a><a href="#/terms">Terms</a><a href="#/help">How it works</a></div>
      </footer>
    </main>
  )
}
