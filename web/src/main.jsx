import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Mail, Inbox, Send, Star, Archive, Trash2, PenLine, Search, ShieldCheck, Paperclip, Settings, CircleHelp, ChevronDown } from 'lucide-react';
import './style.css';

const sample = [
  { id: 1, from: 'BharatMail Team', subject: 'Welcome to the BharatMail preview', preview: 'A new home for your email experience. This is sample content for the UI preview.', time: '10:42 AM', initial: 'B', color: 'green', unread: true },
  { id: 2, from: 'Aarav Sharma', subject: 'Project notes for this week', preview: 'Sharing the notes from our last discussion. Let me know what you think.', time: 'Yesterday', initial: 'A', color: 'orange', unread: true },
  { id: 3, from: 'Priya Das', subject: 'Photos from Kolkata', preview: 'Here are the photos I mentioned. Hope you like them!', time: 'Tue', initial: 'P', color: 'purple' },
  { id: 4, from: 'GitHub', subject: 'Your weekly development summary', preview: 'A quick summary of activity from repositories you follow.', time: 'Mon', initial: 'G', color: 'blue' },
  { id: 5, from: 'Meera Roy', subject: 'Re: Design feedback', preview: 'Thanks for sharing the first draft. I added a few suggestions.', time: 'Sun', initial: 'M', color: 'pink' }
];

function App() {
  const [folder, setFolder] = useState('Inbox');
  const [query, setQuery] = useState('');
  const [compose, setCompose] = useState(false);
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [notice, setNotice] = useState('Preview mode — sample messages only; no live mailbox connected.');
  const rows = sample.filter(m => (m.from + m.subject + m.preview).toLowerCase().includes(query.toLowerCase()));

  async function send() {
    if (!to.includes('@') || !subject.trim() || !body.trim()) {
      setNotice('Add a valid recipient, subject and message.');
      return;
    }
    const base = import.meta.env.VITE_API_BASE_URL;
    try {
      const response = await fetch(`${base}/v1/messages/send`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, text: body })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Sending failed');
      setNotice('SMTP server accepted the message. Acceptance does not guarantee delivery.');
      setCompose(false); setTo(''); setSubject(''); setBody('');
    } catch (error) {
      setNotice(`Not sent: ${error.message}. Configure the API and SMTP credentials first.`);
    }
  }

  const folders = [['Inbox', Inbox], ['Starred', Star], ['Sent', Send], ['Archive', Archive], ['Trash', Trash2]];
  return <div className="app">
    <aside className="sidebar">
      <div className="brand"><div className="brand-icon"><Mail size={23}/></div><div><b>BharatMail</b><small>Apna email. Apni pehchaan.</small></div></div>
      <button className="compose-button" onClick={() => setCompose(true)}><PenLine size={18}/> Compose</button>
      <nav>{folders.map(([name, Icon]) => <button key={name} className={folder === name ? 'nav active' : 'nav'} onClick={() => setFolder(name)}><Icon size={18}/><span>{name}</span>{name === 'Inbox' && <b>2</b>}</button>)}</nav>
      <div className="side-bottom">
        <div className="secure"><ShieldCheck size={18}/><span><b>Privacy matters</b><small>Security-first design</small></span></div>
        <button className="nav"><Settings size={18}/> Settings</button><button className="nav"><CircleHelp size={18}/> Help & feedback</button>
        <div className="profile"><div className="avatar green">B</div><span><b>Preview account</b><small>Not connected</small></span><ChevronDown size={16}/></div>
      </div>
    </aside>
    <main className="main">
      <header><div className="search"><Search size={18}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search sample messages"/></div><div className="avatar green">B</div></header>
      <div className="content">
        <div className="heading"><div><p className="eyebrow">YOUR INBOX, REIMAGINED</p><h1>{folder}</h1><p className="muted">A calmer, more personal space for your conversations.</p></div><span className="pill">Preview build</span></div>
        <div className="notice"><ShieldCheck size={16}/>{notice}</div>
        <div className="mail-list"><div className="list-top"><span>{rows.length} sample messages</span><button onClick={() => setNotice('Sample data refreshed. No live mailbox is connected.')}>Refresh</button></div>
          {rows.map(m => <button key={m.id} className="message" onClick={() => setNotice(`Preview only: “${m.subject}”. Connect a secure mailbox API to read live email.`)}>
            <span className="dot">{m.unread && <i/>}</span><span className={`avatar ${m.color}`}>{m.initial}</span>
            <span className="message-copy"><b>{m.from}</b><strong>{m.subject}</strong><span>{m.preview}</span></span><time>{m.time}</time><Star size={16} className="star"/>
          </button>)}
          {rows.length === 0 && <p className="empty">No matching messages</p>}
        </div>
        <footer><span><ShieldCheck size={14}/> Privacy-minded design</span><span>BharatMail Preview · Sample data only</span></footer>
      </div>
    </main>
    {compose && <div className="overlay" onMouseDown={e => e.target === e.currentTarget && setCompose(false)}><section className="compose-modal">
      <div className="modal-head"><b>New message</b><button onClick={() => setCompose(false)}>×</button></div>
      <label>To<input value={to} onChange={e => setTo(e.target.value)} placeholder="name@example.com"/></label>
      <label>Subject<input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Add a subject"/></label>
      <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Write your message…"/>
      <div className="modal-foot"><button className="send-button" onClick={send}><Send size={16}/> Send</button><span><Paperclip size={16}/> Attachments not implemented</span></div>
    </section></div>}
  </div>;
}
createRoot(document.getElementById('root')).render(<App/>);
