import Notice from "../models/Notice.js";

export const createNotice = async (req, res) => {
  try {
    const { title, body, visibleTo, publishDate, expireDate } = req.body;
    
    if (!title || !body) {
      return res.status(400).json({ message: "Title and body are required" });
    }

    const notice = await Notice.create({ title, body, visibleTo, publishDate, expireDate });
    res.status(201).json(notice);
  } catch (error) {
    console.error("Error creating notice:", error);
    res.status(500).json({ message: "Error creating notice", error: error.message });
  }
};

export const listNotices = async (req, res) => {
  try {
    // optionally filter visibleTo
    const { visibleTo } = req.query;
    const filter = {};
    if (visibleTo) filter.visibleTo = visibleTo;
    const notices = await Notice.find(filter).sort({ publishDate: -1 });
    res.json(notices);
  } catch (error) {
    console.error("Error listing notices:", error);
    res.status(500).json({ message: "Error listing notices", error: error.message });
  }
};

export const getNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) return res.status(404).json({ message: "Notice not found" });
    res.json(notice);
  } catch (error) {
    console.error("Error getting notice:", error);
    res.status(500).json({ message: "Error getting notice", error: error.message });
  }
};

export const deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findByIdAndDelete(req.params.id);
    if (!notice) return res.status(404).json({ message: "Notice not found" });
    res.json({ message: "Notice deleted successfully", deletedNotice: notice });
  } catch (error) {
    console.error("Error deleting notice:", error);
    res.status(500).json({ message: "Error deleting notice", error: error.message });
  }
};
