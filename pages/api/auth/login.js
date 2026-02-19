import clientPromise from "../../../lib/mongodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
    if (req.method !== "POST")
        return res.status(405).json({ message: "Method not allowed" });

    const { username, password } = req.body;

    const client = await clientPromise;
    const db = client.db("zikanime");

    const user = await db.collection("users").findOne({ username });
    if (!user) return res.status(401).json({ message: "User tidak ditemukan" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Password salah" });

    const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

    res.status(200).json({ token });
}
