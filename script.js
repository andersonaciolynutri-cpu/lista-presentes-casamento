const firebaseConfig = window.WEDDING_FIREBASE_CONFIG;

// Chave Pix para presentes do tipo "cotas"
const PIX_CHAVE = window.WEDDING_PIX_CHAVE || "";

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ====== ELEMENTOS ======
const listaPresentesDiv = document.getElementById("listaPresentes");
const listaVaziaDiv = document.getElementById("listaVazia");

// Modal reserva
const modalReservaEl = document.getElementById("modalReserva");
const modalReserva = new bootstrap.Modal(modalReservaEl);
const formReserva = document.getElementById("formReserva");
const reservaPresenteTituloSpan = document.getElementById("reservaPresenteTitulo");
const reservaPresenteDescricaoSpan = document.getElementById("reservaPresenteDescricao");
const nomeConvidadoInput = document.getElementById("nomeConvidado");
const mensagemConvidadoInput = document.getElementById("mensagemConvidado");
const grupoQtdCotasDiv = document.getElementById("grupoQtdCotas");
const qtdCotasInput = document.getElementById("qtdCotasInput");
const textoCotasDisponiveis = document.getElementById("textoCotasDisponiveis");
const valorReservaTextoSpan = document.getElementById("valorReservaTexto");

// Modal Pix (apenas para tipo "cotas")
const modalPixEl = document.getElementById("modalPix");
const modalPix = new bootstrap.Modal(modalPixEl);
const pixPresenteTituloSpan = document.getElementById("pixPresenteTitulo");
const pixPresenteTituloInlineSpan = document.getElementById("pixPresenteTituloInline");
const pixDetalhesReservaSpan = document.getElementById("pixDetalhesReserva");
const pixValorSpan = document.getElementById("pixValor");
const pixChaveSpan = document.getElementById("pixChave");
const pixQrCodeDiv = document.getElementById("pixQrCode");
const btnCopiarPix = document.getElementById("btnCopiarPix");
const btnCopiarChave = document.getElementById("btnCopiarChave");
const btnCopiarValor = document.getElementById("btnCopiarValor");

// Estado atual do presente selecionado
let presenteSelecionado = null;
let valorReservaAtual = 0;
let qtdCotasEscolhida = 1;
let pixCopiaEColaAtual = "";

const presentesIncorporados = [
  {
    id: "micro-ondas-electrolux-mt30s",
    tipo: "online",
    titulo: "Micro-ondas Electrolux 20L",
    descricao: "Modelo MT30S inox espelhado com função Tira Odor. Escolher na voltagem 127 V.",
    lojaNome: "Mercado Livre",
    precoTotal: 499.90,
    lojaUrl: "https://www.mercadolivre.com.br/micro-ondas-tira-odor-electrolux-20l-mt30s/p/MLB6351929?pdp_filters=item_id%3AMLB7285011678#reviews",
    imagemUrl: "https://tse1.mm.bing.net/th?q=Micro-ondas%20Electrolux%20MT30S%2020L%20Inox%20Espelhado%20Tira%20Odor&w=600&h=420&c=7&rs=1&p=0",
    permiteCotas: false,
    qtdCotasTotal: 1,
    qtdCotasReservadas: 0,
    status: "disponivel"
  }
];

async function buscarPresente(id) {
  const incorporado = presentesIncorporados.find((presente) => presente.id === id);
  const doc = await db.collection("presentes").doc(id).get();

  if (doc.exists) return { id: doc.id, ...doc.data() };
  return incorporado ? { ...incorporado } : null;
}

