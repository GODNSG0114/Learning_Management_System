import { clerkClient } from "@clerk/express";

// Middleware (Protect educator route)
export const protectEducator = async (req , res ,next)=>{
    try {
        
        const userId = req.auth().userId
        const responce = await clerkClient.users.getUser(userId)
        
        if(responce.publicMetadata.role !== 'educator'){
            return res.json({success:false , message: 'unauthotized access'})
        }

        next() ;
    } catch (error) {
         return res.json({success:false , message: `Error: ${error.message}` })
    }
}