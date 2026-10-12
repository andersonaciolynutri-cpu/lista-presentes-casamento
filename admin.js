// ======= CONFIG FIREBASE =======
const firebaseConfig = window.WEDDING_FIREBASE_CONFIG;

// UID do usuário admin (pego no Firebase Auth)
const ADMIN_UID = window.WEDDING_ADMIN_UID || "";

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

console.log("admin.js carregado");

// ======= ELEMENTOS DA TELA =======
const loginArea = document.getElementById("loginArea");
const dashboard = document.getElementById("dashboard");
const btnLogin = document.getElementById("btnLogin");
const btnLogout = document.getElementById("btnLogout");
const loginErro = document.getElementById("loginErro");

// Form presente
const formPresente = document.getElementById("formPresente");
const formTitulo = document.getElementById("formTitulo");
const presenteIdInput = document.getElementById("presenteId");
const tituloInput = document.getElementById("titulo");
const imagemUrlInput = document.getElementById("imagemUrl");
const descricaoInput = document.getElementById("descricao");
const lojaNomeInput = document.getElementById("lojaNome");
const lojaUrlInput = document.getElementById("lojaUrl");
const precoTotalInput = document.getElementById("precoTotal");

// NOVO: select de tipo
const tipoPresenteSelect = document.getElementById("tipoPresente");

const valorPorCotaInput = document.getElementById("valorPorCota");
const qtdCotasTotalInput = document.getElementById("qtdCotasTotal");
const btnCancelarEdicao = document.getElementById("btnCancelarEdicao");
const btnImportarProdutos = document.getElementById("btnImportarProdutos");
const importarProdutosStatus = document.getElementById("importarProdutosStatus");
const btnResetarReservas = document.getElementById("btnResetarReservas");
const resetarReservasStatus = document.getElementById("resetarReservasStatus");

const campoValorCota = document.getElementById("campoValorCota");
const campoQtdCotas = document.getElementById("campoQtdCotas");

// Tabelas
const tabelaPresentes = document.getElementById("tabelaPresentes");
const tabelaReservas = document.getElementById("tabelaReservas");

function criarCelula(texto) {
  const td = document.createElement("td");
  td.textContent = texto;
  return td;
}

// Só pra garantir que nenhum elemento crítico veio null:
if (!btnLogin) console.error("Elemento #btnLogin não encontrado no HTML");
if (!formPresente) console.error("Elemento #formPresente não encontrado no HTML");
if (!tipoPresenteSelect) console.error("Elemento #tipoPresente não encontrado no HTML");

