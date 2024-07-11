# Documentacion sobre el trabajo integrador

El trabajo integrador 100% funcional deberá ser presentado el 30 de julio de 2024.

### consignas a desarrollar

- [x] Ruta de inicio .
- [x] Ruta para obtener todos los productos.
- [x] obtener un producto por su **ID**.
- [x] filtrar un producto por la busqueda de su **NOMBRE**.
- [x] agregar un producto son **POST**.
- [x] modificar el precio de un producto con **PATCH**.
- [x] control de **ERRORES**.
- [x] conexion a **mongoDB** en la carpeta **src**.**(arcivo mongodb.js)**
  ### codigo de cada consigna

  __-RUTA DE INICIO__

__codigo__

  ```javascript
  app.get("/", (req, res) => {
  res.status(200).end("inicio del local ")
  })
  ```

  //---------------------

-__Ruta para obtener todos los productos__

__/prendas__ en el buscador

__codigo__

```javascript
app.get("/prendas", async (req, res) => {
  const client = await connectToMongoDB();
  if (!client) {
    res.status(500).send("Error client");//manejo de errores del servidor
    return;
  }

  const db = client.db("sample_mflix");
  const prenda = await db.collection("prendas").find().toArray();

  await disconnectToMongoDB();

  res.json(prenda);
});
```
__Ruta que usaria para mostarar todas las prendas__ 

EJEMPLO = /prendas

//-----------------------------


__-obtener un producto por su id__

__/prendas/id__ en el buscador ej =  __/prendas/22__

__codigo__

```javascript
app.get("/prendas/:id", async (req, res) => {
  const prendaId = parseInt(req.params.id) || 0;
  const client = await connectToMongoDB();
  if (!client) {
    res.status(500).send("Error client");//manejo de error del servidor
    return;
  }
  const db = client.db("sample_mflix");
  const prenda = await db.collection("prendas").findOne({ id: prendaId });

  await disconnectToMongoDB();

  !prenda ? res.status(404).send("No existe esa prenda") : res.json(prenda);//envia la lista de prendas en formato JSON
});             //manejo de error del cliente
```
__Ruta que usaria para buscar una prenda por su ID__


//-----------------------


__-Ruta para filtrar un producto por la busqueda de su nombre.__

__/prendas/nombre/:nombre__ en el buscador, EJ = __prendas/nombre/camiseta__

__codigo__

```javascript
app.get('/prendas/nombre/:nombre', async (req, res) => {
  const nombrePrenda = req.params.nombre || '';
  let client;
  try {
    client = await connectToMongoDB();
    if (!client) {
      res.status(500).send('Error al conectarse a MongoDB');
      return;
    }
    const db = client.db("sample_mflix");
    const prendas = await db.collection("prendas").find({ nombre: { $regex: nombrePrenda, $options: 'i' } }).toArray();

    if (prendas.length === 0) {
      res.status(404).send('No se encontraron prendas que coincidan con el nombre proporcionado');
    } else {
      res.json(prendas);
    }
  } catch (error) {
    console.error('Error al obtener las prendas:', error);
    res.status(500).send('Error interno del servidor');
  } finally {
    if (client) {
      await disconnectToMongoDB();
    }
  }
});
```
__Ruta que usaria para buscar una prenda por su NOMBRE 

//----------------


__-agregar un producto con post__

__codigo__

```javascript
app.post("/prendas", async (req, res) => {
  const nuevaPrenda = req.body

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
});
```

__dato que enviaria en el body usando POST y utilizando POSTMAN__

RUTA =
http://localhost:3008/prendas


__BODY__

{

  "id": 136,
  
  "nombre": "remera nueva",
  
  "importe": 20000,
  
  "stock": 30,
  
  "categoria": "Ropa"

}

__crea el producto que desees, pero utilizando los parametros indicados arriba__

//----------------------

__-modificar el precio (importe) de un producto con patch__
```javascript
app.patch("/prendas/:id", async (req, res) => {
  const id = parseInt(req.params.id) || 0;
  const { importe } = req.body;
  if (importe === undefined) {
    res.status(422).send("error en el formato de los datos: falta el campo 'importe'");
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
```
__dato que enviara en el body usando PATCH utilizando POSTMAN__

RUTA= 
http://localhost:3008/prendas/136

__BODY__

{

  "id": 136,
  
  "importe": 244
  
}

__cambias el importe por el que desees PERO.... utilizando los parametros indicados__

//--------------------------------------------------

__-rutas inexistentes__ 

__si hay alguna ruta inexistente se utiliza el siguiente codigo__

__codigo__

```javascript
app.use((req, res, next) => {
  res.status(404).send("no existe esa ruta");
});
```
__-conexion a mongoDB ..... carpeta src , archivo mongodb.js__ (src/mongodb.js)

__codigo__

```javascript
require("dotenv").config();

const { MongoClient } = require("mongodb");

const URI = process.env.MONGODB_URI;

const client = new MongoClient(URI);

const connectToMongoDB = async () => {
  try {
    await client.connect();
    return client;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const disconnectToMongoDB = async () => {
  try {
    await client.close();
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  connectToMongoDB,
  disconnectToMongoDB,
};
```

  
 __index.js__ = __Entry Point__

el archivo __JSON__ utilizado esta en el __Cluster de mongoDB__, en la base de datos __sample_mflix__ y es la coleccion __prendas__
-este archivo __JSON__ tiene como parametros:
__id, nombre , importe(precio),categoria.__

-la conexion al __puerto__ y a la cuenta del __cluster de mongoDB__ deberia estar en el archivo __.env__

__-dependencias utilizadas :__
-nodemon
-express
-dotenv
-mongodb

## instalacion 
para instalar node_modules
```shell
npm i 
```
//-----------------------------


```shell
npm install express dotenv mongodb
```

```shell
npm install nodemon -D
```  
