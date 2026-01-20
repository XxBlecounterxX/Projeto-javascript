const express = require('express');
const bcrypt = require('bcryptjs');

module.exports = (db) => {
  const router = express.Router();

  // REGISTRO
  router.post('/register', async (req, res) => {
    const { email, password } = req.body;

    // Validação
    if (!email || !password) {
      return res.status(400).json({ 
        sucesso: false,
        mensagem: 'Email e senha são obrigatórios' 
      });
    }

    if (!email.includes('@gmail.com')) {
      return res.status(400).json({ 
        sucesso: false,
        mensagem: 'Use um email Gmail válido' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        sucesso: false,
        mensagem: 'Senha deve ter no mínimo 6 caracteres' 
      });
    }

    try {
      // Verificar se email já existe
      db.get('SELECT * FROM usuarios WHERE email = ?', [email], async (err, row) => {
        if (err) {
          return res.status(500).json({ 
            sucesso: false,
            mensagem: 'Erro no servidor' 
          });
        }

        if (row) {
          return res.status(400).json({ 
            sucesso: false,
            mensagem: 'Email já registrado' 
          });
        }

        // Hash da senha
        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(password, salt);

        // Inserir usuário
        db.run(
          'INSERT INTO usuarios (email, senha) VALUES (?, ?)',
          [email, senhaHash],
          function(err) {
            if (err) {
              return res.status(500).json({ 
                sucesso: false,
                mensagem: 'Erro ao registrar usuário' 
              });
            }

            res.status(201).json({
              sucesso: true,
              mensagem: 'Conta criada com sucesso!',
              usuario: {
                id: this.lastID,
                email: email
              }
            });
          }
        );
      });
    } catch (erro) {
      res.status(500).json({ 
        sucesso: false,
        mensagem: 'Erro no servidor' 
      });
    }
  });

  // LOGIN
  router.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Validação
    if (!email || !password) {
      return res.status(400).json({ 
        sucesso: false,
        mensagem: 'Email e senha são obrigatórios' 
      });
    }

    // Buscar usuário
    db.get('SELECT * FROM usuarios WHERE email = ?', [email], async (err, usuario) => {
      if (err) {
        return res.status(500).json({ 
          sucesso: false,
          mensagem: 'Erro no servidor' 
        });
      }

      if (!usuario) {
        return res.status(401).json({ 
          sucesso: false,
          mensagem: 'Email não encontrado' 
        });
      }

      // Verificar senha
      const senhaValida = await bcrypt.compare(password, usuario.senha);
      
      if (!senhaValida) {
        return res.status(401).json({ 
          sucesso: false,
          mensagem: 'Senha incorreta' 
        });
      }

      res.json({
        sucesso: true,
        mensagem: 'Login realizado com sucesso!',
        usuario: {
          id: usuario.id,
          email: usuario.email
        }
      });
    });
  });

  return router;
};