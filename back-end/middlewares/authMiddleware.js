const jwt= require("jsonwebtoken");

module.exports = function(req, res, next){
    try {
        const token = req.header("authorization").replace("Bearer", "").trim();

        const decryptedData = jwt.verify(token, process.env.jwt_sceret);
        req.body.userId = decryptedData.userId;
        

        next();
        
    } catch (error) {
        console.log("error ahe bro");
        return res.send({
            success:false,
            message: error.message,
        })
    }
}