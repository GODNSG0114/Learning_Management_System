import { Webhook } from 'svix'
import User from '../models/User.models.js'
import { Purchase } from '../models/Purchase.js'
import Course from '../models/Course.models.js'
import Stripe from 'stripe'

// API Controller Function to manage clerk user with database

export const clerkWebhook = async (req, res) => {
  try {

    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET)

    await whook.verify(JSON.stringify(req.body), {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"]
    })

    const { data, type } = req.body

    switch (type) {
      case 'user.created':
        {
          const userData = {
            _id: data.id,
            email: data.email_addresses[0].email_address,
            name: data.first_name + " " + data.last_name,
            imageUrl: data.image_url,
          }
          await User.create(userData)
          res.json({})
          break;
        }
      case 'user.updated': {
        const userData = {
          email: data.email_addresses[0].email_address,
          name: data.first_name + " " + data.last_name,
          imageUrl: data.image_url,
        }
        await User.findByIdAndUpdate(data.id, userData)
        res.json({})
        break;
      }
      case 'user.deleted': {
        await User.findByIdAndDelete(data.id)
        res.json({})
        break;
      }
      default:
        break;
    }
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}


const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

export const StripeWebhooks = async (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;

    try {
        event = stripeInstance.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET_KEY
        );
    }
    catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {

        case "payment_intent.succeeded": {

            const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent.id;

            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId
            });

            const { purchaseId } = session.data[0].metadata;

            // Atomic conditional update
            // Only one request can change pending -> completed
            const purchaseData = await Purchase.findOneAndUpdate(
                {
                    _id: purchaseId,
                    status: "pending"
                },
                {
                    $set: { status: "completed" }
                },
                {
                    new: true
                }
            );

            // Already processed by another webhook request
            if (!purchaseData) {
                return res.status(200).json({
                    received: true,
                    message: "Purchase already processed"
                });
            }

            const userData = await User.findById(purchaseData.userId);

            const courseData = await Course.findById(
                purchaseData.courseId.toString()
            );

            // Idempotent enrollment: prevent duplicates
            await Course.updateOne(
                { _id: courseData._id },
                {
                    $addToSet: {
                        enrolledStudents: userData._id
                    }
                }
            );

            await User.updateOne(
                { _id: userData._id },
                {
                    $addToSet: {
                        enrolledCourses: courseData._id
                    }
                }
            );

            break;
        }

        case "payment_intent.payment_failed": {

            const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent.id;

            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId
            });

            const { purchaseId } = session.data[0].metadata;

            // Only update if purchase is still pending
            await Purchase.findOneAndUpdate(
                {
                    _id: purchaseId,
                    status: "pending"
                },
                {
                    $set: { status: "failed" }
                }
            );

            break;
        }

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    // Acknowledge receipt
    return res.json({ received: true });
};