import { User } from "../models/user"
import { APIError } from "../utils/APIError"
import { asyncHandler } from "../utils/asyncHandler"
import jwt from "jsonwebtoken"

const verifyToken = asyncHandler(async(req, _, next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    
        if(!token) throw new APIError(401, "Unauthorized to make request")
    
        const fetchedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(fetchedToken?._id).select("-password -refreshToken")
    
        if(!user) throw new APIError(401, "Invalid token.")
    
        req.user = user
        next()
    } catch (error) {
        throw new APIError(401, error?.message || "Invalid token")
    }
})

export {verifyToken}