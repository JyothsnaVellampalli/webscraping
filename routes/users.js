var express = require('express');
var router = express.Router();
const {MongoClient,dburl,mongodb} = require('../dbSchema');
const cheerio = require('cheerio');
const axios = require('axios');
var pretty = require('pretty');
let url = "https://www.flipkart.com/search?q=mobiles&as=on&as-show=on&otracker=AS_Query_TrendingAutoSuggest_1_0_na_na_na&otracker1=AS_Query_TrendingAutoSuggest_1_0_na_na_na&as-pos=1&as-type=TRENDING&suggestionId=mobiles&requestId=402f1a1f-b69d-494c-9829-cbbe4dd04aa7";
let array=[];

axios.get(url).then(res=>{
    //   console.log(res.data);
    let $ = cheerio.load(res.data);
    $('._4rR01T').each((id,ele)=>{
        let obj={}
        title = $(ele).text();
        // console.log(title,id)
        if(id<=10){
        obj.id=`Mobile${id}`;
        obj.title=title;
        obj.producttype="Mobile"
        array.push(obj);
        }
    })
    
    $('._25b18c').each((id,ele)=>{
        price = $(ele).children('div').first().text();
        price = price.substring(1, price.length);
        MRP = $(ele).children('._27UcVY').text();
        MRP = MRP.substring(1,MRP.length);

        if(array[id]){
        (array[id])['OfferPrice'] = price && MRP ? price : '6,999';
        (array[id])['MRP']= MRP && price ? MRP : '7,999';
        }
        
    })
    $(".CXW8mj").each((id,ele)=>{
        image = $(ele).children('img').attr('src');
        // console.log({image,id});
        if(array[id]){
            (array[id])['image'] = image;  
        }
    })
    $("._3LWZlK").each((id,ele)=>{
        rating = $(ele).text();
        if(array[id]){
            (array[id])['rating'] = rating;  
        }
    })
    
    //   console.log(array);
});


let watches=[];
let snapdealurl="https://www.snapdeal.com/search?keyword=watches&santizedKeyword=electronics&catId=0&categoryId=0&suggested=true&vertical=p&noOfResults=20&searchState=&clickSrc=suggested&lastKeyword=&prodCatId=&changeBackToAll=false&foundInAll=false&categoryIdSearched=&cityPageUrl=&categoryUrl=&url=&utmContent=&dealDetail=&sort=rlvncy";
axios.get(snapdealurl).then(res=>{
    
    let $=cheerio.load(res.data);

    $('.picture-elem').each((id,elem)=>{
        let obj={};
        image=$(elem).children('source').attr('srcset');
        // console.log(image,id)
        if(id<=10){
        obj.id=`Watch${id}`;
        obj.image=image;
        obj.producttype="Watch"
        watches.push(obj);
        }
    })
    $('.product-title ').each((id,elem)=>{
        title=$(elem).text();
        // console.log(title,id);
        if(watches[id]){
            (watches[id])['title'] = title} 

    })
    $('.marR10').each((id,elem)=>{
        // console.log($(elem).text());
        // console.log(id);
        OfferPrice=$(elem).children('span').last().attr('display-price');
        price = $(elem).children('span').first().text();
        
        // console.log(OfferPrice,MRP,id);
        if(watches[id]){
            (watches[id])['OfferPrice'] = OfferPrice && MRP[1] ? OfferPrice : '1,099';
            mrp=[price];
            // console.log(mrp);
             MRP=mrp[0].split(" ");
            //  console.log(MRP);
             (watches[id])['MRP'] = OfferPrice && MRP[1] ? MRP[1] : '1,999'}
        
    })

    
    // console.log(watches);
})

//Add Item
router.post('/additem',async (req,res)=>{
    const client = await MongoClient.connect(dburl);
    const db = await client.db("users");
    let refresh = await db.collection('webscraping').deleteMany();
    // console.log("deleted");
    try{
        array.map((item,i)=>{
            // console.log(item);
            let document = db.collection('webscraping').insertOne(item);
            // console.log(document);
        })
        // console.log(watches);
        watches.map((watch,i)=>{
            let document = db.collection('webscraping').insertOne(watch);
            // console.log(document);
        })
    
    res.json({
        statuscode: 200,
        message : 'items added'
    })
    }catch(err){
        res.json({
            statuscode : 400,
            message : "Internal server Error"
        })
    }

})

//get items 
router.get('/getitems',async (req, res)=>{
    const client = await MongoClient.connect(dburl);
    const db = await client.db("users");
    const list = await db.collection("webscraping").find().toArray();
    res.json({
        statuscode : 200,
        items : list
    })

})

