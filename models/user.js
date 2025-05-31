const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },

    email: {
        type: String,
    },

    mobile: {
        type: String,
    },

    address: {
        type: String,
        required: true
    },

    cnic: {
        type: Number,
        required: true,
        unique: true
    },

    password: {
        required: true,
        type: String,
        unique: true
    },
    role: {
        type: String,
       enum: ['voter', 'admin'],
       default: 'voter'
    },
    isVoted: {
        type: Boolean,
        default: false
    }
});


userSchema.pre('save',async function(next){//pre works before saving data to database------here it add salt and hash password before saving to database
    const user= this;
    //Hash the password only if it has been modified (or is new)
    if(!user.isModified('password')) return next();//isModified('password')------this checks if password is new or being modified-----so if not modified then skips all the hashing process

try{
//handle password generation
const salt= await bcrypt.genSalt(10);//salt generation.... we can also write "this is salt" but it won't make   //There isno need to store salt any where beacuse hashedpassword contains hash(code) for password and salt

//hash password 
const hashedPassword = await bcrypt.hash(user.password, salt);//hash both salt and password giveb by user

//Override the plain password with the hashed one
user.password= hashedPassword; //change password to hashed password, made by bcrypt......... Ensures that new version would be saved in database
    next();
}
catch(err){
   return next(err);
}
})


userSchema.methods.comparePassword = async function(candidatePassword){ //use to compare plain text password enterd by user with hashed password 
    try{
//use bcrypt to compare the provided password with the hashed password
const isMatch= await bcrypt.compare(candidatePassword, this.password);
return isMatch;  //true if match and false if not........
    } 
    catch(err){
        throw err
    }
}





const user = mongoose.model('user', userSchema);
module.exports = user;