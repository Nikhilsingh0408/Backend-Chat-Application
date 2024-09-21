import { Conversations } from "../models/conversationModel.js";
import { Message } from "../models/messageModel.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

export const sendMessage = async (req, res) => {
    try {
        const senderId = req.id;
        const receiverId = req.params.id;
        const { message } = req.body;

        // Find the conversation between the sender and receiver
        let gotConversations = await Conversations.findOne({
            participants: { $all: [senderId, receiverId] }
        });

        // If no conversation exists, create a new one
        if (!gotConversations) {
            gotConversations = await Conversations.create({
                participants: [senderId, receiverId],
                messages: []  // Initialize the messages array
            });
        }

        // Create a new message
        const newMessage = await Message.create({
            senderId,
            receiverId,
            message
        });

        // If the message was created, add it to the conversation
        if (newMessage) {
            gotConversations.messages.push(newMessage._id); // Assuming 'messages' is the correct field
        }

        await Promise.all([gotConversations.save(), newMessage.save()]);

        // Socket IO
        const receiverSocketId = getReceiverSocketId(receiverId);
        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.status(200).json({
            newMessage,
            success: true
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal Server Error",
            success: false
        });
    }
};

export const getMessage = async (req, res) => {
    try {
        const receiverId = req.params.id;
        const senderId = req.id;

        const conversation = await Conversations.findOne({
            participants: { $all: [senderId, receiverId] }
        }).populate("messages");

        return res.status(200).json(conversation?.messages);

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal Server Error",
            success: false
        });
    }
}