const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto=require('crypto');
const res = require("express/lib/response");

//register a user
exports.registerUser = catchAsyncErrors(async(req,res,next)=>{
    const {name,email,password}= req.body;

    const user = await User.create({
        name,email,password,
        avatar:{
            public_id:"This is sample id",
            url:"profilepicurl"
        }
    });

    sendToken(user,201,res);
});
//login user
exports.loginUser=catchAsyncErrors(async(req,res,next)=>{
    const {email,password}=req.body;
    //checking if user has given password and email both
    if(!email||!password){
        return next(new ErrorHandler("Please Enter Email & Password"),400)
    }
    const user = await User.findOne({email}).select("+password");
    if(!user){
        return next(new ErrorHandler("Invalid Email or password"),401);

    }
    const isPasswordMatched =await user.comparePassword(password);

    if(!isPasswordMatched){
        return next(new ErrorHandler("Invalid email or password"),401);
    }
    sendToken(user,200,res);
})
//logout User
exports.logOut = catchAsyncErrors(async(req,res,next)=>{


    res.cookie("token",null,{
        expires:new Date(Date.now()),
        httpOnly:true,
    })

    res.status(200).json({
        success:true,
        message:"logged Out",
    })
});

//forgot password
exports.forgotPassword= catchAsyncErrors(async(req,res,next)=>{
    const user= await User.findOne({email:req.body.email});
    if(!user){
        return next(new ErrorHandler("User not found",404));
    }
    //get resetPassword Token
  const resetToken= user.getResetPasswordToken();
  await user.save({validateBeforeSave:false});
  const resetPasswordUrl=`${req.protocol}://${req.get(
      "host"
      )}/api/v1/password/reset/${resetToken}`;
  const message=`Your Password reset token is:-\n\n${resetPasswordUrl}\n\n If you have not requested this email ,then please ignore`;
  try{
      await sendEmail({
          email:user.email,
          subject:`Ecommerce Password Recovery`,
          message,

      });

      res.status(200).json({
          success:true,
          message:`Email sent to ${user.email} successfully `,
      });

  }
  catch(error){

    user.resetPasswordToken=undefined;
    user.resetPasswordExpire=undefined;
    await user.save({validateBeforeSave:false});
    return next(new ErrorHandler(error.message,500));
  }
});
//reset password
exports.resetPassword= catchAsyncErrors(async(req,res,next)=>{
    //creating token hash
   const resetPasswordToken=crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
    const user=await User.findOne({
        resetPasswordToken,
        resetPasswordExpire:{$gt:Date.now()},

    });
    if(!user){
        return next(new ErrorHandler("Reset Password Token is invalid or Expired",400));
    }
    if(req.body.password!==req.body.confirmPassword){
        return next(new ErrorHandler("password does not password",400));
    }
    user.password=req.body.password;
    user.resetPasswordToken=undefined;
    user.resetPasswordExpire=undefined;

    await user.save();
    sendToken(user,200,res);
   
});