const produtosParaImportar = [
  {
    id: "liquidificador-oster",
    titulo: "Liquidificador Oster",
    lojaNome: "Mercado Livre",
    precoTotal: 179.99,
    lojaUrl: "https://www.mercadolivre.com.br/liquidificador-oster-oliq610-1400w-full-32l-cor-preto/p/MLB16602518?pdp_filters=item_id%3AMLB5725119530&matt_tool=38524122#origin=whatsapp&sid=whatsapp&wid=MLB5725119530",
    imagemUrl: "https://tse1.mm.bing.net/th?q=Liquidificador%20Oster%20OLIQ610%201400W%20Full%203.2L%20Preto&w=600&h=420&c=7&rs=1&p=0"
  },
  {
    id: "ar-condicionado-elgin",
    titulo: "Ar-condicionado Elgin",
    lojaNome: "",
    precoTotal: 1637.10,
    permiteCotas: true,
    valorPorCota: 100.00,
    qtdCotasTotal: 20,
    lojaUrl: "",
    imagemUrl: "https://tse1.mm.bing.net/th?q=Ar%20Condicionado%20Inverter%20Elgin%20Eco%20III%209000%20BTUs%20220V&w=600&h=420&c=7&rs=1&p=0"
  },
  {
    id: "purificador-electrolux",
    titulo: "Purificador Electrolux",
    lojaNome: "Casas Bahia",
    precoTotal: 679.90,
    lojaUrl: "https://www.casasbahia.com.br/purificador-de-agua-electrolux-com-agua-gelada-e-alerta-de-troca-de-filtro-pe12g/p/1512078375?utm_medium=Cpc&utm_source=GP_PLA&IdSku=1512078375&idLojista=37582&tipoLojista=3P&gclsrc=aw.ds&&utm_campaign=cb_mkp_gg_shopping_core_elpo_sellers_toplojistas&gad_source=1&gad_campaignid=22850748880&gbraid=0AAAAADtAamhKiCOtOLDeYuDYrOsvMuKrp&gclid=CjwKCAjwuO_QBhAWEiwAIkVhU1HVn-f3tFVg62oUUF_y0TygN5qVSzgvk1_rRznR5svZuEiGuCMrXhoCVWIQAvD_BwE",
    imagemUrl: "https://tse1.mm.bing.net/th?q=Purificador%20de%20agua%20Electrolux%20PE12G%20agua%20gelada&w=600&h=420&c=7&rs=1&p=0"
  },
  {
    id: "ferro-black-decker",
    titulo: "Ferro Black+Decker",
    lojaNome: "Mercado Livre",
    precoTotal: 136.99,
    lojaUrl: "https://www.mercadolivre.com.br/ferro-de-passar-roupa-black-decker-vfa1110tm2-com-base-de-aluminio/p/MLB15553602?pdp_filters=item_id%3AMLB5452921500&matt_tool=38524122#origin=whatsapp&sid=whatsapp&wid=MLB5452921500",
    imagemUrl: "https://tse1.mm.bing.net/th?q=Ferro%20de%20passar%20Black%20Decker%20VFA1110TM2&w=600&h=420&c=7&rs=1&p=0"
  },
  {
    id: "mixer-britania",
    titulo: "Mixer Britania",
    lojaNome: "Casas Bahia",
    precoTotal: 298.00,
    lojaUrl: "https://www.casasbahia.com.br/mixer-britania-bmx400p-3-em-1-400w-preto/p/55035923?utm_medium=Cpc&utm_source=GP_PLA&IdSku=55035923&idLojista=10037&tipoLojista=1P&gclsrc=aw.ds&&utm_campaign=cb_b2c_gg_shopping_core_elpo_geral&gad_source=1&gad_campaignid=22439146548&gbraid=0AAAAADtAamj7LuH7ihhVvKLJ5329QYLib&gclid=CjwKCAjwuO_QBhAWEiwAIkVhUyMSCZ64c02Z59a-UNMe9MXuYiORvtF5Yzfn-wuI9N4HMriVGgqELBoC_xoQAvD_BwE",
    imagemUrl: "https://tse1.mm.bing.net/th?q=Mixer%20Britania%20BMX400P%203%20em%201%20400W%20Preto&w=600&h=420&c=7&rs=1&p=0"
  },
  {
    id: "ventilador-arno",
    titulo: "Ventilador Arno",
    lojaNome: "Mercado Livre",
    precoTotal: 199.00,
    lojaUrl: "https://www.mercadolivre.com.br/ventilador-arno-turbo-force-2-em-1-preto-de-piso-40-cm-de-dimetro-6-pas-vf42/p/MLB19609964?pdp_filters=item_id%3AMLB5744808934&matt_tool=38524122#origin=whatsapp&sid=whatsapp&wid=MLB5744808934",
    imagemUrl: "https://tse1.mm.bing.net/th?q=Ventilador%20Arno%20Turbo%20Force%202%20em%201%20preto%2040%20cm%20VF42&w=600&h=420&c=7&rs=1&p=0"
  },
  {
    id: "cooktop-itatiaia",
    titulo: "Cooktop Itatiaia",
    lojaNome: "Mercado Livre",
    precoTotal: 301.68,
    lojaUrl: "https://www.mercadolivre.com.br/cooktop-itatiaia-essencial-4-bocas-cor-preto/p/MLB11998125?pdp_filters=item_id%3AMLB4094144510&matt_tool=38524122&ua=ax42j5yHdpKYS403jGdCrFcwDIV5rMk1hnj4bTr9YrHl5KeF#origin=whatsapp&sid=whatsapp&wid=MLB4094144510",
    imagemUrl: "https://tse1.mm.bing.net/th?q=Cooktop%20Itatiaia%20Essencial%204%20Bocas%20Preto&w=600&h=420&c=7&rs=1&p=0"
  },
  {
    id: "aquecedor-lorenzetti",
    titulo: "Aquecedor Lorenzetti",
    lojaNome: "",
    precoTotal: 1202.00,
    permiteCotas: true,
    valorPorCota: 150.00,
    qtdCotasTotal: 10,
    lojaUrl: "",
    imagemUrl: "https://tse1.mm.bing.net/th?q=Lorenzetti%20Digital%20LZ%201600DE%20a%20gas%20branco%20GLP&w=600&h=420&c=7&rs=1&p=0"
  },
  {
    id: "kit-travesseiros-ortobom",
    titulo: "Kit Travesseiros Ortobom",
    lojaNome: "Magazine Luiza",
    precoTotal: 192.00,
    lojaUrl: "https://m.magazineluiza.com.br/kit-travesseiro-04-pecas-percal-com-200-fios-ortobom/p/691375800/cm/tvsc/?partner_id=64853&utm_source=pdp_desk&utm_medium=share&seller_id=paulocezarenxovais",
    imagemUrl: "https://tse1.mm.bing.net/th?q=Kit%20Travesseiro%2004%20Pecas%20Percal%20200%20Fios%20Ortobom&w=600&h=420&c=7&rs=1&p=0"
  },
  {
    id: "depurador-suggar-dps161pt",
    titulo: "Depurador Suggar",
    lojaNome: "Mercado Livre",
    precoTotal: 434.00,
    lojaUrl: "https://www.mercadolivre.com.br/depurador-exaustor-slim-60cm-preto-dps161pt-suggar/p/MLB21720839?pdp_filters=item_id%3AMLB5954019814&matt_tool=38524122&ua=xGgF8khU-5SfymKFTQCxrwM5-gF-qRPd5iibgsua5DPH58Ef#origin=whatsapp&sid=whatsapp&wid=MLB5954019814",
    imagemUrl: "https://tse1.mm.bing.net/th?q=Depurador%20Exaustor%20Slim%2060cm%20Preto%20DPS161PT%20Suggar&w=600&h=420&c=7&rs=1&p=0"
  },
  {
    id: "sofa-detroit-4-lugares",
    titulo: "Sofa Detroit 4 Lugares",
    lojaNome: "",
    precoTotal: 2387.43,
    permiteCotas: true,
    valorPorCota: 200.00,
    qtdCotasTotal: 12,
    lojaUrl: "",
    imagemUrl: "https://tse1.mm.bing.net/th?q=Sofa%204%20Lugares%20Retratil%20Reclinavel%20Detroit%202.50m%20Molas%20Ensacadas%20Linho&w=600&h=420&c=7&rs=1&p=0"
  },
  {
    id: "cafeteira-oster-ocaf300",
    titulo: "Cafeteira Oster",
    lojaNome: "Mercado Livre",
    precoTotal: 130.00,
    lojaUrl: "https://www.mercadolivre.com.br/cafeteira-eletrica-oster-inox-ocaf300-preto/p/MLB17949790?pdp_filters=item_id%3AMLB2006358601&matt_tool=38524122&ua=r4udrnU4SCOtgzeBiFhlcFk-zlITb7TbW0Ah-tEqZ0iFDlDG#origin=whatsapp&sid=whatsapp&wid=MLB2006358601",
    imagemUrl: "https://tse1.mm.bing.net/th?q=Cafeteira%20Eletrica%20Oster%20Inox%20OCAF300%20Preto&w=600&h=420&c=7&rs=1&p=0"
  },
  {
    id: "sanduicheira-mondial-s20",
    titulo: "Sanduicheira Mondial",
    lojaNome: "Mercado Livre",
    precoTotal: 87.58,
    lojaUrl: "https://www.mercadolivre.com.br/sanduicheira-master-grill-750w-s-20-mondial/p/MLB22517436?pdp_filters=item_id%3AMLB5540876220&matt_tool=38524122&ua=W3fgmX90QJS1IxrPGWevp0Gx4oKcKdlbp93YR1RkIIrXnX-9#origin=whatsapp&sid=whatsapp&wid=MLB5540876220",
    imagemUrl: "https://tse1.mm.bing.net/th?q=Sanduicheira%20Master%20Grill%20750W%20S20%20Mondial&w=600&h=420&c=7&rs=1&p=0"
  },
  {
    id: "airfryer-philips-walita-xl",
    titulo: "Airfryer Philips Walita",
    lojaNome: "Casas Bahia",
    precoTotal: 410.97,
    lojaUrl: "https://www.casasbahia.com.br/fritadeira-airfryer-philips-walita-serie-1000-xl-62l-1700w-grelha-removivel-preto/p/55070219?utm_medium=cpc&utm_source=GP_PLA&IdSku=55070219&idLojista=10037&tipoLojista=1P&gclsrc=aw.ds&&utm_campaign=cb_b2c_gg_shopping_core_elpo_medium&gad_source=4&gad_campaignid=23898474716&gbraid=0AAAAADtAamhocaSAMhv6JpWT-Zk1FbSg8&gclid=EAIaIQobChMI8IHs5KPJlQMViWFIAB0drTyhEAQYCiABEgJc8PD_BwE",
    imagemUrl: "https://tse1.mm.bing.net/th?q=Airfryer%20Philips%20Walita%20Serie%201000%20XL%206.2L%201700W%20Preto&w=600&h=420&c=7&rs=1&p=0"
  },
  {
    id: "aspirador-electrolux-stk12",
    titulo: "Aspirador Electrolux",
    lojaNome: "Magazine Luiza",
    precoTotal: 139.00,
    lojaUrl: "https://m.magazineluiza.com.br/aspirador-de-po-portatil-e-vertical-electrolux-1100w-stk12-preto/p/021499200/ep/apdv/?partner_id=64853&utm_source=pdp_desk&utm_medium=share&seller_id=magazineluiza",
    imagemUrl: "https://tse1.mm.bing.net/th?q=Aspirador%20de%20Po%20Portatil%20Vertical%20Electrolux%201100W%20STK12%20Preto&w=600&h=420&c=7&rs=1&p=0"
  },
  {
    id: "smart-tv-tcl-50p7k",
    titulo: "Smart TV TCL 50",
    lojaNome: "",
    precoTotal: 2089.05,
    permiteCotas: true,
    valorPorCota: 100.00,
    qtdCotasTotal: 20,
    lojaUrl: "",
    imagemUrl: "https://tse1.mm.bing.net/th?q=Smart%20TV%2050%20TCL%204K%20UHD%20QLED%2050P7K%20Google%20TV&w=600&h=420&c=7&rs=1&p=0"
  },
  {
    id: "kit-toalhas-banho-marcotex",
    titulo: "Jogo 4 Toalhas de Banho",
    lojaNome: "Mercado Livre",
    precoTotal: 92.90,
    lojaUrl: "https://produto.mercadolivre.com.br/MLB-4125132275-jogo-toalhas-banho-grossas-macias-algodo-4pc-absorventes-_JM?matt_tool=38524122&ua=VgqTWytKugD8SOnukc7b3ekw3Vra_xWgMb6VKLiEey66-KA#origin=whatsapp&sid=whatsapp",
    imagemUrl: "assets/produtos/jogo-toalhas-cinza-preto.jpg"
  },
  {
    id: "kit-ventiladores-teto-ventisol-fenix",
    titulo: "Kit 2 Ventiladores de Teto",
    lojaNome: "Magazine Luiza",
    precoTotal: 592.73,
    lojaUrl: "https://m.magazineluiza.com.br/kit-ventilador-de-teto-ventisol-fenix-branco-inverter-controle-remoto-bivolt-kit-02-unidades/p/jfe1kc8e80/ar/acve/?partner_id=64853&utm_source=pdp_desk&utm_medium=share&seller_id=techshop",
    imagemUrl: "https://tse1.mm.bing.net/th?q=Kit%202%20Ventiladores%20de%20Teto%20Ventisol%20Fenix%20Branco%20Inverter%20Controle%20Remoto&w=600&h=420&c=7&rs=1&p=0"
  },
  {
    id: "conjunto-mesa-jantar-4-cadeiras",
    titulo: "Conjunto Mesa de Jantar",
    lojaNome: "",
    precoTotal: 800.00,
    permiteCotas: true,
    valorPorCota: 80.00,
    qtdCotasTotal: 10,
    lojaUrl: "",
    imagemUrl: "https://tse1.mm.bing.net/th?q=Mesa%20de%20Jantar%20Redonda%20Madeira%204%20Cadeiras%20Estofadas%20Bege&w=600&h=600&c=7&rs=1&p=0"
  },
  {
    id: "kit-edredom-lencol-casal-400-fios",
    titulo: "Kit Edredom e Lencol Casal",
    lojaNome: "Mercado Livre",
    precoTotal: 172.32,
    lojaUrl: "https://www.mercadolivre.com.br/kit-edredom-casal--jogo-lencol-3-pecas-micropercal-400-fios/up/MLBU4008502793?pdp_filters=item_id%3AMLB4715334753&matt_tool=38524122&ua=NTGt0oxz8Dh5ONyoNecMb5ERILMv6GAoLz5ZxrCdfn62hPg#origin=whatsapp&sid=whatsapp&wid=MLB4715334753",
    imagemUrl: "assets/produtos/kit-edredom-lencol-casal-preto.png"
  },
  {
    id: "ventilador-teto-nepul-turbo",
    titulo: "Ventilador de Teto Nepul Turbo",
    lojaNome: "Mercado Livre",
    precoTotal: 399.00,
    lojaUrl: "https://www.mercadolivre.com.br/p/MLB62058576?matt_tool=38524122&pdp_filters=item_id:MLB5929068528&ua=hUMf9-Vq5n4okaNWi-ZKDwh1iiAAHhLb7wtVNRFl-nElvC4#origin=share&sid=share&wid=MLB5929068528&action=whatsapp",
    imagemUrl: "assets/produtos/ventilador-nepul-turbo-branco.png"
  },
  {
    id: "kit-cobre-leito-pompeia",
    titulo: "Kit Cobre-Leito Pompeia",
    lojaNome: "Mercado Livre",
    precoTotal: 116.30,
    lojaUrl: "https://produto.mercadolivre.com.br/MLB-3568778809?matt_tool=38524122&ua=TQx5hDgeLtB8HzT_9jeGFUj3Kug3LUEW-BLjg5XpyZvcZzM#origin=share&sid=share&action=whatsapp",
    imagemUrl: "https://tse1.mm.bing.net/th?q=Kit%20Cobre%20Leito%20Colcha%20Casal%203%20Pecas%20300%20Fios%20Pompeia&w=600&h=420&c=7&rs=1&p=0"
  },
  {
    id: "conjunto-panelas-mimo-style-10-pecas",
    titulo: "Conjunto de Panelas Mimo Style",
    lojaNome: "Mercado Livre",
    precoTotal: 612.71,
    lojaUrl: "https://www.mercadolivre.com.br/conjunto-de-panelas-induco-style-cook-10-pecas-grafito-mimo-style/p/MLB34912460?pdp_filters=item_id%3AMLB5496535154&matt_tool=38524122&ua=B0D6KLcJMUTADXV69NqfESPXJPKHyc1EludFRDZ1Ss_ktDY#origin=whatsapp&sid=whatsapp&wid=MLB5496535154",
    imagemUrl: "assets/produtos/conjunto-panelas-mimo-style-real.jpg"
  },
  {
    id: "aparelho-jantar-roma-20-pecas",
    titulo: "Aparelho de Jantar Roma 20 Pecas",
    lojaNome: "Mercado Livre",
    precoTotal: 425.98,
    lojaUrl: "https://www.mercadolivre.com.br/aparelho-de-jantar-20-pecas-roma-branco/p/MLB33483108?pdp_filters=item_id%3AMLB4007239231&matt_tool=38524122&ua=9F7FAHeFqLJvmvl5VTw6iecjLM_w-rN3KaE9VWhExqwQMQg#origin=whatsapp&sid=whatsapp&wid=MLB4007239231",
    imagemUrl: "https://tse1.mm.bing.net/th?q=Aparelho%20de%20Jantar%20Roma%20Branco%2020%20Pecas%20Porto%20Brasil&w=600&h=420&c=7&rs=1&p=0"
  },
  {
    id: "panela-pressao-mimo-style-presscook",
    titulo: "Panela de Pressao Mimo Style",
    lojaNome: "Mercado Livre",
    precoTotal: 170.00,
    lojaUrl: "https://www.mercadolivre.com.br/panela-de-presso-fechamento-externo-presscook-grafito-42l-mimo-style/p/MLB58330082?pdp_filters=item_id%3AMLB5971386074&matt_tool=38524122&ua=JTD3-8dc9Zgf7qBjXs5YD_qm27pIz5rh10TigFMt7m7a2tI#origin=whatsapp&sid=whatsapp&wid=MLB5971386074",
    imagemUrl: "https://tse1.mm.bing.net/th?q=Panela%20de%20Pressao%20Fechamento%20Externo%20PressCook%20Grafito%204.2L%20Mimo%20Style&w=600&h=420&c=7&rs=1&p=0"
  },
  {
    id: "playstation-5-digital-astro-bot-gt7",
    titulo: "PlayStation 5 Digital",
    descricao: "Para o Leo se divertir enquanto espera a Amanda ficar pronta.",
    lojaNome: "",
    precoTotal: 3695.12,
    permiteCotas: true,
    valorPorCota: 100.00,
    qtdCotasTotal: 40,
    lojaUrl: "",
    imagemUrl: "https://tse1.mm.bing.net/th?q=PlayStation%205%20Edicao%20Digital%20825GB%20Astro%20Bot%20Gran%20Turismo%207&w=600&h=420&c=7&rs=1&p=0"
  }
];

