
/* CHECKLIST */
const tarefas = [
    "Tampei a caixa-d'água",
    "Limpei as calhas",
    "Virei as garrafas",
    "Verifiquei a água das plantas",
    "Limpei o quintal"
];

const itens = document.getElementById("checklist-itens");
const barra = document.getElementById("barra");
const porcentagem = document.getElementById("porcentagem");

// Cria os itens e recupera as marcações salvas.
tarefas.forEach((tarefa, i) => {
    const label = document.createElement("label");
    const checkbox = document.createElement("input");

    checkbox.type = "checkbox";
    checkbox.id = `tarefa-${i}`;
    checkbox.checked = localStorage.getItem(`tarefa-${i}`) === "true";

    checkbox.addEventListener("change", () => {
        localStorage.setItem(`tarefa-${i}`, checkbox.checked);
        atualizarChecklist();
    });

    label.append(checkbox, document.createTextNode(tarefa));
    itens.appendChild(label);
});

function atualizarChecklist() {
    const concluidas = tarefas.filter((_, i) =>
        localStorage.getItem(`tarefa-${i}`) === "true"
    ).length;

    const total = tarefas.length;
    const percentual = Math.round(concluidas / total * 100);

    barra.style.width = `${percentual}%`;
    porcentagem.textContent =
        `${percentual}% concluído — ${concluidas} de ${total} tarefas`;
}

atualizarChecklist();


/* QUIZ */
const perguntas = [
    {
        pergunta: "Dengue e chikungunya podem ser transmitidas pelo Aedes aegypti.",
        resposta: true,
        explicacao: "Verdade! Esse mosquito pode transmitir as duas doenças."
    },
    {
        pergunta: "Chá de boldo cura dengue e substitui o atendimento médico.",
        resposta: false,
        explicacao: "Fake News! Chá não substitui avaliação médica nem o tratamento indicado."
    },
    {
        pergunta: "É correto compartilhar uma denúncia sem verificar as informações.",
        resposta: false,
        explicacao: "Falso! Verifique as informações e evite divulgar dados pessoais."
    },
    {
        pergunta: "Água parada pode servir de criadouro para o Aedes aegypti.",
        resposta: true,
        explicacao: "Verdade! Elimine recipientes que acumulem água."
    }
];

let indice = 0;
let respondido = false;

const pergunta = document.getElementById("pergunta");
const contador = document.getElementById("contador");
const feedback = document.getElementById("feedback");
const botaoVerdade = document.getElementById("verdade");
const botaoFake = document.getElementById("fake");
const proxima = document.getElementById("proxima");

function mostrarPergunta() {
    const atual = perguntas[indice];

    contador.textContent =
        `Pergunta ${indice + 1} de ${perguntas.length}`;

    pergunta.textContent = atual.pergunta;
    feedback.textContent = "";

    botaoVerdade.disabled = false;
    botaoFake.disabled = false;
    proxima.hidden = true;
    respondido = false;
}

function responder(resposta) {
    if (respondido) return;

    respondido = true;

    const atual = perguntas[indice];
    const acertou = resposta === atual.resposta;

    feedback.textContent =
        `${acertou ? "✅ Correto!" : "❌ Não foi dessa vez."} ${atual.explicacao}`;

    botaoVerdade.disabled = true;
    botaoFake.disabled = true;
    proxima.hidden = false;

    proxima.textContent =
        indice === perguntas.length - 1
            ? "Recomeçar quiz"
            : "Próxima pergunta";
}

botaoVerdade.addEventListener("click", () => responder(true));
botaoFake.addEventListener("click", () => responder(false));

proxima.addEventListener("click", () => {
    indice = (indice + 1) % perguntas.length;
    mostrarPergunta();
});

mostrarPergunta();


/* DENÚNCIAS LOCAIS */
const formulario = document.getElementById("form-denuncia");
const listaDenuncias = document.getElementById("lista-denuncias");

function lerDenuncias() {
    try {
        return JSON.parse(localStorage.getItem("denuncias") || "[]");
    } catch {
        return [];
    }
}

function renderizarDenuncias() {
    listaDenuncias.replaceChildren();

    lerDenuncias().forEach(denuncia => {
        const item = document.createElement("li");
        const titulo = document.createElement("strong");

        titulo.textContent = denuncia.protocolo;

        item.append(
            titulo,
            document.createTextNode(
                ` — ${denuncia.bairro}: ${denuncia.descricao}`
            )
        );

        listaDenuncias.appendChild(item);
    });
}

formulario.addEventListener("submit", event => {
    event.preventDefault();

    const bairro = document.getElementById("bairro").value.trim();
    const descricao = document.getElementById("desc").value.trim();

    if (!bairro || !descricao) return;

    const denuncias = lerDenuncias();

    const protocolo =
        "PE-" + Date.now().toString().slice(-6);

    denuncias.push({
        bairro,
        descricao,
        protocolo
    });

    localStorage.setItem("denuncias", JSON.stringify(denuncias));

    renderizarDenuncias();
    formulario.reset();

    alert(`Registro criado! Protocolo: ${protocolo}`);
});

