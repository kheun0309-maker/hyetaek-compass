import digest from "../../data/topics/seoraksan.json";
import type { TopicDigest } from "./topic-types";
import { getAllPosts } from "./posts";

export function getSeoraksanDigest(): TopicDigest {
  return digest as TopicDigest;
}

export function getSeoraksanPosts() {
  return getAllPosts().filter((post) => post.category === "travel" && post.tags?.includes("설악산"));
}
