#!/bin/bash
# roda todas as suítes e resume
cd "$(dirname "$0")"; mkdir -p /tmp/reg
run(){ n=$1; shift; SABIA_REGRAS=1 timeout 900 node "$@" > /tmp/reg/$n.out 2>&1; echo "$n: $(grep -E '^[0-9]+ OK' /tmp/reg/$n.out | tail -1) $(tail -1 /tmp/reg/$n.out | grep -E 'ERRO|offline' )"; }
run teste teste.js dist shots/r_teste &
run live teste-live.js dist shots/r_live &
run editor teste-editor.js dist shots/r_editor &
run celular teste-celular.js dist shots/r_celular &
wait
run relat teste-relat.js dist shots/r_relat &
run reforco teste-reforco.js dist shots/r_reforco &
run integra teste-integra.js dist shots/r_integra &
run regras teste-regras.js dist shots/r_regras &
wait
run v10 teste-v10.js dist shots/r_v10 &
run v10cel teste-v10-cel.js dist shots/r_v10cel &
run pessoas teste-pessoas.js dist shots/r_pessoas &
run pessoascel teste-pessoas-cel.js dist shots/r_pessoascel &
wait
run reforcocel teste-reforco-cel.js dist shots/r_reforcocel &
run v11 teste-v11.js dist shots/r_v11 &
run v12 teste-v12.js dist shots/r_v12 &
run offline offline.js dist shots/r_off &
wait
run v13 teste-v13.js dist shots/r_v13 &
run v14 teste-v14.js dist shots/r_v14 &
run v14off teste-v14-offline.js dist &
run v141 teste-v141.js dist shots/r_v141 &
# v1.4.3: o treino do celular com internet lenta (cada pedido ao banco espera de 1,5 a 3 s)
SABIA_ATRASO=1500 run lento teste-reforco-cel.js dist shots/r_lento &
run v15 teste-v15.js dist shots/r_v15 &
wait
run v151 teste-v151.js dist shots/r_v151 &
run v160 teste-v160.js dist shots/r_v160 &
run v160p2 teste-v160p2.js dist shots/r_v160p2 &
run v160p3 teste-v160p3.js dist shots/r_v160p3 &
run v152 teste-v152.js dist shots/r_v152 &
wait
run v160p4 teste-v160p4.js dist shots/r_v160p4 &
wait
echo FIM
