<?php
header("Content-Type: application/json");

// ==========================
// CONFIGURAÇÕES
// ==========================
$ADMIN_PASSWORD = "Stein23912387aaaas";
$INVITES_FILE = "invites.txt";
$USERS_FILE = "users.json";

// Criar arquivos caso não existam
if (!file_exists($INVITES_FILE)) {
    file_put_contents($INVITES_FILE, "");
}

if (!file_exists($USERS_FILE)) {
    file_put_contents($USERS_FILE, json_encode([]));
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
    header("Content-Type: text/plain");
    
    $user = $_GET["user"] ?? "";
    $pass = $_GET["pass"] ?? "";
    
    // Validar dados
    if (empty($user) || empty($pass)) {
        echo "INVALID_DATA";
        exit;
    }
    
    $users = loadUsers();
    
    // Verificar se usuário existe e senha está correta
    if (isset($users[$user]) && $users[$user]['password'] === $pass) {
        // Atualizar último login
        $users[$user]['lastLogin'] = date('Y-m-d H:i:s');
        saveUsers($users);
        
        echo "OK";
    } else {
        echo "INVALID_CREDENTIALS";
    }
    exit;
}

// ==========================
// 5. Criar conta de usuário
// ==========================
// GET -> /api/create?user=XXX&pass=XXX
if (isset($_GET["user"]) && isset($_GET["pass"]) && strpos($_SERVER['REQUEST_URI'], '/api/create') !== false) {
    header("Content-Type: text/plain");
    
    $user = $_GET["user"] ?? "";
    $pass = $_GET["pass"] ?? "";
    
    // Validar dados
    if (empty($user) || empty($pass)) {
        echo "MISSING_DATA";
        exit;
    }
    
    if (strlen($user) < 3 || strlen($pass) < 3) {
        echo "INVALID_LENGTH";
        exit;
    }
    
    $users = loadUsers();
    
    // Verificar se usuário já existe
    if (isset($users[$user])) {
        echo "USER_EXISTS";
        exit;
    }
    
    // Criar novo usuário
    $users[$user] = [
        'password' => $pass,
        'createdAt' => date('Y-m-d H:i:s'),
        'lastLogin' => null
    ];
    
    // Salvar usuários
    if (saveUsers($users)) {
        echo "CREATED";
    } else {
        echo "SAVE_ERROR";
    }
    exit;
}

// ==========================
// 6. Status da API
// ==========================
// GET -> /api/status
if (strpos($_SERVER['REQUEST_URI'], '/api/status') !== false) {
    $users = loadUsers();
    $invites = getInvites($INVITES_FILE);
    
    echo json_encode([
        "status" => "online",
        "total_users" => count($users),
        "total_invites" => count($invites),
        "version" => "2.0.0"
    ]);
    exit;
}

// ==========================
// 7. Listar usuários (ADMIN)
// ==========================
// GET -> /api/admin/users?pass=SENHA
if (strpos($_SERVER['REQUEST_URI'], '/api/admin/users') !== false) {
    $pass = $_GET["pass"] ?? "";
    
    if ($pass !== $ADMIN_PASSWORD) {
        echo json_encode(["error" => "Acesso negado"]);
        exit;
    }
    
    $users = loadUsers();
    echo json_encode([
        "total_users" => count($users),
        "users" => $users
    ]);
    exit;
}

// ==========================
// Resposta padrão
// ==========================
echo json_encode([
    "status" => "Stein Auth API Online",
    "version" => "2.0.0",
    "routes" => [
        "/?action=check&invite=XXXX",
        "/?action=create&pass=SENHA&qtd=5",
        "/?action=consume&invite=XXXX",
        "/api/login?user=XXX&pass=XXX",
        "/api/create?user=XXX&pass=XXX",
        "/api/status",
        "/api/admin/users?pass=SENHA"
    ]
]);
exit;
?>
