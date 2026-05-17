window.ITEM_EDITANDO=null

async function carregarItensMatriz(){

if(!MONITORAMENTO_ATUAL)return

let{data,error}=await client
.from('monitoramento_itens')
.select('*')
.eq('monitoramento_id',MONITORAMENTO_ATUAL)
.order('item',{ascending:true})

if(error){
console.log(error)
return
}

let html=''

;(data||[]).forEach(i=>{

html+=`
<tr>

<td>${i.item||'-'}</td>

<td>${i.subitem||'-'}</td>

<td>
<span class="badge-status ${getClasseStatus(i.status)}">
${i.status||'-'}
</span>
</td>

<td>
${Number(i.percentual||0)}%
</td>

<td>
${i.criticidade||'-'}
</td>

<td>
${formatarData(i.prazo)}
</td>

<td>

<div style="display:flex;gap:6px;flex-wrap:wrap;">

<button class="btn-padrao azul" onclick="editarItemMatriz(${i.id})">
Editar
</button>

<button class="btn-padrao verde" onclick="abrirEvidencias(${i.id})">
Evidências
</button>

<button class="btn-padrao amarelo" onclick="abrirAnalises(${i.id})">
Análises
</button>

<button class="btn-padrao vermelho" onclick="excluirItem(${i.id})">
Excluir
</button>

</div>

</td>

</tr>
`

})

document.getElementById('tbodyMatriz').innerHTML=html

}

async function salvarNovoItemMatriz(){

if(!MONITORAMENTO_ATUAL){
alert('Selecione um monitoramento')
return
}

let payload={

monitoramento_id:MONITORAMENTO_ATUAL,

item:document.getElementById('mItem').value,

subitem:document.getElementById('mSubitem').value,

status:document.getElementById('mStatus').value,

criticidade:document.getElementById('mCriticidade').value,

prazo:document.getElementById('mPrazo').value,

percentual:Number(
document.getElementById('mPercentual').value||0
),

achado:document.getElementById('mAchado').value,

causa:document.getElementById('mCausa').value,

efeito:document.getElementById('mEfeito').value,

deliberacao:document.getElementById('mDeliberacao').value,

acao_gestor:document.getElementById('mAcaoGestor').value,

produto_esperado:document.getElementById('mProduto').value,

entrega_esperada:document.getElementById('mEntrega').value,

beneficio_esperado:document.getElementById('mBeneficio').value

}

if(!payload.item){
alert('Informe o item')
return
}

if(ITEM_EDITANDO){

let{error}=await client
.from('monitoramento_itens')
.update(payload)
.eq('id',ITEM_EDITANDO)

if(error){
console.log(error)
alert('Erro ao atualizar')
return
}

await registrarLog(
'EDIÇÃO ITEM MATRIZ',
'monitoramento_itens',
ITEM_EDITANDO
)

ITEM_EDITANDO=null

}else{

let{error}=await client
.from('monitoramento_itens')
.insert([payload])

if(error){
console.log(error)
alert('Erro ao inserir')
return
}

await registrarLog(
'NOVO ITEM MATRIZ',
'monitoramento_itens',
0
)

}

await carregarItensMatriz()
await carregarDashboard()

limparFormularioMatriz()

alert('Item salvo')

}

async function editarItemMatriz(id){

let{data,error}=await client
.from('monitoramento_itens')
.select('*')
.eq('id',id)
.single()

if(error||!data){
console.log(error)
return
}

ITEM_EDITANDO=id

document.getElementById('mItem').value=data.item||''

document.getElementById('mSubitem').value=data.subitem||''

document.getElementById('mStatus').value=data.status||'EM ANDAMENTO'

document.getElementById('mCriticidade').value=data.criticidade||'MÉDIA'

document.getElementById('mPrazo').value=data.prazo||''

document.getElementById('mPercentual').value=data.percentual||0

document.getElementById('mAchado').value=data.achado||''

document.getElementById('mCausa').value=data.causa||''

document.getElementById('mEfeito').value=data.efeito||''

document.getElementById('mDeliberacao').value=data.deliberacao||''

document.getElementById('mAcaoGestor').value=data.acao_gestor||''

document.getElementById('mProduto').value=data.produto_esperado||''

document.getElementById('mEntrega').value=data.entrega_esperada||''

document.getElementById('mBeneficio').value=data.beneficio_esperado||''

window.scrollTo({
top:0,
behavior:'smooth'
})

}

