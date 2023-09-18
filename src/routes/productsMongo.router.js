import { Router } from "express";

import productsMongoModel from "../dao/models/productsMongo.models.js";

import productsMongoData from "../db/productsMongo.js";
import ProductMongoManager from "../dao/managers/productMongo.manager.js";

class ProductsMongoRoutes {//no es un Router pero adentro tiene uno
  path = "/products";
  router = Router();
  productMongoManager = new ProductMongoManager();

  constructor() {
    this.initProductsMongoRoutes();
  }

  initProductsMongoRoutes() {
    //******este bloque se utilizo una sola vez para insertar bastantes productos que teniamos  ya ****
    // this.router.get(`${this.path}/insertion`, async (req, res) => {
    //   try {
    //     const products = await productsMongoModel.insertMany(productsMongoData);
    //     // TODO: agregar validaciones

    //     return res.json({
    //       message: "productsMongo insert successfully",
    //       productsMongoInserted: productsMongoData,
    //     });
    //   } catch (error) {
    //     console.log(
    //       "🚀 ~ file: productsMongo.routes.js:25 ~ ProductsMongoRoutes ~ this.router.get ~ error:",
    //       error
    //     );    
    //   }
    // });
    //******este bloque se utilizo una sola vez para insertar bastantes productos que teniamos  ya ****
    
    //**********************Obtener todos los productos en un JSON**************************** */
    //*************************************************************************************** */
    this.router.get(`${this.path}`, async (req, res) => {
      try {
        // TODO: agregar validaciones
        const productsMongoArr = await this.productMongoManager.getAllProductsMongo();
        return res.json({
          message: `get all products succesfully`,
          productsMongoLists: productsMongoArr,
          productsMongoAmount: productsMongoArr.length,
        });
      } catch (error) {
        console.log(
          "🚀 ~ file: productsMongo.routes.js:44 ~ ProductsMongoRoutes ~ this.router.get ~ error:",
          error
        );
      }
    });

    //**********************Obtener un producto por su pid******************************* */
    //*********************************************************************************** */
    this.router.get(`${this.path}/:pid`, async (req, res) => {
      try {
        const { pid } = req.params;
        const productMongoDetail = await this.productMongoManager.getProductMongoById(
          pid
        );
        // TODO: AGREGAR VALIDACION

        return res.json({
          message: `get productMongo info of ${pid} succesfully`,
          productMongo: productMongoDetail,
        });
      } catch (error) {
        console.log(
          "🚀 ~ file: productMongo.routes.js:60 ~ ProductsMongoRoutes ~ this.router.get ~ error:",
          error
        );
      }
    });

    //*******Crear  un producto pasando sus popiedade (clave:valor por el body desde postman********** */
    //*********************************************************************************** */
    this.router.post(`${this.path}`, async (req, res) => {
      try {
        // TODO: HACER VALIDACIONES DEL BODY
        const productMongoBody = req.body;

        // TODO REVISANDO SI EL producto YA FUE CREADO ANTERIOMENTE
        const newProductMongo = await this.productMongoManager.createProductMongo(productMongoBody);
        if (!newProductMongo) {
          // return res.json({
          //   message: `the productMongo with code ${productMongoBody.code} is already register`,
          // });
        }//se cambio por throw,

        return res.status(201).json({
          message: `productMongo created successfully`,
          productMongo: newProductMongo,
        });
      } catch (error) {
        console.log(
          "🚀 ~ file: productsMongo.routes.js:79 ~ ProductsMongoRoutes ~ this.router.post ~ error:",
          error
        );
        //recibe tambiem el catch de createProductMongo
         return res.status(400).json({
            message: error.message ?? error            
          });
      }
    });
//**************Ejemplo de aggregate ORDENAR PRODUCTOS **************************
//************que tienen description:"Desde body con postman" y *****************
//************coincidan con title:title*******************************************
//*************agrupar por CODE y sordenar POR CODE  " ***************************
    this.router.get(`${this.path}/order/:title`, async (req, res) => {
      try {
        const {title}=req.params;
        console.log(title)
        let result = await productsMongoModel.aggregate([
          {
            $match: {description: "Desde Body con postman"}
          },
          {
             $match: {title: `${title}` }

          },
          {
            $group: {_id: "$code", products : {$push :  "$$ROOT"} }
          },
          {
            $sort: {_id:-1}

          }

        ]);
        // TODO: AGREGAR VALIDACION

        return res.json({
          message: `get productMongo order by code succesfully`,
          productsMongo: result,
        });
      } catch (error) {
        console.log(
          "🚀 ~ file: productMongo.routes.js:117 ~ ProductsMongoRoutes ~ this.router.get ~ error:",
          error
        );
      }
    });
    
    //**************se uso para SETEAR en PRODUCTS el  status:true segun  CODE *****************************************
    //**************para muchos productos que no tenian el campo status ************************************************
    //*****tambien se usó para cambiar-SETEAR en PRODUCTS el category:"Matemáticas"  segun  CODE *******************
    //******* tambien se usó para cambiar-SETEAR en PRODUCTS el category:"Física" segun  CODE***************************

    this.router.get(`${this.path}/statustrue/:code`, async (req, res) => {
      try {
        const {code}=req.params;
        let result = await productsMongoModel.findOneAndUpdate({code:`${code}`},{category:"Física"})
        // TODO: AGREGAR VALIDACION

        return res.json({
          message: `get productMongo setear  by code con  category: 'Física' succesfully`,
          productsMongo: result,
        });
      } catch (error) {
        console.log(
          "🚀 ~ file: productMongo.routes.js:161 ~ ProductsMongoRoutes ~ this.router.get ~ error:",
          error
        );
      }
    });

  }
}

export default  ProductsMongoRoutes;
