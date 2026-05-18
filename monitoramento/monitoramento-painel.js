/*=========================================================
001 MONITORAMENTO-PAINEL.JS VARIÁVEIS GLOBAIS
=========================================================*/
let graficoStatus=null
let graficoEvolucao=null
let graficoCriticidade=null
let graficoBeneficios=null
window.MONITORAMENTO_EDITANDO={}

/*=========================================================
002 MONITORAMENTO-PAINEL.JS DASHBOARD PRINCIPAL
=========================================================*/
async function carregarDashboard(){
try{
let origem=''
let filtro=document.getElementById('filtroOrigem')
if(filtro){
origem=filtro.value||''
}
let monitoramento=await carregarMonitoramentoAtual()
let query=client
.from('vw_monitoramento_integrado')
.select('*')
if(monitoramento&&monitoramento.origem){
query=query.eq('origem',monitoramento.origem)
}
if(origem){
query=query.eq('origem',origem)
}
let{data,error}=await query
if(error){
console.log(error)
return
}
data=ordenarDataGlobal(data||[])
data=aplicarFiltroOrigem(data||[])
let total=data.length
let executadas=0
let parciais=0
let naoExecutadas=0
let andamento=0
let riscoAlto=0
let riscoMedio=0
let riscoBaixo=0
let beneficios=0
;(data||[]).forEach(i=>{
let percentual=Number(i.percentual||0)
beneficios+=percentual
if(i.status==='EXECUTADA'){
executadas++
}
if(i.status==='PARCIALMENTE EXECUTADA'){
parciais++
}
if(i.status==='NÃO EXECUTADA'){
naoExecutadas++
}
if(i.status==='EM ANDAMENTO'){
andamento++
}
if(percentual<40){
riscoAlto++
}else if(percentual<80){
riscoMedio++
}else{
riscoBaixo++
}
})
let kpiTotal=document.getElementById('kpiTotal')
let kpiExecutadas=document.getElementById('kpiExecutadas')
let kpiParciais=document.getElementById('kpiParciais')
let kpiNaoExecutadas=document.getElementById('kpiNaoExecutadas')
let kpiAndamento=document.getElementById('kpiAndamento')
if(kpiTotal){
kpiTotal.innerHTML=total
}
if(kpiExecutadas){
kpiExecutadas.innerHTML=executadas
}
if(kpiParciais){
kpiParciais.innerHTML=parciais
}
if(kpiNaoExecutadas){
kpiNaoExecutadas.innerHTML=naoExecutadas
}
if(kpiAndamento){
kpiAndamento.innerHTML=andamento
}
await carregarGraficoStatus(executadas,parciais,naoExecutadas,andamento)
await carregarGraficoCriticidade(riscoAlto,riscoMedio,riscoBaixo)
await carregarGraficoBeneficios()
await carregarGraficoEvolucao()
if(typeof carregarAlertasTecnicos==='function'){
await carregarAlertasTecnicos()
}
}catch(e){
console.log(e)
}
}

/*=========================================================
003 MONITORAMENTO-PAINEL.JS GRÁFICO STATUS
=========================================================*/
async function carregarGraficoStatus(executadas,parciais,naoExecutadas,andamento){
let ctx=document.getElementById('graficoStatus')
if(!ctx){
return
}
if(graficoStatus){
graficoStatus.destroy()
}
graficoStatus=new Chart(ctx,{
type:'doughnut',
data:{
labels:['Executadas','Parciais','Não Executadas','Em Andamento'],
datasets:[{
data:[executadas,parciais,naoExecutadas,andamento],
backgroundColor:['#10b981','#f59e0b','#ef4444','#3b82f6'],
borderWidth:0
}]
},
options:{
responsive:true,
maintainAspectRatio:false,
plugins:{
legend:{
labels:{
color:'#fff'
}
},
datalabels:{
color:'#fff',
font:{
weight:'bold'
},
formatter:(v)=>v
}
}
},
plugins:[ChartDataLabels]
})
}