function escaparHtml(valor) {
  return String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function urlSegura(valor, permitirRelativa = false) {
  if (!valor) return "";

  try {
    const url = new URL(valor, window.location.href);
    const protocoloPermitido = url.protocol === "https:" || url.protocol === "http:";
    const relativaPermitida = permitirRelativa && url.origin === window.location.origin;
    return protocoloPermitido || relativaPermitida ? escaparHtml(valor) : "";
  } catch {
    return "";
  }
}

// Helper: descobre tipo do presente mesmo se faltar o campo (retrocompat)
function obterTipoPresente(p) {
  if (p.tipo) return p.tipo; // se já vier do banco

  // fallback: tenta deduzir
  if (p.permiteCotas) return "cotas";
  if (p.lojaUrl) return "online";
  return "livre";
}

// ========== CARREGAR PRESENTES ==========
function carregarPresentes() {
  listaPresentesDiv.setAttribute("aria-busy", "true");

  db.collection("presentes")
    .orderBy("titulo")
    .onSnapshot((snapshot) => {
      listaPresentesDiv.innerHTML = "";

      const presentes = [...snapshot.docs];

      presentesIncorporados.forEach((presente) => {
        if (!presentes.some((doc) => doc.id === presente.id)) {
          presentes.push({ id: presente.id, data: () => presente });
        }
      });

      presentes.sort((a, b) =>
        String(a.data().titulo || "").localeCompare(String(b.data().titulo || ""), "pt-BR")
      );

      if (presentes.length === 0) {
        listaVaziaDiv.classList.remove("d-none");
        return;
      } else {
        listaVaziaDiv.classList.add("d-none");
      }

      presentes.forEach((doc) => {
        const p = doc.data();
        const id = doc.id;
        const tituloSeguro = escaparHtml(p.titulo || "Presente");
        const descricaoSegura = escaparHtml(p.descricao || "");
        const lojaSegura = escaparHtml(p.lojaNome || "");
        const lojaUrlSegura = urlSegura(p.lojaUrl);
        const imagemUrlSegura = urlSegura(p.imagemUrl, true);

        const tipo = obterTipoPresente(p);
        const isCotas = tipo === "cotas";
        const isOnline = tipo === "online";
        const isLivre = tipo === "livre";

        const col = document.createElement("div");
        col.className = "col-12 col-md-6 col-lg-4";

        const cotasReservadas = p.qtdCotasReservadas || 0;
        const cotasTotal = p.qtdCotasTotal || 1;
        const cotasDisponiveis = Math.max(cotasTotal - cotasReservadas, 0);

        const esgotado =
          p.status === "completo" ||
          (isCotas && (p.qtdCotasReservadas || 0) >= (p.qtdCotasTotal || 1));

        // Texto do tipo para badge
        let labelTipo = "";
        if (isCotas) labelTipo = "Cotas via Pix";
        else if (isOnline) labelTipo = "Presente online";
        else labelTipo = "Presente livre";

        // Bloco de preço/infos
        let blocoInfo = "";
        if (isCotas && p.valorPorCota) {
          const percentualDisponivel = Math.round((cotasDisponiveis / cotasTotal) * 100);
          const valorCotaFormatado = p.valorPorCota.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          });

          blocoInfo = `
            <div class="presente-cotas-resumo mb-2">
              <div class="presente-cotas-valor">
                <span>Valor da cota</span>
                <strong>R$ ${valorCotaFormatado}</strong>
              </div>
              <div class="presente-cotas-contagem">
                <strong>${cotasDisponiveis} de ${cotasTotal}</strong>
                <span>cotas disponíveis</span>
              </div>
              <div class="presente-cotas-barra" aria-label="${percentualDisponivel}% das cotas disponíveis">
                <span style="width: ${percentualDisponivel}%"></span>
              </div>
              <span class="presente-cotas-reservadas">${cotasReservadas} reservadas</span>
            </div>
          `;
        } else if (p.precoTotal) {
          const precoFormatado = p.precoTotal.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          });

          blocoInfo = `
            <div class="presente-preco">
              <span>Valor ${isOnline ? "aproximado" : "sugerido"}</span>
              <strong>R$ ${precoFormatado}</strong>
            </div>
          `;
        }

        // Link da loja (mais destacado para ONLINE)
        let blocoLoja = "";
        if (p.lojaNome || p.lojaUrl) {
          const linkTexto = isOnline ? "Abrir site da loja" : "Ver na loja";
          blocoLoja = `
            <div class="presente-loja">
              ${lojaSegura ? `<span>${lojaSegura}</span>` : ""}
              ${lojaUrlSegura ? `<a href="${lojaUrlSegura}" target="_blank" rel="noopener noreferrer">${linkTexto}</a>` : ""}
            </div>
          `;
        }

        const mostrarDescricao = p.descricao &&
          p.descricao !== "Produto online escolhido para a lista.";

        col.innerHTML = `
          <div class="card h-100 shadow-sm">
            <div class="presente-media">
              ${imagemUrlSegura ? `
                <img src="${imagemUrlSegura}" class="card-img-top" alt="${tituloSeguro}" loading="lazy" decoding="async" />
              ` : ""}
              <span class="badge-status ${
                isCotas ? "badge-tipo-cotas" :
                isOnline ? "badge-tipo-online" :
                           "badge-tipo-livre"
              }">${labelTipo}</span>
            </div>

            <div class="card-body d-flex flex-column">
              <h5 class="card-title">${tituloSeguro}</h5>

              ${mostrarDescricao ? `<p class="card-text">${descricaoSegura}</p>` : ""}

              ${blocoLoja}
              ${blocoInfo}

              <div class="presente-acao mt-auto ${isOnline ? "presente-acoes-duplas" : ""}">
                <button
                  class="btn btn-sm ${esgotado ? "btn-secondary" : "btn-primary"} btnPresentear"
                  data-id="${id}"
                  ${esgotado ? "disabled" : ""}
                >
                  ${esgotado ? "Já escolhido" : "Presentear"}
                </button>
                ${isOnline && p.precoTotal ? `
                  <button class="btn btn-sm btn-pix btnEnviarPix" data-id="${id}">
                    Enviar Pix
                  </button>
                ` : ""}
              </div>
            </div>
          </div>
        `;

        listaPresentesDiv.appendChild(col);
      });

      listaPresentesDiv.setAttribute("aria-busy", "false");
    }, (err) => {
      console.error("Erro ao carregar presentes do Firebase:", err);
      listaPresentesDiv.innerHTML = "";
      listaVaziaDiv.textContent = "Nao foi possivel carregar os presentes. Tente novamente em instantes.";
      listaVaziaDiv.classList.remove("d-none");
      listaPresentesDiv.setAttribute("aria-busy", "false");
    });
}

