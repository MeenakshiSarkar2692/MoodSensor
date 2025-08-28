const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/moodsense", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const MoodSchema = new mongoose.Schema({
    text: String,
    mood: String,
    message: String,
    createdAt: { type: Date, default: Date.now }
});
const Mood = mongoose.model("Mood", MoodSchema);

// 🔥 Extended mood detection
function detectMood(text) {
    const moodMap = [
        { keywords: ["happy", "joy", "excited", "awesome", "great"], mood: "😊 Happy", message: "Glad to hear you're feeling good! Keep smiling!" },
        { keywords: ["love", "adore", "affection", "crush"], mood: "😍 Love", message: "Love is in the air ❤️" },
        { keywords: ["sad", "down", "depressed", "lonely", "cry"], mood: "😢 Sad", message: "Sorry you're feeling low. Remember, brighter days are ahead 🌈" },
        { keywords: ["angry", "mad", "furious", "hate", "rage"], mood: "😡 Angry", message: "Take a deep breath 😤. It's okay to let the anger out safely." },
        { keywords: ["scared", "afraid", "fear", "nervous"], mood: "😨 Fearful", message: "It's natural to feel fear. You're stronger than you think 💪" },
        { keywords: ["surprised", "shocked", "wow", "unexpected"], mood: "😲 Surprised", message: "Something unexpected caught your attention 👀" },
        { keywords: ["bored", "tired", "lazy", "dull"], mood: "😴 Bored", message: "Maybe it's time to try something fun and new! 🎮🎶" },
        { keywords: ["confused", "unsure", "lost", "uncertain"], mood: "🤔 Confused", message: "It’s okay to be confused. Clarity will come with time 🕰️" },
        { keywords: ["confident", "strong", "brave", "bold"], mood: "😎 Confident", message: "You’ve got this! Keep that energy up 🔥" },
        { keywords: ["frustrated", "stuck", "irritated"], mood: "😤 Frustrated", message: "Step back for a moment. A break might help 🧘" }
    ];

    text = text.toLowerCase();
    for (let entry of moodMap) {
        if (entry.keywords.some(word => text.includes(word))) {
            return { mood: entry.mood, message: entry.message };
        }
    }

    return { mood: "🙂 Neutral", message: "Seems like you're in a calm state ✨" };
}

// POST: detect and save mood
app.post("/api/mood", async (req, res) => {
    try {
        const { text } = req.body;
        const { mood, message } = detectMood(text);

        const moodEntry = new Mood({ text, mood, message });
        await moodEntry.save();

        // ✅ Always return both mood & message
        res.json({ mood, message });
    } catch (err) {
        res.status(500).json({ error: "Failed to process mood" });
    }
});

// GET: fetch last 10 moods (include text, mood, message)
app.get("/api/history", async (req, res) => {
    try {
        const history = await Mood.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .select("text mood message createdAt"); // ✅ explicitly include message

        res.json(history);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch history" });
    }
});

app.delete("/api/history", async (req, res) => {
    try {
      await Mood.deleteMany({});
      console.log("🗑️ Cleared all history");
      res.json({ message: "All history cleared" });
    } catch (err) {
      console.error("Error clearing history:", err);
      res.status(500).json({ error: "Failed to clear history" });
    }
  });


app.listen(5000, () => console.log("🚀 Backend running on http://localhost:5000"));