/*=========================================================
004 MONITORAMENTO-PAINEL.JS GRÁFICO EVOLUÇÃO
=========================================================*/
async function carregarGraficoEvolucao(){
let{data,error}=await client
.from('evolucao_mensal')
.select('*')
.order('mes_referencia',{ascending:true})
if(error){
console.log(error)
return
}
let mapa={}
;(data||[]).forEach(e=>{
let mes=e.mes_referencia||'SEM MÊS'
if(!mapa[mes]){
mapa[mes]=[]
}
mapa[mes].push(Number(e.percentual_lancado||0))
})
let labels=[]
let valores=[]
Object.keys(mapa).forEach(m=>{
labels.push(m)
let arr=mapa[m]
let media=arr.reduce((a,b)=>a+b,0)/arr.length
valores.push(Number(media.toFixed(1)))
})
let ctx=document.getElementById('graficoEvolucao')
if(!ctx){
return
}
if(graficoEvolucao){
graficoEvolucao.destroy()
}
graficoEvolucao=new Chart(ctx,{
type:'line',
data:{
labels:labels,
datasets:[{
label:'Evolução Real TAGS',
data:valores,
borderColor:'#3b82f6',
backgroundColor:'rgba(59,130,246,.2)',
fill:true,
tension:.35
}]
},
options:{
responsive:true,
maintainAspectRatio:false,
plugins:{
legend:{
labels:{
color:'#fff'
}
},
datalabels:{
color:'#fff',
anchor:'end',
align:'top'
}
},
scales:{
x:{
ticks:{
color:'#fff'
},
grid:{
color:'rgba(255,255,255,.05)'
}
},
y:{
ticks:{
color:'#fff'
},
grid:{
color:'rgba(255,255,255,.05)'
}
}
}
},
plugins:[ChartDataLabels]
})
}

/*=========================================================
005 MONITORAMENTO-PAINEL.JS LISTA MONITORAMENTOS
=========================================================*/
async function carregarListaMonitoramentos(){
let{data,error}=await client
.from('monitoramentos')
.select('*')
.order('titulo',{ascending:true})
if(error){
console.log(error)
return
}
renderizarMonitoramentos(data||[])
}

/*=========================================================
006 MONITORAMENTO-PAINEL.JS CLASSE STATUS
=========================================================*/
function getClasseStatus(s){
if(s==='EXECUTADA')return'verde'
if(s==='PARCIALMENTE EXECUTADA')return'amarelo'
if(s==='NÃO EXECUTADA')return'vermelho'
if(s==='EM ANDAMENTO')return'azul'
return''
}

/*=========================================================
007 MONITORAMENTO-PAINEL.JS NOVO MONITORAMENTO
=========================================================*/
async function novoMonitoramento(){
let titulo=prompt('Título do monitoramento')
if(!titulo)return
let orgao=prompt('Órgão responsável')
if(!orgao)return
let origem=prompt('Origem: SEDAM, SEPAT ou QUEIMADAS','SEDAM')
if(!origem)return
origem=origem.toUpperCase().trim()
let payload={
titulo:titulo,
orgao:orgao,
origem:origem,
tabela_origem:'vw_monitoramento_integrado',
descricao_origem:'Integração institucional '+origem,
status:'EM ANDAMENTO',
criticidade:'ALTA'
}
let{data,error}=await client
.from('monitoramentos')
.insert([payload])
.select()
.single()
if(error){
console.log(error)
alert('Erro ao criar monitoramento')
return
}
MONITORAMENTO_ATUAL=data.id
await carregarListaMonitoramentos()
await carregarDashboard()
alert('Monitoramento criado com sucesso')
}

/*=========================================================
008 MONITORAMENTO-PAINEL.JS EXCLUIR MONITORAMENTO
=========================================================*/
async function excluirMonitoramento(id){
if(!confirm('Excluir monitoramento?')){
return
}
try{
let{error}=await client
.from('monitoramentos')
.delete()
.eq('id',id)
if(error){
console.log(error)
alert('Erro ao excluir')
return
}
await carregarListaMonitoramentos()
await carregarDashboard()
alert('Monitoramento excluído')
}catch(e){
console.log(e)
alert('Falha ao excluir')
}
}

/*=========================================================
009 MONITORAMENTO-PAINEL.JS ALTERAR CAMPOS INLINE
=========================================================*/
function alterarCampoMonitoramento(id,campo,valor){
if(!window.MONITORAMENTO_EDITANDO[id]){
window.MONITORAMENTO_EDITANDO[id]={}
}
window.MONITORAMENTO_EDITANDO[id][campo]=valor
}