//Modify Item
router.put('/modifyitem',async (req,res)=>{
    const client = await MongoClient.connect(dburl);
    const db = await client.db('users');
    try{
    const document = await db.collection('webscraping').find({id : req.body.id})
    if(document){
        let update = await db.collection('webscraping').updateOne({id: req.body.id},{$set:{id: req.body.id,title:req.body.title,description:req.body.description,OfferPrice:req.body.OfferPrice,image:req.body.image,MRP:req.body.MRP,rating:req.body.rating}});
        res.json({
            statuscode : 200,
            message : "Item updated successfully",
            update : update
        })
    }
    else{
        res.json({
            statuscode : 404,
            message : "Item does not exist" 
        })
    }
    }catch(error){
        res.json({
            statuscode : 400,
            message : "Internal Server Error"
        })
    }
})

//Delete Item
router.delete('/deleteitem',async (req, res) => {
    const client = await MongoClient.connect(dburl);
    const db = await client.db("users");
    try{
        const document = await db.collection('webscraping').find({id:req.body.id})
        if(document){
        let deleteitem = await db.collection('webscraping').delete({id:req.body.id});
        res.json({
            statuscode : 200,
            message : "Item deleted successfully",
            deleteitem : deleteitem
        })
        }
        else{
            res.json({
                statuscode : 404,
                message : "Item not found",
            })
        }
    }catch(err){
        res.json({
            statuscode : 400,
            message : "Internal Server Error"
        })
    }
})

//add to cart
router.post('/addtocart',async (req, res) => {
    const client = await MongoClient.connect(dburl);
    const db = await client.db("users");
    const item = await db.collection('webscraping').findOne({id:req.body.id});
    let priceArr;
    priceArr= item.OfferPrice.split(',');
    let price = priceArr.join('');
    const totPrice = Number(price)*Number(req.body.quantity);
    // console.log(item);
    if(item){
    const cart = await db.collection('Cart').insertOne({id: item.id,title:item.title,description:item.description,OfferPrice:item.OfferPrice,image:item.image,MRP:item.MRP,rating:item.rating,quantity: req.body.quantity,totPrice,producttype:item.producttype});
    res.json({
        statuscode : 200,
        data : cart
    })
    }
})

router.put('/updatequantity',async (req, res)=>{
    const client = await MongoClient.connect(dburl);
    const db = await client.db("users");
    const item = await db.collection('Cart').findOne({id:req.body.id});
     let priceArr= item.OfferPrice.split(',');
    let price = priceArr.join('');
    const totPrice = Number(price)*Number(req.body.quantity);
    if(item){
        const cart = await db.collection('Cart').updateOne({id:req.body.id},{$set:{id: item.id,title:item.title,description:item.description,OfferPrice:item.OfferPrice,image:item.image,MRP:item.MRP,rating:item.rating,quantity: req.body.quantity,totPrice,producttype:item.producttype}})
        res.json({
            statuscode : 200,
            data : cart
        })
    }


})

//get cart items
router.get('/getcartitems', async (req, res) => {
    const client = await MongoClient.connect(dburl);
    const db = await client.db("users");
    const cart = await db.collection('Cart').find().toArray();
    let total = 0;
    cart.forEach((item) => { 
        console.log(item, 'cart');
        let priceArr = item.OfferPrice.split(',');
        price = Number(priceArr.join('')) * item.quantity;
        total = total + price})
    res.json({
        statuscode : 200,
        cartitems : cart,
        totalPrice: total,
    })
})

//delete from cart
router.delete('/deletefromcart/:id', async (req, res) => {
    const client = await MongoClient.connect(dburl);
    const db = await client.db("users");
    const item = await db.collection('Cart').findOne({id:req.params.id});
    if(item){
    const cart = await db.collection('Cart').deleteOne(item);
    res.json({
        statuscode : 200,
        message : "Item deleted from cart"
    })
    }
})

router.post('/orderdetails',async (req, res) => {
    const client = await MongoClient.connect(dburl);
    const db = await client.db("users");
    const order = await db.collection('Orders').insertOne(req.body);
    res.json({
        statuscode : 200,
        message : "order placed successfully"
    })
})

router.delete('/refreshcart', async (req, res)=>{
    const client = await MongoClient.connect(dburl);
    const db = await client.db("users");
    const refresh = await db.collection("Cart").deleteMany();
    res.json({
        statuscode : 200,
    })
})
module.exports = router;