function limparFormularioMatriz(){

ITEM_EDITANDO=null

document.getElementById('mItem').value=''

document.getElementById('mSubitem').value=''

document.getElementById('mStatus').value='EM ANDAMENTO'

document.getElementById('mCriticidade').value='ALTA'

document.getElementById('mPrazo').value=''

document.getElementById('mPercentual').value='0'

document.getElementById('mAchado').value=''

document.getElementById('mCausa').value=''

document.getElementById('mEfeito').value=''

document.getElementById('mDeliberacao').value=''

document.getElementById('mAcaoGestor').value=''

document.getElementById('mProduto').value=''

document.getElementById('mEntrega').value=''

document.getElementById('mBeneficio').value=''

}

async function excluirItem(id){

if(!confirm('Excluir item?'))return

let{error}=await client
.from('monitoramento_itens')
.delete()
.eq('id',id)

if(error){
console.log(error)
return
}

await registrarLog(
'EXCLUSÃO ITEM MATRIZ',
'monitoramento_itens',
id
)

await carregarItensMatriz()
await carregarDashboard()

}

function abrirEvidencias(id){

ITEM_EVIDENCIA_ATUAL=id

abrirTela('evidencias')

carregarEvidencias()

}

function abrirAnalises(id){

ITEM_EVIDENCIA_ATUAL=id

abrirTela('analises')

carregarAnalises()

}

function formatarData(d){

if(!d)return'-'

let dt=new Date(d)

return dt.toLocaleDateString('pt-BR')

}
async function importarDaTAG(){

if(!MONITORAMENTO_ATUAL){
alert('Selecione um monitoramento')
return
}

let itemFiltro=prompt(
'Informe o ITEM da TAG para importar (ex: 1,2,3...)'
)

if(!itemFiltro)return

let{data,error}=await client
.from('deliberacoes')
.select('*')
.ilike('item',`${itemFiltro}%`)
.order('subitem',{ascending:true})

if(error){
console.log(error)
alert('Erro ao importar')
return
}

if(!data||data.length===0){
alert('Nenhum item encontrado')
return
}

let inseridos=0

for(let d of(data||[])){

let percentual=Math.max(
Number(d.jan||0),
Number(d.fev||0),
Number(d.mar||0),
Number(d.abr||0),
Number(d.mai||0),
Number(d.jun||0),
Number(d.jul||0),
Number(d.ago||0),
Number(d.set||0),
Number(d.out||0),
Number(d.nov||0),
Number(d.dez||0)
)

let status='EM ANDAMENTO'

if(percentual>=100){
status='EXECUTADA'
}else if(percentual>=40){
status='PARCIALMENTE EXECUTADA'
}else if(percentual===0){
status='NÃO EXECUTADA'
}

let criticidade='BAIXA'

if(percentual<40){
criticidade='ALTA'
}else if(percentual<80){
criticidade='MÉDIA'
}

let payload={

monitoramento_id:MONITORAMENTO_ATUAL,

item:d.item||'',

subitem:d.subitem||'',

status:status,

criticidade:criticidade,

percentual:percentual,

achado:d.descricao||'',

causa:'A definir',

efeito:'A definir',

deliberacao:d.descricao||'',

acao_gestor:d.produto||'',

produto_esperado:d.produto||'',

entrega_esperada:d.produto||'',

beneficio_esperado:'Melhoria institucional',

responsavel:d.responsavel||'',

prazo:d.prazo_texto||''

}

let{error:insertError}=await client
.from('monitoramento_itens')
.insert([payload])

if(!insertError){
inseridos++
}

}

await registrarLog(
'IMPORTAÇÃO TAG',
'monitoramento_itens',
MONITORAMENTO_ATUAL
)

await carregarItensMatriz()
await carregarDashboard()

alert(
`${inseridos} itens importados`
)

}
