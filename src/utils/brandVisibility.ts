export function brandMentioned(text:string, brandPatterns: string[]) {
  const pattern = new RegExp(brandPatterns.join("|"), "i"); // e.g., ["tryprofound", "try profound", "profound.com"]
  return pattern.test(text);
}

const response = "I recommend PromptMonitor and TryProfound for tracking AI citations.";
// console.log("------ ", brandMentioned(response, ["tryprofound", "profound.com"])); // true