/*=========================================================
010 MONITORAMENTO-PAINEL.JS SALVAR MONITORAMENTO
=========================================================*/
async function salvarMonitoramento(id){
let payload=window.MONITORAMENTO_EDITANDO[id]
if(!payload||Object.keys(payload).length===0){
alert('Nenhuma alteração encontrada')
return
}
let btn=document.querySelector(`[data-save-monitoramento="${id}"]`)
if(btn){
btn.disabled=true
btn.innerHTML='SALVANDO...'
}
try{
let{error}=await client
.from('monitoramentos')
.update(payload)
.eq('id',id)
if(error){
console.log(error)
alert('Erro ao salvar')
return
}
window.MONITORAMENTO_EDITANDO[id]={}
await carregarListaMonitoramentos()
await carregarDashboard()
alert('Monitoramento salvo com sucesso')
}catch(e){
console.log(e)
alert('Falha ao salvar')
}
if(btn){
btn.disabled=false
btn.innerHTML='Salvar'
}
}

/*=========================================================
011 MONITORAMENTO-PAINEL.JS RENDERIZAR MONITORAMENTOS
=========================================================*/
function renderizarMonitoramentos(data){
let html=''
;(data||[]).forEach(m=>{
html+=`
<div class="card-monitoramento">
<div class="card-monitoramento-topo">
<div style="flex:1;">
<input class="titulo-inline" value="${m.titulo||''}" oninput="alterarCampoMonitoramento(${m.id},'titulo',this.value)">
<div class="monitoramento-subtitulo">
<select class="select-inline-monitoramento" style="max-width:160px;" onchange="alterarCampoMonitoramento(${m.id},'origem',this.value)">
<option value="SEDAM" ${m.origem==='SEDAM'?'selected':''}>SEDAM</option>
<option value="SEPAT" ${m.origem==='SEPAT'?'selected':''}>SEPAT</option>
<option value="QUEIMADAS" ${m.origem==='QUEIMADAS'?'selected':''}>QUEIMADAS</option>
</select>
•
<input class="subtitulo-inline" value="${m.orgao||''}" oninput="alterarCampoMonitoramento(${m.id},'orgao',this.value)">
</div>
</div>
<select class="select-inline-monitoramento" style="max-width:220px;" onchange="alterarCampoMonitoramento(${m.id},'status',this.value)">
<option value="EM ANDAMENTO" ${m.status==='EM ANDAMENTO'?'selected':''}>EM ANDAMENTO</option>
<option value="EXECUTADA" ${m.status==='EXECUTADA'?'selected':''}>EXECUTADA</option>
<option value="PARCIALMENTE EXECUTADA" ${m.status==='PARCIALMENTE EXECUTADA'?'selected':''}>PARCIALMENTE EXECUTADA</option>
<option value="NÃO EXECUTADA" ${m.status==='NÃO EXECUTADA'?'selected':''}>NÃO EXECUTADA</option>
</select>
</div>

<div class="monitoramento-info-grid">

<div>
<b>Processo</b>
<input class="input-inline-monitoramento" value="${m.processo||''}" oninput="alterarCampoMonitoramento(${m.id},'processo',this.value)">
</div>

<div>
<b>Relator</b>
<input class="input-inline-monitoramento" value="${m.relator||''}" oninput="alterarCampoMonitoramento(${m.id},'relator',this.value)">
</div>

<div>
<b>Auditor</b>
<input class="input-inline-monitoramento" value="${m.auditor_responsavel||''}" oninput="alterarCampoMonitoramento(${m.id},'auditor_responsavel',this.value)">
</div>

<div>
<b>Criticidade</b>
<select class="select-inline-monitoramento" onchange="alterarCampoMonitoramento(${m.id},'criticidade',this.value)">
<option value="ALTA" ${m.criticidade==='ALTA'?'selected':''}>ALTA</option>
<option value="MÉDIA" ${m.criticidade==='MÉDIA'?'selected':''}>MÉDIA</option>
<option value="BAIXA" ${m.criticidade==='BAIXA'?'selected':''}>BAIXA</option>
</select>
</div>

<div>
<b>Acórdão</b>
<input class="input-inline-monitoramento" value="${m.acordao||''}" oninput="alterarCampoMonitoramento(${m.id},'acordao',this.value)">
</div>

<div>
<b>Descrição</b>
<input class="input-inline-monitoramento" value="${m.descricao_origem||''}" oninput="alterarCampoMonitoramento(${m.id},'descricao_origem',this.value)">
</div>

</div>

<div class="monitoramento-actions">

<button class="btn-padrao" onclick="abrirMonitoramento(${m.id})">
Abrir
</button>

<button class="btn-padrao verde" data-save-monitoramento="${m.id}" onclick="salvarMonitoramento(${m.id})">
Salvar
</button>

<button class="btn-padrao vermelho" onclick="excluirMonitoramento(${m.id})">
Excluir
</button>

</div>

</div>
`
})
let lista=document.getElementById('listaMonitoramentos')
if(lista){
lista.innerHTML=html
}
}