const produtosParaExcluirNaImportacao = [
  "aparelho-jantar-porto-brasil",
  "tabua-de-passar",
  "presente-shopee-1",
  "presente-shopee-2",
  "presente-shopee-3",
  "presente-shopee-4"
];

// ======= CONTROLE DE LOGIN =======

if (btnLogin) {
  btnLogin.addEventListener("click", async () => {
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();

    loginErro.classList.add("d-none");
    loginErro.textContent = "";

    try {
      console.log("Tentando login com", email);
      await auth.signInWithEmailAndPassword(email, senha);
      // se der certo, onAuthStateChanged vai disparar
    } catch (err) {
      console.error("Erro no login:", err);
      loginErro.textContent = "Falha no login. Verifique e-mail/senha.";
      loginErro.classList.remove("d-none");
    }
  });
}

if (btnLogout) {
  btnLogout.addEventListener("click", async () => {
    await auth.signOut();
  });
}

// Observa estado de autenticação
auth.onAuthStateChanged((user) => {
  console.log("onAuthStateChanged -> user:", user?.uid, "ADMIN:", ADMIN_UID);

  if (user && user.uid === ADMIN_UID) {
    // Mostra dashboard
    loginArea.classList.add("d-none");
    dashboard.classList.remove("d-none");
    btnLogout.classList.remove("d-none");
    loginErro.classList.add("d-none");

    iniciarDashboard();
  } else {
    // Não logado ou não é admin
    dashboard.classList.add("d-none");
    btnLogout.classList.add("d-none");
    loginArea.classList.remove("d-none");

    // se tiver user mas não for admin, mostra mensagem
    if (user && user.uid !== ADMIN_UID) {
      loginErro.textContent = "Este usuário não tem acesso ao painel admin.";
      loginErro.classList.remove("d-none");
    }
  }
});