// ========== ABRIR MODAL DE RESERVA ==========
listaPresentesDiv.addEventListener("click", async (e) => {
  const btnPix = e.target.closest(".btnEnviarPix");
  if (btnPix) {
    const id = btnPix.getAttribute("data-id");
    const presente = await buscarPresente(id);
    if (!presente) return;
    valorReservaAtual = presente.precoTotal || 0;

    if (valorReservaAtual <= 0) {
      alert("Este presente não possui um valor definido para Pix.");
      return;
    }

    mostrarModalPix("", presente, 1, valorReservaAtual, "");
    return;
  }

  const btn = e.target.closest(".btnPresentear");
  if (!btn) return;

  const id = btn.getAttribute("data-id");
  presenteSelecionado = await buscarPresente(id);
  if (!presenteSelecionado) return;
  const tipo = obterTipoPresente(presenteSelecionado);

  // Preenche modal
  reservaPresenteTituloSpan.textContent = presenteSelecionado.titulo || "";
  reservaPresenteDescricaoSpan.textContent = presenteSelecionado.descricao || "";

  nomeConvidadoInput.value = "";
  mensagemConvidadoInput.value = "";

  const cotasReservadas = presenteSelecionado.qtdCotasReservadas || 0;
  const cotasTotal = presenteSelecionado.qtdCotasTotal || 1;
  const cotasDisponiveis = Math.max(cotasTotal - cotasReservadas, 0);

  if (tipo === "cotas") {
    grupoQtdCotasDiv.classList.remove("d-none");
    qtdCotasInput.min = 1;
    qtdCotasInput.max = cotasDisponiveis;
    qtdCotasInput.value = 1;
    textoCotasDisponiveis.textContent =
      `Cotas disponíveis: ${cotasDisponiveis} de ${cotasTotal}.`;
    qtdCotasEscolhida = 1;
    valorReservaAtual = (presenteSelecionado.valorPorCota || 0) * qtdCotasEscolhida;
  } else {
    // livre ou online → sem cotas
    grupoQtdCotasDiv.classList.add("d-none");
    qtdCotasEscolhida = 1;
    valorReservaAtual = presenteSelecionado.precoTotal || 0;
  }

  // Se não tiver valor (tipo livre), só mostra "—"
  valorReservaTextoSpan.textContent =
    valorReservaAtual > 0 ? `R$ ${valorReservaAtual.toFixed(2)}` : "—";

  modalReserva.show();
});

