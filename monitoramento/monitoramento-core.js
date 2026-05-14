const SUPABASE_URL='https://zvtzbiqfwhggysiuiuxh.supabase.co/rest/v1/'
const SUPABASE_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2dHpiaXFmd2hnZ3lzaXVpdXhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1ODYyMjcsImV4cCI6MjA5MzE2MjIyN30.tCnFZv2B6Kmd9KsyZM8CHClZqsq7Nyu-8nxyYVs_ZMQ'

const client=supabase.createClient(
SUPABASE_URL,
SUPABASE_KEY
)

let MONITORAMENTO_ATUAL=null

function abrirTela(nome){

document
.querySelectorAll('.tela-monitoramento')
.forEach(t=>t.classList.add('hidden'))

document
.getElementById('tela-'+nome)
.classList.remove('hidden')

document
.querySelectorAll('.nav-btn')
.forEach(b=>b.classList.remove('nav-active'))

if(event&&event.target){
event.target.classList.add('nav-active')
}

if(nome==='auditoria'){
carregarAuditoriaCompleta()
}

if(nome==='dashboard'){
carregarDashboard()
}

if(nome==='monitoramentos'){
carregarListaMonitoramentos()
}

if(nome==='matriz'){
carregarItensMatriz()
}

if(nome==='evidencias'){
carregarEvidencias()
}

if(nome==='analises'){
carregarAnalises()
}

if(nome==='resultados'){
carregarResultados()
}

}

document.addEventListener('DOMContentLoaded',async()=>{

await carregarDashboard()

})

window.addEventListener('error',e=>{

console.log(
'ERRO GLOBAL:',
e.error
)

})

window.addEventListener('unhandledrejection',e=>{

console.log(
'PROMISE ERROR:',
e.reason
)

})
