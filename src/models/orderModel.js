const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;
const orderSchema = new mongoose.Schema({
  userId: {
    type: ObjectId,
    ref: "userCollection",
    required: true,
  },
  items: [
    {
      productId: {
        type: ObjectId,
        ref: "ProductCollection",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
    },
  ],
  totalPrice: {
    type: Number,
    required: true,
  },
  totalItems: {
    type: Number,
    required: true,
  },
  totalQuantity: {
    type: Number,
    required: true,
    },
    cancellable: {
        type: Boolean,
        default:true
    },
    status: {
        type: String,
        default: 'pending',
        enum: ['pending', 'completed', 'cancelled'],
        trim:true
    },
    deletedAt: {
        type:Date
    },
    isDeleted: {
        type: Boolean,
        default:false
    }
},{timestamps:true});

<<<<<<< HEAD
module.exports = mongoose.model("order", orderSchema)
=======
module.exports = mongoose.model("order", orderSchema);
>>>>>>> 3986a8b5c2282054ed21e1f4aed96d2572b693c8
