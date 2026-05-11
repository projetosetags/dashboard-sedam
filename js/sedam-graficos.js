/*=========================================================
001 GRAFICOS FUNCTION INITPAINELGRAFICO
=========================================================*/
function initPainelGrafico(){
let item=document.getElementById('filtroItem')
let sub=document.getElementById('filtroSubitem')
if(!item||!sub)return
item.onchange=null
sub.onchange=null
popularItens()
atualizarLista3()
item.onchange=()=>{
atualizarLista3()
setTimeout(()=>{
renderGraficoMaster()
},50)
}
sub.onchange=()=>{
renderGraficoMaster()
}
renderGraficoMaster()
}
/*=========================================================
002 GRAFICOS FUNCTION POPULARITENS
=========================================================*/
function popularItens(){
let sel=document.getElementById('filtroItem')
if(!sel)return
let mapa={}
allData.forEach(i=>{
let n=(i.item||i.numitem||'').toString().trim()
if(!n)return
if(!mapa[n]){
mapa[n]={
num:n,
descricao:descItens[n]||i.descricaoitem||'SEM DESCRIÇÃO'
}
}
})
let lista=Object.values(mapa).sort((a,b)=>a.num.localeCompare(b.num,undefined,{numeric:true}))
sel.innerHTML=`<option value="todos">TODOS OS ITENS</option>`+lista.map(i=>`<option value="${i.num}">ITEM ${i.num} - ${i.descricao}</option>`).join('')
}
/*=========================================================
003 GRAFICOS FUNCTION ATUALIZARLISTA3
=========================================================*/
function atualizarLista3(){
let sel=document.getElementById('filtroSubitem')
if(!sel)return
let itemSelecionado=document.getElementById('filtroItem').value
let lista=itemSelecionado==='todos'?allData:allData.filter(i=>String(i.item||i.numitem||'')===String(itemSelecionado))
lista=lista.sort(compareSubitem)
let html=''
if(itemSelecionado==='todos'){
html+=`<option value="TOTAL">TODOS OS SUBITENS</option>`
}
html+=lista.map(i=>{
let total=getTotal(i)
return`<option value="${i.id}">${i.subitem} • ${total}% • ${truncarTexto(i.descricao,90)}</option>`
}).join('')
sel.innerHTML=html
}
/*=========================================================
004 GRAFICOS FUNCTION RENDERGRAFICOMASTER
=========================================================*/
function renderGraficoMaster(){
let el=document.getElementById('chartMaster')
if(!el)return
let ctx=el.getContext('2d')
if(!ctx)return
if(chartMaster)chartMaster.destroy()
let tipo=document.getElementById('tipoGrafico').value
let selItem=document.getElementById('filtroItem').value
let selSub=document.getElementById('filtroSubitem').value
window.graficoAtualInfo={tipo:tipo,item:selItem,subitem:selSub}
let meses=['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ']
let mesesKey=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']
let mesAtual=getMesAtualIndex()
let labels=meses.slice(0,mesAtual+1)
let cores=['#22c55e','#3b82f6','#f59e0b','#facc15','#a855f7','#06b6d4','#84cc16','#f97316','#eab308','#14b8a6','#6366f1','#ec4899']
let datasets=[]
function mediaMes(lista,mes){
if(!lista||!lista.length)return 0
let ordem=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']
let idx=ordem.indexOf(mes)
let total=0
lista.forEach(i=>{
let valor=0
for(let x=idx;x>=0;x--){
let k=ordem[x]
if(Number(i[k]||0)>0){
valor=Number(i[k]||0)
break
}
}
total+=valor
})
return Math.round(total/(lista.length||1))
}
if(tipo==='subitem'){
if(selSub==='TOTAL'){
let valores=[]
for(let m=0;m<=mesAtual;m++){
let mesKey=mesesKey[m]
valores.push(mediaMes(allData,mesKey))
}
window.graficoAtualInfo={tipo:'todos',jan:valores[0]||0,fev:valores[1]||0,mar:valores[2]||0,abr:valores[3]||0,mai:valores[4]||0}
datasets=[{label:'TOTAL GERAL TAG SEDAM',data:valores,backgroundColor:cores.slice(0,mesAtual+1),borderRadius:8}]
document.getElementById('descSubitem').innerHTML=`<div style="font-size:24px;font-weight:900;color:#000000;margin-bottom:12px;">TOTAL GERAL CONSOLIDADO DO TAG SEDAM 2026</div><div style="font-size:18px;line-height:1.8;color:#000000;font-weight:700;">O gráfico demonstra a evolução média consolidada de todos os itens e subitens monitorados no Plano de Ação do TAG SEDAM 2026.<br><br>JAN: <b>${valores[0]}%</b> | FEV: <b>${valores[1]}%</b> | MAR: <b>${valores[2]}%</b> | ABR: <b>${valores[3]}%</b> | MAI: <b>${valores[4]}%</b></div>`
}else{
let i=allData.find(x=>String(x.id)===String(selSub))
if(!i)return
let valores=[Number(i.jan||0),Number(i.fev||0),Number(i.mar||0),Number(i.abr||0),Number(i.mai||0),Number(i.jun||0),Number(i.jul||0),Number(i.ago||0),Number(i.set||0),Number(i.out||0),Number(i.nov||0),Number(i.dez||0)]
window.graficoAtualInfo={tipo:'subitem',item:i.item||'',subitem:i.subitem||'',jan:valores[0]||0,fev:valores[1]||0,mar:valores[2]||0,abr:valores[3]||0,mai:valores[4]||0}
datasets=[{label:i.subitem,data:valores.slice(0,mesAtual+1),backgroundColor:cores.slice(0,mesAtual+1),borderRadius:6}]
document.getElementById('descSubitem').innerHTML=`<div class="text-sm font-black text-emerald-400 mb-2">SUBITEM ${i.subitem}</div><div class="text-xs leading-relaxed text-slate-300">${i.descricao||'-'}<br><br><b>Produto:</b> ${i.produto||'-'}<br><br><b>Responsável:</b> ${i.responsavel||'-'}</div>`
}
}
if(!datasets.length)return
chartMaster=new Chart(ctx,{type:'bar',data:{labels,datasets},options:{responsive:true,plugins:{legend:{display:true,labels:{color:'#000'}},tooltip:{callbacks:{label:(ctx)=>ctx.raw+'%'}},datalabels:{color:'#000',anchor:'end',align:'top',font:{weight:'bold',size:12},formatter:(v)=>v+'%'}},scales:{y:{beginAtZero:true,max:100,ticks:{callback:(v)=>v+'%'}}}},plugins:[ChartDataLabels]})
}
/*=========================================================
005 GRAFICOS FUNCTION RENDERSELECTS
=========================================================*/
function renderSelects(){
let selItem=document.getElementById('sel-item')
let selSub=document.getElementById('sel-sub')
if(!selItem||!selSub)return
let itens=[...new Set(allData.map(i=>(i.subitem||'').split('.')[0]).filter(x=>x))]
selItem.innerHTML='<option value="total">TOTAL</option>'+itens.map(i=>`<option value="${i}">ITEM ${i}</option>`).join('')
selItem.onchange=()=>updateSubSelect()
updateSubSelect()
}
/*=========================================================
006 GRAFICOS FUNCTION UPDATESUBSELECT
=========================================================*/
function updateSubSelect(){
let selItem=document.getElementById('sel-item')
let selSub=document.getElementById('sel-sub')
if(!selItem||!selSub)return
let v=selItem.value
let lista=v==='total'?allData:allData.filter(i=>(i.subitem||'').startsWith(v+'.'))
selSub.innerHTML=lista.map(i=>`<option value="${i.subitem}">${i.subitem}</option>`).join('')
if(typeof renderChart==="function")renderChart()
}
/*=========================================================
007 GRAFICOS FUNCTION SINCRONIZARRESPONSAVEIS
=========================================================*/
async function sincronizarResponsaveis(){
let {data:delibs}=await client.from('deliberacoes').select('id,responsavel_id')
let listaPerfis=[...(window.perfis||[]),...(window.perfisTCERO||[])]
for(let d of(delibs||[])){
if(!d.responsavel_id)continue
let perfil=listaPerfis.find(p=>String(p.id)===String(d.responsavel_id))
if(!perfil)continue
await client.from('deliberacoes').update({responsavel:perfil.nome_completo}).eq('id',d.id)
}
console.log('Responsáveis sincronizados')
}