// Atualiza valor quando muda qtd de cotas
qtdCotasInput.addEventListener("input", () => {
  if (!presenteSelecionado) return;
  const tipo = obterTipoPresente(presenteSelecionado);
  if (tipo !== "cotas") return;

  const v = Number(qtdCotasInput.value || 1);
  const cotasReservadas = presenteSelecionado.qtdCotasReservadas || 0;
  const cotasTotal = presenteSelecionado.qtdCotasTotal || 1;
  const cotasDisponiveis = Math.max(cotasTotal - cotasReservadas, 0);

  if (v < 1) {
    qtdCotasEscolhida = 1;
  } else if (v > cotasDisponiveis) {
    qtdCotasEscolhida = cotasDisponiveis;
  } else {
    qtdCotasEscolhida = v;
  }

  qtdCotasInput.value = qtdCotasEscolhida;
  valorReservaAtual = (presenteSelecionado.valorPorCota || 0) * qtdCotasEscolhida;
  valorReservaTextoSpan.textContent = `R$ ${valorReservaAtual.toFixed(2)}`;
});

// ========== SUBMIT DA RESERVA ==========
formReserva.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!presenteSelecionado) return;

  const nome = nomeConvidadoInput.value.trim();
  const mensagem = mensagemConvidadoInput.value.trim();

  if (!nome) {
    alert("Por favor, informe seu nome.");
    return;
  }

  const tipo = obterTipoPresente(presenteSelecionado);
  const btnConfirmar = formReserva.querySelector('button[type="submit"]');
  const textoOriginal = btnConfirmar.textContent;
  btnConfirmar.disabled = true;
  btnConfirmar.textContent = "Confirmando...";

  try {
    const presenteRef = db.collection("presentes").doc(presenteSelecionado.id);

    await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(presenteRef);
      if (!doc.exists) throw new Error("Presente não encontrado.");

      const p = doc.data();
      const tipoP = obterTipoPresente(p);

      const cotasReservadas = p.qtdCotasReservadas || 0;
      const cotasTotal = p.qtdCotasTotal || 1;
      const cotasDisponiveis = Math.max(cotasTotal - cotasReservadas, 0);

      if (tipoP === "cotas") {
        if (qtdCotasEscolhida > cotasDisponiveis) {
          throw new Error("Quantidade de cotas indisponível.");
        }
      } else {
        if (cotasReservadas >= cotasTotal) {
          throw new Error("Presente já foi escolhido.");
        }
      }

      const valorTotal =
        tipoP === "cotas"
          ? (p.valorPorCota || 0) * qtdCotasEscolhida
          : (p.precoTotal || 0);

      const reservaRef = db.collection("reservas").doc();
      transaction.set(reservaRef, {
        presenteId: presenteSelecionado.id,
        tituloPresente: p.titulo || "",
        nomeConvidado: nome,
        mensagem: mensagem || null,
        quantidadeCotas: tipoP === "cotas" ? qtdCotasEscolhida : 1,
        valorTotal,
        tipoPresente: tipoP,
        statusPagamento: tipoP === "cotas" ? "pendente" : "externo",
        criadoEm: firebase.firestore.FieldValue.serverTimestamp()
      });

      const incremento = tipoP === "cotas" ? qtdCotasEscolhida : 1;
      const novoReservado = cotasReservadas + incremento;
      const novoStatus =
        novoReservado >= cotasTotal ? "completo" : (p.status || "disponivel");

      transaction.update(presenteRef, {
        qtdCotasReservadas: novoReservado,
        status: novoStatus
      });

      presenteSelecionado.qtdCotasReservadas = novoReservado;
      presenteSelecionado.status = novoStatus;
    });

    modalReserva.hide();

    // Pós-reserva de acordo com o tipo
    if (tipo === "cotas") {
      mostrarModalPix(nome, presenteSelecionado, qtdCotasEscolhida, valorReservaAtual, mensagem);
    } else if (tipo === "online") {
      // agradece + abre site da loja (se houver link)
      let msg = "Presente reservado! Muito obrigado 💚\n\n";
      msg += "Agora é só finalizar a compra no site da loja.";
      alert(msg);

      if (presenteSelecionado.lojaUrl) {
        const lojaUrl = urlSegura(presenteSelecionado.lojaUrl);
        if (lojaUrl) {
          const novaJanela = window.open(lojaUrl, "_blank", "noopener,noreferrer");
          if (novaJanela) novaJanela.opener = null;
        }
      }
    } else {
      // tipo livre
      alert(
        "Presente reservado! Muito obrigado 💚\n\n" +
        "Fique à vontade para escolher o modelo/versão desse presente."
      );
    }

  } catch (err) {
    console.error("Erro ao reservar presente:", err);
    alert(err.message || "Erro ao reservar presente. Tente novamente.");
  } finally {
    btnConfirmar.disabled = false;
    btnConfirmar.textContent = textoOriginal;
  }
});

