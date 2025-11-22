<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

// ==========================
// CONFIGURAÇÕES
// ==========================
$ADMIN_PASSWORD = "Stein23912387aaaas";
$INVITES_FILE = "invites.txt";
$USERS_FILE = "users.json";
$USED_INVITES_FILE = "used_invites.txt";

// Criar arquivos caso não existam
if (!file_exists($INVITES_FILE)) {
    file_put_contents($INVITES_FILE, "rcp2c7e5phd7a6jb8\n");
}

if (!file_exists($USERS_FILE)) {
    file_put_contents($USERS_FILE, json_encode([]));
}

if (!file_exists($USED_INVITES_FILE)) {
    file_put_contents($USED_INVITES_FILE, "");
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

// Ler invites ativos
function getInvites($file) {
    if (!file_exists($file)) return [];
    $lines = file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    return $lines;
}

// Ler invites usados
function getUsedInvites($file) {
    if (!file_exists($file)) return [];
    $lines = file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    return $lines;
}

// Salvar novo invite
function addInvite($file, $invite) {
    file_put_contents($file, $invite . PHP_EOL, FILE_APPEND);
}

// Registrar invite como usado
function markInviteAsUsed($file, $invite) {
    file_put_contents($file, $invite . PHP_EOL, FILE_APPEND);
}

// Remover um invite dos ativos e marcar como usado
function consumeInvite($inviteFile, $usedFile, $inviteToRemove) {
    $invites = getInvites($inviteFile);
    $new = [];
    $found = false;
    
    foreach ($invites as $inv) {
        if (trim($inv) === trim($inviteToRemove)) {
            $found = true;
            // Marcar como usado
            markInviteAsUsed($usedFile, $inviteToRemove);
        } else {
            $new[] = $inv;
        }
    }
    
    if ($found) {
        file_put_contents($inviteFile, implode(PHP_EOL, $new));
        return true;
    }
    return false;
}

// Carregar usuários
function loadUsers() {
    global $USERS_FILE;
    if (!file_exists($USERS_FILE)) {
        file_put_contents($USERS_FILE, json_encode([]));
        return [];
    }
    $data = file_get_contents($USERS_FILE);
    $users = json_decode($data, true);
    return is_array($users) ? $users : [];
}

// Salvar usuários
function saveUsers($users) {
    global $USERS_FILE;
    return file_put_contents($USERS_FILE, json_encode($users, JSON_PRETTY_PRINT));
}

// ==========================
// ROTAS DA API
// ==========================

// Rota principal - Status
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $_SERVER['REQUEST_URI'] === '/') {
    $users = loadUsers();
    $invites = getInvites($INVITES_FILE);
    $usedInvites = getUsedInvites($USED_INVITES_FILE);
    
    echo json_encode([
        "status" => "online",
        "message" => "Stein Auth API - InfinityFree",
        "total_users" => count($users),
        "active_invites" => count($invites),
        "used_invites" => count($usedInvites),
        "version" => "4.0.0"
    ]);
    exit;
}

// Verificar invite
if (isset($_GET["action"]) && $_GET["action"] === "check") {
    $invite = trim($_GET["invite"] ?? "");
    $invites = getInvites($INVITES_FILE);
    $usedInvites = getUsedInvites($USED_INVITES_FILE);

    if (in_array($invite, $usedInvites)) {
        echo json_encode(["status" => "used"]);
        exit;
    }
    
    if (in_array($invite, $invites)) {
        echo json_encode(["status" => "valid"]);
    } else {
        echo json_encode(["status" => "invalid"]);
    }
    exit;
}

// Consumir invite
if (isset($_GET["action"]) && $_GET["action"] === "consume") {
    $invite = trim($_GET["invite"] ?? "");
    $invites = getInvites($INVITES_FILE);
    $usedInvites = getUsedInvites($USED_INVITES_FILE);

    if (in_array($invite, $usedInvites)) {
        echo json_encode(["status" => "already_used"]);
        exit;
    }
    
    if (!in_array($invite, $invites)) {
        echo json_encode(["status" => "invalid"]);
        exit;
    }

    if (consumeInvite($INVITES_FILE, $USED_INVITES_FILE, $invite)) {
        echo json_encode(["status" => "used"]);
    } else {
        echo json_encode(["status" => "error"]);
    }
    exit;
}

// Login de usuário
if (isset($_GET["user"]) && isset($_GET["pass"])) {
    header("Content-Type: text/plain");
    
    $user = trim($_GET["user"] ?? "");
    $pass = trim($_GET["pass"] ?? "");
    
    if (empty($user) || empty($pass)) {
        echo "INVALID_DATA";
        exit;
    }
    
    $users = loadUsers();
    
    if (isset($users[$user]) && $users[$user]['password'] === $pass) {
        $users[$user]['lastLogin'] = date('Y-m-d H:i:s');
        saveUsers($users);
        echo "OK";
    } else {
        echo "INVALID_CREDENTIALS";
    }
    exit;
}

// Criar conta de usuário
if (isset($_GET["user"]) && isset($_GET["pass"])) {
    header("Content-Type: text/plain");
    
    $user = trim($_GET["user"] ?? "");
    $pass = trim($_GET["pass"] ?? "");
    
    if (empty($user) || empty($pass)) {
        echo "MISSING_DATA";
        exit;
    }
    
    if (strlen($user) < 3 || strlen($pass) < 3) {
        echo "INVALID_LENGTH";
        exit;
    }
    
    $users = loadUsers();
    
    if (isset($users[$user])) {
        echo "USER_EXISTS";
        exit;
    }
    
    $users[$user] = [
        'password' => $pass,
        'createdAt' => date('Y-m-d H:i:s'),
        'lastLogin' => null
    ];
    
    if (saveUsers($users)) {
        echo "CREATED";
    } else {
        echo "SAVE_ERROR";
    }
    exit;
}

// Resposta padrão
echo json_encode([
    "status" => "Stein Auth API Online - InfinityFree",
    "version" => "4.0.0",
    "routes" => [
        "GET /",
        "GET /?action=check&invite=CODE",
        "GET /?action=consume&invite=CODE", 
        "GET /?user=USER&pass=PASS (login)",
        "GET /?user=USER&pass=PASS (create)"
    ]
]);
?>
