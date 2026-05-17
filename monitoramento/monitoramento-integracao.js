async function sincronizarTAGSedam(){
if(!MONITORAMENTO_ATUAL){
alert('Selecione um monitoramento')
return
}
let origem=prompt('Informe a origem: SEDAM, SEPAT ou QUEIMADAS','SEDAM')
if(!origem)return
origem=origem.toUpperCase().trim()
let filtroTabela='vw_monitoramento_integrado'
if(origem==='SEPAT'){
filtroTabela='vw_monitoramento_integrado'
}
if(origem==='QUEIMADAS'){
filtroTabela='vw_monitoramento_integrado'
}
let{data,error}=await client.from(filtroTabela).select('*').order('item',{ascending:true})
if(error){
console.log(error)
alert('Erro integração')
return
}
let total=0
for(let d of(data||[])){
let{data:existe}=await client.from('monitoramento_itens').select('id').eq('subitem',d.subitem).eq('origem',origem).limit(1)
if(existe&&existe.length>0){
continue
}
let criticidade='BAIXA'
if(Number(d.percentual)<40){
criticidade='ALTA'
}else if(Number(d.percentual)<80){
criticidade='MÉDIA'
}
let payload={
monitoramento_id:MONITORAMENTO_ATUAL,
origem:origem,
item:d.item,
subitem:d.subitem,
status:d.status,
criticidade:criticidade,
percentual:d.percentual,
achado:d.descricao,
causa:'Acompanhar execução',
efeito:'Risco institucional',
deliberacao:d.descricao,
acao_gestor:d.produto,
produto_esperado:d.produto,
beneficio_esperado:'Fortalecimento institucional',
responsavel:d.responsavel,
prazo:d.prazo_texto
}
let{error:insertError}=await client.from('monitoramento_itens').insert([payload])
if(!insertError){
total++
}
}
await carregarDashboard()
await carregarItensMatriz()
alert(`${total} registros sincronizados`)
}

async function atualizarMonitoramentoAutomatico(){

let{data,error}=await client
.from('vw_monitoramento_integrado')
.select('*')

if(error){
console.log(error)
return
}

let atualizados=0

for(let d of(data||[])){

let criticidade='BAIXA'

if(Number(d.percentual)<40){

criticidade='ALTA'

}else if(Number(d.percentual)<80){

criticidade='MÉDIA'

}

let payload={

status:d.status,

criticidade:criticidade,

percentual:Number(d.percentual||0),

acao_gestor:d.produto||'',

produto_esperado:d.produto||'',

responsavel:d.responsavel||'',

deliberacao:d.descricao||''

}

let{error:updateError}=await client
.from('monitoramento_itens')
.update(payload)
.eq('subitem',d.subitem)

if(!updateError){
atualizados++
}

}

await carregarDashboard()

if(typeof carregarPainelExecutivo==='function'){
await carregarPainelExecutivo()
}

if(typeof carregarPainelRiscos==='function'){
await carregarPainelRiscos()
}

if(typeof carregarHistorico==='function'){
await carregarHistorico()
}

console.log(
'Monitoramentos atualizados:',
atualizados
)

}
