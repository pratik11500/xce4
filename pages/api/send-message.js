// pages/api/send-message.js
import clientPromise from "@/lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { email, message } = req.body;

  if (!email || !message) {
    return res.status(400).json({ message: "Email and message are required" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("test");
    const collection = db.collection("messages");

    const result = await collection.insertOne({
      email,
      message,
      timestamp: new Date(),
    });

    res.status(201).json({ message: "Message sent successfully", result });
  } catch (error) {
    console.error("Error inserting message:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
