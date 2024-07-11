const express = require("express");
const app = express();

// Importa las funciones para conectar y desconectar a MongoDB desde un archivo local.
const { connectToMongoDB, disconnectToMongoDB } = require("./src/mongodb");

// Middleware que establece el encabezado de respuesta para indicar que el contenido es JSON con codificación UTF-8.
app.use((req, res, next) => {
  res.header("Content-Type", "application/json; charset=utf-8");
  next();
});

app.use(express.json());

//ruta de inicio
app.get("/", (req, res) => {
  res.status(200).end("inicio del local ");
});

//----------------------------------------------------

//ruta para obtener todos los productos
app.get("/prendas", async (req, res) => {
  const client = await connectToMongoDB();
  if (!client) {
    res.status(500).send("Error client"); //manejo de errores del servidor
    return;
  }

  const db = client.db("sample_mflix");
  const prenda = await db.collection("prendas").find().toArray();

  await disconnectToMongoDB();

  res.json(prenda);
});

//Ruta que usaria para mostarar todas las prendas 
//EJEMPLO = /prendas

//-------------------------------------------------------

//ruta para obtener un producto
app.get("/prendas/:id", async (req, res) => {
  const prendaId = parseInt(req.params.id) || 0;
  const client = await connectToMongoDB();
  if (!client) {
    res.status(500).send("Error client"); //manejo de error del servidor
    return;
  }
  const db = client.db("sample_mflix");
  const prenda = await db.collection("prendas").findOne({ id: prendaId });

  await disconnectToMongoDB();

  !prenda ? res.status(404).send("No existe esa prenda") : res.json(prenda); //envia la lista de prendas en formato JSON
}); //manejo de error del cliente

//Ruta que usaria para buscar una prenda por su ID = /prendas/:id
//EJEMPLO = /prendas/22


//----------------------------------------------------

//ruta para filtrar productos por su nombre
app.get("/prendas/nombre/:nombre", async (req, res) => {
  const nombrePrenda = req.params.nombre || "";
  let client;
  try {
    client = await connectToMongoDB();
    if (!client) {
      res.status(500).send("Error al conectarse a MongoDB");
      return;
    }
    const db = client.db("sample_mflix");
    const prendas = await db
      .collection("prendas")
      .find({ nombre: { $regex: nombrePrenda, $options: "i" } })
      .toArray();

    if (prendas.length === 0) {
      res
        .status(404)
        .send(
          "No se encontraron prendas que coincidan con el nombre proporcionado"
        );
    } else {
      res.json(prendas);
    }
  } catch (error) {
    console.error("Error al obtener las prendas:", error);
    res.status(500).send("Error interno del servidor");
  } finally {
    if (client) {
      await disconnectToMongoDB();
    }
  }
});
// Ruta que usaria para buscar una prenda por su NOMBRE = /prendas/nombre/:nombre
//      EJEMPLO = /prendas/nombre/camiseta

//--------------------------------------------------

//agregar un nuevo producto
app.post("/prendas", async (req, res) => {
  const nuevaPrenda = req.body;

  if (Object.keys(nuevaPrenda).length === 0) {
    res.status(422).send("error en el formato de los datos");
  }

  const client = await connectToMongoDB();
  if (!client) {
    res.status(500).send("Error client");
    return;
  }

  const collection = client.db("sample_mflix").collection("prendas");
  collection
    .insertOne(nuevaPrenda)
    .then((response) => res.status(201).json(nuevaPrenda))
    .catch((error) => res.status(500).send("error al crear el registro"))
    .finally(async () => {
      await disconnectToMongoDB;
    });
}); //producto creado id : 36, 100,101,99,107


// dato que enviaria en el body usando POST y utilizando POSTMAN
// RUTA =========== http://localhost:3008/prendas

//si quiere crear un nuevo dato, creelo, aqui le dejo un ejemplo de como hacerlo
// {
//   "id": 2000,
//   "nombre": "remera  de tp untref backend",
//  "importe": 20000,
//   "stock": 30,
//   "categoria": "Ropa"
// }

//--------------------------------------------------------------------

//modificar el precio (importe) de un producto
//actualiza un producto parcialmente
app.patch("/prendas/:id", async (req, res) => {
  const id = parseInt(req.params.id) || 0;
  const { importe } = req.body;
  if (importe === undefined) {
    res
      .status(422)
      .send("error en el formato de los datos: falta el campo 'importe'");
    return;
  }
  const client = await connectToMongoDB();
  if (!client) {
    res.status(500).send("Error client");
    return;
  }
  try {
    const collection = client.db("sample_mflix").collection("prendas");
    const result = await collection.updateOne({ id }, { $set: { importe } });
    if (result.matchedCount === 0) {
      res.status(404).send("No existe esa prenda");
    } else {
      res.status(200).json({ id, importe });
    }
  } catch (error) {
    res.status(500).send("Error al actualizar el registro");
  } finally {
    await disconnectToMongoDB();
  }
});

// dato que enviara en el body usando PATCH utilizando POSTMAN
// RUTA =========== http://localhost:3008/prendas/136
// {
//   "id": 136,
//   "importe": 244
// }


//-------------------------------------------------------

//rutas inexistentes
app.use((req, res, next) => {
  res.status(404).send("no existe esa ruta");
});

const PORT = process.env.PORT || 3008;

app.listen(PORT, () => console.log(`http://localhost:${PORT}`));