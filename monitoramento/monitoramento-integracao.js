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
let monitoramento=await carregarMonitoramentoAtual()
if(!monitoramento){
return
}
let origem=monitoramento.origem||''
let query=client.from('vw_monitoramento_integrado').select('*')
if(origem){
query=query.eq('origem',origem)
}
let{data,error}=await query
if(error){
console.log(error)
return
}
let atualizados=0
let inseridos=0
for(let d of(data||[])){
let criticidade='BAIXA'
let percentual=Number(d.percentual||0)
if(percentual<40){
criticidade='ALTA'
}else if(percentual<80){
criticidade='MÉDIA'
}
let status='EM ANDAMENTO'
if(percentual>=100){
status='EXECUTADA'
}else if(percentual===0){
status='NÃO EXECUTADA'
}else if(percentual>0&&percentual<100){
status='PARCIALMENTE EXECUTADA'
}
let payload={
monitoramento_id:MONITORAMENTO_ATUAL,
item:d.item||'-',
subitem:d.subitem||'-',
descricao:d.descricao||'-',
status:status,
criticidade:criticidade,
percentual:percentual,
acao_gestor:d.produto||'',
produto_esperado:d.produto||'',
responsavel:d.responsavel||'',
deliberacao:d.descricao||'',
origem:d.origem||origem,
sincronizado_em:new Date().toISOString()
}
let{data:existe}=await client.from('monitoramento_itens').select('id').eq('monitoramento_id',MONITORAMENTO_ATUAL).eq('subitem',d.subitem).limit(1)
if(existe&&existe.length){
let{error:updateError}=await client.from('monitoramento_itens').update(payload).eq('id',existe[0].id)
if(!updateError){
atualizados++
}
}else{
let{error:insertError}=await client.from('monitoramento_itens').insert([payload])
if(!insertError){
inseridos++
}
}
}
await registrarLog('SINCRONIZAÇÃO AUTOMÁTICA','monitoramento_itens',MONITORAMENTO_ATUAL)
await carregarItensMatriz()
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
console.log('Monitoramentos sincronizados:',{inseridos,atualizados})
}