/*=========================================================
012 MONITORAMENTO-PAINEL.JS FILTRAR MONITORAMENTOS
=========================================================*/
async function filtrarMonitoramentos(){
let busca=document.getElementById('buscaMonitoramento').value.toLowerCase()
let status=document.getElementById('filtroStatus').value
let criticidade=document.getElementById('filtroCriticidade').value
let query=client
.from('monitoramentos')
.select('*')
.order('titulo',{ascending:true})
if(status){
query=query.eq('status',status)
}
if(criticidade){
query=query.eq('criticidade',criticidade)
}
let{data,error}=await query
if(error){
console.log(error)
return
}
if(busca){
data=(data||[]).filter(m=>
(m.titulo||'').toLowerCase().includes(busca)||
(m.orgao||'').toLowerCase().includes(busca)||
(m.processo||'').toLowerCase().includes(busca)
)
}
renderizarMonitoramentos(data||[])
}
/*=========================================================
013 MONITORAMENTO-PAINEL.JS ABRIR MONITORAMENTO
=========================================================*/
async function abrirMonitoramento(id){
MONITORAMENTO_ATUAL=id
localStorage.setItem('monitoramentoAtual',id)
let monitoramento=await carregarMonitoramentoAtual()
if(!monitoramento){
return
}
document.querySelectorAll('.card-monitoramento').forEach(c=>{
c.classList.remove('card-monitoramento-ativo')
})
let card=document.querySelector(`[data-monitoramento="${id}"]`)
if(card){
card.classList.add('card-monitoramento-ativo')
}
await carregarDashboard()
if(typeof carregarItensMatriz==='function'){
await carregarItensMatriz()
}
if(typeof carregarPainelRiscos==='function'){
await carregarPainelRiscos()
}
if(typeof carregarPainelExecutivo==='function'){
await carregarPainelExecutivo()
}
if(typeof carregarHistorico==='function'){
await carregarHistorico()
}
if(typeof carregarCentralEvidencias==='function'){
await carregarCentralEvidencias()
}
if(typeof carregarPainelBeneficios==='function'){
await carregarPainelBeneficios()
}
abrirTela('dashboard')
}

/*=========================================================
014 MONITORAMENTO-PAINEL.JS FILTRAR ORIGEM
=========================================================*/
function filtrarOrigemMonitoramento(){
let filtro=document.getElementById('filtroOrigem')
if(filtro){
ORIGEM_ATUAL=filtro.value||'TODAS'
}
carregarListaMonitoramentos()
carregarDashboard()
}

/*=========================================================
015 MONITORAMENTO-PAINEL.JS FORMATAR DATA HORA
=========================================================*/
function formatarDataHora(data){
if(!data){
return'-'
}
let dt=new Date(data)
return dt.toLocaleDateString('pt-BR')+' '+dt.toLocaleTimeString('pt-BR')
}

/*=========================================================
016 MONITORAMENTO-PAINEL.JS ALERTAS TÉCNICOS
=========================================================*/
async function carregarAlertasTecnicos(){
let{data,error}=await client
.from('monitoramento_itens')
.select('*')
if(error){
console.log(error)
return
}
data=ordenarDataGlobal(data||[])
data=aplicarFiltroOrigem(data||[])
let html='<div class="alertas-grid">'
let hoje=new Date()
;(data||[]).forEach(i=>{
let alertas=[]
let percentual=Number(i.percentual||0)
if(percentual<40){
alertas.push('Percentual inferior a 40%')
}
if(i.criticidade==='ALTA'){
alertas.push('Criticidade alta identificada')
}
if(i.status==='NÃO EXECUTADA'){
alertas.push('Item não executado')
}
if(i.prazo){
let prazo=new Date(i.prazo)
if(prazo<hoje&&i.status!=='EXECUTADA'){
alertas.push('Prazo expirado')
}
}
if(alertas.length>0){
html+=`
<div class="alerta-box">
<div class="alerta-titulo">
⚠ ITEM ${i.item||'-'}
</div>
<div class="alerta-texto">
${alertas.map(a=>`• ${a}`).join('<br>')}
</div>
</div>
`
}
})
html+='</div>'
if(html==='<div class="alertas-grid"></div>'){
html=`
<div class="alerta-box" style="background:#064e3b;border-color:#10b981;">
<div class="alerta-titulo">
✔ Nenhum alerta crítico identificado
</div>
<div class="alerta-texto" style="color:#d1fae5;">
Os itens monitorados encontram-se dentro dos parâmetros técnicos esperados.
</div>
</div>
`
}
let painel=document.getElementById('painelAlertas')
if(painel){
painel.innerHTML=html
}
}

