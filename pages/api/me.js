import clientPromise from "../../lib/mongodb";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const client = await clientPromise;
        const db = client.db("zikanime");

        const user = await db.collection("users").findOne({
            _id: new ObjectId(decoded.id)
        });

        res.status(200).json({
            username: user.username,
            lastWatch: user.lastWatch
        });
    } catch {
        res.status(401).json({ message: "Invalid token" });
    }
}
