<?php
header("Content-Type: application/json");

// ==========================
// CONFIGURAÇÕES
// ==========================
$ADMIN_PASSWORD = "Stein23912387aaaas";
$INVITES_FILE = "invites.txt";

// Criar arquivo caso não exista
if (!file_exists($INVITES_FILE)) {
    file_put_contents($INVITES_FILE, "");
}

// ==========================
// FUNÇÕES
// ==========================

// Gerar invites aleatórios (10 caracteres)
function gerarInvite() {
    $chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    $invite = "";
    for ($i = 0; $i < 10; $i++) {
        $invite .= $chars[random_int(0, strlen($chars) - 1)];
    }
    return $invite;
}

// Ler invites
function getInvites($file) {
    if (!file_exists($file)) return [];
    $lines = file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    return $lines;
}

// Salvar novo invite
function addInvite($file, $invite) {
    file_put_contents($file, $invite . PHP_EOL, FILE_APPEND);
}

// Remover um invite (quando for usado)
function removeInvite($file, $inviteToRemove) {
    $invites = getInvites($file);
    $new = [];
    foreach ($invites as $inv) {
        if (trim($inv) !== trim($inviteToRemove)) {
            $new[] = $inv;
        }
    }
    file_put_contents($file, implode(PHP_EOL, $new));
}

// ==========================
// ROTAS DA API
// ==========================

// ==========================
// 1. Verificar se invite existe
// ==========================
// GET -> ?action=check&invite=XXXXX
if (isset($_GET["action"]) && $_GET["action"] === "check") {
    $invite = $_GET["invite"] ?? "";
    $invites = getInvites($INVITES_FILE);

    if (in_array($invite, $invites)) {
        echo json_encode(["status" => "valid"]);
    } else {
        echo json_encode(["status" => "invalid"]);
    }
    exit;
}

// ==========================
// 2. Criar invites (ADMIN)
// ==========================
// POST -> ?action=create&pass=SENHA&qtd=5
if (isset($_GET["action"]) && $_GET["action"] === "create") {

    $pass = $_GET["pass"] ?? "";
    $qtd  = intval($_GET["qtd"] ?? 1);

    if ($pass !== $ADMIN_PASSWORD) {
        echo json_encode(["error" => "Senha admin incorreta"]);
        exit;
    }

    $gerados = [];

    for ($i = 0; $i < $qtd; $i++) {
        $invite = gerarInvite();
        addInvite($INVITES_FILE, $invite);
        $gerados[] = $invite;
    }

    echo json_encode([
        "status" => "success",
        "invites" => $gerados
    ]);

    exit;
}

// ==========================
// 3. Consumir invite (quando usuário usou)
// ==========================
// POST -> ?action=consume&invite=XXXXX
if (isset($_GET["action"]) && $_GET["action"] === "consume") {

    $invite = $_GET["invite"] ?? "";
    $invites = getInvites($INVITES_FILE);

    if (!in_array($invite, $invites)) {
        echo json_encode(["status" => "invalid"]);
        exit;
    }

    removeInvite($INVITES_FILE, $invite);

    echo json_encode(["status" => "used"]);
    exit;
}

// ==========================
// 4. Login de usuário
// ==========================
// GET -> /api/login?user=XXX&pass=XXX
if (isset($_GET["user"]) && isset($_GET["pass"]) && strpos($_SERVER['REQUEST_URI'], '/api/login') !== false) {
    // Para funcionar com seu aplicativo Batch, precisa retornar texto simples
    header("Content-Type: text/plain");
    echo "OK";
    exit;
}

// ==========================
// 5. Criar conta de usuário
// ==========================
// GET -> /api/create?user=XXX&pass=XXX
if (isset($_GET["user"]) && isset($_GET["pass"]) && strpos($_SERVER['REQUEST_URI'], '/api/create') !== false) {
    // Para funcionar com seu aplicativo Batch, precisa retornar texto simples
    header("Content-Type: text/plain");
    echo "CREATED";
    exit;
}

// ==========================
// Resposta padrão
// ==========================
echo json_encode([
    "error" => "Rota inválida",
    "routes" => [
        "/?action=check&invite=XXXX",
        "/?action=create&pass=SENHA&qtd=5",
        "/?action=consume&invite=XXXX",
        "/api/login?user=XXX&pass=XXX",
        "/api/create?user=XXX&pass=XXX"
    ]
]);
exit;
?>