/*=========================================================
017 MONITORAMENTO-PAINEL.JS ATUALIZAR SEMÁFOROS
=========================================================*/
async function atualizarSemaforosAutomaticos(){
let{data,error}=await client
.from('monitoramento_itens')
.select('*')
if(error){
console.log(error)
return
}
data=ordenarDataGlobal(data||[])
for(let item of(data||[])){
let status=item.status||'EM ANDAMENTO'
let percentual=Number(item.percentual||0)
let prazo=item.prazo
let criticidade='BAIXA'
if(percentual<40){
criticidade='ALTA'
}else if(percentual<80){
criticidade='MÉDIA'
}
if(prazo){
let hoje=new Date()
let dtPrazo=new Date(prazo)
if(dtPrazo<hoje&&status!=='EXECUTADA'){
criticidade='ALTA'
}
}
await client
.from('monitoramento_itens')
.update({
criticidade:criticidade
})
.eq('id',item.id)
}
if(typeof carregarItensMatriz==='function'){
await carregarItensMatriz()
}
await carregarDashboard()
}

/*=========================================================
018 MONITORAMENTO-PAINEL.JS AUTOLOAD
=========================================================*/
document.addEventListener('DOMContentLoaded',async()=>{
await carregarListaMonitoramentos()
await carregarDashboard()
await carregarAlertasTecnicos()
await atualizarSemaforosAutomaticos()
})

/*=========================================================
019 MONITORAMENTO-PAINEL.JS AUTOREFRESH
=========================================================*/
setInterval(async()=>{
try{
await carregarDashboard()
await carregarAlertasTecnicos()
}catch(e){
console.log(e)
}
},60000)
/*=========================================================
020 MONITORAMENTO-PAINEL.JS CLASSE STATUS
=========================================================*/
function getClasseStatus(status){
if(status==='EXECUTADA'){
return'verde'
}
if(status==='PARCIALMENTE EXECUTADA'){
return'amarelo'
}
if(status==='NÃO EXECUTADA'){
return'vermelho'
}
if(status==='EM ANDAMENTO'){
return'azul'
}
return''
}

/*=========================================================
021 MONITORAMENTO-PAINEL.JS RANKING
=========================================================*/
async function carregarRanking(){
let{data,error}=await client
.from('monitoramentos')
.select('*')
if(error){
console.log(error)
return
}
let mapa={}
;(data||[]).forEach(m=>{
let auditor=m.auditor_responsavel||'NÃO INFORMADO'
if(!mapa[auditor]){
mapa[auditor]=0
}
mapa[auditor]++
})
let ranking=Object.entries(mapa).sort((a,b)=>b[1]-a[1])
let html=`
<div class="ranking-box">
<div class="monitoramento-titulo">
🏆 Ranking de Monitoramentos
</div>
`
ranking.forEach(r=>{
html+=`
<div class="ranking-item">
<div class="ranking-left">
<div class="ranking-title">
${r[0]}
</div>
<div class="ranking-subtitle">
Monitoramentos vinculados
</div>
</div>
<div class="ranking-value">
${r[1]}
</div>
</div>
`
})
html+=`</div>`
let tela=document.getElementById('tela-dashboard')
if(tela){
let antigo=tela.querySelector('.ranking-box')
if(antigo){
antigo.remove()
}
tela.insertAdjacentHTML('beforeend',html)
}
}

