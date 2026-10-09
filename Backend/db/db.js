const mongoose=require("mongoose")

async function ConnecttoDB() {
    try{
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Connection Established to DB");
        
    }catch(err){
        console.log("Failed to connect to DB : ",err);
    }
}

module.exports=ConnecttoDB