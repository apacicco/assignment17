const express = require("express");
const app = express();
const Joi = require("joi");
const multer = require("multer");
app.use(express.static("public"));
app.use(express.json());
const cors = require("cors");
app.use(cors());
const mongoose = require("mongoose");

const upload = multer({ dest: __dirname + "/public/images"});


mongoose.connect("mongodb+srv://apacicco:Amp08282003@webapps242db.oexqnxf.mongodb.net/").then(() => console.log("connected to mongodb")).catch((err)=> console.err("could not connect", err));


const jewelSchema = new mongoose.Schema({
    name: String,
    description: String,
    materials: [String],
    img: String
    /*_id: mongoose.SchemaTypes.ObjectId*/
});



const Jewel = mongoose.model("Jewel", jewelSchema);


app.get("/", (req, res)=> {
    res.sendFile(__dirname + "/index.html");
});

const getJewels = async(res)=>{
    const jewels = await Jewel.find();
    res.send(jewels)
};

app.get("/api/jewelry", (req, res)=>{
    //res.send(jewels)
    getJewels(res);
});


/*
let jewels =[{//ADD img: "images/NAME.jpg"
    _id:1,
    name: "Engagement Ring",
    description: "This is something the love of you life will never forget, " +
    "never take for granted, and treasure you forever with",
    //rating:4,
    materials: [
        "gold",
        "diamonds",
        "emeralds"
    ]
},
{
    _id:2,
    name: "Necklace",
    description: "Give that special someone something they'll wear proudly at the envy " +
    "of all their friends",
    //rating:3,
    materials: [
        "silver",
        "diamonds",
        "gold"
    ]  
},
{
    _id:3,
    name: "Bracelet",
    description: "A real closer when it comes to an outfit, and a perfect"  +
    " gift for that special occasion",
    //rating:5,
    materials: [
        "platinum",
        "saphires",
        "diamonds"
    ]   
}];
*/


app.listen(3000, ()=>{
    console.log("listening server.js");
});



const validateThings = (jewel) => {
    const schema = Joi.object({
        _id:Joi.allow(""),//nothing
        materials:Joi.allow(""),
        name:Joi.string().min(1).required(),//needs to be a string at least 3 characters
        description:Joi.string().min(3).required()
    });
    return schema.validate(jewel);
};


app.post("/api/jewelry", upload.single("img"),(req, res) =>{
    console.log("in post");
    const result = validateThings(req.body);
    
    if(result.error)
    {
        res.status(400).send(result.error.details[0].message);
        return;
    }
    
    console.log(req.body);
    /*
    const jewel = {
        _id: jewels.length + 1,
        name: req.body.name,
        description: req.body.description,
        materials:req.body.materials.split(",")
    }
  */

    const jewel = new Jewel({
        name:req.body.name,
        description:req.body.description,
        materials:req.body.materials.split(",")
    });


    if(req.file){
        jewel.img = "images/" + req.file.filename;
    }

    createJewel(jewel, res);
   // jewels.push(jewel);
    
    //res.send(jewel);
});


const createJewel = async(jewel, res) => {
    const result = await jewel.save();
    res.send(jewel);
}

app.put("/api/jewelry/:id", upload.single("img"), (req, res) => {
    console.log("put");
    const id = parseInt(req.params.id);
 
   //const jewel = jewels.find((j)=>j._id === id);



   //console.log("heres jewel: ");
   //console.log(jewel);

   //validate info that comes in

   const result = validateThings(req.body);




   if(result.error){
    res.status(400).send(result.error.details[0].message);
    return;

   };


   updateJewel(req,res);
/*
   jewel.name = req.body.name;
   jewel.description = req.body.description;
   //console.log("materials: " + req.body.materials);
    jewel.materials = req.body.materials.split(",");///THIS IS THE PROBLEM
    console.log("below jewel.materials");

   res.send(jewel);
   */
});


const updateJewel = async(req,res) => {
  

let fieldsToUpdate = {
  name: req.body.name,
  description:req.body.description,
  materials:req.body.materials.split(",")///THIS IS THE PROBLEM
   //console.log("below jewel.materials");
  };

  if(req.file){
    fieldsToUpdate.img = "images/" + req.file.filename;
    console.log("in if");
  }

  const result = await Jewel.updateOne({_id: req.params.id }, fieldsToUpdate);
  const jewel = await Jewel.findById(req.params.id);
  res.send(jewel);
};

app.delete("/api/jewelry/:id", upload.single("img"), (req, res) => {
   removeJewel(res, req.params.id);
});

const removeJewel = async(res, id)=>{
    console.log("id to delete " + id);
    const jewel = await Jewel.findByIdAndDelete(id);
    res.send(jewel);
}