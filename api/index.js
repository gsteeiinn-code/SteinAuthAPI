// Arquivo: api/index.js

/**
 * Endpoint de status/saúde para a URL base: /api
 * Retorna uma mensagem simples para confirmar que o serviço está online.
 */
module.exports = (req, res) => {
    // Definindo o código de status HTTP como 200 (OK)
    res.status(200).json({
        status: "Online",
        service: "Stein Auth API",
        version: "1.0",
        message: "A API está ativa e pronta para receber requisições nos endpoints específicos (ex: /api/login, /api/getInvites)."
    });
};
