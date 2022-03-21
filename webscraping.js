const cheerio = require('cheerio');
const axios = require('axios');


let url = 'https://www.amazon.in/electronics/b/?ie=UTF8&node=976419031&ref_=nav_cs_electronics';
axios.get(url).then(res=>{
    // console.log(res.data);
    let $=cheerio.load(res.data);
    // $(".a-section acs-product-block acs-product-block--default").each(function (id, el) {
    //     console.log($(el).children('span'));
    //    var title = $(el).children('span').text();
    //     console.log(title);
    // })

    // console.log($(".a-truncate-cut").text());

    let test=$("#acs-product-block-0").children("a").children("span").text();
    console.log(test);
    
});
