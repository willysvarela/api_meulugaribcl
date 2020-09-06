const express = require("express");
const { PrismaClient } = require("@prisma/client");
const router = express.Router();
const prisma = new PrismaClient();

const CONSTANTS = require("./../constants");

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

router.post("/lugar/cancelar",  async(req, res) => {
  try{
    const id_pessoa = parseInt(req.body.id_pessoa);
    const id_evento = parseInt(req.body.id_evento);
    const result = await prisma.executeRaw(`update lugar set id_pessoa = null, nome_reservado = null, data_reserva = null, status = "D" where id_evento = ${id_evento} and id_pessoa = ${id_pessoa};`);
    console.log(result);
    res.json({updated: result});
  }catch(e){
    console.log(e.message);
    res.json({error: e.message});
  }
});

router.get("/lugar/evento/:id_evento", async (req, res) => {
  try {
    const id_evento = parseInt(req.params.id_evento);

    const evento = await prisma.evento.findOne({ where: { id: id_evento } });

    const lugares = await prisma.lugar.findMany({
      where: { id_evento: id_evento }
    });
    res.status(201).send({ evento, lugares });
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
    res
      .status(409)
      .send({ message: "Você já fez reservas no período disponível" });
  } else {
    let results = [];
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

router.post("/kids/reservar", async (req, res) => {
  const lugares = req.body.lugares;
  let results = [];
try{ 
    for (let lugar of lugares) {
      results.push(
        await prisma.lugar.create({
          data: {
            nome_reservado: lugar.nome_reservado,
            posicao: 'Kid',
            pessoa: {
              connect: {id: lugar.id_pessoa}
            },
            evento: {
              connect: {id: lugar.id_evento}
            },
            status: "R",
            data_reserva: new Date()
          }
        })
      );
    }
    const solvedPromises = Promise.all(results);
    res.send({ result: results });
  }catch(e){
    res
    .status(500)
    .send("Ocorreu um erro na reserva. Por favor tente novamente mais tarde" + e.code + ' - ' + e.meta.details);
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

const getEventoPorLugar = async (id_lugar) => {
  try {
    const evento = await prisma.lugar.findOne({
      where: { id: id_lugar },
      select: { evento: true }
    });
    return evento;
  } catch (e) {
    console.log(e.message);
    throw console.log(e.message);
  }
};

const checkEmailJaUtilizado = async (lugares) => {
  const id_pessoa = lugares[0].id_pessoa;
  const evento = await getEventoPorLugar(lugares[0].id);
  const data_atual = new Date(+evento.evento.data_evento);
  const data_duas_semanas_atras = new Date(+evento.evento.data_evento);
  data_duas_semanas_atras.setDate(data_duas_semanas_atras.getDate() - 14);
  //evento jovem
  if (evento.evento.tipoEvento === CONSTANTS.EVENTO_JOVEM) {
    /*const pessoa = await prisma.lugar.findMany({
      where: {
        pessoa: {
          id: {
            equals: id_pessoa
          }
        },
        evento: {
          tipoEvento: {
            equals: CONSTANTS.EVENTO_JOVEM
          },
          status: {
            equals: "D"
          }
        }
      }
    });*/
    return [];
  } else {
    //culto familiar
    const pessoa = await prisma.lugar.findMany({
      where: {
        pessoa: {
          id: {
            equals: id_pessoa
          }
        },
        evento: {
          tipoEvento: {
            equals: CONSTANTS.EVENTO_FAMILIAR
          },
          OR: [
            {
              status: {
                equals: "D"
              }
            },
            {
              AND: [
                {
                  data_evento: {
                    lt: data_atual
                  }
                },
                {
                  data_evento: {
                    gt: data_duas_semanas_atras
                  }
                }
              ]
            }
          ]
        }
      }
    });
    return pessoa;
  }
};

module.exports = router;
