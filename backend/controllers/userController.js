import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

/**
 * Handles user signup.
 * Validates input, checks for existing account,
 * hashes password, saves user, and returns a token.
 */
export const signup = async (req, res) => {
  const { fullName, email, password, bio } = req.body;

  try {
    // Validate required fields
    if (!fullName || !email || !password || !bio) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the new user
    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      bio,
    });

    // Generate JWT token
    const token = generateToken(newUser._id);

    // Respond with user data (excluding password) and token
    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      userData: {
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        bio: newUser.bio,
        createdAt: newUser.createdAt,
      },
      token,
    });

  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({
      success: false,
      message: "An internal server error occurred.",
    });
  }
};


export const login = async (req,res) =>{

    const {email,password} = req.body;

    try {
        if(!email || !password){
            return res.status(400).json({
                success:false,
                message:"Email and password are required"
            })
        }

        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({
                success:false,
                message:"Invalid email or password"
            })
        }

        const isMatch = await bcrypt.compare(password,user.password);

        if(!isMatch){
            return res.status(401).json({
                success:false,
                message:"Invalid credentials"
            })
        }

        const token = generateToken(user._id)

        res.status(200).json({
            success:true,
            message:"Logged in successfully",
            userData:{
                _id:user._id,
                fullName:user.fullName,
                email:user.email,
                bio:user.bio,
                createdAt:user.createdAt
            },
            token,
        })

    } catch (error) {
        console.error("Login Error:",error)
        res.status(500).json({
            success:false,
            message:"An internal server error occurred."
        })
    }

}

export const updateProfile = async (req, res) => {
  try {
    const { bio, fullName } = req.body;
    const userId = req.user._id;

    let updateData = { bio, fullName };

   if (req.file) {
      const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
      const upload = await cloudinary.uploader.upload(base64Image);
      updateData.profilePic = upload.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      userData: updatedUser,
    });

  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile.",
    });
  }
};