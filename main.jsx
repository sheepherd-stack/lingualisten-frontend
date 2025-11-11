import React, { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'

const tdict = {
  zh: {
    language: '语言',
    apiBase: '后端地址',
    upload: '教师中心：上传素材',
    transcript: '原文',
    split: '自动分句',
    createTask: '生成任务',
    testAPIs: '测试接口连通',
    sentenceDictation: '句子听写',
    inputYourText: '请输入你听到的句子…',
    grade: '批改',
    next: '下一句',
    result: '评分结果',
  },
  en: {
    language: 'Language',
    apiBase: 'API Base',
    upload: 'Teacher: Upload Material',
    transcript: 'Transcript',
    split: 'Auto Split',
    createTask: 'Create Task',
    testAPIs: 'Test APIs',
    sentenceDictation: 'Dictation',
    inputYourText: 'Type what you heard…',
    grade: 'Grade',
    next: 'Next',
    result: 'Result',
  }
}

const LANGS = [['zh','中文'],['en','English']]
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

function useI18n(){
  const [lang, setLang] = useState(navigator.language.startsWith('zh')?'zh':'en')
  const t = useMemo(()=>tdict[lang], [lang])
  return { lang, setLang, t }
}

function App(){
  const { lang, setLang, t } = useI18n()
  const [title, setTitle] = useState('Intermediate Listening Set')
  const [transcript, setTranscript] = useState('The boy is running across the street. He helps the old man. Kindness matters.')
  const [material, setMaterial] = useState(null)
  const [task, setTask] = useState(null)
  const [dictationText, setDictationText] = useState('')
  const sentences = transcript.split(/[.!?]/).map(s=>s.trim()).filter(Boolean)
  const [sentIndex, setSentIndex] = useState(0)
  const current = sentences[sentIndex] || ''

  async function createMaterial(){
    const fd = new FormData()
    fd.append('title', title)
    fd.append('transcript', transcript)
    const r = await fetch(`${API_BASE}/materials`, { method:'POST', body: fd })
    const data = await r.json()
    setMaterial(data)
    alert('Material created: id=' + data.id)
  }

  async function doSplit(){
    if(!material){ alert('Create material first'); return }
    const r = await fetch(`${API_BASE}/materials/${material.id}/split`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({}) })
    const data = await r.json()
    alert('Split sentences: ' + data.count)
  }

  async function createTask(){
    if(!material){ alert('Create material first'); return }
    const r = await fetch(`${API_BASE}/tasks`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ title, material_id: material.id, modes:['shadowing','dictation','retell','summary'], difficulty:'A2' }) })
    const data = await r.json()
    setTask(data)
    alert('Task created: id=' + data.id)
  }

  async function gradeDictation(){
    const expected = current
    const payload = { user_id:'u1', task_id: task?.id || 1, sentence_id: 1, expected, text: dictationText }
    const r = await fetch(`${API_BASE}/submit/dictation`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
    const data = await r.json()
    alert('Score: ' + data.score)
  }

  return (
    <div className="container">
      <div className="nav">
        <div className="brand">LinguaListen</div>
        <div>
          <span className="pill">{tdict[lang].language} / {LANGS.find(l=>l[0]===lang)?.[1]}</span>
          <select style={{marginLeft:8}} value={lang} onChange={e=>setLang(e.target.value)}>
            {LANGS.map(([k,n])=>(<option key={k} value={k}>{n}</option>))}
          </select>
        </div>
      </div>

      <div className="grid">
        <div className="card">
          <h3>🧑‍🏫 {t.upload}</h3>
          <div className="muted" style={{margin:'6px 0'}}>{t.apiBase}: <code>{API_BASE}</code></div>
          <div style={{display:'grid',gap:12, marginTop:12}}>
            <input value={title} onChange={e=>setTitle(e.target.value)} />
            <textarea rows="4" value={transcript} onChange={e=>setTranscript(e.target.value)}></textarea>
            <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
              <button className="btn" onClick={createMaterial}>1) {t.upload}</button>
              <button className="btn" onClick={doSplit}>2) {t.split}</button>
              <button className="btn" onClick={createTask}>3) {t.createTask}</button>
            </div>
          </div>
        </div>

        <div className="card">
          <h3>🎧 {t.sentenceDictation}</h3>
          <div className="muted" style={{margin:'6px 0'}}>{t.transcript}: <em>{current}</em></div>
          <textarea rows="4" placeholder={t.inputYourText} value={dictationText} onChange={e=>setDictationText(e.target.value)}></textarea>
          <div style={{display:'flex',gap:8,marginTop:10}}>
            <button className="btn" onClick={gradeDictation}>✅ {t.grade}</button>
            <button className="btn" onClick={()=>{ 
              setSentIndex((i)=> (i+1)%sentences.length); 
              setDictationText(''); 
            }}>➡️ {t.next}</button>
          </div>
        </div>
      </div>

      <div className="footer">© {new Date().getFullYear()} LinguaListen · Orange Theme · Bilingual UI</div>
    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)