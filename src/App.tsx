import { useEffect, useId, useRef, useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, ArrowUp, Check, ChevronDown, Download, Layers3, Linkedin, Mail, MapPin, Menu, Minus, Moon, MoveUpRight, Plus, ScanLine, Sun, X, Box, Code2, GraduationCap, Network, SlidersHorizontal } from 'lucide-react';
import Warehouse from './components/Warehouse';
import { content, languageNames } from './data/content';
import type { Lang } from './data/content';
import { profile } from './config';

const getLang = (): Lang => {
  const chosen = new URLSearchParams(location.search).get('lang') || localStorage.getItem('dj-language');
  return chosen && Object.hasOwn(content, chosen) ? chosen as Lang : 'en';
};
const navKeys = ['about', 'experience', 'projects', 'approach', 'expertise', 'contact'] as const;
const destinations = { about: 'about', experience: 'experience', projects: 'work', approach: 'approach', expertise: 'expertise', contact: 'contact' };

export default function App() {
  const [lang, setLang] = useState<Lang>(getLang);
  const [theme, setTheme] = useState(() => localStorage.getItem('dj-theme') || 'dark');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [role, setRole] = useState(0);
  const [activeRole, setActiveRole] = useState<string | null>('segula-lead');
  const [projectId, setProjectId] = useState<string | null>(() => new URLSearchParams(location.search).get('project'));
  const [logenTab, setLogenTab] = useState(0);
  const [skillTab, setSkillTab] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const t = content[lang];
  const project = t.projects.items.find(item => item.id === projectId);

  useEffect(() => {
    document.documentElement.lang = lang;
    localStorage.setItem('dj-language', lang);
    const url = new URL(location.href);
    if (lang === 'en') url.searchParams.delete('lang'); else url.searchParams.set('lang', lang);
    history.replaceState(null, '', url);
    setRole(0);
  }, [lang]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('dj-theme', theme);
  }, [theme]);

  useEffect(() => {
    const title = project ? `${project.title} | ${profile.name}` : t.meta.title;
    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', project?.summary || t.meta.description);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', project?.summary || t.meta.description);
    const url = new URL(location.href);
    if (project) url.searchParams.set('project', project.id); else url.searchParams.delete('project');
    history.replaceState(null, '', url);
    if (project && !dialog.current?.open) dialog.current?.showModal();
    if (!project && dialog.current?.open) dialog.current?.close();
  }, [project, t]);

  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    if (reduced.matches) return;
    const timer = window.setInterval(() => setRole(value => (value + 1) % 4), 4600);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const height = document.documentElement.scrollHeight - innerHeight;
      document.documentElement.style.setProperty('--progress', `${height > 0 ? scrollY / height * 100 : 0}%`);
    };
    addEventListener('scroll', onScroll, { passive: true });
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), { threshold: 0.07 });
    document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
    onScroll();
    return () => { removeEventListener('scroll', onScroll); observer.disconnect(); };
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setMobileOpen(false); };
    addEventListener('keydown', close);
    return () => removeEventListener('keydown', close);
  }, [mobileOpen]);

  const closeProject = () => setProjectId(null);
  const external = { target: '_blank', rel: 'noopener noreferrer' };
  const resumeLink = <a className="text-link" href={profile.resume} download><Download size={15} />{t.ui.resume}</a>;

  return <>
    <a className="skip-link" href="#main">{t.ui.skip}</a>
    <div className="reading-progress" aria-hidden="true" />
    <header className="site-header">
      <a href="#" className="brand" aria-label="Dušan Janković"><span className="brand-symbol">DJ<span>↗</span></span><span className="brand-name">DUŠAN<br />JANKOVIĆ<span className="brand-dot">.</span></span></a>
      <nav className="desktop-nav" aria-label={t.ui.menu}>
        {navKeys.slice(0, 4).map(key => <a key={key} href={`#${destinations[key]}`}>{t.nav[key]}</a>)}
      </nav>
      <div className="header-tools">
        <label className="language-control"><span className="sr-only">{t.ui.language}</span><select aria-label={t.ui.language} value={lang} onChange={event => setLang(event.target.value as Lang)}>{languageNames.map(language => <option key={language.id} value={language.id}>{language.short}</option>)}</select><ChevronDown size={11} aria-hidden="true" /></label>
        <button className="icon-button theme-button" aria-label={`${t.ui.theme}: ${theme === 'dark' ? t.ui.light : t.ui.dark}`} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}</button>
        <a className="header-contact" href="#contact">{t.nav.contact}<ArrowUpRight size={16} /></a>
        <button className="icon-button mobile-toggle" aria-label={mobileOpen ? t.ui.close : t.ui.menu} aria-expanded={mobileOpen} aria-controls="mobile-navigation" onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X /> : <Menu />}</button>
      </div>
      {mobileOpen && <nav id="mobile-navigation" className="mobile-navigation" aria-label={t.ui.menu}>{navKeys.map(key => <a key={key} href={`#${destinations[key]}`} onClick={() => setMobileOpen(false)}>{t.nav[key]}<ArrowUpRight size={17} /></a>)}</nav>}
    </header>

    <main id="main">
      <section className="hero" aria-labelledby="hero-name">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-topline"><span className="eyebrow"><span className="status-dot" />{t.hero.eyebrow}</span><span className="mono hero-index">DJ / PORTFOLIO — 01</span></div>
        <div className="hero-content">
          <div className="hero-copy">
            <h1 id="hero-name">DUŠAN<br /><span>JANKOVIĆ<span className="name-period">.</span></span></h1>
            <div className="hero-role"><span className="role-line" /><span key={`${lang}-${role}`} className="role-text">{t.hero.roles[role]}</span></div>
            <p className="hero-statement">{t.hero.statement}</p>
            <div className="hero-actions"><a className="button primary" href="#work">{t.ui.explore}<ArrowUpRight size={19} /></a><a className="button secondary" href="#experience">{t.ui.experience}<ArrowRight size={17} /></a></div>
            <div className="hero-links">{resumeLink}<span className="link-divider" /><a href={profile.linkedin} className="text-link" {...external}><Linkedin size={15} />LinkedIn<ArrowUpRight size={12} /></a></div>
          </div>
          <div className="hero-visual">
            <div className="visual-label mono"><span className="tiny-cross">+</span> {t.warehouse.title}<span className="visual-live"><span />{t.warehouse.simulation}</span></div>
            <Warehouse compact labels={t.warehouse} />
            <div className="hero-visual-foot"><span className="mono">01 / {t.warehouse.concept}</span><a href="#approach" aria-label={t.approach.title}><MoveUpRight size={21} /></a></div>
          </div>
        </div>
        <div className="hero-bottom"><span className="location"><MapPin size={14} />{t.hero.location}</span><span className="mono hero-discipline">{t.hero.discipline}</span><a href="#about" className="scroll-link mono">{t.hero.scroll}<ArrowDown size={15} /></a></div>
      </section>

      <div className="industry-strip"><span className="mono">{t.hero.discipline}</span><div className="company-wordmarks"><span>VOLKSWAGEN</span><span>STELLANTIS</span><span>OPEL</span><span>SEGULA<span className="company-sub"> TECHNOLOGY</span></span></div></div>

      <section id="about" className="section about-section">
        <div className="section-heading" data-reveal><span className="eyebrow"><span className="section-number">01</span>{t.about.kicker.replace(/^\d+\s*\/\s*/, '')}</span><h2>{t.about.title}</h2></div>
        <div className="about-layout" data-reveal>
          <div className="portrait-card"><img src={profile.portrait} alt="Dušan Janković" width="400" height="400" loading="lazy" /><div className="portrait-caption"><span className="mini-mark">DJ.</span><span>{t.about.portraitCaption}</span><ArrowUpRight size={18} /></div></div>
          <div className="about-copy">{t.about.body.map((paragraph,index) => <p key={index}>{paragraph}</p>)}<div className="stats-grid">{t.about.stats.map(stat => <div className="stat" key={stat.label}><span className="stat-value">{stat.value}<span> /</span></span><span className="stat-label">{stat.label}</span></div>)}</div><a className="text-link accent-link" href="#expertise">{t.nav.expertise}<ArrowRight size={16} /></a></div>
        </div>
      </section>

      <section id="work" className="section projects-section">
        <div className="section-heading split-heading" data-reveal><div><span className="eyebrow"><span className="section-number">02</span>{t.projects.kicker.replace(/^\d+\s*\/\s*/, '')}</span><h2>{t.projects.title}</h2></div><p>{t.projects.intro}</p></div>
        <div className="project-grid">{t.projects.items.map((item,index) => <button className={`project-card project-card-${index}`} key={item.id} onClick={() => setProjectId(item.id)} data-reveal>
          <div className="project-illustration" aria-hidden="true"><ProjectDiagram variant={index} /><span className="project-code mono">{item.code}</span><span className="project-corner"><ArrowUpRight size={22} /></span></div>
          <div className="project-card-body"><div className="project-meta mono"><span>{item.company}</span><span>0{index+1}</span></div><h3>{item.title}</h3><div className="project-location"><MapPin size={12} />{item.location}</div><p>{item.summary}</p><span className="project-more">{t.ui.details}<ArrowRight size={16} /></span></div>
        </button>)}</div>
      </section>

      <section id="experience" className="section experience-section">
        <div className="experience-intro" data-reveal><span className="eyebrow"><span className="section-number">03</span>{t.experience.kicker.replace(/^\d+\s*\/\s*/, '')}</span><h2>{t.experience.title}</h2><p>{t.experience.intro}</p>{resumeLink}</div>
        <div className="timeline" data-reveal>{t.experience.roles.map((item,index) => <article key={item.id} className={`timeline-item ${activeRole === item.id ? 'expanded' : ''}`}><span className="timeline-node" aria-hidden="true" /><button className="timeline-trigger" aria-expanded={activeRole === item.id} aria-controls={`role-${item.id}`} onClick={() => setActiveRole(activeRole === item.id ? null : item.id)}><div><span className="timeline-date mono">{item.date}</span><h3>{item.title}</h3><span className="timeline-company">{item.company}</span></div><span className="timeline-toggle">{activeRole === item.id ? <Minus size={18} /> : <Plus size={18} />}</span></button><div id={`role-${item.id}`} hidden={activeRole !== item.id} className="timeline-detail"><ul>{item.bullets.map(bullet => <li key={bullet}>{bullet}</li>)}</ul><div className="tags">{item.tags.map(tag => <span key={tag}>{tag}</span>)}</div></div><span className="sr-only">{index+1}</span></article>)}<p className="source-note">{t.experience.sourceNote}</p></div>
      </section>

      <section id="logen" className="logen-section">
        <div className="logen-inner"><div className="logen-copy" data-reveal><span className="eyebrow"><Code2 size={15} />{t.logen.kicker}</span><div className="logen-wordmark">Log<span>EN</span><span className="logen-dot">/ 01</span></div><h2>{t.logen.title}</h2><p>{t.logen.body}</p><span className="status-label"><span className="status-dot orange" />{t.logen.status}</span><div className="logen-tabs" role="tablist" aria-label="LogEN">{t.logen.tabs.map((tab,index) => <button key={index} id={`logen-tab-${index}`} role="tab" aria-selected={logenTab === index} aria-controls="logen-panel" tabIndex={logenTab === index ? 0 : -1} onKeyDown={event => { if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); const next=(logenTab+(event.key==='ArrowRight'?1:t.logen.tabs.length-1))%t.logen.tabs.length; setLogenTab(next); document.getElementById(`logen-tab-${next}`)?.focus(); } }} onClick={() => setLogenTab(index)}>{index === 0 ? <SlidersHorizontal size={16} /> : index === 1 ? <Layers3 size={16} /> : <Box size={16} />}{tab.label}</button>)}</div><div id="logen-panel" role="tabpanel" tabIndex={0} aria-labelledby={`logen-tab-${logenTab}`} className="logen-tab-copy"><h3>{t.logen.tabs[logenTab].title}</h3><p>{t.logen.tabs[logenTab].description}</p></div><a className="button primary" href={profile.logenUrl || '#contact'} {...(profile.logenUrl ? external : {})}>{t.logen.cta}<ArrowUpRight size={18} /></a></div>
        <div className="software-showcase" data-reveal><div className="app-window"><div className="app-titlebar"><div className="window-dots"><i /><i /><i /></div><span className="mono">LogEN / {t.logen.tabs[logenTab].label}</span><ScanLine size={14} /></div><div className="app-content"><aside className="app-rail" aria-hidden="true"><span className="app-logo">L<span>↗</span></span><Layers3 /><Box /><Network /><SlidersHorizontal /></aside><div className="app-main"><div className="app-breadcrumb mono">LogEN <span>/</span> {t.logen.tabs[logenTab].label}</div><div className="app-toolbar"><h3>{t.logen.tabs[logenTab].title}</h3><span className="mockup-badge mono">{t.warehouse.simulation}</span></div>{logenTab === 0 ? <div className="calculation-preview"><div className="concept-fields">{t.logen.planned.slice(0,4).map((label,index) => <div key={label}><span>{label}</span><span className="mono">{['24 × 12','03','04','288'][index]}</span></div>)}</div><div className="capacity-chart"><span className="mono">{t.warehouse.simulation}</span><div className="chart-bars" aria-hidden="true">{[45,68,53,84,71,92,66,76,90,62,80,72].map((height,index) => <i key={index} style={{height:`${height}%`}} />)}</div><span className="chart-axis mono">A1 — A12</span></div></div> : logenTab === 1 ? <div className="layout-preview" aria-hidden="true"><ProjectDiagram variant={2} /></div> : <div className="app-warehouse"><Warehouse compact labels={t.warehouse} /></div>}<div className="app-footer mono"><span className="status-dot" />{t.warehouse.simulation}<span>01 / 03</span></div></div></div></div><p className="mockup-disclaimer">{t.logen.disclaimer}</p></div></div>
      </section>

      <section id="approach" className="section approach-section"><div className="section-heading split-heading" data-reveal><div><span className="eyebrow"><span className="section-number">05</span>{t.approach.kicker.replace(/^\d+\s*\/\s*/, '')}</span><h2>{t.approach.title}</h2></div><p>{t.approach.body}</p></div><div data-reveal><Warehouse labels={t.warehouse} /></div></section>

      <section id="expertise" className="section expertise-section"><div className="section-heading" data-reveal><span className="eyebrow"><span className="section-number">06</span>{t.expertise.kicker.replace(/^\d+\s*\/\s*/, '')}</span><h2>{t.expertise.title}</h2></div><div className="expertise-layout" data-reveal><div className="skill-navigation" role="tablist" aria-label={t.expertise.title} aria-orientation="vertical">{t.expertise.categories.map((category,index) => <button key={index} id={`skill-tab-${index}`} role="tab" aria-selected={skillTab === index} aria-controls="skills-panel" tabIndex={skillTab === index ? 0 : -1} onKeyDown={event => { if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); const next=(skillTab+(event.key==='ArrowDown'?1:t.expertise.categories.length-1))%t.expertise.categories.length; setSkillTab(next); document.getElementById(`skill-tab-${next}`)?.focus(); } }} onClick={() => setSkillTab(index)}><span className="mono">0{index+1}</span>{category.title}<ArrowUpRight size={19} /></button>)}</div><div role="tabpanel" tabIndex={0} id="skills-panel" aria-labelledby={`skill-tab-${skillTab}`} className="skill-panel"><div className="skills-grid">{t.expertise.categories[skillTab].skills.map(skill => <div className="skill-item" key={skill}><Check size={15} /><span>{skill}</span></div>)}</div>{skillTab === t.expertise.categories.length-1 && <p className="source-note">{t.expertise.languageNote}</p>}</div></div>
      <div className="education-block" data-reveal><span className="eyebrow"><GraduationCap size={16} />{t.education.kicker}</span><div className="education-grid">{t.education.items.map(item => <article className="education-item" key={item.degree}><span className="mono">{item.date}</span><h3>{item.degree}</h3><p>{item.school}</p></article>)}</div></div></section>

      <section id="contact" className="contact-section"><div className="contact-grid" aria-hidden="true" /><div className="contact-content" data-reveal><span className="eyebrow"><span className="status-dot" />{t.contact.kicker}</span><h2>{t.contact.title}<span>↗</span></h2><p>{t.contact.body}</p><div className="contact-actions"><a className="button primary" href={profile.linkedin} {...external}><Linkedin size={18} />{t.contact.linkedin}<ArrowUpRight size={18} /></a>{profile.publicEmail && <a className="button secondary" href={`mailto:${profile.publicEmail}`}><Mail size={18} />{t.contact.email}</a>}<a className="button secondary" href={profile.resume} download><Download size={18} />{t.contact.resume}</a></div><span className="contact-location"><MapPin size={15} />{t.contact.country}</span></div></section>
    </main>

    <footer className="site-footer"><a href="#" className="footer-brand">DJ<span>.</span></a><p>© {new Date().getFullYear()} {profile.name}<span>{t.footer.tagline}</span></p><a href="#" className="text-link">{t.footer.top}<ArrowUp size={15} /></a></footer>

    <dialog ref={dialog} className="project-dialog" onClose={closeProject} onClick={event => { if (event.target === event.currentTarget) closeProject(); }} aria-labelledby="project-dialog-title">
      {project && <div className="project-dialog-inner"><div className="dialog-top"><span className="mono">{t.ui.project} / {project.code}</span><button className="icon-button" onClick={closeProject} aria-label={t.ui.close} autoFocus><X size={22} /></button></div><div className="dialog-hero"><div className="dialog-project-diagram" aria-hidden="true"><ProjectDiagram variant={t.projects.items.findIndex(item => item.id === project.id)} /></div><span className="eyebrow">{project.company} / {project.location}</span><h2 id="project-dialog-title">{project.title}</h2><p>{project.summary}</p></div><div className="dialog-body"><div><h3>{t.ui.overview}</h3><p>{project.overview}</p></div><div><h3>{t.ui.responsibilities}</h3><ul>{project.responsibilities.map(item => <li key={item}>{item}</li>)}</ul></div><div><h3>{t.ui.approach}</h3><p>{project.approach}</p></div><div><h3>{t.ui.technologies}</h3><div className="tags">{project.technologies.map(item => <span key={item}>{item}</span>)}</div></div><div className="dialog-result"><h3>{t.ui.results}</h3><p>{project.result}</p></div><p className="source-note">{t.footer.concept}</p><button className="button secondary" onClick={closeProject}>{t.ui.back}<ArrowRight size={16} /></button></div></div>}
    </dialog>
  </>;
}