// ======= LÓGICA DO DASHBOARD =======

function iniciarDashboard() {
  console.log("Iniciando dashboard...");
  carregarPresentes();
  carregarReservas();
  atualizaVisibilidadeCotas();
}

if (tipoPresenteSelect) {
  tipoPresenteSelect.addEventListener("change", atualizaVisibilidadeCotas);
}

function atualizaVisibilidadeCotas() {
  if (!tipoPresenteSelect) return;
  const tipo = tipoPresenteSelect.value;
  const permite = tipo === "cotas";
  campoValorCota.style.display = permite ? "block" : "none";
  campoQtdCotas.style.display = permite ? "block" : "none";
}

// ======= CRUD PRESENTES =======

if (formPresente) {
  formPresente.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = presenteIdInput.value || null;

    const tipo = tipoPresenteSelect.value || "livre";
    const permiteCotas = tipo === "cotas";

    const dadosBase = {
      tipo,                               // "livre" | "cotas" | "online"
      titulo: tituloInput.value.trim(),
      imagemUrl: imagemUrlInput.value.trim() || null,
      descricao: descricaoInput.value.trim() || null,
      lojaNome: lojaNomeInput.value.trim() || null,
      lojaUrl: lojaUrlInput.value.trim() || null,
      precoTotal: precoTotalInput.value ? Number(precoTotalInput.value) : null,
      permiteCotas,
      valorPorCota: permiteCotas && valorPorCotaInput.value
        ? Number(valorPorCotaInput.value)
        : null,
      qtdCotasTotal: permiteCotas && qtdCotasTotalInput.value
        ? Number(qtdCotasTotalInput.value)
        : 1
    };

    // Ao criar, definimos campos iniciais de status e cotas reservadas
    let dados = { ...dadosBase };

    if (!id) {
      dados = {
        ...dadosBase,
        qtdCotasReservadas: 0,
        status: "disponivel"
      };
    }

    try {
      if (id) {
        // update (não mexe em qtdCotasReservadas/status aqui)
        await db.collection("presentes").doc(id).update(dadosBase);
      } else {
        await db.collection("presentes").add(dados);
      }
      limparFormPresente();
    } catch (err) {
      console.error("Erro ao salvar presente:", err);
      alert("Erro ao salvar presente. Veja o console.");
    }
  });
}

