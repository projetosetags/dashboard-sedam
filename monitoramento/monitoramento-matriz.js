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
<td>${i.deliberacao||'-'}</td>
<td>
<span class="badge-status ${getClasseStatus(i.status)}">
${i.status||'-'}
</span>
</td>
<td>${i.criticidade||'-'}</td>
<td>${formatarData(i.prazo)}</td>
<td>${Number(i.percentual||0)}%</td>
<td>
<div style="display:flex;gap:6px;flex-wrap:wrap;">
<button class="btn-padrao azul" onclick="editarItem(${i.id})">Editar</button>
<button class="btn-padrao verde" onclick="abrirEvidencias(${i.id})">Evidências</button>
<button class="btn-padrao vermelho" onclick="excluirItem(${i.id})">Excluir</button>
</div>
</td>
</tr>
`

})

document.getElementById('tbodyMatriz').innerHTML=html

}

async function novoItemMatriz(){

if(!MONITORAMENTO_ATUAL){
alert('Selecione um monitoramento')
return
}

let item=prompt('Item')

if(!item)return

let subitem=prompt('Subitem')

let deliberacao=prompt('Deliberação')

let achado=prompt('Achado')

let causa=prompt('Causa')

let efeito=prompt('Efeito')

let acao=prompt('Ação do Gestor')

let produto=prompt('Produto Esperado')

let entrega=prompt('Entrega Esperada')

let beneficio=prompt('Benefício Esperado')

let criticidade=prompt('Criticidade')

let prazo=prompt('Prazo YYYY-MM-DD')

let status='EM ANDAMENTO'

let percentual=0

let{error}=await client
.from('monitoramento_itens')
.insert([{
monitoramento_id:MONITORAMENTO_ATUAL,
item:item,
subitem:subitem,
deliberacao:deliberacao,
achado:achado,
causa:causa,
efeito:efeito,
acao_gestor:acao,
produto_esperado:produto,
entrega_esperada:entrega,
beneficio_esperado:beneficio,
criticidade:criticidade,
prazo:prazo,
status:status,
percentual:percentual
}])

if(error){
console.log(error)
alert('Erro ao inserir')
return
}

await carregarItensMatriz()
await carregarDashboard()

}

async function editarItem(id){

let{data,error}=await client
.from('monitoramento_itens')
.select('*')
.eq('id',id)
.single()

if(error||!data)return

let status=prompt('Status',data.status||'')

if(status===null)return

let percentual=prompt('Percentual',data.percentual||0)

let criticidade=prompt('Criticidade',data.criticidade||'')

let prazo=prompt('Prazo',data.prazo||'')

let deliberacao=prompt('Deliberação',data.deliberacao||'')

let acao=prompt('Ação do Gestor',data.acao_gestor||'')

let produto=prompt('Produto Esperado',data.produto_esperado||'')

let beneficio=prompt('Benefício Esperado',data.beneficio_esperado||'')

let{error:updateError}=await client
.from('monitoramento_itens')
.update({
status:status,
percentual:Number(percentual||0),
criticidade:criticidade,
prazo:prazo,
deliberacao:deliberacao,
acao_gestor:acao,
produto_esperado:produto,
beneficio_esperado:beneficio
})
.eq('id',id)

if(updateError){
console.log(updateError)
return
}

await carregarItensMatriz()
await carregarDashboard()

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

await carregarItensMatriz()
await carregarDashboard()

}

function formatarData(d){

if(!d)return'-'

let dt=new Date(d)

return dt.toLocaleDateString('pt-BR')

}

function abrirEvidencias(id){

window.ITEM_EVIDENCIA_ATUAL=id

abrirTela('evidencias')

carregarEvidencias()

}
