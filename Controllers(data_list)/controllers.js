const jwt = require('jsonwebtoken');
const User =require('../Model(data_list)/UserModel');
const Account =require('../Model(data_list)/signUpModel');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

const fs = require('fs')
const { promisify } = require('util')

const unlinkAsync = promisify(fs.unlink)




exports.postAlldata =(req,res)=>{
    // const bearerHeader = req.headers['authorization']
    // const token = bearerHeader && bearerHeader.split(' ')[1]
    // console.log(req.body.name)
    // console.log(req.body.date)
    // console.log(req.file.path)
    // console.log(req.file.filename)
    // console.log("got accese post data")
    // console.log(token)

    // console.log("post data")

    const url = req.protocol + '://'+ req.get("host");
    const {email} =req.body

    let { name,date} =req.body
    // let {filename,path} =req.file

    console.log("email:"+email)
    console.log("name:"+name)
    console.log("birthday:"+date)
    // console.log("image:"+req.file.filename)
    // console.log("imageName:"+req.file.path)

    // console.log(password)

    //all field check

    // if ( name === null || email === null || date === null  ){
    //     return res.status(500).json("Please fill all field")
    // }
    // console.log("image:"+req.file.filename)
    // console.log("imageName:"+req.file.path)
    // if (req.body === null){
    //     return res.status(500).send("Please fill all field")
    // }


    User.find({email:email})
        .exec((err,user)=>{
            if (user[0]){
                // console.log(user[0])
                //     try {
                        const birthdayArray = user[0].userBirthdays;
    
                        birthdayArray.push({
                            name: req.body.name,
                            birthday: req.body.date,
                            imageName: req.file.path,
                            image: url + "/uploads/" + req.file.filename,
                        })
                        // console.log("valu of new data" + user[0].userBirthdays)
                        user[0].markModified('userBirthdays')
                        user[0].save()
                            .then((r) => {
                                res.status(200).send("Data saving successfully")
                                // console.log(r)
                            })
                            .catch((err) => {
                                res.status(500).send("Data isn't saving")
                            })
                    // }catch (e) {
                    //     res.status(500).json("Please fill all field")
                    // }
                }

                if (!user[0]) {
                    const new_user = new User({
                        email: email,
                        userBirthdays: [{
                            name: req.body.name,
                            birthday: req.body.date,
                            imageName: req.file.path,
                            image: url + "/uploads/" + req.file.filename,
                        }]

                    })
                    new_user.save()
                        .then((r) => {
                            res.status(200).send("you added data saving successfully,wait for the loading your list")
                            console.log(r)

                        })
                        .catch((err) => {
                            res.status(500).send("Data isn't saving")

                        })
                    // }catch (e) {
                    //     res.status(500).json("Please fill all field")
                    // }
                }
        })

}
exports.getAlldata=(req,res)=>{


    // User.find({}).select({_id:0,__v:0,image:0})

    console.log("got access")
    const {email} =req.data.user.email
    // console.log(req.data.user.email)
    try{
        // User.find({email:email})
        User.find({email:req.data.user.email})
            .then((results) => {
                // res.send({results:results[0].userBirthdays})
                // console.log(results[0])

                res.json({results:results[0].userBirthdays})
            })
    }
    catch (e) {
        console.log(e)
    }


}
exports.deleteUserData =(req,res)=>{

    unlinkAsync(req.query.path).then(results=>{
        res.status(200).send()
    }).catch(err=>{
        res.status(500).send()
    })

    const id =req.params.id;
    const email =req.query.user;

    // User.find({email:req.query.user})
    //     .exec((err,user)=> {
    //         if (user[0]) {
    //             const birthdayArray = user[0].userBirthdays;
    //             console.log(birthdayArray.length)
    //
    //             // for (let i = 0; i < birthdayArray.length; i++) {
    //             //     let Id =birthdayArray[i]._id
    //             // }
    //             // console.log(birthdayArray[0])
    //
    //
    //             birthdayArray.findOneAndRemove({_id:id},(err)=>{
    //                 if (err){
    //                     console.log(err);
    //                     return res.status(500).send()
    //                 }
    //                 return res.status(200).send();
    //             })
    //         }
    //     })


    // User.findOneAndRemove({_id:id},(err)=>{
    //     if (err){
    //         console.log(err);
    //         return res.status(500).send()
    //     }
    //     return res.status(200).send();
    // })
    User.findOneAndUpdate(
        { email : `${email}` },
        {$pull : {userBirthdays : {_id:`${id}`}}}
    )
        .then(res=>res.status(200).send())
        .catch(err=>res.status(500).send())

}
exports.getAllDataHome =(req,res)=>{

    const {email} = req.data.user;
    console.log(req.data.user.email)
    User.find(
        {email:`${email}`},
        // data=>{parseInt(data.birthday[5] +data.birthday[6])},
        // {birthday:"2021-05-26"},
        (err, data)=>{
        if (err) {
            console.log(err);
            res.status(500).send('An error occurred', err);
        }
        else {

            const reminderBdList=[];


            data.find(c=>{
                const currentDate = new Date();

                for (let i = 0; i < c.userBirthdays.length; i++) {
                    let birth_date = c.userBirthdays[i].birthday
                    let id = c.userBirthdays[i]._id
                    let name = c.userBirthdays[i].name
                    let image = c.userBirthdays[i].image


                    const birthdayDate = parseInt((birth_date[8] + birth_date[9]));
                    const birthdayMonth = parseInt((birth_date[5] + birth_date[6]))
                    const birthdayYear = parseInt((birth_date[0] + birth_date[1] + birth_date[2] + birth_date[3]))


                    // console.log(currentDate.getFullYear() - birthdayYear)

                    const getYear = currentDate.getFullYear() - birthdayYear;
                    const getDate1 = (birthdayDate - currentDate.getDate()) < 2;
                    const getDate2 = (birthdayDate - currentDate.getDate()) >= 0;
                    const getMonth = (currentDate.getMonth() + 1) === birthdayMonth;

                    if (getMonth && getDate1 && getDate2) {
                        reminderBdList.push({'id': `${id}`, 'name': `${name}`, 'image': `${image}`,'years':`${getYear} years old`});
                        // console.log(c.name+' '+ c.image);

                    }
                }
                // for (let i = 0; i < c.userBirthdays.length; i++) {
                //     let name =c.userBirthdays[i].name
                //     console.log(name)
                //
                // }
                // console.log(c.userBirthdays[0].birthday)

                ///////////////////////////////////////////////////////////////
                // const birthdayDate =parseInt((c.birthday[8]+c.birthday[9]));
                // const birthdayMonth =parseInt((c.birthday[5]+c.birthday[6]))
                //
                // // console.log(birthdayDate+" "+birthdayMonth)
                // // console.log()
                //
                // const getDate1 = (birthdayDate- currentDate.getDate()) < 2 ;
                // const getDate2 = (birthdayDate -currentDate.getDate() ) >= 0;
                // const getMonth = (currentDate.getMonth() + 1) === birthdayMonth ;
                //
                // if (getMonth && getDate1 && getDate2) {
                //     reminderBdList.push( { 'id':`${c._id}`, 'name':`${c.name}`,'image':`${c.image}`});
                //     // console.log(c.name+' '+ c.image);
                //
                // }
                ////////////////////////////////////////////////////////////////////
            });
            return res.send(reminderBdList)
            // return console.log(reminderBdList)
        }
    })
}
exports.createAccount = (req,res)=>{

    let { username,email,password} =req.body

    console.log(username)
    console.log(email)
    console.log(password)

    // console.log(password)

    //all field check

    if ( username === '' || email === '' || password === null){
        return res.status(500).send("Please fill all field")
    }
    //
    const checkUserName = /^[a-z0-9]+$/.exec(username)
    const checkEmail =/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.exec(email)

    //username check

    if ( !username.match(checkUserName)){
        return res.status(500).send("Must use simple characters and numbers for username")
    }

    //email check

    if (!email.match(checkEmail)){
        return res.status(500).send("Email is incorrect format try again !!!")
    }


        // console.log(res.body.password.trim())
        Account.findOne({
            email
        }).exec((err,user)=>{
            // console.log(user)
            if (user){
                return res.status(400).send("Email has already taken")
            }

            const salt = 10;

            bcrypt.hash(password, salt, (err, encrypted) => {

                const newUser = new Account({
                            username:username,
                            email:email,
                            password:encrypted
                        })
                newUser.save()
                            .then((r) => {
                                res.status(200).send("Congratulation ....!,account created successfully")
                                console.log(r)

                            })
                            .catch((err) => {
                                res.status(500).send("Email is already exists")


                            })
            })

        })


}
exports.LoginController =(req,res)=>{
        const {email,password}=req.body

        if (email === '' || password === ''){
            return res.status(500).send("Please fill all field")
        }

        Account.findOne({
            email
        }).exec((err,user)=>{
            // console.log(user)

            if (err|| !user){
                return res.status(400).send("email does not exist,please Sign Up")
            }
            // if (user.password !==password){
            //     return res.status(500).send("your password is incorrect")
            // }
            if (user) {
                const User ={ user:user};
                const accessToken =jwt.sign(User,process.env.JWT_SECRET);

                // return res.json({ accessToken:accessToken})
                bcrypt.compare(password, user.password, function (err, result) {
                    if (result === true) {
                        return res.json({ accessToken:accessToken})
                        // return res.status(200).send(result)
                    } else {
                        return res.status(400).send("Incorrect password !")
                    }
                })
            }


            // const User ={ user:user};
            // const accessToken =jwt.sign(User,process.env.JWT_SECRET);

            // return res.json({ accessToken:accessToken})
            // res.json({ accessToken:accessToken})
        //
        })
}
exports.getPassword =(req,res)=>{

    const{email}=req.body;
    console.log(email)

    if (email == null){
        return res.sendStatus(400).json({error:"email doesnt send,try again !!!!"})
    }
    Account.findOne({
        email
    }).exec((err,user)=>{
        // console.log(user)
        if (err|| !user){
            return res.status(400).json({
                err:"email does not exist,please Sign Up"

            })
        }
        const userPassword =user.password

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'anonymous99kavi99@gmail.com',
                pass: '0769808051'
            }
        });

        const mailOptions = {
            from: 'anonymous99kavi99@gmail.com',
            // to: "kavinda.harsha@gmail.com",
            to: "ganewatthakavishka@gmail.com",
            subject: 'Birthday reminder account password',
            html: `
<!--                    <h1>Your password is:- <span style="color:#00ff0d">${userPassword}</span></h1><br>-->
                    <h2 >Link:-<a style="color:#7d0512" href="http://localhost:3000/updatePassword">click here for change password</h2>
`
        };


        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                return res.status(400).json("email doesnt send,try again !!!!")
            }

            const User ={ user:user};
            const accessToken =jwt.sign(User,process.env.JWT_SECRET);

                // return res.json({ accessToken:accessToken})
                return res.status(200).json({
                    message:"Check your email for change password",
                    accessToken:accessToken

                })

        });

        // const User ={ user:user};
        // const accessToken =jwt.sign(User,process.env.JWT_SECRET);
        //
        // return res.json({ accessToken:accessToken})

    })
}
exports.updatePassword=(req,res)=>{

    let {email ,password} =req.body
        console.log(email)
        console.log(password)
    // if (  email ===''  ){
    //     return res.status(500).send("Please fill all field")
    // }

    if (email === '' || password === ''){
        return res.status(500).send("Please fill all field")
    }

    // Account.findOne({
    //     email
    // }).exec((err,user)=> {
    //     if (user) {
    //         return res.status(400).send("email does not exist,please Sign Up")
    //     }
    // })

    const checkEmail =/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.exec(email)

    if (!email.match(checkEmail)){
        return res.status(500).send("Email is incorrect format try again !!!")
    }

    const filter = {'email': email};


        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'anonymous99kavi99@gmail.com',
                pass: '0769808051'
            }
        });

        const mailOptions = {
            from: 'anonymous99kavi99@gmail.com',
            to: "ganewatthakavishka@gmail.com",
            subject: 'Birthday reminder account password',
            html: `<h1>Your new password is:- <span style="color:#00ff0d">${password}</span></h1><br>`
        }

        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                return res.status(400).send("email doesnt send,try again !!!!")
            } else {
                return res.status(200).send(" new password send to your email")
            }
        });



    const salt = 10;
    bcrypt.hash(password, salt, (err, encrypted) => {

        Account.findOneAndUpdate(filter, {password:encrypted} , {new: true}, function(err, doc) {
            if (err) return res.status(400).send(err);
            return res.status(200).send('Successfully saved.(check your email)');
        })

    })


}
exports.verify=(req,res,next)=>{
    const bearerHeader = req.headers['authorization']
    const token = bearerHeader && bearerHeader.split(' ')[1]

    if(token == null) return  res.sendStatus(401)
    jwt.verify(JSON.parse(token), process.env.JWT_SECRET,(err,data)=>{
        // if(err) return res.sendStatus(403)
        if(err) return console.log(err)

        req.data=data
        next();
    })
}
exports.validationOfImage=(req,res,next)=>{
    if (typeof (req.file) === 'undefined' || typeof (req.body) === 'undefined'){
        return res.status(400).json("problem with sending image")
    }

    next()
}
