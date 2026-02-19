import clientPromise from "../../lib/mongodb";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
    if (req.method !== "POST")
        return res.status(405).json({ message: "Method not allowed" });

    const { username, password } = req.body;

    const client = await clientPromise;
    const db = client.db("zikanime");

    const existing = await db.collection("users").findOne({ username });
    if (existing)
        return res.status(400).json({ message: "Username sudah ada" });

    const hashed = await bcrypt.hash(password, 10);

    await db.collection("users").insertOne({
        username,
        password: hashed,
        lastWatch: null,
        createdAt: new Date()
    });

    res.status(201).json({ message: "User created" });
}
