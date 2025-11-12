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
    sentenceDictation: '学生区：句子听写',
    inputYourText: '请输入你听到的句子…',
    grade: '批改',
    next: '下一句',
    result: '评分结果',
    success: '操作成功！',
    fail: '操作失败，请检查后端是否连通。'
  },
  en: {
    language: 'Language',
    apiBase: 'API Base',
    upload: 'Teacher: Upload Material',
    transcript: 'Transcript',
    split: 'Auto Split',
    createTask: 'Create Task',
    sentenceDictation: 'Student: Dictation',
    inputYourText: 'Type what you heard…',
    grade: 'Grade',
    next: 'Next',
    result: 'Result',
    success: 'Success!',
    fail: 'Failed. Please check API connection.'
  }
}

const LANGS = [['zh','中文'],['en','English']]
const API_BASE = 'https://lingualisten-backend.onrender.com'

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
    try{
      const fd = new FormData()
      fd.append('title', title)
      fd.append('transcript', transcript)
      const r = await fetch(`${API_BASE}/materials`, { method:'POST', body: fd })
      const data = await r.json()
      setMaterial(data)
      alert(t.success + ' id=' + data.id)
    }catch(e){ alert(t.fail) }
  }

  async function doSplit(){
    if(!material){ alert('请先创建素材'); return }
    try{
      const r = await fetch(`${API_BASE}/materials/${material.id}/split`, { method:'POST' })
      const data = await r.json()
      alert('共分句: ' + data.count)
    }catch(e){ alert(t.fail) }
  }

  async function createTask(){
    if(!material){ alert('请先创建素材'); return }
    try{
      const r = await fetch(`${API_BASE}/tasks`, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          title,
          material_id: material.id,
          modes:['shadowing','dictation','retell','summary'],
          difficulty:'A2'
        })
      })
      const data = await r.json()
      setTask(data)
      alert(t.success + ' id=' + data.id)
    }catch(e){ alert(t.fail) }
  }

  async function gradeDictation(){
    if(!task){ alert('请先生成任务'); return }
    try{
      const expected = current
      const payload = {
        user_id:'u1',
        task_id: task.id,
        sentence_id: sentIndex+1,
        expected,
        text: dictationText
      }
      const r = await fetch(`${API_BASE}/submit/dictation`, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify(payload)
      })
      const data = await r.json()
      alert(t.result + ': ' + data.score)
    }catch(e){ alert(t.fail) }
  }

  return (
    <div style={{fontFamily:'sans-serif', background:'#fff9f4', color:'#333', padding:'1.5rem'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem'}}>
        <h2 style={{color:'#FF8C3A'}}>LinguaListen 🎧</h2>
        <div>
          <span>{t.language}：</span>
          <select value={lang} onChange={e=>setLang(e.target.value)}>
            {LANGS.map(([k,n])=>(<option key={k} value={k}>{n}</option>))}
          </select>
        </div>
      </div>

      <div style={{display:'grid', gap:'1rem', gridTemplateColumns:'1fr 1fr', alignItems:'start'}}>
        <div style={{background:'white', padding:'1rem', borderRadius:'1rem', boxShadow:'0 2px 8px rgba(0,0,0,0.05)'}}>
          <h3>🧑‍🏫 {t.upload}</h3>
          <p style={{fontSize:'0.85rem', color:'#666'}}>{t.apiBase}：<code>{API_BASE}</code></p>
          <input value={title} onChange={e=>setTitle(e.target.value)} style={{width:'100%',margin:'0.5rem 0',padding:'0.5rem'}}/>
          <textarea rows="4" value={transcript} onChange={e=>setTranscript(e.target.value)} style={{width:'100%',padding:'0.5rem'}}/>
          <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap',marginTop:'0.5rem'}}>
            <button onClick={createMaterial} style={btn}>1️⃣ {t.upload}</button>
            <button onClick={doSplit} style={btn}>2️⃣ {t.split}</button>
            <button onClick={createTask} style={btn}>3️⃣ {t.createTask}</button>
          </div>
        </div>

        <div style={{background:'white', padding:'1rem', borderRadius:'1rem', boxShadow:'0 2px 8px rgba(0,0,0,0.05)'}}>
          <h3>🎧 {t.sentenceDictation}</h3>
          <p style={{fontSize:'0.85rem', color:'#666'}}>{t.transcript}：<em>{current}</em></p>
          <textarea rows="4" placeholder={t.inputYourText} value={dictationText} onChange={e=>setDictationText(e.target.value)} style={{width:'100%',padding:'0.5rem'}}/>
          <div style={{display:'flex',gap:'0.5rem',marginTop:'0.5rem'}}>
            <button onClick={gradeDictation} style={btn}>✅ {t.grade}</button>
            <button onClick={()=>{setSentIndex((i)=>(i+1)%sentences.length);setDictationText('')}} style={btn}>➡️ {t.next}</button>
          </div>
        </div>
      </div>

      <p style={{textAlign:'center',color:'#888',marginTop:'2rem',fontSize:'0.8rem'}}>
        © {new Date().getFullYear()} LinguaListen · 双语版 · Orange Theme
      </p>
    </div>
  )
}

const btn = {
  background:'#FF8C3A',
  color:'white',
  border:'none',
  borderRadius:'10px',
  padding:'8px 12px',
  cursor:'pointer'
}

createRoot(document.getElementById('root')).render(<App />)
