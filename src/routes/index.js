const express = require("express");
const { PrismaClient } = require("@prisma/client");
const router = express.Router();

const prisma = new PrismaClient();

const ERROR = {
  GET_GENERIC_ERROR:
    "Ocorreu um erro na busca. Verifique os parâmetros e tente novamente"
};

router.get("/", (req, res) => {
  res.send({ message: "API Meu Lugar IBCL" });
});
//eventos
router.get("/evento", async (req, res) => {
  const eventos = await prisma.evento.findMany();
  res.json(eventos);
});

router.get("/evento/disponivel", async (req, res) => {
  const eventos = await prisma.evento.findMany({
    where: {
      status: "D"
    }
  });
  res.send(eventos);
});

router.get("/evento/detalhes/:id", async (req, res) => {
  try {
    const id_evento = parseInt(req.params.id);
    const result = await prisma.pessoa.findMany({
      include: { lugar: { where: { id_evento, status: "R" } } }
    });
    const pessoas = result.filter((pessoa) => pessoa.lugar.length > 0);
    const evento = await prisma.evento.findOne({
      where: { id: id_evento }
    });
    res.json({ evento, pessoas });
  } catch (e) {
    res.send({ error: e.message });
  }
});

router.get("/evento/:id", async (req, res) => {
  try {
    const evento = await prisma.evento.findOne({
      where: { id: parseInt(req.params.id) }
    });
    res.json(evento);
  } catch (e) {
    res.send({ error: e.message });
  }
});

//lugares
router.get("/lugar/evento/:id_evento", async (req, res) => {
  try {
    const id_evento = parseInt(req.params.id_evento);
    const lugares = await prisma.lugar.findMany({
      where: { id_evento: id_evento }
    });
    res.status(201).send(lugares);
  } catch (e) {
    res.status(401).send({ error: ERROR.GET_GENERIC_ERROR });
  }
});

//pessoas
router.post("/pessoa", async (req, res) => {
  try {
    const { nome, email, telefone, idade, categoria } = req.body;
    console.log(req.body);
    const result = await prisma.pessoa.upsert({
      where: { telefone: telefone },
      create: { nome, email, telefone, idade, categoria },
      update: { nome, email, telefone, idade, categoria }
    });
    res.send(result);
  } catch (e) {
    console.log(e);
    res.send({ error: e.message }).status(401);
  }
});

router.post("/pessoa/reservar", async (req, res) => {
  const lugares = req.body.lugares;

  const lugaresReservados = await checkReservados(lugares);
  const emailJaUtilizado = await checkEmailJaUtilizado(lugares);
  if (lugaresReservados.length > 0) {
    res
      .status(409)
      .send({ message: "As Cadeiras escolhidas já foram reservadas" });
  } else if (emailJaUtilizado.length > 0) {
    res.status(409).send({ message: "Você já fez reservas essa semana" });
  } else {
    let results = [];
    console.log("oi", lugares);
    for (let lugar of lugares) {
      results.push(
        await prisma.lugar.update({
          where: { id: lugar.id },
          data: {
            nome_reservado: lugar.nome_reservado,
            pessoa: { connect: { id: lugar.id_pessoa } },
            status: "R",
            data_reserva: new Date()
          }
        })
      );
    }
    const solvedPromises = Promise.all(results);
    res.send({ result: results });
  }
});

const checkReservados = async (lugares) => {
  const lugares_ids = lugares.map((lugar) => lugar.id);

  const lugares_database = await prisma.lugar.findMany();

  return lugares_database.filter(
    (lugar_db) =>
      lugar_db.id === lugares_ids.filter((lugar) => lugar === lugar_db.id)[0] &&
      lugar_db.status === "R"
  );
};

router.get("/dev/teste/:id", async (req, res) => {
  console.log(req.params.id);
  const id_pessoa = parseInt(req.params.id); //lugares[0].id_pessoa;

  const pessoa = await prisma.lugar.findMany({
    where: {
      pessoa: {
        id: {
          equals: id_pessoa
        }
      },
      evento: {
        status: {
          equals: "D"
        }
      }
    }
  });
  res.send(pessoa);
});

const checkEmailJaUtilizado = async (lugares) => {
  const id_pessoa = lugares[0].id_pessoa;

  const pessoa = await prisma.lugar.findMany({
    where: {
      pessoa: {
        id: {
          equals: id_pessoa
        }
      },
      evento: {
        status: {
          equals: "D"
        }
      }
    }
  });
  return pessoa;
};

module.exports = router;
