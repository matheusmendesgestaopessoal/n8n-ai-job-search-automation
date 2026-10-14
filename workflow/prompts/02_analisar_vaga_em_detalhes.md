<!-- Prompt do nó "Analisar Vaga em Detalhes" (extraído por codigo/extrair_workflow.py). Trechos {{ ... }} são substituídos pelo n8n com os dados de cada vaga. -->

Analise a vaga abaixo para preparar uma candidatura personalizada.

Use SOMENTE as informações fornecidas sobre o candidato e a vaga.

=========================
CANDIDATO
=========================

{{ $json.perfil_candidato }}

=========================
VAGA
=========================

Cargo:
{{ $json.cargo }}

Empresa:
{{ $json.empresa }}

Localização:
{{ $json.localizacao }}

Modalidade:
{{ $json.modalidade_detectada }}

Descrição:
{{ $json.descricao_analise }}

=========================
RECRUTADOR
=========================

Nome:
{{ $json.recrutador_nome || 'Não informado' }}

Cargo:
{{ $json.recrutador_cargo || 'Não informado' }}

=========================
OBJETIVO
=========================

Analise a compatibilidade prática entre o perfil e a vaga para auxiliar na preparação da candidatura.

Não recalcule score.
Não altere a classificação da vaga.

=========================
REGRAS DE EVIDÊNCIA
=========================

Use somente as informações fornecidas.

Não invente:
- experiência;
- cargo;
- empresa;
- data;
- resultado;
- número;
- tecnologia;
- certificação;
- formação;
- idioma;
- nível de conhecimento.

Diferencie:

1. experiência profissional;
2. projeto;
3. estudo/conhecimento;
4. requisito sem evidência.

Tecnologia utilizada somente em projeto ou estudo NÃO é experiência profissional.

Projetos demonstram conhecimento prático, mas não substituem experiência profissional.

Não use termos como:
- especialista;
- domínio avançado;
- experiência sólida;
- ampla experiência;

sem evidência explícita.

=========================
PONTOS FORTES
=========================

pontos_fortes:

Liste no máximo 4 aderências verdadeiras e relevantes entre o candidato e a vaga.

Use frases curtas.

Se não houver:
[]

=========================
REQUISITOS PARCIAIS
=========================

requisitos_parciais:

Liste no máximo 3 requisitos atendidos parcialmente.

Quando necessário, informe se a evidência vem de:
- projeto;
- estudo;
- experiência profissional relacionada.

Use frases curtas.

Se não houver:
[]

=========================
REQUISITOS AUSENTES
=========================

requisitos_ausentes:

Liste no máximo 3 requisitos importantes da vaga para os quais não existe evidência suficiente no perfil.

Não invente requisitos.

Use frases curtas.

Se não houver:
[]

=========================
PALAVRAS-CHAVE ATS
=========================

palavras_chave_ats:

Liste no máximo 10 palavras-chave relevantes da vaga que também sejam compatíveis com o perfil real do candidato.

Não inclua tecnologia ou competência sem evidência.

Retorne apenas termos curtos.

Se não houver:
[]

=========================
ESTRATÉGIA DO CURRÍCULO
=========================

estrategia_curriculo:

Em no máximo 500 caracteres, informe objetivamente:

- o que destacar no resumo;
- qual experiência priorizar;
- qual projeto priorizar, se relevante;
- quais competências destacar;
- o que deixar em segundo plano.

Não gere o currículo.

=========================
MENSAGEM AO RECRUTADOR
=========================

mensagem_recrutador:

Crie uma mensagem natural e simples de no máximo 350 caracteres.

Quando houver nome do recrutador, utilize-o naturalmente.

Mencione:
- o cargo;
- a empresa;
- um ou dois pontos verdadeiros do perfil.

Não mencione:
- score;
- ATS;
- IA;
- automação;
- classificação ALTA/MEDIA.

Não diga que o candidato é ideal ou perfeito.

=========================
SAÍDA
=========================

Preencha EXATAMENTE todos os campos exigidos pelo Structured Output Parser.

Não omita campos.

Não use null.

Listas vazias devem ser [].

Todos os elementos das listas devem ser strings.

Não adicione campos.

Não escreva texto fora da estrutura exigida.
