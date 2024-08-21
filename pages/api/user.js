import clientPromise from "@/lib/mongodb";
import Cors from 'cors';

// Initializing the cors middleware
const cors = Cors({
  methods: ['GET', 'HEAD'],
});

function initMiddleware(middleware) {
  return (req, res) =>
    new Promise((resolve, reject) => {
      middleware(req, res, (result) => {
        if (result instanceof Error) {
          return reject(result);
        }
        return resolve(result);
      });
    });
}

const corsMiddleware = initMiddleware(cors);

export default async function handler(req, res) {
  await corsMiddleware(req, res); // Run the cors middleware

  const { method, query } = req;
  const client = await clientPromise;
  const db = client.db();

  try {
    if (method === "GET") {
      const { email } = query;

      if (!email) {
        res.status(400).json({ message: "Email parameter is required" });
        return;
      }

      const user = await db.collection("users").findOne({ email });
      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } else {
      res.status(405).json({ message: "Method Not Allowed" });
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