if (btnCancelarEdicao) {
  btnCancelarEdicao.addEventListener("click", () => {
    limparFormPresente();
  });
}

if (btnImportarProdutos) {
  btnImportarProdutos.addEventListener("click", importarProdutosEnviados);
}

function mostrarStatusImportacao(mensagem, tipo = "info") {
  if (!importarProdutosStatus) return;
  importarProdutosStatus.textContent = mensagem;
  importarProdutosStatus.className = `alert alert-${tipo} py-2 small`;
}

async function importarProdutosEnviados() {
  const user = auth.currentUser;
  if (!user || user.uid !== ADMIN_UID) {
    mostrarStatusImportacao("Faca login com o usuario admin antes de importar.", "warning");
    return;
  }

  if (!confirm(`Importar ou atualizar ${produtosParaImportar.length} produtos no banco?`)) {
    return;
  }

  btnImportarProdutos.disabled = true;
  mostrarStatusImportacao("Importando produtos...", "info");

  try {
    let criados = 0;
    let atualizados = 0;
    let excluidos = 0;

    for (const id of produtosParaExcluirNaImportacao) {
      const ref = db.collection("presentes").doc(id);
      const doc = await ref.get();

      if (doc.exists) {
        await ref.delete();
        excluidos += 1;
      }
    }

    for (const produto of produtosParaImportar) {
      const ref = db.collection("presentes").doc(produto.id);
      const doc = await ref.get();

      const dadosBase = {
        tipo: produto.permiteCotas === true ? "cotas" : "online",
        titulo: produto.titulo,
        imagemUrl: produto.imagemUrl,
        descricao: produto.descricao || "Produto online escolhido para a lista.",
        lojaNome: produto.lojaNome,
        lojaUrl: produto.lojaUrl,
        precoTotal: produto.precoTotal,
        permiteCotas: produto.permiteCotas === true,
        valorPorCota: produto.valorPorCota ?? null,
        qtdCotasTotal: produto.qtdCotasTotal ?? 1
      };

      if (doc.exists) {
        await ref.update(dadosBase);
        atualizados += 1;
      } else {
        await ref.set({
          ...dadosBase,
          qtdCotasReservadas: 0,
          status: "disponivel"
        });
        criados += 1;
      }
    }

    mostrarStatusImportacao(
      `Importacao concluida: ${criados} criados, ${atualizados} atualizados, ${excluidos} excluidos.`,
      "success"
    );
  } catch (err) {
    console.error("Erro ao importar produtos:", err);
    mostrarStatusImportacao("Erro ao importar produtos. Veja o console.", "danger");
  } finally {
    btnImportarProdutos.disabled = false;
  }
}

