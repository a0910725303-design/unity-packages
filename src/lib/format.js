import {
  Gamepad2,
  MessagesSquare,
  Mountain,
  PersonStanding,
  Sparkles,
  Wrench,
} from "lucide-react";

const toDate = (value) =>
  new Date(value.includes("T") ? value : value.replace(" ", "T") + "Z");

export const date = (value) =>
  new Intl.DateTimeFormat("zh-TW", {
    timeZone: "Asia/Taipei",
    month: "2-digit",
    day: "2-digit",
  }).format(toDate(value));

export const fullDate = (value) =>
  new Intl.DateTimeFormat("zh-TW", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(toDate(value));

export const categoryIcons = {
  Wrench,
  PersonStanding,
  Mountain,
  Sparkles,
  Gamepad2,
  MessagesSquare,
};

export const tagClass = (type) =>
  ({
    公告: "notice",
    教學: "tutorial",
    心得: "review",
    發問: "question",
    分享: "share",
  })[type] || "discussion";

export const topicTypes = ["討論", "心得", "教學", "發問", "分享"];