// ========== MODAL PIX (somente COTAS) ==========
function campoPix(id, valor) {
  return `${id}${String(valor.length).padStart(2, "0")}${valor}`;
}

function crc16Pix(texto) {
  let crc = 0xffff;

  for (let i = 0; i < texto.length; i += 1) {
    crc ^= texto.charCodeAt(i) << 8;

    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1);
      crc &= 0xffff;
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function gerarPayloadPix(chave, valor) {
  const contaPix = campoPix("00", "BR.GOV.BCB.PIX") + campoPix("01", chave);
  const dadosAdicionais = campoPix("05", "***");

  const payloadSemCrc =
    campoPix("00", "01") +
    campoPix("01", "12") +
    campoPix("26", contaPix) +
    campoPix("52", "0000") +
    campoPix("53", "986") +
    campoPix("54", valor.toFixed(2)) +
    campoPix("58", "BR") +
    campoPix("59", "AMANDA E LEONARDO") +
    campoPix("60", "RIO DE JANEIRO") +
    campoPix("62", dadosAdicionais) +
    "6304";

  return payloadSemCrc + crc16Pix(payloadSemCrc);
}

function mostrarModalPix(nome, presente, qtdCotas, valor, mensagem) {
  pixPresenteTituloSpan.textContent = presente.titulo || "";
  pixPresenteTituloInlineSpan.textContent = presente.titulo || "";

  const valorUnitario = presente.valorPorCota || valor;
  const valorCotaFormatado = valorUnitario.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  const valorTotalFormatado = valor.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  const msgExtra = mensagem ? `Mensagem: "${mensagem}"` : "";
  const isCotas = obterTipoPresente(presente) === "cotas";
  const txtCotas = isCotas
    ? `${qtdCotas} cota(s) de R$ ${valorCotaFormatado}`
    : "Contribuição via Pix para este presente";

  pixDetalhesReservaSpan.textContent =
    `${nome ? nome + " • " : ""}${txtCotas}${msgExtra ? " • " + msgExtra : ""}`;

  pixValorSpan.textContent = `R$ ${valorTotalFormatado}`;
  pixChaveSpan.textContent = PIX_CHAVE;
  pixCopiaEColaAtual = gerarPayloadPix(PIX_CHAVE, valor);

  pixQrCodeDiv.innerHTML = "";
  new QRCode(pixQrCodeDiv, {
    text: pixCopiaEColaAtual,
    width: 184,
    height: 184,
    colorDark: "#35333f",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.M
  });

  modalPix.show();
}

// Copiar Pix
btnCopiarPix.addEventListener("click", () => {
  navigator.clipboard.writeText(pixCopiaEColaAtual)
    .then(() => alert("Código Pix copiado!"))
    .catch(() => alert("Não foi possível copiar o código Pix."));
});

btnCopiarChave.addEventListener("click", () => {
  navigator.clipboard.writeText(PIX_CHAVE)
    .then(() => alert("Chave Pix copiada!"))
    .catch(() => alert("Não foi possível copiar. Copie manualmente."));
});

btnCopiarValor.addEventListener("click", () => {
  navigator.clipboard.writeText(valorReservaAtual.toFixed(2).replace(".", ","))
    .then(() => alert("Valor copiado!"))
    .catch(() => alert("Não foi possível copiar. Copie manualmente."));
});

// Inicia
carregarPresentes();