function limparFormPresente() {
  presenteIdInput.value = "";
  formTitulo.textContent = "Novo presente";
  formPresente.reset();
  if (tipoPresenteSelect) tipoPresenteSelect.value = "livre";
  atualizaVisibilidadeCotas();
  btnCancelarEdicao.classList.add("d-none");
}

function carregarPresentes() {
  db.collection("presentes")
    .orderBy("titulo")
    .onSnapshot((snapshot) => {
      tabelaPresentes.innerHTML = "";

      snapshot.forEach((doc) => {
        const p = doc.data();
        const id = doc.id;

        const tr = document.createElement("tr");

        const cotasInfo = p.permiteCotas
          ? `${p.qtdCotasReservadas || 0}/${p.qtdCotasTotal} cotas`
          : "—";

        tr.append(
          criarCelula(p.titulo || ""),
          criarCelula(p.precoTotal ? "R$ " + Number(p.precoTotal).toFixed(2) : "—"),
          criarCelula(cotasInfo),
          criarCelula(p.status || "—")
        );

        const tdAcoes = document.createElement("td");
        const btnEditar = document.createElement("button");
        btnEditar.className = "btn btn-sm btn-outline-primary me-1";
        btnEditar.dataset.id = id;
        btnEditar.dataset.acao = "editar";
        btnEditar.textContent = "Editar";

        const btnExcluir = document.createElement("button");
        btnExcluir.className = "btn btn-sm btn-outline-danger";
        btnExcluir.dataset.id = id;
        btnExcluir.dataset.acao = "excluir";
        btnExcluir.textContent = "Excluir";

        tdAcoes.append(btnEditar, btnExcluir);
        tr.appendChild(tdAcoes);

        tabelaPresentes.appendChild(tr);
      });
    });

  // Delegação de eventos de editar/excluir
  tabelaPresentes.addEventListener("click", async (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const id = btn.getAttribute("data-id");
    const acao = btn.getAttribute("data-acao");

    if (acao === "excluir") {
      if (confirm("Tem certeza que deseja excluir este presente?")) {
        try {
          await db.collection("presentes").doc(id).delete();
        } catch (err) {
          console.error("Erro ao excluir presente:", err);
          alert("Erro ao excluir presente.");
        }
      }
    }

    if (acao === "editar") {
      try {
        const doc = await db.collection("presentes").doc(id).get();
        if (!doc.exists) return;

        const p = doc.data();
        presenteIdInput.value = id;
        formTitulo.textContent = "Editar presente";

        tituloInput.value = p.titulo || "";
        imagemUrlInput.value = p.imagemUrl || "";
        descricaoInput.value = p.descricao || "";
        lojaNomeInput.value = p.lojaNome || "";
        lojaUrlInput.value = p.lojaUrl || "";
        precoTotalInput.value = p.precoTotal || "";

        // Preenche tipo, com fallback pra dados antigos
        if (tipoPresenteSelect) {
          let tipo = p.tipo;
          if (!tipo) {
            if (p.permiteCotas) tipo = "cotas";
            else if (p.lojaUrl) tipo = "online";
            else tipo = "livre";
          }
          tipoPresenteSelect.value = tipo;
        }

        atualizaVisibilidadeCotas();
        valorPorCotaInput.value = p.valorPorCota || "";
        qtdCotasTotalInput.value = p.qtdCotasTotal || "";

        btnCancelarEdicao.classList.remove("d-none");
      } catch (err) {
        console.error("Erro ao carregar presente para edição:", err);
      }
    }
  });
}

