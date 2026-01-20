const express = require('express');

module.exports = (db) => {
  const router = express.Router();

  // CRIAR PEDIDO
  router.post('/criar', (req, res) => {
    const { usuario_email, itens, total } = req.body;

    if (!usuario_email || !itens || !total) {
      return res.status(400).json({ 
        sucesso: false,
        mensagem: 'Dados incompletos' 
      });
    }

    const numeroPedido = 'PED-' + Date.now();

    db.run(
      `INSERT INTO pedidos (numero_pedido, usuario_email, itens_json, total) 
       VALUES (?, ?, ?, ?)`,
      [numeroPedido, usuario_email, JSON.stringify(itens), total],
      function(err) {
        if (err) {
          return res.status(500).json({ 
            sucesso: false,
            mensagem: 'Erro ao criar pedido' 
          });
        }

        res.status(201).json({
          sucesso: true,
          mensagem: 'Pedido criado com sucesso!',
          pedido: {
            id: this.lastID,
            numero: numeroPedido,
            total: total
          }
        });
      }
    );
  });

  // LISTAR PEDIDOS DO USUÁRIO
  router.get('/usuario/:email', (req, res) => {
    const { email } = req.params;

    db.all(
      'SELECT * FROM pedidos WHERE usuario_email = ? ORDER BY criado_em DESC',
      [email],
      (err, pedidos) => {
        if (err) {
          return res.status(500).json({ 
            sucesso: false,
            mensagem: 'Erro ao buscar pedidos' 
          });
        }

        // Converter JSON dos itens
        const pedidosFormatados = pedidos.map(pedido => ({
          ...pedido,
          itens: JSON.parse(pedido.itens_json)
        }));

        res.json({
          sucesso: true,
          pedidos: pedidosFormatados
        });
      }
    );
  });

  return router;
};