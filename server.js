const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Inicializar banco de dados SQLite
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
  } else {
    console.log('✅ Conectado ao SQLite');
    criarTabelas();
  }
});

// Criar tabelas
function criarTabelas() {
  // Tabela de usuários
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      senha TEXT NOT NULL,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('❌ Erro ao criar tabela usuarios:', err);
    } else {
      console.log('✅ Tabela usuarios criada');
    }
  });

  // Tabela de pedidos
  db.run(`
    CREATE TABLE IF NOT EXISTS pedidos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero_pedido TEXT NOT NULL UNIQUE,
      usuario_email TEXT NOT NULL,
      itens_json TEXT NOT NULL,
      total REAL NOT NULL,
      status TEXT DEFAULT 'pendente',
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('❌ Erro ao criar tabela pedidos:', err);
    } else {
      console.log('✅ Tabela pedidos criada');
    }
  });
}

// ROTAS DE AUTENTICAÇÃO

// REGISTRO
app.post('/api/auth/register', async (req, res) => {
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
app.post('/api/auth/login', (req, res) => {
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

// CRIAR PEDIDO
app.post('/api/pedidos/criar', (req, res) => {
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

// Rota de teste
app.get('/', (req, res) => {
  res.json({ 
    mensagem: '🚴 Servidor Pedalaria rodando!',
    rotas: {
      login: 'POST /api/auth/login',
      registro: 'POST /api/auth/register',
      pedidos: 'POST /api/pedidos/criar'
    }
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});