/*=========================================================
022 MONITORAMENTO-PAINEL.JS TIMELINE
=========================================================*/
async function carregarTimeline(){
let{data,error}=await client
.from('monitoramento_logs')
.select('*')
.order('created_at',{ascending:false})
.limit(20)
if(error){
console.log(error)
return
}
let html=`
<div class="timeline-box">
<div class="monitoramento-titulo">
📌 Últimas Movimentações
</div>
`
;(data||[]).forEach(l=>{
html+=`
<div class="timeline-item">
<div class="timeline-dot"></div>
<div class="timeline-content">
<div class="timeline-title">
${l.acao||'-'}
</div>
<div class="timeline-date">
${formatarDataHora(l.created_at)}
</div>
<div class="timeline-text">
Usuário: ${l.usuario||'-'}
</div>
</div>
</div>
`
})
html+=`</div>`
let tela=document.getElementById('tela-dashboard')
if(tela){
let antigo=tela.querySelector('.timeline-box')
if(antigo){
antigo.remove()
}
tela.insertAdjacentHTML('beforeend',html)
}
}

/*=========================================================
024 MONITORAMENTO-PAINEL.JS ORDENAÇÃO GLOBAL
=========================================================*/
function ordenarDataGlobal(data){
return(data||[]).sort((a,b)=>{
let ia=String(a.item||'0').split('.').map(v=>parseInt(v)||0)
let ib=String(b.item||'0').split('.').map(v=>parseInt(v)||0)
for(let i=0;i<Math.max(ia.length,ib.length);i++){
let va=ia[i]||0
let vb=ib[i]||0
if(va!==vb){
return va-vb
}
}
return 0
})
}

/*=========================================================
025 MONITORAMENTO-PAINEL.JS DESTACAR MONITORAMENTO
=========================================================*/
function destacarMonitoramentoAtivo(){
document.querySelectorAll('.card-monitoramento').forEach(card=>{
card.classList.remove('card-monitoramento-ativo')
})
if(!MONITORAMENTO_ATUAL){
return
}
let ativo=document.querySelector(`[data-monitoramento="${MONITORAMENTO_ATUAL}"]`)
if(ativo){
ativo.classList.add('card-monitoramento-ativo')
}
}
/*=========================================================
026 MONITORAMENTO-PAINEL.JS REGISTRAR LOG
=========================================================*/
async function registrarLog(acao,tabela,registroId){
try{
await client
.from('monitoramento_logs')
.insert([{
acao:acao||'-',
tabela:tabela||'-',
registro_id:registroId||0,
usuario:(USER_MONITORAMENTO?.username||'sistema')
}])
}catch(e){
console.log(e)
}
}

/*=========================================================
027 MONITORAMENTO-PAINEL.JS SINCRONIZAR TAG SEDAM
=========================================================*/
async function sincronizarTAGSedam(){
try{
let btn=document.querySelector('.btn-padrao.verde')
if(btn){
btn.disabled=true
btn.innerHTML='SINCRONIZANDO...'
}
if(typeof atualizarMonitoramentoAutomatico==='function'){
await atualizarMonitoramentoAutomatico()
}
await carregarDashboard()
await carregarListaMonitoramentos()
await registrarLog('SINCRONIZAÇÃO TAG','monitoramentos',0)
alert('Sincronização concluída')
if(btn){
btn.disabled=false
btn.innerHTML='🔄 Sincronizar TAGS/SEDAM'
}
}catch(e){
console.log(e)
alert('Erro na sincronização')
}
}

/*=========================================================
028 MONITORAMENTO-PAINEL.JS ABRIR MODO IMPRESSÃO
=========================================================*/
function abrirModoImpressao(){
let modal=document.getElementById('modalImpressao')
let conteudo=document.getElementById('conteudoImpressao')
let tela=document.querySelector('.tela-monitoramento:not(.hidden)')
if(modal){
modal.classList.remove('hidden')
}
if(conteudo&&tela){
conteudo.innerHTML=tela.innerHTML
}
}

/*=========================================================
029 MONITORAMENTO-PAINEL.JS FECHAR MODO IMPRESSÃO
=========================================================*/
function fecharModalImpressao(){
let modal=document.getElementById('modalImpressao')
if(modal){
modal.classList.add('hidden')
}
}

/*=========================================================
030 MONITORAMENTO-PAINEL.JS VALIDAR DASHBOARD
=========================================================*/
function validarDashboardMonitoramento(){
let dashboard=document.getElementById('tela-dashboard')
if(!dashboard){
console.log('Dashboard não encontrado')
return false
}
return true
}
