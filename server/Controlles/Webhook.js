import { Webhook } from "svix";
import User from "../models/User.models.js";

// API Controller Function to manage clerk user with database
export const clerkWebhook = async (req, res) => {
  try {
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    const evt = await whook.verify(req.body.toString(), {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    });

    const { data, type } = evt;
    console.log("Event Type:", type);

    switch (type) {
      case "user.created": {
        const userData = {
          _id: data.id,
          email: data.email_addresses[0].email_address,
          name: `${data.first_name} ${data.last_name}`,
          imageUrl: data.image_url,
        };
        await User.create(userData);
        console.log(" User Created:", userData);
        res.json({ success: true });
        break;
      }

      case "user.updated": {
        const userData = {
          email: data.email_addresses[0].email_address,
          name: `${data.first_name} ${data.last_name}`,
          imageUrl: data.image_url,
        };
        await User.findByIdAndUpdate(data.id, userData);
        console.log("User Updated:", userData);
        res.json({ success: true });
        break;
      }

      case "user.deleted": {
        await User.findByIdAndDelete(data.id);
        console.log(" User Deleted:", data.id);
        res.json({ success: true });
        break;
      }

      default:
        console.log(" Unhandled event type:", type);
        res.json({ success: true });
        break;
    }
  } catch (error) {
    console.error(" Webhook Error:", error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};
