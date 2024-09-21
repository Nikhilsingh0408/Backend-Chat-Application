import { User } from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookie from "cookie-parser";

export const register = async (req, res) => {
  try {
    const { fullName, username, password, confirmPassword, gender } = req.body;
    if (!fullName || !username || !password || !confirmPassword || !gender) {
      return res.status(400).json({
        message: "All fields are required",
        success: false
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Password do not match Confirm Password",
        success: false
      });
    }

    const user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({
        message: "Username already exists, try a different one",
        success: false
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const maleProfilePhoto = `https://avatar.iran.liara.run/public/boy?username=${username}`;
    const femaleProfilePhoto = `https://avatar.iran.liara.run/public/girl?username=${username}`;

    const newUser = await User.create({
      fullName,
      username,
      password: hashPassword,
      profilePhoto: gender === "male" ? maleProfilePhoto : femaleProfilePhoto,
      gender
    });

    res.status(201).json({
      message: "User created successfully",
      success: true
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
      success: false
    });
  }``
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    //console.log(req.body);
    if (!username) {
      return res.status(400).json({
        message: "Username is required",
        success: false
      });
    }

    if (!password) {
      return res.status(400).json({
        message: "Password is required",
        success: false
      });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({
        message: "Please Register First",
        success: false
      });
    }

    const verifiedPassword = await bcrypt.compare(password, user.password);

    if (!verifiedPassword) {
      return res.status(400).json({
        message: "Incorrect Password",
        success: false
      });
    } else {
      const tokenData = {
        userId: user._id
      };

      const token = await jwt.sign(tokenData, process.env.JWT_SECRET_KEY, { expiresIn: '1d' });

      return res.status(200).cookie("token", token, { maxAge: 1 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'strict' }).json({
        _id: user._id,
        username: user.username,
        fullName: user.fullName,
        profilePhoto: user.profilePhoto
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
      success: false
    });
  }
};

export const logout = (req, res) => {
  try {
    return res.status(200).cookie("token", "", {maxAge: 0}).json({
      message:"Logged Out Successfully",
      success:true
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
      success: false
    });
  }
};

export const getOtherUsers = async(req, res) => {
  try {
    const loggedInUserId = req.id;
    
    const otherUsers = await User.find({_id:{$ne:loggedInUserId}}).select("-password");

    return res.status(200).json({
      otherUsers
    })

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
      success: false
    });
  }
}