renderizarDenuncias();

/* AUTOCOMPLETAR DE BAIRROS */

const campoBairro = document.getElementById("bairro");
const listaSugestoes = document.getElementById("sugestoes-bairros");

/* Lista inicial de bairros e localidades */
const bairrosPE = [
    "Boa Viagem",
    "Boa Vista",
    "Boa Esperança",
    "Casa Amarela",
    "Casa Forte",
    "Caxangá",
    "Cordeiro",
    "Derby",
    "Espinheiro",
    "Graças",
    "Ibura",
    "Imbiribeira",
    "Madalena",
    "Pina",
    "Recife Antigo",
    "Santo Amaro",
    "São José",
    "Várzea",
    "Afogados",
    "Água Fria",
    "Areias",
    "Barro",
    "Brasília Teimosa",
    "Dois Irmãos",
    "Encruzilhada",
    "Fundão",
    "Jardim São Paulo",
    "Jordão",
    "Tejipió",
    "Boa Esperança - Jaboatão dos Guararapes",
    "Candeias - Jaboatão dos Guararapes",
    "Piedade - Jaboatão dos Guararapes",
    "Prazeres - Jaboatão dos Guararapes",
    "Centro - Olinda",
    "Casa Caiada - Olinda",
    "Rio Doce - Olinda"
];

let indiceSugestao = -1;

function normalizarTexto(texto) {
    return texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function fecharSugestoes() {
    listaSugestoes.replaceChildren();
    listaSugestoes.hidden = true;
    campoBairro.setAttribute("aria-expanded", "false");
    campoBairro.removeAttribute("aria-activedescendant");
    indiceSugestao = -1;
}

function selecionarBairro(bairro) {
    campoBairro.value = bairro;
    fecharSugestoes();
    campoBairro.focus();
}

function atualizarSugestoes() {
    const texto = normalizarTexto(campoBairro.value);

    fecharSugestoes();

    if (texto.length === 0) {
        return;
    }

    const resultados = bairrosPE
        .filter(bairro =>
            normalizarTexto(bairro).includes(texto)
        )
        .slice(0, 8);

    if (resultados.length === 0) {
        return;
    }

    resultados.forEach((bairro, indice) => {
        const item = document.createElement("li");

        item.id = `sugestao-bairro-${indice}`;
        item.textContent = bairro;
        item.setAttribute("role", "option");
        item.setAttribute("aria-selected", "false");
        item.tabIndex = -1;

        item.addEventListener("mousedown", evento => {
            // Evita que o campo perca o foco antes da seleção.
            evento.preventDefault();
            selecionarBairro(bairro);
        });

        listaSugestoes.appendChild(item);
    });

    listaSugestoes.hidden = false;
    campoBairro.setAttribute("aria-expanded", "true");
}

function moverSelecao(direcao) {
    const itens = listaSugestoes.querySelectorAll("li");

    if (itens.length === 0) {
        return;
    }

    indiceSugestao += direcao;

    if (indiceSugestao < 0) {
        indiceSugestao = itens.length - 1;
    }

    if (indiceSugestao >= itens.length) {
        indiceSugestao = 0;
    }

    itens.forEach((item, indice) => {
        const selecionado = indice === indiceSugestao;

        item.setAttribute(
            "aria-selected",
            String(selecionado)
        );

        if (selecionado) {
            campoBairro.setAttribute(
                "aria-activedescendant",
                item.id
            );

            item.scrollIntoView({
                block: "nearest"
            });
        }
    });
}

campoBairro.addEventListener("input", atualizarSugestoes);

campoBairro.addEventListener("keydown", evento => {
    if (evento.key === "ArrowDown") {
        evento.preventDefault();

        if (listaSugestoes.hidden) {
            atualizarSugestoes();
        }

        moverSelecao(1);
    }

    if (evento.key === "ArrowUp") {
        evento.preventDefault();
        moverSelecao(-1);
    }

    if (evento.key === "Enter" && !listaSugestoes.hidden) {
        const itens = listaSugestoes.querySelectorAll("li");

        if (indiceSugestao >= 0 && itens[indiceSugestao]) {
            evento.preventDefault();
            selecionarBairro(itens[indiceSugestao].textContent);
        }
    }

    if (evento.key === "Escape") {
        fecharSugestoes();
    }
});

campoBairro.addEventListener("blur", () => {
    // Permite que o clique em uma sugestão seja processado.
    setTimeout(() => {
        fecharSugestoes();
    }, 150);
});

document.addEventListener("click", evento => {
    if (!evento.target.closest(".autocomplete-container")) {
        fecharSugestoes();
    }
});
