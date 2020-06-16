const express = require("express");
const app = express();
const mongoose = require("mongoose");
const http = require("http").Server(app);
const async = require('async');
const Joi = require("joi");
const Jwt = require('jsonwebtoken');
const privateKey = 'fcv42f62-g465-4dc1-ad2c-sa1f27kk1w43';
const ObjectId = require('objectid');
const swaggerUi = require('swagger-ui-express');
const swaggerDocumentUser=require('./swaggerUser.json');
var cors = require('cors');


const userModel=require('./models/users');

const helper=require('./helper');
const mailerHelper=require('./mailer');
const service=require('./services/dbQuery');


app.use(express.static(__dirname));

var bodyParser = require("body-parser")
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))
app.use(cors()) 

app.use('/api-docs-users', swaggerUi.serve, swaggerUi.setup(swaggerDocumentUser));


//routing and controller work here

app.post('/UserRegistration', async (req, res) => {
    try {
        const schema = Joi.object().keys({
            name: Joi.string().required().min(2).max(45),
            email: Joi.string().email().required(),
            password: Joi.string().required().regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^\w\s]).{8,}$/),
            mobileNumber:Joi.string().length(10).regex(/^\d+$/),
        });
        let payload = await helper.verifyJoiSchema(req.body, schema);
        payload.email=payload.email.toLowerCase();

        let checkEmailAlreadyExist = await service.findOne(
            userModel,{ "email": payload.email.toLowerCase()}, { "_id": 1}, { });

        if (checkEmailAlreadyExist) return res.status(400).send({message:"This Email is already registered with us.",code:400});
        
        payload.password = await helper.generateHashPassword(payload.password);

        let subject = 'Welcome To Lynkit';
        let html = `Thank you for choosing Lynkit. Your account has been created.`;
        mailerHelper.sendMail({to:payload.email,subject:subject,html:html},function(err,mailData){});
        
        await service.create(userModel,payload);
        return res.status(200).send({message:'Your account has been added.',code:200});
    }
    catch (err) {
        console.log(err);
        return res.status(400).send({message:err,code:400});
    } 
})

app.post('/login', async (req, res) => {
    try {
        const schema = Joi.object().keys({
            email: Joi.string().email().required(),
            password: Joi.string().required().regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^\w\s]).{8,}$/),
        });
        let payload = await helper.verifyJoiSchema(req.body, schema);
        payload.email=payload.email.toLowerCase();
        let checkEmailAlreadyExist = await service.findOne(
            userModel,{ "email": payload.email }, { "_id": 1,password: 1, email: 1, name: 1}, { });

        if (!checkEmailAlreadyExist) return res.status(400).send({message:"This Email is not registered with us.",code:400});

        let checkPassword = await helper.comparePassword(payload.password, checkEmailAlreadyExist.password);

        if (!checkPassword) return res.status(400).send({message:"Incorrect password.",code:400});

        let tokenData = {
            email: checkEmailAlreadyExist.email,
            _id: checkEmailAlreadyExist._id,
            date: new Date().getTime()
        };

        let token = Jwt.sign(tokenData, privateKey,{expiresIn: '1d'});
        return res.status(200).send({message:'sucessfully login.',code:200,data:{token: token,name: checkEmailAlreadyExist.name,email: checkEmailAlreadyExist.email,_id: checkEmailAlreadyExist._id}});
    }
    catch (err) {
        console.log(err);
        return res.status(400).send({message:err,code:400});
    }
});


//mongoDb connection
mongoose.Promise = global.Promise;
  console.log("connected with - lynkit db");
mongoose.connect('mongodb://localhost:27017/lynkit', () => {
  console.log('you are connected to MongoDb');
});
mongoose.connection.on('error', (err) => {
  console.log('Mongdb connection failed due to error : ', err);
});

var server = http.listen(3000, () => {
    console.log('server is running on port', server.address().port);
});