function ProjectDiagram({ variant }: {variant:number}) {
  const instance = useId().replace(/:/g, '');
  return <svg viewBox="0 0 520 280" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs><pattern id={`grid-${variant}-${instance}`} width="28" height="28" patternUnits="userSpaceOnUse"><path d="M 28 0 L 0 0 0 28" stroke="currentColor" strokeOpacity=".07" /></pattern></defs>
    <rect width="520" height="280" fill={`url(#grid-${variant}-${instance})`} />
    {variant === 0 ? <g transform="translate(85 24)"><path d="M0 148 180 238 348 146 168 56 0 148Z" fill="#00c8ff" fillOpacity=".03" stroke="#00c8ff" strokeOpacity=".3" />{[0,1,2].map(row=><g key={row} transform={`translate(${row*57} ${row*28})`}>{[0,1,2,3].map(col=><g key={col} transform={`translate(${col*40} ${-col*22})`}><path d="M15 109v-62L42 33l28 14v62L42 124Z" fill="#13293a" stroke="#4f7488" /><path d="m15 47 27 15 28-15M42 62v62M15 77l27 15 28-15" stroke="#00c8ff" strokeOpacity=".5" /><path d="M15 47v62M70 47v62" stroke="#ff8a32" /></g>)}</g>)}<path d="m10 170 172 87 142-77" stroke="#00c8ff" strokeWidth="2" strokeDasharray="7 5" /><circle cx="182" cy="257" r="4" fill="#00c8ff" /></g> : variant === 1 ? <g transform="translate(54 54)">{[0,1,2].map(i=><g key={i} transform={`translate(${i*146} 0)`}><rect x="0" y="30" width="112" height="112" rx="1" fill={i===1?'#00c8ff':'#ff8a32'} fillOpacity=".05" stroke={i===1?'#00c8ff':'#638297'} /><path d="m28 77 28-16 28 16v33l-28 16-28-16ZM28 77l28 16 28-16M56 93v33" stroke={i===1?'#00c8ff':'#638297'} /><path d="M15 16h18M15 16v18M97 158H79M97 158v-18" stroke="#00c8ff" /></g>)}<path d="M112 87h34m112 0h34" stroke="#00c8ff" strokeWidth="2" /><path d="m137 82 9 5-9 5m146-10 9 5-9 5" stroke="#00c8ff" /><path d="M0 177h405" stroke="#00c8ff" strokeDasharray="5 7" /></g> : <g transform="translate(69 31)"><path d="M0 38H382V214H0z" stroke="#678293" /><path d="M0 75h382M290 38v176" stroke="#678293" strokeDasharray="5 6" /><path d="M12 87h266v115H12z" fill="#00c8ff" fillOpacity=".05" /><path d="M302 88h68v114h-68z" fill="#ff8a32" fillOpacity=".12" stroke="#ff8a32" strokeOpacity=".5" />{[0,1,2].map(i=><g key={i} transform={`translate(${i*84+26} 101)`}>{[0,1,2,3].map(j=><rect key={j} x={j*15} width="12" height="82" fill="#1b3c50" stroke="#00c8ff" strokeOpacity=".55" />)}</g>)}<path d="M24 58h314v137H286M50 192h205" stroke="#00c8ff" strokeWidth="2" strokeDasharray="6 5" /><circle cx="338" cy="59" r="4" fill="#ff8a32" /></g>}
  </svg>;
}





