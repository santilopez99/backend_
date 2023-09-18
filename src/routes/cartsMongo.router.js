import { Router } from "express";
import cartsMongoModel  from "../dao/models/cartsMongo.models.js";
import productMongoModel from "../dao/models/productsMongo.models.js";
import CartMongoManager from "../dao/managers/cartMongo.manager.js";
import { Schema, model, Types } from "mongoose";
const { ObjectId } = Types;



class CartsMongoRoutes {
  path = "/carts";
  router = Router();
  cartMongoManager = new CartMongoManager();

  constructor() {
    this.initCartsMongoRoutes();
  }

  initCartsMongoRoutes() {
    //*************************************************************************************
    //*************************************************************************************
    //******* Crear un carrito nuevo con un array vacío de products ***********************
    //******  POST DE /api/v1/cartsmongo **************************************************
    //*************************************************************************************
    //*************************************************************************************
    this.router.post(`${this.path}`, async (req, res) => {
      try {    
        const cartMongo = {"products": []};
        // TODO REVISANDO SI EL CARRITO YA FUE CREADO ANTERIOMENTE
        const newCartMongo = await this.cartMongoManager.createCartMongo(cartMongo);
        if (!newCartMongo) {
          return res.json({
            message: `the cartMongo not created`,
          });
        }//se cambio por throw,
        return res.status(201).json({
          message: `cart created successfully in Mongo Atlas`,
          cart: newCartMongo,
        });
      } catch (error) {
        console.log(
          "🚀 ~ file: cartsMongo.router.js:32 ~ CartsMongoRoutes ~ this.router.post ~ error:",
          error
        );
        //recibe tambiem el catch de createProductMongo
         return res.status(400).json({
            message: error.message ?? error            
          });
        }
    });

    //*************************************************************************************
    //*************************************************************************************
    //********** Obtener un carrito con Id de carrito *************************************
    //******  GET DE /api/v1/cartsmongo/:cid **************************************
    //*************************************************************************************
    //*************************************************************************************
    this.router.get(`${this.path}/:cid`, async (req, res) => {
      try {
        // TODO: HACER VALIDACIONES *
        const cid=req.params.cid;
        let cartMongoData = await this.cartMongoManager.getCartMongoByIdPopulate(cid);//population        
        // TODO REVISANDO SI EL CARRITO YA FUE CREADO ANTERIOMENTE        
        if (!cartMongoData) {
          return res.json({
            message: `the cart by Id in Mongo Atlas not found`,
          });
        }//se cambio por throw,
        return res.status(201).json({
          message: `cart found successfully in Mongo Atlas (with population)`,
          cart: cartMongoData,
        });
      } catch (error) {
        console.log(
          "🚀 ~ file: cartsMongo.routes.js:48 ~ CartsMongoRoutes ~ this.router.get ~ error:",
          error
        );
        //recibe tambiem el catch de getCartById ProductMongo
         return res.status(400).json({
            message: error.message ?? error            
          });
        }
    });

    //*************************************************************************************
    //*************************************************************************************
    //*********** Agregar un Id de  producto a un carrito por medio de Id *****************
    //******  POST DE /api/v1/cartsmongo/:cid/productMongo/:produtMongoId *************
    //*************************************************************************************
    //*************************************************************************************
    this.router.post(`${this.path}/:cid/products/:pid`, async (req, res) => {
      // return res.json({ message: `cartsMongo POST no implementado aun` });
      try {
        // TODO: HACER VALIDACIONES 
        const cid=req.params.cid;
        const pid=req.params.pid;
        let cartMongoData = {};

        cartMongoData = await this.cartMongoManager.getCartMongoById(cid);
        
        // TODO REVISANDO SI EL CARRITO YA FUE CREADO ANTERIOMENTE
        
        if (!cartMongoData) {// 1. si no existe carrito no se hace nada
          return res.json({
            message: `the cart by Id in Mongo Atlas not found`,
          });
        }//se cambio por throw,

        //***** 2. si producto es el Id="000000000000000000000000" reemplazarlo */
        //if(cartMongoData.products[0].product==new ObjectId("000000000000000000000000").toString()){
        if(cartMongoData.products==[]){           
            const productNewId= new ObjectId(pid);
            console.log("entro en 2");
            cartsMongoModel.findByIdAndUpdate(cid, { products: [{product: productNewId, quantity: 1}] }, { new: true })
            .then(updatedCart => {//lo que devuelve lo muestro en consola
              console.log(updatedCart);
            })
            .catch(error => {
              console.error("error Efren1",error);
            });
        } else {// fin if 2, else al if 2... Situacion 3. si el carrito existe, tiene Id distinto de "000000000000000000000000" verificar si ya tiene el producto
            console.log("verificando antes de entrar a 3 o 4")
            const idComp = new ObjectId(pid);
            var existeProduct = false;
            var indexOfProducts= 0;
            cartMongoData.products.forEach((element,i) => {       
              console.log(element.product.toString());
              console.log(pid);  

              if(element.product.toString() === pid){//este if solo funciono con toString() en ambos
                console.log("entro al ifffffff");
                existeProduct= true;
                indexOfProducts=i;              
              }              
            }); 
            console.log(existeProduct);           
            if(existeProduct){//if 3 situacion 3
                  cartMongoData.products[indexOfProducts].quantity++;
                  console.log("entrooooo en 3");
                  cartsMongoModel.findByIdAndUpdate(cid, {products: cartMongoData.products }, { new: true })
                  .then(updatedCart => {
                  console.log("Carrito actualizado");
                  console.log(updatedCart);
                  })
                  .catch(error => {
                  console.error("error Efren3",error);
                  });
            } else {//else a if 3,  situacion 4 . si el carrrito existe y no tiene el producto 
                  console.log("entrooooo en 4")
                  const productNewId= new ObjectId(pid);
                  cartMongoData.products.push({ product:productNewId, quantity: 1 }); 
                  cartsMongoModel.findByIdAndUpdate(cid, {products: cartMongoData.products }, { new: true })
                  .then(updatedCart => {
                  console.log(updatedCart);
                  })
                  .catch(error => {
                  console.error("error Efren4",error);
                  });             
            }// fin else de situacion 4
        }//fin else del if 2, situacion 3
        return res.status(201).json({
          //agregar 
          message: `cart found successfully and update in Mongo Atlas`        
        });
      } catch (error) {
        console.log(
          "🚀 ~ file: cartsMongo.routes.js:140 ~ CartsMongoRoutes ~ this.router.get ~ error:",
          error
        );
        //recibe tambiem el catch de getCartById ProductMongo
         return res.status(400).json({
            message: error.message ?? error            
          });
        }
    });

    //*************************************************************************************
    //*************************************************************************************
    // Eliminar un Id de  producto de un carrito por medio de Id de carrito  **************
    //******  PUT DE /api/v1/cartsmongo/:cid/productMongo/:produtMongoId   ************
    //*************************************************************************************
    //*************************************************************************************
    this.router.delete(`${this.path}/:cid/products/:pid`, async (req, res) => {
      try{
        const { cid, pid } = req.params;
        const cart = await cartsMongoModel.findById({_id: cid});
        const index =  cart.products.findIndex(item => item.product === pid);
        if(index){
          const cartAux = cart;
          cartAux.products.splice(index,1);    
          await cartsMongoModel.updateOne({_id:cid}, cartAux);
          const cartUpdate = await cartsMongoModel.findById({_id: cid});     
          return res.json({message: `se eliminó producto en este carrito`, cartUpdate: cartUpdate })
        }else{
          return res.json({message: `no existe el producto en este carrito`})
        }
      } catch (error) {
        console.log(
          "🚀 ~ file: cartsMongo.router.js:178 ~ CartsMongoRoutes ~ this.router.delete ~ error:",
          error
        );
      }
      
    });

    //*************************************************************************************
    //*************************************************************************************
    //****** VACIAR el array de products de un carrito por medio de Id CARRITO ************
    //******  DELETE DE /api/v1/cartsmongo/:cid **********************************
    //*************************************************************************************
    //*************************************************************************************
    this.router.delete(`${this.path}/:cid`, async (req, res) => {
      try{
        const { cid} = req.params;
        let result = await cartsMongoModel.findOneAndUpdate({_id:`${cid}`},{products:[]});
        return res.json({ 
          message: `cartsMongo DELETE all products sucessfully`, 
          result:result });
        
      } catch (error) {
        console.log(
          "🚀 ~ file: cartsMongo.router.js:219 ~ CartsMongoRoutes ~ this.router.delete ~ error:",
          error
        );
      }
      
    });

    //*************************************************************************************
    //*************************************************************************************
    //******  Actualizar el array de products por medio de Id de carrito ******************
    //******  PUT DE /api/v1/cartsmongo/:cid  ************************************
    //*************************************************************************************
    //*************************************************************************************
    this.router.put(`${this.path}/:cid`, async (req, res) => {
      try{
        const { cid} = req.params;
        const arrayItemsProducts= req.body.products;
        let result = await cartsMongoModel.findOneAndUpdate({_id:`${cid}`},{products:arrayItemsProducts}, { new: true });
        return res.json({ 
          message: `cartsMongo update array of products with PUT sucessfully`, 
          result:result });


      } catch (error) {
        console.log(
          "🚀 ~ file: cartsMongo.router.js:246 ~ CartsMongoRoutes ~ this.router.put ~ error:",
          error
        );
      }
    });

    //*************************************************************************************
    //*************************************************************************************
    //******  Actualizar  SÓLO la cantidad de ejemplares  del producto ********************
    //******* por cualquier cantidad pasada desde req.body.     ***************************
    //******  PUT DE /api/v1/cartsmongo/:cid/productMongo/:produtMongoId **********************************
    //*************************************************************************************
    //*************************************************************************************
    this.router.put(`${this.path}/:cid/products/:pid`, async (req, res) => {
      try{
        let result = await cartsMongoModel.findOneAndUpdate(
          { _id: req.params.cid, "products.product": req.params.pid },
          { $set: { "products.$.quantity": req.body.quantity } },
          { new: true });        
      return res.json({ 
        message: `cartsMongo PUT set quantity in product pid of cart cid`,
        result:result });
      } catch (error) {
        console.log(
          "🚀 ~ file: cartsMongo.router.js:271 ~ CartsMongoRoutes ~ this.router.put ~ error:",
          error
        );
      }
    });
  }
}

export default CartsMongoRoutes;
