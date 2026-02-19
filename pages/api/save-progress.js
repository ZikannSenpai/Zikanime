import clientPromise from "../../lib/mongodb";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
    if (req.method !== "POST")
        return res.status(405).json({ message: "Method not allowed" });

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const { animeSlug, episodeSlug, time } = req.body;

        const client = await clientPromise;
        const db = client.db("zikanime");

        await db.collection("users").updateOne(
            { _id: new ObjectId(decoded.id) },
            {
                $set: {
                    lastWatch: {
                        animeSlug,
                        episodeSlug,
                        time,
                        updatedAt: new Date()
                    }
                }
            }
        );

        res.status(200).json({ message: "Progress saved" });
    } catch (err) {
        res.status(401).json({ message: "Invalid token" });
    }
}