function mostrarStatusReset(mensagem, tipo = "info") {
  if (!resetarReservasStatus) return;
  resetarReservasStatus.textContent = mensagem;
  resetarReservasStatus.className = `alert alert-${tipo} py-2 small`;
}

async function resetarTodasAsReservas() {
  const user = auth.currentUser;
  if (!user || user.uid !== ADMIN_UID) {
    mostrarStatusReset("Faca login com o usuario admin antes de resetar.", "warning");
    return;
  }

  const confirmado = confirm(
    "Isso apagara todas as reservas e liberara todos os presentes novamente. Deseja continuar?"
  );
  if (!confirmado) return;

  btnResetarReservas.disabled = true;
  mostrarStatusReset("Resetando reservas...", "info");

  try {
    const [reservasSnapshot, presentesSnapshot] = await Promise.all([
      db.collection("reservas").get(),
      db.collection("presentes").get()
    ]);

    let batch = db.batch();
    let operacoesNoBatch = 0;
    const commits = [];

    const adicionarOperacao = (executar) => {
      executar(batch);
      operacoesNoBatch += 1;

      if (operacoesNoBatch === 450) {
        commits.push(batch.commit());
        batch = db.batch();
        operacoesNoBatch = 0;
      }
    };

    reservasSnapshot.forEach((doc) => {
      adicionarOperacao((batchAtual) => batchAtual.delete(doc.ref));
    });

    presentesSnapshot.forEach((doc) => {
      adicionarOperacao((batchAtual) => batchAtual.update(doc.ref, {
        qtdCotasReservadas: 0,
        status: "disponivel"
      }));
    });

    if (operacoesNoBatch > 0) {
      commits.push(batch.commit());
    }

    await Promise.all(commits);
    mostrarStatusReset(
      `Reset concluido: ${reservasSnapshot.size} reservas apagadas e ${presentesSnapshot.size} presentes liberados.`,
      "success"
    );
  } catch (err) {
    console.error("Erro ao resetar reservas:", err);
    mostrarStatusReset("Nao foi possivel resetar as reservas. Veja o console.", "danger");
  } finally {
    btnResetarReservas.disabled = false;
  }
}

if (btnResetarReservas) {
  btnResetarReservas.addEventListener("click", resetarTodasAsReservas);
}

// ======= LISTAGEM DE RESERVAS =======

function carregarReservas() {
  db.collection("reservas")
    .orderBy("criadoEm", "desc")
    .onSnapshot((snapshot) => {
      tabelaReservas.innerHTML = "";

      snapshot.forEach((doc) => {
        const r = doc.data();

        const tr = document.createElement("tr");

        const valorTexto = r.valorTotal
          ? "R$ " + Number(r.valorTotal).toFixed(2)
          : "—";

        const dataTexto = r.criadoEm && r.criadoEm.toDate
          ? r.criadoEm.toDate().toLocaleString("pt-BR")
          : "—";

        tr.append(
          criarCelula(r.tituloPresente || ""),
          criarCelula(r.nomeConvidado || ""),
          criarCelula(r.quantidadeCotas || 1),
          criarCelula(valorTexto),
          criarCelula(r.mensagem || ""),
          criarCelula(dataTexto)
        );

        tabelaReservas.appendChild(tr);
      });
    });
}
